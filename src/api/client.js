import { config } from '../config.js';
import { ECAPIError } from '../utils/errors.js';

export class APIClient {
  constructor() {
    this.baseUrl = config.apiBaseUrl;
    this.token = config.jwtToken;
    this.timeout = config.apiTimeout;
  }

  async request(method, endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const { params = {}, body = null, headers = {} } = options;
    
    // Add query parameters
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v));
        } else {
          searchParams.append(key, value);
        }
      }
    });
    
    const queryString = searchParams.toString();
    const finalUrl = queryString ? `${url}?${queryString}` : url;
    
    // Prepare request options
    const fetchOptions = {
      method,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...headers
      },
      signal: AbortSignal.timeout(this.timeout)
    };
    
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      fetchOptions.body = JSON.stringify(body);
    }
    
    try {
      const response = await fetch(finalUrl, fetchOptions);
      let data;
      
      try {
        data = await response.json();
      } catch (parseError) {
        // If response is not JSON, treat as text
        data = await response.text();
      }
      
      if (!response.ok) {
        throw ECAPIError.fromResponse(response, data);
      }
      
      // Check EPF status in response body
      if (data && typeof data === 'object' && data.EPF && data.EPF !== 200) {
        throw ECAPIError.fromResponse(response, data);
      }
      
      return data;
    } catch (error) {
      if (error instanceof ECAPIError) {
        throw error;
      }
      
      if (error.name === 'TimeoutError') {
        throw new ECAPIError('请求超时', 408);
      }
      
      if (error.name === 'AbortError') {
        throw new ECAPIError('请求被中断', 408);
      }
      
      throw new ECAPIError(`网络请求失败: ${error.message}`, 500, null, error);
    }
  }

  async get(endpoint, params = {}) {
    return this.request('GET', endpoint, { params });
  }

  async post(endpoint, body = null, params = {}) {
    return this.request('POST', endpoint, { params, body });
  }

  async put(endpoint, body = null, params = {}) {
    return this.request('PUT', endpoint, { params, body });
  }

  async delete(endpoint, params = {}) {
    return this.request('DELETE', endpoint, { params });
  }
}

export const apiClient = new APIClient();