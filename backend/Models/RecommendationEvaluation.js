const mongoose = require('mongoose');

// Model to store recommendation evaluation results
const recommendationEvaluationSchema = new mongoose.Schema({
    evaluationId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        default: null // null means system-wide evaluation
    },
    evaluationType: {
        type: String,
        enum: ['user_specific', 'system_wide', 'algorithm_comparison'],
        required: true
    },
    testPeriod: {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        days: { type: Number, required: true }
    },
    dataStats: {
        trainingInteractions: { type: Number, required: true },
        testInteractions: { type: Number, required: true },
        uniqueUsers: { type: Number, required: true },
        uniqueItems: { type: Number, required: true }
    },
    metrics: {
        // Precision@K: How many recommended items were relevant
        precision: {
            type: Number,
            min: 0,
            max: 1,
            required: true
        },
        // Recall@K: How many relevant items were recommended
        recall: {
            type: Number,
            min: 0,
            max: 1,
            required: true
        },
        // F1 Score: Harmonic mean of precision and recall
        f1Score: {
            type: Number,
            min: 0,
            max: 1,
            required: true
        },
        // NDCG: Normalized Discounted Cumulative Gain
        ndcg: {
            type: Number,
            min: 0,
            max: 1,
            required: true
        },
        // Hit Rate: Percentage of users who got at least one relevant recommendation
        hitRate: {
            type: Number,
            min: 0,
            max: 1,
            required: true
        },
        // Coverage: Percentage of items that can be recommended
        coverage: {
            type: Number,
            min: 0,
            max: 1,
            required: true
        },
        // Diversity: How diverse are the recommendations
        diversity: {
            type: Number,
            min: 0,
            max: 1,
            required: true
        },
        // Overall accuracy score
        overallAccuracy: {
            type: Number,
            min: 0,
            max: 1,
            required: true
        }
    },
    // Confusion Matrix Equivalent for Recommendations
    confusionMatrix: {
        // True Positives: Recommended items that were actually liked (rating >= 4)
        truePositives: { type: Number, default: 0 },
        // False Positives: Recommended items that were not liked (rating < 4)
        falsePositives: { type: Number, default: 0 },
        // True Negatives: Non-recommended items that were not liked
        trueNegatives: { type: Number, default: 0 },
        // False Negatives: Non-recommended items that were actually liked
        falseNegatives: { type: Number, default: 0 },
        // Derived metrics
        accuracy: { type: Number, min: 0, max: 1 },
        specificity: { type: Number, min: 0, max: 1 },
        sensitivity: { type: Number, min: 0, max: 1 } // Same as recall
    },
    algorithmBreakdown: {
        svd: { type: Number, default: 0 },
        collaborative: { type: Number, default: 0 },
        contentBased: { type: Number, default: 0 },
        popularity: { type: Number, default: 0 }
    },
    evaluation: {
        grade: {
            type: String,
            enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D'],
            required: true
        },
        description: {
            type: String,
            enum: ['Excellent', 'Very Good', 'Good', 'Above Average', 'Average', 'Below Average', 'Needs Improvement'],
            required: true
        }
    },
    // Performance comparison with industry standards
    industryComparison: {
        netflixComparison: { type: String }, // Better/Worse/Similar
        amazonComparison: { type: String },
        spotifyComparison: { type: String },
        overallRanking: { type: String } // Industry Leading/Competitive/Below Average
    },
    // Detailed analysis for FYP presentation
    presentationSummary: {
        keyStrengths: [{ type: String }],
        areasForImprovement: [{ type: String }],
        technicalHighlights: [{ type: String }],
        businessImpact: { type: String }
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
recommendationEvaluationSchema.index({ userId: 1, createdAt: -1 });
recommendationEvaluationSchema.index({ evaluationType: 1, createdAt: -1 });
recommendationEvaluationSchema.index({ 'metrics.overallAccuracy': -1 });

// Static method to create evaluation summary for FYP
recommendationEvaluationSchema.statics.createFYPSummary = function(evaluation) {
    const metrics = evaluation.metrics;
    const grade = evaluation.evaluation.grade;
    
    // Determine key strengths
    const keyStrengths = [];
    if (metrics.precision >= 0.7) keyStrengths.push('High Precision - Accurate Recommendations');
    if (metrics.recall >= 0.6) keyStrengths.push('Good Recall - Comprehensive Coverage');
    if (metrics.ndcg >= 0.8) keyStrengths.push('Excellent Ranking Quality (NDCG)');
    if (metrics.hitRate >= 0.8) keyStrengths.push('High Hit Rate - User Satisfaction');
    if (metrics.diversity >= 0.6) keyStrengths.push('Good Recommendation Diversity');
    if (metrics.coverage >= 0.5) keyStrengths.push('Broad Item Coverage');

    // Determine areas for improvement
    const areasForImprovement = [];
    if (metrics.precision < 0.6) areasForImprovement.push('Improve Recommendation Precision');
    if (metrics.recall < 0.5) areasForImprovement.push('Increase Recall - Find More Relevant Items');
    if (metrics.diversity < 0.4) areasForImprovement.push('Enhance Recommendation Diversity');
    if (metrics.coverage < 0.3) areasForImprovement.push('Expand Item Coverage');

    // Technical highlights
    const technicalHighlights = [
        'SVD-based Collaborative Filtering Implementation',
        'Hybrid Recommendation Algorithm (4 methods combined)',
        'Real-time User Interaction Tracking',
        'Advanced Evaluation Metrics (Precision, Recall, NDCG)',
        'Pakistani Cuisine Cultural Adaptation'
    ];

    // Business impact
    let businessImpact = '';
    if (metrics.overallAccuracy >= 0.8) {
        businessImpact = 'High accuracy recommendations can increase user engagement by 25-40% and boost sales conversion rates.';
    } else if (metrics.overallAccuracy >= 0.6) {
        businessImpact = 'Good recommendation quality can improve user retention and provide competitive advantage in food service industry.';
    } else {
        businessImpact = 'Recommendation system provides foundation for personalization with room for optimization to achieve industry standards.';
    }

    // Industry comparison
    const industryComparison = {
        netflixComparison: metrics.precision >= 0.65 ? 'Similar' : 'Below',
        amazonComparison: metrics.recall >= 0.55 ? 'Similar' : 'Below',
        spotifyComparison: metrics.diversity >= 0.6 ? 'Similar' : 'Below',
        overallRanking: metrics.overallAccuracy >= 0.75 ? 'Competitive' : 
                       metrics.overallAccuracy >= 0.6 ? 'Above Average' : 'Below Average'
    };

    return {
        keyStrengths,
        areasForImprovement,
        technicalHighlights,
        businessImpact,
        industryComparison
    };
};

// Method to calculate confusion matrix for recommendations
recommendationEvaluationSchema.statics.calculateConfusionMatrix = function(recommendedItems, actualLikedItems, actualDislikedItems, allItems) {
    const recommendedSet = new Set(recommendedItems);
    const likedSet = new Set(actualLikedItems);
    const dislikedSet = new Set(actualDislikedItems);
    
    let truePositives = 0;  // Recommended AND liked
    let falsePositives = 0; // Recommended BUT not liked
    let trueNegatives = 0;  // Not recommended AND not liked
    let falseNegatives = 0; // Not recommended BUT liked

    // Calculate TP and FP
    recommendedItems.forEach(item => {
        if (likedSet.has(item)) {
            truePositives++;
        } else {
            falsePositives++;
        }
    });

    // Calculate FN
    actualLikedItems.forEach(item => {
        if (!recommendedSet.has(item)) {
            falseNegatives++;
        }
    });

    // Calculate TN (approximation)
    const totalPossibleRecommendations = allItems.length;
    trueNegatives = totalPossibleRecommendations - truePositives - falsePositives - falseNegatives;

    // Calculate derived metrics
    const accuracy = (truePositives + trueNegatives) / (truePositives + trueNegatives + falsePositives + falseNegatives);
    const specificity = trueNegatives / (trueNegatives + falsePositives);
    const sensitivity = truePositives / (truePositives + falseNegatives); // Same as recall

    return {
        truePositives,
        falsePositives,
        trueNegatives,
        falseNegatives,
        accuracy: isNaN(accuracy) ? 0 : accuracy,
        specificity: isNaN(specificity) ? 0 : specificity,
        sensitivity: isNaN(sensitivity) ? 0 : sensitivity
    };
};

module.exports = mongoose.model('RecommendationEvaluation', recommendationEvaluationSchema);
