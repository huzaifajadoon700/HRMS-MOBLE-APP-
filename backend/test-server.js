// Test script to verify backend functionality
const mongoose = require('mongoose');
require('dotenv').config();

// Test database connection
async function testDatabase() {
    try {
        await mongoose.connect(process.env.Mongo_Conn);
        console.log('✅ Database connection: SUCCESS');
        
        // Test User model
        const User = require('./Models/User');
        const userCount = await User.countDocuments();
        console.log(`✅ User model: SUCCESS (${userCount} users)`);
        
        // Test Menu model
        const Menu = require('./Models/Menu');
        const menuCount = await Menu.countDocuments();
        console.log(`✅ Menu model: SUCCESS (${menuCount} menu items)`);
        
        // Test new models
        const UserFoodInteraction = require('./Models/UserFoodInteraction');
        const interactionCount = await UserFoodInteraction.countDocuments();
        console.log(`✅ UserFoodInteraction model: SUCCESS (${interactionCount} interactions)`);
        
        const FoodRecommendation = require('./Models/FoodRecommendation');
        const recommendationCount = await FoodRecommendation.countDocuments();
        console.log(`✅ FoodRecommendation model: SUCCESS (${recommendationCount} cached recommendations)`);
        
        await mongoose.disconnect();
        console.log('✅ Database disconnection: SUCCESS');
        
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
    }
}

// Test ML model loader
async function testMLModels() {
    try {
        const mlModelLoader = require('./utils/mlModelLoader');
        const success = await mlModelLoader.loadModels();
        
        if (success) {
            console.log('✅ ML Models: SUCCESS');
            const modelInfo = mlModelLoader.getModelInfo();
            console.log(`✅ Model Performance: RMSE=${modelInfo.modelInfo.performance?.rmse}, MAE=${modelInfo.modelInfo.performance?.mae}`);
            console.log(`✅ Pakistani Cuisine: ${Object.keys(modelInfo.pakistaniCuisine).length} adaptations loaded`);
        } else {
            console.log('❌ ML Models: FAILED');
        }
    } catch (error) {
        console.error('❌ ML Models test failed:', error.message);
    }
}

// Test controllers
async function testControllers() {
    try {
        // Test FoodRecommendationController
        const FoodRecommendationController = require('./Controllers/FoodRecommendationController');
        console.log('✅ FoodRecommendationController: SUCCESS');
        
        // Test AuthController
        const AuthController = require('./Controllers/AuthController');
        console.log('✅ AuthController: SUCCESS');
        
        // Test other controllers
        const orderControllers = require('./Controllers/orderControllers');
        console.log('✅ OrderControllers: SUCCESS');
        
    } catch (error) {
        console.error('❌ Controllers test failed:', error.message);
    }
}

// Test middleware
async function testMiddleware() {
    try {
        const { ensureAuthenticated, ensureAdmin } = require('./Middlewares/Auth');
        console.log('✅ Auth Middleware: SUCCESS');
        
    } catch (error) {
        console.error('❌ Middleware test failed:', error.message);
    }
}

// Run all tests
async function runAllTests() {
    console.log('🧪 BACKEND TESTING STARTED');
    console.log('=' * 50);
    
    await testDatabase();
    console.log('');
    
    await testMLModels();
    console.log('');
    
    await testControllers();
    console.log('');
    
    await testMiddleware();
    console.log('');
    
    console.log('🎉 BACKEND TESTING COMPLETED');
    console.log('=' * 50);
    
    process.exit(0);
}

runAllTests();
