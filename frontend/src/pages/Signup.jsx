import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Signup.css';

const COUPON_REGEX = /^[A-Z0-9]+$/;

const Signup = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        companyName: '',
        gstin: '',
        password: '',
        confirmPassword: '',
        role: 'CUSTOMER',
        vendorCategory: '',
        couponCode: '',
        terms: false,
        newsletter: false
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};

        if (!formData.firstName) newErrors.firstName = 'First Name is required';
        if (!formData.lastName) newErrors.lastName = 'Last Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email address';

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{6,12}$/;
        if (!formData.password) newErrors.password = 'Password is required';
        else if (!passwordRegex.test(formData.password)) {
            newErrors.password = 'Password must be 6-12 chars, include uppercase, lowercase, and special character (@, $, &, _)';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (formData.role === 'VENDOR') {
             if (!formData.vendorCategory) {
                newErrors.vendorCategory = 'Vendor category is required';
            }
        }

        if (formData.role === 'CUSTOMER' && formData.couponCode?.trim()) {
            const normalized = formData.couponCode.trim().toUpperCase();
            if (!COUPON_REGEX.test(normalized)) {
                newErrors.couponCode = 'Coupon code must be uppercase letters and numbers (e.g. SAVE10, RENT50)';
            }
        }
        
        if (!formData.terms) {
            newErrors.terms = 'You must agree to the terms';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
        
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleRoleSelect = (role) => {
        setFormData(prev => ({ ...prev, role }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        
        const submissionData = {
            ...formData,
            name: `${formData.firstName} ${formData.lastName}`.trim(),
        };
        if (formData.role === 'CUSTOMER' && formData.couponCode?.trim()) {
            submissionData.couponCode = formData.couponCode.trim().toUpperCase();
        }
        if (formData.role !== 'CUSTOMER') {
            delete submissionData.couponCode;
        }

        const result = await signup(submissionData);
        setLoading(false);

        if (result.success) {
            const message = result.couponApplied
                ? 'Account created. Coupon applied successfully! Please sign in.'
                : 'Account created. Please sign in.';
            navigate('/login', { state: { message, couponApplied: result.couponApplied } });
        } else {
            setErrors({ server: result.message });
        }
    };

    return (
        <div className="signup-body">
            <div className="bg-pattern"></div>

            <div className="register-container">
                <div className="register-card">
                    <div className="logo-section">
                        <div className="logo">RentFlow</div>
                    </div>

                    <h1>Create Your Account</h1>
                    <p className="subtitle">Join thousands of professionals using RentFlow</p>

                    {errors.server && (
                        <div className="server-error">
                            {errors.server}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} id="registerForm">
                        <div className="role-selection">
                            <div className="role-title">I want to:</div>
                            <div className="role-grid">
                                <div 
                                    className={`role-card ${formData.role === 'CUSTOMER' ? 'active' : ''}`}
                                    onClick={() => handleRoleSelect('CUSTOMER')}
                                >
                                    <div className="role-icon">🛒</div>
                                    <div className="role-name">Rent Equipment</div>
                                    <div className="role-desc">Browse and rent products</div>
                                </div>
                                <div 
                                    className={`role-card ${formData.role === 'VENDOR' ? 'active' : ''}`}
                                    onClick={() => handleRoleSelect('VENDOR')}
                                >
                                    <div className="role-icon">🏪</div>
                                    <div className="role-name">List Equipment</div>
                                    <div className="role-desc">Become a vendor</div>
                                </div>
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="firstName">First Name</label>
                                <input 
                                    type="text" 
                                    id="firstName" 
                                    name="firstName" 
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                                {errors.firstName && <div className="error-message">{errors.firstName}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="lastName">Last Name</label>
                                <input 
                                    type="text" 
                                    id="lastName" 
                                    name="lastName" 
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                                {errors.lastName && <div className="error-message">{errors.lastName}</div>}
                            </div>

                            <div className="form-group full-width">
                                <label htmlFor="email">Email Address</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    placeholder="john.doe@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                {errors.email && <div className="error-message">{errors.email}</div>}
                            </div>

                            {formData.role === 'CUSTOMER' && (
                                <div className="form-group full-width">
                                    <label htmlFor="couponCode">Coupon Code (Optional)</label>
                                    <input 
                                        type="text" 
                                        id="couponCode" 
                                        name="couponCode" 
                                        placeholder="e.g. SAVE10, RENT50"
                                        value={formData.couponCode}
                                        onChange={(e) => {
                                            const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                            setFormData(prev => ({ ...prev, couponCode: v }));
                                            if (errors.couponCode) setErrors(prev => ({ ...prev, couponCode: null }));
                                        }}
                                        maxLength={20}
                                    />
                                    {errors.couponCode && <div className="error-message">{errors.couponCode}</div>}
                                </div>
                            )}

                            {formData.role === 'VENDOR' && (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="companyName">Company Name</label>
                                        <input 
                                            type="text" 
                                            id="companyName" 
                                            name="companyName" 
                                            placeholder="Acme Corp"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="gstin">GSTIN (Optional)</label>
                                        <input 
                                            type="text" 
                                            id="gstin" 
                                            name="gstin" 
                                            placeholder="22AAAAA0000A1Z5"
                                            value={formData.gstin}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label htmlFor="vendorCategory">Vendor Category</label>
                                        <select
                                            id="vendorCategory"
                                            name="vendorCategory"
                                            value={formData.vendorCategory}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Category</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Furniture">Furniture</option>
                                            <option value="Vehicles">Vehicles</option>
                                            <option value="Appliances">Appliances</option>
                                        </select>
                                        {errors.vendorCategory && <div className="error-message">{errors.vendorCategory}</div>}
                                    </div>
                                </>
                            )}

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    name="password" 
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                {errors.password && <div className="error-message">{errors.password}</div>}
                                <ul className="password-requirements">
                                    <li>At least 8 characters</li>
                                    <li>Include uppercase and lowercase letters</li>
                                    <li>Include at least one number</li>
                                </ul>
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input 
                                    type="password" 
                                    id="confirmPassword" 
                                    name="confirmPassword" 
                                    placeholder="Re-enter your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                                {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                            </div>
                        </div>

                        <div className="checkbox-group">
                            <input 
                                type="checkbox" 
                                id="terms" 
                                name="terms" 
                                checked={formData.terms}
                                onChange={handleChange}
                            />
                            <label htmlFor="terms">
                                I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                            </label>
                        </div>
                        {errors.terms && <div className="error-message" style={{marginBottom: '1rem'}}>{errors.terms}</div>}

                        <div className="checkbox-group">
                            <input 
                                type="checkbox" 
                                id="newsletter" 
                                name="newsletter" 
                                checked={formData.newsletter}
                                onChange={handleChange}
                            />
                            <label htmlFor="newsletter">
                                Send me updates about new features and products
                            </label>
                        </div>

                        <button type="submit" className="btn" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="login-link">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                </div>

                <div className="back-home">
                    <Link to="/">← Back to Home</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
