import { useState, useEffect, useCallback } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Building2,
} from "lucide-react";

import Login from "./components/Login";
import Stock from "./components/stocks";
import Sales from "./components/sales";
import Customers from "./components/customers";
import Reports from "./components/reports";
import Settings from "./components/settings";

import "./App.css";

// Backend API URL
const API_BASE = "https://jayaraman-coconuts-8rvj.onrender.com/api";

// Google Client ID
const GOOGLE_CLIENT_ID =
  "377889426189-maointfke4a7sts66pbunpffe65kjig3.apps.googleusercontent.com";

function App() {
  // =====================================================
  // AUTHENTICATION
  // =====================================================

  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Check existing login session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("authToken");

        if (!token) {
          setAuthChecking(false);
          return;
        }

        const response = await fetch(`${API_BASE}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setUser(data.user);
        } else {
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          setUser(null);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);

        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setAuthChecking(false);
      }
    };

    checkAuth();
  }, []);

  // Login success
  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  // =====================================================
  // ACTIVE PAGE
  // =====================================================

  const [activePage, setActivePage] = useState("dashboard");

  // =====================================================
  // DATABASE DATA
  // =====================================================

  const [stocks, setStocks] = useState([]);
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);

  // =====================================================
  // SETTINGS
  // =====================================================

  const [settings, setSettings] = useState({
    businessName: "BizFlow",
    businessType: "Business",
    ownerName: "Business Owner",
    phone: "",
    address: "",
    currency: "INR",
    lowStockLimit: 100,
  });

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // =====================================================
  // SAFE ARRAY CONVERTER
  // =====================================================

  const getArrayData = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data?.rows)) {
      return data.rows;
    }

    return [];
  };

  // =====================================================
  // LOAD DATA FROM CLOUD MYSQL
  // =====================================================

  const loadDashboardData = useCallback(async () => {
    try {
      setApiError("");

      const token = localStorage.getItem("authToken");

      if (!token) {
        return;
      }

      const [stocksResponse, salesResponse, customersResponse] =
        await Promise.all([
          fetch(`${API_BASE}/stocks`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch(`${API_BASE}/sales`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch(`${API_BASE}/customers`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      if (!stocksResponse.ok) {
        throw new Error("Stocks API failed");
      }

      if (!salesResponse.ok) {
        throw new Error("Sales API failed");
      }

      if (!customersResponse.ok) {
        throw new Error("Customers API failed");
      }

      const stocksData = await stocksResponse.json();
      const salesData = await salesResponse.json();
      const customersData = await customersResponse.json();

      setStocks(getArrayData(stocksData));
      setSales(getArrayData(salesData));
      setCustomers(getArrayData(customersData));

      setLoading(false);

      console.log("Dashboard data loaded from cloud MySQL");
    } catch (error) {
      console.error("Dashboard API Error:", error);

      setApiError(
        "Backend connect aagala. Backend server running-aa irukka check pannunga."
      );

      setLoading(false);
    }
  }, []);

  // =====================================================
  // AUTOMATIC DATA REFRESH
  // =====================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    loadDashboardData();

    const refreshInterval = setInterval(() => {
      loadDashboardData();
    }, 5000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [user, loadDashboardData]);

  // =====================================================
  // DASHBOARD CALCULATIONS
  // =====================================================

  const totalStock = stocks.reduce((total, stock) => {
    return (
      total +
      Number(
        stock.quantity ??
          stock.stock_quantity ??
          stock.stockQuantity ??
          0
      )
    );
  }, 0);

  const totalSales = sales.reduce((total, sale) => {
    const quantity = Number(
      sale.quantity ??
        sale.sale_quantity ??
        sale.saleQuantity ??
        0
    );

    const rate = Number(
      sale.rate ??
        sale.price ??
        sale.selling_price ??
        sale.sellingPrice ??
        0
    );

    const saleTotal = Number(
      sale.total ??
        sale.total_amount ??
        sale.totalAmount ??
        quantity * rate
    );

    return total + saleTotal;
  }, 0);

  const totalCustomers = customers.length;

  // =====================================================
  // NAVIGATION
  // =====================================================

  const navigation = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "stock",
      label: "Stock",
      icon: Package,
    },
    {
      id: "sales",
      label: "Sales",
      icon: ShoppingCart,
    },
    {
      id: "customers",
      label: "Customers",
      icon: Users,
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
    },
    {
      id: "settings",
      label: "Settings",
      icon: SettingsIcon,
    },
  ];

  // =====================================================
  // PAGE TITLE
  // =====================================================

  const getPageTitle = () => {
    const page = navigation.find(
      (item) => item.id === activePage
    );

    return page ? page.label : "Dashboard";
  };

  // =====================================================
  // AUTH CHECKING SCREEN
  // =====================================================

  if (authChecking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          fontWeight: "600",
        }}
      >
        Checking login...
      </div>
    );
  }

  // =====================================================
  // LOGIN SCREEN
  // =====================================================

  if (!user) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <Login onLogin={handleLogin} />
      </GoogleOAuthProvider>
    );
  }

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          fontWeight: "600",
        }}
      >
        Loading dashboard data...
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="app">
      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <aside className="sidebar">
        {/* LOGO / BUSINESS */}

        <div className="sidebar-brand">
          <div className="brand-logo">
            <Building2 size={24} strokeWidth={2.2} />
          </div>

          <div>
            <h2>{settings.businessName}</h2>
          </div>
        </div>

        {/* NAVIGATION */}

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={
                  activePage === item.id
                    ? "nav-item active"
                    : "nav-item"
                }
                onClick={() => setActivePage(item.id)}
              >
                <Icon size={21} />

                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* LOGOUT */}

        <div
          style={{
            marginTop: "auto",
            padding: "16px",
          }}
        >
          <button
            onClick={handleLogout}
            className="nav-item"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
            }}
          >
            <LogOut size={21} />

            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ================================================= */}
      {/* MAIN CONTENT */}
      {/* ================================================= */}

      <main className="main-content">
        {/* ================================================= */}
        {/* DASHBOARD */}
        {/* ================================================= */}

        {activePage === "dashboard" && (
          <div className="page">
            {/* HEADER */}

            <div className="page-header">
              <div>
                <h1>{getPageTitle()}</h1>

                <p>
                  Welcome to {settings.businessName}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "#29965f",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    fontSize: "18px",
                  }}
                >
                  {user?.name
                    ? user.name.charAt(0).toUpperCase()
                    : "U"}
                </div>

                <div>
                  <strong>
                    {user?.name || settings.ownerName}
                  </strong>

                  <p
                    style={{
                      margin: "2px 0 0",
                    }}
                  >
                    Business Owner
                  </p>
                </div>
              </div>
            </div>

            {/* API ERROR */}

            {apiError && (
              <div
                style={{
                  background: "#ffe5e5",
                  color: "#b00020",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                }}
              >
                {apiError}
              </div>
            )}

            {/* SUMMARY CARDS */}

            <div className="stock-summary">
              <div className="summary-card">
                <span>Total Stock</span>

                <strong>
                  {totalStock.toLocaleString()}
                </strong>

                <small>Products available</small>
              </div>

              <div className="summary-card">
                <span>Total Sales</span>

                <strong>
                  ₹{totalSales.toLocaleString()}
                </strong>

                <small>Total revenue</small>
              </div>

              <div className="summary-card">
                <span>Total Customers</span>

                <strong>
                  {totalCustomers.toLocaleString()}
                </strong>

                <small>Registered customers</small>
              </div>

              <div className="summary-card">
                <span>Stock Types</span>

                <strong>{stocks.length}</strong>

                <small>Different varieties</small>
              </div>
            </div>

            {/* RECENT SALES */}

            <div className="stock-table-card">
              <div
                className="table-title"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h2>Recent Sales</h2>

                  <p>Latest sales</p>
                </div>

                <button
                  className="cancel-btn"
                  onClick={() => setActivePage("sales")}
                >
                  View All
                </button>
              </div>

              {sales.length === 0 ? (
                <div className="empty-state">
                  <div>💰</div>

                  <h3>No Sales Available</h3>

                  <p>Add a sale to see it here.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Quantity</th>
                        <th>Rate</th>
                        <th>Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {sales
                        .slice()
                        .reverse()
                        .slice(0, 5)
                        .map((sale) => {
                          const quantity = Number(
                            sale.quantity ??
                              sale.sale_quantity ??
                              sale.saleQuantity ??
                              0
                          );

                          const rate = Number(
                            sale.rate ??
                              sale.price ??
                              sale.selling_price ??
                              sale.sellingPrice ??
                              0
                          );

                          const total = Number(
                            sale.total ??
                              sale.total_amount ??
                              sale.totalAmount ??
                              quantity * rate
                          );

                          const customerName =
                            sale.customer ??
                            sale.customer_name ??
                            sale.customerName ??
                            "Unknown";

                          const saleDate =
                            sale.date ??
                            sale.sale_date ??
                            sale.saleDate ??
                            "-";

                          return (
                            <tr
                              key={
                                sale.id ??
                                `${customerName}-${saleDate}-${quantity}`
                              }
                            >
                              <td>
                                <strong>
                                  {customerName}
                                </strong>
                              </td>

                              <td>{saleDate}</td>

                              <td>
                                {quantity.toLocaleString()}
                              </td>

                              <td>
                                ₹{rate.toLocaleString()}
                              </td>

                              <td>
                                ₹{total.toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* STOCK */}
        {/* ================================================= */}

        {activePage === "stock" && (
          <Stock
            stocks={stocks}
            setStocks={setStocks}
          />
        )}

        {/* ================================================= */}
        {/* SALES */}
        {/* ================================================= */}

        {activePage === "sales" && (
          <Sales
            sales={sales}
            setSales={setSales}
          />
        )}

        {/* ================================================= */}
        {/* CUSTOMERS */}
        {/* ================================================= */}

        {activePage === "customers" && (
          <Customers
            customers={customers}
            setCustomers={setCustomers}
          />
        )}

        {/* ================================================= */}
        {/* REPORTS */}
        {/* ================================================= */}

        {activePage === "reports" && (
          <Reports
            sales={sales}
            stocks={stocks}
          />
        )}

        {/* ================================================= */}
        {/* SETTINGS */}
        {/* ================================================= */}

        {activePage === "settings" && (
          <Settings
            settings={settings}
            setSettings={setSettings}
          />
        )}
      </main>
    </div>
  );
}

export default App;