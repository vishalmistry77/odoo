import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import './VendorProfile.css';

const VendorProfile = () => {
    const { user, logout } = useAuth(); // Note: 'user' from context might be stale if we update profile. Better to fetch fresh.
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        companyName: '',
        gstin: '',
        address: '',
        profileImage: '',
    });
    const [activeTab, setActiveTab] = useState('work');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const fileInputRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/profile');
            if (res.data.success) {
                setProfile(prev => ({ ...prev, ...res.data.data }));
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
            setMessage({ type: 'error', text: 'Failed to load profile data.' });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            // Preview
            setProfile(prev => ({ ...prev, profileImage: URL.createObjectURL(file) }));
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage(null);

        try {
            const formData = new FormData();
            formData.append('name', profile.name);
            formData.append('phone', profile.phone || '');
            formData.append('companyName', profile.companyName || '');
            formData.append('gstin', profile.gstin || '');
            formData.append('address', profile.address || '');

            if (selectedImage) {
                formData.append('profileImage', selectedImage);
            }

            const res = await api.put('/users/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                // Update context user if needed (re-login or custom update function)
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        }
    };

    if (loading) return <div className="loading-screen">Loading...</div>;

    return (
        <div className="vendor-profile-page">
            {/* Header Section (similar to VendorOrders) */}
            <nav className="top-nav">
                <div className="nav-container">
                    <div className="nav-left">
                        <Link to="/dashboard" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <h1>RentFlow</h1>
                        </Link>
                        <div className="nav-tabs">
                            <Link to="/dashboard" className="nav-tab">Dashboard</Link>
                            <Link to="/vendor/orders" className="nav-tab">Orders</Link>
                            <Link to="/vendor/profile" className="nav-tab active">Profile</Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="profile-container">
                {/* Profile Header Card */}
                <div className="profile-header-card">
                    <div className="profile-avatar-large">
                        {profile.profileImage && !profile.profileImage.startsWith('blob') ? (
                            <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${profile.profileImage}`} alt="Profile" />
                        ) : profile.profileImage ? (
                            <img src={profile.profileImage} alt="Preview" />
                        ) : (
                            <span>{profile.name?.substring(0, 2).toUpperCase()}</span>
                        )}
                    </div>
                    <div className="profile-identity">
                        <h1>{profile.name || 'User'}</h1>
                        <span className="role-badge">Vendor</span>
                        {message && <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: message.type === 'error' ? '#ef4444' : '#10b981' }}>{message.text}</div>}
                    </div>
                </div>

                <div className="profile-content-grid">
                    {/* Left Form Section */}
                    <div className="profile-form-section">
                        <div className="tabs">
                            <button
                                className={`tab-btn ${activeTab === 'work' ? 'active' : ''}`}
                                onClick={() => setActiveTab('work')}
                            >
                                Work Information
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                                onClick={() => setActiveTab('security')}
                            >
                                Security
                            </button>
                        </div>

                        {activeTab === 'work' && (
                            <form className="work-form" onSubmit={handleSave}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input type="text" name="name" value={profile.name} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Company Logo</label>
                                        <div className="upload-box">
                                            <button type="button" className="btn-upload" onClick={triggerFileInput}>Upload</button>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                style={{ display: 'none' }}
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                            {selectedImage && <span className="file-name">{selectedImage.name}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input type="email" value={profile.email} disabled className="input-disabled" />
                                    </div>
                                    <div className="form-group">
                                        <label>GST IN</label>
                                        <input type="text" name="gstin" value={profile.gstin} onChange={handleInputChange} placeholder="GST Number" />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input type="text" name="phone" value={profile.phone} onChange={handleInputChange} placeholder="+91..." />
                                    </div>
                                    <div className="form-group">
                                        {/* Spacer or another field */}
                                    </div>
                                </div>

                                <div className="form-group full-width">
                                    <label>Company name</label>
                                    <input type="text" name="companyName" value={profile.companyName} onChange={handleInputChange} />
                                </div>

                                <div className="form-group full-width">
                                    <label>Address</label>
                                    <textarea name="address" value={profile.address} onChange={handleInputChange} rows="3"></textarea>
                                </div>

                                {message && <div className={`message ${message.type}`}>{message.text}</div>}

                                <div className="form-actions">
                                    <button type="submit" className="btn-save">Save Changes</button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'security' && (
                            <div className="security-section">
                                <div className="form-group">
                                    <label>Change Password:</label>
                                    <button type="button" className="btn-change-password">Change Password</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Side Card (Mini Profile) */}
                    <div className="profile-mini-card">
                        <div className="mini-avatar">
                            {profile.profileImage && !profile.profileImage.startsWith('blob') ? (
                                <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${profile.profileImage}`} alt="Profile" />
                            ) : profile.profileImage ? (
                                <img src={profile.profileImage} alt="Preview" />
                            ) : (
                                <span>User</span>
                            )}
                        </div>
                        <div className="mini-actions">
                            <button className="icon-btn" title="Edit">✏️</button>
                            <button className="icon-btn ml-2" title="Delete">🗑️</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorProfile;
