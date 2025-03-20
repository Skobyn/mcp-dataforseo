#!/usr/bin/env node

const readline = require('readline');
const axios = require('axios');
const crypto = require('crypto');

// Parse config options
let config = {};
try {
  const configArg = process.argv.find(arg => arg.startsWith('--config'));
  if (configArg) {
    let configJson;
    if (configArg.includes('=')) {
      // Handle --config='{...}'
      configJson = configArg.substring(configArg.indexOf('=') + 1);
    } else {
      // Handle --config '{...}'
      const configIndex = process.argv.indexOf(configArg);
      if (configIndex !== -1 && configIndex < process.argv.length - 1) {
        configJson = process.argv[configIndex + 1];
      }
    }
    
    if (configJson) {
      // Clean up the JSON string (handle PowerShell escaping issues)
      configJson = configJson.replace(/^['"]|['"]$/g, ''); // Remove outer quotes if present
      try {
        config = JSON.parse(configJson);
        console.error('Loaded config from command line argument');
      } catch (jsonError) {
        console.error(`Error parsing config JSON: ${jsonError.message}`);
        console.error('Provided config string:', configJson);
      }
    }
  }
} catch (error) {
  console.error(`Error processing config argument: ${error.message}`);
}

// Configure credentials (from config or environment variables)
const username = config.username || process.env.DATAFORSEO_USERNAME;
const password = config.password || process.env.DATAFORSEO_PASSWORD;

// Print diagnostic info to stderr (won't affect protocol)
if (username) {
  console.error(`Using username: ${username.substring(0, 3)}...${username.substring(username.length - 3)}`);
} else {
  console.error('Username not provided in config or environment variables');
}
if (password) {
  console.error('Password provided (hidden)');
} else {
  console.error('Password not provided in config or environment variables');
}

if (!username || !password) {
  console.error('Error: DataForSEO username and password are required');
  console.error('Provide credentials using one of these methods:');
  console.error('1. Environment variables: DATAFORSEO_USERNAME and DATAFORSEO_PASSWORD');
  console.error('2. Direct config: --config \'{"username":"user","password":"pass"}\'');
  process.exit(1);
}

// Initialize API client with basic auth
const apiClient = axios.create({
  baseURL: 'https://api.dataforseo.com/v3',
  auth: {
    username: username,
    password: password
  },
  headers: {
    'Content-Type': 'application/json'
  }
});

// Output initialization message immediately on startup
console.log(JSON.stringify({
  type: 'initialize',
  status: 'ready',
  version: '1.0.0',
  tools: [
    'dataforseo_serp',
    'dataforseo_keywords_data',
    'dataforseo_backlinks',
    'dataforseo_onpage',
    'dataforseo_domain_analytics',
    'dataforseo_app_data',
    'dataforseo_merchant',
    'dataforseo_business_data'
  ]
}));

// Set up readline interface for stdio
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// Process each line from stdin as a request
rl.on('line', async (line) => {
  try {
    // Parse the incoming JSON request
    const request = JSON.parse(line);
    
    // Generate a unique ID for this request
    const requestId = crypto.randomUUID();
    
    // Handle initialize request
    if (request.type === 'initialize') {
      console.log(JSON.stringify({
        type: 'initialize',
        id: requestId,
        status: 'ready',
        version: '1.0.0',
        tools: [
          'dataforseo_serp',
          'dataforseo_keywords_data',
          'dataforseo_backlinks',
          'dataforseo_onpage',
          'dataforseo_domain_analytics',
          'dataforseo_app_data',
          'dataforseo_merchant',
          'dataforseo_business_data'
        ]
      }));
      return;
    }
    
    // Process based on request type
    let response;
    
    if (request.type === 'dataforseo_serp') {
      // SERP API request
      const apiResponse = await apiClient.post('/serp/google/organic/live/advanced', [{
        keyword: request.keyword,
        location_code: request.location_code || 2840,
        language_code: request.language_code || "en",
        device: request.device || "desktop",
        os: request.os || "windows"
      }]);
      
      response = {
        type: 'dataforseo_serp',
        id: requestId,
        results: apiResponse.data.tasks[0].result,
        status: 'success'
      };
    } 
    else if (request.type === 'dataforseo_keywords_data') {
      // Keywords Data API request
      const apiResponse = await apiClient.post('/keywords_data/google/search_volume/live', [{
        keywords: request.keywords,
        location_code: request.location_code || 2840,
        language_code: request.language_code || "en"
      }]);
      
      response = {
        type: 'dataforseo_keywords_data',
        id: requestId,
        results: apiResponse.data.tasks[0].result,
        status: 'success'
      };
    }
    else if (request.type === 'dataforseo_backlinks') {
      // Backlinks API request
      const apiResponse = await apiClient.post('/backlinks/summary/live', [{
        target: request.target,
        limit: request.limit || 100
      }]);
      
      response = {
        type: 'dataforseo_backlinks',
        id: requestId,
        results: apiResponse.data.tasks[0].result,
        status: 'success'
      };
    }
    else if (request.type === 'dataforseo_onpage') {
      // On-Page API request
      const apiResponse = await apiClient.post('/on_page/instant_pages', [{
        url: request.url,
        check_spell: request.check_spell || true,
        enable_javascript: request.enable_javascript || true
      }]);
      
      response = {
        type: 'dataforseo_onpage',
        id: requestId,
        results: apiResponse.data.tasks[0].result,
        status: 'success'
      };
    }
    else if (request.type === 'dataforseo_domain_analytics') {
      // Domain Analytics API request
      const apiResponse = await apiClient.post('/domain_analytics/whois/live', [{
        domain: request.domain
      }]);
      
      response = {
        type: 'dataforseo_domain_analytics',
        id: requestId,
        results: apiResponse.data.tasks[0].result,
        status: 'success'
      };
    }
    else if (request.type === 'dataforseo_app_data') {
      // App Data API request
      const apiResponse = await apiClient.post('/app_data/google/app_info/live', [{
        app_id: request.app_id
      }]);
      
      response = {
        type: 'dataforseo_app_data',
        id: requestId,
        results: apiResponse.data.tasks[0].result,
        status: 'success'
      };
    }
    else if (request.type === 'dataforseo_merchant') {
      // Merchant API request
      const apiResponse = await apiClient.post('/merchant/google/products/live', [{
        keyword: request.keyword,
        location_code: request.location_code || 2840,
        language_code: request.language_code || "en"
      }]);
      
      response = {
        type: 'dataforseo_merchant',
        id: requestId,
        results: apiResponse.data.tasks[0].result,
        status: 'success'
      };
    }
    else if (request.type === 'dataforseo_business_data') {
      // Business Data API request
      const apiResponse = await apiClient.post('/business_data/google/my_business_info/live', [{
        keyword: request.keyword,
        location_code: request.location_code || 2840,
        language_code: request.language_code || "en"
      }]);
      
      response = {
        type: 'dataforseo_business_data',
        id: requestId,
        results: apiResponse.data.tasks[0].result,
        status: 'success'
      };
    }
    else {
      response = {
        type: 'error',
        id: requestId,
        error: 'Unsupported request type',
        status: 'error'
      };
    }
    
    // Send response back to stdout
    console.log(JSON.stringify(response));
  } catch (error) {
    // Handle errors
    const errorResponse = {
      type: 'error',
      error: error.message,
      status: 'error'
    };
    
    // Add API response details if available
    if (error.response && error.response.data) {
      errorResponse.details = error.response.data;
    }
    
    console.log(JSON.stringify(errorResponse));
  }
});

// Log startup information to stderr (won't affect the protocol)
console.error('DataForSEO MCP Server started and waiting for requests...'); 