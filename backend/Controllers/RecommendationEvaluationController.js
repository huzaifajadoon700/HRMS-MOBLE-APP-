const UserFoodInteraction = require('../Models/UserFoodInteraction');
const FoodRecommendation = require('../Models/FoodRecommendation');
const Menu = require('../Models/Menu');
const FoodRecommendationController = require('./FoodRecommendationController');

class RecommendationEvaluationController {

    // **REAL ACCURACY MEASUREMENT FOR FYP**
    static async evaluateRecommendationAccuracy(req, res) {
        try {
            const { userId, testPeriodDays = 7 } = req.query;
            
            // Get evaluation results
            const evaluation = await RecommendationEvaluationController.performAccuracyEvaluation(userId, testPeriodDays);
            
            res.json({
                success: true,
                evaluation,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error evaluating recommendation accuracy',
                error: error.message
            });
        }
    }

    // Perform comprehensive accuracy evaluation
    static async performAccuracyEvaluation(userId = null, testPeriodDays = 7) {
        try {
            const endDate = new Date();
            const startDate = new Date(endDate.getTime() - testPeriodDays * 24 * 60 * 60 * 1000);
            const trainingEndDate = new Date(startDate.getTime() - 1 * 24 * 60 * 60 * 1000); // 1 day gap

            let userFilter = {};
            if (userId) {
                userFilter.userId = userId;
            }

            // Get training data (before test period)
            const trainingInteractions = await UserFoodInteraction.find({
                ...userFilter,
                timestamp: { $lt: trainingEndDate }
            }).populate('menuItemId');

            // Get test data (during test period)
            const testInteractions = await UserFoodInteraction.find({
                ...userFilter,
                timestamp: { $gte: startDate, $lte: endDate },
                rating: { $exists: true, $gte: 1 } // Only rated interactions
            }).populate('menuItemId');

            if (testInteractions.length === 0) {
                return {
                    error: 'No test interactions found for evaluation period',
                    testPeriodDays,
                    trainingInteractions: trainingInteractions.length
                };
            }

            // Evaluate different metrics
            const metrics = {
                precision: await this.calculatePrecision(trainingInteractions, testInteractions),
                recall: await this.calculateRecall(trainingInteractions, testInteractions),
                ndcg: await this.calculateNDCG(trainingInteractions, testInteractions),
                hitRate: await this.calculateHitRate(trainingInteractions, testInteractions),
                coverage: await this.calculateCoverage(trainingInteractions, testInteractions),
                diversity: await this.calculateDiversity(trainingInteractions, testInteractions)
            };

            // Calculate F1 score
            metrics.f1Score = metrics.precision > 0 && metrics.recall > 0 
                ? 2 * (metrics.precision * metrics.recall) / (metrics.precision + metrics.recall)
                : 0;

            // Overall accuracy score
            metrics.overallAccuracy = (metrics.precision + metrics.recall + metrics.ndcg + metrics.hitRate) / 4;

            return {
                metrics,
                testPeriod: { startDate, endDate, days: testPeriodDays },
                dataStats: {
                    trainingInteractions: trainingInteractions.length,
                    testInteractions: testInteractions.length,
                    uniqueUsers: userId ? 1 : new Set(testInteractions.map(i => i.userId.toString())).size,
                    uniqueItems: new Set(testInteractions.map(i => i.menuItemId._id.toString())).size
                },
                evaluation: this.getAccuracyGrade(metrics.overallAccuracy)
            };

        } catch (error) {
            console.error('Error in accuracy evaluation:', error);
            throw error;
        }
    }

    // Calculate Precision@K (how many recommended items were actually liked)
    static async calculatePrecision(trainingInteractions, testInteractions, k = 10) {
        try {
            const userGroups = this.groupInteractionsByUser(testInteractions);
            let totalPrecision = 0;
            let userCount = 0;

            for (const [userId, userTestInteractions] of userGroups.entries()) {
                // Generate recommendations based on training data
                const recommendations = await FoodRecommendationController.generateRecommendations(userId, k);
                const recommendedItemIds = new Set(
                    recommendations.items.map(item => item._id?.toString() || item.menuItemId?.toString())
                );

                // Find which recommended items were actually liked (rating >= 4)
                const likedItems = userTestInteractions
                    .filter(interaction => interaction.rating >= 4)
                    .map(interaction => interaction.menuItemId._id.toString());

                const relevantRecommendations = likedItems.filter(itemId => recommendedItemIds.has(itemId));
                const precision = recommendedItemIds.size > 0 ? relevantRecommendations.length / recommendedItemIds.size : 0;

                totalPrecision += precision;
                userCount++;
            }

            return userCount > 0 ? totalPrecision / userCount : 0;
        } catch (error) {
            console.error('Error calculating precision:', error);
            return 0;
        }
    }

    // Calculate Recall@K (how many liked items were recommended)
    static async calculateRecall(trainingInteractions, testInteractions, k = 10) {
        try {
            const userGroups = this.groupInteractionsByUser(testInteractions);
            let totalRecall = 0;
            let userCount = 0;

            for (const [userId, userTestInteractions] of userGroups.entries()) {
                // Generate recommendations
                const recommendations = await FoodRecommendationController.generateRecommendations(userId, k);
                const recommendedItemIds = new Set(
                    recommendations.items.map(item => item._id?.toString() || item.menuItemId?.toString())
                );

                // Find actually liked items
                const likedItems = userTestInteractions
                    .filter(interaction => interaction.rating >= 4)
                    .map(interaction => interaction.menuItemId._id.toString());

                if (likedItems.length === 0) continue;

                const relevantRecommendations = likedItems.filter(itemId => recommendedItemIds.has(itemId));
                const recall = relevantRecommendations.length / likedItems.length;

                totalRecall += recall;
                userCount++;
            }

            return userCount > 0 ? totalRecall / userCount : 0;
        } catch (error) {
            console.error('Error calculating recall:', error);
            return 0;
        }
    }

    // Calculate NDCG (Normalized Discounted Cumulative Gain)
    static async calculateNDCG(trainingInteractions, testInteractions, k = 10) {
        try {
            const userGroups = this.groupInteractionsByUser(testInteractions);
            let totalNDCG = 0;
            let userCount = 0;

            for (const [userId, userTestInteractions] of userGroups.entries()) {
                const recommendations = await FoodRecommendationController.generateRecommendations(userId, k);
                
                // Create relevance scores based on actual ratings
                const relevanceMap = new Map();
                userTestInteractions.forEach(interaction => {
                    relevanceMap.set(interaction.menuItemId._id.toString(), interaction.rating);
                });

                // Calculate DCG
                let dcg = 0;
                recommendations.items.forEach((item, index) => {
                    const itemId = item._id?.toString() || item.menuItemId?.toString();
                    const relevance = relevanceMap.get(itemId) || 0;
                    dcg += relevance / Math.log2(index + 2); // +2 because log2(1) = 0
                });

                // Calculate IDCG (Ideal DCG)
                const sortedRelevances = Array.from(relevanceMap.values()).sort((a, b) => b - a);
                let idcg = 0;
                for (let i = 0; i < Math.min(k, sortedRelevances.length); i++) {
                    idcg += sortedRelevances[i] / Math.log2(i + 2);
                }

                const ndcg = idcg > 0 ? dcg / idcg : 0;
                totalNDCG += ndcg;
                userCount++;
            }

            return userCount > 0 ? totalNDCG / userCount : 0;
        } catch (error) {
            console.error('Error calculating NDCG:', error);
            return 0;
        }
    }

    // Calculate Hit Rate (percentage of users who got at least one relevant recommendation)
    static async calculateHitRate(trainingInteractions, testInteractions, k = 10) {
        try {
            const userGroups = this.groupInteractionsByUser(testInteractions);
            let hits = 0;
            let userCount = 0;

            for (const [userId, userTestInteractions] of userGroups.entries()) {
                const recommendations = await FoodRecommendationController.generateRecommendations(userId, k);
                const recommendedItemIds = new Set(
                    recommendations.items.map(item => item._id?.toString() || item.menuItemId?.toString())
                );

                const likedItems = userTestInteractions
                    .filter(interaction => interaction.rating >= 4)
                    .map(interaction => interaction.menuItemId._id.toString());

                const hasHit = likedItems.some(itemId => recommendedItemIds.has(itemId));
                if (hasHit) hits++;
                userCount++;
            }

            return userCount > 0 ? hits / userCount : 0;
        } catch (error) {
            console.error('Error calculating hit rate:', error);
            return 0;
        }
    }

    // Calculate Coverage (percentage of items that can be recommended)
    static async calculateCoverage(trainingInteractions, testInteractions) {
        try {
            const allMenuItems = await Menu.find({ availability: true });
            const totalItems = allMenuItems.length;

            // Get unique recommended items across all users
            const userGroups = this.groupInteractionsByUser(testInteractions);
            const recommendedItems = new Set();

            for (const [userId] of userGroups.entries()) {
                const recommendations = await FoodRecommendationController.generateRecommendations(userId, 20);
                recommendations.items.forEach(item => {
                    const itemId = item._id?.toString() || item.menuItemId?.toString();
                    recommendedItems.add(itemId);
                });
            }

            return totalItems > 0 ? recommendedItems.size / totalItems : 0;
        } catch (error) {
            console.error('Error calculating coverage:', error);
            return 0;
        }
    }

    // Calculate Diversity (how diverse are the recommendations)
    static async calculateDiversity(trainingInteractions, testInteractions) {
        try {
            const userGroups = this.groupInteractionsByUser(testInteractions);
            let totalDiversity = 0;
            let userCount = 0;

            for (const [userId] of userGroups.entries()) {
                const recommendations = await FoodRecommendationController.generateRecommendations(userId, 10);
                
                // Calculate category diversity
                const categories = new Set();
                const cuisines = new Set();
                
                recommendations.items.forEach(item => {
                    if (item.category) categories.add(item.category);
                    if (item.cuisine) cuisines.add(item.cuisine);
                });

                // Diversity score based on unique categories and cuisines
                const diversity = (categories.size + cuisines.size) / (2 * recommendations.items.length);
                totalDiversity += Math.min(1, diversity); // Cap at 1
                userCount++;
            }

            return userCount > 0 ? totalDiversity / userCount : 0;
        } catch (error) {
            console.error('Error calculating diversity:', error);
            return 0;
        }
    }

    // Helper: Group interactions by user
    static groupInteractionsByUser(interactions) {
        const userGroups = new Map();
        interactions.forEach(interaction => {
            const userId = interaction.userId.toString();
            if (!userGroups.has(userId)) {
                userGroups.set(userId, []);
            }
            userGroups.get(userId).push(interaction);
        });
        return userGroups;
    }

    // Get accuracy grade based on overall score
    static getAccuracyGrade(score) {
        if (score >= 0.9) return { grade: 'A+', description: 'Excellent' };
        if (score >= 0.8) return { grade: 'A', description: 'Very Good' };
        if (score >= 0.7) return { grade: 'B+', description: 'Good' };
        if (score >= 0.6) return { grade: 'B', description: 'Above Average' };
        if (score >= 0.5) return { grade: 'C+', description: 'Average' };
        if (score >= 0.4) return { grade: 'C', description: 'Below Average' };
        return { grade: 'D', description: 'Needs Improvement' };
    }

    // Get system-wide evaluation summary
    static async getSystemEvaluationSummary(req, res) {
        try {
            const evaluation = await this.performAccuracyEvaluation(null, 7);
            
            res.json({
                success: true,
                systemEvaluation: evaluation,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error getting system evaluation',
                error: error.message
            });
        }
    }
}

module.exports = RecommendationEvaluationController;
