import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSearch } from '../context/SearchContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../api/client';
import './Dashboard.css';

const DURATION_LABELS = { HOUR: 'Hour', DAY: 'Day', WEEK: 'Week', MONTH: 'Month', YEAR: 'Year' };

const Dashboard = () => {
    const { user, logout } = useAuth();
    const { getCartCount } = useCart();
    const { searchQuery, setSearchQuery } = useSearch();
    const { wishlist, toggleWishlist, isInWishlist } = useWishlist();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [filters, setFilters] = useState({
        brand: '',
        color: '',
        durationType: '',
        minPrice: '',
        maxPrice: '',
    });

    const displayName = user?.name || 'User';
    const email = user?.email || 'user@example.com';
    const initials = displayName.split(/\s+/).map((n) => n[0]).join('').toUpperCase().slice(0, 2);

    const fetchProducts = () => {
        setLoadError(false);
        setLoading(true);
        api.get('/products')
            .then((res) => {
                if (res.data?.success && Array.isArray(res.data.data)) {
                    setProducts(res.data.data);
                } else {
                    setProducts([]);
                }
            })
            .catch(() => {
                setProducts([]);
                setLoadError(true);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))].sort();
    const colors = [...new Set(products.map((p) => p.color).filter(Boolean))].sort();

    // Filter products based on search query and sidebar filters
    const filteredProducts = products.filter(p => {
        // Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchesSearch = p.name.toLowerCase().includes(q) ||
                p.brand?.toLowerCase().includes(q) ||
                p.category?.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q);
            if (!matchesSearch) return false;
        }

        // Sidebar Filters
        if (filters.brand && p.brand !== filters.brand) return false;
        if (filters.color && p.color !== filters.color) return false;
        if (filters.durationType && p.durationType !== filters.durationType) return false;
        if (filters.minPrice !== '' && p.price < Number(filters.minPrice)) return false;
        if (filters.maxPrice !== '' && p.price > Number(filters.maxPrice)) return false;

        return true;
    });

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };
    const toggleUserDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

    return (
        <div className="dashboard-page">
            <nav className="top-nav">
                <div className="nav-container">
                    <div className="logo-section">
                        <div className="logo-icon">🏠</div>
                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>RentFlow</span>
                    </div>
                    <div className="nav-links">
                        <Link to="/dashboard" className="nav-link active">Products</Link>
                        <Link to="/terms" className="nav-link">Terms & Condition</Link>
                        <Link to="/about" className="nav-link">About us</Link>
                        <Link to="/contact" className="nav-link">Contact Us</Link>
                    </div>
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search for products, brands, gaming..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                                <Link to={user?.role === 'VENDOR' ? '/vendor/orders' : '/customer/orders'} className="dropdown-item"><span>📦</span><span>My Orders</span></Link>
                                <Link to="#" className="dropdown-item"><span>⚙️</span><span>Settings</span></Link>
                                <div className="dropdown-divider" />
                                <button onClick={handleLogout} className="dropdown-item"><span>🚪</span><span>Logout</span></button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>


            <div className="main-layout">
                <aside className="filter-sidebar">
                    <div className="filter-section">
                        <div className="filter-title"><span>Brand</span></div>
                        <div className="filter-options">
                            <label className="filter-option">
                                <input type="radio" name="brand" checked={!filters.brand} onChange={() => updateFilter('brand', '')} />
                                <span className="filter-label">All</span>
                            </label>
                            {brands.map((b) => (
                                <label key={b} className="filter-option">
                                    <input type="radio" name="brand" checked={filters.brand === b} onChange={() => updateFilter('brand', b)} />
                                    <span className="filter-label">{b}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="filter-section">
                        <div className="filter-title"><span>Color</span></div>
                        <div className="filter-options">
                            <label className="filter-option">
                                <input type="radio" name="color" checked={!filters.color} onChange={() => updateFilter('color', '')} />
                                <span className="filter-label">All</span>
                            </label>
                            {colors.map((c) => (
                                <label key={c} className="filter-option">
                                    <input type="radio" name="color" checked={filters.color === c} onChange={() => updateFilter('color', c)} />
                                    <span className="filter-label">{c}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="filter-section">
                        <div className="filter-title"><span>Duration</span></div>
                        <div className="filter-options">
                            <label className="filter-option">
                                <input type="radio" name="duration" checked={!filters.durationType} onChange={() => updateFilter('durationType', '')} />
                                <span className="filter-label">All</span>
                            </label>
                            {['HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR'].map((d) => (
                                <label key={d} className="filter-option">
                                    <input type="radio" name="duration" checked={filters.durationType === d} onChange={() => updateFilter('durationType', d)} />
                                    <span className="filter-label">{DURATION_LABELS[d]}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="filter-section">
                        <div className="filter-title"><span>Price Range</span></div>
                        <div className="price-range">
                            <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => updateFilter('minPrice', e.target.value)} className="price-input" />
                            <span>–</span>
                            <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => updateFilter('maxPrice', e.target.value)} className="price-input" />
                        </div>
                    </div>
                </aside>

                <div className="products-section">
                    <div className="section-header">
                        <h2>Available Products</h2>
                    </div>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading products...</div>
                    ) : (
                        <div className="products-grid">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="product-card">
                                    <div className="product-image">
                                        <img src={product.imageUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect fill='%23252b4a' width='300' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='48' fill='%239ca3af' text-anchor='middle' dy='.3em'%3E📦%3C/text%3E%3C/svg%3E"} alt={product.name} />
                                        {product.stock === 0 && (
                                            <div className="out-of-stock-overlay">OUT OF STOCK</div>
                                        )}
                                        <button
                                            className="wishlist-btn-overlay"
                                            style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                background: isInWishlist(product.id) ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255,255,255,0.8)',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '32px',
                                                height: '32px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.2rem'
                                            }}
                                            onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                                        >
                                            {isInWishlist(product.id) ? '❤️' : '🤍'}
                                        </button>
                                    </div>
                                    <div className="product-info">
                                        <div className="product-name">{product.name}</div>
                                        <div className="product-price">
                                            <span className="price-label">R{product.price} / per {DURATION_LABELS[product.durationType] || product.durationType?.toLowerCase()}</span>
                                        </div>
                                        <div className="product-actions">
                                            {product.stock > 0 ? (
                                                <button className="btn btn-primary" onClick={() => navigate(`/product/${product.id}`)}>Rent Now</button>
                                            ) : (
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                                                    onClick={() => alert('Sorry, this product is currently out of stock.')}
                                                >
                                                    Rent Now
                                                </button>
                                            )}
                                            <button className="btn btn-secondary" onClick={() => navigate(`/product/${product.id}`)}>Details</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {!loading && filteredProducts.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            {loadError ? (
                                <>
                                    <p style={{ marginBottom: '1rem' }}>Could not load products.</p>
                                    <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Ensure the backend is running (e.g. <code style={{ background: 'var(--surface-light)', padding: '0.2rem 0.5rem', borderRadius: 4 }}>npm run dev</code> in backend) and the database has been migrated and seeded.</p>
                                    <button type="button" className="btn btn-primary" style={{ maxWidth: 200 }} onClick={fetchProducts}>Try again</button>
                                </>
                            ) : (
                                <>
                                    <p>No products match your filters.</p>
                                    {(filters.brand || filters.color || filters.durationType || filters.minPrice !== '' || filters.maxPrice !== '') && (
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            style={{ marginTop: '1rem', maxWidth: 200 }}
                                            onClick={() => setFilters({ brand: '', color: '', durationType: '', minPrice: '', maxPrice: '' })}
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
