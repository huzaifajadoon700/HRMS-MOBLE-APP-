const { spawn } = require('child_process');
const axios = require('axios');
const { masterEnhanceAndTest } = require('./masterEnhanceAndTest');

async function waitForServer(maxWaitTime = 30000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      await axios.get('http://localhost:8080/api/health');
      return true;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return false;
}

async function startServerAndTest() {
  console.log('🚀 STARTING BACKEND SERVER AND RUNNING TESTS\n');
  
  // Check if server is already running
  try {
    await axios.get('http://localhost:8080/api/health');
    console.log('✅ Server is already running');
    await masterEnhanceAndTest();
    return;
  } catch (error) {
    console.log('📡 Server not running, starting it...');
  }

  // Start the server
  const serverProcess = spawn('npm', ['start'], {
    cwd: process.cwd(),
    stdio: 'pipe'
  });

  console.log('⏳ Starting server...');

  // Wait for server to be ready
  const serverReady = await waitForServer();
  
  if (serverReady) {
    console.log('✅ Server is ready!');
    console.log('🧪 Running comprehensive tests...\n');
    
    try {
      await masterEnhanceAndTest();
    } finally {
      console.log('\n🛑 Stopping server...');
      serverProcess.kill();
      console.log('✅ Server stopped');
    }
  } else {
    console.log('❌ Server failed to start within 30 seconds');
    console.log('💡 Try starting manually: npm start');
    serverProcess.kill();
  }
}

if (require.main === module) {
  startServerAndTest();
}

module.exports = { startServerAndTest };
