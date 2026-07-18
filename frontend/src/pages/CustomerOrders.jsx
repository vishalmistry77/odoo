import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import './CustomerOrders.css'; // We'll create a basic CSS file or reuse styles

const CustomerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/orders')
            .then(res => {
                if (res.data.success) {
                    setOrders(res.data.data);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const getStatusBadge = (status) => {
        const colors = {
            QUOTATION: 'bg-gray-500',
            SALES_ORDER: 'bg-blue-500',
            CONFIRMED: 'bg-indigo-500',
            PAID: 'bg-green-500',
            PICKED_UP: 'bg-purple-500',
            RETURNED: 'bg-teal-500',
            CANCELLED: 'bg-red-500',
        };
        const colorClass = colors[status] || 'bg-gray-500';
        return <span className={`status-badge ${colorClass}`}>{status}</span>;
    };

    if (loading) return <div className="p-8 text-center text-white">Loading orders...</div>;

    return (
        <div className="customer-orders-page">
            <div className="container">
                <h1 className="page-title">My Rentals</h1>
                {orders.length === 0 ? (
                    <div className="empty-state">
                        <p>You haven't rented anything yet.</p>
                        <Link to="/dashboard" className="btn btn-primary">Browse Products</Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map(order => (
                            <div key={order.id} className="order-card">
                                <div className="order-header">
                                    <h3>Order #{order.orderNumber}</h3>
                                    {getStatusBadge(order.status)}
                                </div>
                                <div className="order-date">
                                    Date: {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                                <div className="order-items">
                                    {order.items.map(item => (
                                        <div key={item.id} className="order-item">
                                            <span>{item.product.name} (x{item.quantity})</span>
                                            <span>{new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}</span>
                                            <span>R{item.price}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="order-footer">
                                    <div className="total-amount">Total: R{order.totalAmount}</div>
                                    {order.status === 'CONFIRMED' || order.status === 'SALES_ORDER' ? (
                                        <button className="btn btn-pay" onClick={() => alert('Redirect to Payment Gateway...')}>Pay Now</button>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerOrders;
