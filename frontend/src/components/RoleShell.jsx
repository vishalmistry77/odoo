import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './RoleShell.css';

const navigation = {
    ADMIN: [
        ['Dashboard', '/admin/dashboard'], ['Users', '/admin/users'], ['Products', '/admin/products'],
        ['Orders', '/admin/orders'], ['Reports', '/admin/reports'], ['Settings', '/admin/settings'],
    ],
    VENDOR: [
        ['Dashboard', '/vendor/dashboard'], ['Products', '/vendor/products'], ['Orders', '/vendor/orders'],
        ['Reports', '/vendor/reports'], ['Settings', '/vendor/settings'],
    ],
    CUSTOMER: [
        ['Dashboard', '/customer/dashboard'], ['Browse', '/dashboard'], ['My Orders', '/customer/orders'], ['Cart', '/cart'], ['Settings', '/customer/settings'],
    ],
};

const RoleShell = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const role = user?.role?.toUpperCase() || 'CUSTOMER';
    const links = navigation[role] || navigation.CUSTOMER;
    const home = role === 'ADMIN' ? '/admin/dashboard' : role === 'VENDOR' ? '/vendor/dashboard' : '/dashboard';
    const initials = (user?.name || role).split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="role-shell">
            <header className="role-shell-nav">
                <Link to={home} className="role-shell-brand">RentFlow<span>.</span> <small>{role}</small></Link>
                <nav className="role-shell-links" aria-label={`${role.toLowerCase()} navigation`}>
                    {links.map(([label, path]) => (
                        <Link key={path} to={path} className={location.pathname === path ? 'active' : ''}>{label}</Link>
                    ))}
                </nav>
                <button type="button" className="role-shell-account" onClick={handleLogout} title="Sign out">
                    <span className="role-shell-avatar">{initials}</span>
                    <span className="role-shell-account-name">{user?.name || role}</span>
                    <span className="role-shell-signout">Sign out</span>
                </button>
            </header>
            <div className="role-shell-content">{children}</div>
        </div>
    );
};

export default RoleShell;
