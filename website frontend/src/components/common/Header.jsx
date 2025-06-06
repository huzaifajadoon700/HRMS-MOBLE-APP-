import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button, Dropdown } from "react-bootstrap";
import { BsCart } from "react-icons/bs";
import { FiUser, FiShoppingBag, FiCalendar, FiHome, FiLogOut, FiLayout } from "react-icons/fi";
import { BiMessageSquare } from "react-icons/bi";
import { navList } from "../data/Data";
import "../../styles/theme.css";
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
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");
    if (name) setUserName(name);
    if (role) setUserRole(role);

    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartItems(cart.reduce((sum, item) => sum + item.quantity, 0));
    };

    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);
    return () => window.removeEventListener("cartUpdated", updateCartCount);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUserName(null);
    setUserRole(null);
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
            <span className="text-accent">HR</span>
            <span className="text-light">MS</span>
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
          <Nav className="mx-auto">
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

          <div className="d-flex align-items-center gap-3 auth-section">
            <Link to="/cart" className="cart-icon position-relative">
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
                  {userRole === "admin" && (
                    <Dropdown.Item as={Link} to="/dashboard">
                      <FiLayout className="me-2" />
                      Dashboard
                    </Dropdown.Item>
                  )}
                  <Dropdown.Item as={Link} to="/profile">
                    <FiUser className="me-2" />
                    Profile
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/my-orders">
                    <FiShoppingBag className="me-2" />
                    My Orders
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/my-reservations">
                    <FiCalendar className="me-2" />
                    My Reservations
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/my-bookings">
                    <FiHome className="me-2" />
                    My Bookings
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <FiLogOut className="me-2" />
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