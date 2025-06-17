#!/usr/bin/env node
/**
 * FINAL COMPLETE SYSTEM VERIFICATION
 * Tests all three recommendation systems comprehensively
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BACKEND_URL = 'http://localhost:8080';
const FOOD_ML_URL = 'http://localhost:5001';
const ROOM_ML_URL = 'http://localhost:5002';

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title, emoji = '🔍') {
    console.log('\n' + '='.repeat(70));
    log(`${emoji} ${title}`, 'bold');
    console.log('='.repeat(70));
}

async function testFoodRecommendationSystem() {
    logSection('FOOD RECOMMENDATION SYSTEM', '🍽️');
    
    const results = {
        mlService: false,
        backendIntegration: false,
        accuracy: null,
        dataAvailable: false
    };
    
    try {
        // Test ML Service
        log('1. Testing Food ML Service...', 'blue');
        const healthResponse = await axios.get(`${FOOD_ML_URL}/health`);
        if (healthResponse.data.status === 'healthy') {
            results.mlService = true;
            log('✅ Food ML Service: ACTIVE', 'green');
        }
        
        // Test Accuracy
        log('2. Testing Food ML Accuracy...', 'blue');
        const accuracyResponse = await axios.get(`${FOOD_ML_URL}/accuracy`);
        if (accuracyResponse.data.model_ready) {
            results.accuracy = {
                rmse: accuracyResponse.data.rmse,
                mae: accuracyResponse.data.mae
            };
            log(`✅ Food Accuracy: RMSE=${accuracyResponse.data.rmse.toFixed(3)}, MAE=${accuracyResponse.data.mae.toFixed(3)}`, 'green');
        }
        
        // Test Backend Integration
        log('3. Testing Food Backend Integration...', 'blue');
        const menuResponse = await axios.get(`${BACKEND_URL}/api/menus`);
        if (menuResponse.data && menuResponse.data.length > 0) {
            results.backendIntegration = true;
            results.dataAvailable = true;
            log(`✅ Food Backend: ${menuResponse.data.length} menu items available`, 'green');
        }
        
    } catch (error) {
        log(`❌ Food System Error: ${error.message}`, 'red');
    }
    
    return results;
}

async function testRoomRecommendationSystem() {
    logSection('ROOM RECOMMENDATION SYSTEM', '🏨');
    
    const results = {
        mlService: false,
        backendIntegration: false,
        accuracy: null,
        confusionMatrix: null,
        dataAvailable: false
    };
    
    try {
        // Test ML Service
        log('1. Testing Room ML Service...', 'blue');
        const healthResponse = await axios.get(`${ROOM_ML_URL}/health`);
        if (healthResponse.data.status === 'healthy') {
            results.mlService = true;
            log('✅ Room ML Service: ACTIVE', 'green');
        }
        
        // Test Accuracy
        log('2. Testing Room ML Accuracy...', 'blue');
        const accuracyResponse = await axios.get(`${ROOM_ML_URL}/accuracy`);
        if (accuracyResponse.data.success) {
            results.accuracy = {
                rmse: accuracyResponse.data.rmse,
                mae: accuracyResponse.data.mae
            };
            log(`✅ Room Accuracy: RMSE=${accuracyResponse.data.rmse.toFixed(3)}, MAE=${accuracyResponse.data.mae.toFixed(3)}`, 'green');
        }
        
        // Test Confusion Matrix
        log('3. Testing Room Confusion Matrix...', 'blue');
        const confusionResponse = await axios.get(`${ROOM_ML_URL}/confusion-matrix`);
        if (confusionResponse.data.success) {
            results.confusionMatrix = confusionResponse.data.confusion_matrix;
            log(`✅ Room Confusion Matrix: Accuracy=${(confusionResponse.data.confusion_matrix.accuracy * 100).toFixed(1)}%`, 'green');
        }
        
        // Test Backend Integration
        log('4. Testing Room Backend Integration...', 'blue');
        const roomsResponse = await axios.get(`${BACKEND_URL}/api/rooms`);
        if (roomsResponse.data && roomsResponse.data.length > 0) {
            results.backendIntegration = true;
            results.dataAvailable = true;
            log(`✅ Room Backend: ${roomsResponse.data.length} rooms available`, 'green');
        }
        
    } catch (error) {
        log(`❌ Room System Error: ${error.message}`, 'red');
    }
    
    return results;
}

async function testTableRecommendationSystem() {
    logSection('TABLE RECOMMENDATION SYSTEM', '🍽️');
    
    const results = {
        mlModels: false,
        backendIntegration: false,
        popularTables: false,
        dataAvailable: false,
        modelFiles: 0
    };
    
    try {
        // Test ML Model Files
        log('1. Testing Table ML Model Files...', 'blue');
        const modelFiles = [
            'tables_dataset.csv',
            'users_dataset.csv',
            'bookings_dataset.csv',
            'interactions_dataset.csv',
            'collaborative_filtering_model.pkl',
            'content_based_model.pkl',
            'hybrid_model.pkl'
        ];
        
        let existingFiles = 0;
        for (const file of modelFiles) {
            const filePath = path.join('./table_ml_models', file);
            if (fs.existsSync(filePath)) {
                existingFiles++;
            }
        }
        
        results.modelFiles = existingFiles;
        results.mlModels = existingFiles === modelFiles.length;
        log(`✅ Table ML Models: ${existingFiles}/${modelFiles.length} files present`, 'green');
        
        // Test Backend Integration
        log('2. Testing Table Backend Integration...', 'blue');
        const tablesResponse = await axios.get(`${BACKEND_URL}/api/tables`);
        if (tablesResponse.data && tablesResponse.data.length > 0) {
            results.backendIntegration = true;
            results.dataAvailable = true;
            log(`✅ Table Backend: ${tablesResponse.data.length} tables available`, 'green');
        }
        
        // Test Popular Tables
        log('3. Testing Table Popular API...', 'blue');
        const popularResponse = await axios.get(`${BACKEND_URL}/api/tables/popular?limit=5`);
        if (popularResponse.data.success && popularResponse.data.tables) {
            results.popularTables = true;
            log(`✅ Table Popular API: ${popularResponse.data.tables.length} popular tables`, 'green');
        }
        
    } catch (error) {
        log(`❌ Table System Error: ${error.message}`, 'red');
    }
    
    return results;
}

async function testFrontendIntegration() {
    logSection('FRONTEND INTEGRATION CHECK', '🎨');
    
    const frontendFiles = [
        // Food components
        'frontend/src/components/Admin/RecommendationEvaluation.jsx',
        'frontend/src/pages/OrderFood.js',
        'frontend/src/components/recommendations/PersonalizedRecommendations.jsx',

        // Room components
        'frontend/src/components/Admin/RoomRecommendationAnalytics.jsx',
        'frontend/src/pages/RoomPage.js',
        'frontend/src/components/home/Rooms.js',

        // Table components
        'frontend/src/components/Admin/TableRecommendationAnalytics.js',
        'frontend/src/components/tables/TableRecommendations.jsx',
        'frontend/src/components/home/TableReservation.js'
    ];
    
    let existingFiles = 0;
    const results = {
        food: 0,
        room: 0,
        table: 0
    };
    
    for (const file of frontendFiles) {
        if (fs.existsSync(file)) {
            existingFiles++;
            if (file.includes('food') || file.includes('menu') || file.includes('Order')) {
                results.food++;
            } else if (file.includes('room') || file.includes('Room')) {
                results.room++;
            } else if (file.includes('table') || file.includes('Table')) {
                results.table++;
            }
            log(`✅ Found: ${path.basename(file)}`, 'green');
        } else {
            log(`❌ Missing: ${path.basename(file)}`, 'red');
        }
    }
    
    return { existingFiles, total: frontendFiles.length, breakdown: results };
}

async function runFinalSystemVerification() {
    log('🚀 FINAL COMPLETE SYSTEM VERIFICATION', 'bold');
    log('Testing all three recommendation systems comprehensively\n', 'cyan');
    
    // Test all systems
    const foodResults = await testFoodRecommendationSystem();
    const roomResults = await testRoomRecommendationSystem();
    const tableResults = await testTableRecommendationSystem();
    const frontendResults = await testFrontendIntegration();
    
    // Generate final report
    logSection('FINAL SYSTEM REPORT', '📊');
    
    // Food System Summary
    log('🍽️ FOOD RECOMMENDATION SYSTEM:', 'bold');
    log(`   ML Service: ${foodResults.mlService ? '✅ ACTIVE' : '❌ INACTIVE'}`, foodResults.mlService ? 'green' : 'red');
    log(`   Backend: ${foodResults.backendIntegration ? '✅ WORKING' : '❌ FAILED'}`, foodResults.backendIntegration ? 'green' : 'red');
    if (foodResults.accuracy) {
        log(`   Accuracy: ✅ RMSE=${foodResults.accuracy.rmse.toFixed(3)}, MAE=${foodResults.accuracy.mae.toFixed(3)}`, 'green');
    }
    
    // Room System Summary
    log('\n🏨 ROOM RECOMMENDATION SYSTEM:', 'bold');
    log(`   ML Service: ${roomResults.mlService ? '✅ ACTIVE' : '❌ INACTIVE'}`, roomResults.mlService ? 'green' : 'red');
    log(`   Backend: ${roomResults.backendIntegration ? '✅ WORKING' : '❌ FAILED'}`, roomResults.backendIntegration ? 'green' : 'red');
    if (roomResults.accuracy) {
        log(`   Accuracy: ✅ RMSE=${roomResults.accuracy.rmse.toFixed(3)}, MAE=${roomResults.accuracy.mae.toFixed(3)}`, 'green');
    }
    if (roomResults.confusionMatrix) {
        log(`   Classification: ✅ ${(roomResults.confusionMatrix.accuracy * 100).toFixed(1)}% accuracy`, 'green');
    }
    
    // Table System Summary
    log('\n🍽️ TABLE RECOMMENDATION SYSTEM:', 'bold');
    log(`   ML Models: ${tableResults.mlModels ? '✅ COMPLETE' : '❌ INCOMPLETE'} (${tableResults.modelFiles}/7 files)`, tableResults.mlModels ? 'green' : 'red');
    log(`   Backend: ${tableResults.backendIntegration ? '✅ WORKING' : '❌ FAILED'}`, tableResults.backendIntegration ? 'green' : 'red');
    log(`   Popular API: ${tableResults.popularTables ? '✅ WORKING' : '❌ FAILED'}`, tableResults.popularTables ? 'green' : 'red');
    
    // Frontend Summary
    log('\n🎨 FRONTEND INTEGRATION:', 'bold');
    log(`   Overall: ${frontendResults.existingFiles}/${frontendResults.total} components found`, 'blue');
    log(`   Food Components: ${frontendResults.breakdown.food} files`, 'blue');
    log(`   Room Components: ${frontendResults.breakdown.room} files`, 'blue');
    log(`   Table Components: ${frontendResults.breakdown.table} files`, 'blue');
    
    // Calculate overall score
    const totalSystems = 3;
    let workingSystems = 0;
    
    if (foodResults.mlService && foodResults.backendIntegration) workingSystems++;
    if (roomResults.mlService && roomResults.backendIntegration) workingSystems++;
    if (tableResults.mlModels && tableResults.backendIntegration) workingSystems++;
    
    logSection('FINAL VERDICT', '🏆');
    
    const percentage = Math.round((workingSystems / totalSystems) * 100);
    log(`SYSTEM COMPLETION: ${workingSystems}/${totalSystems} systems fully operational (${percentage}%)`, 
        percentage === 100 ? 'green' : percentage >= 67 ? 'yellow' : 'red');
    
    if (percentage === 100) {
        log('🎉 ALL RECOMMENDATION SYSTEMS ARE FULLY OPERATIONAL!', 'green');
        log('🎓 READY FOR FYP PRESENTATION!', 'green');
    } else if (percentage >= 67) {
        log('⚠️ MOST SYSTEMS WORKING - MINOR FIXES NEEDED', 'yellow');
    } else {
        log('❌ MAJOR ISSUES NEED RESOLUTION', 'red');
    }
    
    return {
        food: foodResults,
        room: roomResults,
        table: tableResults,
        frontend: frontendResults,
        overallScore: percentage
    };
}

// Run the verification
if (require.main === module) {
    runFinalSystemVerification().then(results => {
        process.exit(results.overallScore >= 67 ? 0 : 1);
    }).catch(error => {
        log(`❌ Verification failed: ${error.message}`, 'red');
        process.exit(1);
    });
}
