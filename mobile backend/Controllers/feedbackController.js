const Feedback = require('../Models/Feedback');
const User = require('../Models/User');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;
const analyzer = new natural.SentimentAnalyzer('English', stemmer, 'afinn');

// Enhanced sentiment analysis function
const analyzeSentiment = (text) => {
  // Preprocess the text
  const tokens = tokenizer.tokenize(text.toLowerCase());
  
  // Remove common stop words and special characters
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
  const filteredTokens = tokens.filter(token => 
    !stopWords.has(token) && 
    /^[a-zA-Z]+$/.test(token) && 
    token.length > 2
  );

  // Get sentiment score
  const sentimentScore = analyzer.getSentiment(filteredTokens);

  // Enhanced sentiment classification with more nuanced thresholds
  let sentiment;
  if (sentimentScore > 0.5) {
    sentiment = 'positive';
  } else if (sentimentScore > 0.2) {
    sentiment = 'slightly_positive';
  } else if (sentimentScore < -0.5) {
    sentiment = 'negative';
  } else if (sentimentScore < -0.2) {
    sentiment = 'slightly_negative';
  } else {
    sentiment = 'neutral';
  }

  // Calculate confidence score (0 to 1)
  const confidence = Math.min(Math.abs(sentimentScore), 1);

  return {
    sentiment,
    sentimentScore,
    confidence,
    processedTokens: filteredTokens.length
  };
};

exports.submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user._id;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Enhanced sentiment analysis
    const sentimentAnalysis = analyzeSentiment(comment);

    const feedback = new Feedback({
      userId,
      rating,
      comment,
      sentiment: sentimentAnalysis.sentiment,
      sentimentScore: sentimentAnalysis.sentimentScore,
      sentimentConfidence: sentimentAnalysis.confidence,
      processedTokens: sentimentAnalysis.processedTokens
    });

    await feedback.save();
    res.status(201).json({ 
      success: true, 
      data: feedback,
      analysis: sentimentAnalysis
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getFeedbackAnalytics = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate({
        path: 'userId',
        select: 'name email',
        model: 'users'
      });
    
    // Enhanced analytics
    const totalFeedbacks = feedbacks.length;
    const averageRating = totalFeedbacks > 0 
      ? feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / totalFeedbacks 
      : 0;
    
    // Detailed sentiment distribution
    const sentimentDistribution = feedbacks.reduce((acc, curr) => {
      acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1;
      return acc;
    }, {});

    // Calculate average sentiment confidence
    const averageConfidence = totalFeedbacks > 0
      ? feedbacks.reduce((acc, curr) => acc + (curr.sentimentConfidence || 0), 0) / totalFeedbacks
      : 0;

    // Get recent feedbacks with sentiment details
    const recentFeedbacks = feedbacks
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10)
      .map(feedback => ({
        ...feedback.toObject(),
        sentimentDetails: {
          score: feedback.sentimentScore,
          confidence: feedback.sentimentConfidence,
          processedTokens: feedback.processedTokens
        }
      }));

    res.status(200).json({
      success: true,
      data: {
        totalFeedbacks,
        averageRating,
        sentimentDistribution,
        averageConfidence,
        recentFeedbacks
      }
    });
  } catch (error) {
    console.error('Error getting feedback analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUserFeedback = async (req, res) => {
  try {
    const userId = req.user._id;
    const feedbacks = await Feedback.find({ userId })
      .populate({
        path: 'userId',
        select: 'name email',
        model: 'users'
      })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: feedbacks });
  } catch (error) {
    console.error('Error getting user feedback:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}; 