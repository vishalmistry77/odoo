import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import './VendorOrders.css';

const VendorOrders = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const isVendor = user?.role === 'VENDOR';
    const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
    const [activeFilter, setActiveFilter] = useState('Total');
    const [checkedItems, setCheckedItems] = useState({});
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const fileInputRef = React.useRef(null);

    React.useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/orders');
                if (res.data.success) {
                    setOrders(Array.isArray(res.data.data) ? res.data.data : []);
                }
            } catch (error) {
                console.error("Failed to fetch orders", error);
                // setOrders([]); // Keep it as initialized [] on error
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const toggleSettings = () => {
        setIsSettingsOpen(!isSettingsOpen);
    };

    const handleExport = async () => {
        setIsSettingsOpen(false);
        try {
            const response = await api.get('/orders/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `orders_export_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed', error);
            alert("Failed to export. ensure you have orders.");
        }
    };

    const handleImportClick = () => {
        setIsSettingsOpen(false);
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            // await api.post('/orders/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert(`Selected file: ${file.name}. Import logic to be connected.`);
        } catch (error) {
            alert("Import failed.");
        }
    };



    const toggleCheckbox = (id) => {
        setCheckedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleConfirmOrder = async (orderId) => {
        if (!window.confirm("Confirm this order? This will reserve the stock.")) return;
        try {
            const res = await api.post(`/orders/${orderId}/confirm`);
            if (res.data.success) {
                alert("Order confirmed!");
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'SALES_ORDER' } : o));
            }
        } catch (error) {
            console.error("Confirmation Error", error);
            alert(error.response?.data?.message || "Failed to confirm order.");
        }
    };

    const handlePayOrder = async (orderId) => {
        if (!window.confirm("Proceed to payment for this order?")) return;
        try {
            const res = await api.post(`/orders/${orderId}/pay`);
            if (res.data.success) {
                alert("Payment Successful! Invoice generated.");
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'PAID' } : o));
            }
        } catch (error) {
            console.error("Payment Error", error);
            alert(error.response?.data?.message || "Payment failed.");
        }
    };

    const handlePrintInvoice = (orderId) => {
        alert(`Printing Invoice for Order #${orderId}... (Mock Feature)`);
        // window.open(`/api/invoices/${orderId}`, '_blank');
    };

    const handlePickup = async (orderId) => {
        if (!window.confirm("Confirm pickup for this order? Stock will be deducted.")) return;
        try {
            const res = await api.post(`/orders/${orderId}/pickup`);
            if (res.data.success) {
                alert("Order Picked Up! Stock updated.");
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'PICKED_UP' } : o));
            }
        } catch (error) {
            console.error("Pickup Error", error);
            alert(error.response?.data?.message || "Failed to pickup order.");
        }
    };

    const handleReturn = async (orderId) => {
        if (!window.confirm("Confirm return for this order? Stock will be restored.")) return;
        try {
            const res = await api.post(`/orders/${orderId}/return`);
            if (res.data.success) {
                const lateFee = res.data.lateFee;
                let msg = "Order Returned! Stock restored.";
                if (lateFee > 0) msg += `\nLate Fee Applied: R${Number(lateFee).toFixed(2)}`;

                alert(msg);
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'RETURNED', lateFee: lateFee } : o));
            }
        } catch (error) {
            console.error("Return Error", error);
            alert(error.response?.data?.message || "Failed to return order.");
        }
    };

    const handleCreateInvoice = async (orderId) => {
        if (!window.confirm("Generate invoice for this confirmed order?")) return;
        try {
            const res = await api.post(`/invoice/create/${orderId}`);
            if (res.data.success) {
                alert("Invoice Created Successfully! Customer can now pay.");
                // Optimistically update to prevent double click (though backend prevents it)
                // In a real app we'd refetch, but here let's just alert.
            }
        } catch (error) {
            console.error("Invoice Creation Error", error);
            alert(error.response?.data?.message || "Failed to create invoice.");
        }
    };

    const handlePrintPickup = (orderId) => alert(`Printing Pickup Slip for Order #${orderId}...`);
    const handlePrintReturn = (orderId) => alert(`Printing Return Receipt for Order #${orderId}...`);

    const getSelectedOrderIds = () => {
        return Object.entries(checkedItems)
            .filter(([id, isChecked]) => isChecked && id !== 'all')
            .map(([id]) => id);
    };

    const handleBulkAction = async (actionType) => {
        const selectedIds = getSelectedOrderIds();
        if (selectedIds.length === 0) {
            alert(`Please select at least one order to ${actionType}.`);
            return;
        }

        if (!window.confirm(`Are you sure you want to mark ${selectedIds.length} orders as ${actionType}?`)) return;

        let successCount = 0;
        let failCount = 0;

        // processing sequentially to avoid overwhelming server or race conditions on stock if any
        for (const id of selectedIds) {
            try {
                const endpoint = actionType === 'Pickup' ? `/orders/${id}/pickup` : `/orders/${id}/return`;
                const res = await api.post(endpoint);
                if (res.data.success) successCount++;
            } catch (error) {
                console.error(`${actionType} failed for ${id}`, error);
                failCount++;
            }
        }

        alert(`${actionType} Process Completed.\nSuccessful: ${successCount}\nFailed: ${failCount} (Check order status requirements)`);
        window.location.reload();
    };

    // --- Filtering Logic ---
    // --- Filtering Logic ---
    const safeOrders = Array.isArray(orders) ? orders : [];

    const filteredOrders = safeOrders.filter(order => {
        // 1. Status Filter
        if (activeFilter !== 'Total') {
            // Map readable Name to status enum if necessary, or just match direct string
            // Our filters are 'Sale order', 'Quotation' etc. Status is 'SALES_ORDER', 'QUOTATION'
            // Let's normalize
            const f = activeFilter.toUpperCase().replace(' ', '_');
            const s = (order.status || '').toUpperCase(); // Safety check

            // Special handling for 'Sale Order' -> 'SALES_ORDER' mismatch
            if (f === 'SALE_ORDER' && s !== 'SALES_ORDER') return false;

            // Standard check
            if (f !== 'SALE_ORDER' && s !== f && order.status !== activeFilter) {
                if (s !== f) return false;
            }
        }

        // 2. Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const orderNum = order.orderNumber?.toLowerCase() || '';
            const custName = order.user?.name?.toLowerCase() || '';
            const prodName = order.items?.[0]?.product?.name?.toLowerCase() || '';
            return orderNum.includes(q) || custName.includes(q) || prodName.includes(q);
        }
        return true;
    });

    // --- Dynamic Counts ---
    const getCount = (filterName) => {
        const safeOrders = Array.isArray(orders) ? orders : [];
        if (filterName === 'Total') return safeOrders.length;
        const f = filterName.toUpperCase().replace(' ', '_');
        return safeOrders.filter(o => {
            const s = (o.status || '').toUpperCase();
            if (f === 'SALE_ORDER') return s === 'SALES_ORDER';
            return s === f;
        }).length;
    };

    const filters = [
        { name: 'Total', count: getCount('Total') },
        { name: 'Sale order', count: getCount('Sale order') },
        { name: 'Quotation', count: getCount('Quotation') },
        { name: 'Invoiced', count: getCount('Invoiced') || getCount('Paid') }, // Paid implies invoiced usually
        { name: 'Confirmed', count: getCount('Confirmed') },
        { name: 'Cancelled', count: getCount('Cancelled') },
        { name: 'Picked Up', count: getCount('Picked Up') }, // Added new status
        { name: 'Returned', count: getCount('Returned') },
    ];

    return (
        <div className="vendor-orders-page">
            {/* Top Navigation */}
            <nav className="top-nav">
                <div className="nav-container">
                    <div className="nav-left">
                        <Link to="/dashboard" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <h1>RentFlow</h1>
                        </Link>
                        <div className="nav-tabs">
                            <Link to="/dashboard" className="nav-tab" style={{ textDecoration: 'none' }}>Dashboard</Link>
                            <Link to="/vendor/orders" className="nav-tab active" style={{ textDecoration: 'none' }}>Orders</Link>
                            <Link to="/vendor/products" className="nav-tab" style={{ textDecoration: 'none' }}>Products</Link>
                            <Link to="/vendor/reports" className="nav-tab" style={{ textDecoration: 'none' }}>Reports</Link>
                            <Link to="/vendor/settings" className="nav-tab" style={{ textDecoration: 'none' }}>Settings</Link>
                        </div>
                    </div>

                    <div className="nav-right">
                        <div className="user-menu" onClick={() => setIsDropdownOpen(!isDropdownOpen)} style={{ cursor: 'pointer', position: 'relative' }}>
                            <div className="user-avatar">{user?.name ? user.name.substring(0, 2).toUpperCase() : 'VR'}</div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name || 'User'}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isVendor ? 'Vendor' : 'Customer'}</div>
                            </div>

                            {isDropdownOpen && (
                                <div className="user-dropdown-menu">
                                    <Link to="/vendor/profile" className="dropdown-item">
                                        <span>👤</span> Profile
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

            {/* Main Header */}
            <div className="main-header">
                <div className="header-left">
                    <h1 className="page-title">{isVendor ? 'Vendor Orders' : 'My Orders'}</h1>
                    <div style={{ position: 'relative' }}>
                        <button className="settings-btn" onClick={toggleSettings}>⚙️</button>
                        {isSettingsOpen && (
                            <div className="settings-dropdown">
                                <button className="settings-option" onClick={handleExport}><span className="option-icon">↑</span><span>Export Records</span></button>
                                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', margin: '0.2rem 0' }}></div>
                                <button className="settings-option" onClick={handleImportClick}><span className="option-icon">↓</span><span>Import Records</span></button>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".csv, .xlsx" onChange={handleFileChange} />
                    </div>
                    <Link to="/vendor/orders/new" className="btn-new" style={{ textDecoration: 'none' }}>New</Link>
                </div>

                <div className="header-actions">
                    <div className="search-box">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="search-btn">🔍</button>
                    </div>

                    {isVendor && (
                        <div className="action-btns">
                            <button className="action-btn" onClick={() => handleBulkAction('Pickup')}>Pickup</button>
                            <button className="action-btn" onClick={() => handleBulkAction('Return')}>Return</button>
                        </div>
                    )}

                    <div className="view-controls">
                        <button
                            className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                            onClick={() => setViewMode('kanban')}
                        >
                            ▦
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            ☰
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Wrapper */}
            <div className="content-wrapper">
                {/* Sidebar Filter */}
                <aside className="sidebar">
                    <div className="filter-section">
                        <div className="filter-title">
                            <span>Rental Status</span>
                            <span className="filter-count">{orders.length}</span>
                        </div>

                        {filters.map((filter) => (
                            <div
                                key={filter.name}
                                className={`filter-item ${filter.name === activeFilter ? 'active' : ''}`}
                                onClick={() => setActiveFilter(filter.name)}
                            >
                                <span>{filter.name}</span>
                                {/* Mock counts would need real logic */}
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Main Content */}
                <div className="main-content">
                    {/* Kanban View */}
                    <div className={`kanban-view ${viewMode === 'kanban' ? 'active' : ''}`}>
                        <div className="kanban-grid">
                            {filteredOrders.map((order) => (
                                <div key={order.id} className="kanban-card">
                                    {/* Checkbox for selection */}
                                    <div
                                        className={`custom-checkbox ${checkedItems[order.id] ? 'checked' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleCheckbox(order.id);
                                        }}
                                        style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 10 }}
                                    >
                                        {checkedItems[order.id] && '✓'}
                                    </div>

                                    <div className="card-header">
                                        <div>
                                            <div className="card-customer">{order.user?.name || 'Guest'}</div>
                                            <div className="card-order">{order.orderNumber}</div>
                                        </div>
                                    </div>
                                    <div className="card-product">
                                        {order.items?.[0]?.product?.name || 'Item'}
                                        {order.items?.length > 1 && ` (+${order.items.length - 1})`}
                                    </div>
                                    <div className="card-price">
                                        R{Number(order.totalAmount).toFixed(2)}
                                        {Number(order.lateFee) > 0 && (
                                            <div style={{ color: 'var(--accent)', fontSize: '0.75rem', marginTop: '2px' }}>
                                                + Late Fee: R{Number(order.lateFee).toFixed(2)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="card-duration">
                                        {order.items?.[0]?.startDate ?
                                            `${new Date(order.items[0].startDate).toLocaleDateString()} - ${new Date(order.items[0].endDate).toLocaleDateString()}`
                                            : 'No dates'}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                        <div className={`status-badge status-${order.status.toLowerCase().replace('_', '-')}`}>
                                            {order.status.replace('_', ' ')}
                                        </div>

                                        {/* Vendor Actions */}
                                        {isVendor && order.status === 'QUOTATION' && (
                                            <button className="btn-confirm" onClick={() => handleConfirmOrder(order.id)} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                                Confirm
                                            </button>
                                        )}
                                        {isVendor && (order.status === 'SALES_ORDER' || order.status === 'CONFIRMED') && (
                                            <button className="btn-confirm" onClick={() => handleCreateInvoice(order.id)} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                                Create Invoice
                                            </button>
                                        )}

                                        {/* Customer Actions */}
                                        {!isVendor && (order.status === 'SALES_ORDER' || order.status === 'CONFIRMED') && (
                                            <button className="btn-pay" onClick={() => handlePayOrder(order.id)} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                                Pay Now
                                            </button>
                                        )}

                                        {/* Invoice Action */}
                                        {order.status === 'PAID' && (
                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                {isVendor && (
                                                    <button className="btn-confirm" onClick={() => handlePickup(order.id)} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--accent-warm)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                                        Pickup
                                                    </button>
                                                )}
                                                <button className="btn-invoice" onClick={() => handlePrintInvoice(order.id)} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--surface-light)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}>
                                                    Inv 📄
                                                </button>
                                                <button className="btn-invoice" onClick={() => handlePrintPickup(order.id)} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--surface-light)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}>
                                                    Slip 🚚
                                                </button>
                                            </div>
                                        )}

                                        {/* Return Action */}
                                        {isVendor && order.status === 'PICKED_UP' && (
                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                <button className="btn-confirm" onClick={() => handleReturn(order.id)} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                                    Return
                                                </button>
                                            </div>
                                        )}

                                        {/* Completed/Returned Actions */}
                                        {order.status === 'RETURNED' && (
                                            <button className="btn-invoice" onClick={() => handlePrintReturn(order.id)} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--surface-light)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}>
                                                Receipt 🧾
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {(!orders || orders.length === 0) && !loading && <div style={{ color: '#fff', textAlign: 'center', padding: '2rem' }}>No orders found.</div>}
                        </div>
                    </div>

                    {/* List View */}
                    <div className={`list-view ${viewMode === 'list' ? 'active' : ''}`}>
                        {/* Simplified list view rendering for brevity, matching Kanban logic in columns */}
                        <div className="list-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th className="checkbox-cell">
                                            <div
                                                className={`custom-checkbox ${checkedItems['all'] ? 'checked' : ''}`}
                                                onClick={() => toggleCheckbox('all')}
                                            >
                                                {checkedItems['all'] && '✓'}
                                            </div>
                                        </th>
                                        <th>Order Reference</th>
                                        <th>Order Date</th>
                                        <th>Customer Name</th>
                                        <th>Product</th>
                                        <th>Total</th>
                                        <th>Rental Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td className="checkbox-cell">
                                                <div
                                                    className={`custom-checkbox ${checkedItems[order.id] ? 'checked' : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleCheckbox(order.id);
                                                    }}
                                                >
                                                    {checkedItems[order.id] && '✓'}
                                                </div>
                                            </td>
                                            <td>{order.orderNumber}</td>
                                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td>{order.user?.name || 'Unknown'}</td>
                                            <td>{order.items?.[0]?.product?.name || 'Multiple Items'} {order.items?.length > 1 ? `+${order.items.length - 1} more` : ''}</td>
                                            <td>R{Number(order.totalAmount).toFixed(2)}</td>
                                            <td>
                                                <span className={`status-badge status-${order.status.toLowerCase().replace('_', '-')}`}>
                                                    {order.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td>
                                                {isVendor && order.status === 'QUOTATION' && (
                                                    <button onClick={() => handleConfirmOrder(order.id)} style={{ fontSize: '0.8rem', cursor: 'pointer' }}>Confirm</button>
                                                )}
                                                {isVendor && (order.status === 'SALES_ORDER' || order.status === 'CONFIRMED') && (
                                                    <button onClick={() => handleCreateInvoice(order.id)} style={{ fontSize: '0.8rem', cursor: 'pointer', color: 'var(--primary)', marginRight: '8px' }}>Create Invoice</button>
                                                )}
                                                {!isVendor && (order.status === 'SALES_ORDER' || order.status === 'CONFIRMED') && (
                                                    <button onClick={() => handlePayOrder(order.id)} style={{ fontSize: '0.8rem', cursor: 'pointer', color: 'var(--accent)' }}>Pay Now</button>
                                                )}
                                                {order.status === 'PAID' && (
                                                    <button onClick={() => handlePrintInvoice(order.id)} style={{ fontSize: '0.8rem', cursor: 'pointer' }}>Invoice</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!orders || orders.length === 0) && !loading && (
                                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No orders found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorOrders;
