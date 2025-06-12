
# Room Recommendation API Integration Code
import pickle
import numpy as np
import pandas as pd

class RoomRecommendationEngine:
    def __init__(self, model_path):
        with open(model_path, 'rb') as f:
            self.data = pickle.load(f)

        self.svd_model = self.data['svd_model']
        self.user_factors = self.data['user_factors']
        self.room_factors = self.data['room_factors']
        self.user_room_matrix = self.data['user_room_matrix']
        self.room_features = self.data['room_features']
        self.user_profiles = self.data['user_profiles']

    def get_recommendations(self, user_id, top_n=10):
        """Get room recommendations for a user"""
        if user_id not in self.user_room_matrix.index:
            return self.get_popular_rooms(top_n)

        user_idx = self.user_room_matrix.index.get_loc(user_id)
        user_ratings = np.dot(self.user_factors[user_idx:user_idx+1], self.room_factors.T)[0]

        # Get unrated rooms
        unrated_rooms = self.user_room_matrix.columns[self.user_room_matrix.loc[user_id] == 0]

        recommendations = []
        for room_id in unrated_rooms:
            room_idx = self.user_room_matrix.columns.get_loc(room_id)
            score = user_ratings[room_idx]

            room_info = {
                'room_id': room_id,
                'predicted_rating': float(score),
                'reason': 'collaborative_filtering'
            }

            if room_id in self.room_features.index:
                features = self.room_features.loc[room_id]
                room_info.update({
                    'hotel': features['hotel'],
                    'room_type': features['assigned_room_type'],
                    'price': float(features['adr']),
                    'price_category': str(features['price_category']),
                    'avg_rating': float(features['rating'])
                })

            recommendations.append(room_info)

        # Sort by predicted rating
        recommendations.sort(key=lambda x: x['predicted_rating'], reverse=True)
        return recommendations[:top_n]

    def get_popular_rooms(self, top_n=10):
        """Get popular rooms for new users"""
        popular_rooms = self.room_features.nlargest(top_n, 'rating')

        recommendations = []
        for room_id, features in popular_rooms.iterrows():
            recommendations.append({
                'room_id': room_id,
                'predicted_rating': float(features['rating']),
                'reason': 'popularity',
                'hotel': features['hotel'],
                'room_type': features['assigned_room_type'],
                'price': float(features['adr']),
                'price_category': str(features['price_category']),
                'avg_rating': float(features['rating'])
            })

        return recommendations

# Usage example:
# engine = RoomRecommendationEngine('room_recommendation_model.pkl')
# recommendations = engine.get_recommendations('user_123', top_n=5)
