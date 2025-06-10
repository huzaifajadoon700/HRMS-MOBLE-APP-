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

// Table Recommendation Service
export const tableRecommendationService = {
  // Get table recommendations for current user
  getRecommendations: async (params = {}) => {
    try {
      const response = await api.get('/tables/recommendations', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting table recommendations:', error);
      throw error;
    }
  },

  // Get table recommendations for specific user (admin)
  getUserRecommendations: async (userId, params = {}) => {
    try {
      const response = await api.get(`/tables/recommendations/${userId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting user table recommendations:', error);
      throw error;
    }
  },

  // Record user interaction with a table
  recordInteraction: async (interactionData) => {
    try {
      const response = await api.post('/tables/interactions', interactionData);
      return response.data;
    } catch (error) {
      console.error('Error recording table interaction:', error);
      throw error;
    }
  },

  // Get user's table interaction history
  getUserHistory: async (userId, params = {}) => {
    try {
      const response = await api.get(`/tables/history/${userId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting user table history:', error);
      throw error;
    }
  },

  // Get popular tables
  getPopularTables: async (params = {}) => {
    try {
      const response = await api.get('/tables/popular', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting popular tables:', error);
      throw error;
    }
  },

  // Get table analytics (admin)
  getTableAnalytics: async () => {
    try {
      const response = await api.get('/tables/analytics');
      return response.data;
    } catch (error) {
      console.error('Error getting table analytics:', error);
      throw error;
    }
  },

  // Get admin dashboard analytics
  getAdminDashboard: async () => {
    try {
      const response = await api.get('/tables/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error getting admin dashboard:', error);
      throw error;
    }
  },

  // Get table performance metrics
  getTablePerformance: async (tableId, timeRange = '30') => {
    try {
      const response = await api.get(`/tables/admin/performance/${tableId}`, {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting table performance:', error);
      throw error;
    }
  },

  // Refresh ML model cache
  refreshMLCache: async () => {
    try {
      const response = await api.post('/tables/admin/refresh-cache');
      return response.data;
    } catch (error) {
      console.error('Error refreshing ML cache:', error);
      throw error;
    }
  },

  // Update ML model settings
  updateMLSettings: async (settings) => {
    try {
      const response = await api.put('/tables/admin/ml-settings', { settings });
      return response.data;
    } catch (error) {
      console.error('Error updating ML settings:', error);
      throw error;
    }
  }
};

// Table Service (existing functionality)
export const tableService = {
  // Get all tables
  getAllTables: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tables`);
      return response.data;
    } catch (error) {
      console.error('Error getting tables:', error);
      throw error;
    }
  },

  // Check table availability
  checkAvailability: async (params) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tables/availability`, { params });
      return response.data;
    } catch (error) {
      console.error('Error checking table availability:', error);
      throw error;
    }
  },

  // Add new table (admin)
  addTable: async (tableData) => {
    try {
      const formData = new FormData();
      Object.keys(tableData).forEach(key => {
        if (tableData[key] !== null && tableData[key] !== undefined) {
          formData.append(key, tableData[key]);
        }
      });

      const response = await api.post('/tables', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error adding table:', error);
      throw error;
    }
  },

  // Update table (admin)
  updateTable: async (tableId, tableData) => {
    try {
      const formData = new FormData();
      Object.keys(tableData).forEach(key => {
        if (tableData[key] !== null && tableData[key] !== undefined) {
          formData.append(key, tableData[key]);
        }
      });

      const response = await api.put(`/tables/${tableId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating table:', error);
      throw error;
    }
  },

  // Delete table (admin)
  deleteTable: async (tableId) => {
    try {
      const response = await api.delete(`/tables/${tableId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting table:', error);
      throw error;
    }
  }
};

// Utility functions
export const tableUtils = {
  // Format image URL
  getImageUrl: (imagePath) => {
    if (!imagePath) return "/images/placeholder-table.jpg";
    try {
      if (imagePath.startsWith("http")) return imagePath;
      const cleanPath = imagePath.replace(/^\/+/, "");
      return cleanPath.includes("uploads")
        ? `http://localhost:8080/${cleanPath}`
        : `http://localhost:8080/uploads/${cleanPath}`;
    } catch (error) {
      console.error("Error formatting image URL:", error);
      return "/images/placeholder-table.jpg";
    }
  },

  // Get occasion icon
  getOccasionIcon: (occasion) => {
    const icons = {
      'Romantic': '💕',
      'Business': '💼',
      'Family': '👨‍👩‍👧‍👦',
      'Friends': '👥',
      'Celebration': '🎉',
      'Casual': '😊'
    };
    return icons[occasion] || '🍽️';
  },

  // Get ambiance color
  getAmbianceColor: (ambiance) => {
    const colors = {
      'Romantic': '#ff6b9d',
      'Casual': '#4ecdc4',
      'Formal': '#45b7d1',
      'Lively': '#f9ca24',
      'Quiet': '#6c5ce7',
      'Intimate': '#fd79a8',
      'Social': '#00b894'
    };
    return colors[ambiance] || '#74b9ff';
  },

  // Format confidence level
  formatConfidence: (confidence) => {
    const levels = {
      'high': { text: 'High', color: '#00b894', icon: '🎯' },
      'medium': { text: 'Medium', color: '#fdcb6e', icon: '👍' },
      'low': { text: 'Low', color: '#e17055', icon: '🤔' }
    };
    return levels[confidence] || levels['medium'];
  }
};

const exportedServices = {
  tableRecommendationService,
  tableService,
  tableUtils
};

export default exportedServices;
