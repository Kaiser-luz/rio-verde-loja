'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserOrders } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { Package, User, ShoppingBag, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function MyAccountPage() {
    const { user, isLoading } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            const fetchData = async () => {
                try {
                    const data = await getUserOrders(user.id);
                    setOrders(data);
                } catch (error) {
                    console.error("Erro ao buscar pedidos:", error);
                } finally {
                    setLoadingOrders(false);
                }
            };
            fetchData();
        }
    }, [user, isLoading, router]);

    // Se estiver carregando o Auth, mostra spinner
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <Loader2 className="animate-spin text-green-800" size={40} />
            </div>
        );
    }

    // Se não tiver usuário (e já carregou), não mostra nada (o useEffect vai redirecionar)
    if (!user) return null;

    return (
        <div className="min-h-screen bg-stone-50 p-6 md:p-12">
            <div className="max-w-5xl mx-auto">

                {/* Cabeçalho */}
                <div className="flex items-center gap-4 mb-10">
                    <div className="bg-white p-4 rounded-full shadow-sm">
                        <User size={32} className="text-green-800" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-stone-900">
                            Olá, {(user as any).user_metadata?.full_name?.split(' ')[0] || 'Cliente'}
                        </h1>
                        <p className="text-stone-500">{user.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="space-y-4">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                            <h3 className="font-bold text-stone-900 mb-4 uppercase text-xs tracking-wider">Menu</h3>
                            <ul className="space-y-2">
                                <li>
                                    <button className="flex items-center gap-3 text-green-700 font-medium bg-green-50 w-full p-3 rounded-lg">
                                        <Package size={18} /> Meus Pedidos
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                            <ShoppingBag className="text-green-600" /> Histórico de Compras
                        </h2>

                        {loadingOrders ? (
                            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-stone-400" /></div>
                        ) : orders.length === 0 ? (
                            <div className="bg-white p-12 rounded-xl border border-stone-200 text-center">
                                <Package size={48} className="mx-auto text-stone-300 mb-4" />
                                <h3 className="text-lg font-medium text-stone-900">Nenhum pedido encontrado</h3>
                                <p className="text-stone-500 mb-6">Você ainda não fez compras conosco.</p>
                                <Link href="/" className="inline-block bg-green-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-900 transition-colors">
                                    Começar a Comprar
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div key={order.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="bg-stone-50 p-4 flex flex-wrap justify-between items-center gap-4 border-b border-stone-100">
                                            <div className="flex gap-6 text-sm">
                                                <div>
                                                    <p className="text-stone-500 text-xs uppercase font-bold">Data</p>
                                                    <p className="font-medium text-stone-900 flex items-center gap-1">
                                                        <Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-stone-500 text-xs uppercase font-bold">Total</p>
                                                    <p className="font-medium text-stone-900">R$ {order.total.toFixed(2)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-stone-500 text-xs uppercase font-bold">Status</p>
                                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${order.status === 'pago' ? 'bg-green-100 text-green-700' :
                                                            order.status === 'cancelado' ? 'bg-red-100 text-red-700' :
                                                                'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-stone-400 font-mono">#{order.id.slice(0, 8)}</div>
                                        </div>

                                        <div className="p-4">
                                            {order.items.map((item: any) => (
                                                <div key={item.id} className="flex justify-between items-center py-2 border-b border-stone-50 last:border-0">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center text-stone-300">
                                                            <Package size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-stone-900">{item.productName}</p>
                                                            <p className="text-xs text-stone-500">Cor: {item.color} | Qtd: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm font-medium text-stone-600">R$ {item.price.toFixed(2)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}