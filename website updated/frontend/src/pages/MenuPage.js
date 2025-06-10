import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiShoppingCart, FiStar, FiClock, FiTag, FiInfo } from 'react-icons/fi';
import axios from 'axios';
import PageLayout from '../components/layout/PageLayout';
import '../styles/theme.css';

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    dietary: [],
    sortBy: 'name-asc'
  });

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      const menuResponse = await axios.get('http://localhost:8080/api/menus');
      setMenuItems(menuResponse.data);

      // Extract unique categories from menu items
      const uniqueCategories = [...new Set(menuResponse.data.map(item => item.category))];
      setCategories(uniqueCategories.map(cat => ({ _id: cat, name: cat })));

      setLoading(false);
    } catch (error) {
      setError('Failed to load menu. Please try again later.');
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDietaryToggle = (dietary) => {
    setFilters(prev => ({
      ...prev,
      dietary: prev.dietary.includes(dietary)
        ? prev.dietary.filter(d => d !== dietary)
        : [...prev.dietary, dietary]
    }));
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesPrice = (!filters.minPrice || item.price >= filters.minPrice) &&
                        (!filters.maxPrice || item.price <= filters.maxPrice);
    const matchesDietary = filters.dietary.length === 0 ||
                          filters.dietary.every(diet => item.dietaryTags && item.dietaryTags.includes(diet));

    return matchesSearch && matchesCategory && matchesPrice && matchesDietary;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (filters.sortBy) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  const addToCart = async (itemId) => {
    try {
      await axios.post('http://localhost:8080/api/cart', { itemId });
      // Show success notification
    } catch (error) {
      // Show error notification
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="loading-state">
          <div className="loading-spinner" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="error-state">
          <FiInfo className="error-icon" />
          <h3>{error}</h3>
          <button onClick={fetchMenuData} className="retry-button">
            Try Again
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Our Menu</h1>
        <p className="page-subtitle">
          Discover our delicious selection of dishes and beverages
        </p>
      </div>

      <div className="menu-container">
        <div className="menu-filters">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="categories-tabs">
            <button
              className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category._id}
                className={`category-tab ${activeCategory === category._id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category._id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="filter-section">
            <h3>Filters</h3>
            <div className="filter-group">
              <label>Price Range</label>
              <div className="price-range">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                />
                <span>to</span>
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Dietary</label>
              <div className="dietary-list">
                <label className="dietary-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.dietary.includes('vegetarian')}
                    onChange={() => handleDietaryToggle('vegetarian')}
                  />
                  Vegetarian
                </label>
                <label className="dietary-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.dietary.includes('vegan')}
                    onChange={() => handleDietaryToggle('vegan')}
                  />
                  Vegan
                </label>
                <label className="dietary-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.dietary.includes('gluten-free')}
                    onChange={() => handleDietaryToggle('gluten-free')}
                  />
                  Gluten Free
                </label>
              </div>
            </div>

            <div className="sort-section">
              <label>Sort By:</label>
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
              >
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="menu-grid">
          {sortedItems.map((item) => (
            <div key={item._id} className="menu-card">
              <div className="menu-item-image">
                <img
                  src={item.image || "/placeholder-food.jpg"}
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = "/placeholder-food.jpg";
                  }}
                />
                {item.isRecommended && (
                  <div className="popular-badge">
                    <FiStar />
                    <span>Recommended</span>
                  </div>
                )}
              </div>
              <div className="menu-item-content">
                <h3 className="menu-item-title">{item.name}</h3>
                <p className="menu-item-description">{item.description}</p>
                <div className="menu-item-details">
                  <div className="menu-item-price">
                    <FiTag />
                    <span>Rs. {item.price}</span>
                  </div>
                  <div className="menu-item-prep-time">
                    <FiClock />
                    <span>{item.preparationTime} mins</span>
                  </div>
                </div>
                <div className="menu-item-dietary">
                  {item.dietaryTags && item.dietaryTags.map((diet, index) => (
                    <span key={index} className="dietary-tag">
                      {diet}
                    </span>
                  ))}
                </div>
                <button
                  className="add-to-cart-button"
                  onClick={() => addToCart(item._id)}
                >
                  <FiShoppingCart />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {sortedItems.length === 0 && (
          <div className="empty-state">
            <FiSearch className="empty-state-icon" />
            <h3>No items found</h3>
            <p>Try adjusting your filters or search criteria</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default MenuPage; 