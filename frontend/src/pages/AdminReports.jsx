import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AdminStyles.css';

const AdminReports = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('month');

    // Dummy data for reports
    const dummyData = {
        stats: {
            totalRevenue: 2450000,
            totalOrders: 342,
            activeRentals: 89,
            totalVendors: 3,
            totalProducts: 100,
            totalCustomers: 2
        },
        monthlyRevenue: {
            'Jan 2026': 180000,
            'Feb 2026': 220000,
            'Mar 2026': 195000,
            'Apr 2026': 240000,
            'May 2026': 280000,
            'Jun 2026': 310000,
            'Jul 2026': 290000,
            'Aug 2026': 325000,
            'Sep 2026': 350000,
            'Oct 2026': 380000,
            'Nov 2026': 420000,
            'Dec 2026': 450000
        },
        topProducts: [
            { name: 'Sony A7S III Mirrorless Camera', rentals: 45, revenue: 112500 },
            { name: 'Canon EOS R5 Camera Body', rentals: 38, revenue: 114000 },
            { name: 'DJI Mavic 3 Pro Drone', rentals: 35, revenue: 105000 },
            { name: 'MacBook Pro 16" M3 Max', rentals: 32, revenue: 80000 },
            { name: 'PlayStation 5 Console', rentals: 28, revenue: 42000 }
        ],
        topVendors: [
            { name: 'TechRentals Pro', orders: 145, revenue: 980000 },
            { name: 'Gaming Gear Hub', orders: 112, revenue: 720000 },
            { name: 'Camera & Photo Rentals', orders: 85, revenue: 750000 }
        ],
        categoryBreakdown: [
            { category: 'Cameras', count: 20, revenue: 650000 },
            { category: 'Gaming', count: 15, revenue: 420000 },
            { category: 'Laptops', count: 10, revenue: 380000 },
            { category: 'Drones', count: 10, revenue: 290000 },
            { category: 'Audio', count: 15, revenue: 250000 },
            { category: 'Lighting', count: 15, revenue: 240000 },
            { category: 'Lenses', count: 8, revenue: 180000 },
            { category: 'Gimbals', count: 5, revenue: 40000 }
        ]
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getMaxRevenue = () => {
        const revenues = Object.values(dummyData.monthlyRevenue);
        return Math.max(...revenues);
    };

    return (
        <div className="admin-dashboard-page">
            <nav className="top-nav">
                <div className="nav-container">
                    <div className="nav-left">
                        <Link to="/admin/dashboard" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <h1>RentFlow <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>ADMIN</span></h1>
                        </Link>
                        <div className="nav-tabs">
                            <Link to="/admin/dashboard" className="nav-tab">Dashboard</Link>
                            <Link to="/admin/users" className="nav-tab">Users</Link>
                            <Link to="/admin/products" className="nav-tab">Products</Link>
                            <Link to="/admin/orders" className="nav-tab">Orders</Link>
                            <Link to="/admin/reports" className="nav-tab active">Reports</Link>
                            <Link to="/admin/settings" className="nav-tab">Settings</Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="admin-main" style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ margin: 0 }}>Analytics & Reports</h2>
                    <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>
                        Platform-wide performance metrics and insights
                    </p>
                </div>

                {/* Key Statistics Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Revenue</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                            {formatCurrency(dummyData.stats.totalRevenue)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.5rem' }}>↑ 24% from last period</div>
                    </div>
                    <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Orders</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>{dummyData.stats.totalOrders}</div>
                        <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.5rem' }}>↑ 18% from last period</div>
                    </div>
                    <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Active Rentals</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>{dummyData.stats.activeRentals}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Currently rented</div>
                    </div>
                    <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Products</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>{dummyData.stats.totalProducts}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Across {dummyData.stats.totalVendors} vendors</div>
                    </div>
                </div>

                {/* Revenue Chart */}
                <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0' }}>Monthly Revenue Overview</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '250px', padding: '1rem 0' }}>
                        {Object.entries(dummyData.monthlyRevenue).map(([month, revenue]) => {
                            const heightPercent = (revenue / getMaxRevenue()) * 100;
                            return (
                                <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                    <div
                                        style={{
                                            width: '100%',
                                            background: 'linear-gradient(180deg, var(--primary-color), var(--accent))',
                                            borderRadius: '4px 4px 0 0',
                                            height: `${heightPercent}%`,
                                            minHeight: '20px',
                                            position: 'relative',
                                            cursor: 'pointer',
                                            transition: 'opacity 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                        title={`${month}: ${formatCurrency(revenue)}`}
                                    />
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>
                                        {month.split(' ')[0]}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    {/* Top Products */}
                    <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <h3 style={{ margin: '0 0 1rem 0' }}>Top Renting Products</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {dummyData.topProducts.map((product, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--surface-light)', borderRadius: '8px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{product.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{product.rentals} rentals</div>
                                    </div>
                                    <div style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                                        {formatCurrency(product.revenue)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Vendors */}
                    <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <h3 style={{ margin: '0 0 1rem 0' }}>Top Performing Vendors</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {dummyData.topVendors.map((vendor, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--surface-light)', borderRadius: '8px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{vendor.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{vendor.orders} orders</div>
                                    </div>
                                    <div style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                                        {formatCurrency(vendor.revenue)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Category Breakdown */}
                <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0' }}>Revenue by Category</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Category</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Products</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Revenue</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>% of Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dummyData.categoryBreakdown.map((cat, idx) => {
                                    const percent = ((cat.revenue / dummyData.stats.totalRevenue) * 100).toFixed(1);
                                    return (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '0.75rem', fontWeight: 500 }}>{cat.category}</td>
                                            <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{cat.count}</td>
                                            <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--primary-color)' }}>
                                                {formatCurrency(cat.revenue)}
                                            </td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{
                                                        flex: 1,
                                                        height: '8px',
                                                        background: 'var(--surface-light)',
                                                        borderRadius: '4px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <div style={{
                                                            width: `${percent}%`,
                                                            height: '100%',
                                                            background: 'var(--primary-color)',
                                                            borderRadius: '4px'
                                                        }} />
                                                    </div>
                                                    <span style={{ fontSize: '0.875rem', fontWeight: 600, minWidth: '45px' }}>{percent}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Note about dummy data */}
                <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    color: 'var(--text-muted)',
                    fontSize: '0.875rem',
                    textAlign: 'center'
                }}>
                    📊 Note: This page currently displays dummy analytics data for demonstration purposes
                </div>
            </main>
        </div>
    );
};

export default AdminReports;
