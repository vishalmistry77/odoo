import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './OrderSuccess.css';

const OrderSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { rentalPeriod, getCartCount } = useCart();
    const { wishlist } = useWishlist();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const displayName = user?.name || 'User';
    const order = location.state?.order; // Retrieve order from navigation state

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    const toggleUserDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    if (!order) {
        return (
            <div className="success-page">
                <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>
                    <h1>Loading Order Details...</h1>
                    <p>If you are not redirected, please check your order history.</p>
                    <button className="btn-continue" style={{ marginTop: '1rem', padding: '0.5rem 1rem' }} onClick={() => navigate('/dashboard')}>
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="success-page">
            {/* Top Navigation */}
            <nav className="top-nav">
                <div className="nav-container">
                    <div className="logo-box">🏠 RentFlow</div>

                    <div className="search-container">
                        <input type="text" className="search-input" placeholder="Search..." />
                        <button className="search-btn">🔍</button>
                    </div>

                    <div className="nav-links">
                        <Link to="/dashboard" className="nav-link">Products</Link>
                        <Link to="/terms" className="nav-link">Terms & Condition</Link>
                        <Link to="/about" className="nav-link">About us</Link>
                        <Link to="/contact" className="nav-link">Contact Us</Link>
                    </div>

                    <div className="nav-actions">
                        <div className="icon-btn" title="Wishlist">❤️ <span className="cart-badge" style={{ background: 'var(--accent)' }}>{wishlist.length}</span></div>
                        <Link to="/cart" className="icon-btn" style={{ textDecoration: 'none', color: 'inherit' }}>
                            🛒 <span className="cart-badge">{getCartCount()}</span>
                        </Link>
                        <div className="user-profile-btn" onClick={toggleUserDropdown} style={{ position: 'relative' }}>
                            <div>👤</div>
                            {/* User Dropdown Menu */}
                            {isDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '0.5rem',
                                    background: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    padding: '0.5rem',
                                    width: '200px',
                                    zIndex: 1000,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                                }}>
                                    <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ fontWeight: 600 }}>{displayName}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                                    </div>
                                    <button onClick={handleLogout} style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '0.75rem',
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span>🚪</span> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="main-content">
                {/* Success Section */}
                <div className="success-section">
                    <div className="success-header">
                        <h1>Thank you for your order</h1>
                        <div className="order-number">Order {order.orderNumber}</div>
                    </div>

                    <div className="success-message">
                        Your Payment has been processed.
                    </div>

                    {/* Delivery & Billing Address */}
                    <div className="address-section">
                        <div className="address-header">
                            <div className="address-badge">Delivery & Billing</div>
                        </div>
                        <div className="address-name">{user?.name || 'Customer Name'}</div>
                        <div className="address-text">
                            123 Main Street, Apartment 4B<br />
                            New York, NY 10001<br />
                            United States
                        </div>
                    </div>

                    {/* Backend Note remove or keep? User asked to "create order" not "show note" */}
                    <div className="backend-note" style={{ display: 'none' }}>
                        Order ID: {order.id}
                    </div>
                </div>

                {/* Summary Sidebar */}
                <div className="summary-sidebar">
                    <button className="print-button" onClick={() => window.print()}>🖨️ Print</button>

                    <div className="summary-box">
                        {/* Product Preview - Iterating over order items */}
                        {order.items && order.items.map((item) => (
                            <div key={item.id} className="product-preview">
                                <div className="product-image">
                                    {item.product?.imageUrl && !item.product.imageUrl.startsWith('data') ? (
                                        <img src={item.product.imageUrl} alt={item.product.name} />
                                    ) : (
                                        '📦'
                                    )}
                                </div>
                                <div className="product-info">
                                    <h3>{item.product?.name || 'Product'}</h3>
                                    <div className="product-price">R{item.price} x {item.quantity}</div>
                                </div>
                            </div>
                        ))}

                        {/* Rental Period */}
                        <div style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
                            <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Rental Period</div>
                            <div>
                                {rentalPeriod?.startDate ? `${rentalPeriod.startDate} ${rentalPeriod.startTime}` : 'Not selected'}
                                {' to '}
                                {rentalPeriod?.endDate ? `${rentalPeriod.endDate} ${rentalPeriod.endTime}` : 'Not selected'}
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="summary-row">
                            <span>Delivery Charges</span>
                            <span>Free</span>
                        </div>
                        <div className="summary-row">
                            <span>Sub Total</span>
                            <span>R{order.totalAmount || '0.00'}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>R{order.totalAmount || '0.00'}</span>
                        </div>

                        {/* Social Share */}
                        <div className="social-share">
                            <div className="share-buttons">
                                <div className="social-btn" title="Share on Instagram">📷</div>
                                <div className="social-btn" title="Share on Twitter">🐦</div>
                                <div className="social-btn" title="Share on Telegram">✈️</div>
                            </div>
                        </div>

                        <button className="btn-continue" style={{ marginTop: '2rem', width: '100%', padding: '1rem', background: 'var(--accent)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
