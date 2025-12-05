'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
// import { useRouter } from 'next/navigation'; // Não vamos usar router aqui
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    // const router = useRouter(); 

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                alert("Erro: " + error.message);
                setLoading(false);
            } else {
                // CORREÇÃO: Força um recarregamento total para a Home
                // Isso evita o "congelamento" e garante que o AuthContext atualize
                window.location.href = '/';
            }
        } catch (err) {
            console.error(err);
            alert("Ocorreu um erro inesperado.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-stone-50 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-stone-100 animate-fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-green-900 mb-2">Bem-vindo(a)</h1>
                    <p className="text-stone-500">Acesse sua conta Rio Verde</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">E-mail</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
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

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-900 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <>Entrar <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-stone-500">
                    Ainda não tem conta?{' '}
                    <Link href="/cadastro" className="text-green-700 font-bold hover:underline">
                        Criar conta grátis
                    </Link>
                </p>
            </div>
        </div>
    );
}