import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Index = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-light)' }}>
            <div className="loading-spinner"></div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-light)' }}>
            {/* Modern Header */}
            <header className="header">
                <div className="nav-container">
                    <Link to="/" className="logo">
                        <div className="logo-icon">☀</div>
                        <span>RentFlow</span>
                    </Link>
                    
                    <nav>
                        <ul className="nav-links" style={{ display: 'flex', gap: '2rem', listStyle: 'none', margin: 0, padding: 0 }}>
                            <li><a href="#" className="active" style={{ color: 'var(--accent-orange)', textDecoration: 'none', fontWeight: 500, position: 'relative' }}>Home</a></li>
                            <li><a href="#" style={{ color: 'var(--text-dark)', textDecoration: 'none', fontWeight: 500 }}>Shop</a></li>
                            <li><a href="#" style={{ color: 'var(--text-dark)', textDecoration: 'none', fontWeight: 500 }}>Categories</a></li>
                            <li><a href="#" style={{ color: 'var(--text-dark)', textDecoration: 'none', fontWeight: 500 }}>About</a></li>
                        </ul>
                    </nav>
                    
                    <div className="nav-icons" style={{ display: 'flex', gap: '1.5rem' }}>
                        <div style={{ cursor: 'pointer', color: 'var(--text-dark)' }}>🔍</div>
                        <div style={{ cursor: 'pointer', color: 'var(--text-dark)' }}>❤️</div>
                        <div style={{ cursor: 'pointer', color: 'var(--text-dark)' }}>👤</div>
                        <div style={{ cursor: 'pointer', color: 'var(--text-dark)' }}>🛍️</div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero" style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                <div className="hero-content">
                    <div style={{ 
                        display: 'inline-block', 
                        background: 'var(--accent-orange-light)', 
                        color: 'var(--accent-orange)', 
                        padding: '0.5rem 1rem', 
                        borderRadius: '25px', 
                        fontSize: '0.9rem', 
                        fontWeight: 600, 
                        marginBottom: '1rem' 
                    }}>
                        New Collection 2026
                    </div>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1.5rem', color: 'var(--text-dark)' }}>
                        Discover Your <span style={{ color: 'var(--accent-orange)' }}>Perfect Style</span>
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-light)', marginBottom: '2rem', lineHeight: 1.6 }}>
                        Explore our curated collection of premium products. From fashion to electronics, find everything you need with fast delivery and secure payments.
                    </p>
                    
                    <div className="hero-buttons" style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
                        {user ? (
                            <Link to="/dashboard" className="btn-primary">
                                Go to Dashboard →
                            </Link>
                        ) : (
                            <>
                                <Link to="/signup" className="btn-primary">
                                    Get Started →
                                </Link>
                                <Link to="/login" className="btn-secondary">
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                    
                    <div className="hero-stats" style={{ display: 'flex', gap: '3rem' }}>
                        <div className="stat-item">
                            <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>50K+</h3>
                            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Happy Customers</p>
                        </div>
                        <div className="stat-item">
                            <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>10K+</h3>
                            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Products</p>
                        </div>
                        <div className="stat-item">
                            <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>4.9</h3>
                            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Rating</p>
                        </div>
                    </div>
                </div>
                
                <div className="hero-image" style={{ position: 'relative' }}>
                    <img 
                        src="https://picsum.photos/seed/rentflow-hero/600/400.jpg" 
                        alt="Hero Image" 
                        style={{ 
                            width: '100%', 
                            height: 'auto', 
                            borderRadius: '20px', 
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' 
                        }}
                    />
                    <div style={{ 
                        position: 'absolute', 
                        top: '20px', 
                        right: '20px', 
                        background: 'rgba(255, 255, 255, 0.95)', 
                        padding: '0.5rem 1rem', 
                        borderRadius: '25px', 
                        fontWeight: 600, 
                        color: 'var(--accent-orange)', 
                        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' 
                    }}>
                        Special Offer Up to 40% OFF
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features" style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', background: 'var(--bg-white)' }}>
                <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
                    <div className="card feature-card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                        <div style={{ 
                            width: '60px', 
                            height: '60px', 
                            margin: '0 auto 1rem', 
                            background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-yellow))', 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: 'white', 
                            fontSize: '1.5rem' 
                        }}>
                            🚚
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Free Shipping</h3>
                        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: 1.4 }}>Free shipping on all orders above $100</p>
                    </div>
                    <div className="card feature-card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                        <div style={{ 
                            width: '60px', 
                            height: '60px', 
                            margin: '0 auto 1rem', 
                            background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-yellow))', 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: 'white', 
                            fontSize: '1.5rem' 
                        }}>
                            🔒
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Secure Payments</h3>
                        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: 1.4 }}>100% secure payment process</p>
                    </div>
                    <div className="card feature-card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                        <div style={{ 
                            width: '60px', 
                            height: '60px', 
                            margin: '0 auto 1rem', 
                            background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-yellow))', 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: 'white', 
                            fontSize: '1.5rem' 
                        }}>
                            📞
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>24/7 Support</h3>
                        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: 1.4 }}>Dedicated customer support</p>
                    </div>
                    <div className="card feature-card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                        <div style={{ 
                            width: '60px', 
                            height: '60px', 
                            margin: '0 auto 1rem', 
                            background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-yellow))', 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: 'white', 
                            fontSize: '1.5rem' 
                        }}>
                            🔄
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Easy Returns</h3>
                        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: 1.4 }}>30-day return policy</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Index;
