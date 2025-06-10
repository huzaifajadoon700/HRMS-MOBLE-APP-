import React, { useState, useEffect } from 'react';
import { Container,  Spinner } from 'react-bootstrap';
import { FiRefreshCw, FiUser, FiTrendingUp, FiStar } from 'react-icons/fi';
import RecommendationCard from './RecommendationCard';
import { recommendationAPI, recommendationHelpers } from '../../api/recommendations';
import './PersonalizedRecommendations.css';

const PersonalizedRecommendations = ({ 
  userId = null, 
  showHeader = true, 
  maxItems = 8,
  className = '',
  onAddToCart,
  onRate 
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('personalized');
  const [refreshing, setRefreshing] = useState(false);

  const currentUserId = userId || recommendationHelpers.getCurrentUserId();
  const isLoggedIn = recommendationHelpers.isUserLoggedIn();

  useEffect(() => {
    loadRecommendations();
  }, [currentUserId, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      
      switch (activeTab) {
        case 'personalized':
          if (isLoggedIn && currentUserId) {
            try {
              response = await recommendationAPI.getRecommendations(currentUserId, maxItems);
            } catch (personalizedError) {
              console.log('Personalized recommendations failed, using popular items:', personalizedError);
              response = await recommendationAPI.getPopularItems(maxItems);
            }
          } else {
            response = await recommendationAPI.getPopularItems(maxItems);
          }
          break;
          

        case 'popular':
          response = await recommendationAPI.getPopularItems(maxItems);
          break;
          
        default:
          response = await recommendationAPI.getPopularItems(maxItems);
      }

      if (response && response.success) {
        const items = response.recommendations || response.popularItems || [];
        setRecommendations(items);
      } else {
        throw new Error(response?.message || 'Failed to load recommendations');
      }
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError(err.message || 'Failed to load recommendations');
      
      // Fallback to popular items
      try {
        const fallbackResponse = await recommendationAPI.getPopularItems(maxItems);
        if (fallbackResponse.success) {
          setRecommendations(fallbackResponse.popularItems || []);
          setError('Showing popular items instead');
        }
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRecommendations();
    setRefreshing(false);
  };

  const handleAddToCart = (menuItem) => {
    // Record view interaction
    if (isLoggedIn && currentUserId) {
      recommendationAPI.recordInteraction(
        currentUserId, 
        menuItem._id, 
        'view'
      ).catch(console.error);
    }
    
    if (onAddToCart) {
      onAddToCart(menuItem);
    }
  };

  const handleRate = (menuItemId, rating) => {
    if (isLoggedIn && currentUserId) {
      recommendationAPI.rateMenuItem(currentUserId, menuItemId, rating)
        .then(() => {
          // Refresh recommendations after rating
          loadRecommendations();
        })
        .catch(console.error);
    }
    
    if (onRate) {
      onRate(menuItemId, rating);
    }
  };

  const getTabIcon = (tab) => {
    switch (tab) {
      case 'personalized': return <FiUser />;
      case 'popular': return <FiTrendingUp />;
      default: return <FiStar />;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'personalized':
        return isLoggedIn ? 'Recommended for You' : 'Popular Items';
      case 'popular':
        return 'Most Popular Items';
      default:
        return 'Recommendations';
    }
  };

  const getTabSubtitle = () => {
    switch (activeTab) {
      case 'personalized':
        return isLoggedIn
          ? 'AI-powered recommendations based on your preferences'
          : 'Discover our most loved dishes';
      case 'popular':
        return 'Customer favorites and trending dishes';
      default:
        return 'Discover delicious food recommendations';
    }
  };

  if (loading && recommendations.length === 0) {
    return (
      <Container className={`personalized-recommendations loading ${className}`}>
        <div className="loading-container">
          <Spinner animation="border" variant="primary" />
          <p>Loading delicious recommendations...</p>
        </div>
      </Container>
    );
  }

  return (
    <div style={{
      background: 'rgba(100, 255, 218, 0.05)',
      borderRadius: '1rem',
      padding: '1.5rem',
      border: '1px solid rgba(100, 255, 218, 0.1)',
      margin: '0'
    }}>
      {showHeader && (
        <div style={{
          textAlign: 'center',
          marginBottom: '1.5rem'
        }}>
          {/* Title Section */}
          <h3 style={{
            color: '#64ffda',
            fontSize: '1.3rem',
            fontWeight: '700',
            margin: '0 0 0.5rem 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            {getTabIcon(activeTab)}
            {getTabTitle()}
          </h3>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.9rem',
            margin: '0 0 1.5rem 0',
            lineHeight: '1.4'
          }}>
            {getTabSubtitle()}
          </p>

          {/* Beautiful Tab Navigation */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginBottom: '1rem'
          }}>
            <button
              onClick={() => setActiveTab('personalized')}
              style={{
                padding: '0.6rem 1.2rem',
                background: activeTab === 'personalized'
                  ? 'linear-gradient(135deg, #64ffda 0%, #4fd1c7 100%)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: activeTab === 'personalized' ? '#0a192f' : '#64ffda',
                border: activeTab === 'personalized' ? 'none' : '1px solid rgba(100, 255, 218, 0.3)',
                borderRadius: '1.5rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: activeTab === 'personalized' ? '0 4px 12px rgba(100, 255, 218, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'personalized') {
                  e.target.style.background = 'rgba(100, 255, 218, 0.2)';
                  e.target.style.borderColor = 'rgba(100, 255, 218, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'personalized') {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.borderColor = 'rgba(100, 255, 218, 0.3)';
                }
              }}
            >
              <FiUser size={16} />
              {isLoggedIn ? 'For You' : 'Popular'}
            </button>



            <button
              onClick={() => setActiveTab('popular')}
              style={{
                padding: '0.6rem 1.2rem',
                background: activeTab === 'popular'
                  ? 'linear-gradient(135deg, #64ffda 0%, #4fd1c7 100%)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: activeTab === 'popular' ? '#0a192f' : '#64ffda',
                border: activeTab === 'popular' ? 'none' : '1px solid rgba(100, 255, 218, 0.3)',
                borderRadius: '1.5rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: activeTab === 'popular' ? '0 4px 12px rgba(100, 255, 218, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'popular') {
                  e.target.style.background = 'rgba(100, 255, 218, 0.2)';
                  e.target.style.borderColor = 'rgba(100, 255, 218, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'popular') {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.borderColor = 'rgba(100, 255, 218, 0.3)';
                }
              }}
            >
              <FiTrendingUp size={16} />
              Trending
            </button>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                padding: '0.6rem 1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#64ffda',
                border: '1px solid rgba(100, 255, 218, 0.3)',
                borderRadius: '1.5rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: refreshing ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!refreshing) {
                  e.target.style.background = 'rgba(100, 255, 218, 0.2)';
                  e.target.style.borderColor = 'rgba(100, 255, 218, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!refreshing) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.borderColor = 'rgba(100, 255, 218, 0.3)';
                }
              }}
            >
              <FiRefreshCw
                size={14}
                style={{
                  animation: refreshing ? 'spin 1s linear infinite' : 'none'
                }}
              />
              Refresh
            </button>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(255, 193, 7, 0.1)',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#ffc107'
        }}>
          <FiStar size={18} />
          <span style={{ fontSize: '0.9rem' }}>{error}</span>
        </div>
      )}

      {recommendations.length === 0 && !loading ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          color: 'rgba(255, 255, 255, 0.8)'
        }}>
          <FiStar size={48} style={{ color: '#64ffda', marginBottom: '1rem' }} />
          <h4 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
            No recommendations available
          </h4>
          <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {isLoggedIn
              ? "Start ordering to get personalized recommendations!"
              : "Sign in to get personalized food recommendations"}
          </p>
          <button
            onClick={handleRefresh}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #64ffda 0%, #4fd1c7 100%)',
              color: '#0a192f',
              border: 'none',
              borderRadius: '1.5rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(100, 255, 218, 0.3)'
            }}
          >
            Try Again
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 350px))',
          gap: '1rem',
          maxWidth: '100%',
          justifyContent: 'center'
        }}>
          {recommendations.map((recommendation, index) => (
            <div key={recommendation._id || recommendation.menuItemId || index}>
              <RecommendationCard
                recommendation={recommendation}
                onAddToCart={handleAddToCart}
                onRate={handleRate}
                showReason={activeTab === 'personalized' && isLoggedIn}
                showConfidence={activeTab === 'personalized' && isLoggedIn}
                className="new"
              />
            </div>
          ))}
        </div>
      )}


    </div>
  );
};

export default PersonalizedRecommendations;
