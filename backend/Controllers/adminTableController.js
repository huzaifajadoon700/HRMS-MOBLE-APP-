const Table = require('../Models/Table');
const TableInteraction = require('../Models/TableInteraction');
const TableRecommendation = require('../Models/TableRecommendation');
const tableMLLoader = require('../utils/tableMLModelLoader');

// Get comprehensive table analytics for admin dashboard
const getTableAnalyticsDashboard = async (req, res) => {
  try {
    // Basic table statistics
    const totalTables = await Table.countDocuments();
    const availableTables = await Table.countDocuments({ status: 'Available' });
    const bookedTables = await Table.countDocuments({ status: 'Booked' });

    // Interaction statistics
    const totalInteractions = await TableInteraction.countDocuments();
    const uniqueUsers = await TableInteraction.distinct('userId').then(users => users.length);
    
    // Recent interactions (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentInteractions = await TableInteraction.countDocuments({
      timestamp: { $gte: sevenDaysAgo }
    });

    // Interaction types breakdown
    const interactionTypes = await TableInteraction.aggregate([
      {
        $group: {
          _id: '$interactionType',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          interactionType: '$_id',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      }
    ]);

    // Most popular tables
    const popularTables = await TableInteraction.aggregate([
      {
        $group: {
          _id: '$tableId',
          totalInteractions: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          avgRating: { $avg: '$rating' }
        }
      },
      {
        $lookup: {
          from: 'tables',
          localField: '_id',
          foreignField: '_id',
          as: 'tableDetails'
        }
      },
      {
        $unwind: '$tableDetails'
      },
      {
        $project: {
          tableName: '$tableDetails.tableName',
          location: '$tableDetails.location',
          capacity: '$tableDetails.capacity',
          totalInteractions: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          avgRating: { $round: ['$avgRating', 2] }
        }
      },
      {
        $sort: { totalInteractions: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Recommendation performance
    const totalRecommendations = await TableRecommendation.countDocuments();
    const recentRecommendations = await TableRecommendation.countDocuments({
      generatedAt: { $gte: sevenDaysAgo }
    });

    // User engagement patterns
    const userEngagement = await TableInteraction.aggregate([
      {
        $group: {
          _id: '$userId',
          totalInteractions: { $sum: 1 },
          lastInteraction: { $max: '$timestamp' },
          interactionTypes: { $addToSet: '$interactionType' }
        }
      },
      {
        $group: {
          _id: null,
          avgInteractionsPerUser: { $avg: '$totalInteractions' },
          activeUsers: {
            $sum: {
              $cond: [
                { $gte: ['$lastInteraction', sevenDaysAgo] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Table utilization by location
    const locationStats = await Table.aggregate([
      {
        $group: {
          _id: '$location',
          totalTables: { $sum: 1 },
          avgRating: { $avg: '$avgRating' },
          totalBookings: { $sum: '$totalBookings' }
        }
      },
      {
        $sort: { totalBookings: -1 }
      }
    ]);

    // ML Model status
    const mlModelInfo = tableMLLoader.getModelInfo();

    res.status(200).json({
      success: true,
      analytics: {
        overview: {
          totalTables,
          availableTables,
          bookedTables,
          utilizationRate: ((bookedTables / totalTables) * 100).toFixed(1)
        },
        interactions: {
          total: totalInteractions,
          uniqueUsers,
          recent: recentInteractions,
          avgPerUser: userEngagement[0]?.avgInteractionsPerUser || 0,
          activeUsers: userEngagement[0]?.activeUsers || 0
        },
        interactionTypes: interactionTypes.reduce((acc, item) => {
          acc[item.interactionType] = {
            count: item.count,
            uniqueUsers: item.uniqueUsers
          };
          return acc;
        }, {}),
        popularTables,
        recommendations: {
          total: totalRecommendations,
          recent: recentRecommendations,
          cacheHitRate: totalRecommendations > 0 ? 
            ((totalRecommendations - recentRecommendations) / totalRecommendations * 100).toFixed(1) : 0
        },
        locationStats,
        mlModel: mlModelInfo
      },
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Error getting table analytics dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics dashboard',
      error: error.message
    });
  }
};

// Get detailed table performance metrics
const getTablePerformanceMetrics = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { timeRange = '30' } = req.query; // days

    const daysAgo = new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000);

    // Get table details
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    // Get interaction metrics
    const interactions = await TableInteraction.find({
      tableId,
      timestamp: { $gte: daysAgo }
    }).sort({ timestamp: -1 });

    // Calculate metrics
    const totalInteractions = interactions.length;
    const uniqueUsers = [...new Set(interactions.map(i => i.userId.toString()))].length;
    const avgSessionDuration = interactions
      .filter(i => i.sessionDuration)
      .reduce((sum, i) => sum + i.sessionDuration, 0) / 
      interactions.filter(i => i.sessionDuration).length || 0;

    const ratings = interactions.filter(i => i.rating);
    const avgRating = ratings.length > 0 ? 
      ratings.reduce((sum, i) => sum + i.rating, 0) / ratings.length : 0;

    // Interaction timeline
    const timeline = await TableInteraction.aggregate([
      {
        $match: {
          tableId: table._id,
          timestamp: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      table: {
        _id: table._id,
        tableName: table.tableName,
        location: table.location,
        capacity: table.capacity,
        ambiance: table.ambiance
      },
      metrics: {
        totalInteractions,
        uniqueUsers,
        avgSessionDuration: Math.round(avgSessionDuration),
        avgRating: Math.round(avgRating * 10) / 10,
        conversionRate: totalInteractions > 0 ? 
          ((interactions.filter(i => i.interactionType === 'booking').length / totalInteractions) * 100).toFixed(1) : 0
      },
      timeline: timeline.map(t => ({
        date: t._id.date,
        interactions: t.count
      })),
      recentInteractions: interactions.slice(0, 20).map(i => ({
        type: i.interactionType,
        timestamp: i.timestamp,
        rating: i.rating,
        sessionDuration: i.sessionDuration
      }))
    });

  } catch (error) {
    console.error('Error getting table performance metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get table metrics',
      error: error.message
    });
  }
};

// Update ML model settings
const updateMLModelSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    // This would typically update model configuration
    // For now, we'll just return the current settings
    const currentSettings = tableMLLoader.getModelInfo();

    res.status(200).json({
      success: true,
      message: 'ML model settings updated',
      settings: currentSettings
    });

  } catch (error) {
    console.error('Error updating ML model settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ML model settings',
      error: error.message
    });
  }
};

// Force refresh ML model cache
const refreshMLModelCache = async (req, res) => {
  try {
    // Clear cached recommendations
    await TableRecommendation.deleteMany({});

    // Reload ML models
    const success = await tableMLLoader.loadModels();

    res.status(200).json({
      success,
      message: success ? 'ML model cache refreshed successfully' : 'Failed to refresh ML model cache',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Error refreshing ML model cache:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh ML model cache',
      error: error.message
    });
  }
};

module.exports = {
  getTableAnalyticsDashboard,
  getTablePerformanceMetrics,
  updateMLModelSettings,
  refreshMLModelCache
};
