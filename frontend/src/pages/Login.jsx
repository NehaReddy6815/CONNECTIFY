import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./Login.css"; // optional styles
import Navbar from "../components/Navbar";

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const baseURL = "http://localhost:5000";
    const endpoint = isLogin
      ? `${baseURL}/api/auth/login`
      : `${baseURL}/api/auth/register`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // ✅ fixed
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);

        if (onLogin) {
          onLogin(data.user);
        }

        navigate("/home");
      } else {
        setError(data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Auth error:", error);
      setError("Connection error. Make sure backend is running on port 5000");
    }

    setLoading(false);
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setFormData({ name: "", email: "", password: "" });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Connectify</h1>
          <p>Connect with friends and the world around you</p>
        </div>

        <div className="auth-card">
          <h2>{isLogin ? "Log In" : "Create Account"}</h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="input-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="auth-input"
                />
              </div>
            )}

            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="auth-input"
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength="6"
                className="auth-input"
              />
            </div>

            <button
              type="submit"
              className="auth-button primary"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Log In"
                : "Create Account"}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button
            type="button"
            onClick={switchMode}
            className="auth-button secondary"
          >
            {isLogin ? "Create New Account" : "Already have an account? Log In"}
          </button>
        </div>

        <div className="login-footer">
          <p>&copy; 2024 Connectify. Connect, Share, Engage.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
