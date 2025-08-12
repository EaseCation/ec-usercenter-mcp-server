import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnvFile() {
  try {
    const envPath = join(__dirname, '..', '.env');
    const envContent = readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          process.env[key.trim()] = value;
        }
      }
    });
  } catch (error) {
    // .env file is optional, continue with process.env only
  }
}

// Load .env file if it exists
loadEnvFile();

export const config = {
  // EaseCation API configuration
  apiBaseUrl: process.env.EC_API_BASE_URL || 'https://api.easecation.net',
  jwtToken: process.env.EC_JWT_TOKEN,
  apiTimeout: parseInt(process.env.EC_API_TIMEOUT) || 30000,
  
  // MCP server configuration
  serverName: 'ec-usercenter-mcp-server',
  serverVersion: '1.0.0',
  
  // Validation
  validate() {
    const errors = [];
    
    if (!this.jwtToken) {
      errors.push('EC_JWT_TOKEN is required');
    }
    
    if (!this.apiBaseUrl) {
      errors.push('EC_API_BASE_URL is required');
    }
    
    if (errors.length > 0) {
      throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }
  }
};

// Validate configuration on import
config.validate();