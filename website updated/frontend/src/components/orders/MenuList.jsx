import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./MenuList.css";
import MenuItemModal from "./MenuItemModal";

const MenuList = ({ addToCart }) => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/menu");
        setMenu(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load menu items");
        setLoading(false);
        toast.error("Failed to load menu items");
      }
    };

    fetchMenu();
  }, []);

  if (loading) {
    return (
      <section className="menu-section">
        <div className="loading-spinner">Loading...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="menu-section">
        <div className="error-message">{error}</div>
      </section>
    );
  }

  return (
    <section className="menu-section">
      <div className="section-header">
        <span className="section-subtitle">Explore Our</span>
        <h2 className="section-title">Cosmic Menu</h2>
        <div className="title-underline" />
      </div>

      <div className="menu-grid">
        {menu.map((item) => (
          <article 
            key={item._id} 
            className="menu-card"
            onClick={() => setSelectedItem(item)}
          >
            <div className="card-glow" />
            <div className="card-content">
              <h3 className="item-title">{item.name}</h3>
              <p className="item-description">{item.description}</p>
              <div className="item-footer">
                <span className="item-price">Rs. {item.price.toFixed(0)}</span>
                <button 
                  className="add-to-cart-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(item);
                    toast.success(`${item.name} added to cart!`);
                  }}
                >
                  <span className="btn-icon">+</span>
                  Add to Cart
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {selectedItem && (
        <MenuItemModal 
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          addToCart={addToCart}
        />
      )}
    </section>
  );
};

export default MenuList;


