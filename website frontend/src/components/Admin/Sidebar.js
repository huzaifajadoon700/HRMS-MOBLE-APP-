import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Dashboard.css";
import Dashboardmodule from "./dashboardmodule";
import AdminAddRoom from "./AdminAddRoom";
import AdminViewRooms from "./AdminViewRooms";
import AdminUpdateRoom from "./AdminUpdateRoom";
import AdminAddTable from "./AdminAddTable";
import AdminViewTables from "./AdminViewTables";
import AdminUpdateTable from "./AdminUpdateTable";
import AdminDeleteTable from "./AdminDeleteTable";
import AdminManageBookings from "./AdminManageBookings";
import AdminManageReservations from "./AdminManageReservations";
import AdminCustomerManagement from "./CustomerManagement";
import OnlineOrderPlacement from "./OrderPlacement";
import AdminUserManagement from "./UserManagement";
import StaffManagement from "./StaffManagement";
import ShiftManagement from "./ShiftManagement";
import ReportingAnalytics from "./Reporting";
import UserProfileManagement from "./UserProfileManagement";
import RecommendationSystem from "./RecommendationSystem";
import MenuManagement from "./MenuManagement";
import AdminSettings from "./Setting";
import AdminDeleteRoom from "./AdminDeleteRoom";
import AdminOrders from "./AdminOrders";
import AdminViewMenus from "./AdminViewMenus";
import AdminAddMenu from "./AdminAddMenu";
import AdminUpdateMenu from "./AdminUpdateMenu";
import AdminDeleteMenu from "./AdminDeleteMenu";
import SentimentAnalysis from "./SentimentAnalysis";

const Dashboard = () => {
  const [selectedModule, setSelectedModule] = useState("Dashboard");
  const [userName, setUserName] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem("name");
    if (name) {
      setUserName(name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleDropdown = (module) => {
    setOpenDropdown(openDropdown === module ? null : module);
  };

  const menuItems = [
    { name: "Dashboard", icon: "bi-speedometer2" },
    { name: "User Profile", icon: "bi-person-circle" },
    {
      name: "Room Management",
      icon: "bi-building",
      submenu: [
        { name: "View Rooms", component: "AdminViewRooms" },
        { name: "Add Room", component: "AdminAddRoom" },
        { name: "Update Room", component: "AdminUpdateRoom" },
        { name: "Delete Room", component: "AdminDeleteRoom" }
      ],
    },
    {
      name: "Menu Management",
      icon: "bi-list-check",
      submenu: [
        { name: "View Menu", component: "AdminViewMenus" },
        { name: "Add Menu", component: "AdminAddMenu" },
        { name: "Update Menu", component: "AdminUpdateMenu" },
        { name: "Delete Menu", component: "AdminDeleteMenu" }
      ]
    },
    {
      name: "Table Management",
      icon: "bi-grid",
      submenu: [
        { name: "View Tables", component: "AdminViewTables" },
        { name: "Add Table", component: "AdminAddTable" },
        { name: "Update Table", component: "AdminUpdateTable" },
        { name: "Delete Table", component: "AdminDeleteTable" }
      ],
    },
    {
      name: "Order Management",
      icon: "bi-cart-check",
      submenu: [
        { name: "View Orders", component: "AdminOrders", route: "/admin/orders" },
        { name: "Manage Bookings", component: "AdminManageBookings" },
        { name: "Manage Reservations", component: "AdminManageReservations" }
      ]
    },
    {
      name: "Staff Management",
      icon: "bi-person-badge",
      submenu: [
        { name: "Staff List", component: "StaffManagement" },
        { name: "Shift Management", component: "ShiftManagement" }
      ]
    },
    { name: "Customer Management", icon: "bi-people", component: "AdminCustomerManagement" },
    {
      name: "Analytics",
      icon: "bi-graph-up",
      submenu: [
        { name: "Reports", component: "ReportingAnalytics" },
        { name: "Sentiment Analysis", component: "SentimentAnalysis" },
        { name: "Recommendations", component: "RecommendationSystem" }
      ]
    },
    { name: "Settings", icon: "bi-gear", component: "AdminSettings" }
  ];

  const renderContent = () => {
    switch (selectedModule) {
      case "Dashboard":
        return <Dashboardmodule />;
      case "User Profile":
        return <UserProfileManagement />;
      case "AdminAddRoom":
        return <AdminAddRoom />;
      case "AdminViewRooms":
        return <AdminViewRooms />;
      case "AdminUpdateRoom":
        return <AdminUpdateRoom />;
      case "AdminDeleteRoom":
        return <AdminDeleteRoom />;
      case "AdminAddTable":
        return <AdminAddTable />;
      case "AdminViewTables":
        return <AdminViewTables />;
      case "AdminUpdateTable":
        return <AdminUpdateTable />;
      case "AdminDeleteTable":
        return <AdminDeleteTable />;
      case "AdminManageBookings":
        return <AdminManageBookings />;
      case "AdminManageReservations":
        return <AdminManageReservations />;
      case "Customer Management":
        return <AdminCustomerManagement />;
      case "Online Orders":
        return <OnlineOrderPlacement />;
      case "StaffManagement":
        return <StaffManagement />;
      case "ShiftManagement":
        return <ShiftManagement />;
      case "Menu Management":
        return <MenuManagement />;
      case "SentimentAnalysis":
        return <SentimentAnalysis />;
      case "Recommendation System":
        return <RecommendationSystem />;
      case "Reporting":
        return <ReportingAnalytics />;
      case "Settings":
        return <AdminSettings />;
      case "AdminOrders":
        return <AdminOrders />;
      case "AdminViewMenus":
        return <AdminViewMenus />;
      case "AdminAddMenu":
        return <AdminAddMenu />;
      case "AdminUpdateMenu":
        return <AdminUpdateMenu />;
      case "AdminDeleteMenu":
        return <AdminDeleteMenu />;
      default:
        return <Dashboardmodule />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-container" onClick={() => navigate("/")}>
            <img src="/images/logo.webp" alt="HRMS Logo" className="logo" />
            {!isSidebarCollapsed && <span className="logo-text">HRMS</span>}
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <i className={`bi bi-chevron-${isSidebarCollapsed ? "right" : "left"}`}></i>
          </button>
        </div>

        <div className="sidebar-menu">
          <h6 className="menu-title">Modules</h6>
          <ul className="menu-list">
            {menuItems.map((item) => (
              <React.Fragment key={item.name}>
                <li
                  className={`menu-item ${selectedModule === item.name || selectedModule === item.component ? "active" : ""}`}
                  onClick={() =>
                    item.submenu ? toggleDropdown(item.name) : setSelectedModule(item.component || item.name)
                  }
                >
                  <i className={`bi ${item.icon}`}></i>
                  {!isSidebarCollapsed && (
                    <>
                      <span>{item.name}</span>
                      {item.submenu && (
                        <i
                          className={`bi bi-chevron-${openDropdown === item.name ? "up" : "down"} ms-auto`}
                        ></i>
                      )}
                    </>
                  )}
                  {isSidebarCollapsed && item.submenu && (
                    <div className="menu-tooltip">{item.name}</div>
                  )}
                </li>
                {item.submenu && openDropdown === item.name && (
                  <ul className="submenu">
                    {item.submenu.map((subItem) => (
                      <li
                        key={subItem.name}
                        className={`submenu-item ${selectedModule === subItem.component ? "active" : ""}`}
                        onClick={() => setSelectedModule(subItem.component)}
                      >
                        {!isSidebarCollapsed && <span>{subItem.name}</span>}
                        {isSidebarCollapsed && <i className="bi bi-dot"></i>}
                      </li>
                    ))}
                  </ul>
                )}
              </React.Fragment>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <nav className="navbar">
          <div className="search-container">
            <i className="bi bi-search"></i>
            <input type="text" placeholder="Search..." className="search-input" />
          </div>
          <div className="user-actions">
            <div className="user-greeting">
              <i className="bi bi-person-circle"></i>
              <span className="user-name">{userName || "Guest User"}</span>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i>
              <span className="logout-text">Logout</span>
            </button>
          </div>
        </nav>
        <div className="content-wrapper">{renderContent()}</div>
      </main>
    </div>
  );
};

export default Dashboard;
