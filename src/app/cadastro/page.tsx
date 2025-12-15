'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { createProfile } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, Phone, FileText, Loader2, Scissors, Building2, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', cpf: '', cnpj: '', phone: '', role: 'customer',
        zipCode: '', street: '', number: '', complement: '', district: '', city: '', state: ''
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleBlurCep = async () => {
        const cleanCep = formData.zipCode.replace(/\D/g, '');
        if (cleanCep.length >= 8) {
            try {
                const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                const data = await res.json();
                if (!data.erro) {
                    setFormData(prev => ({
                        ...prev,
                        street: data.logradouro,
                        district: data.bairro,
                        city: data.localidade,
                        state: data.uf
                    }));
                }
            } catch (error) {
                console.error("Erro ao buscar CEP");
            }
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
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
                name: formData.name, email: formData.email, cpf: formData.cpf, phone: formData.phone,
                role: formData.role, cnpj: formData.role === 'upholsterer' ? formData.cnpj : undefined,
                zipCode: formData.zipCode, street: formData.street, number: formData.number,
                complement: formData.complement, district: formData.district, city: formData.city, state: formData.state
            });

            alert(formData.role === 'upholsterer' ? "Cadastro em análise!" : "Conta criada com sucesso!");
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
        <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4 py-12">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl border border-stone-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-green-900 mb-2">Criar Conta</h1>
                    <p className="text-stone-500">Preencha seus dados e endereço de entrega</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 p-4 bg-stone-50 rounded-xl border border-stone-200 mb-2">
                            <label className="block text-sm font-bold text-stone-700 mb-2">Tipo de Conta</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="role" value="customer" checked={formData.role === 'customer'} onChange={handleChange} className="accent-green-800 w-5 h-5" /><span className="text-sm">Cliente</span></label>
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="role" value="upholsterer" checked={formData.role === 'upholsterer'} onChange={handleChange} className="accent-green-800 w-5 h-5" /><span className="text-sm font-bold text-green-800 flex items-center gap-1"><Scissors size={14} /> Estofador</span></label>
                            </div>
                        </div>
                        <div><label className="text-sm font-medium text-stone-700">Nome</label><input name="name" type="text" onChange={handleChange} className="w-full p-2.5 border rounded-xl" required /></div>
                        <div><label className="text-sm font-medium text-stone-700">Telefone</label><input name="phone" type="text" onChange={handleChange} className="w-full p-2.5 border rounded-xl" required /></div>
                        <div><label className="text-sm font-medium text-stone-700">CPF</label><input name="cpf" type="text" onChange={handleChange} className="w-full p-2.5 border rounded-xl" required /></div>
                        {formData.role === 'upholsterer' && <div><label className="text-sm font-bold text-green-800">CNPJ</label><input name="cnpj" type="text" onChange={handleChange} className="w-full p-2.5 border-2 border-green-100 rounded-xl" required /></div>}
                    </div>

                    <hr className="border-stone-100" />

                    <div>
                        <h3 className="text-sm font-bold text-stone-800 mb-3 flex items-center gap-2"><MapPin size={16} /> Endereço</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><input name="zipCode" type="text" placeholder="CEP" onBlur={handleBlurCep} onChange={handleChange} className="w-full p-2.5 border rounded-xl" required /></div>
                            <div className="md:col-span-2"><input name="street" type="text" placeholder="Rua / Avenida" value={formData.street} onChange={handleChange} className="w-full p-2.5 border rounded-xl" required /></div>
                            <div><input name="number" type="text" placeholder="Número" onChange={handleChange} className="w-full p-2.5 border rounded-xl" required /></div>
                            <div className="md:col-span-2"><input name="complement" type="text" placeholder="Complemento" onChange={handleChange} className="w-full p-2.5 border rounded-xl" /></div>
                            <div><input name="district" type="text" placeholder="Bairro" value={formData.district} onChange={handleChange} className="w-full p-2.5 border rounded-xl" required /></div>
                            <div><input name="city" type="text" placeholder="Cidade" value={formData.city} onChange={handleChange} className="w-full p-2.5 border rounded-xl" required /></div>
                            <div><input name="state" type="text" placeholder="UF" value={formData.state} onChange={handleChange} className="w-full p-2.5 border rounded-xl" required maxLength={2} /></div>
                        </div>
                    </div>

                    <hr className="border-stone-100" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium text-stone-700">E-mail</label><input name="email" type="email" onChange={handleChange} className="w-full p-2.5 border rounded-xl" required /></div>
                        <div><label className="text-sm font-medium text-stone-700">Senha</label><input name="password" type="password" onChange={handleChange} className="w-full p-2.5 border rounded-xl" required minLength={6} /></div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-green-800 text-white py-4 rounded-xl font-bold hover:bg-green-900 transition-all flex justify-center mt-4 shadow-lg">
                        {loading ? <Loader2 className="animate-spin" /> : "Finalizar Cadastro"}
                    </button>
                </form>
                <p className="text-center mt-6 text-sm text-stone-500">Já tem conta? <Link href="/login" className="text-green-700 font-bold hover:underline">Fazer Login</Link></p>
            </div>
        </div>
    );
}