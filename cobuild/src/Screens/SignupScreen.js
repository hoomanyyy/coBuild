import "../styles/SignupScreen.css";
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { getErrorMessage } from "../api";

function SignupScreen() {

  const [username, setUsername] = useState("");
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

  const handleSignup = async (e) => {
    e.preventDefault();

    if (isLoading) return;

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanUsername || !cleanEmail || !password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await api.post("/api/signup", {
        username: cleanUsername,
        email: cleanEmail,
        password: password,
      });

      if (response.data.Message === true) {
        setPassword("");
        localStorage.setItem("needVerification", "true");
        navigate("/verify-code", { state: { Email: cleanEmail } });
      } else {
        setErrorMessage(response.data.error || "Could not create account.");
      }

    } catch (err) {
      setErrorMessage(getErrorMessage(err, "Could not create account."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-backdrop" />

      <div className="auth-card">
        <div className="auth-logo">✦</div>

        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join and start collaborating in real time</p>

        {errorMessage && <div className="auth-error">{errorMessage}</div>}

        <form onSubmit={handleSignup} noValidate>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              placeholder="Enter username"
              autoComplete="username"
            />
          </div>

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
                autoComplete="new-password"
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

          <button className="auth-button" type="submit" disabled={isLoading}>
            {isLoading ? <span className="spinner" /> : "Sign Up"}
          </button>
        </form>

        <p className="auth-switch-text">
          Already have an account?{" "}
          <Link to="/login" className="auth-switch-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupScreen;