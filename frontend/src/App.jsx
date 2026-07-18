import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SearchProvider } from './context/SearchContext';
import { WishlistProvider } from './context/WishlistContext';
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Cart from './pages/Cart';
import ProductDetail from './pages/ProductDetail';
import Address from './pages/Address';
import Payment from './pages/Payment';
import OrderSuccess from './pages/OrderSuccess';
import Terms from './pages/Terms';
import About from './pages/About';
import Contact from './pages/Contact';
import VendorOrders from './pages/VendorOrders';
import VendorProfile from './pages/VendorProfile';
import VendorNewOrder from './pages/VendorNewOrder';
import VendorInvoice from './pages/VendorInvoice';
import VendorProduct from './pages/VendorProduct';
import { lazy, Suspense } from 'react';
const VendorReports = lazy(() => import('./pages/VendorReports'));
const VendorSettings = lazy(() => import('./pages/VendorSettings'));
const VendorProducts = lazy(() => import('./pages/VendorProducts'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminReports = lazy(() => import('./pages/AdminReports'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerOrders from './pages/customer/CustomerOrders';
import CustomerOrderDetail from './pages/customer/CustomerOrderDetail';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;

    // Debug log with stringified user to avoid [Object object] in console
    console.log(`ProtectedRoute: Path=${window.location.pathname}, Role=${user?.role}, Required=${requiredRole}`);

    if (!user) {
        console.log("ProtectedRoute: No user found, redirecting to login.");
        return <Navigate to="/" replace />;
    }

    // Case-insensitive role check
    if (requiredRole && user.role?.toUpperCase() !== requiredRole?.toUpperCase()) {
        console.log(`ProtectedRoute: Role mismatch. Got ${user.role}, Need ${requiredRole}`);
        // Redirect based on role if they try to access unauthorized page
        if (user.role === 'VENDOR') return <Navigate to="/vendor/dashboard" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

const DashboardRouter = () => {
    const { user } = useAuth();
    if (user?.role === 'ADMIN') return <AdminDashboard />;
    if (user?.role === 'VENDOR') return <VendorDashboard />;
    return <Dashboard />;
};

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <SearchProvider>
                    <WishlistProvider>
                        <div className="w-full min-h-screen bg-gray-50 flex flex-col">
                            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                                <Routes>
                                    <Route path="/" element={<Login />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/signup" element={<Signup />} />
                                    <Route path="/forgot-password" element={<ForgotPassword />} />
                                    <Route path="/reset-password" element={<ResetPassword />} />
                                    <Route
                                        path="/cart"
                                        element={
                                            <ProtectedRoute>
                                                <Cart />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/address"
                                        element={
                                            <ProtectedRoute>
                                                <Address />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/payment"
                                        element={
                                            <ProtectedRoute>
                                                <Payment />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/payment/:orderId"
                                        element={
                                            <ProtectedRoute>
                                                <Payment />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/order-success"
                                        element={
                                            <ProtectedRoute>
                                                <OrderSuccess />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/terms"
                                        element={
                                            <ProtectedRoute>
                                                <Terms />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/about"
                                        element={
                                            <ProtectedRoute>
                                                <About />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/contact"
                                        element={
                                            <ProtectedRoute>
                                                <Contact />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/product/:id"
                                        element={
                                            <ProtectedRoute>
                                                <ProductDetail />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/dashboard"
                                        element={
                                            <ProtectedRoute>
                                                <DashboardRouter />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Customer Routes */}
                                    <Route
                                        path="/customer/dashboard"
                                        element={
                                            <ProtectedRoute>
                                                <CustomerDashboard />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/customer/orders"
                                        element={
                                            <ProtectedRoute>
                                                <CustomerOrders />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/customer/orders/:id"
                                        element={
                                            <ProtectedRoute>
                                                <CustomerOrderDetail />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Vendor Routes */}
                                    <Route
                                        path="/vendor/dashboard"
                                        element={
                                            <ProtectedRoute>
                                                <VendorDashboard />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/vendor/orders"
                                        element={
                                            <ProtectedRoute>
                                                <VendorOrders />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/vendor/profile"
                                        element={
                                            <ProtectedRoute>
                                                <VendorProfile />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/vendor/orders/new"
                                        element={
                                            <ProtectedRoute>
                                                <VendorNewOrder />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/vendor/invoice/:id"
                                        element={
                                            <ProtectedRoute>
                                                <VendorInvoice />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/vendor/products"
                                        element={
                                            <ProtectedRoute>
                                                <VendorProducts />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/vendor/products/new"
                                        element={
                                            <ProtectedRoute>
                                                <VendorProduct />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/vendor/products/:id"
                                        element={
                                            <ProtectedRoute>
                                                <VendorProduct />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/vendor/reports"
                                        element={
                                            <ProtectedRoute>
                                                <VendorReports />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/vendor/settings"
                                        element={
                                            <ProtectedRoute>
                                                <VendorSettings />
                                            </ProtectedRoute>
                                        }
                                    />
                                    {/* Admin Routes */}
                                    <Route
                                        path="/admin/dashboard"
                                        element={
                                            <ProtectedRoute requiredRole="ADMIN">
                                                <AdminDashboard />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/orders"
                                        element={
                                            <ProtectedRoute requiredRole="ADMIN">
                                                <AdminOrders />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/products"
                                        element={
                                            <ProtectedRoute requiredRole="ADMIN">
                                                <AdminProducts />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/users"
                                        element={
                                            <ProtectedRoute requiredRole="ADMIN">
                                                <AdminUsers />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/reports"
                                        element={
                                            <ProtectedRoute requiredRole="ADMIN">
                                                <AdminReports />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/settings"
                                        element={
                                            <ProtectedRoute requiredRole="ADMIN">
                                                <AdminSettings />
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </Suspense>
                        </div>
                    </WishlistProvider>
                </SearchProvider>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
