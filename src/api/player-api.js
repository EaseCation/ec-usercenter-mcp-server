import { apiClient } from './client.js';
import { validateRequired, validateString } from '../utils/validators.js';

export class PlayerAPI {
  
  async searchPlayers(name) {
    const params = {
      name: validateString(validateRequired(name, 'name'), 'name', 1)
    };
    
    return await apiClient.get('/ec/search', params);
  }

  async getPlayerBasic(ecid) {
    const params = {
      ecid: validateString(validateRequired(ecid, 'ecid'), 'ecid', 1)
    };
    
    return await apiClient.get('/ec/basic', params);
  }

  async getPlayerTickets(ecid) {
    const params = {
      ecid: validateString(validateRequired(ecid, 'ecid'), 'ecid', 1)
    };
    
    return await apiClient.get('/ec/tickets', params);
  }

  async getPlayerLogs(ecid) {
    const params = {
      ecid: validateString(validateRequired(ecid, 'ecid'), 'ecid', 1)
    };
    
    return await apiClient.get('/ec/ticket-logs', params);
  }

  async getPlayerBans(ecid) {
    const params = {
      ecid: validateString(validateRequired(ecid, 'ecid'), 'ecid', 1)
    };
    
    return await apiClient.get('/ec/ban', params);
  }
}

export const playerAPI = new PlayerAPI();