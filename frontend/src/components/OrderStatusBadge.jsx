import React from 'react';
import './OrderStatusBadge.css';

const OrderStatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
        const configs = {
            QUOTATION: {
                label: 'Quotation',
                className: 'status-quotation',
                icon: '📝'
            },
            QUOTATION_SENT: {
                label: 'Quotation Sent',
                className: 'status-quotation-sent',
                icon: '📤'
            },
            SALES_ORDER: {
                label: 'Confirmed',
                className: 'status-sales-order',
                icon: '✓'
            },
            CONFIRMED: {
                label: 'Confirmed',
                className: 'status-confirmed',
                icon: '✓'
            },
            PAID: {
                label: 'Paid',
                className: 'status-paid',
                icon: '💳'
            },
            PICKED_UP: {
                label: 'Picked Up',
                className: 'status-picked-up',
                icon: '📦'
            },
            RETURNED: {
                label: 'Returned',
                className: 'status-returned',
                icon: '✅'
            }
        };

        return configs[status] || {
            label: status,
            className: 'status-default',
            icon: '•'
        };
    };

    const config = getStatusConfig(status);

    return (
        <span className={`order-status-badge ${config.className}`}>
            <span className="status-icon">{config.icon}</span>
            <span className="status-label">{config.label}</span>
        </span>
    );
};

export default OrderStatusBadge;
