import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import OrderStatusBadge from '../components/OrderStatusBadge';
import './AdminStyles.css';

const AdminOrders = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/');
            return;
        }
        fetchOrders();
    }, [user, navigate]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/orders');
            if (response.data.success) {
                setOrders(response.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            setError(err.response?.data?.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const filteredOrders = filterStatus === 'ALL'
        ? orders
        : orders.filter(order => order.status === filterStatus);

    const statusCounts = {
        ALL: orders.length,
        QUOTATION: orders.filter(o => o.status === 'QUOTATION').length,
        SALES_ORDER: orders.filter(o => o.status === 'SALES_ORDER').length,
        PAID: orders.filter(o => o.status === 'PAID').length,
        PICKED_UP: orders.filter(o => o.status === 'PICKED_UP').length,
        RETURNED: orders.filter(o => o.status === 'RETURNED').length
    };

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
                            <Link to="/admin/products" className="nav-tab">Products</Link>
                            <Link to="/admin/orders" className="nav-tab active">Orders</Link>
                            <Link to="/admin/reports" className="nav-tab">Reports</Link>
                            <Link to="/admin/settings" className="nav-tab">Settings</Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="admin-main" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ margin: 0 }}>All Orders</h2>
                        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>
                            Manage all vendor and customer orders
                        </p>
                    </div>
                    <button
                        onClick={fetchOrders}
                        className="btn-secondary"
                        style={{ padding: '0.75rem 1.5rem' }}
                    >
                        {loading ? 'Refreshing...' : '🔄 Refresh'}
                    </button>
                </div>

                {/* Status Filter Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '2rem',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '0.5rem',
                    flexWrap: 'wrap'
                }}>
                    {['ALL', 'QUOTATION', 'SALES_ORDER', 'PAID', 'PICKED_UP', 'RETURNED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            style={{
                                background: filterStatus === status ? 'var(--primary-color)' : 'transparent',
                                color: filterStatus === status ? 'white' : 'var(--text)',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                transition: 'all 0.2s'
                            }}
                        >
                            {status.replace('_', ' ')} ({statusCounts[status]})
                        </button>
                    ))}
                </div>

                {/* Loading State */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        Loading orders...
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

                {/* Orders Table */}
                {!loading && !error && (
                    <>
                        {filteredOrders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                <p>No orders found{filterStatus !== 'ALL' ? ` with status ${filterStatus}` : ''}.</p>
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
                                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Order #</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Customer</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Date</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Items</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Amount</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Status</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map(order => (
                                            <tr
                                                key={order.id}
                                                style={{
                                                    borderBottom: '1px solid var(--border-color)',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-light)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                                                        {order.orderNumber}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 500 }}>{order.user?.name || 'Unknown'}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            {order.user?.email || ''}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                                    {formatDate(order.createdAt)}
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                                    <div>
                                                        {order.items.slice(0, 2).map((item, idx) => (
                                                            <div key={idx} style={{ marginBottom: '0.25rem' }}>
                                                                {item.product?.name} × {item.quantity}
                                                            </div>
                                                        ))}
                                                        {order.items.length > 2 && (
                                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                                                +{order.items.length - 2} more
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem', fontWeight: 600 }}>
                                                    {formatCurrency(order.totalAmount)}
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <OrderStatusBadge status={order.status} />
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <Link
                                                        to={`/customer/orders/${order.id}`}
                                                        style={{
                                                            color: 'var(--primary-color)',
                                                            textDecoration: 'none',
                                                            fontSize: '0.875rem',
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        View Details →
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Summary Stats */}
                        {filteredOrders.length > 0 && (
                            <div style={{
                                marginTop: '2rem',
                                padding: '1rem',
                                background: 'var(--surface-light)',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
                                </div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                    Total Value: {formatCurrency(filteredOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminOrders;
