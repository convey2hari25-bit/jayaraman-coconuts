import { useState, useEffect, useCallback } from "react";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings as SettingsIcon,
} from "lucide-react";

import Stock from "./components/stocks";
import Sales from "./components/sales";
import Customers from "./components/customers";
import Reports from "./components/reports";
import Settings from "./components/settings";

import "./App.css";

// Backend API URL
const API_BASE = "https://jayaraman-coconuts-8rvj.onrender.com/api";

function App() {
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
    businessName: "Jayaraman Coconuts",
    businessType: "Coconut Business",
    ownerName: "Jayaraman",
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
  // LOAD DATA FROM RAILWAY CLOUD MYSQL
  // =====================================================

  const loadDashboardData = useCallback(async () => {
    try {
      setApiError("");

      const [stocksResponse, salesResponse, customersResponse] =
        await Promise.all([
          fetch(`${API_BASE}/stocks`),
          fetch(`${API_BASE}/sales`),
          fetch(`${API_BASE}/customers`),
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

      console.log("Dashboard data loaded from Railway Cloud MySQL");
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
    // First load
    loadDashboardData();

    // Every 5 seconds data refresh aagum
    const refreshInterval = setInterval(() => {
      loadDashboardData();
    }, 5000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [loadDashboardData]);

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
          <div className="brand-logo">🥥</div>

          <div>
            <h2>
              {settings.businessName.replace(
                " Coconuts",
                ""
              )}
            </h2>

            <span>Coconuts</span>
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
                  {settings.ownerName
                    ? settings.ownerName
                        .charAt(0)
                        .toUpperCase()
                    : "J"}
                </div>

                <div>
                  <strong>{settings.ownerName}</strong>

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
              {/* TOTAL STOCK */}

              <div className="summary-card">
                <span>Total Stock</span>

                <strong>
                  {totalStock.toLocaleString()}
                </strong>

                <small>Coconuts available</small>
              </div>

              {/* TOTAL SALES */}

              <div className="summary-card">
                <span>Total Sales</span>

                <strong>
                  ₹{totalSales.toLocaleString()}
                </strong>

                <small>Total revenue</small>
              </div>

              {/* CUSTOMERS */}

              <div className="summary-card">
                <span>Total Customers</span>

                <strong>
                  {totalCustomers.toLocaleString()}
                </strong>

                <small>Registered customers</small>
              </div>

              {/* STOCK TYPES */}

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

                  <p>Latest coconut sales</p>
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