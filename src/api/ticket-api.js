import { apiClient } from './client.js';
import { 
  validateRequired, 
  validateNumber, 
  validateString, 
  validateArray,
  validateTicketType,
  validateTicketStatus,
  validateAssignType
} from '../utils/validators.js';

export class TicketAPI {
  
  async queryTickets(params = {}) {
    const {
      page = 1,
      pageSize = 20,
      tid,
      type,
      status,
      priority,
      initiator,
      target,
      advisor_uid
    } = params;
    
    const validatedParams = {
      page: validateNumber(validateRequired(page, 'page'), 'page', 1),
      pageSize: validateNumber(validateRequired(pageSize, 'pageSize'), 'pageSize', 1, 100)
    };
    
    if (tid !== undefined) {
      validatedParams.tid = validateArray(tid, 'tid', (item) => validateNumber(item, 'tid'));
    }
    
    if (type !== undefined) {
      validatedParams.type = validateArray(type, 'type', (item) => validateTicketType(item, 'type'));
    }
    
    if (status !== undefined) {
      validatedParams.status = validateArray(status, 'status', (item) => validateTicketStatus(item, 'status'));
    }
    
    if (priority !== undefined) {
      validatedParams.priority = validateNumber(priority, 'priority', 0, 5);
    }
    
    if (initiator !== undefined) {
      validatedParams.initiator = validateArray(initiator, 'initiator', (item) => validateString(item, 'initiator'));
    }
    
    if (target !== undefined) {
      validatedParams.target = validateArray(target, 'target', (item) => validateString(item, 'target'));
    }
    
    if (advisor_uid !== undefined) {
      validatedParams.advisor_uid = validateArray(advisor_uid, 'advisor_uid', (item) => validateString(item, 'advisor_uid'));
    }
    
    return await apiClient.get('/ticket/query', validatedParams);
  }

  async getTicketDetail(tid, anonymity = null) {
    const params = {
      tid: validateNumber(validateRequired(tid, 'tid'), 'tid', 1)
    };
    
    if (anonymity) {
      params.anonymity = validateString(anonymity, 'anonymity');
    }
    
    return await apiClient.get('/ticket/detail', params);
  }

  async getTicketList(type = null, keyword = null) {
    const params = {};
    
    if (type) {
      params.type = validateTicketType(type, 'type');
    }
    
    if (keyword) {
      params.keyword = validateString(keyword, 'keyword');
    }
    
    return await apiClient.get('/ticket/list', params);
  }

  async getTicketCount(type) {
    const params = {
      type: validateString(validateRequired(type, 'type'), 'type')
    };
    
    return await apiClient.get('/ticket/count', params);
  }

  async getTicketAIReply(tid, prompt = null) {
    const params = {
      tid: validateNumber(validateRequired(tid, 'tid'), 'tid', 1)
    };
    
    if (prompt) {
      params.prompt = validateString(prompt, 'prompt');
    }
    
    return await apiClient.get('/ticket/aiReply', params);
  }

  async assignTicket(type) {
    const params = {
      type: validateAssignType(validateRequired(type, 'type'), 'type')
    };
    
    return await apiClient.get('/ticket/assign', params);
  }
}

export const ticketAPI = new TicketAPI();