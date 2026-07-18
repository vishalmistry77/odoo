import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './Login.css'; // Reuse Login styles for consistency

const ResetPassword = () => {
    // Component for handling password reset
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!token) {
            setError('Invalid or missing token');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
                token,
                password,
            });
            setMessage(response.data.message);
            setTimeout(() => {
                navigate('/login', { state: { message: 'Password reset successful! Please login.' } });
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        }
        setLoading(false);
    };

    if (!token) {
        return (
            <div className="login-page">
                <div className="login-bg-pattern" />
                <div className="login-container">
                    <div className="login-card">
                        <div className="login-logo-section">
                            <div className="login-logo">RentFlow</div>
                        </div>
                        <div className="login-error-message text-center">
                            Invalid or missing reset token.
                        </div>
                        <div className="text-center mt-4">
                            <button onClick={() => navigate('/login')} className="text-accent hover:text-white transition-colors">
                                Return to Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-bg-pattern" />
            <div className="login-container">
                <div className="login-card">
                    <div className="login-logo-section">
                        <div className="login-logo">RentFlow</div>
                        <p className="login-logo-subtitle">Secure Password Reset</p>
                    </div>

                    <h1>Reset Password</h1>
                    <p className="login-subtitle">Enter your new password below</p>

                    {message && (
                        <div className="login-success-message">{message}</div>
                    )}

                    {error && (
                        <div className="login-error-message">{error}</div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="login-form-group">
                            <label htmlFor="password">New Password</label>
                            <div className="login-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    className="login-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    className="login-password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        <div className="login-form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="login-input-wrapper">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    className="login-input"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="Confirm new password"
                                />
                                <button
                                    type="button"
                                    className="login-password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="login-button"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
