'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { User, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email) return;

        // Realiza o login e redireciona para a Home
        login(name, email);
        router.push('/');
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-stone-50 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-stone-100 animate-fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-green-900 mb-2">Bem-vindo(a)</h1>
                    <p className="text-stone-500">Entre para gerenciar seus pedidos</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Seu Nome</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                placeholder="Ex: Maria Silva"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">E-mail</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                placeholder="seu@email.com"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-900 transition-all flex items-center justify-center gap-2 group"
                    >
                        Entrar
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-stone-400">
                    Esta é uma demonstração. Não usamos senha real.
                </p>
            </div>
        </div>
    );
}