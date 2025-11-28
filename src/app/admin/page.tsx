import { prisma } from '@/lib/prisma';
import { createProduct, deleteProduct, createCategory, deleteCategory, updateOrderStatus } from '@/app/actions';
import { logoutAdmin } from './actions'; // Importa a função de sair
import ProductForm from '@/components/ProductForm';
import { Trash2, Package, Layers, ShoppingCart, CheckCircle, Clock, XCircle, LogOut } from 'lucide-react';
import Link from 'next/link';

export default async function AdminPage() {
    // 1. Buscas no Banco de Dados
    const products = await prisma.product.findMany({ orderBy: { id: 'desc' } });
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: { items: true }
    });

    // Função auxiliar de cores
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
                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-stone-200">
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-stone-900">Painel Administrativo</h1>
                        <p className="text-sm text-stone-500">Gerencie o estoque da Rio Verde</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-green-800 hover:underline font-medium text-sm">
                            Ver Loja &rarr;
                        </Link>

                        {/* BOTÃO DE SAIR (LOGOUT) */}
                        <form action={logoutAdmin}>
                            <button type="submit" className="flex items-center gap-2 text-stone-500 hover:text-red-600 transition-colors text-sm px-3 py-2 rounded-lg hover:bg-stone-100 border border-stone-200">
                                <LogOut size={16} /> Sair
                            </button>
                        </form>
                    </div>
                </div>

                {/* --- SEÇÃO 1: PEDIDOS --- */}
                <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                    <div className="p-6 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-stone-800">
                            <ShoppingCart size={20} className="text-blue-600" /> Últimos Pedidos
                        </h2>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
                            {orders.length} pedidos
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-stone-600">
                            <thead className="bg-stone-100 text-stone-800 font-bold uppercase text-xs">
                                <tr>
                                    <th className="p-4">Data/ID</th>
                                    <th className="p-4">Cliente</th>
                                    <th className="p-4">Itens</th>
                                    <th className="p-4">Total</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-stone-900">
                                                {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                            </div>
                                            <div className="text-xs text-stone-400 font-mono">#{order.id.slice(0, 8)}</div>
                                        </td>
                                        <td className="p-4 font-medium">{order.customer || 'Visitante'}</td>
                                        <td className="p-4">
                                            <ul className="text-xs space-y-1 text-stone-500">
                                                {order.items.map((item: any) => (
                                                    <li key={item.id}>
                                                        • {Number(item.quantity)}x {item.productName}
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td className="p-4 font-bold text-stone-900">
                                            R$ {Number(order.total).toFixed(2)}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getStatusColor(order.status)} uppercase`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-1">

                                                <form action={updateOrderStatus}>
                                                    <input type="hidden" name="id" value={order.id} />
                                                    <input type="hidden" name="status" value="pago" />
                                                    <button type="submit" title="Marcar Pago" className="p-2 hover:bg-green-100 text-green-600 rounded border border-transparent hover:border-green-200 transition-colors">
                                                        <CheckCircle size={18} />
                                                    </button>
                                                </form>

                                                <form action={updateOrderStatus}>
                                                    <input type="hidden" name="id" value={order.id} />
                                                    <input type="hidden" name="status" value="entregue" />
                                                    <button type="submit" title="Marcar Entregue" className="p-2 hover:bg-blue-100 text-blue-600 rounded border border-transparent hover:border-blue-200 transition-colors">
                                                        <Clock size={18} />
                                                    </button>
                                                </form>

                                                <form action={updateOrderStatus}>
                                                    <input type="hidden" name="id" value={order.id} />
                                                    <input type="hidden" name="status" value="cancelado" />
                                                    <button type="submit" title="Cancelar Pedido" className="p-2 hover:bg-red-100 text-red-600 rounded border border-transparent hover:border-red-200 transition-colors">
                                                        <XCircle size={18} />
                                                    </button>
                                                </form>

                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr><td colSpan={6} className="p-8 text-center text-stone-400">Nenhum pedido recebido ainda.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- SEÇÃO 2: CADASTROS --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="space-y-8">
                        {/* CADASTRO DE CATEGORIA */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-stone-800">
                                <Layers size={20} className="text-amber-600" /> Nova Seção
                            </h2>
                            <form action={createCategory} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-stone-700">Nome</label>
                                    <input name="name" type="text" placeholder="Ex: Natal..." required className="w-full p-2 border border-stone-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-stone-700">Tipo</label>
                                    <select name="type" className="w-full p-2 border border-stone-300 rounded-lg">
                                        <option value="meter">Metro</option>
                                        <option value="unit">Unidade</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full bg-amber-600 text-white py-2 rounded-lg font-bold hover:bg-amber-700 transition-colors text-sm">Criar</button>
                            </form>

                            <div className="mt-6 border-t pt-4">
                                <h3 className="text-xs font-bold text-stone-400 uppercase mb-2">Seções Ativas</h3>
                                <ul className="space-y-2">
                                    {categories.map(cat => (
                                        <li key={cat.id} className="flex justify-between items-center text-sm bg-stone-50 p-2 rounded">
                                            <span>{cat.name}</span>
                                            <form action={deleteCategory}>
                                                <input type="hidden" name="id" value={cat.id} />
                                                <button type="submit" className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                                            </form>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* CADASTRO DE PRODUTO */}
                        <ProductForm categories={categories as any} />
                    </div>

                    {/* LISTA DE PRODUTOS */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden h-fit">
                        <div className="p-6 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Package size={20} className="text-stone-600" /> Estoque
                            </h2>
                            <span className="bg-stone-200 text-stone-700 px-3 py-1 rounded-full text-xs font-bold">
                                {products.length} itens
                            </span>
                        </div>

                        <div className="overflow-x-auto max-h-[600px]">
                            <table className="w-full text-left text-sm text-stone-600">
                                <thead className="bg-stone-100 text-stone-800 font-bold sticky top-0">
                                    <tr>
                                        <th className="p-4">Produto</th>
                                        <th className="p-4">Seção</th>
                                        <th className="p-4">Preço</th>
                                        <th className="p-4 text-center">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-stone-50">
                                            <td className="p-4 font-medium text-stone-900">{product.name}</td>
                                            <td className="p-4 capitalize">
                                                <span className="bg-stone-100 px-2 py-1 rounded text-xs">
                                                    {categories.find(c => c.id === product.category)?.name || product.category}
                                                </span>
                                            </td>
                                            <td className="p-4">R$ {Number(product.price).toFixed(2)}</td>
                                            <td className="p-4 text-center">
                                                <form action={deleteProduct}>
                                                    <input type="hidden" name="id" value={product.id} />
                                                    <button type="submit" className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                                                </form>
                                            </td>
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