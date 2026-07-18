import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import api from '../../api/client';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import PricingBreakdown from '../../components/PricingBreakdown';
import '../Dashboard.css';
import './CustomerOrderDetail.css';

const CustomerOrderDetail = () => {
    const { id } = useParams();
    const { user, logout } = useAuth();
    const { getCartCount } = useCart();
    const { wishlist } = useWishlist();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const displayName = user?.name || 'User';
    const email = user?.email || 'user@example.com';
    const initials = displayName.split(/\s+/).map((n) => n[0]).join('').toUpperCase().slice(0, 2);

    useEffect(() => {
        if (!user || user.role !== 'CUSTOMER') {
            navigate('/');
            return;
        }
        fetchOrderDetail();
    }, [id, user, navigate]);

    const fetchOrderDetail = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/orders/${id}`);

            if (response.data.success) {
                setOrder(response.data.data);
            } else {
                setError('Order not found');
            }
        } catch (err) {
            console.error('Failed to fetch order:', err);
            setError(err.response?.data?.message || 'Failed to load order');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmOrder = async () => {
        if (!window.confirm('Confirm this order? This will reserve the items.')) return;

        try {
            const response = await api.post(`/orders/${id}/confirm`);
            if (response.data.success) {
                alert('Order confirmed successfully!');
                fetchOrderDetail();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to confirm order');
        }
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

    const getActionButtons = () => {
        if (!order) return null;

        switch (order.status) {
            case 'QUOTATION_SENT':
                return (
                    <button onClick={handleConfirmOrder} className="action-btn confirm">
                        Confirm Order
                    </button>
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
                    <button className="action-btn view" onClick={() => window.print()}>
                        Print Invoice
                    </button>
                );
            default:
                return null;
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
                <div className="loading-state">Loading order details...</div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="dashboard-page">
                <div className="error-state">
                    <p>{error || 'Order not found'}</p>
                    <Link to="/customer/orders" className="back-link">
                        ← Back to Orders
                    </Link>
                </div>
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
                            placeholder="Search for products, brands, gaming..."
                            disabled
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
                                <Link to="/customer/orders" className="dropdown-item"><span>📦</span><span>My Orders</span></Link>
                                <Link to="#" className="dropdown-item"><span>⚙️</span><span>Settings</span></Link>
                                <div className="dropdown-divider" />
                                <button onClick={handleLogout} className="dropdown-item"><span>🚪</span><span>Logout</span></button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Order Detail Content */}
            <div className="main-layout" style={{ paddingTop: '2rem' }}>
                <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                    {/* Header */}
                    <div className="detail-header" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '2rem'
                    }}>
                        <Link to="/customer/orders" className="back-link" style={{
                            color: 'var(--accent)',
                            textDecoration: 'none',
                            fontWeight: 600
                        }}>
                            ← Back to Orders
                        </Link>
                        <div className="header-actions">
                            {getActionButtons()}
                        </div>
                    </div>

                    {/* Order Info */}
                    <div className="order-info-card" style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        marginBottom: '1.5rem'
                    }}>
                        <div className="order-title-row" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start'
                        }}>
                            <div>
                                <h1 style={{ fontSize: '1.8rem', color: 'var(--text)', margin: 0 }}>
                                    Order #{order.orderNumber}
                                </h1>
                                <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>
                                    Created on {formatDate(order.createdAt)}
                                </p>
                            </div>
                            <OrderStatusBadge status={order.status} />
                        </div>
                    </div>

                    {/* Rental Period */}
                    {order.items[0]?.startDate && order.items[0]?.endDate && (
                        <div className="rental-period-card" style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            marginBottom: '1.5rem'
                        }}>
                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', color: 'var(--text)' }}>
                                Rental Period
                            </h3>
                            <div className="period-display" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2rem',
                                flexWrap: 'wrap'
                            }}>
                                <div className="period-date">
                                    <span style={{
                                        fontSize: '0.85rem',
                                        color: 'var(--text-muted)',
                                        textTransform: 'uppercase',
                                        display: 'block',
                                        marginBottom: '0.5rem'
                                    }}>Start Date</span>
                                    <span style={{
                                        fontSize: '1.1rem',
                                        color: 'var(--text)',
                                        fontWeight: 600
                                    }}>{formatDate(order.items[0].startDate)}</span>
                                </div>
                                <div style={{ fontSize: '1.5rem', color: 'var(--accent)' }}>→</div>
                                <div className="period-date">
                                    <span style={{
                                        fontSize: '0.85rem',
                                        color: 'var(--text-muted)',
                                        textTransform: 'uppercase',
                                        display: 'block',
                                        marginBottom: '0.5rem'
                                    }}>End Date</span>
                                    <span style={{
                                        fontSize: '1.1rem',
                                        color: 'var(--text)',
                                        fontWeight: 600
                                    }}>{formatDate(order.items[0].endDate)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Items */}
                    <div className="items-card" style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        marginBottom: '1.5rem'
                    }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', color: 'var(--text)' }}>
                            Order Items
                        </h3>
                        <div className="items-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {order.items.map((item, idx) => (
                                <div key={idx} className="item-row" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    background: 'var(--surface-light)',
                                    borderRadius: '8px'
                                }}>
                                    <div className="item-info">
                                        <div style={{
                                            fontSize: '1.1rem',
                                            color: 'var(--text)',
                                            fontWeight: 600,
                                            marginBottom: '0.25rem'
                                        }}>{item.product.name}</div>
                                        <div style={{
                                            display: 'flex',
                                            gap: '1rem',
                                            fontSize: '0.9rem',
                                            color: 'var(--text-muted)'
                                        }}>
                                            {item.product.brand && (
                                                <span style={{ fontWeight: 500 }}>{item.product.brand}</span>
                                            )}
                                            <span style={{ fontWeight: 600 }}>Qty: {item.quantity}</span>
                                        </div>
                                    </div>
                                    <div style={{
                                        fontSize: '1.2rem',
                                        fontWeight: 700,
                                        color: 'var(--accent)'
                                    }}>
                                        {formatCurrency(item.price * item.quantity)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pricing */}
                    <PricingBreakdown
                        items={order.items.map(item => ({
                            price: item.price,
                            quantity: item.quantity
                        }))}
                        taxRate={18}
                        deposit={0}
                    />

                    {/* Invoice Info (if paid) */}
                    {order.invoice && (
                        <div className="invoice-card" style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            marginBottom: '1.5rem'
                        }}>
                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', color: 'var(--text)' }}>
                                Invoice Information
                            </h3>
                            <div className="invoice-details" style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem'
                            }}>
                                <div className="invoice-row" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '0.75rem',
                                    background: 'var(--surface-light)',
                                    borderRadius: '8px'
                                }}>
                                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Invoice Number:</span>
                                    <span style={{ color: 'var(--text)', fontWeight: 600 }}>{order.invoice.invoiceNumber}</span>
                                </div>
                                <div className="invoice-row" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '0.75rem',
                                    background: 'var(--surface-light)',
                                    borderRadius: '8px'
                                }}>
                                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Status:</span>
                                    <span className={`invoice-status ${order.invoice.status.toLowerCase()}`}>
                                        {order.invoice.status}
                                    </span>
                                </div>
                                {order.invoice.paymentDate && (
                                    <div className="invoice-row" style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '0.75rem',
                                        background: 'var(--surface-light)',
                                        borderRadius: '8px'
                                    }}>
                                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Payment Date:</span>
                                        <span style={{ color: 'var(--text)', fontWeight: 600 }}>{formatDate(order.invoice.paymentDate)}</span>
                                    </div>
                                )}
                                {order.invoice.method && (
                                    <div className="invoice-row" style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '0.75rem',
                                        background: 'var(--surface-light)',
                                        borderRadius: '8px'
                                    }}>
                                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Payment Method:</span>
                                        <span style={{ color: 'var(--text)', fontWeight: 600 }}>{order.invoice.method}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Order Timeline */}
                    <div className="timeline-card" style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        marginBottom: '2rem'
                    }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', color: 'var(--text)' }}>
                            Order Timeline
                        </h3>
                        <div className="timeline" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            position: 'relative',
                            paddingLeft: '2rem'
                        }}>
                            <div className="timeline-item completed">
                                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
                                    ✓ Order Created
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                    {formatDate(order.createdAt)}
                                </div>
                            </div>

                            {['QUOTATION_SENT', 'SALES_ORDER', 'CONFIRMED', 'PAID', 'PICKED_UP', 'RETURNED'].includes(order.status) && (
                                <div className="timeline-item completed">
                                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
                                        ✓ Quotation Sent
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                        By vendor
                                    </div>
                                </div>
                            )}

                            {['SALES_ORDER', 'CONFIRMED', 'PAID', 'PICKED_UP', 'RETURNED'].includes(order.status) && (
                                <div className="timeline-item completed">
                                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
                                        ✓ Order Confirmed
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                        Items reserved
                                    </div>
                                </div>
                            )}

                            {['PAID', 'PICKED_UP', 'RETURNED'].includes(order.status) && (
                                <div className="timeline-item completed">
                                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
                                        ✓ Payment Completed
                                    </div>
                                    {order.invoice?.paymentDate && (
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                            {formatDate(order.invoice.paymentDate)}
                                        </div>
                                    )}
                                </div>
                            )}

                            {['PICKED_UP', 'RETURNED'].includes(order.status) && (
                                <div className="timeline-item completed">
                                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
                                        ✓ Items Picked Up
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                        Rental active
                                    </div>
                                </div>
                            )}

                            {order.status === 'RETURNED' && (
                                <div className="timeline-item completed">
                                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
                                        ✓ Items Returned
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                        Order complete
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerOrderDetail;
