import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Dashboard.css';

const Contact = () => {
    const { user, logout } = useAuth();
    const { getCartCount } = useCart();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [formStatus, setFormStatus] = useState(null);

    const displayName = user?.name || 'User';
    const email = user?.email || 'user@example.com';
    const initials = displayName.split(/\s+/).map((n) => n[0]).join('').toUpperCase().slice(0, 2);

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormStatus('sending');
        // Simulate sending
        setTimeout(() => {
            setFormStatus('sent');
            e.target.reset();
        }, 1500);
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
                        <Link to="/about" className="nav-link">About us</Link>
                        <Link to="/contact" className="nav-link active">Contact Us</Link>
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
                <h1 style={{ marginBottom: '1.5rem', color: 'var(--text)' }}>Contact Us</h1>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                        <h3 style={{ marginBottom: '1rem' }}>Get in Touch</h3>
                        <div style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                            <div style={{ marginBottom: '0.5rem' }}>📍 123 Rental Street, Cityville</div>
                            <div style={{ marginBottom: '0.5rem' }}>📞 (555) 123-4567</div>
                            <div style={{ marginBottom: '0.5rem' }}>✉️ support@rentflow.com</div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Subject</label>
                            <input type="text" className="form-input" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Message</label>
                            <textarea required rows="4" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', resize: 'vertical' }}></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={formStatus === 'sending'}>
                            {formStatus === 'sending' ? 'Sending...' : 'Send Message'}
                        </button>
                        {formStatus === 'sent' && <div style={{ color: 'var(--success, green)', marginTop: '0.5rem' }}>Message sent successfully!</div>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
