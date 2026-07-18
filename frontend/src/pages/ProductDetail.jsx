import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import RentalPeriodSelector from '../components/RentalPeriodSelector';
import AvailabilityChecker from '../components/AvailabilityChecker';
import api from '../api/client';
import './ProductDetail.css';

const DURATION_LABELS = { HOUR: 'Hour', DAY: 'Day', WEEK: 'Week', MONTH: 'Month', YEAR: 'Year' };

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { addToCart, getCartCount } = useCart();
    const { wishlist, toggleWishlist, isInWishlist } = useWishlist();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Default dates (optional: set tomorrow as start)
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const selectedVariants = {};
    const variantGroups = product?.variants?.reduce((acc, v) => {
        if (!acc[v.optionName]) acc[v.optionName] = [];
        if (!acc[v.optionName].includes(v.optionValue)) acc[v.optionName].push(v.optionValue);
        return acc;
    }, {}) || {};
    Object.keys(variantGroups || {}).forEach((optName) => {
        selectedVariants[optName] = selectedVariants[optName] || (variantGroups[optName] && variantGroups[optName][0]);
    });

    const [selectedVariantState, setSelectedVariantState] = useState(selectedVariants);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            setError('Invalid product');
            return;
        }
        setLoading(true);
        setError(null);
        api.get(`/products/${id}`)
            .then((res) => {
                if (res.data?.success && res.data?.data) {
                    setProduct(res.data.data);
                    const groups = (res.data.data.variants || []).reduce((acc, v) => {
                        if (!acc[v.optionName]) acc[v.optionName] = [];
                        if (!acc[v.optionName].includes(v.optionValue)) acc[v.optionName].push(v.optionValue);
                        return acc;
                    }, {});
                    const initial = {};
                    Object.keys(groups).forEach((name) => { initial[name] = groups[name][0]; });
                    setSelectedVariantState(initial);
                } else {
                    setError('Product not found');
                }
            })
            .catch(() => {
                setError('Product not found');
            })
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (product?.variants?.length) {
            const groups = (product.variants || []).reduce((acc, v) => {
                if (!acc[v.optionName]) acc[v.optionName] = [];
                if (!acc[v.optionName].includes(v.optionValue)) acc[v.optionName].push(v.optionValue);
                return acc;
            }, {});
            setSelectedVariantState((prev) => {
                const next = { ...prev };
                Object.keys(groups || {}).forEach((name) => {
                    if (!groups[name].includes(next[name])) next[name] = groups[name][0];
                });
                return next;
            });
        }
    }, [product?.id]);

    const displayName = user?.name || 'User';
    const initials = displayName.split(/\s+/).map((n) => n[0]).join('').toUpperCase().slice(0, 2);

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };
    const toggleUserDropdown = () => setIsDropdownOpen(!isDropdownOpen);
    const incrementQty = () => setQuantity((prev) => Math.min(product?.stock ?? prev, prev + 1));
    const decrementQty = () => setQuantity((prev) => Math.max(1, prev - 1));

    const hasVariants = product?.variants?.length > 0;
    const variantGroupsForModal = product?.variants?.reduce((acc, v) => {
        if (!acc[v.optionName]) acc[v.optionName] = [];
        if (!acc[v.optionName].includes(v.optionValue)) acc[v.optionName].push(v.optionValue);
        return acc;
    }, {}) || {};

    const handleAddToCart = async () => {
        if (!product) return;
        if (product.stock < 1) return;
        if (hasVariants && !showModal) {
            setShowModal(true);
            return;
        }
        setAddLoading(true);
        const result = await addToCart(product.id, quantity, hasVariants ? selectedVariantState : {}, startDate, endDate);
        setAddLoading(false);
        if (result.success) {
            if (showModal) setShowModal(false);
            if (window.confirm('Item added to cart. Go to cart?')) navigate('/cart');
        } else {
            alert(result.message || 'Failed to add to cart');
        }
    };

    const confirmConfiguration = () => {
        handleAddToCart();
    };

    if (loading) {
        return (
            <div className="product-detail-page">
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading product...</div>
            </div>
        );
    }
    if (error || !product) {
        return (
            <div className="product-detail-page">
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <p>{error || 'Product not found'}</p>
                    <Link to="/dashboard">Back to products</Link>
                </div>
            </div>
        );
    }

    const priceLabel = `R${product.price} / per ${DURATION_LABELS[product.durationType] || product.durationType?.toLowerCase()}`;

    return (
        <div className="product-detail-page">
            <nav className="top-nav">
                <div className="nav-container">
                    <div className="logo-section"><div className="logo-box">🏠 RentFlow</div></div>
                    <div className="nav-links">
                        <Link to="/dashboard" className="nav-link">Products</Link>
                        <Link to="/terms" className="nav-link">Terms & Condition</Link>
                        <Link to="/about" className="nav-link">About us</Link>
                        <Link to="/contact" className="nav-link">Contact Us</Link>
                    </div>
                    <div className="search-container">
                        <input type="text" className="search-input" placeholder="Search for products..." />
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
                <Link to="/dashboard">All Product</Link> / <span>{product.name}</span>
            </div>
            <div className="page-header"><h1>Product Page</h1></div>

            <div className="main-content">
                <div className="product-gallery">
                    <div className="main-image">
                        <img src={product.imageUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='450'%3E%3Crect fill='%23252b4a' width='600' height='450'/%3E%3Ctext x='50%25' y='50%25' font-size='80' fill='%239ca3af' text-anchor='middle' dy='.3em'%3E📦%3C/text%3E%3C/svg%3E"} alt={product.name} />
                    </div>
                </div>
                <div className="product-info">
                    <div>
                        <h1 className="product-title">{product.name}</h1>
                        <div className="product-price">{priceLabel}</div>
                        <p className="price-subtitle">Price per {DURATION_LABELS[product.durationType]?.toLowerCase() || product.durationType?.toLowerCase()}</p>
                        {product.description && <p className="price-subtitle" style={{ marginTop: '0.5rem' }}>{product.description}</p>}
                    </div>
                    <div className="rental-period">
                        <RentalPeriodSelector
                            initialStart={startDate}
                            initialEnd={endDate}
                            onPeriodChange={({ startDate: newStart, endDate: newEnd }) => {
                                setStartDate(newStart);
                                setEndDate(newEnd);
                            }}
                        />

                        <AvailabilityChecker
                            productId={product.id}
                            quantity={quantity}
                            startDate={startDate}
                            endDate={endDate}
                        />

                        <label className="period-label">Quantity</label>
                        <div className="action-buttons">
                            <div className="quantity-control">
                                <button className="qty-btn" type="button" onClick={decrementQty}>-</button>
                                <span className="qty-value">{quantity}</span>
                                <button className="qty-btn" type="button" onClick={incrementQty}>+</button>
                            </div>
                            <button className="btn btn-add-cart" onClick={handleAddToCart} disabled={product.stock < 1 || addLoading}>
                                {addLoading ? 'Adding...' : '🛒 Add to cart'}
                            </button>
                            <button
                                className="btn-icon"
                                onClick={() => toggleWishlist(product.id)}
                                style={{ background: isInWishlist(product.id) ? 'rgba(255, 0, 0, 0.1)' : '' }}
                            >
                                {isInWishlist(product.id) ? '❤️' : '🤍'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Configure</h2>
                            <button className="close-btn" type="button" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Choose options for this product.</p>
                            {Object.entries(variantGroupsForModal).map(([optionName, values]) => (
                                <div key={optionName} className="variant-group">
                                    <div className="variant-display">
                                        <div className="variant-options">
                                            {values.map((val) => (
                                                <div key={val} className="option-item" onClick={() => setSelectedVariantState((prev) => ({ ...prev, [optionName]: val }))}>
                                                    <div className={`option-radio ${selectedVariantState[optionName] === val ? 'checked' : ''}`} />
                                                    <span>{optionName}: {val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-configure" type="button" onClick={confirmConfiguration} disabled={addLoading}>{addLoading ? 'Adding...' : 'Add to cart'}</button>
                            <button className="btn-cancel" type="button" onClick={() => setShowModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
