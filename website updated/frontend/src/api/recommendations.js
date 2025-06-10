import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Recommendation API Service
export const recommendationAPI = {
  // Get personalized recommendations for a user
  getRecommendations: async (userId, count = 10) => {
    try {
      const response = await api.get(`/food-recommendations/recommendations/${userId}?count=${count}`);
      return response.data;
    } catch (error) {
      console.error('Personalized recommendations endpoint not available, falling back to popular items:', error);

      // Fallback to popular items if personalized recommendations fail
      return await recommendationAPI.getPopularItems(count);
    }
  },

  // Get Pakistani cuisine specific recommendations
  getPakistaniRecommendations: async (userId, count = 10) => {
    try {
      // Try the specific endpoint first
      const response = await api.get(`/food-recommendations/pakistani-recommendations/${userId}?count=${count}`);
      return response.data;
    } catch (error) {
      console.error('Pakistani recommendations endpoint not available, falling back to menu filter:', error);

      // Fallback: Get all menu items and filter for Pakistani cuisine
      try {
        const menuResponse = await axios.get(`${API_BASE_URL}/menus`);
        const pakistaniItems = menuResponse.data
          .filter(item => {
            const name = item.name?.toLowerCase() || '';
            const description = item.description?.toLowerCase() || '';
            const category = item.category?.toLowerCase() || '';
            const cuisine = item.cuisine?.toLowerCase() || '';

            const isPakistani = (
              cuisine === 'pakistani' ||
              category.includes('pakistani') ||
              name.includes('biryani') ||
              name.includes('karahi') ||
              name.includes('kebab') ||
              name.includes('nihari') ||
              name.includes('haleem') ||
              name.includes('pulao') ||
              name.includes('tikka') ||
              name.includes('naan') ||
              name.includes('dal') ||
              name.includes('chicken') ||
              name.includes('mutton') ||
              name.includes('beef') ||
              description.includes('pakistani') ||
              description.includes('spice') ||
              description.includes('curry') ||
              description.includes('rice') ||
              description.includes('aromatic')
            );

            if (isPakistani) {
              console.log(`Pakistani item found: ${item.name}`);
            }

            return isPakistani;
          })
          .slice(0, count)
          .map(item => ({
            _id: item._id,
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image,
            category: item.category,
            cuisine: item.cuisine,
            availability: item.availability !== false,
            averageRating: item.averageRating,
            spiceLevel: item.spiceLevel,
            dietaryTags: item.dietaryTags,
            score: item.averageRating || 4.5,
            reason: 'pakistani_cuisine',
            confidence: 'high'
          }));

        // If no Pakistani items found, return all items as fallback
        if (pakistaniItems.length === 0) {
          const allItems = menuResponse.data
            .slice(0, count)
            .map(item => ({
              _id: item._id,
              name: item.name,
              description: item.description,
              price: item.price,
              image: item.image,
              category: item.category,
              cuisine: item.cuisine,
              availability: item.availability !== false,
              averageRating: item.averageRating,
              spiceLevel: item.spiceLevel,
              dietaryTags: item.dietaryTags,
              score: item.averageRating || 4.5,
              reason: 'popular_choice',
              confidence: 'medium'
            }));

          return {
            success: true,
            recommendations: allItems,
            message: 'Popular menu items'
          };
        }

        return {
          success: true,
          recommendations: pakistaniItems,
          message: 'Pakistani cuisine recommendations'
        };
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw fallbackError;
      }
    }
  },

  // Get popular items (no auth required)
  getPopularItems: async (count = 10) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/food-recommendations/popular?count=${count}`);
      return response.data;
    } catch (error) {
      console.error('Popular items endpoint not available, falling back to menu items:', error);

      // Fallback: Get all menu items and sort by rating/popularity
      try {
        const menuResponse = await axios.get(`${API_BASE_URL}/menus`);
        const popularItems = menuResponse.data
          .filter(item => item.availability !== false)
          .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
          .slice(0, count)
          .map(item => ({
            _id: item._id,
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image,
            category: item.category,
            cuisine: item.cuisine,
            availability: item.availability !== false,
            averageRating: item.averageRating,
            spiceLevel: item.spiceLevel,
            dietaryTags: item.dietaryTags,
            score: item.averageRating || 4.5,
            reason: 'popularity',
            confidence: 'medium'
          }));

        return {
          success: true,
          popularItems: popularItems,
          recommendations: popularItems,
          message: 'Popular menu items'
        };
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw fallbackError;
      }
    }
  },

  // Record user interaction with food items
  recordInteraction: async (userId, menuItemId, interactionType, rating = null, orderQuantity = 1) => {
    try {
      const response = await api.post('/food-recommendations/interaction', {
        userId,
        menuItemId,
        interactionType,
        rating,
        orderQuantity
      });
      return response.data;
    } catch (error) {
      console.error('Error recording interaction:', error);
      throw error;
    }
  },

  // Rate a menu item
  rateMenuItem: async (userId, menuItemId, rating) => {
    try {
      const response = await api.post('/food-recommendations/rate', {
        userId,
        menuItemId,
        rating
      });
      return response.data;
    } catch (error) {
      console.error('Error rating menu item:', error);
      throw error;
    }
  },

  // Get user's food interaction history
  getUserHistory: async (userId, days = 30) => {
    try {
      const response = await api.get(`/food-recommendations/history/${userId}?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user history:', error);
      throw error;
    }
  },

  // Get recommendation system analytics (admin only)
  getAnalytics: async () => {
    try {
      const response = await api.get('/food-recommendations/analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  // Get ML system info
  getMLInfo: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ml-info`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ML info:', error);
      throw error;
    }
  },

  // Record order interactions (called automatically when user places order)
  recordOrderInteractions: async (userId, items) => {
    try {
      const response = await api.post('/food-recommendations/order-interaction', {
        userId,
        items
      });
      return response.data;
    } catch (error) {
      console.error('Error recording order interactions:', error);
      throw error;
    }
  }
};

// Helper functions for recommendation system
export const recommendationHelpers = {
  // Get user ID from localStorage
  getCurrentUserId: () => {
    try {
      // First try direct userId from localStorage (primary method)
      const directUserId = localStorage.getItem('userId');
      if (directUserId) {
        return directUserId;
      }

      // Try user data objects
      let userStr = localStorage.getItem('user');
      if (!userStr) {
        userStr = localStorage.getItem('userData');
      }
      if (!userStr) {
        userStr = localStorage.getItem('currentUser');
      }

      if (userStr) {
        const user = JSON.parse(userStr);
        return user._id || user.id || user.userId;
      }

      // Fallback: try to get from token payload
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload.userId || payload.id || payload._id;
        } catch (e) {
          console.log('Could not decode token payload');
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  },

  // Check if user is logged in
  isUserLoggedIn: () => {
    const token = localStorage.getItem('token');
    const userId = recommendationHelpers.getCurrentUserId();
    return !!(token && userId);
  },

  // Format spice level for display
  formatSpiceLevel: (spiceLevel) => {
    const spiceLevels = {
      'mild': { emoji: '🌶️', text: 'Mild', color: '#4CAF50' },
      'medium': { emoji: '🌶️🌶️', text: 'Medium', color: '#FF9800' },
      'hot': { emoji: '🌶️🌶️🌶️', text: 'Hot', color: '#FF5722' },
      'very_hot': { emoji: '🌶️🌶️🌶️🌶️', text: 'Very Hot', color: '#D32F2F' }
    };
    return spiceLevels[spiceLevel] || spiceLevels['medium'];
  },

  // Format dietary tags for display
  formatDietaryTags: (tags) => {
    const tagMap = {
      'halal': { emoji: '🥩', text: 'Halal', color: '#4CAF50' },
      'vegetarian': { emoji: '🌱', text: 'Vegetarian', color: '#8BC34A' },
      'vegan': { emoji: '🌿', text: 'Vegan', color: '#689F38' },
      'gluten-free': { emoji: '🌾', text: 'Gluten-Free', color: '#FFC107' },
      'dairy-free': { emoji: '🥛', text: 'Dairy-Free', color: '#03A9F4' }
    };
    
    return tags.map(tag => tagMap[tag] || { emoji: '🏷️', text: tag, color: '#9E9E9E' });
  },

  // Format confidence level
  formatConfidence: (confidence) => {
    const confidenceMap = {
      'high': { text: 'Highly Recommended', color: '#4CAF50', icon: '🎯' },
      'medium': { text: 'Recommended', color: '#FF9800', icon: '👍' },
      'low': { text: 'Suggested', color: '#9E9E9E', icon: '💡' }
    };
    return confidenceMap[confidence] || confidenceMap['medium'];
  },

  // Format recommendation reason
  formatReason: (reason) => {
    const reasonMap = {
      'collaborative_filtering': 'Based on similar users',
      'content_based': 'Based on your preferences',
      'popularity': 'Popular choice',
      'hybrid': 'AI-powered recommendation',
      'pakistani_cuisine': 'Pakistani cuisine specialty'
    };
    return reasonMap[reason] || 'Recommended for you';
  },

  // Calculate star rating display
  getStarRating: (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return {
      full: fullStars,
      half: hasHalfStar ? 1 : 0,
      empty: emptyStars,
      rating: rating.toFixed(1)
    };
  }
};

export default recommendationAPI;
