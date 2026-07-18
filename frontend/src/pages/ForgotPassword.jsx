import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setMessage(response.data.message);
        } catch (error) {
            const msg = error.response?.data?.message || 'An error occurred. Please try again.';
            setMessage(msg);
        }
        setLoading(false);
    };

    return (
        <div className="login-page">
            <div className="login-bg-pattern" />
            <div className="login-container">
                <div className="login-card">
                    <div className="login-logo-section">
                        <div className="login-logo">RentFlow</div>
                        <p className="login-logo-subtitle">Account Recovery</p>
                    </div>

                    <h1>Forgot Password?</h1>
                    <p className="login-subtitle">
                        Enter your email and we'll send you a link to reset your password.
                    </p>

                    {message ? (
                        <div className="text-center">
                            <div className="login-success-message mb-6">
                                {message}
                            </div>
                            <button 
                                onClick={() => navigate('/login')}
                                className="login-button bg-surface-light hover:bg-surface border-border"
                            >
                                Return to Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="login-form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="login-input"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="login-button"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                            
                            <div className="text-center mt-6">
                                <Link to="/login" className="text-accent hover:text-white transition-colors text-sm">
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
