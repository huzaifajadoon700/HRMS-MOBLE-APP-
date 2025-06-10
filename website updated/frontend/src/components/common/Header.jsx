import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button, Dropdown } from "react-bootstrap";
import { BsCart } from "react-icons/bs";
import { FiUser, FiShoppingBag, FiCalendar, FiHome, FiLogOut, FiLayout } from "react-icons/fi";
import { BiMessageSquare } from "react-icons/bi";
import { navList } from "../data/Data";
import "../../styles/simple-theme.css";
import "./header.css";

export default function Header() {
  const [userName, setUserName] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [cartItems, setCartItems] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const updateUserData = () => {
      const name = localStorage.getItem("name");
      const role = localStorage.getItem("role");
      setUserName(name);
      setUserRole(role);
    };

    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartItems(cart.reduce((sum, item) => sum + item.quantity, 0));
    };

    // Initial load
    updateUserData();
    updateCartCount();

    // Listen for auth state changes
    window.addEventListener("authStateChanged", updateUserData);
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("authStateChanged", updateUserData);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUserName(null);
    setUserRole(null);

    // Dispatch custom event to update header
    window.dispatchEvent(new Event('authStateChanged'));

    navigate("/login", { replace: true });
  };

  return (
    <Navbar
      expand="lg"
      fixed="top"
      className={`navbar-custom ${scrolled ? "navbar-scrolled" : ""}`}
      variant="dark"
      style={{ marginTop: "0px" }}
    >
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          className="d-flex align-items-center gap-2 brand-link"
        >
          <div className="logo-glow">
            <span className="text-accent">HOTEL</span>
            <span className="text-light">ROYAL</span>
          </div>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" className="mobile-menu">
          <div className="hamburger">
            <span />
            <span />
            <span />
          </div>
        </Navbar.Toggle>

        <Navbar.Collapse id="main-nav">
          <Nav className="navbar-nav">
            {navList.map((item) => (
              <Nav.Link
                key={item.id}
                as={Link}
                to={item.path}
                className="nav-link"
              >
                {item.text}
              </Nav.Link>
            ))}
            <Nav.Link as={Link} to="/help" className="nav-link">
              Help
            </Nav.Link>
            {userName && (
              <Nav.Link
                as={Link}
                to="/feedback"
                className="nav-link"
              >
                <BiMessageSquare className="me-1" />
                Feedback
              </Nav.Link>
            )}
          </Nav>

          <div className="d-flex align-items-center gap-4 auth-section">
            <Link to="/cart" className="cart-icon position-relative text-decoration-none">
              <BsCart size={20} className="text-light" />
              {cartItems > 0 && (
                <span className="cart-badge">{cartItems}</span>
              )}
            </Link>

            {userName ? (
              <Dropdown>
                <Dropdown.Toggle variant="link" className="user-greeting d-flex align-items-center gap-2">
                  <FiUser size={18} className="text-light" />
                  <span className="text-light">{userName}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu-custom">
                  {/* Enhanced User Header */}
                  <div className="dropdown-header-custom">
                    <div className="user-avatar">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                      <h6>{userName}</h6>
                      <p>{userRole === "admin" ? "Administrator" : "Guest"}</p>
                    </div>
                  </div>

                  {userRole === "admin" && (
                    <Dropdown.Item as={Link} to="/dashboard" className="admin-item">
                      <FiLayout className="dropdown-icon" />
                      Dashboard
                    </Dropdown.Item>
                  )}
                  <Dropdown.Item as={Link} to="/profile">
                    <FiUser className="dropdown-icon" />
                    Profile
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/my-orders">
                    <FiShoppingBag className="dropdown-icon" />
                    My Orders
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/my-reservations">
                    <FiCalendar className="dropdown-icon" />
                    My Reservations
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/my-bookings">
                    <FiHome className="dropdown-icon" />
                    My Bookings
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="logout-item">
                    <FiLogOut className="dropdown-icon" />
                    Log Out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Button
                onClick={() => navigate("/login")}
                className="auth-button"
              >
                Sign In
              </Button>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}