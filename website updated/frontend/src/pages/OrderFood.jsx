import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiSearch, FiShoppingCart } from "react-icons/fi";
import PersonalizedRecommendations from '../components/recommendations/PersonalizedRecommendations';
import { recommendationAPI, recommendationHelpers } from '../api/recommendations';
import Header from "../components/common/Header";
import '../styles/simple-theme.css';
import '../styles/OrderFood.css';

export default function OrderFood() {
    const [menuItems, setMenuItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [categories, setCategories] = useState([]);
    const [activeTab] = useState('all');
    const [sortBy] = useState('name');
    const [priceRange] = useState([0, 1000]);
    const [favorites] = useState([]);

    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/menus');
                setMenuItems(response.data);
                setFilteredItems(response.data);
                
                // Extract unique categories
                const uniqueCategories = [...new Set(response.data.map(item => item.category))];
                setCategories(uniqueCategories);
                
                setLoading(false);
            } catch (err) {
                setError('Failed to load menu items');
                setLoading(false);
                toast.error('Failed to load menu items');
                console.error('Error fetching menu items:', err);
            }
        };

        fetchMenuItems();
    }, []);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(storedCart);
    }, []);

    useEffect(() => {
        let filtered = menuItems;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply category filter
        if (selectedCategory !== "all") {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }

        // Apply price range filter
        filtered = filtered.filter(item =>
            item.price >= priceRange[0] && item.price <= priceRange[1]
        );

        // Apply tab filter
        if (activeTab === 'favorites') {
            filtered = filtered.filter(item => favorites.includes(item._id));
        } else if (activeTab === 'popular') {
            filtered = filtered.filter(item => item.rating >= 4.0);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        setFilteredItems(filtered);
    }, [searchTerm, selectedCategory, menuItems, priceRange, activeTab, favorites, sortBy]);

    const handleAddToCart = (item) => {
        const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

        const itemIndex = existingCart.findIndex(cartItem => cartItem._id === item._id);

        if (itemIndex !== -1) {
            existingCart[itemIndex].quantity += 1;
        } else {
            existingCart.push({ ...item, quantity: 1 });
        }

        localStorage.setItem("cart", JSON.stringify(existingCart));
        setCart(existingCart);
        window.dispatchEvent(new Event("cartUpdated"));
        toast.success(`${item.name} added to cart!`);

        // Record interaction for recommendation system
        const userId = recommendationHelpers.getCurrentUserId();
        if (userId && recommendationHelpers.isUserLoggedIn()) {
            recommendationAPI.recordInteraction(userId, item._id, 'view')
                .catch(console.error);
        }
    };

    const handleRateItem = (menuItemId, rating) => {
        const userId = recommendationHelpers.getCurrentUserId();
        if (userId && recommendationHelpers.isUserLoggedIn()) {
            recommendationAPI.rateMenuItem(userId, menuItemId, rating)
                .then(() => {
                    toast.success('Rating submitted successfully!');
                })
                .catch((error) => {
                    console.error('Error rating item:', error);
                    toast.error('Failed to submit rating');
                });
        } else {
            toast.info('Please login to rate items');
        }
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };



    if (loading) {
        return (
            <>
                <Header />
                <div style={{
                    background: '#0A192F',
                    minHeight: '100vh',
                    position: 'relative',
                    overflow: 'hidden',
                    width: '100%',
                    margin: 0,
                    padding: 0,
                    paddingTop: '80px'
                }}>

                    {/* Main Content */}
                    <div style={{
                        position: 'relative',
                        zIndex: 2,
                        width: '100%',
                        margin: '0',
                        padding: '60px 1.5rem 1.5rem'
                    }}>
                        {/* Hero Section */}
                        <div style={{
                            textAlign: 'center',
                            marginBottom: '2rem',
                            padding: '1rem 0'
                        }}>
                            <h1 style={{
                                fontSize: '2.5rem',
                                fontWeight: '700',
                                background: 'linear-gradient(135deg, #ffffff 0%, #64ffda 30%, #bb86fc 70%, #ff6b9d 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                marginBottom: '0.5rem',
                                lineHeight: '1.1',
                                textShadow: '0 0 30px rgba(100, 255, 218, 0.3)'
                            }}>
                                Order Food
                            </h1>
                            <p style={{
                                fontSize: '1rem',
                                color: 'rgba(255, 255, 255, 0.8)',
                                margin: '0',
                                lineHeight: '1.4'
                            }}>
                                Loading delicious menu items...
                            </p>
                        </div>

                        {/* Loading Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                            gap: '1.5rem',
                            marginBottom: '2rem'
                        }}>
                            {Array(6).fill().map((_, index) => (
                                <div
                                    key={index}
                                    style={{
                                        background: 'linear-gradient(145deg, rgba(17, 34, 64, 0.8) 0%, rgba(26, 35, 50, 0.6) 100%)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(100, 255, 218, 0.2)',
                                        borderRadius: '1.5rem',
                                        overflow: 'hidden',
                                        height: '500px',
                                        animation: 'pulse 2s ease-in-out infinite',
                                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div style={{
                    background: '#0A192F',
                    minHeight: '100vh',
                    paddingTop: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        background: 'rgba(255, 87, 87, 0.1)',
                        border: '1px solid rgba(255, 87, 87, 0.3)',
                        borderRadius: '1rem',
                        padding: '2rem',
                        textAlign: 'center',
                        color: '#fff',
                        maxWidth: '400px'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😞</div>
                        <h3 style={{ color: '#ff5757', marginBottom: '1rem' }}>Oops! Something went wrong</h3>
                        <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{error}</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div style={{
                background: '#0A192F',
                minHeight: '100vh',
                paddingTop: '80px',
                width: '100%',
                margin: 0,
                padding: 0
            }}>
                {/* Hero Section */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '2rem',
                    padding: '2rem 1.5rem 1rem'
                }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #ffffff 0%, #64ffda 30%, #bb86fc 70%, #ff6b9d 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        marginBottom: '0.5rem',
                        lineHeight: '1.1',
                        textShadow: '0 0 30px rgba(100, 255, 218, 0.3)'
                    }}>
                        🍽️ Order Delicious Food
                    </h1>
                    <p style={{
                        fontSize: '1rem',
                        color: 'rgba(255, 255, 255, 0.8)',
                        margin: '0',
                        lineHeight: '1.4'
                    }}>
                        Discover amazing dishes crafted with love and passion
                    </p>
                </div>

                {/* Search and Filters Section */}
                <div style={{
                    background: 'rgba(100, 255, 218, 0.05)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    margin: '0 1.5rem 2rem',
                    border: '1px solid rgba(100, 255, 218, 0.1)'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1rem',
                        alignItems: 'end'
                    }}>
                        <div>
                            <label style={{
                                display: 'block',
                                color: '#64ffda',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                marginBottom: '0.5rem'
                            }}>
                                🔍 Search Menu
                            </label>
                            <div style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <FiSearch style={{
                                    position: 'absolute',
                                    left: '0.75rem',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    zIndex: 2
                                }} />
                                <input
                                    type="text"
                                    placeholder="Search delicious food..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                        background: '#0A192F',
                                        border: '1px solid rgba(100, 255, 218, 0.3)',
                                        borderRadius: '0.75rem',
                                        color: '#fff',
                                        fontSize: '0.9rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                color: '#64ffda',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                marginBottom: '0.5rem'
                            }}>
                                🏷️ Category
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#0A192F',
                                    border: '1px solid rgba(100, 255, 218, 0.3)',
                                    borderRadius: '0.75rem',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '0.85rem'
                        }}>
                            <span>📊 {filteredItems.length} items found</span>
                        </div>
                    </div>
                </div>

                {/* AI-Powered Recommendations Section */}
                <div style={{ margin: '0 1.5rem 2rem' }}>
                    <PersonalizedRecommendations
                        maxItems={6}
                        onAddToCart={handleAddToCart}
                        onRate={handleRateItem}
                        className="mb-5"
                    />
                </div>

                {/* Menu Items Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 350px))',
                    gap: '1.5rem',
                    padding: '0 1.5rem 2rem',
                    marginBottom: '2rem',
                    justifyContent: 'center'
                }}>
                    {loading ? (
                        Array(8).fill().map((_, index) => (
                            <div
                                key={index}
                                style={{
                                    background: 'linear-gradient(145deg, rgba(17, 34, 64, 0.6) 0%, rgba(26, 35, 50, 0.4) 100%)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '1rem',
                                    overflow: 'hidden',
                                    height: '320px',
                                    animation: 'pulse 2s ease-in-out infinite'
                                }}
                            />
                        ))
                    ) : filteredItems.length === 0 ? (
                        <div style={{
                            gridColumn: '1 / -1',
                            textAlign: 'center',
                            padding: '4rem 2rem',
                            color: 'rgba(255, 255, 255, 0.8)'
                        }}>
                            <div style={{
                                fontSize: '4rem',
                                marginBottom: '1rem'
                            }}>🍽️</div>
                            <h3 style={{
                                fontSize: '1.5rem',
                                fontWeight: '600',
                                color: '#fff',
                                marginBottom: '0.5rem'
                            }}>
                                No dishes found
                            </h3>
                            <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                                Try adjusting your search or category filters
                            </p>
                        </div>
                    ) : (
                        filteredItems.map((item) => (
                            <div
                                key={item._id}
                                style={{
                                    background: 'linear-gradient(145deg, rgba(17, 34, 64, 0.8) 0%, rgba(26, 35, 50, 0.6) 100%)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(100, 255, 218, 0.2)',
                                    borderRadius: '1rem',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(100, 255, 218, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                                }}
                            >
                                {/* Food Image */}
                                <div style={{ position: 'relative', paddingTop: '60%', overflow: 'hidden' }}>
                                    <img
                                        src={
                                            item.image
                                                ? (item.image.startsWith('http://') || item.image.startsWith('https://'))
                                                    ? item.image
                                                    : `http://localhost:8080${item.image}`
                                                : "/placeholder-food.jpg"
                                        }
                                        alt={item.name}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            transition: 'transform 0.3s ease'
                                        }}
                                        onError={(e) => {
                                            e.target.src = "/placeholder-food.jpg";
                                        }}
                                    />

                                    {/* Category Badge */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '0.75rem',
                                        left: '0.75rem',
                                        background: 'linear-gradient(135deg, #64ffda 0%, #4fd1c7 100%)',
                                        color: '#0a192f',
                                        padding: '0.3rem 0.6rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.7rem',
                                        fontWeight: '600',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                                    }}>
                                        {item.category}
                                    </div>

                                    {/* Price Badge */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '0.75rem',
                                        right: '0.75rem',
                                        background: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)',
                                        color: '#fff',
                                        padding: '0.3rem 0.6rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.7rem',
                                        fontWeight: '600',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                                    }}>
                                        Rs. {item.price.toFixed(0)}
                                    </div>

                                    {/* Availability Overlay */}
                                    {!item.availability && (
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'rgba(0, 0, 0, 0.7)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff',
                                            fontSize: '0.9rem',
                                            fontWeight: '600'
                                        }}>
                                            ❌ Unavailable
                                        </div>
                                    )}
                                </div>

                                {/* Card Content */}
                                <div style={{ padding: '1rem' }}>
                                    {/* Title */}
                                    <h3 style={{
                                        color: '#64ffda',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        margin: '0 0 0.5rem 0',
                                        lineHeight: '1.2',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 1,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {item.name}
                                    </h3>

                                    {/* Description */}
                                    <p style={{
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontSize: '0.8rem',
                                        lineHeight: '1.3',
                                        marginBottom: '1rem',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {item.description}
                                    </p>

                                    {/* Add to Cart Button */}
                                    <button
                                        onClick={() => handleAddToCart(item)}
                                        disabled={!item.availability}
                                        style={{
                                            width: '100%',
                                            padding: '0.6rem 1rem',
                                            background: item.availability
                                                ? 'linear-gradient(135deg, #64ffda 0%, #4fd1c7 100%)'
                                                : 'rgba(255, 255, 255, 0.1)',
                                            color: item.availability ? '#0a192f' : 'rgba(255, 255, 255, 0.5)',
                                            border: 'none',
                                            borderRadius: '0.6rem',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            cursor: item.availability ? 'pointer' : 'not-allowed',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            boxShadow: item.availability ? '0 4px 12px rgba(100, 255, 218, 0.3)' : 'none'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (item.availability) {
                                                e.target.style.transform = 'scale(1.02)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (item.availability) {
                                                e.target.style.transform = 'scale(1)';
                                            }
                                        }}
                                    >
                                        <FiShoppingCart size={14} />
                                        {item.availability ? 'Add to Cart' : 'Unavailable'}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Floating Cart */}
                {cart.length > 0 && (
                    <div style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        background: 'linear-gradient(135deg, #64ffda 0%, #4fd1c7 100%)',
                        color: '#0a192f',
                        padding: '1rem 1.5rem',
                        borderRadius: '2rem',
                        boxShadow: '0 8px 25px rgba(100, 255, 218, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        zIndex: 1000,
                        fontSize: '0.9rem',
                        fontWeight: '600'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 12px 35px rgba(100, 255, 218, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(100, 255, 218, 0.4)';
                    }}
                    >
                        <FiShoppingCart size={18} />
                        <span>{cart.length} items</span>
                        <span>•</span>
                        <span>Rs. {getCartTotal().toFixed(0)}</span>
                    </div>
                )}
            </div>
        </>
    );
}
