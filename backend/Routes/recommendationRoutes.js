const express = require('express');
const router = express.Router();
const FoodRecommendationController = require('../Controllers/FoodRecommendationController');
const RecommendationEvaluationController = require('../Controllers/RecommendationEvaluationController');
const { ensureAuthenticated } = require('../Middlewares/Auth');

// Record user interaction with food items (authenticated)
router.post('/interaction', ensureAuthenticated, FoodRecommendationController.recordInteraction);

// Record user interaction with food items (public endpoint for testing)
router.post('/record-interaction', async (req, res) => {
    try {
        await FoodRecommendationController.recordInteraction(req, res);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error recording interaction',
            error: error.message
        });
    }
});

// Get personalized recommendations for a user
router.get('/recommendations/:userId', ensureAuthenticated, FoodRecommendationController.getRecommendations);

// Get user's food interaction history
router.get('/history/:userId', ensureAuthenticated, FoodRecommendationController.getUserHistory);

// Get recommendation system analytics
router.get('/analytics', ensureAuthenticated, FoodRecommendationController.getAnalytics);

// Auto-record interaction when user orders food
router.post('/order-interaction', ensureAuthenticated, async (req, res) => {
    try {
        const { userId, items } = req.body; // items from order

        // Record interaction for each ordered item
        for (const item of items) {
            const interactionData = {
                body: {
                    userId,
                    menuItemId: item.menuItemId || item.menuId, // Handle different field names
                    interactionType: 'order',
                    orderQuantity: item.quantity || 1
                }
            };

            // Create a mock response object
            const mockRes = {
                status: () => ({ json: () => {} }),
                json: () => {}
            };

            await FoodRecommendationController.recordInteraction(interactionData, mockRes);
        }

        res.json({ 
            success: true, 
            message: 'Order interactions recorded',
            itemsProcessed: items.length
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Rate a menu item (convenience endpoint)
router.post('/rate', ensureAuthenticated, async (req, res) => {
    try {
        const { userId, menuItemId, rating } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        const interactionData = {
            body: {
                userId,
                menuItemId,
                interactionType: 'rating',
                rating
            }
        };

        await FoodRecommendationController.recordInteraction(interactionData, res);

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get popular items (no auth required for public viewing)
router.get('/popular', async (req, res) => {
    try {
        const { count = 10 } = req.query;
        
        const popularItems = await FoodRecommendationController.getPopularityBasedRecommendations(parseInt(count));
        
        res.json({
            success: true,
            popularItems,
            count: popularItems.length
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get recommendations for Pakistani cuisine specifically
router.get('/pakistani-recommendations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { count = 10 } = req.query;

        // Get Pakistani cuisine specific recommendations
        const Menu = require('../Models/Menu');
        
        // Try to find Pakistani items with flexible matching
        let pakistaniItems = await Menu.find({
            availability: { $ne: false },
            $or: [
                { cuisine: 'Pakistani' },
                { cuisine: /pakistani/i },
                { category: /pakistani/i },
                { name: /biryani|karahi|kebab|nihari|haleem|pulao|tikka|naan|dal/i },
                { description: /pakistani|spice|curry|aromatic/i }
            ]
        }).sort({
            popularityScore: -1,
            averageRating: -1
        }).limit(parseInt(count));

        // If no Pakistani items found, get all available items
        if (pakistaniItems.length === 0) {
            pakistaniItems = await Menu.find({
                availability: { $ne: false }
            }).sort({
                averageRating: -1
            }).limit(parseInt(count));
        }

        const recommendations = pakistaniItems.map(item => ({
            _id: item._id,
            menuItemId: item._id,
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image,  // ← This was missing!
            category: item.category,
            cuisine: item.cuisine,
            availability: item.availability !== false,
            averageRating: item.averageRating,
            spiceLevel: item.spiceLevel,
            dietaryTags: item.dietaryTags,
            score: item.averageRating || 4.0,
            reason: 'pakistani_cuisine',
            confidence: 'high'
        }));

        res.json({
            success: true,
            recommendations,
            cuisine: 'Pakistani',
            count: recommendations.length
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// **NEW: ACCURACY EVALUATION ENDPOINTS**
// Evaluate recommendation accuracy for a specific user
router.get('/evaluate/:userId', ensureAuthenticated, RecommendationEvaluationController.evaluateRecommendationAccuracy);

// Get system-wide evaluation summary
router.get('/evaluation/system', ensureAuthenticated, RecommendationEvaluationController.getSystemEvaluationSummary);

module.exports = router;
