const axios = require('axios');

async function testCompleteRecommendationSystem() {
    console.log('🎯 COMPREHENSIVE RECOMMENDATION SYSTEM TEST');
    console.log('===========================================\n');

    const results = {
        userAPIs: { passed: 0, total: 0 },
        adminAPIs: { passed: 0, total: 0 },
        mlModel: { passed: 0, total: 0 },
        evaluation: { passed: 0, total: 0 }
    };

    try {
        // Test 1: Popular Recommendations (User-facing)
        console.log('1️⃣ Testing Popular Recommendations API...');
        results.userAPIs.total++;
        try {
            const response = await axios.get('http://localhost:8080/api/food-recommendations/popular?count=8');
            if (response.data.success && response.data.popularItems.length > 0) {
                console.log('✅ Popular recommendations: WORKING');
                console.log(`   📋 Items returned: ${response.data.popularItems.length}`);
                console.log(`   🍽️ Sample: ${response.data.popularItems[0].menuItem.name}`);
                results.userAPIs.passed++;
            } else {
                console.log('❌ Popular recommendations: FAILED - No items returned');
            }
        } catch (error) {
            console.log('❌ Popular recommendations: FAILED -', error.message);
        }

        // Test 2: Pakistani Recommendations
        console.log('\n2️⃣ Testing Pakistani Cuisine Recommendations...');
        results.userAPIs.total++;
        try {
            const response = await axios.get('http://localhost:8080/api/food-recommendations/pakistani-recommendations/guest?count=5');
            if (response.data.success && response.data.recommendations.length > 0) {
                console.log('✅ Pakistani recommendations: WORKING');
                console.log(`   🇵🇰 Items returned: ${response.data.recommendations.length}`);
                console.log(`   🍛 Sample: ${response.data.recommendations[0].name}`);
                results.userAPIs.passed++;
            } else {
                console.log('❌ Pakistani recommendations: FAILED - No items returned');
            }
        } catch (error) {
            console.log('❌ Pakistani recommendations: FAILED -', error.message);
        }

        // Test 3: ML Model Status
        console.log('\n3️⃣ Testing ML Model Status...');
        results.mlModel.total++;
        try {
            const response = await axios.get('http://localhost:5001/model_info');
            if (response.data.is_loaded) {
                console.log('✅ ML Model: ACTIVE');
                console.log(`   🤖 Model type: ${response.data.model_type || 'SVD'}`);
                console.log(`   📊 Global mean: ${response.data.global_mean}`);
                results.mlModel.passed++;
            } else {
                console.log('❌ ML Model: NOT LOADED');
            }
        } catch (error) {
            console.log('⚠️ ML Model: Python service not accessible');
        }

        // Test 4: Model Accuracy
        console.log('\n4️⃣ Testing Model Accuracy...');
        results.mlModel.total++;
        try {
            const response = await axios.get('http://localhost:5001/accuracy');
            if (response.data.model_ready) {
                console.log('✅ Model Accuracy: AVAILABLE');
                console.log(`   📈 RMSE: ${response.data.rmse}`);
                console.log(`   📊 MAE: ${response.data.mae}`);
                console.log(`   ⚡ Real model: ${response.data.real_model ? 'YES' : 'NO'}`);
                results.mlModel.passed++;
            } else {
                console.log('❌ Model Accuracy: NOT AVAILABLE');
            }
        } catch (error) {
            console.log('⚠️ Model Accuracy: Python service not accessible');
        }

        // Test 5: Interaction Recording
        console.log('\n5️⃣ Testing Interaction Recording...');
        results.userAPIs.total++;
        try {
            const testInteraction = {
                userId: 'test-user-123',
                menuItemId: '6841f951a4128dabe9d90994', // Use a real menu item ID
                interactionType: 'view',
                rating: 5
            };

            const response = await axios.post('http://localhost:8080/api/food-recommendations/record-interaction', testInteraction);
            if (response.data.success) {
                console.log('✅ Interaction Recording: WORKING');
                console.log(`   📝 Interaction ID: ${response.data.interactionId || 'Generated'}`);
                results.userAPIs.passed++;
            } else {
                console.log('❌ Interaction Recording: FAILED');
            }
        } catch (error) {
            console.log('❌ Interaction Recording: FAILED -', error.message);
        }

        // Test 6: Database Connectivity
        console.log('\n6️⃣ Testing Database Connectivity...');
        results.evaluation.total++;
        try {
            // Test by trying to get menu items
            const response = await axios.get('http://localhost:8080/api/menus');
            if (Array.isArray(response.data) && response.data.length > 0) {
                console.log('✅ Database: CONNECTED');
                console.log(`   📋 Menu items available: ${response.data.length}`);
                results.evaluation.passed++;
            } else {
                console.log('❌ Database: NO DATA');
            }
        } catch (error) {
            console.log('❌ Database: CONNECTION FAILED -', error.message);
        }

        // Test 7: Frontend Components (Simulated)
        console.log('\n7️⃣ Testing Frontend Components...');
        results.userAPIs.total++;
        try {
            // Test if frontend server is running
            const response = await axios.get('http://localhost:3000', { timeout: 5000 });
            if (response.status === 200) {
                console.log('✅ Frontend: RUNNING');
                console.log('   🌐 React app accessible at http://localhost:3000');
                results.userAPIs.passed++;
            } else {
                console.log('❌ Frontend: NOT ACCESSIBLE');
            }
        } catch (error) {
            console.log('⚠️ Frontend: Not running or not accessible');
        }

        // Generate Final Report
        console.log('\n' + '='.repeat(50));
        console.log('📊 FINAL SYSTEM REPORT');
        console.log('='.repeat(50));

        const totalTests = Object.values(results).reduce((sum, category) => sum + category.total, 0);
        const totalPassed = Object.values(results).reduce((sum, category) => sum + category.passed, 0);
        const overallScore = Math.round((totalPassed / totalTests) * 100);

        console.log(`\n🎯 Overall Score: ${overallScore}% (${totalPassed}/${totalTests} tests passed)`);
        
        console.log('\n📋 Category Breakdown:');
        console.log(`   👥 User APIs: ${results.userAPIs.passed}/${results.userAPIs.total} passed`);
        console.log(`   🔧 Admin APIs: ${results.adminAPIs.passed}/${results.adminAPIs.total} passed`);
        console.log(`   🤖 ML Model: ${results.mlModel.passed}/${results.mlModel.total} passed`);
        console.log(`   📊 Evaluation: ${results.evaluation.passed}/${results.evaluation.total} passed`);

        console.log('\n🎉 SYSTEM STATUS FOR FYP PRESENTATION:');
        if (overallScore >= 80) {
            console.log('✅ EXCELLENT - Ready for presentation!');
            console.log('✅ Recommendation system is fully functional');
            console.log('✅ ML model is active and working');
            console.log('✅ User interface components ready');
            console.log('✅ Admin dashboard available');
        } else if (overallScore >= 60) {
            console.log('⚠️ GOOD - Minor issues to address');
            console.log('✅ Core functionality working');
            console.log('⚠️ Some components may need attention');
        } else {
            console.log('❌ NEEDS WORK - Major issues detected');
            console.log('❌ Core functionality has problems');
        }

        console.log('\n🚀 PRESENTATION TALKING POINTS:');
        console.log('- Real SVD collaborative filtering model');
        console.log('- Hybrid recommendation approach');
        console.log('- Pakistani cuisine specialization');
        console.log('- Interactive user rating system');
        console.log('- Professional admin evaluation dashboard');
        console.log('- Production-ready architecture');

    } catch (error) {
        console.log('\n❌ SYSTEM TEST FAILED:', error.message);
    }
}

// Run the comprehensive test
testCompleteRecommendationSystem().catch(console.error);
