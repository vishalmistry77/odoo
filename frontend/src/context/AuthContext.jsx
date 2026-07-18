import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // In a real app, you'd verify the token with the backend
            // and maybe fetch user details. For now, we'll just mock it.
            const savedUser = JSON.parse(localStorage.getItem('user'));
            if (savedUser) {
                setUser(savedUser);
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const payload = { email: (email || '').trim(), password: password ?? '' };
            const response = await axios.post('http://localhost:5000/api/auth/login', payload);
            const data = response?.data?.data ?? response?.data;
            const user = data?.user;
            const token = data?.token;
            if (!user || !token) {
                return { success: false, message: 'Invalid response from server' };
            }
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Login failed';
            return { success: false, message: msg };
        }
    };

    const signup = async (userData) => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/signup', userData);
            if (!response.data?.success) {
                return { success: false, message: response.data?.message || 'Signup failed' };
            }
            const couponApplied = response.data?.data?.couponApplied === true;
            return { success: true, couponApplied };
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Signup failed. Check your connection and that the server is running.';
            return { success: false, message: msg };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser(prev => {
            const updated = { ...prev, ...userData };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
