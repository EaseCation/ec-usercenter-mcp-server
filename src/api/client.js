import { UserCenterAPIError } from "../utils/errors.js";

function appendQuery(searchParams, key, value) {
  if (value === undefined || value === null) {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      appendQuery(searchParams, key, item);
    }
    return;
  }

  if (typeof value === "boolean") {
    searchParams.append(key, value ? "true" : "false");
    return;
  }

  searchParams.append(key, String(value));
}

function parseBody(text, contentType) {
  if (!text) {
    return null;
  }

  if (contentType.includes("application/json")) {
    return JSON.parse(text);
  }

  const trimmed = text.trim();
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return text;
    }
  }

  return text;
}

function getStatusCode(data, response) {
  const candidate = data?.EPF_code ?? data?.EPF ?? response.status;
  const parsed = Number(candidate);
  return Number.isFinite(parsed) ? parsed : response.status;
}

function getErrorMessage(data, response) {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data?.EPF_description) {
    return data.EPF_description;
  }

  if (data?.message) {
    return data.message;
  }

  return `请求失败，HTTP ${response.status}`;
}

export class UserCenterAPIClient {
  constructor({ mode, baseUrl, token, refreshToken, timeoutMs, fetchImpl = globalThis.fetch }) {
    this.mode = mode;
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.token = token;
    this.refreshToken = refreshToken;
    this.timeoutMs = timeoutMs;
    this.fetchImpl = fetchImpl;
    this.refreshPromise = null;
  }

  async request(method, endpoint, options = {}, state = {}) {
    const { query = {}, body, headers = {} } = options;
    const { hasRetriedAfterRefresh = false } = state;

    if (!this.token && this.refreshToken && !hasRetriedAfterRefresh) {
      await this.refreshAccessToken();
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);

    for (const [key, value] of Object.entries(query)) {
      appendQuery(url.searchParams, key, value);
    }

    const requestHeaders = {
      Accept: "application/json, text/plain;q=0.9, */*;q=0.8",
      ...headers,
    };

    if (this.token) {
      requestHeaders.Authorization = `Bearer ${this.token}`;
    }

    const fetchOptions = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(this.timeoutMs),
    };

    if (body !== undefined) {
      fetchOptions.body = JSON.stringify(body);
      fetchOptions.headers["Content-Type"] = "application/json";
    }

    try {
      const response = await this.fetchImpl(url, fetchOptions);
      const text = await response.text();
      const data = parseBody(text, response.headers.get("content-type") ?? "");
      const statusCode = getStatusCode(data, response);

      if (this.shouldRefreshAuth(response, statusCode, endpoint, hasRetriedAfterRefresh)) {
        await this.refreshAccessToken();
        return this.request(method, endpoint, options, { hasRetriedAfterRefresh: true });
      }

      if (!response.ok || (statusCode !== 200 && statusCode !== 204)) {
        throw new UserCenterAPIError(getErrorMessage(data, response), {
          status: response.status,
          code: statusCode,
          endpoint,
          mode: this.mode,
          responseData: data,
        });
      }

      return data;
    } catch (error) {
      if (error instanceof UserCenterAPIError) {
        throw error;
      }

      const message =
        error?.name === "TimeoutError"
          ? "请求超时"
          : error?.name === "AbortError"
            ? "请求已被取消"
            : `网络请求失败: ${error instanceof Error ? error.message : String(error)}`;

      throw new UserCenterAPIError(message, {
        status: 500,
        endpoint,
        mode: this.mode,
        originalError: error,
      });
    }
  }

  get(endpoint, query) {
    return this.request("GET", endpoint, { query });
  }

  post(endpoint, body, query) {
    return this.request("POST", endpoint, { body, query });
  }

  shouldRefreshAuth(response, statusCode, endpoint, hasRetriedAfterRefresh) {
    if (!this.refreshToken || hasRetriedAfterRefresh || endpoint === "/user/refresh") {
      return false;
    }

    return response.status === 401 || (response.status === 403 && statusCode === 8003);
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new UserCenterAPIError("缺少 refresh token，无法自动续期", {
        status: 401,
        endpoint: "/user/refresh",
        mode: this.mode,
      });
    }

    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh();

    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  async performRefresh() {
    try {
      const response = await this.fetchImpl(new URL(`${this.baseUrl}/user/refresh`), {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain;q=0.9, */*;q=0.8",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      const text = await response.text();
      const data = parseBody(text, response.headers.get("content-type") ?? "");
      const statusCode = getStatusCode(data, response);

      if (!response.ok || (statusCode !== 200 && statusCode !== 204)) {
        throw new UserCenterAPIError(getErrorMessage(data, response), {
          status: response.status,
          code: statusCode,
          endpoint: "/user/refresh",
          mode: this.mode,
          responseData: data,
        });
      }

      const nextToken = data?.token ?? data?.data?.token;
      if (typeof nextToken !== "string" || !nextToken.trim()) {
        throw new UserCenterAPIError("刷新 token 成功，但响应里没有新的 access token", {
          status: response.status,
          code: statusCode,
          endpoint: "/user/refresh",
          mode: this.mode,
          responseData: data,
        });
      }

      this.token = nextToken.trim();

      const nextRefreshToken = data?.refresh_token ?? data?.data?.refresh_token;
      if (typeof nextRefreshToken === "string" && nextRefreshToken.trim()) {
        this.refreshToken = nextRefreshToken.trim();
      }
    } catch (error) {
      if (error instanceof UserCenterAPIError) {
        throw error;
      }

      const message =
        error?.name === "TimeoutError"
          ? "刷新 token 请求超时"
          : error?.name === "AbortError"
            ? "刷新 token 请求已被取消"
            : `刷新 token 失败: ${error instanceof Error ? error.message : String(error)}`;

      throw new UserCenterAPIError(message, {
        status: 500,
        endpoint: "/user/refresh",
        mode: this.mode,
        originalError: error,
      });
    }
  }
}
