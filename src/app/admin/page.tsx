import { prisma } from '@/lib/prisma';
import { createProduct, deleteProduct, createCategory, deleteCategory, updateOrderStatus, getPendingUsers, approveUser, rejectUser } from '@/app/actions';
import { logoutAdmin } from './actions';
import ProductForm from '@/components/ProductForm';
import ExcelManager from '@/components/ExcelManager';
import { Trash2, Package, Layers, ShoppingCart, CheckCircle, Clock, XCircle, LogOut, UserCheck, Check, X } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const productsRaw = await prisma.product.findMany({ orderBy: { id: 'desc' } });

    const products = productsRaw.map((p) => ({
        ...p,
        price: Number(p.price),
        priceUpholsterer: p.priceUpholsterer ? Number(p.priceUpholsterer) : null,
        stock: Number(p.stock),
        colors: p.colors as any,
    }));

    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

    const ordersRaw = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: { items: true }
    });

    const orders = ordersRaw.map((order) => ({
        ...order,
        total: Number(order.total),
        items: order.items.map((item) => ({
            ...item,
            quantity: Number(item.quantity),
            price: Number(item.price),
        })),
    }));

    // NOVO: Busca usuários pendentes
    const pendingUsers = await getPendingUsers();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pago': return 'bg-green-100 text-green-700 border-green-200';
            case 'entregue': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'cancelado': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 p-8">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* CABEÇALHO */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-stone-200 gap-4">
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-stone-900">Painel Administrativo</h1>
                        <p className="text-sm text-stone-500">Gestão Rio Verde</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <ExcelManager products={products} />
                        <div className="h-8 w-px bg-stone-200 mx-2 hidden md:block"></div>
                        <Link href="/" className="text-green-800 hover:underline font-medium text-sm">Ver Loja &rarr;</Link>
                        <form action={logoutAdmin}>
                            <button type="submit" className="flex items-center gap-2 text-stone-500 hover:text-red-600 transition-colors text-sm px-3 py-2 rounded-lg hover:bg-stone-100 border border-stone-200"><LogOut size={16} /> Sair</button>
                        </form>
                    </div>
                </div>

                {/* --- NOVO: APROVAÇÃO DE ESTOFADORES --- */}
                {pendingUsers.length > 0 && (
                    <div className="bg-amber-50 rounded-xl border border-amber-200 overflow-hidden shadow-sm animate-in slide-in-from-top-4">
                        <div className="p-4 border-b border-amber-200 bg-amber-100 flex items-center gap-2 text-amber-800">
                            <UserCheck size={20} />
                            <h2 className="font-bold">Aprovar Cadastros ({pendingUsers.length})</h2>
                        </div>
                        <div className="p-4 space-y-2">
                            {pendingUsers.map(user => (
                                <div key={user.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-amber-100 shadow-sm">
                                    <div>
                                        <p className="font-bold text-stone-900">{user.name}</p>
                                        <p className="text-xs text-stone-500">CNPJ: {user.cnpj} | {user.email}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <form action={rejectUser}>
                                            <input type="hidden" name="userId" value={user.userId} />
                                            <button className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-bold">
                                                <X size={14} /> Rejeitar
                                            </button>
                                        </form>
                                        <form action={approveUser}>
                                            <input type="hidden" name="userId" value={user.userId} />
                                            <button className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-bold">
                                                <Check size={14} /> Aprovar
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* PEDIDOS E CADASTROS (Igual antes) */}
                <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                    <div className="p-6 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-stone-800">
                            <ShoppingCart size={20} className="text-blue-600" /> Pedidos Recentes
                        </h2>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">{orders.length}</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-stone-600">
                            <thead className="bg-stone-100 text-stone-800 font-bold uppercase text-xs">
                                <tr>
                                    <th className="p-4">Data</th>
                                    <th className="p-4">Cliente</th>
                                    <th className="p-4">Itens</th>
                                    <th className="p-4">Total</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-stone-50">
                                        <td className="p-4">
                                            <div className="font-bold text-stone-900">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</div>
                                            <div className="text-xs text-stone-400 font-mono">#{order.id.slice(0, 6)}</div>
                                        </td>
                                        <td className="p-4 font-medium">{order.customer || 'Visitante'}</td>
                                        <td className="p-4">
                                            <ul className="text-xs space-y-1 text-stone-500">
                                                {order.items.map((item: any) => (
                                                    <li key={item.id}>{Number(item.quantity)}x {item.productName}</li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td className="p-4 font-bold text-stone-900">R$ {Number(order.total).toFixed(2)}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getStatusColor(order.status)} uppercase`}>{order.status}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-1">
                                                <form action={updateOrderStatus}><input type="hidden" name="id" value={order.id} /><input type="hidden" name="status" value="pago" /><button type="submit" className="p-2 hover:bg-green-100 text-green-600 rounded"><CheckCircle size={18} /></button></form>
                                                <form action={updateOrderStatus}><input type="hidden" name="id" value={order.id} /><input type="hidden" name="status" value="entregue" /><button type="submit" className="p-2 hover:bg-blue-100 text-blue-600 rounded"><Clock size={18} /></button></form>
                                                <form action={updateOrderStatus}><input type="hidden" name="id" value={order.id} /><input type="hidden" name="status" value="cancelado" /><button type="submit" className="p-2 hover:bg-red-100 text-red-600 rounded"><XCircle size={18} /></button></form>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-stone-800"><Layers size={20} className="text-amber-600" /> Nova Seção</h2>
                            <form action={createCategory} className="space-y-4">
                                <input name="name" type="text" placeholder="Ex: Natal..." required className="w-full p-2 border border-stone-300 rounded-lg text-sm" />
                                <select name="type" className="w-full p-2 border border-stone-300 rounded-lg text-sm"><option value="meter">Metro</option><option value="unit">Unidade</option></select>
                                <button type="submit" className="w-full bg-amber-600 text-white py-2 rounded-lg font-bold text-sm">Criar</button>
                            </form>
                            <div className="mt-6 border-t pt-4">
                                <ul className="space-y-2">
                                    {categories.map(cat => (
                                        <li key={cat.id} className="flex justify-between items-center text-sm bg-stone-50 p-2 rounded">
                                            <span>{cat.name}</span>
                                            <form action={deleteCategory}><input type="hidden" name="id" value={cat.id} /><button className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button></form>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <ProductForm categories={categories as any} />
                    </div>
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden h-fit">
                        <div className="p-6 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Package size={20} className="text-stone-600" /> Estoque
                            </h2>
                            <span className="bg-stone-200 text-stone-700 px-3 py-1 rounded-full text-xs font-bold">{products.length} itens</span>
                        </div>
                        <div className="overflow-x-auto max-h-[600px]">
                            <table className="w-full text-left text-sm text-stone-600">
                                <thead className="bg-stone-100 text-stone-800 font-bold sticky top-0"><tr><th className="p-4">Produto</th><th className="p-4">Seção</th><th className="p-4">Preço</th><th className="p-4 text-center">Ação</th></tr></thead>
                                <tbody className="divide-y divide-stone-100">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-stone-50">
                                            <td className="p-4 font-medium text-stone-900">{product.name}</td>
                                            <td className="p-4 capitalize"><span className="bg-stone-100 px-2 py-1 rounded text-xs">{categories.find(c => c.id === product.category)?.name || product.category}</span></td>
                                            <td className="p-4">R$ {Number(product.price).toFixed(2)}</td>
                                            <td className="p-4 text-center"><form action={deleteProduct}><input type="hidden" name="id" value={product.id} /><button type="submit" className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button></form></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}