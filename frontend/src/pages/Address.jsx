import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './Address.css';

const Address = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { cartItems, getCartTotal, getCartCount, rentalPeriod } = useCart();
    const { wishlist } = useWishlist();
    const [selectedDelivery, setSelectedDelivery] = useState('standard');
    const [billingSameAsDelivery, setBillingSameAsDelivery] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const displayName = user?.name || 'User';

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    const toggleUserDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const toggleBilling = () => {
        setBillingSameAsDelivery(!billingSameAsDelivery);
    };

    const handleContinue = () => {
        navigate('/payment');
    };

    return (
        <div className="address-page">
            {/* Top Navigation */}
            <nav className="top-nav">
                <div className="nav-container">
                    <div className="logo-box">🏠 Your Logo</div>

                    <div className="nav-links">
                        <Link to="/dashboard" className="nav-link">Products</Link>
                        <Link to="/terms" className="nav-link">Terms & Condition</Link>
                        <Link to="/about" className="nav-link">About us</Link>
                        <Link to="/contact" className="nav-link">Contact Us</Link>
                    </div>

                    <div className="search-container">
                        <input type="text" className="search-input" placeholder="Search..." />
                        <button className="search-btn">🔍</button>
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

            {/* Breadcrumb */}
            <div className="breadcrumb">
                <Link to="/cart" className="breadcrumb-item">Order</Link>
                <span className="breadcrumb-item active"> › Address</span>
                <span className="breadcrumb-item"> › Payment</span>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* Form Section */}
                <div className="form-section">
                    {/* Delivery Method */}
                    <div className="form-group">
                        <h2>Delivery Method</h2>
                        <div className="delivery-options">
                            <div
                                className={`delivery-option ${selectedDelivery === 'standard' ? 'selected' : ''}`}
                                onClick={() => setSelectedDelivery('standard')}
                            >
                                <div className="delivery-info">
                                    <div className="radio-btn"></div>
                                    <span>Standard Delivery</span>
                                </div>
                                <div className="delivery-price">Free</div>
                            </div>
                            <div
                                className={`delivery-option ${selectedDelivery === 'pickup' ? 'selected' : ''}`}
                                onClick={() => setSelectedDelivery('pickup')}
                            >
                                <div className="delivery-info">
                                    <div className="radio-btn"></div>
                                    <span>Pick up From Store</span>
                                </div>
                                <div className="delivery-price">Free</div>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="form-group">
                        <h3>Delivery Address</h3>
                        <div className="address-card">
                            <div className="address-header">
                                <div className="address-badge">Main Address</div>
                                <button className="edit-btn">✏️</button>
                            </div>
                            <div className="address-name">{user?.name || 'Customer Name'}</div>
                            <div className="address-text">
                                123 Main Street, Apartment 4B<br />
                                New York, NY 10001<br />
                                United States
                            </div>
                        </div>
                    </div>

                    {/* Billing Address */}
                    <div className="form-group">
                        <h3>Billing Address</h3>
                        <div className="billing-toggle" onClick={toggleBilling}>
                            <div className={`toggle-switch ${billingSameAsDelivery ? 'active' : ''}`}>
                                <div className="toggle-slider"></div>
                            </div>
                            <span className="toggle-label">If enabled, it will make Billing and Delivery address the same</span>
                        </div>
                    </div>
                </div>

                {/* Summary Sidebar */}
                <div className="summary-sidebar">
                    <div className="summary-box">
                        {/* Product Preview - Showing top items */}
                        {cartItems.slice(0, 3).map((item) => (
                            <div key={item.id} className="product-preview">
                                <div className="product-image">
                                    {item.image && !item.image.startsWith('data') ? '📦' : <img src={item.image} alt={item.name} />}
                                </div>
                                <div className="product-info">
                                    <h3>{item.name}</h3>
                                    <div className="product-price">{item.price} x {item.quantity}</div>
                                </div>
                            </div>
                        ))}
                        {cartItems.length > 3 && (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                + {cartItems.length - 3} more items
                            </div>
                        )}

                        {/* Rental Period */}
                        <div style={{ marginBottom: '1.5rem' }}>
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
                            <span>-</span>
                        </div>
                        <div className="summary-row">
                            <span>Sub Total</span>
                            <span>R{getCartTotal().toFixed(2)}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>R{getCartTotal().toFixed(2)}</span>
                        </div>

                        {/* Buttons */}
                        <button className="btn-continue" onClick={handleContinue}>Continue ›</button>

                        <div className="or-divider">OR</div>

                        <button className="btn-back" onClick={() => navigate('/cart')}>‹ Back to Cart</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Address;
