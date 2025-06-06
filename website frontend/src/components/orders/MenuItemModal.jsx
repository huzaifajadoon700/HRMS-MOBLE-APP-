import React from "react";
import { toast } from "react-toastify";
import "./MenuList.css";

const MenuItemModal = ({ item, onClose, addToCart }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{item.name}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {item.image && (
            <img 
              src={`http://localhost:8080${item.image}`} 
              alt={item.name} 
              className="modal-image"
            />
          )}
          <p className="modal-description">{item.description}</p>
          <div className="modal-details">
            <div className="detail-group">
              <span className="detail-label">Price</span>
              <span className="detail-value">${item.price}</span>
            </div>
            <div className="detail-group">
              <span className="detail-label">Category</span>
              <span className="detail-value">{item.category}</span>
            </div>
            <div className="detail-group">
              <span className="detail-label">Availability</span>
              <span className={`availability-badge ${item.availability ? "available" : "unavailable"}`}>
                {item.availability ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button 
            className="add-to-cart-btn"
            onClick={() => {
              addToCart(item);
              toast.success(`${item.name} added to cart!`);
              onClose();
            }}
          >
            <span className="btn-icon">+</span>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemModal; 