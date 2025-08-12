import { apiClient } from './client.js';
import { validateRequired, validateString } from '../utils/validators.js';

export class AuthAPI {
  
  async getUserInfo() {
    return await apiClient.get('/user/info');
  }

  async checkStaffPermission(authorizer) {
    const params = {
      authorizer: validateString(validateRequired(authorizer, 'authorizer'), 'authorizer', 1)
    };
    
    return await apiClient.get('/staff/permission', params);
  }
}

export const authAPI = new AuthAPI();