import "../styles/LoginScreen.css";
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { getErrorMessage } from "../api";

function LoginScreen() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const response = await api.get("/api/checkSession");
        if (cancelled) return;

        if (response.data.Message === true) {
          navigate("/dashboard", { replace: true });
        }
      } catch (err) {
        if (!cancelled) console.log("session error:", err);
      }
    }

    checkSession();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (isLoading) return;

    if (!email.trim() || !password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await api.post("/api/login", {
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (response.data.Message === true) {
        setPassword("");
        navigate("/dashboard", { replace: true });
      } else {
        setErrorMessage(response.data.error || "Invalid email or password.");
      }

    } catch (err) {
      setErrorMessage(getErrorMessage(err, "Invalid email or password."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-backdrop" />

      <div className="auth-card">
        <div className="auth-logo">✦</div>

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Login to jump back into your rooms</p>

        {errorMessage && <div className="auth-error">{errorMessage}</div>}

        <form onSubmit={handleLogin} noValidate>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Enter email"
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="forgot-password-row">
            <Link to="/forgot-password" className="auth-switch-link">
              Forgot password?
            </Link>
          </div>

          <button className="auth-button" type="submit" disabled={isLoading}>
            {isLoading ? <span className="spinner" /> : "Login"}
          </button>
        </form>

        <p className="auth-switch-text">
          Don't have an account?{" "}
          <Link to="/signup" className="auth-switch-link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginScreen;