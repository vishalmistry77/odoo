import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import './VendorInvoice.css';

const VendorInvoice = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                // 'id' param from URL might be an InvoiceID or OrderID.
                // Our backend endpoint /invoice/:id handles this logic (as per controller plan).
                const res = await api.get(`/invoice/${id}`);
                if (res.data.success) {
                    setInvoice(res.data.data);
                }
            } catch (err) {
                console.error("Fetch Invoice Error", err);
                setError("Invoice not found or failed to load");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchInvoice();
    }, [id]);

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    const handleVoid = async () => {
        if (!window.confirm("Are you sure you want to void this invoice?")) return;
        try {
            const res = await api.patch(`/invoice/${invoice.id}/void`);
            if (res.data.success) {
                setInvoice(prev => ({ ...prev, status: 'VOID' }));
                alert("Invoice Voided.");
            }
        } catch (err) {
            alert("Failed to void invoice.");
        }
    };

    if (loading) return <div className="p-8 text-white">Loading Invoice...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;
    if (!invoice) return null;

    const order = invoice.order || {};
    const customer = order.user || {};
    const items = order.items || [];

    return (
        <div className="vendor-invoice-page">
            {/* RentFlow Top Navigation */}
            <nav className="top-nav">
                <div className="nav-container">
                    <div className="nav-left">
                        <Link to="/dashboard" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <h1>RentFlow</h1>
                        </Link>
                        <div className="nav-tabs">
                            <Link to="/dashboard" className="nav-tab" style={{ textDecoration: 'none' }}>Dashboard</Link>
                            <Link to="/vendor/orders" className="nav-tab active" style={{ textDecoration: 'none' }}>Orders</Link>
                            <button className="nav-tab">Products</button>
                            <button className="nav-tab">Reports</button>
                            <button className="nav-tab">Settings</button>
                        </div>
                    </div>

                    <div className="nav-right">
                        <div className="user-menu" onClick={handleLogout}>
                            <div className="user-avatar">{user?.name ? user.name.substring(0, 2).toUpperCase() : 'VR'}</div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name || 'TechRentals'}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Logout</div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Page Header Area */}
            <div className="invoice-header-box">
                <div className="invoice-header-top">
                    <div className="header-left-flex">
                        <div className="page-title-italic">Invoice Page</div>
                        <div className="order-badges">
                            <div className="badge-item badge-gradient">{order.orderNumber}</div>
                            <div className="toggle-indicators">
                                <div className="toggle-box green">✓</div>
                                <div className="toggle-box red">✕</div>
                            </div>
                        </div>
                    </div>
                    <div className="header-actions-flex">
                        <button className="btn-gradient">Send</button>
                        <button className="btn-outline-header">Print</button>
                        {invoice.status !== 'VOID' && invoice.status !== 'PAID' && (
                            <button className="btn-outline-header" style={{ borderColor: 'red', color: 'red' }} onClick={handleVoid}>Void</button>
                        )}
                    </div>
                </div>

                <div className="invoice-status-pill">
                    <div className={`status-label ${invoice.status === 'UNPAID' ? 'active' : ''}`}>Unpaid</div>
                    <div className={`status-label ${invoice.status === 'PAID' ? 'active' : ''}`}>Paid</div>
                    {invoice.status === 'VOID' && <div className="status-label active" style={{ background: 'red' }}>Void</div>}
                </div>
            </div>

            {/* Main Content */}
            <main className="invoice-main">
                <h1 className="invoice-ref-number">#{invoice.id.slice(0, 8)}</h1>

                <div className="invoice-form-grid">
                    <div className="input-group-flex">
                        <label className="label-muted">Customer</label>
                        <input type="text" className="input-field-dark" value={customer.name || 'Unknown'} readOnly />
                    </div>
                    <div className="input-group-flex">
                        <label className="label-muted">Email</label>
                        <input type="text" className="input-field-dark" value={customer.email || ''} readOnly />
                    </div>
                    <div className="input-group-flex">
                        <label className="label-muted">Invoice Address</label>
                        <input type="text" className="input-field-dark" value={customer.address || ''} readOnly />
                    </div>
                    <div className="input-group-flex">
                        <label className="label-muted">Invoice date</label>
                        <input type="date" className="input-field-dark" value={new Date(invoice.createdAt).toISOString().split('T')[0]} readOnly />
                    </div>
                </div>

                <div className="invoice-rental-period">
                    <label className="label-muted" style={{ display: 'block', marginBottom: '1rem' }}>Rental Information</label>
                    <div className="invoice-date-grid">
                        <div style={{ color: '#aaa' }}>Order Ref: {order.orderNumber}</div>
                    </div>
                </div>

                <div className="invoice-lines-card">
                    <h2 className="items-title">Invoice Lines</h2>
                    <table className="lines-table-dark">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="product-info-wrap">
                                            <div className="name">{item.product?.name || 'Item'}</div>
                                            {item.startDate && (
                                                <div className="period">[{new Date(item.startDate).toLocaleDateString()} → {new Date(item.endDate).toLocaleDateString()}]</div>
                                            )}
                                        </div>
                                    </td>
                                    <td>{item.quantity}</td>
                                    <td>Rs {item.price}</td>
                                    <td>Rs {(Number(item.quantity) * Number(item.price)).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="invoice-bottom">
                    <div className="terms-box">
                        <label className="label-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Terms & Conditions:</label>
                        <a href="#" className="terms-link-accent">https://rentflow.com/terms-of-service</a>
                    </div>

                    <div className="invoice-totals-box">
                        <div className="invoice-total-row">
                            <span>Untaxed Amount:</span>
                            <span>Rs {Number(invoice.amount).toFixed(2)}</span>
                        </div>
                        <div className="invoice-total-row big">
                            <span>Total:</span>
                            <span>Rs {Number(invoice.amount).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default VendorInvoice;
