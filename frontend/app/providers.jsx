'use client';

import { AuthProvider } from '../src/context/AuthContext';
import { CartProvider } from '../src/context/CartContext';
import { SearchProvider } from '../src/context/SearchContext';
import { WishlistProvider } from '../src/context/WishlistContext';

export default function Providers({ children }) {
  return <AuthProvider><CartProvider><SearchProvider><WishlistProvider>{children}</WishlistProvider></SearchProvider></CartProvider></AuthProvider>;
}
