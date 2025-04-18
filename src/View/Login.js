import React, { useState } from "react";
import "./static/Login.css";
import { Link, useNavigate } from "react-router-dom";
import { validateLogin } from "../Controller/LoginValidation";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(""); // Store API error message

  const handleSubmit = (e) => {
    e.preventDefault();

    const validateErrors = validateLogin(email, password);
    if (Object.keys(validateErrors).length === 0) {
      setApiError(""); // Reset API error when validation passes

      // Perform login request
      axios
        .post("http://localhost:8081/login", { email, password })
        .then((response) => {
          const user = response.data.user;

          // Pass user data to the /home route and navigate there
          navigate("/home", { state: { user } });
        })
        .catch((error) => {
          // Handle error if the login fails
          if (error.response) {
            // Specific error message from server
            setApiError(error.response.data.message || "Invalid credentials");
          } else {
            // General error handling for other cases
            setApiError("An error occurred during login. Please try again.");
            console.error("Login error:", error);
          }
        });
    } else {
      setErrors(validateErrors); // Show validation errors
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Welcome Back</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email"
              required
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          <div className="input-group password-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                required
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
            {errors.password && (
              <span className="error">{errors.password}</span>
            )}
          </div>

          <button type="submit" className="login-btn">
            Log In
          </button>
          {apiError && <span className="error api-error">{apiError}</span>}
          <p className="terms">
            By logging in, you agree to our Terms and Policies.
          </p>
          <Link to="/signup" className="create-account-btn">
            Create Account
          </Link>
        </form>
      </div>
    </div>
  );
}

export default Login;
