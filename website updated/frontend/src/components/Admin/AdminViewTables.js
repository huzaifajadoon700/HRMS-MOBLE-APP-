import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiEye, FiStar, FiTrendingUp, FiUsers, FiTarget, FiTable,
  FiRefreshCw, FiSearch, FiFilter, FiGrid, FiList, FiMapPin,
  FiCheckCircle, FiXCircle, FiBarChart, FiActivity
} from "react-icons/fi";
import { tableRecommendationService } from "../../services/tableRecommendationService";
import "./AdminManageRooms.css";

const AdminViewTables = () => {
  const [tables, setTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableAnalytics, setTableAnalytics] = useState({});
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }
    
    fetchTables();
    fetchTableAnalytics();
  }, [navigate]);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/api/tables");
      console.log("Fetched tables:", response.data);
      setTables(response.data);
      setFilteredTables(response.data);
      toast.success("Tables loaded successfully");
    } catch (error) {
      console.error("Error fetching tables:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      toast.error(error.response?.data?.message || "Failed to fetch tables");
    } finally {
      setLoading(false);
    }
  };

  const fetchTableAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const response = await tableRecommendationService.getAdminDashboard();
      if (response.success) {
        // Create a map of table analytics for easy lookup
        const analyticsMap = {};
        response.analytics.popularTables?.forEach(table => {
          analyticsMap[table._id] = {
            totalInteractions: table.totalInteractions,
            uniqueUsers: table.uniqueUsers,
            avgRating: table.avgRating
          };
        });
        setTableAnalytics(analyticsMap);
      }
    } catch (error) {
      console.error("Error fetching table analytics:", error);
      // Don't show error toast for analytics as it's supplementary data
    } finally {
      setLoadingAnalytics(false);
    }
  };

  return (
    <div className="enhanced-admin-tables">
      {/* Enhanced Header */}
      <div className="enhanced-tables-header">
        <div className="header-content">
          <div className="title-section">
            <div className="title-wrapper">
              <div className="title-icon">
                <FiTable />
              </div>
              <div className="title-text">
                <h1 className="page-title">Table Analytics</h1>
                <p className="page-subtitle">Monitor table performance and customer preferences</p>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-icon">
                  <FiTable />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{tables.length}</div>
                  <div className="stat-label">Total Tables</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FiCheckCircle />
                </div>
                <div className="stat-content">
                  <div className="stat-number">
                    {tables.filter(t => t.status === 'Available').length}
                  </div>
                  <div className="stat-label">Available Tables</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FiActivity />
                </div>
                <div className="stat-content">
                  <div className="stat-number">
                    {Object.values(tableAnalytics).reduce((sum, t) => sum + (t.totalInteractions || 0), 0)}
                  </div>
                  <div className="stat-label">Total Interactions</div>
                </div>
              </div>
            </div>

            <div className="header-actions">
              <button
                className="action-btn secondary"
                onClick={fetchTableAnalytics}
                disabled={loadingAnalytics}
              >
                <FiRefreshCw className={loadingAnalytics ? 'spinning' : ''} />
                <span>Refresh Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="enhanced-tables-content">
        <div className="content-container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner">
                <FiRefreshCw className="spinning" />
              </div>
              <p>Loading tables...</p>
            </div>
          ) : filteredTables.length > 0 ? (
            <div className="tables-grid">
              {filteredTables.map((table) => {
                const analytics = tableAnalytics[table._id] || {};
                return (
                  <div key={table._id} className="table-card">
                    <div className="card-header">
                      <div className="table-info">
                        <div className="table-number">Table {table.tableNumber || table.tableName}</div>
                        <div className={`status-badge ${table.status === 'Available' ? 'available' : 'occupied'}`}>
                          {table.status === 'Available' ? <FiCheckCircle /> : <FiXCircle />}
                          <span>{table.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="card-content">
                      <div className="table-details">
                        <div className="detail-item">
                          <FiUsers className="detail-icon" />
                          <span>{table.capacity} Seats</span>
                        </div>
                        <div className="detail-item">
                          <FiMapPin className="detail-icon" />
                          <span>{table.location}</span>
                        </div>
                      </div>

                      <div className="analytics-section">
                        <h4>Analytics</h4>
                        <div className="analytics-grid">
                          <div className="analytics-item">
                            <FiEye className="analytics-icon" />
                            <div className="analytics-data">
                              <span className="analytics-number">{analytics.totalInteractions || 0}</span>
                              <span className="analytics-label">Interactions</span>
                            </div>
                          </div>
                          <div className="analytics-item">
                            <FiUsers className="analytics-icon" />
                            <div className="analytics-data">
                              <span className="analytics-number">{analytics.uniqueUsers || 0}</span>
                              <span className="analytics-label">Users</span>
                            </div>
                          </div>
                          <div className="analytics-item">
                            <FiStar className="analytics-icon" />
                            <div className="analytics-data">
                              <span className="analytics-number">{analytics.avgRating?.toFixed(1) || 'N/A'}</span>
                              <span className="analytics-label">Rating</span>
                            </div>
                          </div>
                        </div>
                        {loadingAnalytics && (
                          <div className="analytics-loading">
                            <FiRefreshCw className="spinning" />
                            <span>Updating...</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="card-actions">
                      <button
                        className="action-btn primary small"
                        onClick={() => navigate(`/admin/tables/${table._id}`)}
                      >
                        <FiEye />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <FiTable />
              </div>
              <h3>No Tables Found</h3>
              <p>No tables have been added yet. Tables will appear here once they are created.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminViewTables; 