const UserFoodInteraction = require("../Models/UserFoodInteraction");
const FoodRecommendation = require("../Models/FoodRecommendation");
const Menu = require("../Models/Menu");
const Order = require("../Models/Order");
const Feedback = require("../Models/Feedback");
const mlModelLoader = require("../utils/mlModelLoader");

class FoodRecommendationController {
  // Record user interaction with food items
  static async recordInteraction(req, res) {
    try {
      const { userId, menuItemId, interactionType, rating, orderQuantity } =
        req.body;

      const interaction = new UserFoodInteraction({
        userId,
        menuItemId,
        interactionType,
        rating,
        orderQuantity,
      });

      await interaction.save();

      // Update menu item statistics if it's a rating
      if (interactionType === "rating" && rating) {
        await FoodRecommendationController.updateMenuRating(menuItemId, rating);

        // Save to ML model history
        mlModelLoader.saveUserInteraction(
          userId,
          menuItemId,
          rating,
          interactionType
        );
      }

      res.status(201).json({
        success: true,
        message: "Interaction recorded successfully",
        interaction,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error recording interaction",
        error: error.message,
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
        generatedAt: { $gte: new Date(Date.now() - 3600000) }, // 1 hour cache
      }).populate("recommendedItems.menuItemId");

      if (cachedRecommendations) {
        return res.json({
          success: true,
          recommendations: cachedRecommendations.recommendedItems,
          cached: true,
          generatedAt: cachedRecommendations.generatedAt,
        });
      }

      // Generate new recommendations
      const recommendations =
        await FoodRecommendationController.generateRecommendations(
          userId,
          count
        );

      // Cache the recommendations
      const foodRecommendation = new FoodRecommendation({
        userId,
        recommendedItems: recommendations.items,
        userPreferences: recommendations.preferences,
      });
      await foodRecommendation.save();

      res.json({
        success: true,
        recommendations: recommendations.items,
        preferences: recommendations.preferences,
        cached: false,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error generating recommendations",
        error: error.message,
      });
    }
  }

  // Generate recommendations using hybrid approach
  static async generateRecommendations(userId, count = 10) {
    try {
      // Get user's interaction history (last 30 days)
      const userInteractions = await UserFoodInteraction.find({
        userId,
        timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }).populate("menuItemId");

      if (userInteractions.length === 0) {
        // New user - return popularity-based recommendations
        const popularItems =
          await FoodRecommendationController.getPopularityBasedRecommendations(
            count
          );
        return {
          items: popularItems,
          preferences: { newUser: true, totalInteractions: 0 },
        };
      }

      // Get user preferences
      const userPreferences =
        FoodRecommendationController.analyzeUserPreferences(userInteractions);

      // Generate collaborative filtering recommendations (60%)
      const collaborativeRecs =
        await FoodRecommendationController.getCollaborativeRecommendations(
          userId,
          userPreferences,
          Math.ceil(count * 0.6)
        );

      // Generate content-based recommendations (30%)
      const contentRecs =
        await FoodRecommendationController.getContentBasedRecommendations(
          userPreferences,
          Math.ceil(count * 0.3)
        );

      // Add popular items (10%)
      const popularRecs =
        await FoodRecommendationController.getPopularityBasedRecommendations(
          Math.ceil(count * 0.1)
        );

      // Combine and deduplicate
      const allRecommendations = [
        ...collaborativeRecs,
        ...contentRecs,
        ...popularRecs,
      ];
      const uniqueRecommendations =
        FoodRecommendationController.deduplicateRecommendations(
          allRecommendations
        );

      return {
        items: uniqueRecommendations.slice(0, count),
        preferences: userPreferences,
      };
    } catch (error) {
      console.error("Error generating recommendations:", error);
      // Fallback to popularity-based
      const popularItems =
        await FoodRecommendationController.getPopularityBasedRecommendations(
          count
        );
      return {
        items: popularItems,
        preferences: { fallback: true, error: error.message },
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
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };

    let totalRating = 0;
    let ratingCount = 0;

    interactions.forEach((interaction) => {
      if (interaction.rating) {
        totalRating += interaction.rating;
        ratingCount++;
        preferences.ratingDistribution[interaction.rating]++;
      }

      if (interaction.menuItemId) {
        const item = interaction.menuItemId;

        // Count cuisine preferences
        if (item.cuisine) {
          preferences.preferredCuisines[item.cuisine] =
            (preferences.preferredCuisines[item.cuisine] || 0) + 1;
        }

        // Count category preferences
        if (item.category) {
          preferences.preferredCategories[item.category] =
            (preferences.preferredCategories[item.category] || 0) + 1;
        }

        // Count spice level preferences
        if (item.spiceLevel) {
          preferences.preferredSpiceLevels[item.spiceLevel] =
            (preferences.preferredSpiceLevels[item.spiceLevel] || 0) + 1;
        }

        // Count dietary tag preferences
        if (item.dietaryTags && item.dietaryTags.length > 0) {
          item.dietaryTags.forEach((tag) => {
            preferences.preferredDietaryTags[tag] =
              (preferences.preferredDietaryTags[tag] || 0) + 1;
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

    return popularItems.map((item) => ({
      menuItemId: item._id,
      menuItem: item,
      score: item.averageRating || 3.5,
      reason: "popularity",
      confidence: "medium",
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
      totalRatings: item.totalRatings,
    }));
  }

  // Get collaborative filtering recommendations (simplified)
  static async getCollaborativeRecommendations(userId, userPreferences, count) {
    // Find similar users based on preferences
    const similarUserInteractions = await UserFoodInteraction.find({
      userId: { $ne: userId },
      rating: { $gte: 4 }, // Users who rated items highly
    }).populate("menuItemId");

    // Get highly rated items from similar users
    const recommendedItems = [];
    const seenItems = new Set();

    similarUserInteractions.forEach((interaction) => {
      if (
        !seenItems.has(interaction.menuItemId._id.toString()) &&
        interaction.menuItemId.availability
      ) {
        const item = interaction.menuItemId;
        recommendedItems.push({
          menuItemId: item._id,
          menuItem: item,
          score: interaction.rating,
          reason: "collaborative_filtering",
          confidence: "high",
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
          totalRatings: item.totalRatings,
        });
        seenItems.add(interaction.menuItemId._id.toString());
      }
    });

    return recommendedItems.slice(0, count);
  }

  // Get content-based recommendations
  static async getContentBasedRecommendations(userPreferences, count) {
    const query = { availability: true };

    // Filter by preferred cuisine
    const topCuisine = Object.keys(userPreferences.preferredCuisines)[0];
    if (topCuisine) {
      query.cuisine = topCuisine;
    }

    // Filter by preferred spice level
    const topSpiceLevel = Object.keys(userPreferences.preferredSpiceLevels)[0];
    if (topSpiceLevel) {
      query.spiceLevel = topSpiceLevel;
    }

    const contentItems = await Menu.find(query)
      .sort({ averageRating: -1 })
      .limit(count);

    return contentItems.map((item) => ({
      menuItemId: item._id,
      menuItem: item,
      score: item.averageRating || 3.5,
      reason: "content_based",
      confidence: "medium",
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
      totalRatings: item.totalRatings,
    }));
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
        popularityScore: newAverageRating * Math.log(newTotalRatings + 1),
      });
    } catch (error) {
      console.error("Error updating menu rating:", error);
    }
  }

  // Remove duplicate recommendations
  static deduplicateRecommendations(recommendations) {
    const seen = new Set();
    return recommendations.filter((rec) => {
      const id = rec.menuItemId.toString();
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
        timestamp: { $gte: startDate },
      })
        .populate("menuItemId")
        .sort({ timestamp: -1 });

      const preferences =
        FoodRecommendationController.analyzeUserPreferences(interactions);

      res.json({
        success: true,
        history: interactions,
        preferences,
        historyPeriodDays: days,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching user history",
        error: error.message,
      });
    }
  }

  // Get analytics
  static async getAnalytics(req, res) {
    try {
      const totalUsers = await UserFoodInteraction.distinct(
        "userId"
      ).countDocuments();
      const totalInteractions = await UserFoodInteraction.countDocuments();
      const avgInteractionsPerUser =
        totalUsers > 0 ? totalInteractions / totalUsers : 0;

      const analytics = {
        totalUsers,
        totalInteractions,
        avgInteractionsPerUser: Math.round(avgInteractionsPerUser * 100) / 100,
        systemHealth: "operational",
        lastUpdated: new Date(),
      };

      res.json({
        success: true,
        analytics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching analytics",
        error: error.message,
      });
    }
  }
}

module.exports = FoodRecommendationController;
