import React, { useEffect, useState } from "react";
import { Button, Card, Container, Row, Col, Form, Badge } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { FiSearch, FiShoppingCart } from "react-icons/fi";
import '../styles/theme.css';
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
        
        setFilteredItems(filtered);
    }, [searchTerm, selectedCategory, menuItems]);

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
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    if (loading) {
        return (
            <Container className="mt-5 menu-container">
                <div className="loading-skeleton">
                    <Row>
                        {[1, 2, 3].map(i => (
                            <Col key={i} md={4} className="mb-4">
                                <Card className="skeleton-card">
                                    <div className="skeleton-image"></div>
                                    <Card.Body>
                                        <div className="skeleton-title"></div>
                                        <div className="skeleton-text"></div>
                                        <div className="skeleton-price"></div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5 menu-container">
                <div className="error-message">{error}</div>
            </Container>
        );
    }

    return (
        <Container className="menu-container">
            <div className="menu-header">
                <h1 className="page-title">Order Food</h1>
                <div className="menu-controls">
                    <div className="search-box" >
                        <FiSearch className="search-icon" style={{ marginRight: '10px' }} />
                        <Form.Control
                            type="text"
                            placeholder="Search menu items..."
                            className="search-input mx-5"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Form.Select
                        className="category-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </Form.Select>
                </div>
            </div>

            {loading ? (
                <Row>
                    {[...Array(6)].map((_, index) => (
                        <Col key={index} xs={12} sm={6} md={4} className="mb-4">
                            <div className="skeleton-card">
                                <div className="skeleton-image" />
                                <div className="p-3">
                                    <div className="skeleton-title" />
                                    <div className="skeleton-text" />
                                    <div className="skeleton-text" />
                                    <div className="skeleton-price" />
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Row>
                    {filteredItems.map((item) => (
                        <Col key={item._id} xs={12} sm={6} md={4} className="mb-4">
                            <Card className="menu-item">
                                <div className="menu-item-image-container">
                                    <img
                                        src={`http://localhost:8080${item.image}`}
                                        alt={item.name}
                                        className="menu-item-image"
                                    />
                                    {!item.availability && (
                                        <div className="unavailable-overlay">
                                            <span>Unavailable</span>
                                        </div>
                                    )}
                                </div>
                                <div className="menu-item-content">
                                    <div className="menu-item-header">
                                        <h3 className="menu-item-title">{item.name}</h3>
                                        <Badge className="menu-item-category">
                                            {item.category}
                                        </Badge>
                                    </div>
                                    <p className="menu-item-description">{item.description}</p>
                                    <div className="menu-item-footer">
                                        <p className="menu-item-price">${item.price.toFixed(2)}</p>
                                        <Button
                                            className="add-to-cart-button"
                                            onClick={() => handleAddToCart(item)}
                                            disabled={!item.availability}
                                        >
                                            Add to Cart
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {cart.length > 0 && (
                <div className="floating-cart">
                    <div className="cart-summary">
                        <FiShoppingCart className="cart-icon" />
                        <span className="cart-count">{cart.length} items</span>
                        <span className="cart-total">${getCartTotal().toFixed(2)}</span>
                    </div>
                </div>
            )}
        </Container>
    );
}
