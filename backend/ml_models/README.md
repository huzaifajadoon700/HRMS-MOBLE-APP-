# ML Models Directory

This directory contains the trained machine learning models for the food recommendation system.

## Files to place here:

1. **complete_food_recommendation_model.pkl** - The trained SVD model
2. **recommendation_mappings.pkl** - User and recipe ID mappings
3. **user_history.json** - User interaction history
4. **user_profiles.json** - User preference profiles
5. **deployment_package.json** - Deployment configuration
6. **hrms_integration_package.json** - HRMS integration specifications

## How to get these files:

1. Download them from your Google Colab session
2. Place them in this directory
3. The backend will automatically load them when needed

## File Descriptions:

- **complete_food_recommendation_model.pkl**: Contains the trained SVD model with performance metrics
- **recommendation_mappings.pkl**: Maps between user/recipe IDs and internal model indices
- **user_history.json**: Stores 30-day user interaction history
- **user_profiles.json**: Cached user preference profiles
- **deployment_package.json**: Production deployment configuration
- **hrms_integration_package.json**: HRMS-specific integration settings

## Usage:

The FoodRecommendationController will automatically load these files to provide:
- Personalized recommendations
- User preference analysis
- Real-time interaction tracking
- Pakistani cuisine adaptations
