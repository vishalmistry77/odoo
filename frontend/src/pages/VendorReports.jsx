import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import './VendorReports.css';

const VendorReports = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [reportsData, setReportsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchReportsData();
    }, []);

    const fetchReportsData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/reports/vendor');
            if (response.data.success) {
                setReportsData(response.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch reports:', err);
            setError(err.response?.data?.message || 'Failed to load reports data');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    // Calculate max revenue for chart scaling
    const getMaxRevenue = () => {
        if (!reportsData?.monthlyRevenue) return 1;
        const revenues = Object.values(reportsData.monthlyRevenue);
        return Math.max(...revenues, 1);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="vendor-reports-page">
            {/* Top Navigation */}
            <nav className="top-nav">
                <div className="nav-container">
                    <div className="nav-left">
                        <Link to="/dashboard" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <h1>RentFlow</h1>
                        </Link>
                        <div className="nav-tabs">
                            <Link to="/dashboard" className="nav-tab" style={{ textDecoration: 'none' }}>Dashboard</Link>
                            <Link to="/vendor/orders" className="nav-tab" style={{ textDecoration: 'none' }}>Orders</Link>
                            <Link to="/vendor/products" className="nav-tab" style={{ textDecoration: 'none' }}>Products</Link>
                            <Link to="/vendor/reports" className="nav-tab active" style={{ textDecoration: 'none' }}>Reports</Link>
                            <Link to="/vendor/settings" className="nav-tab" style={{ textDecoration: 'none' }}>Settings</Link>
                        </div>
                    </div>

                    <div className="nav-right">
                        <div className="user-menu" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                            <div className="user-avatar">{user?.name ? user.name.substring(0, 2).toUpperCase() : 'VR'}</div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name || 'TechRentals'}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vendor</div>
                            </div>
                            {isDropdownOpen && (
                                <div className="user-dropdown-menu">
                                    <Link to="/vendor/settings" className="dropdown-item">
                                        <span>⚙️</span> Settings
                                    </Link>
                                    <button onClick={handleLogout} className="dropdown-item">
                                        <span>🚪</span> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="vendor-main-content">
                <div className="vendor-header">
                    <div className="vendor-header-left">
                        <h2 className="page-title">Reports & Analytics</h2>
                        <p className="vendor-header-subtitle">Insights into your rental business</p>
                    </div>
                    <div className="vendor-header-right">
                        <button className="btn-secondary" onClick={fetchReportsData}>
                            {loading ? 'Refreshing...' : 'Refresh Data'}
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                {!loading && reportsData && (
                    <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Revenue</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                                {formatCurrency(reportsData.stats.totalRevenue)}
                            </div>
                        </div>
                        <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Orders</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-color)' }}>
                                {reportsData.stats.totalOrders}
                            </div>
                        </div>
                        <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Active Rentals</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
                                {reportsData.stats.activeRentals}
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                        <p>Loading reports data...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', padding: '1rem', marginBottom: '2rem', color: '#ef4444' }}>
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {/* Charts Section */}
                {!loading && reportsData && (
                    <div className="reports-grid">
                        <div className="report-card">
                            <h3>Revenue Overview</h3>
                            <div className="chart-placeholder">
                                {Object.entries(reportsData.monthlyRevenue).length > 0 ? (
                                    Object.entries(reportsData.monthlyRevenue).map(([month, revenue]) => {
                                        const maxRevenue = getMaxRevenue();
                                        const heightPercent = (revenue / maxRevenue) * 100;
                                        return (
                                            <div
                                                key={month}
                                                className="bar"
                                                style={{ height: `${Math.max(heightPercent, 5)}%` }}
                                                title={`${month}: ${formatCurrency(revenue)}`}
                                            ></div>
                                        );
                                    })
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                        No revenue data available
                                    </div>
                                )}
                            </div>
                            <p className="chart-note">Monthly Revenue (Last 6 Months)</p>
                            {Object.entries(reportsData.monthlyRevenue).length > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                    {Object.keys(reportsData.monthlyRevenue).map(month => (
                                        <span key={month}>{month.split(' ')[0]}</span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="report-card">
                            <h3>Top Renting Products</h3>
                            {reportsData.topProducts.length > 0 ? (
                                <ul className="top-products-list">
                                    {reportsData.topProducts.map((product, index) => (
                                        <li key={index}>
                                            <span>{product.name}</span>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                <span className="highlight">{product.rentals} rentals</span>
                                                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                    {formatCurrency(product.revenue)}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    No product data available
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default VendorReports;
