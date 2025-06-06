import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { Toast, ToastContainer, Button, Form, Card } from "react-bootstrap";
import "../../styles/theme.css";
import "../../styles/AuthPage.css";
import axios from 'axios';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [toastMessage, setToastMessage] = useState({ message: "", type: "" });
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setFormData({ name: "", email: "", password: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateInputs = () => {
    const { name, email, password } = formData;

    if (!isLogin && !/^[a-zA-Z\s]+$/.test(name)) {
      showToastMessage("Name can only contain alphabets and spaces.", "danger");
      return false;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z]+[a-zA-Z.-]*\.[a-zA-Z]{2,}$/.test(email)) {
      showToastMessage("Invalid email format.", "danger");
      return false;
    }

    if (password.length < 6) {
      showToastMessage("Password must be at least 6 characters.", "danger");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setIsLoading(true);
    const endpoint = isLogin ? "/login" : "/signup";

    try {
      // Clear previous user data before logging in
      localStorage.clear();
      
      const response = await fetch(`http://localhost:8080/auth${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.jwtToken);
        localStorage.setItem("role", data.role);
        localStorage.setItem("name", data.name);
        localStorage.setItem("email", data.email);
        localStorage.setItem("phone", data.phone || "");
        localStorage.setItem("userId", data.userId);
        navigate(data.role === "admin" ? "/dashboard" : "/", { replace: true });
      } else {
        showToastMessage(data.message || "Error occurred", "danger");
      }
    } catch (error) {
      showToastMessage("Internal Server Error", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (response) => {
    setIsLoading(true);
    const googleToken = response.credential;
    try {
      // Clear previous user data before logging in
      localStorage.clear();
      
      const res = await fetch("http://localhost:8080/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: googleToken }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.jwtToken);
        localStorage.setItem("role", data.role);
        localStorage.setItem("name", data.name);
        localStorage.setItem("email", data.email);
        localStorage.setItem("phone", data.phone || "");
        localStorage.setItem("userId", data.userId);
        navigate(data.role === "admin" ? "/dashboard" : "/", { replace: true });
      } else {
        showToastMessage(data.message || "Error occurred", "danger");
      }
    } catch (error) {
      showToastMessage("Internal Server Error", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const showToastMessage = (message, type) => {
    setToastMessage({ message, type });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  return (
    <div className="page-container">
      <div className="auth-container">
        <ToastContainer position="bottom-end" className="p-3">
          <Toast bg={toastMessage.type} show={showToast} onClose={() => setShowToast(false)}>
            <Toast.Body>{toastMessage.message}</Toast.Body>
          </Toast>
        </ToastContainer>

        <div className="auth-wrapper glass animate-fade-in">
          <div className="auth-image"></div>

          <div className="auth-form">
            <Card className="auth-card">
              <Card.Body>
                <h3 className="auth-title">{isLogin ? "Welcome Back" : "Create Account"}</h3>
                <p className="auth-subtext">
                  {isLogin ? "Sign in to continue your journey." : "Join us to explore the cosmos."}
                </p>

                <Form onSubmit={handleSubmit}>
                  {!isLogin && (
                    <Form.Group className="mb-4">
                      <Form.Label>Name</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required 
                        placeholder="Enter your full name"
                        className="form-control"
                      />
                    </Form.Group>
                  )}

                  <Form.Group className="mb-4">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email"
                      className="form-control"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter your password"
                      className="form-control"
                    />
                  </Form.Group>

                  <Button 
                    type="submit" 
                    className="btn btn-primary w-100 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
                  </Button>
                </Form>

                <div className="google-login">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => showToastMessage("Google login failed", "danger")}
                    theme="filled_blue"
                    shape="pill"
                    size="large"
                    text={isLogin ? "continue_with" : "signup_with"}
                    logo_alignment="left"
                    disabled={isLoading}
                  />
                </div>

                <p className="auth-toggle mt-3">
                  {isLogin ? "New to the cosmos?" : "Already among the stars?"}{" "}
                  <span onClick={handleToggle}>{isLogin ? "Create Account" : "Sign In"}</span>
                </p>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;