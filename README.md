# DataForSEO MCP Server

A stdio-based Model Context Protocol (MCP) server for DataForSEO API.

## Installation

You can run directly with npx:

```bash
npx @skobyn/mcp-dataforseo --config '{"username":"your_username","password":"your_password"}'
```

Or install globally:

```bash
npm install -g @skobyn/mcp-dataforseo
mcp-dataforseo --config '{"username":"your_username","password":"your_password"}'
```

## Usage

Send JSON requests to stdin and receive JSON responses from stdout:

```bash
echo '{"type":"dataforseo_serp","keyword":"artificial intelligence"}' | npx @skobyn/mcp-dataforseo --config '{"username":"your_username","password":"your_password"}'
```

## Supported Request Types

### SERP API
```json
{
  "type": "dataforseo_serp",
  "keyword": "artificial intelligence",
  "location_code": 2840,
  "language_code": "en",
  "device": "desktop",
  "os": "windows"
}
```

### Keywords Data API
```json
{
  "type": "dataforseo_keywords_data",
  "keywords": ["seo", "search engine optimization"],
  "location_code": 2840,
  "language_code": "en"
}
```

### Backlinks API
```json
{
  "type": "dataforseo_backlinks",
  "target": "example.com",
  "limit": 100
}
```

### On-Page API
```json
{
  "type": "dataforseo_onpage",
  "url": "https://example.com",
  "check_spell": true,
  "enable_javascript": true
}
```

### Domain Analytics API
```json
{
  "type": "dataforseo_domain_analytics",
  "domain": "example.com"
}
```

### App Data API
```json
{
  "type": "dataforseo_app_data",
  "app_id": "com.example.app"
}
```

### Merchant API
```json
{
  "type": "dataforseo_merchant",
  "keyword": "bluetooth speakers",
  "location_code": 2840,
  "language_code": "en"
}
```

### Business Data API
```json
{
  "type": "dataforseo_business_data",
  "keyword": "pizza delivery",
  "location_code": 2840,
  "language_code": "en"
}
```

## Integration Example

Here's how to use this MCP server in your Node.js code:

```javascript
const { spawn } = require('child_process');

// Start the MCP server
const server = spawn('npx', ['@skobyn/mcp-dataforseo', '--config', '{"username":"your_username","password":"your_password"}']);

// Define the request
const request = {
  type: 'dataforseo_serp',
  keyword: 'artificial intelligence'
};

// Send the request
server.stdin.write(JSON.stringify(request) + '\n');
server.stdin.end();

// Process the response
server.stdout.on('data', (data) => {
  const response = JSON.parse(data.toString());
  console.log(response);
});

// Handle errors
server.stderr.on('data', (data) => {
  console.error(`Error: ${data}`);
});
```

## Environment Variables

You can also use environment variables instead of the config:

```bash
export DATAFORSEO_USERNAME=your_username
export DATAFORSEO_PASSWORD=your_password
npx @skobyn/mcp-dataforseo
```

## Publishing

To publish this package to npm:

1. Login to npm if not already logged in:
   ```bash
   npm login
   ```

2. Publish the package:
   ```bash
   npm publish --access public
   ```

3. To update the package later:
   ```bash
   npm version patch
   npm publish
   ``` 