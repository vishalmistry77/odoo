import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Dashboard.css'; // Reusing dashboard styles for consistency

const Terms = () => {
    const { user, logout } = useAuth();
    const { getCartCount } = useCart();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const displayName = user?.name || 'User';
    const email = user?.email || 'user@example.com';
    const initials = displayName.split(/\s+/).map((n) => n[0]).join('').toUpperCase().slice(0, 2);

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    return (
        <div className="dashboard-page">
            <nav className="top-nav">
                <div className="nav-container">
                    <div className="logo-section">
                        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div className="logo-icon">🏠</div>
                            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>RentFlow</span>
                        </Link>
                    </div>
                    <div className="nav-links">
                        <Link to="/dashboard" className="nav-link">Products</Link>
                        <Link to="/terms" className="nav-link active">Terms & Condition</Link>
                        <Link to="/about" className="nav-link">About us</Link>
                        <Link to="/contact" className="nav-link">Contact Us</Link>
                    </div>
                    <div className="search-container" style={{ visibility: 'hidden' }}>
                        <input type="text" className="search-input" />
                        <button className="search-btn">🔍</button>
                    </div>
                    <div className="nav-actions">
                        <div className="icon-btn" title="Wishlist">❤️</div>
                        <Link to="/cart" className="icon-btn" style={{ textDecoration: 'none', color: 'inherit' }} title="Cart">
                            🛒
                            <span className="cart-badge">{getCartCount()}</span>
                        </Link>
                        <div className="user-profile-btn" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                            <div className="user-avatar">{initials}</div>
                            <span className="dropdown-arrow">▼</span>
                            {isDropdownOpen && (
                                <div className="user-dropdown active">
                                    <div className="dropdown-header">
                                        <div className="dropdown-user-name">{displayName}</div>
                                        <div className="dropdown-user-email">{email}</div>
                                    </div>
                                    <button onClick={handleLogout} className="dropdown-item"><span>🚪</span><span>Logout</span></button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="main-layout" style={{ display: 'block', maxWidth: '800px', margin: '2rem auto', padding: '2rem', background: 'var(--surface)', borderRadius: '12px' }}>
                <h1 style={{ marginBottom: '1.5rem', color: 'var(--text)' }}>Terms & Conditions</h1>
                <div style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                    <p style={{ marginBottom: '1rem' }}>Welcome to RentFlow using our services, you agree to these terms...</p>
                    <h3 style={{ color: 'var(--text)', margin: '1.5rem 0 0.5rem' }}>1. Rental Agreement</h3>
                    <p style={{ marginBottom: '1rem' }}>All equipment rentals are subject to availability and credit approval. The renter is responsible for the equipment from the time of delivery until pickup.</p>
                    <h3 style={{ color: 'var(--text)', margin: '1.5rem 0 0.5rem' }}>2. Liability</h3>
                    <p style={{ marginBottom: '1rem' }}>RentFlow is not liable for any injuries or damages resulting from the improper use of rented equipment.</p>
                    <h3 style={{ color: 'var(--text)', margin: '1.5rem 0 0.5rem' }}>3. Cancellations</h3>
                    <p style={{ marginBottom: '1rem' }}>Cancellations made less than 24 hours before the rental period may be subject to a cancellation fee.</p>
                </div>
            </div>
        </div>
    );
};

export default Terms;
