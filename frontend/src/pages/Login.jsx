import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const successMessage = location.state?.message;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!formData.email || !formData.password) {
            setErrors({ server: 'Email and password are required' });
            return;
        }

        setLoading(true);
        const result = await login(formData.email, formData.password);
        setLoading(false);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setErrors({ server: result.message });
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg-pattern" />

            <div className="login-container">
                <div className="login-card">
                    <div className="login-logo-section">
                        <div className="login-logo">RentFlow</div>
                        <p className="login-logo-subtitle">Professional Equipment Rental</p>
                    </div>

                    <h1>Welcome Back</h1>
                    <p className="login-subtitle">Sign in to access your rental dashboard</p>

                    {successMessage && (
                        <div className="login-success-message">{successMessage}</div>
                    )}
                    {errors.server && (
                        <div className="login-error-message">{errors.server}</div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="login-form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="login-input"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="login-form-group">
                            <label htmlFor="password">Password</label>
                            <div className="login-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    className="login-input"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="login-password-toggle"
                                    onClick={() => setShowPassword((s) => !s)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <div className="login-form-options">
                            <div className="login-checkbox-wrapper">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    name="remember"
                                    checked={formData.remember}
                                    onChange={handleChange}
                                />
                                <label htmlFor="remember">Remember me</label>
                            </div>
                            <Link to="/forgot-password" className="login-forgot-link">
                                Forgot Password?
                            </Link>
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="login-signup-link">
                        Don&apos;t have an account? <Link to="/signup">Sign up for free</Link>
                    </p>
                </div>

                <div className="login-back-home">
                    <Link to="/">← Back to Home</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
