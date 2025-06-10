import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiStar, FiShield, FiCheckCircle } from "react-icons/fi";
import "./Login.css";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [toastMessage, setToastMessage] = useState({ message: "", type: "" });
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

      // Prepare request body based on operation
      const requestBody = isLogin
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const response = await fetch(`http://localhost:8080/auth${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.jwtToken);
        localStorage.setItem("role", data.role);
        localStorage.setItem("name", data.name);
        localStorage.setItem("email", data.email);
        localStorage.setItem("phone", data.phone || "");
        localStorage.setItem("userId", data.userId);

        // Dispatch custom event to update header
        window.dispatchEvent(new Event('authStateChanged'));

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

        // Dispatch custom event to update header
        window.dispatchEvent(new Event('authStateChanged'));

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
    <div className="modern-login-page">
      {/* Left Side - Branding */}
      <div className="login-branding">
        <div className="branding-content">
          <div className="brand-logo">
            <FiStar size={48} className="logo-icon" />
            <h1 className="brand-title">Night Elegance</h1>
            <p className="brand-subtitle">Premium Dining Experience</p>
          </div>

          <div className="features-list">
            <div className="feature-item">
              <FiCheckCircle className="feature-icon" />
              <span>Exquisite Cuisine</span>
            </div>
            <div className="feature-item">
              <FiCheckCircle className="feature-icon" />
              <span>Premium Service</span>
            </div>
            <div className="feature-item">
              <FiCheckCircle className="feature-icon" />
              <span>Elegant Ambiance</span>
            </div>
            <div className="feature-item">
              <FiCheckCircle className="feature-icon" />
              <span>Memorable Experiences</span>
            </div>
          </div>

          <div className="testimonial">
            <p>"An unforgettable dining experience that exceeds all expectations."</p>
            <span>- Satisfied Customer</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-form-section">
        <div className="form-container">
          <div className="form-header">
            <h2 className="form-title">
              {isLogin ? "Welcome Back" : "Join Us Today"}
            </h2>
            <p className="form-subtitle">
              {isLogin
                ? "Sign in to access your account and continue your culinary journey"
                : "Create your account and discover amazing dining experiences"
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">
                  <FiUser className="label-icon" />
                  Full Name
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="form-input"
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                <FiMail className="label-icon" />
                Email Address
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email address"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <FiLock className="label-icon" />
                Password
              </label>
              <div className="input-wrapper password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Processing...
                </>
              ) : (
                <>
                  <FiShield className="btn-icon" />
                  {isLogin ? "Sign In" : "Create Account"}
                </>
              )}
            </button>
          </form>

          <div className="divider">
            <span>or continue with</span>
          </div>

          <div className="google-login-wrapper">
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

          <div className="auth-toggle">
            <p>
              {isLogin ? "New to Night Elegance?" : "Already have an account?"}{" "}
              <button
                type="button"
                className="toggle-btn"
                onClick={handleToggle}
              >
                {isLogin ? "Create Account" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {showToast && (
        <div className={`toast-notification ${toastMessage.type}`}>
          <div className="toast-content">
            <FiCheckCircle className="toast-icon" />
            <span>{toastMessage.message}</span>
          </div>
          <button
            className="toast-close"
            onClick={() => setShowToast(false)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthPage;