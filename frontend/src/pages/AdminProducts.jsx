import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import './AdminStyles.css';

const AdminProducts = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/');
            return;
        }
        fetchProducts();
    }, [user, navigate]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/products');
            if (response.data.success) {
                setProducts(response.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch products:', err);
            setError(err.response?.data?.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Get unique categories
    const categories = ['ALL', ...new Set(products.map(p => p.category))];

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchesCategory = filterCategory === 'ALL' || product.category === filterCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brand.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Category counts
    const categoryCounts = {};
    categories.forEach(cat => {
        if (cat === 'ALL') {
            categoryCounts[cat] = products.length;
        } else {
            categoryCounts[cat] = products.filter(p => p.category === cat).length;
        }
    });

    return (
        <div className="admin-dashboard-page">
            <nav className="top-nav">
                <div className="nav-container">
                    <div className="nav-left">
                        <Link to="/admin/dashboard" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <h1>RentFlow <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>ADMIN</span></h1>
                        </Link>
                        <div className="nav-tabs">
                            <Link to="/admin/dashboard" className="nav-tab">Dashboard</Link>
                            <Link to="/admin/users" className="nav-tab">Users</Link>
                            <Link to="/admin/products" className="nav-tab active">Products</Link>
                            <Link to="/admin/orders" className="nav-tab">Orders</Link>
                            <Link to="/admin/reports" className="nav-tab">Reports</Link>
                            <Link to="/admin/settings" className="nav-tab">Settings</Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="admin-main" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ margin: 0 }}>All Products</h2>
                        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>
                            Manage all vendor products in the system
                        </p>
                    </div>
                    <button
                        onClick={fetchProducts}
                        className="btn-secondary"
                        style={{ padding: '0.75rem 1.5rem' }}
                    >
                        {loading ? 'Refreshing...' : '🔄 Refresh'}
                    </button>
                </div>

                {/* Search Bar */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <input
                        type="text"
                        placeholder="🔍 Search products by name or brand..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            maxWidth: '500px',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--card-bg)',
                            color: 'var(--text)',
                            fontSize: '0.875rem'
                        }}
                    />
                </div>

                {/* Category Filter Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    marginBottom: '2rem',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '0.5rem',
                    flexWrap: 'wrap',
                    overflowX: 'auto'
                }}>
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setFilterCategory(category)}
                            style={{
                                background: filterCategory === category ? 'var(--primary-color)' : 'transparent',
                                color: filterCategory === category ? 'white' : 'var(--text)',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {category} ({categoryCounts[category] || 0})
                        </button>
                    ))}
                </div>

                {/* Loading State */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        Loading products...
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid #ef4444',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '2rem',
                        color: '#ef4444'
                    }}>
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {/* Products Table */}
                {!loading && !error && (
                    <>
                        {filteredProducts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                <p>No products found{filterCategory !== 'ALL' ? ` in category ${filterCategory}` : ''}{searchTerm ? ` matching "${searchTerm}"` : ''}.</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    background: 'var(--card-bg)',
                                    borderRadius: '8px',
                                    overflow: 'hidden'
                                }}>
                                    <thead>
                                        <tr style={{ background: 'var(--surface-light)', borderBottom: '2px solid var(--border-color)' }}>
                                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Product</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Category</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Brand</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Price/Day</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Stock</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Vendor</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.map(product => (
                                            <tr
                                                key={product.id}
                                                style={{
                                                    borderBottom: '1px solid var(--border-color)',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-light)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <td style={{ padding: '1rem' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                                            {product.name}
                                                        </div>
                                                        {product.description && (
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                                {product.description.substring(0, 50)}{product.description.length > 50 ? '...' : ''}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                                    <span style={{
                                                        background: 'var(--surface-light)',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 500
                                                    }}>
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 500 }}>
                                                    {product.brand}
                                                </td>
                                                <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--primary-color)' }}>
                                                    {formatCurrency(product.price)}
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        color: product.stock > 5 ? '#10b981' : product.stock > 0 ? '#f59e0b' : '#ef4444',
                                                        fontWeight: 600,
                                                        fontSize: '0.875rem'
                                                    }}>
                                                        {product.stock} units
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 500 }}>{product.vendor?.name || 'Unknown'}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            {product.vendor?.email || ''}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        background: product.isPublished ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                        color: product.isPublished ? '#10b981' : '#ef4444',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600
                                                    }}>
                                                        {product.isPublished ? 'Published' : 'Draft'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Summary Stats */}
                        {filteredProducts.length > 0 && (
                            <div style={{
                                marginTop: '2rem',
                                padding: '1rem',
                                background: 'var(--surface-light)',
                                borderRadius: '8px',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1rem'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                        Total Products
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                        {filteredProducts.length}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                        Total Stock
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                        {filteredProducts.reduce((sum, p) => sum + p.stock, 0)} units
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                        Avg Price/Day
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                        {formatCurrency(filteredProducts.reduce((sum, p) => sum + Number(p.price), 0) / filteredProducts.length)}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                        Categories
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                        {new Set(filteredProducts.map(p => p.category)).size}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminProducts;
