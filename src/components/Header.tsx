'use client';

import { useState } from 'react';
import { Menu, Search, ShoppingBag, User, X, LogOut, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Header() {
    const { toggleCart, cartCount } = useCart();
    const { user, signOut, isLoading } = useAuth();
    const router = useRouter();

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            setIsSearchOpen(false);
            router.push(`/busca?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    // FUNÇÃO DE CORREÇÃO: Pega o nome de forma segura
    const getUserName = () => {
        if (!user) return '';
        const u = user as any; // Ignora erro de tipo
        // Tenta pegar o nome completo dos metadados, ou nome direto, ou email
        const fullName = u.user_metadata?.full_name || u.name || u.email || '';
        // Retorna só o primeiro nome
        return fullName.split(' ')[0];
    };

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-stone-100 transition-all">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-stone-100 rounded-lg lg:hidden">
                        <Menu size={24} />
                    </button>
                    <Link href="/" className="cursor-pointer">
                        <h1 className="text-2xl font-serif font-bold tracking-tight text-green-900">
                            Rio Verde<span className="text-green-600">.</span>
                        </h1>
                    </Link>
                </div>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
                    <Link href="/" className="hover:text-stone-900 transition-colors">Início</Link>
                    <Link href="/#linho" className="hover:text-stone-900 transition-colors">Tecidos</Link>
                    <Link href="/#espumas" className="hover:text-stone-900 transition-colors">Espumas</Link>
                    <Link href="#footer" className="hover:text-stone-900 transition-colors">Contato</Link>
                </nav>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:bg-stone-100'}`}
                    >
                        {isSearchOpen ? <X size={20} /> : <Search size={20} />}
                    </button>

                    {/* ÁREA DE USUÁRIO */}
                    {isLoading ? (
                        <Loader2 size={20} className="animate-spin text-stone-400" />
                    ) : user ? (
                        <div className="relative group">
                            <button className="flex items-center gap-2 pl-2 pr-1 py-1 hover:bg-green-50 rounded-full transition-colors border border-transparent hover:border-green-100">
                                {/* CORREÇÃO AQUI: Usamos a função getUserName() em vez de user.name direto */}
                                <span className="text-xs font-bold text-green-800 hidden sm:block">Olá, {getUserName()}</span>
                                <div className="bg-green-100 text-green-700 p-1.5 rounded-full">
                                    <User size={18} />
                                </div>
                            </button>

                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-stone-100 p-1 hidden group-hover:block animate-in slide-in-from-top-2">
                                <div className="px-3 py-2 border-b border-stone-100 mb-1">
                                    <p className="text-xs text-stone-400">Logado como</p>
                                    <p className="text-xs font-bold truncate">{user.email}</p>
                                </div>
                                <button
                                    onClick={() => { signOut(); router.refresh(); }}
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