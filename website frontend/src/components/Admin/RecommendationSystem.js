import React, { useState } from "react";
import "./RecommendationSystem.css";

const customerHistory = {
  rooms: [
    { id: 1, name: "Ocean View Suite", date: "2024-12-10", rating: 4.5 },
    { id: 2, name: "Mountain Cabin", date: "2024-11-25", rating: 4.0 },
  ],
  menuItems: [
    { id: 1, name: "Grilled Salmon", rating: 4.8 },
    { id: 2, name: "Vegetarian Pasta", rating: 4.2 },
  ],
};

const RecommendationSystem = () => {
  const [recommendedRooms, setRecommendedRooms] = useState([]);
  const [recommendedMenu, setRecommendedMenu] = useState([]);
  const [loading, setLoading] = useState(false);

  const suggestRooms = () => {
    setLoading(true);

    const rooms = [
      { id: 1, name: "Ocean View Suite", description: "A luxurious oceanfront suite", rating: 4.8 },
      { id: 2, name: "Mountain Cabin", description: "A cozy cabin in the mountains", rating: 4.7 },
      { id: 3, name: "City Loft", description: "A modern loft in the heart of the city", rating: 4.5 },
    ];

    // Suggest rooms based on customer history ratings
    const recommendations = rooms.filter((room) =>
      customerHistory.rooms.some((history) => room.rating >= history.rating)
    );

    setTimeout(() => {
      setRecommendedRooms(recommendations);
      setLoading(false);
    }, 1000);
  };

  const suggestMenuItems = () => {
    setLoading(true);

    const menuItems = [
      { id: 1, name: "Grilled Salmon", description: "Fresh salmon grilled to perfection", rating: 4.9 },
      { id: 2, name: "Vegetarian Pasta", description: "A healthy vegetarian pasta", rating: 4.6 },
      { id: 3, name: "Steak Frites", description: "A classic steak with fries", rating: 4.8 },
    ];

    // Suggest menu items based on customer history ratings
    const recommendations = menuItems.filter((item) =>
      customerHistory.menuItems.some((history) => item.rating >= history.rating)
    );

    setTimeout(() => {
      setRecommendedMenu(recommendations);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="cosmic-container">
      <h2 className="cosmic-title text-center">Personalized Recommendations</h2>
      <p className="cosmic-subtitle text-center">
        Based on your history, we suggest the following rooms and menu items for your next visit:
      </p>

      <div className="row cosmic-row mb-5">
        {/* Recommended Rooms */}
        <div className="col-md-6">
          <div className="card cosmic-card shadow-sm">
            <div className="card-header cosmic-card-header">
              Recommended Rooms
            </div>
            <div className="card-body cosmic-card-body">
              <button
                className="btn cosmic-button"
                onClick={suggestRooms}
                disabled={loading}
              >
                {loading ? "Loading..." : "Get Room Suggestions"}
              </button>
              <ul className="list-group cosmic-list mt-3">
                {recommendedRooms.length > 0 ? (
                  recommendedRooms.map((room) => (
                    <li key={room.id} className="list-group-item cosmic-list-item">
                      <h5>{room.name}</h5>
                      <p>{room.description}</p>
                      <span className="badge cosmic-badge-success">
                        {room.rating} / 5
                      </span>
                    </li>
                  ))
                ) : (
                  <p className="cosmic-info-text">
                    No room suggestions yet. Click the button to get recommendations.
                  </p>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Recommended Menu Items */}
        <div className="col-md-6">
          <div className="card cosmic-card shadow-sm">
            <div className="card-header cosmic-card-header cosmic-card-header-menu">
              Recommended Menu Items
            </div>
            <div className="card-body cosmic-card-body">
              <button
                className="btn cosmic-button"
                onClick={suggestMenuItems}
                disabled={loading}
              >
                {loading ? "Loading..." : "Get Menu Suggestions"}
              </button>
              <ul className="list-group cosmic-list mt-3">
                {recommendedMenu.length > 0 ? (
                  recommendedMenu.map((item) => (
                    <li key={item.id} className="list-group-item cosmic-list-item">
                      <h5>{item.name}</h5>
                      <p>{item.description}</p>
                      <span className="badge cosmic-badge-warning">
                        {item.rating} / 5
                      </span>
                    </li>
                  ))
                ) : (
                  <p className="cosmic-info-text">
                    No menu suggestions yet. Click the button to get recommendations.
                  </p>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationSystem;
