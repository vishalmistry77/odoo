import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import './VendorNewOrder.css';

const VendorNewOrder = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Quotation');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Data State
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State - aligned with Mockup
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [invoiceAddress, setInvoiceAddress] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState('');

    // Financial State
    const [discount, setDiscount] = useState(0);
    const [shippingCost, setShippingCost] = useState(0);
    const [couponCode, setCouponCode] = useState('');
    const [showDiscountInput, setShowDiscountInput] = useState(false);
    const [showShippingInput, setShowShippingInput] = useState(false);
    const [showCouponInput, setShowCouponInput] = useState(false);

    // Tax Rate (18% Hardcoded for now, could be dynamic later)
    const taxRate = 0.18;

    // Order Lines State
    const [orderItems, setOrderItems] = useState([
        { id: Date.now(), productId: '', quantity: 1, price: 0, unit: 'Units' }
    ]);

    // Order Response State
    const [createdOrderId, setCreatedOrderId] = useState(null);
    const [orderNumber, setOrderNumber] = useState('New');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [custRes, prodRes] = await Promise.all([
                    api.get('/users/customers'),
                    api.get('/products')
                ]);

                if (custRes.data.success) setCustomers(custRes.data.data);
                if (prodRes.data.success) setProducts(prodRes.data.data);
            } catch (error) {
                console.error("Failed to fetch initial data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    const handleCustomerChange = (e) => {
        const custId = e.target.value;
        setSelectedCustomer(custId);
        const cust = customers.find(c => c.id === custId);
        if (cust) {
            setInvoiceAddress(cust.address || '');
            setDeliveryAddress(cust.address || '');
        }
    };

    const handleAddItem = () => {
        setOrderItems([...orderItems, { id: Date.now(), productId: '', quantity: 1, price: 0, unit: 'Units' }]);
    };

    const handleRemoveItem = (id) => {
        setOrderItems(orderItems.filter(item => item.id !== id));
    };

    const handleItemChange = (id, field, value) => {
        setOrderItems(orderItems.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };

                if (field === 'productId') {
                    const prod = products.find(p => p.id === value);
                    if (prod) {
                        updatedItem.price = parseFloat(prod.price);
                    }
                }
                return updatedItem;
            }
            return item;
        }));
    };

    // --- Calculations ---
    const calculateSubtotal = () => {
        return orderItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0);
    };

    const subtotal = calculateSubtotal();
    const taxes = subtotal * taxRate;
    const totalAmount = subtotal + taxes - Number(discount) + Number(shippingCost);

    // --- Actions ---

    const handleSaveOrder = async (confirm = false) => {
        if (!selectedCustomer) {
            alert("Please select a customer.");
            return;
        }

        if (orderItems.some(item => !item.productId)) {
            alert("Please select products for all lines.");
            return;
        }

        try {
            const payload = {
                customerId: selectedCustomer,
                items: orderItems,
                untaxedAmount: subtotal,
                taxAmount: taxes,
                discountAmount: Number(discount),
                shippingCost: Number(shippingCost),
                total: totalAmount,
                note: note,
                startDate,
                endDate
            };

            const res = await api.post('/orders', payload);

            if (res.data.success) {
                const newOrder = res.data.data;
                setCreatedOrderId(newOrder.id);
                setOrderNumber(newOrder.orderNumber);
                alert(`Order ${newOrder.orderNumber} created successfully!`);

                if (confirm) {
                    await handleConfirmOrder(newOrder.id);
                } else {
                    setStatus('Quotation Sent');
                }
            }
        } catch (error) {
            console.error("Create Order Error", error);
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message;
            alert("Failed to create order: " + errMsg);
        }
    };

    const handleConfirmOrder = async (orderId) => {
        try {
            const res = await api.post(`/orders/${orderId}/confirm`);
            if (res.data.success) {
                setStatus('Sale Order');
                alert("Order Confirmed!");
            }
        } catch (error) {
            console.error("Confirm Error", error);
            alert("Failed to confirm order.");
        }
    };

    const handleCreateInvoice = async () => {
        if (!createdOrderId) {
            alert("Please save/confirm the order first.");
            return;
        }
        try {
            const res = await api.post(`/invoice/create/${createdOrderId}`);
            if (res.data.success) {
                navigate(`/vendor/invoice/${res.data.data.id}`);
            }
        } catch (error) {
            console.error("Create Invoice Error", error);
            if (error.response?.data?.invoiceId) {
                navigate(`/vendor/invoice/${error.response.data.invoiceId}`);
            } else {
                alert("Failed to create invoice.");
            }
        }
    };

    const handleApplyCoupon = (e) => {
        e.preventDefault();
        // Mock Coupon Logic
        if (couponCode === 'WELCOME10') {
            setDiscount(subtotal * 0.10); // 10% off
            alert("Coupon Applied: 10% Discount");
        } else {
            alert("Invalid Coupon Code");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSend = async () => {
        if (!createdOrderId) {
            alert("Please save the order as a draft first (Save to Register).");
            return;
        }
        try {
            const res = await api.post(`/orders/${createdOrderId}/send`);
            if (res.data.success) {
                setStatus('Quotation Sent');
                alert("Quotation sent successfully!");
            }
        } catch (error) {
            console.error("Send Error", error);
            alert("Failed to send quotation.");
        }
    };


    return (
        <div className="vendor-new-order-page">
            {/* Top Navigation (Existing) */}
            {/* Top Navigation (Standardized) */}
            <nav className="top-nav">
                <div className="nav-container">
                    <div className="nav-left">
                        <Link to="/dashboard" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <h1>RentFlow</h1>
                        </Link>
                        <div className="nav-tabs">
                            <Link to="/dashboard" className="nav-tab" style={{ textDecoration: 'none' }}>Dashboard</Link>
                            <Link to="/vendor/orders" className="nav-tab" style={{ textDecoration: 'none' }}>Orders</Link>
                            <Link to="/vendor/products" className="nav-tab" style={{ textDecoration: 'none' }}>Products</Link>
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

            {/* Main Content Area */}
            <div className="page-content-wrapper">

                {/* Main Form Card */}
                <main className="order-form-card">
                    <div className="order-header-row">
                        <span className="badge-purple">New</span>
                        <h2 className="form-title">Rental order</h2>
                        <div className="toggle-icons no-print">
                            {/* Functional Actions */}
                            <div className="icon-box icon-check" onClick={() => handleSaveOrder(false)} title="Save Order">✓</div>
                            <div className="icon-box icon-close" onClick={() => navigate('/vendor/orders')} title="Discard">×</div>
                        </div>
                    </div>

                    {/* Header Actions & Pipeline */}
                    <div className="control-panel">
                        <div className="action-bar">
                            <button className="btn-action-primary" onClick={handleSend}>Send</button>
                            <button className="btn-action-secondary" onClick={() => createdOrderId && handleConfirmOrder(createdOrderId)}>Confirm</button>
                            <button className="btn-action-secondary" onClick={handlePrint}>Print</button>

                            {(status === 'Sale Order') && (
                                <button className="btn-action-accent" onClick={handleCreateInvoice}>Create Invoice</button>
                            )}
                            {/* Mock "Genuine Caribou" Badge/Tag relative to user */}
                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                                {selectedCustomer && <span className="tag-purple-pill">Genuine Caribou</span>}
                            </div>
                        </div>

                        <div className="pipeline-status">
                            <div className={`pipeline-step ${status === 'Quotation' ? 'active' : ''}`}>Quotation</div>
                            <div className={`pipeline-step ${status === 'Quotation Sent' ? 'active' : ''}`}>Quotation Sent</div>
                            <div className={`pipeline-step ${status === 'Sale Order' ? 'active' : ''}`}>Sale Order</div>
                        </div>
                    </div>

                    <h1 className="order-number-display">{orderNumber}</h1>

                    <div className="form-grid-layout">
                        {/* Left Column */}
                        <div className="form-col">
                            <div className="form-field-row">
                                <label>Customer</label>
                                <select className="input-standard" value={selectedCustomer} onChange={handleCustomerChange}>
                                    <option value="">Select customer...</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-field-row">
                                <label>Invoice Address</label>
                                <input type="text" className="input-standard" value={invoiceAddress} onChange={e => setInvoiceAddress(e.target.value)} />
                            </div>
                            <div className="form-field-row">
                                <label>Delivery Address</label>
                                <input type="text" className="input-standard" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="form-col">
                            <div className="form-field-row">
                                <label>Rental Period</label>
                                <div className="date-range-group">
                                    <input type="date" className="input-standard" value={startDate} onChange={e => setStartDate(e.target.value)} placeholder="Start date" />
                                    <span className="arrow">→</span>
                                    <input type="date" className="input-standard" value={endDate} onChange={e => setEndDate(e.target.value)} placeholder="End date" />
                                </div>
                            </div>
                            <div className="form-field-row">
                                <label>Order date</label>
                                <input type="date" className="input-standard" value={orderDate} onChange={e => setOrderDate(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Order Lines Tab */}
                    <div className="tabs-bar">
                        <button className="tab-link active">Order Line</button>
                        <button className="tab-link">Optional Products</button>
                        <button className="tab-link">Other Info</button>
                    </div>

                    {/* Table */}
                    <div className="order-table-wrapper">
                        <table className="order-lines-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40%' }}>Product</th>
                                    <th>Quantity</th>
                                    <th>Unit</th>
                                    <th>Unit Price</th>
                                    <th>Taxes</th>
                                    <th>Amount</th>
                                    <th className="no-print"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderItems.map(item => (
                                    <tr key={item.id}>
                                        <td>
                                            <select className="input-table" value={item.productId} onChange={e => handleItemChange(item.id, 'productId', e.target.value)}>
                                                <option value="">Select Product...</option>
                                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                            {item.productId && startDate && endDate && (
                                                <div className="row-subtext">[ {startDate} -&gt; {endDate} ]</div>
                                            )}
                                        </td>
                                        <td><input type="number" className="input-table" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.value)} /></td>
                                        <td>Units</td>
                                        <td>Rs {item.price}</td>
                                        <td>18%</td>
                                        <td>Rs {(item.quantity * item.price).toFixed(2)}</td>
                                        <td className="no-print">
                                            <button className="btn-icon-trash" onClick={() => handleRemoveItem(item.id)}>×</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bottom-actions-row no-print">
                        <button className="link-action-blue" onClick={handleAddItem}>Add a Product</button>
                        <button className="link-action-blue" onClick={() => {
                            const newNote = prompt("Add a note:");
                            if (newNote) setNote(note ? note + "\n" + newNote : newNote);
                        }}>Add a note</button>
                    </div>

                    {note && (
                        <div className="sc-note-box">
                            <strong>Note:</strong> {note}
                        </div>
                    )}

                    {/* Footer Totals */}
                    <div className="footer-layout">
                        <div className="footer-left">
                            <Link to="/terms" target="_blank" className="link-blue">Terms & Conditions</Link>
                        </div>

                        <div className="footer-right">
                            <div className="financial-actions">
                                {!showCouponInput && <button className="btn-small-outline" onClick={() => setShowCouponInput(true)}>Coupon Code</button>}
                                {showCouponInput && (
                                    <div className="coupon-input-group">
                                        <input type="text" placeholder="Code" value={couponCode} onChange={e => setCouponCode(e.target.value)} className="input-small" />
                                        <button className="btn-small-go" onClick={handleApplyCoupon}>Apply</button>
                                    </div>
                                )}
                                <button className="btn-small-outline" onClick={() => setShowDiscountInput(!showDiscountInput)}>
                                    {showDiscountInput ? 'Remove Discount' : 'Discount'}
                                </button>
                                <button className="btn-small-outline" onClick={() => setShowShippingInput(!showShippingInput)}>
                                    {showShippingInput ? 'Remove Shipping' : 'Add Shipping'}
                                </button>
                            </div>

                            <div className="totals-display">
                                <div className="total-row">
                                    <span>Untaxed Amount:</span>
                                    <span>Rs {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="total-row">
                                    <span>Taxes (18%):</span>
                                    <span>Rs {taxes.toFixed(2)}</span>
                                </div>

                                {(discount > 0 || showDiscountInput) && (
                                    <div className="total-row">
                                        <span>Discount:</span>
                                        {!showDiscountInput ? (
                                            <span>- Rs {Number(discount).toFixed(2)}</span>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span>- </span>
                                                <input type="number" className="input-mini-right" value={discount} onChange={e => setDiscount(e.target.value)} />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {(shippingCost > 0 || showShippingInput) && (
                                    <div className="total-row">
                                        <span>Shipping:</span>
                                        {showShippingInput ? (
                                            <input type="number" className="input-mini-right" value={shippingCost} onChange={e => setShippingCost(e.target.value)} />
                                        ) : (
                                            <span>Rs {Number(shippingCost).toFixed(2)}</span>
                                        )}
                                    </div>
                                )}

                                <div className="total-row grand-total-line">
                                    <span>Total:</span>
                                    <span>Rs {totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="save-register-btn-area no-print">
                                {!createdOrderId && <button className="btn-primary-large" onClick={() => handleSaveOrder(false)}>Save to Register</button>}
                            </div>
                        </div>
                    </div>

                </main >
            </div >
        </div >
    );
};

export default VendorNewOrder;
