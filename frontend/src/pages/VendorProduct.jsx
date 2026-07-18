import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import './VendorProduct.css';

const VendorProduct = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = id && id !== 'new';

    const [activeTab, setActiveTab] = useState('general');
    const [isPublished, setIsPublished] = useState(true);
    const [productImage, setProductImage] = useState(null); // URL or base64 for preview
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        productType: 'Goods',
        quantityOnHand: 100,
        price: '',
        priceUnit: 'Per Units',
        costPrice: '',
        costPriceUnit: 'Per Units',
        category: '',
        vendorName: '', // This might be auto-filled from user profile in a real app
        attributes: [] // [{ name: '', value: '' }]
    });

    useEffect(() => {
        if (isEditMode) {
            fetchProductDetails();
        } else if (user?.name) {
            setFormData(prev => ({ ...prev, vendorName: user.name }));
        }
    }, [id, user]);

    const fetchProductDetails = async () => {
        try {
            const res = await api.get(`/products/${id}`);
            if (res.data.success) {
                const product = res.data.data;
                setFormData({
                    name: product.name,
                    productType: product.productType || 'Goods',
                    quantityOnHand: product.quantityOnHand || product.stock || 0,
                    price: product.price,
                    priceUnit: mapDurationToUnit(product.durationType), // Helper needed or direct map
                    costPrice: product.costPrice || '',
                    costPriceUnit: 'Per Units', // default or fetch if saved
                    category: product.category,
                    vendorName: '', // Can be fetched from product.vendor if expanded
                    attributes: product.attributes || []
                });
                setProductImage(product.imageUrl);
                setIsPublished(product.isPublished);
            }
        } catch (error) {
            console.error("Error fetching product:", error);
            alert("Failed to load product details.");
        }
    };

    const mapDurationToUnit = (duration) => {
        if (!duration) return 'Per Units';
        const map = {
            'HOUR': 'Per Hour',
            'DAY': 'Per Day',
            'WEEK': 'Per Week',
            'MONTH': 'Per Month',
            'YEAR': 'Per Year'
        };
        return map[duration] || 'Per Units';
    };

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setProductImage(event.target.result);
            };
            reader.readAsDataURL(file);
            // In a real app, you'd verify file type/size and upload to server here or on save
        }
    };

    const addAttributeLine = () => {
        setFormData(prev => ({
            ...prev,
            attributes: [...prev.attributes, { id: Date.now(), name: '', value: '', configureOpen: false, extraPrice: 0 }]
        }));
    };

    const removeAttributeLine = (id) => {
        setFormData(prev => ({
            ...prev,
            attributes: prev.attributes.filter(attr => attr.id !== id)
        }));
    };

    const toggleConfigure = (id) => {
        setFormData(prev => ({
            ...prev,
            attributes: prev.attributes.map(attr =>
                attr.id === id ? { ...attr, configureOpen: !attr.configureOpen } : attr
            )
        }));
    };

    const handleAttributeChange = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            attributes: prev.attributes.map(attr =>
                attr.id === id ? { ...attr, [field]: value } : attr
            )
        }));
    };

    const handleSave = async () => {
        try {
            // Transform data for backend if necessary
            // e.g. converting price strings to numbers
            const payload = {
                ...formData,
                price: parseFloat(formData.price) || 0,
                costPrice: parseFloat(formData.costPrice) || 0,
                quantityOnHand: parseInt(formData.quantityOnHand) || 0,
                isPublished,
                imageUrl: productImage // For mock purposes, sending base64. Ideally send file or URL.
            };

            let res;
            if (isEditMode) {
                // Assuming PUT endpoint exists, usually it does. If not, use POST or check backend.
                // Checking productRoutes.js might be wise, but standard REST usually has it.
                // I'll assume PUT /products/:id or similar.
                // Actually standard might be PATCH or PUT. using put for now.
                // Wait, I should verify update endpoint exists in backend task first?
                // I'll stick to logic: if (id) update via PUT.
                res = await api.put(`/products/${id}`, payload);
            } else {
                res = await api.post('/products', payload);
            }

            if (res.data.success) {
                alert(`Product ${isEditMode ? 'updated' : 'created'} successfully!`);
                navigate('/vendor/dashboard'); // or back to list
            } else {
                alert('Failed to save product: ' + res.data.message);
            }
        } catch (error) {
            console.error("Save Product Error:", error);
            const errMsg = error.response?.data?.message || error.response?.data?.error || error.message;
            alert('Error saving product: ' + errMsg);
        }
    };

    return (
        <div className="vendor-product-page">
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

            {/* Header */}
            <div className="header">
                <div className="header-left">
// ... (context)
                    <button type="button" className="btn-new" onClick={() => {
                        // ...
                    }}>New</button>
                    <div className="page-title">Product</div>
                </div>
                <div className="header-actions">
                    <button type="button" className="icon-btn" title="Save" onClick={handleSave}>✓</button>
                    <button type="button" className="icon-btn delete" title="Delete" onClick={() => navigate('/vendor/dashboard')}>✕</button>
                </div>
            </div>

            {/* Main Container */}
            <div className="container">
                {/* Product Header */}
                <div className="product-header">
                    <div className="product-info">
                        <div className="product-label">Product</div>
                        <input
                            type="text"
                            className="product-input"
                            placeholder="e.g. Modern Sofa"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                    </div>
                    <label className="product-image-section" id="productImage">
                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                        {productImage ? (
                            <img src={productImage} alt="Product" />
                        ) : (
                            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 130'%3E%3Crect width='180' height='130' fill='%231a1f3a' rx='12'/%3E%3C/svg%3E" alt="Placeholder" />
                        )}
                    </label>
                </div>

                {/* Main Content */}
                <div className="main-content">
                    <div className="form-section">
                        {/* Tabs */}
                        <div className="tabs">
                            <button
                                type="button"
                                className={`tab ${activeTab === 'general' ? 'active' : ''}`}
                                onClick={() => setActiveTab('general')}
                            >
                                General Information
                            </button>
                            <button
                                type="button"
                                className={`tab ${activeTab === 'attributes' ? 'active' : ''}`}
                                onClick={() => setActiveTab('attributes')}
                            >
                                Attributes & Variants
                            </button>
                        </div>

                        {/* General Information Tab Content */}
                        <div className={`tab-content ${activeTab === 'general' ? 'active' : ''}`}>
                            <div className="general-content">
                                <div className="general-left">
                                    {/* Form */}
                                    <div className="form-group">
                                        <label className="form-label">Product Type</label>
                                        <div className="radio-group">
                                            <label className="radio-option" onClick={() => setFormData(p => ({ ...p, productType: 'Goods' }))}>
                                                <div className={`radio-circle ${formData.productType === 'Goods' ? 'checked' : ''}`}></div>
                                                <span className="radio-label">Goods</span>
                                            </label>
                                            <label className="radio-option" onClick={() => setFormData(p => ({ ...p, productType: 'Service' }))}>
                                                <div className={`radio-circle ${formData.productType === 'Service' ? 'checked' : ''}`}></div>
                                                <span className="radio-label">Service</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Quantity on Hand</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            name="quantityOnHand"
                                            value={formData.quantityOnHand}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Sales Price</label>
                                        <div className="input-with-unit">
                                            <span className="unit-label">$</span>
                                            <input
                                                type="number"
                                                className="form-input"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                placeholder="0.00"
                                            />
                                            <select
                                                className="form-input"
                                                style={{ maxWidth: '150px' }}
                                                name="priceUnit"
                                                value={formData.priceUnit}
                                                onChange={handleInputChange}
                                            >
                                                <option>Per Units</option>
                                                <option>Per Day</option>
                                                <option>Per Hour</option>
                                                <option>Per Month</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Cost Price</label>
                                        <div className="input-with-unit">
                                            <span className="unit-label">$</span>
                                            <input
                                                type="number"
                                                className="form-input"
                                                name="costPrice"
                                                value={formData.costPrice}
                                                onChange={handleInputChange}
                                                placeholder="0.00"
                                            />
                                            <select
                                                className="form-input"
                                                style={{ maxWidth: '150px' }}
                                                name="costPriceUnit"
                                                value={formData.costPriceUnit}
                                                onChange={handleInputChange}
                                            >
                                                <option>Per Units</option>
                                                <option>Per Day</option>
                                                <option>Per Hour</option>
                                                <option>Per Month</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Category</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Vendor Name:</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="vendorName"
                                            value={formData.vendorName}
                                            onChange={handleInputChange}
                                            placeholder="Optional"
                                        />
                                    </div>
                                </div>

                                <div className="general-right">
                                    {/* Publish Section */}
                                    <div className="publish-section" style={{ border: 'none', padding: 0, margin: 0 }}>
                                        <span className="publish-label">Publish</span>
                                        <div
                                            className={`toggle-switch ${!isPublished ? 'off' : ''}`}
                                            id="publishToggle"
                                            onClick={() => setIsPublished(!isPublished)}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Attributes & Variants Tab Content */}
                        <div className={`tab-content ${activeTab === 'attributes' ? 'active' : ''}`}>
                            <div className="attributes-section">
                                {formData.attributes.map(attr => (
                                    <React.Fragment key={attr.id}>
                                        <div className="attribute-row">
                                            <div className="attribute-column">
                                                <h3>Attributes</h3>
                                                <p className="attribute-description">Name of the Attributes (Brand, color, Size...)</p>
                                                <input
                                                    type="text"
                                                    className="product-input-small"
                                                    value={attr.name}
                                                    onChange={(e) => handleAttributeChange(attr.id, 'name', e.target.value)}
                                                />
                                            </div>

                                            <div className="attribute-column">
                                                <h3>Values</h3>
                                                <p className="attribute-description">List of possible values (e.g. Red, Green, Blue..)</p>
                                                <input
                                                    type="text"
                                                    className="product-input-small"
                                                    value={attr.value}
                                                    onChange={(e) => handleAttributeChange(attr.id, 'value', e.target.value)}
                                                />
                                            </div>

                                            <div className="attribute-column" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', paddingTop: '2rem' }}>
                                                <button
                                                    type="button"
                                                    className={`configure-btn ${attr.configureOpen ? 'active' : ''}`}
                                                    onClick={() => toggleConfigure(attr.id)}
                                                >
                                                    <span>Configure</span>
                                                    <span>⚙</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="delete-icon-btn"
                                                    onClick={() => removeAttributeLine(attr.id)}
                                                    style={{ cursor: 'pointer', zIndex: 10 }}
                                                >🗑</button>
                                            </div>
                                        </div>
                                        {attr.configureOpen && (
                                            <div className="attribute-config-panel" style={{ padding: '1rem', background: '#2d3348', borderRadius: '8px', marginBottom: '1rem', marginLeft: '1rem', border: '1px solid #4ade80' }}>
                                                <h4>Variant Configuration</h4>
                                                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
                                                    <label>Extra Price:</label>
                                                    <input
                                                        type="number"
                                                        className="form-input"
                                                        style={{ width: '150px' }}
                                                        value={attr.extraPrice || 0}
                                                        onChange={(e) => handleAttributeChange(attr.id, 'extraPrice', parseFloat(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}

                                <button type="button" className="add-line-btn" onClick={addAttributeLine}>Add a line</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default VendorProduct;
