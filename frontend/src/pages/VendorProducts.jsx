import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import './VendorProducts.css';

const VendorProducts = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, [user?.id]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            // Fetch products filtered by current vendor
            const res = await api.get(`/products?vendorId=${user?.id}`);
            if (res.data.success) {
                // Determine if product displayed is published based on 'isPublished' field
                // If the API doesn't return IsPublished, we might need to update backend or mock it
                setProducts(res.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    const handleProductClick = (productId) => {
        navigate(`/vendor/products/${productId}`);
    };

    const handleDeleteProduct = async (e, productId) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            const res = await api.delete(`/products/${productId}`);
            if (res.data.success) {
                setProducts(prev => prev.filter(p => p.id !== productId));
            }
        } catch (error) {
            console.error("Delete error", error);
            alert(error.response?.data?.message || "Failed to delete");
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="vendor-products-page">
            {/* Top Navigation */}
            <nav className="top-nav">
                <div className="nav-container">
                    <div className="nav-left">
                        <Link to="/dashboard" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <h1>RentFlow</h1>
                        </Link>
                        <div className="nav-tabs">
                            <Link to="/dashboard" className="nav-tab" style={{ textDecoration: 'none' }}>Dashboard</Link>
                            <Link to="/vendor/orders" className="nav-tab" style={{ textDecoration: 'none' }}>Orders</Link>
                            <Link to="/vendor/products" className="nav-tab active" style={{ textDecoration: 'none' }}>Products</Link>
                            <Link to="/vendor/reports" className="nav-tab" style={{ textDecoration: 'none' }}>Reports</Link>
                            <Link to="/vendor/settings" className="nav-tab" style={{ textDecoration: 'none' }}>Settings</Link>
                        </div>
                    </div>

                    <div className="nav-right">
                        <div className="user-menu" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                            <div className="user-avatar">{user?.name ? user.name.substring(0, 2).toUpperCase() : 'VR'}</div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name || 'TechRentals'}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vendor</div>
                            </div>
                            {isDropdownOpen && (
                                <div className="user-dropdown-menu">
                                    <Link to="/vendor/settings" className="dropdown-item">
                                        <span>⚙️</span> Settings
                                    </Link>
                                    <button onClick={handleLogout} className="dropdown-item">
                                        <span>🚪</span> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="vendor-products-main">
                {/* Toolbar */}
                <div className="products-toolbar">
                    <div className="toolbar-left">
                        <h2 className="toolbar-title">Products</h2>
                        <button className="btn-new-product" onClick={() => navigate('/vendor/products/new')}>
                            + New
                        </button>
                        <div className="search-bar">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="toolbar-right">
                        <button
                            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Kanban View"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                        </button>
                        <button
                            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title="List View"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="8" y1="6" x2="21" y2="6"></line>
                                <line x1="8" y1="12" x2="21" y2="12"></line>
                                <line x1="8" y1="18" x2="21" y2="18"></line>
                                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                <line x1="3" y1="18" x2="3.01" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Loading products...</div>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="kanban-grid">
                                {filteredProducts.map(product => (
                                    <div key={product.id} className="kanban-card" onClick={() => handleProductClick(product.id)}>
                                        <div className={`card-image ${!product.isPublished ? 'unpublished' : ''}`}>
                                            {product.imageUrl ? (
                                                <img src={product.imageUrl} alt={product.name} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#374151', color: '#9ca3af' }}>No Image</div>
                                            )}
                                            {!product.isPublished && (
                                                <span className="unpublished-badge">Unpublished</span>
                                            )}
                                        </div>
                                        <div className="card-content">
                                            <div className="card-title">{product.name}</div>
                                            <div className="card-price">${product.price} <span style={{ fontSize: '0.8em', fontWeight: 'normal', color: '#94a3b8' }}>/ {product.durationType ? (product.durationType === 'DAY' ? 'Day' : product.durationType === 'HOUR' ? 'Hour' : product.durationType === 'WEEK' ? 'Week' : product.durationType === 'MONTH' ? 'Month' : product.durationType) : 'Unit'}</span></div>
                                            <div className="card-footer">
                                                <span>{product.quantityOnHand || 0} Units</span>
                                                <span>{user?.name || 'Vendor'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {/* Mock items if list is empty for visualization */}
                                {filteredProducts.length === 0 && !searchTerm && (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                        No products found. Click "New" to create one.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <table className="list-view-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '60px' }}></th>
                                        <th>Product Name</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map(product => (
                                        <tr key={product.id} onClick={() => handleProductClick(product.id)} style={{ cursor: 'pointer' }}>
                                            <td>
                                                <img src={product.imageUrl || 'https://via.placeholder.com/48'} className="list-thumb" alt="" />
                                            </td>
                                            <td>{product.name}</td>
                                            <td>{product.category || 'Generic'}</td>
                                            <td>Rs {product.price}</td>
                                            <td>{product.quantityOnHand} units</td>
                                            <td>
                                                <span className={`status-badge ${product.isPublished ? 'status-published' : 'status-draft'}`}>
                                                    {product.isPublished ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="icon-btn edit-btn"
                                                        onClick={(e) => { e.stopPropagation(); handleProductClick(product.id); }}
                                                        title="Edit"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className="icon-btn delete-btn"
                                                        onClick={(e) => handleDeleteProduct(e, product.id)}
                                                        title="Delete"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredProducts.length === 0 && !searchTerm && (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                                No products found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default VendorProducts;
