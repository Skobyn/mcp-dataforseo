const { spawn } = require('child_process');
const fs = require('fs');

// Read config
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Start the MCP server
const server = spawn('node', ['index.js'], {
  env: { 
    ...process.env,
    DATAFORSEO_USERNAME: config.username,
    DATAFORSEO_PASSWORD: config.password
  }
});

// Define the request
const request = {
  type: 'dataforseo_serp',
  keyword: 'artificial intelligence'
};

// Buffer to collect response data
let responseBuffer = '';

// Wait a moment for server to initialize
setTimeout(() => {
  console.log('Sending request to MCP server...');
  
  // Send the request
  server.stdin.write(JSON.stringify(request) + '\n');
  
  // Process the response
  server.stdout.on('data', (data) => {
    // Append to buffer
    responseBuffer += data.toString();
    
    try {
      // Try to parse the accumulated JSON
      const response = JSON.parse(responseBuffer);
      console.log('Response received successfully:');
      
      // Save full response to file instead of printing to console
      fs.writeFileSync('response.json', JSON.stringify(response, null, 2));
      console.log('Full response saved to response.json');
      
      // Display a small preview
      console.log('Preview:');
      if (response.results && response.results[0] && response.results[0].items) {
        console.log(`Got ${response.results[0].items.length} items in response`);
        console.log('First item type:', response.results[0].items[0]?.type);
      } else {
        console.log('Results structure:', JSON.stringify(response).substring(0, 200) + '...');
      }
      
      // Close the server
      server.kill();
      process.exit(0);
    } catch (error) {
      // If parsing fails, it's likely incomplete JSON - wait for more data
      console.log(`Received partial data (${responseBuffer.length} bytes), waiting for more...`);
    }
  });
  
  // Handle errors
  server.stderr.on('data', (data) => {
    console.error(`Server error: ${data}`);
  });
}, 1000);

// If no response after 30 seconds, exit
setTimeout(() => {
  console.error('Timeout waiting for response');
  // Save partial response for debugging
  fs.writeFileSync('partial_response.txt', responseBuffer);
  console.log('Partial response saved to partial_response.txt');
  server.kill();
  process.exit(1);
}, 30000); 