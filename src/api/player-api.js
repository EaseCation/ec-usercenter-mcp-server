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

  async getPlayerChatHistory(ecid) {
    const params = {
      ecid: validateString(validateRequired(ecid, 'ecid'), 'ecid', 1)
    };
    
    return await apiClient.get('/ec/chat', params);
  }

  async getPlayerInfo(ecid) {
    const params = {
      ecid: validateString(validateRequired(ecid, 'ecid'), 'ecid', 1)
    };
    
    return await apiClient.get('/ec/info', params);
  }

  async getPlayerAuthHistory(ecid) {
    const params = {
      ecid: validateString(validateRequired(ecid, 'ecid'), 'ecid', 1)
    };
    
    return await apiClient.get('/ec/auth', params);
  }

  async getPlayerExchangeLog(ecid, from, to) {
    const params = {
      ecid: validateString(validateRequired(ecid, 'ecid'), 'ecid', 1)
    };
    
    if (from !== undefined && from !== null) {
      params.from = validateString(from, 'from', 1);
    }
    if (to !== undefined && to !== null) {
      params.to = validateString(to, 'to', 1);
    }
    
    return await apiClient.get('/ec/exchange', params);
  }

  async getPlayerRecordingHistory(ecid, startTime, endTime) {
    const params = {
      ecid: validateString(validateRequired(ecid, 'ecid'), 'ecid', 1)
    };
    
    if (startTime !== undefined && startTime !== null) {
      params.startTime = validateString(startTime, 'startTime', 1);
    }
    if (endTime !== undefined && endTime !== null) {
      params.endTime = validateString(endTime, 'endTime', 1);
    }
    
    return await apiClient.get('/ec/recording', params);
  }

  async getPlayerMerchandise(ecid) {
    const params = {
      ecid: validateString(validateRequired(ecid, 'ecid'), 'ecid', 1)
    };
    
    return await apiClient.get('/ec/merchandise', params);
  }

  async getPlayerTasks(ecid) {
    const params = {
      ecid: validateString(validateRequired(ecid, 'ecid'), 'ecid', 1)
    };
    
    return await apiClient.get('/ec/tasks', params);
  }
}

export const playerAPI = new PlayerAPI();