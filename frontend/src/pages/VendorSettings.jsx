import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import './VendorSettings.css';

const VendorSettings = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Mock form state -> Real state
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        companyName: '',
        phone: '',
        address: ''
    });

    React.useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/users/profile');
                if (res.data.success) {
                    const d = res.data.data;
                    setProfile({
                        name: d.name || '',
                        email: d.email || '',
                        companyName: d.companyName || '',
                        phone: d.phone || '',
                        address: d.address || ''
                    });
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    const handleInputChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            // Use FormData because backend route uses multer
            const formData = new FormData();
            formData.append('name', profile.name);
            formData.append('phone', profile.phone);
            formData.append('companyName', profile.companyName);
            formData.append('address', profile.address);
            // formData.append('profileImage', file); // Future: Add image upload

            const res = await api.put('/users/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                // Update global context so the header name changes immediately
                updateUser({
                    name: profile.name,
                    phone: profile.phone,
                    companyName: profile.companyName,
                    address: profile.address
                });

                alert("Settings saved successfully!");
                navigate('/vendor/dashboard');
            }
        } catch (error) {
            console.error("Save Error", error);
            alert("Failed to save settings: " + (error.response?.data?.message || error.message));
        }
    };

    // Password State
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: ''
    });

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.value]: e.target.value });
        // Oops, logic error above. Fix:
        // setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    // Corrected handler
    const onPasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    }

    const handleUpdatePassword = async () => {
        if (!passwords.currentPassword || !passwords.newPassword) {
            alert("Please fill in both current and new password fields.");
            return;
        }

        try {
            // Note: Route is /api/users/password based on app.js mounting
            const res = await api.put('/users/password', passwords);
            if (res.data.success) {
                alert("Password updated successfully!");
                setPasswords({ currentPassword: '', newPassword: '' });
            }
        } catch (error) {
            console.error("Password Update Error", error);
            alert(error.response?.data?.message || "Failed to update password.");
        }
    };

    return (
        <div className="vendor-settings-page">
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
                            <Link to="/vendor/products" className="nav-tab" style={{ textDecoration: 'none' }}>Products</Link>
                            <Link to="/vendor/reports" className="nav-tab" style={{ textDecoration: 'none' }}>Reports</Link>
                            <Link to="/vendor/settings" className="nav-tab active" style={{ textDecoration: 'none' }}>Settings</Link>
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

            <main className="vendor-main-content">
                <div className="vendor-header">
                    <div className="vendor-header-left">
                        <h2 className="page-title">Settings</h2>
                        <p className="vendor-header-subtitle">Manage your profile and preferences</p>
                    </div>
                    <div className="vendor-header-right">
                        <button className="btn-primary" onClick={handleSave}>Save Changes</button>
                    </div>
                </div>

                <div className="settings-container">
                    <div className="settings-section">
                        <h3>Profile Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" name="name" value={profile.name} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" name="email" value={profile.email} onChange={handleInputChange} disabled />
                            </div>
                            <div className="form-group">
                                <label>Company Name</label>
                                <input type="text" name="companyName" value={profile.companyName} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="text" name="phone" value={profile.phone} onChange={handleInputChange} />
                            </div>
                            <div className="form-group full-width">
                                <label>Business Address</label>
                                <input type="text" name="address" value={profile.address} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3>Security</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    placeholder="••••••••"
                                    value={passwords.currentPassword}
                                    onChange={onPasswordChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    placeholder="Enter new password"
                                    value={passwords.newPassword}
                                    onChange={onPasswordChange}
                                />
                            </div>
                        </div>
                        <button className="btn-secondary" style={{ marginTop: '1rem' }} onClick={handleUpdatePassword}>Update Password</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default VendorSettings;
