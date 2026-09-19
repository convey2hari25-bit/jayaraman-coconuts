import React, { useState } from "react";
import {
  Building2,
  Package,
  BarChart3,
  Users,
  ShoppingCart,
  BriefcaseBusiness,
  Factory,
  Utensils,
  Sprout,
  Monitor,
  MoreHorizontal,
  UserRound,
  Phone,
  MapPin,
  Globe2,
  LockKeyhole,
  ArrowRight,
  Check,
  TrendingUp,
  Settings2,
} from "lucide-react";

const API_BASE =
  "https://jayaraman-coconuts-8rvj.onrender.com/api";

function BusinessSetup({ user, onComplete }) {
  const [formData, setFormData] = useState({
    business_name: "",
    business_type: "",
    owner_name: user?.name || "",
    phone: user?.phone || "",
    business_address: "",
    currency: "INR",
    region: "India",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const businessTypes = [
    { value: "Retail", label: "Retail", icon: ShoppingCart },
    { value: "Wholesale", label: "Wholesale", icon: Package },
    { value: "Manufacturing", label: "Manufacturing", icon: Factory },
    { value: "Food & Beverage", label: "Food & Beverage", icon: Utensils },
    { value: "Services", label: "Services", icon: BriefcaseBusiness },
    { value: "E-commerce", label: "E-commerce", icon: ShoppingCart },
    { value: "Agriculture", label: "Agriculture", icon: Sprout },
    { value: "Technology", label: "Technology", icon: Monitor },
    { value: "Other", label: "Other", icon: MoreHorizontal },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleBusinessType = (value) => {
    setFormData((prev) => ({
      ...prev,
      business_type: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.business_name.trim() ||
      !formData.business_type ||
      !formData.owner_name.trim() ||
      !formData.phone.trim() ||
      !formData.business_address.trim() ||
      !formData.currency ||
      !formData.region
    ) {
      setError("Please fill all the details.");
      return;
    }

    try {
      setLoading(true);

      const token =
        localStorage.getItem("authToken") ||
        localStorage.getItem("token");

      if (!token) {
        setError("Authentication session expired. Please login again.");
        return;
      }

      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to save business profile"
        );
      }

      localStorage.setItem("user", JSON.stringify(data.user));

      if (onComplete) {
        onComplete(data.user);
      }
    } catch (err) {
      console.error("Business setup error:", err);
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedBusiness = businessTypes.find(
    (item) => item.value === formData.business_type
  );

  return (
    <div className="bizflow-setup">
      <div className="bg-glow glow-purple" />
      <div className="bg-glow glow-blue" />
      <div className="bg-glow glow-pink" />
      <div className="background-grid" />

      <div className="bizflow-brand">
        <div className="brand-logo">B</div>
        <div>
          <div className="brand-title">BizFlow</div>
          <div className="brand-tagline">Your Business. Simplified.</div>
        </div>
      </div>

      <div className="trusted-pill">
        <span>Trusted by</span>
        <div className="tiny-avatars">
          <div>H</div>
          <div>R</div>
          <div>S</div>
        </div>
        <strong>+10K</strong>
      </div>

      <div className="floating-ui sales-ui">
        <div className="floating-ui-header">
          <span>Total Sales</span>
          <div className="floating-icon purple-bg">
            <BarChart3 size={15} />
          </div>
        </div>
        <strong className="big-number">₹ 1,24,500</strong>
        <div className="growth">
          <TrendingUp size={13} />
          12.5%
        </div>
        <div className="mini-bars">
          <span style={{ height: "25%" }} />
          <span style={{ height: "40%" }} />
          <span style={{ height: "55%" }} />
          <span style={{ height: "75%" }} />
          <span style={{ height: "100%" }} />
        </div>
      </div>

      <div className="floating-ui products-ui">
        <div className="floating-ui-header">
          <span>Products</span>
          <div className="floating-icon blue-bg">
            <Package size={15} />
          </div>
        </div>
        <strong className="big-number">248</strong>
        <small>In Stock</small>
        <div className="stock-line">
          <div />
        </div>
      </div>

      <div className="floating-ui customers-ui">
        <div className="floating-ui-header">
          <span>Happy Customers</span>
          <div className="floating-icon pink-bg">
            <Users size={15} />
          </div>
        </div>
        <strong className="big-number">1,482</strong>
        <div className="customer-stack">
          <div>H</div>
          <div>R</div>
          <div>S</div>
          <div className="plus">+</div>
        </div>
      </div>

      <div className="floating-ui growth-ui">
        <span>Business Growth</span>
        <strong>+24.8%</strong>
        <svg viewBox="0 0 250 70" className="growth-chart">
          <defs>
            <linearGradient
              id="chartGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <path
            d="M0 55 C35 60, 45 25, 75 40 S115 15, 145 35 S185 45, 215 15 S235 25, 250 5"
            fill="none"
            stroke="url(#chartGradient)"
            strokeWidth="4"
          />
        </svg>
      </div>

      <div className="business-image-card image-card-right">
        <div className="business-photo retail-photo">
          <div className="photo-overlay" />
          <div className="photo-label">
            <strong>Your Business</strong>
            <span>Your Rules</span>
            <small>
              Flexible tools for every type of business.
            </small>
          </div>
          <div className="round-arrow">
            <ArrowRight size={17} />
          </div>
        </div>
      </div>

      <div className="business-image-card image-card-left">
        <div className="business-photo store-photo">
          <div className="photo-overlay" />
          <div className="photo-label bottom-label">
            <strong>
              From Products
              <br />
              to Profits
            </strong>
            <small>
              Everything you need to run your business.
            </small>
          </div>
          <div className="round-arrow">
            <ArrowRight size={17} />
          </div>
        </div>
      </div>

      <div className="floating-ui all-in-one">
        <strong>
          All-in-One
          <br />
          Business Management
        </strong>
        <div className="all-icons">
          <div><Package size={17} /></div>
          <div><BarChart3 size={17} /></div>
          <div><Users size={17} /></div>
          <div><Settings2 size={17} /></div>
        </div>
      </div>

      <div className="main-layout">
        <div className="hero-copy">
          <div className="hero-eyebrow">✦ BUILD • GROW • SUCCEED</div>

          <h1>
            Turn your
            <br />
            business ideas
            <br />
            into <span>real growth</span>
          </h1>

          <p>
            Set up your workspace and start managing your business with ease.
          </p>

          <div className="hero-features">
            <div>
              <div className="feature-icon feature-blue">
                <Package size={19} />
              </div>
              <div>
                <strong>Manage Inventory</strong>
                <span>Keep your stock in control</span>
              </div>
            </div>

            <div>
              <div className="feature-icon feature-orange">
                <BarChart3 size={19} />
              </div>
              <div>
                <strong>Track Sales</strong>
                <span>Get real-time insights</span>
              </div>
            </div>

            <div>
              <div className="feature-icon feature-purple">
                <Users size={19} />
              </div>
              <div>
                <strong>Manage Customers</strong>
                <span>Build strong relationships</span>
              </div>
            </div>

            <div>
              <div className="feature-icon feature-green">
                <TrendingUp size={19} />
              </div>
              <div>
                <strong>Grow Your Business</strong>
                <span>All in one place</span>
              </div>
            </div>
          </div>
        </div>

        <div className="setup-card">
          <div className="setup-card-glow" />

          <div className="setup-card-content">
            <div className="setup-header">
              <div>
                <div className="step-label">STEP 1 OF 1</div>

                <h2>
                  Set up your
                  <br />
                  business workspace
                </h2>

                <p>Tell us about your business to get started.</p>
              </div>

              <div className="setup-icon">
                <Building2 size={21} />
              </div>
            </div>

            {error && (
              <div className="error-box">
                <div className="error-circle">!</div>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>
                  Business Name <span>*</span>
                </label>

                <div className="glass-input">
                  <Building2 size={16} />
                  <input
                    type="text"
                    name="business_name"
                    value={formData.business_name}
                    onChange={handleChange}
                    placeholder="Enter your business name"
                  />
                  {formData.business_name && (
                    <Check size={15} className="valid-check" />
                  )}
                </div>
              </div>

              <div className="field">
                <div className="field-heading">
                  <label>
                    Business Type <span>*</span>
                  </label>

                  {selectedBusiness && (
                    <small>{selectedBusiness.label}</small>
                  )}
                </div>

                <div className="business-grid">
                  {businessTypes.map((type) => {
                    const Icon = type.icon;
                    const active =
                      formData.business_type === type.value;

                    return (
                      <button
                        key={type.value}
                        type="button"
                        className={`type-card ${active ? "active" : ""}`}
                        onClick={() =>
                          handleBusinessType(type.value)
                        }
                      >
                        <Icon size={17} />
                        <span>{type.label}</span>

                        {active && (
                          <div className="selected-check">
                            <Check size={9} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="two-column">
                <div className="field">
                  <label>
                    Owner Name <span>*</span>
                  </label>

                  <div className="glass-input">
                    <UserRound size={15} />
                    <input
                      type="text"
                      name="owner_name"
                      value={formData.owner_name}
                      onChange={handleChange}
                      placeholder="Owner name"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>
                    Phone Number <span>*</span>
                  </label>

                  <div className="glass-input">
                    <Phone size={15} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>
              </div>

              <div className="field">
                <label>
                  Business Address <span>*</span>
                </label>

                <div className="glass-input">
                  <MapPin size={16} />
                  <input
                    type="text"
                    name="business_address"
                    value={formData.business_address}
                    onChange={handleChange}
                    placeholder="City, State, Country"
                  />
                </div>
              </div>

              <div className="two-column">
                <div className="field">
                  <label>
                    Currency <span>*</span>
                  </label>

                  <div className="glass-input">
                    <span className="currency-symbol">₹</span>

                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label>
                    Region <span>*</span>
                  </label>

                  <div className="glass-input">
                    <Globe2 size={15} />

                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                    >
                      <option value="India">India</option>
                      <option value="United States">
                        United States
                      </option>
                      <option value="United Kingdom">
                        United Kingdom
                      </option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="continue-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Continue to Dashboard
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="secure-note">
                <LockKeyhole size={11} />
                Your information is securely stored.
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="bottom-brand">
        <span>BIZFLOW</span>
        <i />
        <span>
          YOUR PARTNER
          <br />
          IN PROGRESS
        </span>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .bizflow-setup {
          min-height: 100vh;
          width: 100%;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(circle at 50% 45%, rgba(76, 29, 149, .35), transparent 34%),
            radial-gradient(circle at 8% 50%, rgba(37, 99, 235, .25), transparent 28%),
            radial-gradient(circle at 94% 55%, rgba(217, 70, 239, .24), transparent 28%),
            #03091d;
          color: #fff;
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          padding: 28px 38px 30px;
        }

        .background-grid {
          position: absolute;
          inset: 0;
          opacity: .12;
          background-image:
            linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px);
          background-size: 46px 46px;
          pointer-events: none;
        }

        .bg-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(110px);
          pointer-events: none;
          opacity: .3;
          animation: glowMove 9s ease-in-out infinite alternate;
        }

        .glow-purple {
          width: 480px;
          height: 480px;
          left: 25%;
          top: 20%;
          background: #7c3aed;
        }

        .glow-blue {
          width: 400px;
          height: 400px;
          right: -120px;
          top: 20%;
          background: #06b6d4;
          animation-delay: 2s;
        }

        .glow-pink {
          width: 380px;
          height: 380px;
          left: 38%;
          bottom: -220px;
          background: #ec4899;
          animation-delay: 4s;
        }

        @keyframes glowMove {
          from { transform: translate(0,0) scale(1); }
          to { transform: translate(25px,-18px) scale(1.12); }
        }

        .bizflow-brand {
          position: relative;
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 11px;
          width: max-content;
        }

        .brand-logo {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg,#fff,#dbeafe);
          color: #1531a4;
          font-size: 25px;
          font-weight: 900;
          box-shadow: 0 0 28px rgba(96,165,250,.3);
        }

        .brand-title {
          font-size: 19px;
          font-weight: 800;
          line-height: 1;
        }

        .brand-tagline {
          margin-top: 4px;
          color: #94a3b8;
          font-size: 10px;
        }

        .trusted-pill {
          position: absolute;
          z-index: 20;
          top: 32px;
          right: 42px;
          display: flex;
          align-items: center;
          gap: 9px;
          color: #94a3b8;
          font-size: 10px;
        }

        .trusted-pill strong {
          color: #e2e8f0;
          font-size: 11px;
        }

        .tiny-avatars {
          display: flex;
          margin-left: 3px;
        }

        .tiny-avatars div {
          width: 25px;
          height: 25px;
          margin-left: -5px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          border: 2px solid #101938;
          background: linear-gradient(135deg,#f97316,#ec4899);
          color: white;
          font-size: 8px;
          font-weight: 800;
        }

        .tiny-avatars div:nth-child(2) {
          background: linear-gradient(135deg,#22c55e,#06b6d4);
        }

        .tiny-avatars div:nth-child(3) {
          background: linear-gradient(135deg,#6366f1,#a855f7);
        }

        .main-layout {
          position: relative;
          z-index: 10;
          width: min(1180px, calc(100vw - 76px));
          margin: 30px auto 0;
          display: grid;
          grid-template-columns: 340px 510px;
          gap: 55px;
          align-items: center;
          justify-content: center;
        }

        .hero-copy {
          padding-top: 10px;
        }

        .hero-eyebrow {
          color: #a78bfa;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.8px;
          margin-bottom: 18px;
        }

        .hero-copy h1 {
          margin: 0;
          font-size: clamp(40px,4.2vw,58px);
          line-height: 1.02;
          letter-spacing: -2.5px;
          font-weight: 800;
        }

        .hero-copy h1 span {
          background: linear-gradient(90deg,#fff,#c084fc,#22d3ee);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .hero-copy > p {
          max-width: 310px;
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.7;
          margin: 22px 0 28px;
        }

        .hero-features {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .hero-features > div {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .feature-icon {
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.08);
        }

        .feature-blue { color: #38bdf8; }
        .feature-orange { color: #fb923c; }
        .feature-purple { color: #c084fc; }
        .feature-green { color: #34d399; }

        .hero-features strong,
        .hero-features span {
          display: block;
        }

        .hero-features strong {
          color: #f8fafc;
          font-size: 12px;
        }

        .hero-features span {
          margin-top: 3px;
          color: #64748b;
          font-size: 10px;
        }

        .setup-card {
          position: relative;
          min-height: 650px;
          border-radius: 28px;
          overflow: hidden;
          background: linear-gradient(145deg,rgba(31,25,82,.94),rgba(9,15,45,.96));
          border: 1px solid rgba(167,139,250,.38);
          box-shadow:
            0 0 0 1px rgba(34,211,238,.06),
            0 35px 100px rgba(0,0,0,.48),
            0 0 70px rgba(124,58,237,.23);
          backdrop-filter: blur(22px);
        }

        .setup-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 80% 5%,rgba(139,92,246,.25),transparent 28%),
            radial-gradient(circle at 15% 90%,rgba(6,182,212,.12),transparent 28%);
          pointer-events: none;
        }

        .setup-card-glow {
          position: absolute;
          width: 250px;
          height: 250px;
          border-radius: 50%;
          background: #8b5cf6;
          filter: blur(100px);
          opacity: .14;
          right: -130px;
          bottom: -110px;
        }

        .setup-card-content {
          position: relative;
          z-index: 2;
          padding: 30px 34px 26px;
        }

        .setup-header {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 18px;
        }

        .step-label {
          color: #818cf8;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.5px;
          margin-bottom: 7px;
        }

        .setup-header h2 {
          margin: 0;
          color: #f8fafc;
          font-size: 26px;
          line-height: 1.06;
          letter-spacing: -.8px;
        }

        .setup-header p {
          margin: 7px 0 0;
          color: #94a3b8;
          font-size: 11px;
        }

        .setup-icon {
          width: 43px;
          height: 43px;
          flex: 0 0 43px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          color: #c4b5fd;
          background: linear-gradient(135deg,rgba(139,92,246,.3),rgba(6,182,212,.12));
          border: 1px solid rgba(167,139,250,.3);
          box-shadow: 0 0 25px rgba(139,92,246,.2);
        }

        .error-box {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 11px;
          margin-bottom: 13px;
          border-radius: 10px;
          color: #fecdd3;
          background: rgba(225,29,72,.12);
          border: 1px solid rgba(244,63,94,.3);
          font-size: 10px;
        }

        .error-circle {
          width: 19px;
          height: 19px;
          display: grid;
          place-items: center;
          flex: 0 0 19px;
          border-radius: 50%;
          background: #e11d48;
          color: white;
          font-weight: 800;
        }

        .field {
          margin-bottom: 12px;
        }

        .field label {
          display: block;
          color: #e2e8f0;
          font-size: 9px;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .field label span {
          color: #fb7185;
        }

        .field-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .field-heading small {
          color: #a78bfa;
          font-size: 8px;
          font-weight: 700;
        }

        .glass-input {
          min-height: 39px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 11px;
          border-radius: 9px;
          background: rgba(255,255,255,.055);
          border: 1px solid rgba(148,163,184,.18);
          color: #94a3b8;
          transition: .2s ease;
        }

        .glass-input:focus-within {
          border-color: rgba(129,140,248,.75);
          background: rgba(255,255,255,.075);
          box-shadow: 0 0 0 3px rgba(99,102,241,.1);
        }

        .glass-input input,
        .glass-input select {
          width: 100%;
          height: 38px;
          border: 0;
          outline: 0;
          color: #f8fafc;
          background: transparent;
          font: inherit;
          font-size: 10px;
        }

        .glass-input input::placeholder {
          color: #64748b;
        }

        .glass-input select {
          cursor: pointer;
        }

        .glass-input select option {
          color: #111827;
          background: white;
        }

        .currency-symbol {
          color: #c4b5fd;
          font-size: 15px;
          font-weight: 700;
        }

        .valid-check {
          color: #34d399;
          flex: 0 0 auto;
        }

        .two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .business-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 6px;
        }

        .type-card {
          position: relative;
          min-height: 46px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 6px;
          padding: 7px 8px;
          border-radius: 9px;
          border: 1px solid rgba(148,163,184,.16);
          background: rgba(255,255,255,.045);
          color: #94a3b8;
          cursor: pointer;
          font: inherit;
          font-size: 8px;
          text-align: left;
          transition: .2s ease;
        }

        .type-card:hover,
        .type-card.active {
          color: white;
          border-color: rgba(167,139,250,.75);
          background: linear-gradient(135deg,rgba(124,58,237,.32),rgba(37,99,235,.12));
          box-shadow: 0 0 18px rgba(124,58,237,.14);
          transform: translateY(-1px);
        }

        .type-card svg {
          color: #a78bfa;
          flex: 0 0 auto;
        }

        .type-card.active svg {
          color: #e9d5ff;
        }

        .selected-check {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 14px;
          height: 14px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #8b5cf6;
          color: white;
        }

        .continue-button {
          width: 100%;
          height: 44px;
          margin-top: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 0;
          border-radius: 9px;
          background: linear-gradient(90deg,#a855f7,#6366f1,#22d3ee);
          color: white;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 12px 30px rgba(99,102,241,.28);
          transition: .25s ease;
        }

        .continue-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 16px 35px rgba(99,102,241,.4);
          filter: brightness(1.08);
        }

        .continue-button:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,.35);
          border-top-color: white;
          border-radius: 50%;
          animation: spin .7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .secure-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          margin-top: 8px;
          color: #64748b;
          font-size: 8px;
        }

        .floating-ui {
          position: absolute;
          z-index: 5;
          border-radius: 15px;
          padding: 13px;
          color: white;
          background: rgba(11,17,48,.74);
          border: 1px solid rgba(167,139,250,.27);
          box-shadow:
            0 20px 55px rgba(0,0,0,.38),
            inset 0 1px rgba(255,255,255,.05);
          backdrop-filter: blur(16px);
          animation: cardFloat 6s ease-in-out infinite;
        }

        @keyframes cardFloat {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-9px) rotate(.5deg); }
        }

        .sales-ui {
          width: 190px;
          left: 2.5%;
          top: 16%;
          transform: rotate(-7deg);
        }

        .products-ui {
          width: 190px;
          left: 38%;
          top: 5%;
          transform: rotate(5deg);
          animation-delay: 1s;
        }

        .customers-ui {
          width: 195px;
          right: 2.5%;
          top: 19%;
          transform: rotate(-4deg);
          animation-delay: 2s;
        }

        .growth-ui {
          width: 250px;
          right: 3%;
          bottom: 11%;
          transform: rotate(3deg);
          animation-delay: 3s;
        }

        .all-in-one {
          width: 230px;
          right: 4%;
          bottom: 31%;
          transform: rotate(4deg);
          animation-delay: 1.5s;
        }

        .floating-ui-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #cbd5e1;
          font-size: 9px;
        }

        .floating-icon {
          width: 27px;
          height: 27px;
          display: grid;
          place-items: center;
          border-radius: 8px;
        }

        .purple-bg { background: rgba(139,92,246,.35); color: #c4b5fd; }
        .blue-bg { background: rgba(59,130,246,.3); color: #93c5fd; }
        .pink-bg { background: rgba(236,72,153,.3); color: #f9a8d4; }

        .big-number {
          display: block;
          margin-top: 6px;
          font-size: 20px;
          letter-spacing: -.5px;
        }

        .growth {
          display: flex;
          align-items: center;
          gap: 3px;
          margin-top: 3px;
          color: #34d399;
          font-size: 9px;
          font-weight: 700;
        }

        .mini-bars {
          height: 31px;
          display: flex;
          align-items: end;
          gap: 5px;
          margin-top: 5px;
        }

        .mini-bars span {
          width: 9px;
          border-radius: 3px 3px 0 0;
          background: linear-gradient(#c084fc,#6366f1);
        }

        .products-ui small {
          color: #64748b;
          font-size: 8px;
        }

        .stock-line {
          height: 5px;
          margin-top: 8px;
          overflow: hidden;
          border-radius: 99px;
          background: rgba(255,255,255,.08);
        }

        .stock-line div {
          width: 70%;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg,#22c55e,#22d3ee);
        }

        .customer-stack {
          display: flex;
          margin-top: 8px;
        }

        .customer-stack div {
          width: 25px;
          height: 25px;
          display: grid;
          place-items: center;
          margin-right: -5px;
          border: 2px solid #11183a;
          border-radius: 50%;
          background: linear-gradient(135deg,#f97316,#ec4899);
          font-size: 8px;
          font-weight: 800;
        }

        .customer-stack div:nth-child(2) {
          background: linear-gradient(135deg,#22c55e,#06b6d4);
        }

        .customer-stack div:nth-child(3) {
          background: linear-gradient(135deg,#6366f1,#a855f7);
        }

        .customer-stack .plus {
          background: #3b82f6;
        }

        .growth-ui > span {
          color: #cbd5e1;
          font-size: 9px;
        }

        .growth-ui > strong {
          display: block;
          margin-top: 6px;
          color: #34d399;
          font-size: 18px;
        }

        .growth-chart {
          width: 100%;
          height: 50px;
          margin-top: 3px;
        }

        .all-in-one strong {
          font-size: 13px;
          line-height: 1.3;
        }

        .all-icons {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .all-icons div {
          width: 33px;
          height: 33px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          color: #c4b5fd;
          background: rgba(255,255,255,.07);
        }

        .business-image-card {
          position: absolute;
          z-index: 4;
          border-radius: 19px;
          overflow: hidden;
          border: 1px solid rgba(167,139,250,.3);
          box-shadow: 0 25px 60px rgba(0,0,0,.4);
          animation: cardFloat 7s ease-in-out infinite;
        }

        .image-card-right {
          width: 190px;
          height: 250px;
          right: 5%;
          top: 42%;
          transform: rotate(-5deg);
        }

        .image-card-left {
          width: 205px;
          height: 225px;
          left: 3%;
          bottom: 7%;
          transform: rotate(-8deg);
          animation-delay: 2s;
        }

        .business-photo {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
        }

        .retail-photo {
          background:
            linear-gradient(145deg,rgba(25,25,70,.05),rgba(4,7,25,.78)),
            radial-gradient(circle at 25% 35%,#38bdf8 0 4%,transparent 5%),
            radial-gradient(circle at 65% 30%,#f97316 0 5%,transparent 6%),
            linear-gradient(135deg,#2563eb,#7c3aed 50%,#ec4899);
        }

        .store-photo {
          background:
            linear-gradient(145deg,rgba(15,23,42,.08),rgba(3,7,18,.8)),
            repeating-linear-gradient(
              90deg,
              #0f766e 0 15px,
              #f59e0b 15px 30px,
              #2563eb 30px 45px,
              #be123c 45px 60px
            );
        }

        .business-photo::after {
          content: "";
          position: absolute;
          inset: 20% 12% 26%;
          border-radius: 12px;
          background:
            linear-gradient(135deg,rgba(255,255,255,.2),transparent),
            repeating-linear-gradient(
              90deg,
              rgba(255,255,255,.2) 0 7px,
              transparent 7px 18px
            );
          box-shadow: inset 0 0 35px rgba(0,0,0,.3);
        }

        .photo-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg,transparent 35%,rgba(3,7,18,.9));
          z-index: 1;
        }

        .photo-label {
          position: absolute;
          z-index: 3;
          left: 17px;
          right: 15px;
          bottom: 20px;
        }

        .photo-label strong,
        .photo-label span,
        .photo-label small {
          display: block;
        }

        .photo-label strong {
          font-size: 18px;
          line-height: 1.1;
        }

        .photo-label span {
          margin-top: 3px;
          color: #d8b4fe;
          font-size: 16px;
          font-weight: 700;
        }

        .photo-label small {
          max-width: 140px;
          margin-top: 7px;
          color: #cbd5e1;
          font-size: 8px;
          line-height: 1.4;
        }

        .bottom-label strong {
          font-size: 19px;
        }

        .round-arrow {
          position: absolute;
          z-index: 4;
          right: 13px;
          bottom: 16px;
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: white;
          background: linear-gradient(135deg,#a855f7,#6366f1);
          box-shadow: 0 0 20px rgba(139,92,246,.45);
        }

        .bottom-brand {
          position: absolute;
          z-index: 20;
          right: 42px;
          bottom: 25px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #64748b;
          font-size: 8px;
          letter-spacing: 1.3px;
        }

        .bottom-brand i {
          display: block;
          width: 1px;
          height: 27px;
          background: #334155;
        }

        @media (max-width: 1250px) {
          .floating-ui,
          .business-image-card {
            display: none;
          }

          .main-layout {
            grid-template-columns: 310px 500px;
            gap: 35px;
          }
        }

        @media (max-width: 900px) {
          .bizflow-setup {
            padding: 22px 18px;
            overflow-y: auto;
          }

          .trusted-pill {
            display: none;
          }

          .main-layout {
            width: 100%;
            grid-template-columns: 1fr;
            margin-top: 25px;
          }

          .hero-copy {
            display: none;
          }

          .setup-card {
            width: min(560px,100%);
            margin: 0 auto;
          }

          .bottom-brand {
            display: none;
          }
        }

        @media (max-width: 600px) {
          .bizflow-setup {
            padding: 16px;
          }

          .brand-tagline {
            display: none;
          }

          .setup-card {
            border-radius: 20px;
          }

          .setup-card-content {
            padding: 24px 18px 20px;
          }

          .setup-header h2 {
            font-size: 23px;
          }

          .business-grid {
            grid-template-columns: repeat(2,1fr);
          }

          .two-column {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default BusinessSetup;
