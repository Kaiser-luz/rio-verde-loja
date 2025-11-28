'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define como é um usuário
interface User {
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    login: (name: string, email: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Ao carregar a página, verifica se já tem alguém salvo no navegador
    useEffect(() => {
        const savedUser = localStorage.getItem('rio_verde_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (name: string, email: string) => {
        const newUser = { name, email };
        setUser(newUser);
        localStorage.setItem('rio_verde_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('rio_verde_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}