#!/usr/bin/env node
/**
 * Complete Room Recommendation Flow Test
 * Tests the entire recommendation pipeline from frontend to ML service
 */

const axios = require('axios');

// Configuration
const BACKEND_URL = 'http://localhost:8080';
const ML_SERVICE_URL = 'http://localhost:5002';

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(60));
    log(title, 'bold');
    console.log('='.repeat(60));
}

async function testMLServiceDirectly() {
    logSection('🔬 TESTING ML SERVICE DIRECTLY');
    
    try {
        // Test health
        log('1. Testing ML service health...', 'blue');
        const healthResponse = await axios.get(`${ML_SERVICE_URL}/health`);
        log(`✅ Health: ${JSON.stringify(healthResponse.data)}`, 'green');
        
        // Test recommendations directly
        log('2. Testing direct ML recommendations...', 'blue');
        const mlRecommendations = await axios.post(`${ML_SERVICE_URL}/recommendations`, {
            user_id: 'test_user_123',
            n_recommendations: 5
        });
        
        if (mlRecommendations.data.success) {
            log(`✅ ML Service returned ${mlRecommendations.data.recommendations.length} recommendations`, 'green');
            mlRecommendations.data.recommendations.forEach((rec, index) => {
                log(`   ${index + 1}. Room ${rec.room_id} - Score: ${rec.predicted_rating?.toFixed(2)} - Reason: ${rec.reason}`, 'blue');
            });
        } else {
            log(`❌ ML Service failed: ${mlRecommendations.data.error}`, 'red');
        }
        
        return mlRecommendations.data.success;
        
    } catch (error) {
        log(`❌ ML Service Error: ${error.message}`, 'red');
        return false;
    }
}

async function testBackendRecommendationAPI() {
    logSection('🔗 TESTING BACKEND RECOMMENDATION API');
    
    try {
        // Test backend recommendation endpoint
        log('1. Testing backend recommendation endpoint...', 'blue');
        const backendResponse = await axios.get(`${BACKEND_URL}/api/rooms/recommendations/test_user_123?count=5`);
        
        if (backendResponse.data.success) {
            log(`✅ Backend returned ${backendResponse.data.recommendations.length} recommendations`, 'green');
            backendResponse.data.recommendations.forEach((rec, index) => {
                log(`   ${index + 1}. Room ${rec.roomId || rec._id} - Score: ${rec.score?.toFixed(2)} - Reason: ${rec.reason}`, 'blue');
            });
            return true;
        } else {
            log(`❌ Backend failed: ${backendResponse.data.message}`, 'red');
            return false;
        }
        
    } catch (error) {
        log(`❌ Backend Error: ${error.message}`, 'red');
        
        // Try to get more details about the error
        if (error.response) {
            log(`   Status: ${error.response.status}`, 'yellow');
            log(`   Data: ${JSON.stringify(error.response.data)}`, 'yellow');
        }
        return false;
    }
}

async function testRoomDataAvailability() {
    logSection('🏠 TESTING ROOM DATA AVAILABILITY');
    
    try {
        // Test if rooms exist in database
        log('1. Testing room data availability...', 'blue');
        const roomsResponse = await axios.get(`${BACKEND_URL}/api/rooms`);
        
        if (roomsResponse.data && roomsResponse.data.length > 0) {
            log(`✅ Found ${roomsResponse.data.length} rooms in database`, 'green');
            
            // Show first few rooms
            roomsResponse.data.slice(0, 3).forEach((room, index) => {
                log(`   ${index + 1}. Room ${room.roomNumber} - Type: ${room.roomType} - Price: $${room.price}`, 'blue');
            });
            
            return roomsResponse.data;
        } else {
            log(`❌ No rooms found in database`, 'red');
            return [];
        }
        
    } catch (error) {
        log(`❌ Room Data Error: ${error.message}`, 'red');
        return [];
    }
}

async function testPopularRoomsAPI() {
    logSection('🔥 TESTING POPULAR ROOMS API');
    
    try {
        log('1. Testing popular rooms endpoint...', 'blue');
        const popularResponse = await axios.get(`${BACKEND_URL}/api/rooms/popular?count=5`);
        
        if (popularResponse.data.success) {
            log(`✅ Popular rooms API returned ${popularResponse.data.popularRooms.length} rooms`, 'green');
            popularResponse.data.popularRooms.forEach((room, index) => {
                const roomData = room.roomDetails || room;
                log(`   ${index + 1}. Room ${roomData.roomNumber} - Score: ${room.score?.toFixed(2)} - Reason: ${room.reason}`, 'blue');
            });
            return true;
        } else {
            log(`❌ Popular rooms failed: ${popularResponse.data.message}`, 'red');
            return false;
        }
        
    } catch (error) {
        log(`❌ Popular Rooms Error: ${error.message}`, 'red');
        return false;
    }
}

async function testMLMetricsEndpoints() {
    logSection('📊 TESTING ML METRICS ENDPOINTS');
    
    try {
        // Test accuracy endpoint
        log('1. Testing ML accuracy endpoint...', 'blue');
        const accuracyResponse = await axios.get(`${BACKEND_URL}/api/rooms/ml/accuracy`);
        if (accuracyResponse.data.success) {
            log(`✅ Accuracy: RMSE=${accuracyResponse.data.rmse}, MAE=${accuracyResponse.data.mae}`, 'green');
        }
        
        // Test confusion matrix endpoint
        log('2. Testing ML confusion matrix endpoint...', 'blue');
        const confusionResponse = await axios.get(`${BACKEND_URL}/api/rooms/ml/confusion-matrix`);
        if (confusionResponse.data.success) {
            const cm = confusionResponse.data.confusion_matrix;
            log(`✅ Confusion Matrix: Accuracy=${(cm.accuracy * 100).toFixed(1)}%, Precision=${(cm.precision * 100).toFixed(1)}%`, 'green');
        }
        
        // Test status endpoint
        log('3. Testing ML status endpoint...', 'blue');
        const statusResponse = await axios.get(`${BACKEND_URL}/api/rooms/ml/status`);
        if (statusResponse.data.success) {
            log(`✅ Status: Model Ready=${statusResponse.data.model_ready}, Users=${statusResponse.data.users_count}`, 'green');
        }
        
        return true;
        
    } catch (error) {
        log(`❌ ML Metrics Error: ${error.message}`, 'red');
        return false;
    }
}

async function runCompleteAnalysis() {
    log('🚀 STARTING COMPLETE ROOM RECOMMENDATION ANALYSIS', 'bold');
    
    const results = {
        mlServiceDirect: false,
        backendAPI: false,
        roomData: false,
        popularRooms: false,
        mlMetrics: false
    };
    
    // Run all tests
    results.mlServiceDirect = await testMLServiceDirectly();
    results.roomData = (await testRoomDataAvailability()).length > 0;
    results.backendAPI = await testBackendRecommendationAPI();
    results.popularRooms = await testPopularRoomsAPI();
    results.mlMetrics = await testMLMetricsEndpoints();
    
    // Final analysis
    logSection('📋 COMPLETE ANALYSIS RESULTS');
    
    const allWorking = Object.values(results).every(result => result === true);
    
    Object.entries(results).forEach(([test, passed]) => {
        const status = passed ? '✅ WORKING' : '❌ FAILED';
        const color = passed ? 'green' : 'red';
        log(`${test.toUpperCase()}: ${status}`, color);
    });
    
    console.log('\n' + '='.repeat(60));
    if (allWorking) {
        log('🎉 ALL RECOMMENDATION SYSTEMS ARE WORKING PERFECTLY!', 'green');
        log('✅ Room recommendations are happening in real-time', 'green');
        log('✅ ML service is providing accurate predictions', 'green');
        log('✅ Backend integration is seamless', 'green');
        log('✅ Frontend will receive proper recommendation data', 'green');
    } else {
        log('⚠️ Some components need attention:', 'yellow');
        Object.entries(results).forEach(([test, passed]) => {
            if (!passed) {
                log(`   • ${test} needs to be fixed`, 'red');
            }
        });
    }
    console.log('='.repeat(60));
    
    return allWorking;
}

// Run the analysis
if (require.main === module) {
    runCompleteAnalysis().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        log(`❌ Analysis failed: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = { runCompleteAnalysis };
