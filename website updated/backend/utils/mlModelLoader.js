const fs = require('fs');
const path = require('path');

class MLModelLoader {
    constructor() {
        this.modelPath = path.join(__dirname, '../ml_models');
        this.deploymentConfig = null;
        this.integrationConfig = null;
        this.userHistory = null;
        this.userProfiles = null;
        this.isLoaded = false;
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
            systemHealth: 'operational',
            lastUpdated: new Date().toISOString()
        };
    }
}

// Create singleton instance
const mlModelLoader = new MLModelLoader();

module.exports = mlModelLoader;
