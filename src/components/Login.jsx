import { useState } from "react";
import {
  Building2,
  Mail,
  Lock,
  ArrowRight,
  BarChart3,
  Package,
  TrendingUp,
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

const API_BASE = "https://jayaraman-coconuts-8rvj.onrender.com/api";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // NORMAL EMAIL / PASSWORD LOGIN
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      onLogin(data.user);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GOOGLE LOGIN
  // =====================================================

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError("");
      setGoogleLoading(true);

      if (!credentialResponse?.credential) {
        throw new Error("Google credential not received");
      }

      const response = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Google authentication failed"
        );
      }

      // Save BizFlow JWT
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Open dashboard
      onLogin(data.user);
    } catch (err) {
      console.error("Google login error:", err);
      setError(
        err.message || "Google authentication failed"
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google Sign-In failed. Please try again.");
  };

  return (
    <div className="bizflow-login">
      {/* Animated background elements */}
      <div className="login-orb login-orb-one"></div>
      <div className="login-orb login-orb-two"></div>

      <div className="login-container">
        {/* ================================================= */}
        {/* LEFT BUSINESS PANEL */}
        {/* ================================================= */}

        <div className="login-brand-panel">
          <div className="brand-content">
            <div className="bizflow-logo">
              <Building2 size={28} strokeWidth={2.2} />
            </div>

            <h1>BizFlow</h1>

            <p className="brand-tagline">
              Smart business management,
              <br />
              simplified.
            </p>

            <p className="brand-description">
              Manage your business operations, track performance,
              monitor inventory and stay in control — all from one
              powerful platform.
            </p>

            <div className="business-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <BarChart3 size={20} />
                </div>

                <div>
                  <strong>Business Analytics</strong>
                  <span>
                    Understand your business performance
                  </span>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <Package size={20} />
                </div>

                <div>
                  <strong>Inventory Management</strong>
                  <span>
                    Track products and stock effortlessly
                  </span>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <TrendingUp size={20} />
                </div>

                <div>
                  <strong>Sales & Growth</strong>
                  <span>
                    Monitor sales and business growth
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* LOGIN PANEL */}
        {/* ================================================= */}

        <div className="login-form-panel">
          <div className="login-card">
            <div className="mobile-logo">
              <div className="bizflow-logo">
                <Building2 size={24} />
              </div>

              <span>BizFlow</span>
            </div>

            <div className="login-heading">
              <h2>Welcome back</h2>

              <p>
                Sign in to continue to your business dashboard.
              </p>
            </div>

            {/* ================================================= */}
            {/* GOOGLE LOGIN */}
            {/* ================================================= */}

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "18px",
                minHeight: "44px",
              }}
            >
              {googleLoading ? (
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  Signing in with Google...
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                  width="350"
                />
              )}
            </div>

            {/* DIVIDER */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                margin: "8px 0 20px",
                color: "#999",
                fontSize: "13px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: "#e5e5e5",
                }}
              />

              <span>OR</span>

              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: "#e5e5e5",
                }}
              />
            </div>

            {/* ================================================= */}
            {/* EMAIL / PASSWORD */}
            {/* ================================================= */}

            <form onSubmit={handleSubmit}>
              {/* EMAIL */}

              <div className="form-group">
                <label>Email address</label>

                <div className="input-wrapper">
                  <Mail size={19} />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div className="form-group">
                <label>Password</label>

                <div className="input-wrapper">
                  <Lock size={19} />

                  <input
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* FORGOT PASSWORD */}

              <div className="forgot-row">
                <button
                  type="button"
                  className="forgot-button"
                  onClick={() =>
                    setError(
                      "Password reset with OTP will be available soon."
                    )
                  }
                >
                  Forgot password?
                </button>
              </div>

              {/* ERROR */}

              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                <span>
                  {loading ? "Signing in..." : "Sign in"}
                </span>

                {!loading && <ArrowRight size={19} />}
              </button>
            </form>

            {/* FOOTER */}

            <div className="login-footer">
              <span>Secure business access</span>
              <span>•</span>
              <span>BizFlow</span>
            </div>
          </div>
        </div>
      </div>

      {/* Small bottom text */}

      <div className="login-bottom-text">
        © 2026 BizFlow · Business Management Platform
      </div>
    </div>
  );
}

export default Login;