const fs = require('fs');
const path = require('path');
const axios = require('axios');

class MLModelLoader {
    constructor() {
        this.modelPath = path.join(__dirname, '../ml_models');
        this.deploymentConfig = null;
        this.integrationConfig = null;
        this.userHistory = null;
        this.userProfiles = null;
        this.svdModel = null;
        this.userMappings = null;
        this.recipeMappings = null;
        this.isLoaded = false;
        this.modelReady = false;
        this.pythonModelService = 'http://localhost:5001';
        this.realModelLoaded = false;
    }

    async loadModels() {
        try {
            console.log('🤖 Loading ML models and configurations...');

            // Load deployment configuration
            const deploymentPath = path.join(this.modelPath, 'deployment_package.json');
            if (fs.existsSync(deploymentPath)) {
                this.deploymentConfig = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
                console.log('✅ Deployment config loaded');
            }

            // Load HRMS integration configuration
            const integrationPath = path.join(this.modelPath, 'hrms_integration_package.json');
            if (fs.existsSync(integrationPath)) {
                this.integrationConfig = JSON.parse(fs.readFileSync(integrationPath, 'utf8'));
                console.log('✅ HRMS integration config loaded');
            }

            // Load user history
            const historyPath = path.join(this.modelPath, 'user_history.json');
            if (fs.existsSync(historyPath)) {
                this.userHistory = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
                console.log('✅ User history loaded');
            } else {
                this.userHistory = {};
                console.log('📝 Created empty user history');
            }

            // Load user profiles
            const profilesPath = path.join(this.modelPath, 'user_profiles.json');
            if (fs.existsSync(profilesPath)) {
                this.userProfiles = JSON.parse(fs.readFileSync(profilesPath, 'utf8'));
                console.log('✅ User profiles loaded');
            } else {
                this.userProfiles = {};
                console.log('📝 Created empty user profiles');
            }

            // Load SVD model mappings (critical for real ML recommendations)
            const mappingsPath = path.join(this.modelPath, 'recommendation_mappings.pkl');
            const modelPath = path.join(this.modelPath, 'complete_food_recommendation_model.pkl');

            if (fs.existsSync(mappingsPath) && fs.existsSync(modelPath)) {
                console.log('✅ Real SVD model files found!');
                // Try to connect to Python model service
                await this.initializeRealSVDModel();
            } else {
                console.log('⚠️ Real SVD model files not found, using mock implementation');
                this.initializeMockSVDModel();
                this.modelReady = true;
            }

            this.isLoaded = true;
            console.log('🎉 ML models and configurations loaded successfully!');

            // Log model performance
            if (this.deploymentConfig && this.deploymentConfig.model_info) {
                const perf = this.deploymentConfig.model_info.performance;
                console.log(`📊 Model Performance: RMSE=${perf.rmse}, MAE=${perf.mae}`);
            }

            return true;
        } catch (error) {
            console.error('❌ Error loading ML models:', error);
            this.isLoaded = false;
            return false;
        }
    }

    getModelInfo() {
        if (!this.isLoaded) {
            return { error: 'Models not loaded' };
        }

        return {
            loaded: this.isLoaded,
            modelInfo: this.deploymentConfig?.model_info || {},
            historySystem: this.deploymentConfig?.history_system || {},
            pakistaniCuisine: this.integrationConfig?.pakistani_cuisine_adaptations || {},
            userCount: Object.keys(this.userHistory).length,
            profileCount: Object.keys(this.userProfiles).length
        };
    }

    // Get Pakistani cuisine recommendations
    getPakistaniRecommendations(count = 10) {
        if (!this.integrationConfig) {
            return this.getDefaultPakistaniItems(count);
        }

        const popularDishes = this.integrationConfig.pakistani_cuisine_adaptations?.popular_dishes || [];
        
        return popularDishes.slice(0, count).map((dish, index) => ({
            name: dish,
            score: 4.8 - (index * 0.1), // Decreasing scores
            reason: 'pakistani_cuisine',
            confidence: 'high',
            spiceLevel: 'medium',
            dietaryTags: ['halal'],
            cuisine: 'Pakistani'
        }));
    }

    getDefaultPakistaniItems(count = 10) {
        const defaultItems = [
            { name: 'Chicken Biryani', score: 4.8, spiceLevel: 'medium' },
            { name: 'Mutton Karahi', score: 4.7, spiceLevel: 'hot' },
            { name: 'Beef Nihari', score: 4.6, spiceLevel: 'medium' },
            { name: 'Chicken Haleem', score: 4.5, spiceLevel: 'mild' },
            { name: 'Seekh Kebab', score: 4.4, spiceLevel: 'hot' },
            { name: 'Chicken Pulao', score: 4.3, spiceLevel: 'mild' },
            { name: 'Mutton Korma', score: 4.2, spiceLevel: 'medium' },
            { name: 'Dal Makhani', score: 4.1, spiceLevel: 'mild' },
            { name: 'Garlic Naan', score: 4.0, spiceLevel: 'mild' },
            { name: 'Mango Lassi', score: 3.9, spiceLevel: 'mild' }
        ];

        return defaultItems.slice(0, count).map(item => ({
            ...item,
            reason: 'pakistani_cuisine',
            confidence: 'high',
            dietaryTags: ['halal'],
            cuisine: 'Pakistani'
        }));
    }

    // Analyze user preferences based on Pakistani cuisine
    analyzeUserPreferences(userId) {
        const userProfile = this.userProfiles[userId];
        const userHistory = this.userHistory[userId] || [];

        if (!userProfile && userHistory.length === 0) {
            return {
                newUser: true,
                preferences: {
                    cuisine: 'Pakistani',
                    spiceLevel: 'medium',
                    dietaryTags: ['halal'],
                    avgRating: 0,
                    totalInteractions: 0
                }
            };
        }

        // Default Pakistani preferences
        const preferences = {
            cuisine: 'Pakistani',
            spiceLevel: 'medium',
            dietaryTags: ['halal'],
            avgRating: userProfile?.avg_rating || 0,
            totalInteractions: userProfile?.total_interactions || userHistory.length,
            profileStrength: userProfile?.profile_strength || 0
        };

        return { newUser: false, preferences };
    }

    // Save user interaction to history
    saveUserInteraction(userId, menuItemId, rating, interactionType = 'rating') {
        try {
            if (!this.userHistory[userId]) {
                this.userHistory[userId] = [];
            }

            const interaction = {
                recipe_id: menuItemId,
                rating: rating,
                timestamp: new Date().toISOString(),
                date: new Date().toISOString().split('T')[0],
                interaction_type: interactionType
            };

            this.userHistory[userId].push(interaction);

            // Keep only last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            this.userHistory[userId] = this.userHistory[userId].filter(
                interaction => new Date(interaction.timestamp) > thirtyDaysAgo
            );

            // Save to file
            const historyPath = path.join(this.modelPath, 'user_history.json');
            fs.writeFileSync(historyPath, JSON.stringify(this.userHistory, null, 2));

            console.log(`💾 Saved interaction for user ${userId}: ${menuItemId} rated ${rating}`);
            return true;
        } catch (error) {
            console.error('Error saving user interaction:', error);
            return false;
        }
    }

    // Update user profile
    updateUserProfile(userId, preferences) {
        try {
            this.userProfiles[userId] = {
                ...preferences,
                last_updated: new Date().toISOString()
            };

            // Save to file
            const profilesPath = path.join(this.modelPath, 'user_profiles.json');
            fs.writeFileSync(profilesPath, JSON.stringify(this.userProfiles, null, 2));

            console.log(`👤 Updated profile for user ${userId}`);
            return true;
        } catch (error) {
            console.error('Error updating user profile:', error);
            return false;
        }
    }

    // Initialize real SVD model using Python service
    async initializeRealSVDModel() {
        try {
            console.log('🔄 Connecting to Python model service...');

            // Check if Python service is running
            const healthResponse = await axios.get(`${this.pythonModelService}/health`);
            if (healthResponse.data.status === 'healthy') {
                console.log('✅ Python model service is running');

                // Load the model
                const loadResponse = await axios.post(`${this.pythonModelService}/load_model`);
                if (loadResponse.data.success) {
                    console.log('✅ Real SVD model loaded successfully!');
                    console.log(`📊 Model info:`, loadResponse.data.model_info);

                    this.realModelLoaded = true;
                    this.modelReady = true;

                    // Get accuracy metrics
                    const accuracyResponse = await axios.get(`${this.pythonModelService}/accuracy`);
                    if (accuracyResponse.data.success) {
                        console.log('📈 Real Model Accuracy:', accuracyResponse.data.accuracy_metrics);
                    }

                    return true;
                } else {
                    throw new Error('Failed to load model in Python service');
                }
            } else {
                throw new Error('Python service not healthy');
            }
        } catch (error) {
            console.log('⚠️ Failed to connect to Python model service:', error.message);
            console.log('🔄 Falling back to mock SVD model...');
            this.initializeMockSVDModel();
            this.modelReady = true;
            this.realModelLoaded = false;
            return false;
        }
    }

    // Initialize mock SVD model for demonstration
    initializeMockSVDModel() {
        // This simulates the trained SVD model from Google Colab
        // In production, you'd load the actual model weights
        this.svdModel = {
            components: 25,
            userFactors: new Map(), // User latent factors
            itemFactors: new Map(), // Item latent factors
            globalMean: 4.66, // Average rating from Food.com dataset
            userMeans: new Map(), // User rating averages
            itemMeans: new Map()  // Item rating averages
        };

        // Initialize some sample factors for demonstration
        this.initializeSampleFactors();
    }

    initializeSampleFactors() {
        // Sample user and item factors (normally loaded from trained model)
        const sampleUsers = ['user1', 'user2', 'user3'];
        const sampleItems = ['item1', 'item2', 'item3'];

        sampleUsers.forEach(userId => {
            // Random latent factors (normally from trained SVD)
            const factors = Array.from({length: 25}, () => Math.random() * 0.1 - 0.05);
            this.svdModel.userFactors.set(userId, factors);
            this.svdModel.userMeans.set(userId, 4.5 + Math.random() * 0.5);
        });

        sampleItems.forEach(itemId => {
            const factors = Array.from({length: 25}, () => Math.random() * 0.1 - 0.05);
            this.svdModel.itemFactors.set(itemId, factors);
            this.svdModel.itemMeans.set(itemId, 4.4 + Math.random() * 0.6);
        });
    }

    // Advanced SVD-based recommendation prediction
    async predictRating(userId, itemId) {
        if (!this.modelReady) {
            return 4.5; // Fallback
        }

        // Use real model if available
        if (this.realModelLoaded) {
            try {
                const response = await axios.post(`${this.pythonModelService}/predict`, {
                    user_id: userId,
                    recipe_id: itemId
                });

                if (response.data.success) {
                    return response.data.predicted_rating;
                }
            } catch (error) {
                console.log('Real model prediction failed, using mock:', error.message);
            }
        }

        // Fallback to mock model
        if (!this.svdModel) {
            return 4.5;
        }

        const userFactors = this.svdModel.userFactors.get(userId);
        const itemFactors = this.svdModel.itemFactors.get(itemId);

        if (!userFactors || !itemFactors) {
            // Cold start: use global and user/item means
            const userMean = this.svdModel.userMeans.get(userId) || this.svdModel.globalMean;
            const itemMean = this.svdModel.itemMeans.get(itemId) || this.svdModel.globalMean;
            return (userMean + itemMean) / 2;
        }

        // SVD prediction: global_mean + user_bias + item_bias + dot_product(user_factors, item_factors)
        const userMean = this.svdModel.userMeans.get(userId) || this.svdModel.globalMean;
        const itemMean = this.svdModel.itemMeans.get(itemId) || this.svdModel.globalMean;

        // Dot product of latent factors
        let dotProduct = 0;
        for (let i = 0; i < Math.min(userFactors.length, itemFactors.length); i++) {
            dotProduct += userFactors[i] * itemFactors[i];
        }

        const prediction = this.svdModel.globalMean +
                          (userMean - this.svdModel.globalMean) +
                          (itemMean - this.svdModel.globalMean) +
                          dotProduct;

        // Clamp to valid rating range
        return Math.max(1, Math.min(5, prediction));
    }

    // Generate SVD-based recommendations for a user
    async generateSVDRecommendations(userId, candidateItems, count = 10) {
        if (!this.modelReady) {
            return []; // Fallback to other recommendation methods
        }

        // Use real model if available
        if (this.realModelLoaded) {
            try {
                const candidateIds = candidateItems.map(item => item._id || item.id);
                const response = await axios.post(`${this.pythonModelService}/recommendations`, {
                    user_id: userId,
                    candidate_recipes: candidateIds,
                    n_recommendations: count
                });

                if (response.data.success) {
                    const recommendations = response.data.recommendations;

                    // Map back to full item objects
                    return recommendations.map(rec => {
                        const item = candidateItems.find(item =>
                            (item._id || item.id) === rec.recipe_id
                        );

                        return {
                            ...item,
                            score: rec.predicted_rating,
                            reason: 'real_svd_collaborative_filtering',
                            confidence: rec.confidence,
                            predictedRating: rec.predicted_rating
                        };
                    }).filter(item => item._id || item.id); // Remove items not found
                }
            } catch (error) {
                console.log('Real model recommendations failed, using mock:', error.message);
            }
        }

        // Fallback to mock model
        const predictions = [];
        for (const item of candidateItems) {
            const predictedRating = await this.predictRating(userId, item._id || item.id);
            predictions.push({
                itemId: item._id || item.id,
                item: item,
                predictedRating: predictedRating,
                confidence: this.calculateConfidence(userId, item._id || item.id)
            });
        }

        // Sort by predicted rating and return top recommendations
        return predictions
            .sort((a, b) => b.predictedRating - a.predictedRating)
            .slice(0, count)
            .map(pred => ({
                ...pred.item,
                score: pred.predictedRating,
                reason: this.realModelLoaded ? 'real_svd_collaborative_filtering' : 'mock_svd_collaborative_filtering',
                confidence: pred.confidence,
                predictedRating: pred.predictedRating
            }));
    }

    calculateConfidence(userId, itemId) {
        // Calculate confidence based on user/item interaction history
        const userHistory = this.userHistory[userId] || [];
        const userInteractionCount = userHistory.length;

        if (userInteractionCount < 5) return 'low';
        if (userInteractionCount < 15) return 'medium';
        return 'high';
    }

    // Get system analytics
    getAnalytics() {
        const totalUsers = Object.keys(this.userHistory).length;
        const totalProfiles = Object.keys(this.userProfiles).length;

        let totalInteractions = 0;
        Object.values(this.userHistory).forEach(history => {
            totalInteractions += history.length;
        });

        return {
            totalUsers,
            totalProfiles,
            totalInteractions,
            avgInteractionsPerUser: totalUsers > 0 ? totalInteractions / totalUsers : 0,
            modelPerformance: this.deploymentConfig?.model_info?.performance || {},
            svdModelReady: this.modelReady,
            realModelLoaded: this.realModelLoaded,
            modelType: this.realModelLoaded ? 'Real Trained SVD' : 'Mock SVD',
            systemHealth: 'operational',
            lastUpdated: new Date().toISOString()
        };
    }
}

// Create singleton instance
const mlModelLoader = new MLModelLoader();

module.exports = mlModelLoader;
