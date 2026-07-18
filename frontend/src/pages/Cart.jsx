import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './Cart.css';

const Cart = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const {
        cartItems,
        cartLoading,
        updateQuantity,
        removeFromCart,
        getCartCount,
        getCartTotal,
        getSubtotal,
        getDiscount,
        applyCoupon,
        rentalPeriod,
        setRentalPeriod,
    } = useCart();
    const { wishlist } = useWishlist();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponMessage, setCouponMessage] = useState(null);

    const displayName = user?.name || 'User';
    const initials = displayName.split(/\s+/).map((n) => n[0]).join('').toUpperCase().slice(0, 2);

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };
    const toggleUserDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    const handleRemoveItem = (id) => {
        if (window.confirm('Remove this item from cart?')) {
            removeFromCart(id);
        }
    };

    const handleUpdateQty = (itemId, currentQty, delta) => {
        const newQty = Math.max(0, currentQty + delta);
        updateQuantity(itemId, newQty);
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponMessage(null);
        setCouponLoading(true);
        const result = await applyCoupon(couponCode.trim());
        setCouponLoading(false);
        if (result.success) {
            setCouponMessage({ type: 'success', text: 'Coupon applied successfully' });
        } else {
            setCouponMessage({ type: 'error', text: result.message || 'Invalid or expired coupon' });
        }
    };

    const discount = getDiscount();
    const subtotal = getSubtotal();
    const total = getCartTotal();

    return (
        <div className="cart-page">
            <nav className="top-nav">
                <div className="nav-container">
                    <div className="logo-box">🏠 RentFlow</div>
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
                        <div className="user-profile-btn" onClick={toggleUserDropdown}>
                            <div className="user-avatar">{initials}</div>
                            <span className="dropdown-arrow">▼</span>
                            <div className={`user-dropdown ${isDropdownOpen ? 'active' : ''}`}>
                                <div className="dropdown-header">
                                    <div className="dropdown-user-name">{displayName}</div>
                                    <div className="dropdown-user-email">{user?.email}</div>
                                </div>
                                <Link to="/vendor/profile" className="dropdown-item"><span>👤</span><span>My account/ My Profile</span></Link>
                                <Link to={user?.role === 'VENDOR' ? '/vendor/orders' : '/customer/orders'} className="dropdown-item"><span>📦</span><span>My Orders</span></Link>
                                <Link to="#" className="dropdown-item"><span>⚙️</span><span>Settings</span></Link>
                                <div className="dropdown-divider" />
                                <button onClick={handleLogout} className="dropdown-item"><span>🚪</span><span>Logout</span></button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="breadcrumb">
                <Link to="/cart" className="breadcrumb-item">Cart</Link>
                <span className="breadcrumb-item active">› Address › Payment</span>
            </div>

            <div className="main-content">
                <div className="cart-section">
                    <h2>Order Summary</h2>

                    {cartLoading ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading cart...</div>
                    ) : cartItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            <p>Your cart is empty.</p>
                            <Link to="/dashboard" className="continue-shopping" style={{ marginTop: '1rem' }}>Browse Products</Link>
                        </div>
                    ) : (
                        <>
                            {cartItems.map((item) => (
                                <div key={item.id} className="cart-item">
                                    <div className="item-header">
                                        <div className="item-image">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            ) : (
                                                <span style={{ fontSize: '2rem' }}>📦</span>
                                            )}
                                        </div>
                                        <div className="item-details">
                                            <h3>{item.name}</h3>
                                            <div className="item-price">R{Number(item.price).toFixed(2)} × {item.quantity}</div>
                                            {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                                                <div className="item-meta">
                                                    {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                                    {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                                </div>
                                            )}
                                            {(item.startDate || item.endDate) && (
                                                <div className="item-meta" style={{ marginTop: '0.25rem', color: 'var(--accent)' }}>
                                                    📅 {item.startDate ? item.startDate.split('T')[0] : ''} to {item.endDate ? item.endDate.split('T')[0] : ''}
                                                </div>
                                            )}
                                        </div>
                                        <div className="item-quantity">
                                            <button type="button" className="qty-btn" onClick={() => handleUpdateQty(item.id, item.quantity, -1)}>-</button>
                                            <span className="qty-value">{item.quantity}</span>
                                            <button type="button" className="qty-btn" onClick={() => handleUpdateQty(item.id, item.quantity, 1)}>+</button>
                                        </div>
                                    </div>
                                    <div className="item-actions">
                                        <button type="button" className="btn-text" onClick={() => handleRemoveItem(item.id)}>Remove</button>
                                        <button type="button" className="btn-text">Save For Later</button>
                                    </div>
                                </div>
                            ))}
                            <Link to="/dashboard" className="continue-shopping">Continue Shopping ›</Link>
                        </>
                    )}
                </div>

                <div className="summary-sidebar">

                    <div className="summary-row">
                        <span>Sub Total</span>
                        <span className="amount">R{subtotal.toFixed(2)}</span>
                    </div>
                    {discount.percent > 0 && (
                        <div className="summary-row" style={{ color: 'var(--accent)' }}>
                            <span>Discount ({discount.percent}%)</span>
                            <span className="amount">-R{discount.amount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="summary-row total">
                        <span>Total</span>
                        <span className="amount">R{total.toFixed(2)}</span>
                    </div>

                    <div className="coupon-section" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                        <input
                            type="text"
                            className="date-time-input"
                            placeholder="Coupon code"
                            value={couponCode}
                            onChange={(e) => { setCouponCode(e.target.value); setCouponMessage(null); }}
                            style={{ flex: 1, marginRight: '0.5rem' }}
                        />
                        <button type="button" className="btn btn-primary" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}>
                            {couponLoading ? 'Applying...' : 'Apply Coupon'}
                        </button>
                        {couponMessage && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: couponMessage.type === 'success' ? 'var(--success, #10b981)' : 'var(--error, #ef4444)' }}>
                                {couponMessage.text}
                            </div>
                        )}
                    </div>

                    <div className="action-buttons">
                        <button type="button" className="btn btn-secondary">Pay with Saved Card</button>
                        <button type="button" className="btn btn-checkout" onClick={() => navigate('/address')}>Checkout</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
