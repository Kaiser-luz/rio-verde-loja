'use client';

import { useState } from 'react';
import { Menu, Search, ShoppingBag, User, X, LogOut, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Header() {
    const { toggleCart, cartCount } = useCart();
    const { user, logout, isLoading } = useAuth(); // Pegamos isLoading também
    const router = useRouter();

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Lógica da Busca
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            setIsSearchOpen(false);
            // Força a navegação para a página de busca
            router.push(`/busca?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-stone-100 transition-all">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="cursor-pointer">
                        <h1 className="text-2xl font-serif font-bold tracking-tight text-green-900">
                            Rio Verde<span className="text-green-600">.</span>
                        </h1>
                    </Link>
                </div>

                {/* Menu Desktop */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
                    <Link href="/" className="hover:text-stone-900">Início</Link>
                    <Link href="/#linho" className="hover:text-stone-900">Tecidos</Link>
                    <Link href="/#espumas" className="hover:text-stone-900">Espumas</Link>
                </nav>

                {/* Ícones */}
                <div className="flex items-center gap-3">
                    {/* 1. Botão de Busca */}
                    <button
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:bg-stone-100'}`}
                    >
                        {isSearchOpen ? <X size={20} /> : <Search size={20} />}
                    </button>

                    {/* 2. Botão de Usuário (Com verificação de carregamento) */}
                    {isLoading ? (
                        <Loader2 size={20} className="animate-spin text-stone-400" />
                    ) : user ? (
                        <div className="relative group">
                            <button className="flex items-center gap-2 pl-2 pr-1 py-1 hover:bg-green-50 rounded-full transition-colors border border-transparent hover:border-green-100">
                                <span className="text-xs font-bold text-green-800 hidden sm:block">Olá, {user.name.split(' ')[0]}</span>
                                <div className="bg-green-100 text-green-700 p-1.5 rounded-full">
                                    <User size={18} />
                                </div>
                            </button>
                            {/* Dropdown Sair */}
                            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-stone-100 p-1 hidden group-hover:block">
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium"
                                >
                                    <LogOut size={14} /> Sair
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link href="/login">
                            <button
                                className="p-2 hover:bg-stone-100 rounded-full text-stone-600 transition-colors"
                                title="Fazer Login"
                            >
                                <User size={20} />
                            </button>
                        </Link>
                    )}

                    {/* 3. Carrinho */}
                    <button
                        className="p-2 hover:bg-stone-100 rounded-full text-stone-900 relative"
                        onClick={toggleCart}
                    >
                        <ShoppingBag size={20} />
                        {cartCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-green-600 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Barra de Busca (Abre ao clicar na lupa) */}
            {isSearchOpen && (
                <div className="absolute top-full left-0 w-full bg-white border-b border-stone-100 p-4 shadow-lg animate-in slide-in-from-top-2">
                    <form onSubmit={handleSearch} className="max-w-3xl mx-auto flex gap-2">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Busque por Linho, Veludo, Cola..."
                            className="flex-1 px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-lg"
                            autoFocus
                        />
                        <button type="submit" className="px-8 py-3 bg-green-800 text-white rounded-xl font-bold hover:bg-green-900 transition-colors">
                            Buscar
                        </button>
                    </form>
                </div>
            )}
        </header>
    );
}