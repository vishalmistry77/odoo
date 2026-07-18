import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [cartLoading, setCartLoading] = useState(false);
    const [rentalPeriod, setRentalPeriod] = useState({
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: ''
    });

    const hasToken = () => !!localStorage.getItem('token');

    const fetchCart = useCallback(async () => {
        if (!hasToken()) {
            setCart(null);
            return;
        }
        setCartLoading(true);
        try {
            const res = await api.get('/cart');
            if (res.data?.success && res.data?.data) {
                setCart(res.data.data);
            } else {
                setCart(null);
            }
        } catch {
            setCart(null);
        } finally {
            setCartLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const cartItems = cart?.items?.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        selectedVariants: item.selectedVariants || {},
        startDate: item.startDate,
        endDate: item.endDate,
        name: item.product?.name,
        price: item.product?.price,
        imageUrl: item.product?.imageUrl,
        durationType: item.product?.durationType,
        product: item.product,
    })) || [];

    const addToCart = async (productOrId, quantity = 1, selectedVariants = {}, startDate = null, endDate = null) => {
        const productId = typeof productOrId === 'object' && productOrId?.id
            ? productOrId.id
            : productOrId;
        const qty = typeof productOrId === 'object' && typeof productOrId?.quantity === 'number'
            ? productOrId.quantity
            : quantity;
        const variants = typeof productOrId === 'object' && productOrId?.selectedVariants
            ? productOrId.selectedVariants
            : selectedVariants;

        if (!hasToken()) {
            return { success: false, message: 'Please sign in to add to cart' };
        }
        try {
            const res = await api.post('/cart/add', {
                productId,
                quantity: qty,
                selectedVariants: variants && Object.keys(variants).length ? variants : {},
                startDate,
                endDate
            });
            if (res.data?.success && res.data?.data) setCart(res.data.data);
            return { success: true, data: res.data?.data };
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to add to cart';
            return { success: false, message: msg };
        }
    };

    const updateQuantity = async (itemId, changeOrValue) => {
        if (!hasToken()) return;
        const item = cartItems.find((i) => i.id === itemId);
        if (!item) return;
        const newQty = typeof changeOrValue === 'number' && changeOrValue >= 0
            ? changeOrValue
            : Math.max(0, item.quantity + (changeOrValue || 0));
        try {
            const res = await api.patch(`/cart/item/${itemId}`, { quantity: newQty });
            if (res.data?.success && res.data?.data) setCart(res.data.data);
        } catch (err) {
            console.error(err.response?.data?.message || err.message);
        }
    };

    const removeFromCart = async (itemId) => {
        if (!hasToken()) return;
        try {
            const res = await api.delete(`/cart/item/${itemId}`);
            if (res.data?.success && res.data?.data) setCart(res.data.data);
        } catch (err) {
            console.error(err.response?.data?.message || err.message);
        }
    };

    const clearCart = async () => {
        // If we want to clear backend cart via this method? 
        // Usually order creation does it. But for frontend state reset:
        setCart(null);
        // If we also wanted to clear backend:
        // if (hasToken()) await api.delete('/cart'); 
    };

    const applyCoupon = async (code) => {
        if (!hasToken()) return { success: false, message: 'Please sign in' };
        try {
            const res = await api.post('/cart/apply-coupon', { code: (code || '').trim() });
            if (res.data?.success && res.data?.data) {
                setCart(res.data.data);
                return { success: true, data: res.data.data };
            }
            return { success: false, message: res.data?.message || 'Invalid coupon' };
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Invalid or expired coupon';
            return { success: false, message: msg };
        }
    };

    const getCartCount = () => cartItems.reduce((total, item) => total + item.quantity, 0);

    const getCartTotal = () => {
        if (cart?.total != null) return Number(cart.total);
        return cartItems.reduce((sum, i) => sum + (Number(i.price) || 0) * (i.quantity || 0), 0);
    };

    const getSubtotal = () => {
        if (cart?.subtotal != null) return Number(cart.subtotal);
        return cartItems.reduce((sum, i) => sum + (Number(i.price) || 0) * (i.quantity || 0), 0);
    };

    const getDiscount = () => ({
        percent: cart?.discountPercent ?? 0,
        amount: cart?.discountAmount ?? 0,
    });

    return (
        <CartContext.Provider
            value={{
                cart,
                cartItems,
                cartLoading,
                fetchCart,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
                applyCoupon,
                getCartCount,
                getCartTotal,
                getSubtotal,
                getSubtotal,
                getDiscount,
                rentalPeriod,
                setRentalPeriod,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
