import { loginAdmin } from '../actions';
import { Lock } from 'lucide-react';

export default function AdminLoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-900 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center">
                <div className="bg-stone-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock size={32} className="text-stone-600" />
                </div>

                <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">Área Restrita</h1>
                <p className="text-stone-500 mb-8 text-sm">Apenas funcionários autorizados.</p>

                <form action={loginAdmin} className="space-y-4">
                    <input
                        type="password"
                        name="password"
                        placeholder="Senha de Acesso"
                        required
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 text-center tracking-widest"
                    />

                    <button
                        type="submit"
                        className="w-full bg-stone-900 text-white py-3 rounded-lg font-bold hover:bg-stone-800 transition-colors"
                    >
                        Entrar no Painel
                    </button>
                </form>
            </div>
        </div>
    );
}