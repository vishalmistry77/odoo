import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../api/client';
import './Address.css';

const Address = () => {
    const navigate = useNavigate();
    const { user, logout, updateUser } = useAuth();
    const { cartItems, getCartTotal, getCartCount, rentalPeriod } = useCart();
    const { wishlist } = useWishlist();
    const [selectedDelivery, setSelectedDelivery] = useState('standard');
    const [billingSameAsDelivery, setBillingSameAsDelivery] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [address, setAddress] = useState(user?.address || '');
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const [addressError, setAddressError] = useState('');

    const displayName = user?.name || 'User';

    useEffect(() => {
        const loadSavedAddress = async () => {
            try {
                const response = await api.get('/users/profile');
                const profile = response.data?.data;
                if (profile) {
                    setAddress(profile.address || '');
                    updateUser(profile);
                }
            } catch (error) {
                console.error('Could not load the saved address:', error);
            }
        };

        loadSavedAddress();
    }, []);

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

    const saveAddress = async () => {
        const trimmedAddress = address.trim();
        if (!trimmedAddress) {
            setAddressError('Enter the full delivery address before continuing.');
            return null;
        }

        setAddressError('');
        setIsSavingAddress(true);
        try {
            const response = await api.put('/users/profile', { address: trimmedAddress });
            const updatedProfile = response.data?.data;
            updateUser(updatedProfile || { address: trimmedAddress });
            setAddress(trimmedAddress);
            return trimmedAddress;
        } catch (error) {
            setAddressError(error.response?.data?.message || 'Could not save the address. Please try again.');
            return null;
        } finally {
            setIsSavingAddress(false);
        }
    };

    const handleContinue = async () => {
        const savedAddress = await saveAddress();
        if (savedAddress) {
            navigate('/payment', { state: { deliveryAddress: savedAddress } });
        }
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
                                <div className="address-badge">Saved address</div>
                            </div>
                            <div className="address-name">{user?.name || 'Customer Name'}</div>
                            <label className="address-label" htmlFor="delivery-address">Full address</label>
                            <textarea
                                id="delivery-address"
                                className="address-input"
                                value={address}
                                onChange={(event) => setAddress(event.target.value)}
                                placeholder="House or flat number, street, area, city, state and PIN code"
                                rows="4"
                                autoComplete="street-address"
                                aria-describedby="delivery-address-help"
                            />
                            <p id="delivery-address-help" className="address-help">This address is saved to your account and used for this order.</p>
                            {addressError && <p className="address-error" role="alert">{addressError}</p>}
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
                        <button className="btn-continue" onClick={handleContinue} disabled={isSavingAddress}>
                            {isSavingAddress ? 'Saving address…' : 'Continue ›'}
                        </button>

                        <div className="or-divider">OR</div>

                        <button className="btn-back" onClick={() => navigate('/cart')}>‹ Back to Cart</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Address;
