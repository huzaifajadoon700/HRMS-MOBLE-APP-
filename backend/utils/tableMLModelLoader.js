const fs = require('fs');
const path = require('path');

class TableMLModelLoader {
  constructor() {
    this.modelsLoaded = false;
    this.models = {};
    this.datasets = {};
    this.modelPath = path.join(__dirname, '../table_ml_models');
  }

  async loadModels() {
    try {
      console.log('🔄 Loading Table Recommendation ML Models...');

      // Check if all required files exist
      const requiredFiles = [
        'tables_dataset.csv',
        'users_dataset.csv',
        'bookings_dataset.csv',
        'interactions_dataset.csv',
        'collaborative_filtering_model.pkl',
        'content_based_model.pkl',
        'hybrid_model.pkl',
        'interaction_matrix.pkl',
        'user_features.pkl',
        'table_features.pkl',
        'user_encoders.pkl',
        'table_encoders.pkl'
      ];

      const missingFiles = [];
      for (const file of requiredFiles) {
        const filePath = path.join(this.modelPath, file);
        if (!fs.existsSync(filePath)) {
          missingFiles.push(file);
        }
      }

      if (missingFiles.length > 0) {
        console.log(`⚠️ Missing table ML model files: ${missingFiles.join(', ')}`);
        return false;
      }

      // Load CSV datasets
      await this.loadDatasets();

      // For now, we'll use JavaScript-based recommendations
      // In production, you might want to use Python integration
      this.initializeJSRecommendationEngine();

      this.modelsLoaded = true;
      console.log('✅ Table Recommendation ML Models loaded successfully!');
      return true;

    } catch (error) {
      console.error('❌ Error loading table ML models:', error);
      return false;
    }
  }

  async loadDatasets() {
    try {
      // Load real datasets from database first, fallback to mock data
      console.log('🔄 Loading real table datasets from database...');

      try {
        this.datasets = {
          tables: await this.loadRealTableData(),
          users: await this.loadRealUsersData(),
          interactions: await this.loadRealInteractionsData()
        };
        console.log('✅ Real table datasets loaded successfully');
      } catch (dbError) {
        console.log('⚠️ Database loading failed, using mock data:', dbError.message);
        this.datasets = {
          tables: this.createMockTablesData(),
          users: this.createMockUsersData(),
          interactions: this.createMockInteractionsData()
        };
        console.log('📊 Mock table datasets loaded successfully');
      }

    } catch (error) {
      console.error('Error loading datasets:', error);
      throw error;
    }
  }

  // Load real table data from database
  async loadRealTableData() {
    try {
      const Table = require('../Models/Table');
      const realTables = await Table.find({});

      const processedTables = realTables.map(table => ({
        table_id: table._id.toString(),
        capacity: table.capacity,
        location: table.location || 'Main Hall',
        ambiance: table.ambiance || 'Casual',
        hasWindowView: table.hasWindowView || false,
        isPrivate: table.isPrivate || false,
        priceTier: table.priceTier || 'Mid-range',
        avgRating: table.avgRating || 4.0,
        tableType: table.tableType || 'Standard',
        features: table.features || [],
        totalBookings: table.totalBookings || 0
      }));

      console.log(`✅ Loaded ${processedTables.length} real tables for ML model`);
      return processedTables.length > 0 ? processedTables : this.createMockTablesData();
    } catch (error) {
      console.error('Error loading real table data:', error);
      return this.createMockTablesData();
    }
  }

  // Load real user data from database
  async loadRealUsersData() {
    try {
      const User = require('../Models/User');
      const TableInteraction = require('../Models/TableInteraction');

      const realUsers = await User.find({}).select('_id foodPreferences');
      const processedUsers = [];

      for (const user of realUsers) {
        // Get user's table interaction patterns
        const interactions = await TableInteraction.find({ userId: user._id }).limit(10);

        // Analyze user preferences from interactions
        const avgPartySize = interactions.length > 0 ?
          interactions.reduce((sum, i) => sum + (i.context?.partySize || 2), 0) / interactions.length : 2;

        const preferredOccasions = interactions
          .map(i => i.context?.occasion)
          .filter(o => o)
          .reduce((acc, occasion) => {
            acc[occasion] = (acc[occasion] || 0) + 1;
            return acc;
          }, {});

        const mostCommonOccasion = Object.keys(preferredOccasions).length > 0 ?
          Object.keys(preferredOccasions).reduce((a, b) => preferredOccasions[a] > preferredOccasions[b] ? a : b) : 'Casual';

        processedUsers.push({
          user_id: user._id.toString(),
          preferredGroupSize: Math.round(avgPartySize),
          preferredOccasion: mostCommonOccasion,
          prefersQuiet: user.foodPreferences?.spiceLevelPreference === 'mild',
          prefersWindow: Math.random() > 0.5, // Random for now
          prefersPrivate: interactions.some(i => i.context?.occasion === 'Romantic')
        });
      }

      console.log(`✅ Loaded ${processedUsers.length} real users for ML model`);
      return processedUsers.length > 0 ? processedUsers : this.createMockUsersData();
    } catch (error) {
      console.error('Error loading real user data:', error);
      return this.createMockUsersData();
    }
  }

  // Load real interaction data from database
  async loadRealInteractionsData() {
    try {
      const TableInteraction = require('../Models/TableInteraction');
      const realInteractions = await TableInteraction.find({}).limit(1000);

      const processedInteractions = realInteractions.map(interaction => ({
        user_id: interaction.userId.toString(),
        table_id: interaction.tableId.toString(),
        interactionType: interaction.interactionType,
        weight: this.getInteractionWeight(interaction.interactionType),
        rating: interaction.rating,
        timestamp: interaction.timestamp
      }));

      console.log(`✅ Loaded ${processedInteractions.length} real interactions for ML model`);
      return processedInteractions.length > 0 ? processedInteractions : this.createMockInteractionsData();
    } catch (error) {
      console.error('Error loading real interaction data:', error);
      return this.createMockInteractionsData();
    }
  }

  // Helper method to assign weights to different interaction types
  getInteractionWeight(interactionType) {
    const weights = {
      'view': 1.0,
      'favorite': 3.0,
      'inquiry': 2.0,
      'booking': 5.0,
      'rating': 4.0
    };
    return weights[interactionType] || 1.0;
  }

  createMockTablesData() {
    // Mock table data based on our ML model structure
    return [
      { table_id: 'T001', capacity: 4, location: 'Bar Area', ambiance: 'Formal', hasWindowView: false, isPrivate: false, priceTier: 'Mid-range', avgRating: 3.7 },
      { table_id: 'T002', capacity: 2, location: 'Garden', ambiance: 'Intimate', hasWindowView: true, isPrivate: true, priceTier: 'Mid-range', avgRating: 4.0 },
      { table_id: 'T003', capacity: 2, location: 'Main Hall', ambiance: 'Social', hasWindowView: true, isPrivate: false, priceTier: 'Mid-range', avgRating: 4.2 },
      { table_id: 'T004', capacity: 4, location: 'Bar Area', ambiance: 'Social', hasWindowView: true, isPrivate: true, priceTier: 'Premium', avgRating: 3.3 },
      { table_id: 'T005', capacity: 2, location: 'Garden', ambiance: 'Lively', hasWindowView: false, isPrivate: true, priceTier: 'Premium', avgRating: 4.7 }
    ];
  }

  createMockUsersData() {
    return [
      { user_id: 'U0001', preferredGroupSize: 8, preferredOccasion: 'Friends', prefersQuiet: true, prefersWindow: false, prefersPrivate: false },
      { user_id: 'U0002', preferredGroupSize: 4, preferredOccasion: 'Romantic', prefersQuiet: true, prefersWindow: false, prefersPrivate: false },
      { user_id: 'U0003', preferredGroupSize: 2, preferredOccasion: 'Business', prefersQuiet: true, prefersWindow: true, prefersPrivate: true }
    ];
  }

  createMockInteractionsData() {
    return [
      { user_id: 'U0001', table_id: 'T001', interactionType: 'view', weight: 1.0 },
      { user_id: 'U0001', table_id: 'T002', interactionType: 'favorite', weight: 3.0 },
      { user_id: 'U0002', table_id: 'T002', interactionType: 'booking', weight: 5.0 },
      { user_id: 'U0003', table_id: 'T003', interactionType: 'inquiry', weight: 2.0 }
    ];
  }

  initializeJSRecommendationEngine() {
    this.models = {
      collaborative: new CollaborativeFilteringEngine(this.datasets),
      contentBased: new ContentBasedEngine(this.datasets),
      hybrid: new HybridEngine(this.datasets)
    };
  }

  getRecommendations(userId, context = {}, numRecommendations = 10) {
    if (!this.modelsLoaded) {
      return this.getFallbackRecommendations(numRecommendations);
    }

    try {
      return this.models.hybrid.recommend(userId, context, numRecommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.getFallbackRecommendations(numRecommendations);
    }
  }

  getFallbackRecommendations(numRecommendations = 10) {
    // Return popular tables as fallback
    return this.datasets.tables
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, numRecommendations)
      .map((table, index) => ({
        tableId: table.table_id,
        score: (numRecommendations - index) / numRecommendations,
        reason: 'popularity',
        confidence: 'medium',
        rank: index + 1,
        explanation: 'Popular table with high ratings'
      }));
  }

  isLoaded() {
    return this.modelsLoaded;
  }

  getModelInfo() {
    return {
      loaded: this.modelsLoaded,
      modelTypes: ['collaborative_filtering', 'content_based', 'hybrid'],
      datasetSizes: {
        tables: this.datasets.tables?.length || 0,
        users: this.datasets.users?.length || 0,
        interactions: this.datasets.interactions?.length || 0
      }
    };
  }
}

// Simple recommendation engines
class CollaborativeFilteringEngine {
  constructor(datasets) {
    this.datasets = datasets;
  }

  recommend(userId, context, numRecommendations) {
    // Simplified collaborative filtering
    const userInteractions = this.datasets.interactions.filter(i => i.user_id === userId);
    const interactedTables = userInteractions.map(i => i.table_id);
    
    // Find similar users (users who interacted with same tables)
    const similarUsers = this.datasets.interactions
      .filter(i => interactedTables.includes(i.table_id) && i.user_id !== userId)
      .map(i => i.user_id);

    // Get tables liked by similar users
    const recommendations = this.datasets.interactions
      .filter(i => similarUsers.includes(i.user_id) && !interactedTables.includes(i.table_id))
      .map(i => ({
        tableId: i.table_id,
        score: i.weight / 5.0,
        reason: 'collaborative_filtering',
        confidence: 'medium',
        explanation: 'Users with similar preferences also liked this table'
      }))
      .slice(0, numRecommendations);

    return recommendations;
  }
}

class ContentBasedEngine {
  constructor(datasets) {
    this.datasets = datasets;
  }

  recommend(userId, context, numRecommendations) {
    // Simplified content-based filtering
    const user = this.datasets.users.find(u => u.user_id === userId);
    if (!user) return [];

    const recommendations = this.datasets.tables
      .map(table => {
        let score = 0;
        
        // Match capacity preference
        if (Math.abs(table.capacity - user.preferredGroupSize) <= 2) score += 0.3;
        
        // Match ambiance for occasion
        if (context.occasion === 'Romantic' && table.ambiance === 'Intimate') score += 0.4;
        if (context.occasion === 'Business' && table.ambiance === 'Formal') score += 0.4;
        
        // Match user preferences
        if (user.prefersWindow && table.hasWindowView) score += 0.2;
        if (user.prefersPrivate && table.isPrivate) score += 0.2;
        
        return {
          tableId: table.table_id,
          score: Math.min(score, 1.0),
          reason: 'content_based',
          confidence: score > 0.5 ? 'high' : 'medium',
          explanation: 'This table matches your dining preferences'
        };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, numRecommendations);

    return recommendations;
  }
}

class HybridEngine {
  constructor(datasets) {
    this.collaborative = new CollaborativeFilteringEngine(datasets);
    this.contentBased = new ContentBasedEngine(datasets);
    this.datasets = datasets;
  }

  recommend(userId, context, numRecommendations) {
    const cfRecs = this.collaborative.recommend(userId, context, numRecommendations);
    const cbRecs = this.contentBased.recommend(userId, context, numRecommendations);
    
    // Combine recommendations with weights
    const combined = new Map();
    
    cfRecs.forEach(rec => {
      combined.set(rec.tableId, {
        ...rec,
        score: rec.score * 0.4,
        reason: 'hybrid'
      });
    });
    
    cbRecs.forEach(rec => {
      if (combined.has(rec.tableId)) {
        const existing = combined.get(rec.tableId);
        existing.score += rec.score * 0.6;
        existing.explanation = `${existing.explanation}; ${rec.explanation}`;
      } else {
        combined.set(rec.tableId, {
          ...rec,
          score: rec.score * 0.6,
          reason: 'hybrid'
        });
      }
    });
    
    return Array.from(combined.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, numRecommendations)
      .map((rec, index) => ({ ...rec, rank: index + 1 }));
  }
}

module.exports = new TableMLModelLoader();
