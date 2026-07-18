import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import api from '../../api/client';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import '../Dashboard.css';
import './CustomerOrders.css';

const CustomerOrders = () => {
    const { user, logout } = useAuth();
    const { getCartCount } = useCart();
    const { wishlist } = useWishlist();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const displayName = user?.name || 'User';
    const email = user?.email || 'user@example.com';
    const initials = displayName.split(/\s+/).map((n) => n[0]).join('').toUpperCase().slice(0, 2);

    useEffect(() => {
        if (!user || user.role !== 'CUSTOMER') {
            navigate('/');
            return;
        }
        fetchOrders();
    }, [user, navigate]);

    useEffect(() => {
        applyFilters();
    }, [orders, statusFilter, searchQuery]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await api.get('/orders');

            if (response.data.success) {
                setOrders(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...orders];

        // Status filter
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(order =>
                order.orderNumber.toLowerCase().includes(query) ||
                order.items.some(item =>
                    item.product.name.toLowerCase().includes(query)
                )
            );
        }

        setFilteredOrders(filtered);
    };

    const formatCurrency = (amount) => {
        return `Rs ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getActionButton = (order) => {
        switch (order.status) {
            case 'QUOTATION_SENT':
                return (
                    <Link to={`/customer/orders/${order.id}`} className="action-btn confirm">
                        Confirm Order
                    </Link>
                );
            case 'SALES_ORDER':
            case 'CONFIRMED':
                return (
                    <Link to={`/payment/${order.id}`} className="action-btn pay">
                        Pay Invoice
                    </Link>
                );
            case 'PAID':
                return (
                    <Link to={`/customer/orders/${order.id}`} className="action-btn view">
                        View Invoice
                    </Link>
                );
            default:
                return (
                    <Link to={`/customer/orders/${order.id}`} className="action-btn view">
                        View Details
                    </Link>
                );
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    const toggleUserDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="loading-state">Loading orders...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            {/* Same Navigation Bar as Dashboard */}
            <nav className="top-nav">
                <div className="nav-container">
                    <div className="logo-section">
                        <div className="logo-icon">🏠</div>
                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>RentFlow</span>
                    </div>
                    <div className="nav-links">
                        <Link to="/dashboard" className="nav-link">Products</Link>
                        <Link to="/terms" className="nav-link">Terms & Condition</Link>
                        <Link to="/about" className="nav-link">About us</Link>
                        <Link to="/contact" className="nav-link">Contact Us</Link>
                    </div>
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by order number or product..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="search-btn">🔍</button>
                    </div>
                    <div className="nav-actions">
                        <div className="icon-btn" title="Wishlist">❤️ <span className="cart-badge" style={{ background: 'var(--accent)' }}>{wishlist.length}</span></div>
                        <Link to="/cart" className="icon-btn" style={{ textDecoration: 'none', color: 'inherit' }} title="Cart">
                            🛒
                            <span className="cart-badge">{getCartCount()}</span>
                        </Link>
                        <div className="user-profile-btn" onClick={toggleUserDropdown}>
                            <div className="user-avatar">{initials}</div>
                            <span className="dropdown-arrow">▼</span>
                            <div className={`user-dropdown ${isDropdownOpen ? 'active' : ''}`}>
                                <div className="dropdown-header">
                                    <div className="dropdown-user-name">{displayName}</div>
                                    <div className="dropdown-user-email">{email}</div>
                                </div>
                                <Link to="/vendor/profile" className="dropdown-item"><span>👤</span><span>My account/ My Profile</span></Link>
                                <Link to="/customer/orders" className="dropdown-item active"><span>📦</span><span>My Orders</span></Link>
                                <Link to="#" className="dropdown-item"><span>⚙️</span><span>Settings</span></Link>
                                <div className="dropdown-divider" />
                                <button onClick={handleLogout} className="dropdown-item"><span>🚪</span><span>Logout</span></button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Orders Content */}
            <div className="main-layout" style={{ paddingTop: '2rem' }}>
                <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
                    {/* Page Header */}
                    <div className="orders-page-header">
                        <div>
                            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text)' }}>My Orders</h1>
                            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Track and manage your rental orders</p>
                        </div>
                        <div className="filters-row">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="status-filter"
                                style={{
                                    padding: '0.75rem 1rem',
                                    background: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    color: 'var(--text)',
                                    fontSize: '0.95rem',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="QUOTATION">Quotation</option>
                                <option value="QUOTATION_SENT">Quotation Sent</option>
                                <option value="SALES_ORDER">Confirmed</option>
                                <option value="PAID">Paid</option>
                                <option value="PICKED_UP">Picked Up</option>
                                <option value="RETURNED">Returned</option>
                            </select>
                        </div>
                    </div>

                    {/* Orders List */}
                    {filteredOrders.length === 0 ? (
                        <div className="empty-state" style={{
                            textAlign: 'center',
                            padding: '4rem',
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            marginTop: '2rem'
                        }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>No orders found</p>
                            <Link to="/dashboard" className="browse-btn" style={{
                                display: 'inline-block',
                                padding: '0.75rem 1.5rem',
                                background: 'var(--accent)',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '8px',
                                fontWeight: 600
                            }}>
                                Browse Products
                            </Link>
                        </div>
                    ) : (
                        <div className="orders-grid" style={{
                            display: 'grid',
                            gap: '1.5rem',
                            marginTop: '2rem'
                        }}>
                            {filteredOrders.map(order => (
                                <div key={order.id} className="order-card" style={{
                                    background: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div className="order-card-header" style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '1rem',
                                        paddingBottom: '1rem',
                                        borderBottom: '1px solid var(--border)'
                                    }}>
                                        <div>
                                            <div className="order-number" style={{
                                                fontSize: '1.2rem',
                                                fontWeight: 700,
                                                color: 'var(--text)'
                                            }}>#{order.orderNumber}</div>
                                            <div className="order-date" style={{
                                                fontSize: '0.85rem',
                                                color: 'var(--text-muted)',
                                                marginTop: '0.25rem'
                                            }}>{formatDate(order.createdAt)}</div>
                                        </div>
                                        <OrderStatusBadge status={order.status} />
                                    </div>

                                    <div className="order-card-body" style={{ marginBottom: '1rem' }}>
                                        <div className="order-items-preview">
                                            {order.items.slice(0, 3).map((item, idx) => (
                                                <div key={idx} className="item-preview" style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    padding: '0.5rem 0',
                                                    fontSize: '0.95rem'
                                                }}>
                                                    <span style={{ color: 'var(--text)' }}>{item.product.name}</span>
                                                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>× {item.quantity}</span>
                                                </div>
                                            ))}
                                            {order.items.length > 3 && (
                                                <div style={{
                                                    fontSize: '0.85rem',
                                                    color: 'var(--accent)',
                                                    fontWeight: 600,
                                                    marginTop: '0.5rem'
                                                }}>
                                                    +{order.items.length - 3} more items
                                                </div>
                                            )}
                                        </div>

                                        {order.items[0]?.startDate && order.items[0]?.endDate && (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.75rem',
                                                background: 'rgba(139, 92, 246, 0.1)',
                                                borderRadius: '8px',
                                                fontSize: '0.9rem',
                                                marginTop: '1rem'
                                            }}>
                                                <span style={{ fontSize: '1.2rem' }}>📅</span>
                                                <span style={{ color: 'var(--text-muted)' }}>
                                                    {formatDate(order.items[0].startDate)} → {formatDate(order.items[0].endDate)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="order-card-footer" style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        paddingTop: '1rem',
                                        borderTop: '1px solid var(--border)'
                                    }}>
                                        <div style={{
                                            fontSize: '1.3rem',
                                            fontWeight: 700,
                                            color: 'var(--accent)'
                                        }}>
                                            {formatCurrency(order.totalAmount)}
                                        </div>
                                        {getActionButton(order)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerOrders;
