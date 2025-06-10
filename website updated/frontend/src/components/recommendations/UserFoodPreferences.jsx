import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge } from 'react-bootstrap';
import { FiSettings, FiSave, FiRefreshCw, FiUser } from 'react-icons/fi';
import { recommendationHelpers } from '../../api/recommendations';
import axios from 'axios';
import { toast } from 'react-toastify';
import './UserFoodPreferences.css';

const UserFoodPreferences = ({ userId = null, onPreferencesUpdate }) => {
  const [preferences, setPreferences] = useState({
    preferredCuisines: ['Pakistani'],
    spiceLevelPreference: 'medium',
    dietaryRestrictions: ['halal'],
    allergies: [],
    favoriteCategories: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const currentUserId = userId || recommendationHelpers.getCurrentUserId();
  const isLoggedIn = recommendationHelpers.isUserLoggedIn();

  const cuisineOptions = [
    'Pakistani', 'Indian', 'Chinese', 'Italian', 'Mexican', 
    'Thai', 'Mediterranean', 'American', 'Japanese', 'Continental'
  ];

  const spiceLevels = [
    { value: 'mild', label: 'Mild 🌶️', color: '#4CAF50' },
    { value: 'medium', label: 'Medium 🌶️🌶️', color: '#FF9800' },
    { value: 'hot', label: 'Hot 🌶️🌶️🌶️', color: '#FF5722' },
    { value: 'very_hot', label: 'Very Hot 🌶️🌶️🌶️🌶️', color: '#D32F2F' }
  ];

  const dietaryOptions = [
    { value: 'halal', label: 'Halal 🥩', color: '#4CAF50' },
    { value: 'vegetarian', label: 'Vegetarian 🌱', color: '#8BC34A' },
    { value: 'vegan', label: 'Vegan 🌿', color: '#689F38' },
    { value: 'gluten-free', label: 'Gluten-Free 🌾', color: '#FFC107' },
    { value: 'dairy-free', label: 'Dairy-Free 🥛', color: '#03A9F4' }
  ];

  const categoryOptions = [
    'Main Course', 'Appetizers', 'Desserts', 'Beverages', 
    'Biryani', 'Karahi', 'BBQ', 'Fast Food', 'Traditional'
  ];

  const allergyOptions = [
    'Nuts', 'Dairy', 'Eggs', 'Gluten', 'Seafood', 
    'Soy', 'Sesame', 'Mustard', 'Sulphites'
  ];

  useEffect(() => {
    if (isLoggedIn && currentUserId) {
      loadUserPreferences();
    } else {
      setLoading(false);
    }
  }, [currentUserId, isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserPreferences = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/api/users/${currentUserId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.foodPreferences) {
        setPreferences({
          preferredCuisines: response.data.foodPreferences.preferredCuisines || ['Pakistani'],
          spiceLevelPreference: response.data.foodPreferences.spiceLevelPreference || 'medium',
          dietaryRestrictions: response.data.foodPreferences.dietaryRestrictions || ['halal'],
          allergies: response.data.foodPreferences.allergies || [],
          favoriteCategories: response.data.foodPreferences.favoriteCategories || []
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      setError('Failed to load your food preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!isLoggedIn || !currentUserId) {
      toast.error('Please login to save preferences');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `http://localhost:8080/api/users/${currentUserId}/preferences`,
        { foodPreferences: preferences },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Food preferences saved successfully!');
      
      if (onPreferencesUpdate) {
        onPreferencesUpdate(preferences);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleCuisineChange = (cuisine) => {
    setPreferences(prev => ({
      ...prev,
      preferredCuisines: prev.preferredCuisines.includes(cuisine)
        ? prev.preferredCuisines.filter(c => c !== cuisine)
        : [...prev.preferredCuisines, cuisine]
    }));
  };

  const handleDietaryChange = (dietary) => {
    setPreferences(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(dietary)
        ? prev.dietaryRestrictions.filter(d => d !== dietary)
        : [...prev.dietaryRestrictions, dietary]
    }));
  };

  const handleCategoryChange = (category) => {
    setPreferences(prev => ({
      ...prev,
      favoriteCategories: prev.favoriteCategories.includes(category)
        ? prev.favoriteCategories.filter(c => c !== category)
        : [...prev.favoriteCategories, category]
    }));
  };

  const handleAllergyChange = (allergy) => {
    setPreferences(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy]
    }));
  };

  if (!isLoggedIn) {
    return (
      <Container className="food-preferences-container">
        <Alert variant="info" className="text-center">
          <FiUser className="me-2" />
          Please login to set your food preferences and get personalized recommendations.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="food-preferences-container">
        <div className="text-center py-5">
          <FiRefreshCw className="spinning mb-3" size={32} />
          <p>Loading your food preferences...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="food-preferences-container">
      <div className="preferences-header">
        <h2 className="preferences-title">
          <FiSettings className="me-2" />
          Food Preferences
        </h2>
        <p className="preferences-subtitle">
          Customize your food preferences to get better recommendations
        </p>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Row>
        {/* Preferred Cuisines */}
        <Col md={6} className="mb-4">
          <Card className="preference-card">
            <Card.Header>
              <h5>🍽️ Preferred Cuisines</h5>
            </Card.Header>
            <Card.Body>
              <div className="option-grid">
                {cuisineOptions.map(cuisine => (
                  <Badge
                    key={cuisine}
                    bg={preferences.preferredCuisines.includes(cuisine) ? 'primary' : 'outline-secondary'}
                    className={`option-badge ${preferences.preferredCuisines.includes(cuisine) ? 'selected' : ''}`}
                    onClick={() => handleCuisineChange(cuisine)}
                  >
                    {cuisine}
                  </Badge>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Spice Level */}
        <Col md={6} className="mb-4">
          <Card className="preference-card">
            <Card.Header>
              <h5>🌶️ Spice Level Preference</h5>
            </Card.Header>
            <Card.Body>
              <div className="spice-options">
                {spiceLevels.map(level => (
                  <div
                    key={level.value}
                    className={`spice-option ${preferences.spiceLevelPreference === level.value ? 'selected' : ''}`}
                    onClick={() => setPreferences(prev => ({ ...prev, spiceLevelPreference: level.value }))}
                    style={{ borderColor: level.color }}
                  >
                    <span style={{ color: level.color }}>{level.label}</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Dietary Restrictions */}
        <Col md={6} className="mb-4">
          <Card className="preference-card">
            <Card.Header>
              <h5>🥗 Dietary Restrictions</h5>
            </Card.Header>
            <Card.Body>
              <div className="option-grid">
                {dietaryOptions.map(dietary => (
                  <Badge
                    key={dietary.value}
                    bg={preferences.dietaryRestrictions.includes(dietary.value) ? 'success' : 'outline-secondary'}
                    className={`option-badge ${preferences.dietaryRestrictions.includes(dietary.value) ? 'selected' : ''}`}
                    onClick={() => handleDietaryChange(dietary.value)}
                    style={{ color: dietary.color }}
                  >
                    {dietary.label}
                  </Badge>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Favorite Categories */}
        <Col md={6} className="mb-4">
          <Card className="preference-card">
            <Card.Header>
              <h5>❤️ Favorite Categories</h5>
            </Card.Header>
            <Card.Body>
              <div className="option-grid">
                {categoryOptions.map(category => (
                  <Badge
                    key={category}
                    bg={preferences.favoriteCategories.includes(category) ? 'warning' : 'outline-secondary'}
                    className={`option-badge ${preferences.favoriteCategories.includes(category) ? 'selected' : ''}`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Allergies */}
        <Col md={12} className="mb-4">
          <Card className="preference-card">
            <Card.Header>
              <h5>⚠️ Allergies & Intolerances</h5>
            </Card.Header>
            <Card.Body>
              <div className="option-grid">
                {allergyOptions.map(allergy => (
                  <Badge
                    key={allergy}
                    bg={preferences.allergies.includes(allergy) ? 'danger' : 'outline-secondary'}
                    className={`option-badge ${preferences.allergies.includes(allergy) ? 'selected' : ''}`}
                    onClick={() => handleAllergyChange(allergy)}
                  >
                    {allergy}
                  </Badge>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Save Button */}
      <div className="text-center mt-4">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSavePreferences}
          disabled={saving}
          className="save-preferences-btn"
        >
          {saving ? (
            <>
              <FiRefreshCw className="spinning me-2" />
              Saving...
            </>
          ) : (
            <>
              <FiSave className="me-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </Container>
  );
};

export default UserFoodPreferences;
