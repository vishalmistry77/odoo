import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Dashboard.css';

const About = () => {
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
                        <Link to="/terms" className="nav-link">Terms & Condition</Link>
                        <Link to="/about" className="nav-link active">About us</Link>
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
                <h1 style={{ marginBottom: '1.5rem', color: 'var(--text)' }}>About RentFlow</h1>
                <div style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                    <p style={{ marginBottom: '1rem' }}>
                        RentFlow is your premier destination for high-quality equipment rentals. Founded in 2024, our mission is to make professional gear accessible to everyone.
                    </p>
                    <p style={{ marginBottom: '1rem' }}>
                        Whether you are a professional photographer, a construction manager, or hosting a weekend party, we have the right tools for you. Our inventory is constantly updated with the latest technology and equipment.
                    </p>
                    <p>
                        We pride ourselves on transparent pricing, flexible rental periods, and exceptional customer service.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;
