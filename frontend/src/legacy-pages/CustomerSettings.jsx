import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import './VendorSettings.css';

const CustomerSettings = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await api.get('/users/profile');
                const savedProfile = response.data?.data;
                if (savedProfile) {
                    setProfile({
                        name: savedProfile.name || '',
                        email: savedProfile.email || '',
                        phone: savedProfile.phone || '',
                        address: savedProfile.address || '',
                    });
                }
            } catch (error) {
                setMessage(error.response?.data?.message || 'Could not load your settings. Refresh and try again.');
            }
        };

        loadProfile();
    }, []);

    const handleChange = (event) => {
        setProfile((current) => ({ ...current, [event.target.name]: event.target.value }));
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setIsSaving(true);
        setMessage('');

        try {
            const response = await api.put('/users/profile', {
                name: profile.name.trim(),
                phone: profile.phone.trim(),
                address: profile.address.trim(),
            });
            const updatedProfile = response.data?.data;
            updateUser(updatedProfile || profile);
            setProfile((current) => ({ ...current, ...(updatedProfile || {}) }));
            setMessage('Settings saved successfully. Your address is ready for checkout.');
        } catch (error) {
            setMessage(error.response?.data?.message || 'Could not save your settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    return (
        <div className="vendor-settings-page">
            <nav className="top-nav">
                <div className="nav-container">
                    <div className="nav-left">
                        <Link to="/dashboard" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <h1>RentFlow</h1>
                        </Link>
                        <div className="nav-tabs">
                            <Link to="/dashboard" className="nav-tab">Products</Link>
                            <Link to="/customer/orders" className="nav-tab">My Orders</Link>
                            <Link to="/customer/settings" className="nav-tab active">Settings</Link>
                        </div>
                    </div>
                    <div className="nav-right">
                        <button className="btn-secondary" onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </nav>

            <main className="vendor-main-content">
                <div className="vendor-header">
                    <div className="vendor-header-left">
                        <h2 className="page-title">Account settings</h2>
                        <p className="vendor-header-subtitle">Manage your contact and delivery address.</p>
                    </div>
                </div>

                <form className="settings-container" onSubmit={handleSave}>
                    <section className="settings-section">
                        <h3>Profile information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="customer-name">Full name</label>
                                <input id="customer-name" type="text" name="name" value={profile.name} onChange={handleChange} autoComplete="name" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="customer-email">Email address</label>
                                <input id="customer-email" type="email" value={profile.email} disabled />
                            </div>
                            <div className="form-group">
                                <label htmlFor="customer-phone">Phone number</label>
                                <input id="customer-phone" type="tel" name="phone" value={profile.phone} onChange={handleChange} autoComplete="tel" />
                            </div>
                            <div className="form-group full-width">
                                <label htmlFor="customer-address">Delivery address</label>
                                <textarea id="customer-address" name="address" value={profile.address} onChange={handleChange} rows="4" autoComplete="street-address" placeholder="House or flat number, street, area, city, state and PIN code" />
                                <p className="settings-help">This address is shown at checkout and saved with new orders.</p>
                            </div>
                        </div>
                    </section>

                    {message && <p className="settings-message" role="status">{message}</p>}

                    <div>
                        <button className="btn-primary" type="submit" disabled={isSaving}>
                            {isSaving ? 'Saving…' : 'Save changes'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default CustomerSettings;
