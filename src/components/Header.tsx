'use client';

import { useState } from 'react';
import { Search, ShoppingBag, User, X, LogOut, Loader2 } from 'lucide-react';
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

    // Função melhorada para pegar o nome
    const getUserName = () => {
        if (!user) return '';
        
        // Tenta pegar do metadata (se salvo no cadastro)
        const metadata = user.user_metadata || {};
        const fullName = metadata.full_name || metadata.name || '';
        
        if (fullName) {
            return fullName.split(' ')[0]; // Retorna o primeiro nome
        }

        // Se não tiver nome, pega a parte do email antes do @ e capitaliza
        const emailName = user.email?.split('@')[0] || 'Cliente';
        return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    };

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-stone-100 transition-all">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="cursor-pointer">
                        <h1 className="text-2xl font-serif font-bold tracking-tight text-green-900">
                            Rio Verde<span className="text-green-600">.</span>
                        </h1>
                    </Link>
                </div>

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
                            <button className="flex items-center gap-2 pl-3 pr-1 py-1.5 hover:bg-green-50 rounded-full transition-all border border-transparent hover:border-green-100 group-hover:bg-green-50">
                                <span className="text-sm font-bold text-green-900 hidden sm:block">
                                    Olá, {getUserName()}
                                </span>
                                <div className="bg-green-100 text-green-800 p-1.5 rounded-full ring-2 ring-white">
                                    <User size={18} />
                                </div>
                            </button>

                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-100 p-1 hidden group-hover:block animate-in slide-in-from-top-2 z-50">
                                <div className="px-4 py-3 border-b border-stone-50 mb-1 bg-stone-50/50 rounded-t-lg">
                                    <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Conta Conectada</p>
                                    <p className="text-sm font-bold text-stone-900 truncate">{user.email}</p>
                                </div>
                                <div className="p-1">
                                    <Link href="/minha-conta" className="flex items-center gap-3 px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 rounded-lg transition-colors font-medium">
                                        <User size={16} className="text-stone-400" /> Meu Perfil
                                    </Link>
                                    {/* Adicionei um link para meus pedidos se quiser no futuro */}
                                    {/* <Link href="/meus-pedidos" className="flex items-center gap-3 px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 rounded-lg transition-colors font-medium">
                                        <ShoppingBag size={16} className="text-stone-400" /> Meus Pedidos
                                    </Link> */}
                                </div>
                                <div className="border-t border-stone-100 mt-1 p-1">
                                    <button
                                        onClick={() => { signOut(); router.refresh(); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                                    >
                                        <LogOut size={16} /> Sair da Conta
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Link href="/login">
                            <button
                                className="flex items-center gap-2 px-4 py-2 hover:bg-stone-100 rounded-full text-stone-900 font-medium text-sm transition-colors"
                                title="Fazer Login"
                            >
                                <User size={20} className="text-stone-600" />
                                <span className="hidden sm:inline">Entrar</span>
                            </button>
                        </Link>
                    )}

                    <button
                        className="p-2 hover:bg-stone-100 rounded-full text-stone-900 relative transition-colors"
                        onClick={toggleCart}
                    >
                        <ShoppingBag size={20} />
                        {cartCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-600 text-white text-[10px] flex items-center justify-center rounded-full font-bold shadow-sm ring-2 ring-white">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {isSearchOpen && (
                <div className="absolute top-full left-0 w-full bg-white border-b border-stone-100 p-4 shadow-lg animate-in slide-in-from-top-2">
                    <form onSubmit={handleSearch} className="max-w-3xl mx-auto flex gap-2">
                        <div className="relative flex-1">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="O que você procura hoje?"
                                className="w-full pl-12 pr-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 text-base"
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="px-8 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-green-800 transition-colors shadow-lg">
                            Buscar
                        </button>
                    </form>
                </div>
            )}
        </header>
    );
}