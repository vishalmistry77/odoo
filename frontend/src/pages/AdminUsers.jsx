```javascript
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import './AdminStyles.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            if (res.data.success) {
                setUsers(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
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
                            <Link to="/admin/users" className="nav-tab active">Users</Link>
                            <Link to="/admin/products" className="nav-tab">Products</Link>
                            <Link to="/admin/orders" className="nav-tab">Orders</Link>
                            <Link to="/admin/reports" className="nav-tab">Reports</Link>
                            <Link to="/admin/settings" className="nav-tab">Settings</Link>
                        </div>
                    </div>
                    <div className="nav-right">
                         <div className="user-menu">
                            <div className="user-avatar" style={{ background: 'var(--primary)' }}>AD</div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="admin-main">
                <div className="admin-header">
                    <h2>User Management</h2>
                    <p className="admin-header-subtitle">View and manage all registered users.</p>
                </div>

                <div className="admin-chart-card" style={{ overflowX: 'auto' }}>
                    {loading ? (
                        <p style={{padding: '2rem', textAlign: 'center'}}>Loading users...</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text)' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem' }}>User</th>
                                    <th style={{ padding: '1rem' }}>Role</th>
                                    <th style={{ padding: '1rem' }}>Company</th>
                                    <th style={{ padding: '1rem' }}>Joined</th>
                                    <th style={{ padding: '1rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 600 }}>{user.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.email}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ 
                                                padding: '0.25rem 0.75rem', 
                                                borderRadius: '20px', 
                                                fontSize: '0.8rem',
                                                backgroundColor: user.role === 'ADMIN' ? 'rgba(236, 72, 153, 0.2)' : user.role === 'VENDOR' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                                color: user.role === 'ADMIN' ? 'var(--secondary)' : user.role === 'VENDOR' ? 'var(--primary)' : 'var(--success)'
                                            }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{user.companyName || '-'}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginRight: '0.5rem' }}>Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminUsers;
```
