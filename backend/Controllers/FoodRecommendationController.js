const UserFoodInteraction = require('../Models/UserFoodInteraction');
const FoodRecommendation = require('../Models/FoodRecommendation');
const Menu = require('../Models/Menu');
const Order = require('../Models/Order');
const Feedback = require('../Models/Feedback');
const mlModelLoader = require('../utils/mlModelLoader');

class FoodRecommendationController {

    // Record user interaction with food items
    static async recordInteraction(req, res) {
        try {
            const { userId, menuItemId, interactionType, rating, orderQuantity } = req.body;

            const interaction = new UserFoodInteraction({
                userId,
                menuItemId,
                interactionType,
                rating,
                orderQuantity
            });

            await interaction.save();

            // Update menu item statistics if it's a rating
            if (interactionType === 'rating' && rating) {
                await FoodRecommendationController.updateMenuRating(menuItemId, rating);

                // Save to ML model history
                mlModelLoader.saveUserInteraction(userId, menuItemId, rating, interactionType);
            }

            res.status(201).json({
                success: true,
                message: 'Interaction recorded successfully',
                interaction
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error recording interaction',
                error: error.message
            });
        }
    }

    // Get personalized food recommendations
    static async getRecommendations(req, res) {
        try {
            const { userId } = req.params;
            const { count = 10 } = req.query;

            // Check for cached recommendations
            const cachedRecommendations = await FoodRecommendation.findOne({
                userId,
                generatedAt: { $gte: new Date(Date.now() - 3600000) } // 1 hour cache
            }).populate('recommendedItems.menuItemId');

            if (cachedRecommendations) {
                return res.json({
                    success: true,
                    recommendations: cachedRecommendations.recommendedItems,
                    cached: true,
                    generatedAt: cachedRecommendations.generatedAt
                });
            }

            // Generate new recommendations
            const recommendations = await FoodRecommendationController.generateRecommendations(userId, count);

            // Cache the recommendations
            const foodRecommendation = new FoodRecommendation({
                userId,
                recommendedItems: recommendations.items,
                userPreferences: recommendations.preferences
            });
            await foodRecommendation.save();

            res.json({
                success: true,
                recommendations: recommendations.items,
                preferences: recommendations.preferences,
                algorithmBreakdown: recommendations.algorithmBreakdown,
                cached: false,
                userStats: {
                    totalInteractions: await UserFoodInteraction.countDocuments({ userId }),
                    recentRatings: await UserFoodInteraction.countDocuments({
                        userId,
                        rating: { $exists: true },
                        timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                    })
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error generating recommendations',
                error: error.message
            });
        }
    }

    // Generate recommendations using advanced hybrid approach with SVD
    static async generateRecommendations(userId, count = 10) {
        try {
            // Get user's interaction history (last 30 days)
            const userInteractions = await UserFoodInteraction.find({
                userId,
                timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }).populate('menuItemId');

            // Get all available menu items for candidate generation
            const allMenuItems = await Menu.find({ availability: true });

            if (userInteractions.length === 0) {
                // New user - return popularity-based recommendations
                const popularItems = await FoodRecommendationController.getPopularityBasedRecommendations(count);
                return {
                    items: popularItems,
                    preferences: { newUser: true, totalInteractions: 0, algorithm: 'popularity' }
                };
            }

            // Get user preferences
            const userPreferences = FoodRecommendationController.analyzeUserPreferences(userInteractions);

            // **NEW: SVD-based collaborative filtering (50%)**
            const svdRecs = await FoodRecommendationController.getSVDRecommendations(userId, allMenuItems, Math.ceil(count * 0.5));

            // Enhanced collaborative filtering (25%)
            const collaborativeRecs = await FoodRecommendationController.getCollaborativeRecommendations(userId, userPreferences, Math.ceil(count * 0.25));

            // Enhanced content-based recommendations (20%)
            const contentRecs = await FoodRecommendationController.getContentBasedRecommendations(userPreferences, Math.ceil(count * 0.2));

            // Popular items fallback (5%)
            const popularRecs = await FoodRecommendationController.getPopularityBasedRecommendations(Math.ceil(count * 0.05));

            // Combine with weighted scoring
            const allRecommendations = [
                ...svdRecs.map(item => ({ ...item, weight: 0.5 })),
                ...collaborativeRecs.map(item => ({ ...item, weight: 0.25 })),
                ...contentRecs.map(item => ({ ...item, weight: 0.2 })),
                ...popularRecs.map(item => ({ ...item, weight: 0.05 }))
            ];

            // Advanced deduplication with score combination
            const uniqueRecommendations = FoodRecommendationController.advancedDeduplication(allRecommendations);

            return {
                items: uniqueRecommendations.slice(0, count),
                preferences: { ...userPreferences, algorithm: 'hybrid_svd' },
                algorithmBreakdown: {
                    svd: svdRecs.length,
                    collaborative: collaborativeRecs.length,
                    contentBased: contentRecs.length,
                    popularity: popularRecs.length
                }
            };

        } catch (error) {
            console.error('Error generating recommendations:', error);
            // Fallback to popularity-based
            const popularItems = await FoodRecommendationController.getPopularityBasedRecommendations(count);
            return {
                items: popularItems,
                preferences: { fallback: true, error: error.message, algorithm: 'fallback' }
            };
        }
    }

    // Analyze user preferences from interaction history
    static analyzeUserPreferences(interactions) {
        const preferences = {
            avgRating: 0,
            totalInteractions: interactions.length,
            preferredCuisines: {},
            preferredCategories: {},
            preferredSpiceLevels: {},
            preferredDietaryTags: {},
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };

        let totalRating = 0;
        let ratingCount = 0;

        interactions.forEach(interaction => {
            if (interaction.rating) {
                totalRating += interaction.rating;
                ratingCount++;
                preferences.ratingDistribution[interaction.rating]++;
            }

            if (interaction.menuItemId) {
                const item = interaction.menuItemId;

                // Count cuisine preferences
                if (item.cuisine) {
                    preferences.preferredCuisines[item.cuisine] = (preferences.preferredCuisines[item.cuisine] || 0) + 1;
                }

                // Count category preferences
                if (item.category) {
                    preferences.preferredCategories[item.category] = (preferences.preferredCategories[item.category] || 0) + 1;
                }

                // Count spice level preferences
                if (item.spiceLevel) {
                    preferences.preferredSpiceLevels[item.spiceLevel] = (preferences.preferredSpiceLevels[item.spiceLevel] || 0) + 1;
                }

                // Count dietary tag preferences
                if (item.dietaryTags && item.dietaryTags.length > 0) {
                    item.dietaryTags.forEach(tag => {
                        preferences.preferredDietaryTags[tag] = (preferences.preferredDietaryTags[tag] || 0) + 1;
                    });
                }
            }
        });

        preferences.avgRating = ratingCount > 0 ? totalRating / ratingCount : 0;

        return preferences;
    }

    // Get popularity-based recommendations
    static async getPopularityBasedRecommendations(count) {
        const popularItems = await Menu.find({ availability: true })
            .sort({ popularityScore: -1, averageRating: -1, totalRatings: -1 })
            .limit(count);

        return popularItems.map(item => ({
            menuItemId: item._id,
            menuItem: item,
            score: item.averageRating || 3.5,
            reason: 'popularity',
            confidence: 'medium',
            // Include item properties directly for easier access
            _id: item._id,
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            image: item.image,
            availability: item.availability,
            cuisine: item.cuisine,
            spiceLevel: item.spiceLevel,
            dietaryTags: item.dietaryTags,
            preparationTime: item.preparationTime,
            averageRating: item.averageRating,
            totalRatings: item.totalRatings
        }));
    }

    // **NEW: SVD-based collaborative filtering recommendations**
    static async getSVDRecommendations(userId, candidateItems, count) {
        try {
            // Use the trained SVD model for predictions
            const svdRecommendations = await mlModelLoader.generateSVDRecommendations(userId, candidateItems, count);

            return svdRecommendations.map(item => ({
                menuItemId: item._id,
                menuItem: item,
                score: item.predictedRating || item.score,
                reason: 'svd_collaborative_filtering',
                confidence: item.confidence || 'high',
                predictedRating: item.predictedRating,
                // Include item properties directly for easier access
                _id: item._id,
                name: item.name,
                description: item.description,
                price: item.price,
                category: item.category,
                image: item.image,
                availability: item.availability,
                cuisine: item.cuisine,
                spiceLevel: item.spiceLevel,
                dietaryTags: item.dietaryTags,
                preparationTime: item.preparationTime,
                averageRating: item.averageRating,
                totalRatings: item.totalRatings
            }));
        } catch (error) {
            console.error('Error in SVD recommendations:', error);
            return []; // Fallback to other methods
        }
    }

    // Enhanced collaborative filtering recommendations
    static async getCollaborativeRecommendations(userId, userPreferences, count) {
        try {
            // Find users with similar rating patterns
            const userAvgRating = userPreferences.avgRating || 4.5;
            const ratingTolerance = 0.5;

            // Find similar users based on rating patterns and preferences
            const similarUserInteractions = await UserFoodInteraction.find({
                userId: { $ne: userId },
                rating: {
                    $gte: Math.max(1, userAvgRating - ratingTolerance),
                    $lte: Math.min(5, userAvgRating + ratingTolerance)
                }
            }).populate('menuItemId');

            // Group by user and calculate similarity
            const userSimilarity = new Map();
            similarUserInteractions.forEach(interaction => {
                const otherUserId = interaction.userId.toString();
                if (!userSimilarity.has(otherUserId)) {
                    userSimilarity.set(otherUserId, { interactions: [], avgRating: 0 });
                }
                userSimilarity.get(otherUserId).interactions.push(interaction);
            });

            // Calculate average ratings for similar users
            userSimilarity.forEach((userData, otherUserId) => {
                const avgRating = userData.interactions.reduce((sum, int) => sum + int.rating, 0) / userData.interactions.length;
                userData.avgRating = avgRating;
            });

            // Get recommendations from most similar users
            const recommendedItems = [];
            const seenItems = new Set();

            // Sort users by similarity (rating pattern similarity)
            const sortedSimilarUsers = Array.from(userSimilarity.entries())
                .sort((a, b) => Math.abs(a[1].avgRating - userAvgRating) - Math.abs(b[1].avgRating - userAvgRating))
                .slice(0, 10); // Top 10 similar users

            sortedSimilarUsers.forEach(([otherUserId, userData]) => {
                userData.interactions.forEach(interaction => {
                    if (interaction.rating >= 4 &&
                        !seenItems.has(interaction.menuItemId._id.toString()) &&
                        interaction.menuItemId.availability) {

                        const item = interaction.menuItemId;
                        const similarityScore = 1 - Math.abs(userData.avgRating - userAvgRating) / 4; // Normalize to 0-1

                        recommendedItems.push({
                            menuItemId: item._id,
                            menuItem: item,
                            score: interaction.rating * similarityScore, // Weight by user similarity
                            reason: 'enhanced_collaborative_filtering',
                            confidence: similarityScore > 0.8 ? 'high' : 'medium',
                            similarityScore: similarityScore,
                            // Include item properties directly for easier access
                            _id: item._id,
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            category: item.category,
                            image: item.image,
                            availability: item.availability,
                            cuisine: item.cuisine,
                            spiceLevel: item.spiceLevel,
                            dietaryTags: item.dietaryTags,
                            preparationTime: item.preparationTime,
                            averageRating: item.averageRating,
                            totalRatings: item.totalRatings
                        });
                        seenItems.add(interaction.menuItemId._id.toString());
                    }
                });
            });

            // Sort by weighted score and return top recommendations
            return recommendedItems
                .sort((a, b) => b.score - a.score)
                .slice(0, count);

        } catch (error) {
            console.error('Error in collaborative filtering:', error);
            return []; // Fallback
        }
    }

    // Enhanced content-based recommendations with multiple features
    static async getContentBasedRecommendations(userPreferences, count) {
        try {
            // Build sophisticated query based on user preferences
            const baseQuery = { availability: true };

            // Get user's preferred cuisines (sorted by frequency)
            const preferredCuisines = Object.entries(userPreferences.preferredCuisines || {})
                .sort((a, b) => b[1] - a[1])
                .map(([cuisine]) => cuisine);

            // Get user's preferred categories
            const preferredCategories = Object.entries(userPreferences.preferredCategories || {})
                .sort((a, b) => b[1] - a[1])
                .map(([category]) => category);

            // Get user's preferred spice levels
            const preferredSpiceLevels = Object.entries(userPreferences.preferredSpiceLevels || {})
                .sort((a, b) => b[1] - a[1])
                .map(([spiceLevel]) => spiceLevel);

            // Get user's preferred dietary tags
            const preferredDietaryTags = Object.entries(userPreferences.preferredDietaryTags || {})
                .sort((a, b) => b[1] - a[1])
                .map(([tag]) => tag);

            // Create multiple queries for different preference combinations
            const queries = [];

            // Query 1: Exact cuisine + spice level match
            if (preferredCuisines.length > 0 && preferredSpiceLevels.length > 0) {
                queries.push({
                    ...baseQuery,
                    cuisine: { $in: preferredCuisines.slice(0, 2) },
                    spiceLevel: { $in: preferredSpiceLevels.slice(0, 2) }
                });
            }

            // Query 2: Cuisine + category match
            if (preferredCuisines.length > 0 && preferredCategories.length > 0) {
                queries.push({
                    ...baseQuery,
                    cuisine: { $in: preferredCuisines.slice(0, 3) },
                    category: { $in: preferredCategories.slice(0, 2) }
                });
            }

            // Query 3: Dietary tags match
            if (preferredDietaryTags.length > 0) {
                queries.push({
                    ...baseQuery,
                    dietaryTags: { $in: preferredDietaryTags }
                });
            }

            // Query 4: Fallback - just preferred cuisines
            if (preferredCuisines.length > 0) {
                queries.push({
                    ...baseQuery,
                    cuisine: { $in: preferredCuisines }
                });
            }

            // Execute all queries and combine results
            const allResults = [];
            for (let i = 0; i < queries.length; i++) {
                const results = await Menu.find(queries[i])
                    .sort({ averageRating: -1, totalRatings: -1 })
                    .limit(Math.ceil(count / queries.length) + 5);

                allResults.push(...results.map(item => ({
                    item,
                    matchScore: this.calculateContentMatchScore(item, userPreferences),
                    queryIndex: i
                })));
            }

            // Remove duplicates and sort by match score
            const uniqueItems = new Map();
            allResults.forEach(result => {
                const itemId = result.item._id.toString();
                if (!uniqueItems.has(itemId) || uniqueItems.get(itemId).matchScore < result.matchScore) {
                    uniqueItems.set(itemId, result);
                }
            });

            // Convert to recommendation format
            const recommendations = Array.from(uniqueItems.values())
                .sort((a, b) => b.matchScore - a.matchScore)
                .slice(0, count)
                .map(result => {
                    const item = result.item;
                    return {
                        menuItemId: item._id,
                        menuItem: item,
                        score: result.matchScore,
                        reason: 'enhanced_content_based',
                        confidence: result.matchScore > 0.8 ? 'high' : result.matchScore > 0.6 ? 'medium' : 'low',
                        matchScore: result.matchScore,
                        // Include item properties directly for easier access
                        _id: item._id,
                        name: item.name,
                        description: item.description,
                        price: item.price,
                        category: item.category,
                        image: item.image,
                        availability: item.availability,
                        cuisine: item.cuisine,
                        spiceLevel: item.spiceLevel,
                        dietaryTags: item.dietaryTags,
                        preparationTime: item.preparationTime,
                        averageRating: item.averageRating,
                        totalRatings: item.totalRatings
                    };
                });

            return recommendations;

        } catch (error) {
            console.error('Error in content-based recommendations:', error);
            return []; // Fallback
        }
    }

    // Calculate content match score based on user preferences
    static calculateContentMatchScore(item, userPreferences) {
        let score = 0;
        let maxScore = 0;

        // Cuisine match (weight: 0.3)
        maxScore += 0.3;
        const cuisinePrefs = userPreferences.preferredCuisines || {};
        if (item.cuisine && cuisinePrefs[item.cuisine]) {
            const cuisineFreq = cuisinePrefs[item.cuisine];
            const totalCuisineInteractions = Object.values(cuisinePrefs).reduce((sum, freq) => sum + freq, 0);
            score += 0.3 * (cuisineFreq / totalCuisineInteractions);
        }

        // Category match (weight: 0.25)
        maxScore += 0.25;
        const categoryPrefs = userPreferences.preferredCategories || {};
        if (item.category && categoryPrefs[item.category]) {
            const categoryFreq = categoryPrefs[item.category];
            const totalCategoryInteractions = Object.values(categoryPrefs).reduce((sum, freq) => sum + freq, 0);
            score += 0.25 * (categoryFreq / totalCategoryInteractions);
        }

        // Spice level match (weight: 0.2)
        maxScore += 0.2;
        const spicePrefs = userPreferences.preferredSpiceLevels || {};
        if (item.spiceLevel && spicePrefs[item.spiceLevel]) {
            const spiceFreq = spicePrefs[item.spiceLevel];
            const totalSpiceInteractions = Object.values(spicePrefs).reduce((sum, freq) => sum + freq, 0);
            score += 0.2 * (spiceFreq / totalSpiceInteractions);
        }

        // Dietary tags match (weight: 0.15)
        maxScore += 0.15;
        const dietaryPrefs = userPreferences.preferredDietaryTags || {};
        if (item.dietaryTags && item.dietaryTags.length > 0) {
            let dietaryScore = 0;
            item.dietaryTags.forEach(tag => {
                if (dietaryPrefs[tag]) {
                    dietaryScore += dietaryPrefs[tag];
                }
            });
            const totalDietaryInteractions = Object.values(dietaryPrefs).reduce((sum, freq) => sum + freq, 0);
            if (totalDietaryInteractions > 0) {
                score += 0.15 * Math.min(1, dietaryScore / totalDietaryInteractions);
            }
        }

        // Quality bonus (weight: 0.1)
        maxScore += 0.1;
        if (item.averageRating && item.totalRatings) {
            const qualityScore = (item.averageRating / 5) * Math.min(1, item.totalRatings / 10);
            score += 0.1 * qualityScore;
        }

        // Normalize score
        return maxScore > 0 ? score / maxScore : 0;
    }

    // Update menu item rating statistics
    static async updateMenuRating(menuItemId, newRating) {
        try {
            const menuItem = await Menu.findById(menuItemId);
            if (!menuItem) return;

            const currentTotal = menuItem.averageRating * menuItem.totalRatings;
            const newTotalRatings = menuItem.totalRatings + 1;
            const newAverageRating = (currentTotal + newRating) / newTotalRatings;

            await Menu.findByIdAndUpdate(menuItemId, {
                averageRating: Math.round(newAverageRating * 100) / 100,
                totalRatings: newTotalRatings,
                popularityScore: newAverageRating * Math.log(newTotalRatings + 1)
            });

        } catch (error) {
            console.error('Error updating menu rating:', error);
        }
    }

    // Advanced deduplication with score combination
    static advancedDeduplication(recommendations) {
        const itemMap = new Map();

        recommendations.forEach(rec => {
            const itemId = rec.menuItemId?.toString() || rec._id?.toString();
            if (!itemId) return;

            if (itemMap.has(itemId)) {
                // Combine scores from different algorithms
                const existing = itemMap.get(itemId);
                const combinedScore = (existing.score * existing.weight) + (rec.score * rec.weight);
                const combinedWeight = existing.weight + rec.weight;

                existing.score = combinedScore / combinedWeight;
                existing.weight = combinedWeight;
                existing.reasons = existing.reasons || [];
                existing.reasons.push(rec.reason);
                existing.confidence = this.combineConfidence(existing.confidence, rec.confidence);
            } else {
                itemMap.set(itemId, {
                    ...rec,
                    reasons: [rec.reason],
                    weight: rec.weight || 1
                });
            }
        });

        // Sort by combined score and return
        return Array.from(itemMap.values())
            .sort((a, b) => b.score - a.score)
            .map(rec => {
                // Clean up the recommendation object
                const { weight, reasons, ...cleanRec } = rec;
                return {
                    ...cleanRec,
                    reason: reasons.length > 1 ? 'hybrid_multiple' : reasons[0],
                    algorithmCount: reasons.length
                };
            });
    }

    // Combine confidence levels
    static combineConfidence(conf1, conf2) {
        const confidenceMap = { low: 1, medium: 2, high: 3 };
        const reverseMap = { 1: 'low', 2: 'medium', 3: 'high' };

        const avg = (confidenceMap[conf1] + confidenceMap[conf2]) / 2;
        return reverseMap[Math.round(avg)];
    }

    // Remove duplicate recommendations (legacy method)
    static deduplicateRecommendations(recommendations) {
        const seen = new Set();
        return recommendations.filter(rec => {
            const id = rec.menuItemId?.toString() || rec._id?.toString();
            if (seen.has(id)) {
                return false;
            }
            seen.add(id);
            return true;
        });
    }

    // Get user's food interaction history
    static async getUserHistory(req, res) {
        try {
            const { userId } = req.params;
            const { days = 30 } = req.query;

            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

            const interactions = await UserFoodInteraction.find({
                userId,
                timestamp: { $gte: startDate }
            }).populate('menuItemId').sort({ timestamp: -1 });

            const preferences = FoodRecommendationController.analyzeUserPreferences(interactions);

            res.json({
                success: true,
                history: interactions,
                preferences,
                historyPeriodDays: days
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching user history',
                error: error.message
            });
        }
    }

    // Get Pakistani cuisine specific recommendations
    static async getPakistaniRecommendations(req, res) {
        try {
            const { userId } = req.params;
            const { count = 10 } = req.query;

            // Get Pakistani cuisine items
            const pakistaniItems = await Menu.find({
                availability: true,
                $or: [
                    { cuisine: { $regex: /pakistani/i } },
                    { category: { $regex: /pakistani/i } },
                    { name: { $regex: /(biryani|karahi|kebab|nihari|haleem|pulao|tikka|naan|dal)/i } },
                    { description: { $regex: /(pakistani|spice|curry|aromatic)/i } }
                ]
            }).limit(parseInt(count) * 2); // Get more to allow for scoring

            // If user is logged in, get their preferences for better recommendations
            let userPreferences = {};
            if (userId && userId !== 'guest') {
                const userInteractions = await UserFoodInteraction.find({
                    userId,
                    timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                }).populate('menuItemId');

                if (userInteractions.length > 0) {
                    userPreferences = FoodRecommendationController.analyzeUserPreferences(userInteractions);
                }
            }

            // Score Pakistani items based on user preferences
            const scoredItems = pakistaniItems.map(item => {
                let score = item.averageRating || 4.5;
                let confidence = 'medium';
                let reason = 'pakistani_cuisine';

                // Boost score based on user preferences
                if (userPreferences.preferredSpiceLevels && userPreferences.preferredSpiceLevels[item.spiceLevel]) {
                    score += 0.5;
                    confidence = 'high';
                    reason = 'pakistani_personalized';
                }

                if (userPreferences.preferredCategories && userPreferences.preferredCategories[item.category]) {
                    score += 0.3;
                    confidence = 'high';
                }

                return {
                    ...item.toObject(),
                    score: Math.min(5, score),
                    reason,
                    confidence,
                    culturalMatch: true
                };
            });

            // Sort by score and return
            const recommendations = scoredItems
                .sort((a, b) => b.score - a.score)
                .slice(0, parseInt(count));

            res.json({
                success: true,
                recommendations,
                userPreferences: userId !== 'guest' ? userPreferences : null,
                message: `${recommendations.length} Pakistani cuisine recommendations`,
                culturalAdaptation: true
            });

        } catch (error) {
            console.error('Error getting Pakistani recommendations:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching Pakistani recommendations',
                error: error.message
            });
        }
    }

    // Get analytics
    static async getAnalytics(req, res) {
        try {
            const totalUsers = await UserFoodInteraction.distinct('userId').countDocuments();
            const totalInteractions = await UserFoodInteraction.countDocuments();
            const avgInteractionsPerUser = totalUsers > 0 ? totalInteractions / totalUsers : 0;

            const analytics = {
                totalUsers,
                totalInteractions,
                avgInteractionsPerUser: Math.round(avgInteractionsPerUser * 100) / 100,
                systemHealth: 'operational',
                lastUpdated: new Date()
            };

            res.json({
                success: true,
                analytics
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching analytics',
                error: error.message
            });
        }
    }
}

module.exports = FoodRecommendationController;
