import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState(() => {
        const saved = localStorage.getItem('wishlist');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const toggleWishlist = (productId) => {
        setWishlist((prev) => {
            if (prev.includes(productId)) {
                return prev.filter((id) => id !== productId);
            } else {
                return [...prev, productId];
            }
        });
    };

    const isInWishlist = (productId) => wishlist.includes(productId);

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
