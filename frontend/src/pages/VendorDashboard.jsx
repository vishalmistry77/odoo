import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import './VendorDashboard.css';

const VendorDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [stats, setStats] = useState({
        revenue: 0,
        activeRentals: 0,
        productsListed: 0,
        pendingPickups: 0
    });
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Products
                const productRes = await api.get(`/products?vendorId=${user?.id}`); // Or filter by vendorId if implemented
                // For now, listProducts returns all if no filter, but I added vendorId support in controller
                const productsData = productRes.data.data || [];
                setProducts(productsData);

                // Fetch Orders
                const orderRes = await api.get('/orders');
                const ordersData = orderRes.data.data || [];
                setOrders(ordersData);

                // Calculate Stats
                const revenue = ordersData.reduce((sum, o) => sum + Number(o.totalAmount), 0);
                const active = ordersData.filter(o => ['CONFIRMED', 'SALES_ORDER', 'PAID'].includes(o.status)).length;
                const pickups = ordersData.filter(o => o.status === 'PAID').length; // Assuming PAID means ready for pickup

                setStats({
                    revenue,
                    activeRentals: active,
                    productsListed: productsData.length,
                    pendingPickups: pickups
                });

            } catch (error) {
                console.error("Dashboard Fetch Error", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user]);

    const getStockClass = (stock) => {
        if (stock > 5) return 'vendor-stock-available';
        if (stock > 0) return 'vendor-stock-low';
        return 'vendor-stock-out';
    };

    const getStockLabel = (stock) => {
        if (stock > 5) return 'Available';
        if (stock > 0) return 'Low Stock';
        return 'Out of Stock';
    };

    const getOrderStatusClass = (status) => {
        if (['CONFIRMED', 'SALES_ORDER', 'PAID'].includes(status)) return 'vendor-status-active';
        if (status === 'QUOTATION' || status === 'QUOTATION_SENT') return 'vendor-status-pending';
        return 'vendor-status-completed';
    };

    const getOrderStatusLabel = (status) => {
        return status.replace('_', ' ');
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEditProduct = (productId) => {
        navigate(`/vendor/products/${productId}`);
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            const res = await api.delete(`/products/${productId}`);
            if (res.data.success) {
                setProducts(prev => prev.filter(p => p.id !== productId));
                setStats(prev => ({ ...prev, productsListed: prev.productsListed - 1 }));
                alert("Product deleted");
            }
        } catch (error) {
            console.error("Delete error", error);
            alert("Failed to delete");
        }
    };

    if (loading) return <div style={{ padding: '2rem', color: 'white' }}>Loading Dashboard...</div>;

    return (
        <div className="vendor-dashboard-page">
            {/* Top Navigation */}
            <nav className="top-nav">
                <div className="nav-container">
                    <div className="nav-left">
                        <Link to="/dashboard" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <h1>RentFlow</h1>
                        </Link>
                        <div className="nav-tabs">
                            <Link to="/dashboard" className="nav-tab active" style={{ textDecoration: 'none' }}>Dashboard</Link>
                            <Link to="/vendor/orders" className="nav-tab" style={{ textDecoration: 'none' }}>Orders</Link>
                            <Link to="/vendor/products" className="nav-tab" style={{ textDecoration: 'none' }}>Products</Link>
                            <Link to="/vendor/reports" className="nav-tab" style={{ textDecoration: 'none' }}>Reports</Link>
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
                        <h2 className="page-title">Vendor Dashboard</h2>
                        <p className="vendor-header-subtitle">Manage your rental inventory and orders</p>
                    </div>
                    <div className="vendor-header-right">
                        <button className="btn-new" onClick={() => navigate('/vendor/products/new')}>➕ Add New Product</button>
                    </div>
                </div>

                <div className="vendor-revenue-section">
                    <div className="vendor-revenue-card">
                        <div className="vendor-revenue-label">Total Revenue This Month</div>
                        <div className="vendor-revenue-value">${stats.revenue.toLocaleString()}</div>
                        <div className="vendor-revenue-change">↑ 23% from last month</div>
                    </div>

                    <div className="vendor-stats-mini">
                        <div className="vendor-mini-stat">
                            <div className="vendor-mini-stat-label">Active Rentals</div>
                            <div className="vendor-mini-stat-value">{stats.activeRentals}</div>
                        </div>
                        <div className="vendor-mini-stat">
                            <div className="vendor-mini-stat-label">Products Listed</div>
                            <div className="vendor-mini-stat-value">{stats.productsListed}</div>
                        </div>
                        <div className="vendor-mini-stat">
                            <div className="vendor-mini-stat-label">Pending Pickups</div>
                            <div className="vendor-mini-stat-value">{stats.pendingPickups}</div>
                        </div>
                    </div>
                </div>

                <div className="vendor-products-section">
                    <div className="vendor-section-header">
                        <h3 className="vendor-section-title">Your Products</h3>
                        <div className="vendor-search-box">
                            <input
                                type="text"
                                className="vendor-search-input"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <table className="vendor-products-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Daily Rate</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((p) => (
                                <tr key={p.id}>
                                    <td>
                                        <div className="vendor-product-name">{p.name}</div>
                                        <div className="vendor-product-category">{p.brand}</div>
                                    </td>
                                    <td>{p.category}</td>
                                    <td className="vendor-price">${Number(p.price).toFixed(2)}</td>
                                    <td>{p.stock} units</td>
                                    <td>
                                        <span className={`vendor-stock-badge ${getStockClass(p.stock)}`}>
                                            {getStockLabel(p.stock)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="vendor-action-buttons">
                                            <button className="vendor-icon-btn" title="Edit" onClick={() => handleEditProduct(p.id)}>✏️</button>
                                            <button className="vendor-icon-btn" title="View" onClick={() => handleEditProduct(p.id)}>👁️</button>
                                            <button className="vendor-icon-btn" title="Delete" onClick={() => handleDeleteProduct(p.id)}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No products found. Add some!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="vendor-orders-section">
                    <h3 className="vendor-section-title">Recent Orders</h3>
                    {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="vendor-order-item">
                            <div className="vendor-order-id">#{order.orderNumber}</div>
                            <div className="vendor-order-details">
                                <h4>{order.user?.name || 'Customer'}</h4>
                                <p className="vendor-order-meta">
                                    {order.items?.length || 0} items • {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="vendor-order-amount">${Number(order.totalAmount).toLocaleString()}</div>
                            <span className={`vendor-order-status ${getOrderStatusClass(order.status)}`}>
                                {getOrderStatusLabel(order.status)}
                            </span>
                        </div>
                    ))}
                    {orders.length === 0 && <p style={{ color: '#aaa' }}>No orders yet.</p>}
                </div>
            </main>
        </div>
    );
};

export default VendorDashboard;
