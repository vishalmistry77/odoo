import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminSettings.css'; // New CSS
import './AdminStyles.css'; // Structure

const AdminSettings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('general');

    // Mock Data for Periods
    const [periods, setPeriods] = useState([
        { id: 1, name: 'Daily', duration: 1, unit: 'Day' },
        { id: 2, name: 'Weekly', duration: 1, unit: 'Week' },
        { id: 3, name: 'Weekend', duration: 2, unit: 'Day' },
    ]);

    // Mock Data for Attributes
    const [attributes, setAttributes] = useState([
        { id: 1, name: 'Brand', type: 'Select', values: 'Sony, Canon, Nikon' },
        { id: 2, name: 'Color', type: 'Color', values: '#000000, #FFFFFF' },
    ]);

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
                            <Link to="/admin/orders" className="nav-tab">Orders</Link>
                            <Link to="/admin/reports" className="nav-tab">Reports</Link>
                            <Link to="/admin/settings" className="nav-tab active">Settings</Link>
                        </div>
                    </div>
                    <div className="nav-right">
                        <div className="user-menu">
                            <div className="user-avatar" style={{ background: 'var(--primary)' }}>AD</div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="admin-settings-container">
                <aside className="settings-sidebar">
                    <button
                        className={`settings-nav-item ${activeTab === 'general' ? 'active' : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        General & Profile
                    </button>
                    <button
                        className={`settings-nav-item ${activeTab === 'periods' ? 'active' : ''}`}
                        onClick={() => setActiveTab('periods')}
                    >
                        Rental Periods
                    </button>
                    <button
                        className={`settings-nav-item ${activeTab === 'attributes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('attributes')}
                    >
                        Attributes
                    </button>
                    <button
                        className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        Security
                    </button>
                </aside>

                <main className="settings-content-area">
                    {activeTab === 'general' && (
                        <div>
                            <h2 className="settings-section-title">General Settings</h2>
                            <div className="form-group-row">
                                <label>Company Name</label>
                                <input type="text" className="form-control" defaultValue="RentFlow HQ" />
                            </div>
                            <div className="form-group-row">
                                <label>Business Email</label>
                                <input type="email" className="form-control" defaultValue={user?.email} disabled />
                            </div>
                            <div className="form-group-row">
                                <label>System Currency</label>
                                <select className="form-control">
                                    <option>USD ($)</option>
                                    <option>EUR (€)</option>
                                    <option>INR (₹)</option>
                                </select>
                            </div>
                            <button className="settings-action-btn btn-add">Save Changes</button>
                        </div>
                    )}

                    {activeTab === 'periods' && (
                        <div>
                            <div className="settings-header-actions">
                                <h2 className="settings-section-title" style={{ marginBottom: 0 }}>Rental Periods</h2>
                                <button className="settings-action-btn btn-add">+ New Period</button>
                            </div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Define the standard durations available for rental products.</p>

                            <table className="settings-table-wrapper">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Duration</th>
                                        <th>Unit</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {periods.map(p => (
                                        <tr key={p.id}>
                                            <td>{p.name}</td>
                                            <td>{p.duration}</td>
                                            <td>{p.unit}</td>
                                            <td>
                                                <button className="settings-action-btn btn-edit">Edit</button>
                                                <button className="settings-action-btn btn-delete">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'attributes' && (
                        <div>
                            <div className="settings-header-actions">
                                <h2 className="settings-section-title" style={{ marginBottom: 0 }}>Product Attributes</h2>
                                <button className="settings-action-btn btn-add">+ New Attribute</button>
                            </div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Configure global attributes like Brand, Color, Size that vendors can use.</p>

                            <table className="settings-table-wrapper">
                                <thead>
                                    <tr>
                                        <th>Attribute Name</th>
                                        <th>Display Type</th>
                                        <th>Sample Values</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attributes.map(a => (
                                        <tr key={a.id}>
                                            <td>{a.name}</td>
                                            <td><span className="badge-purple">{a.type}</span></td>
                                            <td style={{ color: 'var(--text-muted)' }}>{a.values}</td>
                                            <td>
                                                <button className="settings-action-btn btn-edit">Config</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div>
                            <h2 className="settings-section-title">Security</h2>
                            <div className="form-group-row">
                                <label>Change Password</label>
                                <input type="password" placeholder="New Password" className="form-control" />
                            </div>
                            <button className="settings-action-btn btn-add">Update Password</button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminSettings;
