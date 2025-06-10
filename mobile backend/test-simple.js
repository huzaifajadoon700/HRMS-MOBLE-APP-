console.log('Testing basic Node.js setup...');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);

try {
  const express = require('express');
  console.log('✅ Express loaded successfully');
  
  const mongoose = require('mongoose');
  console.log('✅ Mongoose loaded successfully');
  
  const cors = require('cors');
  console.log('✅ CORS loaded successfully');
  
  console.log('✅ All basic dependencies loaded successfully');
  
  // Test basic express server
  const app = express();
  app.get('/test', (req, res) => {
    res.json({ message: 'Test successful!' });
  });
  
  const server = app.listen(8081, () => {
    console.log('✅ Test server running on port 8081');
    server.close();
    console.log('✅ Test completed successfully');
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
