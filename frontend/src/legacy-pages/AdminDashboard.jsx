import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import './AdminStyles.css';

const AdminDashboard = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [chartFilter, setChartFilter] = useState('30D');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/dashboard/stats');
            if (res.data.success) {
                setStats(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            setError("Failed to load dashboard data. Please ensure the backend server is running and updated.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    return (
        <div className="admin-dashboard-page">
            {/* Admin navigation */}
            <nav className="top-nav">
                <div className="nav-container">
                    <div className="nav-left">
                        <Link to="/admin/dashboard" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <h1>RentFlow<span className="admin-logo-dot">.</span> <small>ADMIN</small></h1>
                        </Link>
                        <div className="nav-tabs">
                            <Link to="/admin/dashboard" className="nav-tab active" style={{ textDecoration: 'none' }}>Dashboard</Link>
                            <Link to="/admin/users" className="nav-tab" style={{ textDecoration: 'none' }}>Users</Link>
                            <Link to="/admin/products" className="nav-tab" style={{ textDecoration: 'none' }}>Products</Link>
                            <Link to="/admin/orders" className="nav-tab" style={{ textDecoration: 'none' }}>Orders</Link>
                            <Link to="/admin/reports" className="nav-tab" style={{ textDecoration: 'none' }}>Reports</Link>
                            <Link to="/admin/settings" className="nav-tab" style={{ textDecoration: 'none' }}>Settings</Link>
                        </div>
                    </div>

                    <div className="nav-right">
                        <div className="user-menu" onClick={handleLogout} title="Logout">
                            <div className="user-avatar" style={{ background: 'var(--primary)' }}>AD</div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name || 'Administrator'}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>System Admin</div>
                            </div>
                            <span className="admin-signout">Sign out</span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="admin-dashboard-layout">
                {loading ? (
                    <div className="admin-main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <div style={{ color: 'var(--text)' }}>Loading analytics...</div>
                    </div>
                ) : error ? (
                    <div className="admin-main" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: '1rem' }}>
                        <h3 style={{ color: 'var(--danger)' }}>⚠️ Connection Error</h3>
                        <p style={{ color: 'var(--text-muted)' }}>{error}</p>
                        <button
                            onClick={fetchDashboardStats}
                            className="admin-filter-btn"
                            style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 2rem' }}
                        >
                            Retry Connection
                        </button>
                        <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Try restarting the backend server if new routes were added.</p>
                    </div>
                ) : stats ? (
                    <main className="admin-main">
                        <div className="admin-header">
                            <span className="admin-eyebrow">OVERVIEW / 01</span>
                            <h2>Run the platform<br /><span>with clarity.</span></h2>
                            <p className="admin-header-subtitle">A live view of revenue, orders, people, and platform health.</p>
                        </div>

                        <div className="admin-metrics-grid">
                            <div className="admin-metric-card">
                                <div className="admin-metric-header">
                                    <div>
                                        <div className="admin-metric-label">Mission Revenue</div>
                                        <div className="admin-metric-value">${stats.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'}</div>
                                        <div className="admin-metric-change admin-change-positive">↑ 18.2% vs last month</div>
                                    </div>
                                    <div className="admin-metric-icon">01</div>
                                </div>
                            </div>

                            <div className="admin-metric-card">
                                <div className="admin-metric-header">
                                    <div>
                                        <div className="admin-metric-label">Active Missions</div>
                                        <div className="admin-metric-value">{stats.activeRentals}</div>
                                        <div className="admin-metric-change admin-change-positive">↑ 12.5% vs last month</div>
                                    </div>
                                    <div className="admin-metric-icon">02</div>
                                </div>
                            </div>

                            <div className="admin-metric-card">
                                <div className="admin-metric-header">
                                    <div>
                                        <div className="admin-metric-label">Total Builders</div>
                                        <div className="admin-metric-value">{stats.totalUsers}</div>
                                        <div className="admin-metric-change admin-change-positive">↑ {stats.totalUsers} new this month</div>
                                    </div>
                                    <div className="admin-metric-icon">03</div>
                                </div>
                            </div>

                            <div className="admin-metric-card">
                                <div className="admin-metric-header">
                                    <div>
                                        <div className="admin-metric-label">Platform Momentum</div>
                                        <div className="admin-metric-value">${(stats.totalRevenue * 0.1).toLocaleString()}</div>
                                        <div className="admin-metric-change admin-change-positive">↑ 15.3% vs last month</div>
                                    </div>
                                    <div className="admin-metric-icon">04</div>
                                </div>
                            </div>
                        </div>

                        <div className="admin-system-stats">
                            <div className="admin-stat-box">
                                <div className="admin-stat-box-value">{stats.activeVendors}</div>
                                <div className="admin-stat-box-label">Active Mentors</div>
                            </div>
                            <div className="admin-stat-box">
                                <div className="admin-stat-box-value">{stats.totalProducts}</div>
                                <div className="admin-stat-box-label">Total Projects</div>
                            </div>
                            <div className="admin-stat-box">
                                <div className="admin-stat-box-value">98.5%</div>
                                <div className="admin-stat-box-label">Platform Uptime</div>
                            </div>
                        </div>

                        <div className="admin-chart-section">
                            <div className="admin-chart-card">
                                <div className="admin-chart-header">
                                    <h3 className="admin-chart-title">Mission Revenue</h3>
                                    <div className="admin-chart-filters">
                                        {['7D', '30D', '90D', '1Y'].map((f) => (
                                            <button
                                                key={f}
                                                type="button"
                                                className={`admin-filter-btn ${chartFilter === f ? 'active' : ''}`}
                                                onClick={() => setChartFilter(f)}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="admin-chart-placeholder admin-revenue-visual" aria-label="Revenue trend visual">
                                    <span style={{ height: '34%' }} /><span style={{ height: '52%' }} /><span style={{ height: '43%' }} />
                                    <span style={{ height: '71%' }} /><span style={{ height: '62%' }} /><span style={{ height: '88%' }} />
                                    <span style={{ height: '76%' }} /><span style={{ height: '100%' }} />
                                </div>
                            </div>

                            <div className="admin-chart-card">
                                <div className="admin-chart-header">
                                    <h3 className="admin-chart-title">Builder Distribution</h3>
                                </div>
                                <div className="admin-chart-placeholder admin-distribution-visual">
                                    <div className="distribution-ring"><span>{stats.totalUsers}</span></div>
                                    <p>Registered builders</p>
                                </div>
                            </div>
                        </div>

                        <div className="admin-top-vendors">
                            <h3 className="admin-chart-title" style={{ marginBottom: '1.5rem' }}>Top Performing Builders</h3>

                            {stats.topVendors && stats.topVendors.length > 0 ? (
                                stats.topVendors.map((v, index) => (
                                    <div key={index} className="admin-vendor-item">
                                        <div className="admin-vendor-rank">{index + 1}</div>
                                        <div className="admin-vendor-info">
                                            <div className="admin-vendor-name">{v.name}</div>
                                            <div className="admin-vendor-stats">{v.products} products / {v.rentals} active rentals</div>
                                        </div>
                                        <div className="admin-vendor-revenue">${v.revenue.toLocaleString()}</div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: 'var(--text-muted)' }}>No builder data available yet.</p>
                            )}
                        </div>

                        <div className="admin-activity-section">
                            <h3 className="admin-chart-title" style={{ marginBottom: '1.5rem' }}>Recent Mission Activity</h3>

                            {stats.activity && stats.activity.length > 0 ? (
                                stats.activity.map((a, i) => (
                                    <div key={i} className="admin-activity-item">
                                        <div className="admin-activity-icon">
                                            {a.type === 'USER' ? 'U' : a.type === 'PRODUCT' ? 'P' : 'R'}
                                        </div>
                                        <div className="admin-activity-content">
                                            <div className="admin-activity-title">{a.title}</div>
                                            <div className="admin-activity-meta">{a.meta}</div>
                                        </div>
                                        <div className="admin-activity-time">{new Date(a.time).toLocaleString()}</div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: 'var(--text-muted)' }}>No recent activity.</p>
                            )}
                        </div>
                    </main>
                ) : null}
            </div>
        </div>
    );
};

export default AdminDashboard;
