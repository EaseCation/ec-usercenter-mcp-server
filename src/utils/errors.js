export class ECAPIError extends Error {
  constructor(message, status = 500, epf = null, originalError = null) {
    super(message);
    this.name = 'ECAPIError';
    this.status = status;
    this.epf = epf;
    this.originalError = originalError;
  }

  static fromResponse(response, data) {
    const epf = data?.EPF || response.status;
    let message = data?.message || `API request failed with status ${response.status}`;
    
    // Handle specific EPF error codes
    switch (epf) {
      case 400:
        message = '请求参数错误';
        break;
      case 401:
        message = '缺少Token';
        break;
      case 403:
        message = 'Token无效或权限不足';
        break;
      case 404:
        message = '页面不存在';
        break;
      case 500:
        message = '服务器内部错误';
        break;
      default:
        if (typeof data === 'string' && data.includes('NoBindingECID')) {
          message = '用户未绑定游戏账号';
        } else if (typeof data === 'string' && data.includes('InvalidToken')) {
          message = 'Token无效';
        } else if (typeof data === 'string' && data.includes('MissingToken')) {
          message = '缺少Token';
        } else if (typeof data === 'string' && data.includes('InsufficientTokenPermission')) {
          message = 'Token权限不足';
        }
    }
    
    return new ECAPIError(message, response.status, epf);
  }
}

export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export function handleToolError(error) {
  if (error instanceof ECAPIError) {
    return {
      isError: true,
      content: [{
        type: "text",
        text: `API错误 (EPF: ${error.epf || error.status}): ${error.message}`
      }]
    };
  }
  
  if (error instanceof ValidationError) {
    return {
      isError: true,
      content: [{
        type: "text",
        text: `参数验证错误${error.field ? ` (${error.field})` : ''}: ${error.message}`
      }]
    };
  }
  
  // Generic error
  return {
    isError: true,
    content: [{
      type: "text",
      text: `未知错误: ${error.message}`
    }]
  };
}