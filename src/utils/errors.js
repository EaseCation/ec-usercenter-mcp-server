export class ConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConfigurationError";
  }
}

export class UserCenterAPIError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "UserCenterAPIError";
    this.status = options.status ?? 500;
    this.code = options.code ?? null;
    this.endpoint = options.endpoint ?? null;
    this.mode = options.mode ?? null;
    this.responseData = options.responseData;
    this.originalError = options.originalError;
  }
}

export function createToolError(error) {
  if (error instanceof UserCenterAPIError) {
    const location = [error.mode, error.endpoint].filter(Boolean).join(" ");
    const prefix = location ? `[${location}] ` : "";
    const code = error.code ?? error.status;

    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `${prefix}API 错误 (${code}): ${error.message}`,
        },
      ],
    };
  }

  if (error instanceof ConfigurationError) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `配置错误: ${error.message}`,
        },
      ],
    };
  }

  return {
    isError: true,
    content: [
      {
        type: "text",
        text: `未知错误: ${error instanceof Error ? error.message : String(error)}`,
      },
    ],
  };
}
