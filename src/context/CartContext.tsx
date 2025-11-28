'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Product, ProductColor } from '@/lib/types';

interface CartContextType {
    cart: CartItem[];
    isCartOpen: boolean;
    addToCart: (product: Product, quantity: number, color: ProductColor) => void;
    removeFromCart: (index: number) => void;
    toggleCart: () => void;
    cartTotal: number;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ESTE É O CARTPROVIDER QUE ESTAVA FALTANDO
export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const addToCart = (product: Product, quantity: number, color: ProductColor) => {
        setCart([...cart, { ...product, quantity, selectedColor: color }]);
        setIsCartOpen(true); // Abre o carrinho automaticamente
    };

    const removeFromCart = (index: number) => {
        setCart(cart.filter((_, idx) => idx !== index));
    };

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    // Calcula o total
    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const cartCount = cart.length;

    return (
        <CartContext.Provider value={{ cart, isCartOpen, addToCart, removeFromCart, toggleCart, cartTotal, cartCount }}>
            {children}
        </CartContext.Provider>
    );
}

// Hook para usar o carrinho nos componentes
export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}