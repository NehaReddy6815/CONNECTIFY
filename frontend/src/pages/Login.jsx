import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    username: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const formTitle = isLogin ? "Log In" : "Sign Up";
  const primaryButtonText = isLogin ? "Log in" : "Sign up";
  const switchMessage = isLogin ? "Don't have an account?" : "Have an account?";
  const switchActionText = isLogin ? "Sign up" : "Log in";

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

    const dataToSend = isLogin
      ? { email: formData.email, password: formData.password }
      : {
          email: formData.email,
          password: formData.password,
          name: formData.fullName,
          username: formData.username,
        };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (_) {}

      if (response.ok) {
        localStorage.setItem("token", data.token);
        if (onLogin) onLogin(data.user);
        navigate("/home");
      } else {
        setError(data.message || `${formTitle} failed`);
      }
    } catch (err) {
      setError("Connection error. Make sure backend is running.");
    }
    setLoading(false);
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setFormData({ email: "", password: "", fullName: "", username: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left panel (desktop only) */}
        <div className="hidden lg:flex justify-center">
          <div className="relative w-[380px] h-[580px] rounded-[40px] border-8 border-pink-500 bg-white shadow-2xl flex flex-col items-center pt-6">
            {/* Heart at top */}
            <div className="text-pink-500 text-3xl mb-4 animate-pulse">❤️</div>
            {/* Phone screen */}
            <div className="flex-1 w-[320px] bg-gray-50 rounded-3xl shadow-inner flex items-center justify-center">
              <span className="text-gray-300 font-semibold text-lg">
                Heylo
              </span>
            </div>
          </div>
        </div>

        {/* Right panel: Auth form */}
        <div className="w-full flex flex-col items-center">
          <div className="bg-white border border-gray-300 rounded-sm px-8 sm:px-10 pt-10 pb-6 w-full max-w-[380px]">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-serif font-thin text-gray-800 tracking-wide">
                Connectify
              </h1>
              {!isLogin && (
                <p className="text-gray-500 font-medium text-sm mt-3">
                  Create an account here to start using our Connectify!
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-2 rounded text-center mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-2">
              {!isLogin && (
                <>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                </>
              )}
              <input
                type="text"
                name="email"
                placeholder="Phone number, username, or email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />

              {!isLogin && (
                <p className="text-center text-[11px] text-gray-500 mt-4 px-2 leading-5">
                  People who use our service may have uploaded your contact information to Connectify.{" "}
                  <Link to="/policies" className="text-blue-500 underline hover:text-blue-700">
                    Learn More
                  </Link>.
                  <br />
                  By signing up, you agree to our Terms, Privacy Policy and Cookies Policy.
                </p>
              )}

              <button
                type="submit"
                disabled={
                  loading ||
                  (isLogin &&
                    (!formData.email || !formData.password)) ||
                  (!isLogin &&
                    (!formData.email ||
                      !formData.password ||
                      !formData.fullName ||
                      !formData.username))
                }
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-semibold py-2 rounded-md text-sm mt-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Please wait..." : primaryButtonText}
              </button>
            </form>

            {isLogin && (
              <div className="text-center mt-4">
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <div className="flex items-center text-gray-400 text-xs my-4">
              <div className="flex-1 border-t border-gray-300" />
              <span className="px-3 font-semibold text-gray-500">OR</span>
              <div className="flex-1 border-t border-gray-300" />
            </div>
          </div>

          <div className="bg-white border border-gray-300 rounded-sm p-4 text-center text-sm w-full max-w-[380px] mt-2">
            <span>{switchMessage} </span>
            <button
              onClick={switchMode}
              className="text-blue-500 font-semibold hover:text-blue-700"
            >
              {switchActionText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
