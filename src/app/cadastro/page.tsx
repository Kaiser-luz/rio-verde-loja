'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { createProfile } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, Phone, FileText, Loader2, Scissors, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        cpf: '',
        cnpj: '', // Novo campo
        phone: '',
        role: 'customer'
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validação extra para estofador
        if (formData.role === 'upholsterer' && !formData.cnpj) {
            alert("Estofadores precisam informar o CNPJ.");
            return;
        }

        setLoading(true);

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("Erro ao criar usuário.");

            await createProfile({
                userId: authData.user.id,
                name: formData.name,
                email: formData.email,
                cpf: formData.cpf,
                phone: formData.phone,
                role: formData.role,
                cnpj: formData.role === 'upholsterer' ? formData.cnpj : undefined
            });

            if (formData.role === 'upholsterer') {
                alert("Cadastro realizado! Sua conta de Estofador passará por análise. Entraremos em contato.");
            } else {
                alert("Conta criada com sucesso!");
            }

            router.push('/');
            router.refresh();

        } catch (err: any) {
            console.error(err);
            alert("Erro: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-stone-50 px-4 py-12">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-stone-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-green-900 mb-2">Criar Conta</h1>
                    <p className="text-stone-500">Junte-se à Rio Verde</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">

                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                        <label className="block text-sm font-bold text-stone-700 mb-2">Tipo de Conta</label>
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="role"
                                    value="customer"
                                    checked={formData.role === 'customer'}
                                    onChange={handleChange}
                                    className="accent-green-800 w-5 h-5"
                                />
                                <span className="text-sm">Cliente Normal (Compra Imediata)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="role"
                                    value="upholsterer"
                                    checked={formData.role === 'upholsterer'}
                                    onChange={handleChange}
                                    className="accent-green-800 w-5 h-5"
                                />
                                <span className="text-sm font-bold text-green-800 flex items-center gap-1">
                                    <Scissors size={14} /> Estofador (Requer CNPJ e Aprovação)
                                </span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-stone-700">Nome Completo</label>
                        <div className="relative mt-1">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                            <input name="name" type="text" onChange={handleChange} className="w-full pl-10 p-3 border rounded-xl" required />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-stone-700">CPF</label>
                        <div className="relative mt-1">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                            <input name="cpf" type="text" placeholder="000.000.000-00" onChange={handleChange} className="w-full pl-10 p-3 border rounded-xl" required />
                        </div>
                    </div>

                    {/* CAMPO CONDICIONAL: SÓ APARECE SE FOR ESTOFADOR */}
                    {formData.role === 'upholsterer' && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="text-sm font-bold text-green-800">CNPJ da Tapeçaria</label>
                            <div className="relative mt-1">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" size={20} />
                                <input name="cnpj" type="text" placeholder="00.000.000/0001-00" onChange={handleChange} className="w-full pl-10 p-3 border-2 border-green-100 rounded-xl focus:border-green-500" required />
                            </div>
                            <p className="text-xs text-stone-500 mt-1">Necessário para liberar descontos.</p>
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-medium text-stone-700">Telefone</label>
                        <div className="relative mt-1">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                            <input name="phone" type="text" onChange={handleChange} className="w-full pl-10 p-3 border rounded-xl" required />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-stone-700">E-mail</label>
                        <div className="relative mt-1">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                            <input name="email" type="email" onChange={handleChange} className="w-full pl-10 p-3 border rounded-xl" required />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-stone-700">Senha</label>
                        <div className="relative mt-1">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                            <input name="password" type="password" onChange={handleChange} className="w-full pl-10 p-3 border rounded-xl" required minLength={6} />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-green-800 text-white py-4 rounded-xl font-bold hover:bg-green-900 transition-all flex justify-center mt-6">
                        {loading ? <Loader2 className="animate-spin" /> : "Finalizar Cadastro"}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-stone-500">
                    Já tem conta? <Link href="/login" className="text-green-700 font-bold hover:underline">Fazer Login</Link>
                </p>
            </div>
        </div>
    );
}