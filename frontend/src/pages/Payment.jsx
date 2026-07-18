import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../api/client';
import './Payment.css';

const Payment = () => {
    const navigate = useNavigate();
    const { orderId } = useParams(); // Get order ID from URL if paying for existing order
    const { user, logout } = useAuth();
    const { cartItems, getCartTotal, getCartCount, clearCart, rentalPeriod } = useCart();
    const { wishlist } = useWishlist();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [saveDetails, setSaveDetails] = useState(false);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);

    const displayName = user?.name || 'User';
    const initials = displayName.split(/\s+/).map((n) => n[0]).join('').toUpperCase().slice(0, 2);

    // If orderId is present, fetch the order details
    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            console.log('Fetching order:', orderId);
            setLoading(true);
            const response = await api.get(`/orders/${orderId}`);
            console.log('Order response:', response.data);
            if (response.data.success) {
                setOrder(response.data.data);
                console.log('Order loaded:', response.data.data);
            } else {
                console.error('Order fetch failed:', response.data.message);
                alert('Failed to load order: ' + response.data.message);
            }
        } catch (error) {
            console.error('Failed to fetch order:', error);
            console.error('Error details:', error.response?.data);
            alert('Failed to load order details: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    const toggleUserDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handlePayment = async (e) => {
        e.preventDefault();

        try {
            if (orderId) {
                // Paying for existing order
                const response = await api.post(`/orders/${orderId}/pay`);

                if (response.data.success) {
                    alert('Payment successful!');
                    navigate(`/customer/orders/${orderId}`);
                } else {
                    alert('Payment failed: ' + response.data.message);
                }
            } else {
                // Create Order from Cart
                const response = await api.post('/orders', {
                    items: cartItems,
                    total: getCartTotal()
                });

                if (response.data.success) {
                    setTimeout(() => {
                        clearCart();
                        navigate('/order-success', { state: { order: response.data.data } });
                    }, 1500);
                } else {
                    alert('Order creation failed: ' + response.data.message);
                }
            }
        } catch (error) {
            console.error('Payment Error:', error);
            alert('Payment failed. Please try again.');
        }
    };

    return (
        <div className="payment-page">
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

            {/* Breadcrumb */}
            <div className="breadcrumb">
                <Link to="/cart" className="breadcrumb-item">Order</Link>
                <Link to="/address" className="breadcrumb-item"> › Address</Link>
                <span className="breadcrumb-item active"> › Payment</span>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* Payment Section - Express Checkout Form */}
                <div className="payment-section">
                    <h2>Express Checkout</h2>

                    <form onSubmit={handlePayment} className="checkout-form">
                        <div className="form-group">
                            <h3>Card Details</h3>
                            <input type="text" className="form-input" placeholder="xxxx xxxx xxxx xxxx" required />
                            <div className="checkbox-group" onClick={() => setSaveDetails(!saveDetails)}>
                                <div className={`checkbox ${saveDetails ? 'checked' : ''}`}></div>
                                <label>Save my payment details</label>
                            </div>
                        </div>

                        <div className="form-group">
                            <h3>Personal Details</h3>
                            <div className="form-row-2">
                                <div className="input-group">
                                    <label className="form-label">Name</label>
                                    <input type="text" className="form-input" defaultValue={user?.name} required />
                                </div>
                                <div className="input-group">
                                    <label className="form-label">Email</label>
                                    <input type="email" className="form-input" defaultValue={user?.email} required />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <h3>Shipping Address</h3>
                            <div className="form-row-2">
                                <div className="input-group">
                                    <label className="form-label">Address</label>
                                    <input type="text" className="form-input" placeholder="Street Address" required />
                                </div>
                                <div className="input-group">
                                    <label className="form-label">City</label>
                                    <input type="text" className="form-input" required />
                                </div>
                            </div>
                            <div className="form-row-3">
                                <div className="input-group">
                                    <label className="form-label">Zip Code</label>
                                    <input type="text" className="form-input" required />
                                </div>
                                <div className="input-group">
                                    <label className="form-label">State</label>
                                    <input type="text" className="form-input" required />
                                </div>
                                <div className="input-group">
                                    <label className="form-label">Country</label>
                                    <input type="text" className="form-input" required />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-pay-now" style={{ width: '100%', marginTop: '1rem' }}>
                            {orderId ? `Pay Invoice (Rs ${Number(order?.totalAmount || 0).toFixed(2)})` : `Request Quotation (R${getCartTotal().toFixed(2)})`}
                        </button>
                    </form>
                </div>

                {/* Summary Sidebar */}
                <div className="summary-sidebar">
                    <div className="summary-box">
                        {/* Product Preview - Showing order items if paying invoice, otherwise cart items */}
                        {(orderId ? order?.items : cartItems)?.slice(0, 3).map((item, idx) => (
                            <div key={item.id || idx} className="product-preview">
                                <div className="product-image">
                                    {item.product?.imageUrl && !item.product.imageUrl.startsWith('data') ? (
                                        <img src={item.product.imageUrl} alt={item.product.name} />
                                    ) : item.imageUrl && !item.imageUrl.startsWith('data') ? (
                                        <img src={item.imageUrl} alt={item.name} />
                                    ) : (
                                        '📦'
                                    )}
                                </div>
                                <div className="product-info">
                                    <h3>{item.product?.name || item.name}</h3>
                                    <div className="product-price">Rs {item.price} x {item.quantity}</div>
                                    {(item.startDate || item.endDate) && (
                                        <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '0.2rem' }}>
                                            📅 {item.startDate ? new Date(item.startDate).toLocaleDateString('en-IN') : ''} → {item.endDate ? new Date(item.endDate).toLocaleDateString('en-IN') : ''}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {(orderId ? order?.items?.length : cartItems.length) > 3 && (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                + {(orderId ? order.items.length : cartItems.length) - 3} more items
                            </div>
                        )}

                        {/* Summary */}
                        <div className="summary-row">
                            <span>Delivery Charges</span>
                            <span>Free</span>
                        </div>
                        <div className="summary-row">
                            <span>Sub Total</span>
                            <span>Rs {orderId ? (Number(order?.totalAmount || 0) / 1.18).toFixed(2) : getCartTotal().toFixed(2)}</span>
                        </div>
                        {orderId && (
                            <div className="summary-row">
                                <span>Tax (18%)</span>
                                <span>Rs {(Number(order?.totalAmount || 0) - (Number(order?.totalAmount || 0) / 1.18)).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>Rs {orderId ? Number(order?.totalAmount || 0).toFixed(2) : getCartTotal().toFixed(2)}</span>
                        </div>

                        {/* Back Button */}
                        <button className="btn btn-back" style={{ marginTop: '1rem', width: '100%' }} onClick={() => navigate(orderId ? `/customer/orders/${orderId}` : '/cart')}>
                            ‹ Back to {orderId ? 'Order' : 'Cart'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
