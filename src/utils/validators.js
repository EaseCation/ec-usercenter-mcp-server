import { ValidationError } from './errors.js';

export function validateRequired(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }
  return value;
}

export function validateNumber(value, fieldName, min = null, max = null) {
  if (value === undefined || value === null) {
    return value;
  }
  
  const num = Number(value);
  if (isNaN(num)) {
    throw new ValidationError(`${fieldName} must be a valid number`, fieldName);
  }
  
  if (min !== null && num < min) {
    throw new ValidationError(`${fieldName} must be >= ${min}`, fieldName);
  }
  
  if (max !== null && num > max) {
    throw new ValidationError(`${fieldName} must be <= ${max}`, fieldName);
  }
  
  return num;
}

export function validateString(value, fieldName, minLength = null, maxLength = null) {
  if (value === undefined || value === null) {
    return value;
  }
  
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, fieldName);
  }
  
  if (minLength !== null && value.length < minLength) {
    throw new ValidationError(`${fieldName} must be at least ${minLength} characters`, fieldName);
  }
  
  if (maxLength !== null && value.length > maxLength) {
    throw new ValidationError(`${fieldName} must be at most ${maxLength} characters`, fieldName);
  }
  
  return value;
}

export function validateArray(value, fieldName, itemValidator = null) {
  if (value === undefined || value === null) {
    return value;
  }
  
  if (!Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an array`, fieldName);
  }
  
  if (itemValidator) {
    return value.map((item, index) => itemValidator(item, `${fieldName}[${index}]`));
  }
  
  return value;
}

export function validateEnum(value, fieldName, allowedValues) {
  if (value === undefined || value === null) {
    return value;
  }
  
  if (!allowedValues.includes(value)) {
    throw new ValidationError(`${fieldName} must be one of: ${allowedValues.join(', ')}`, fieldName);
  }
  
  return value;
}

export function validateTicketType(value, fieldName = 'type') {
  const validTypes = ['AG', 'AP', 'RP', 'SP', 'AW', 'OP', 'JY', 'RS', 'MB', 'MA', 'AB', 'MM', 'OT'];
  return validateEnum(value, fieldName, validTypes);
}

export function validateTicketStatus(value, fieldName = 'status') {
  const validStatuses = ['W', 'P', 'C', 'D']; // 根据实际API调整
  return validateEnum(value, fieldName, validStatuses);
}

export function validateAssignType(value, fieldName = 'type') {
  const validTypes = ['my', 'upgrade', 'unassigned'];
  return validateEnum(value, fieldName, validTypes);
}