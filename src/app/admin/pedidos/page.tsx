import { getAdminData, updateOrderStatus } from '@/app/admin/actions'; // Reutilizando ou importe a action correta
import { ArrowLeft, Search, Filter, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  // Busca todos os dados (pode otimizar criando getOrders específico depois)
  const { orders } = await getAdminData();

  // Função auxiliar para cor do status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pago': return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelado': return 'bg-red-100 text-red-800 border-red-200';
      case 'enviado': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <header className="bg-white border-b border-stone-200 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link href="/admin" className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                    <Package size={20} className="text-stone-400"/> Gestão de Pedidos
                </h1>
            </div>
            <div className="text-sm text-stone-500">
                Total: <strong>{orders.length}</strong> pedidos
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* FILTROS (Visual apenas por enquanto) */}
        <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"/>
                <input type="text" placeholder="Buscar por cliente, ID ou valor..." className="w-full pl-10 p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-green-600"/>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-300 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50">
                <Filter size={16}/> Filtrar
            </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600">
                    <tr>
                        <th className="p-4 font-bold">ID / Data</th>
                        <th className="p-4 font-bold">Cliente</th>
                        <th className="p-4 font-bold">Itens</th>
                        <th className="p-4 font-bold">Entrega</th>
                        <th className="p-4 font-bold text-right">Total</th>
                        <th className="p-4 font-bold text-center">Status</th>
                        <th className="p-4 font-bold text-center">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                    {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                            <td className="p-4">
                                <span className="font-mono text-xs text-stone-500 block mb-1">#{order.id.slice(0,8)}</span>
                                <span className="text-stone-900">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
                                <span className="text-xs text-stone-400 block">{new Date(order.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                            </td>
                            <td className="p-4">
                                <p className="font-medium text-stone-900">{order.customer}</p>
                                {/* Se tiver email ou telefone no pedido, mostrar aqui */}
                            </td>
                            <td className="p-4">
                                <div className="space-y-1">
                                    {order.items.map((item: any, idx: number) => (
                                        <p key={idx} className="text-xs text-stone-600">
                                            <span className="font-bold">{Number(item.quantity)}x</span> {item.productName}
                                        </p>
                                    ))}
                                    {order.items.length > 2 && <p className="text-xs text-stone-400 italic">+ outros...</p>}
                                </div>
                            </td>
                            <td className="p-4">
                                <p className="text-xs font-bold text-stone-700">{order.deliveryMethod || 'Retirada'}</p>
                                {order.shippingCity && <p className="text-xs text-stone-500">{order.shippingCity}/{order.shippingState}</p>}
                            </td>
                            <td className="p-4 text-right font-bold text-stone-900">
                                R$ {Number(order.total).toFixed(2)}
                            </td>
                            <td className="p-4 text-center">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                                    {order.status.toUpperCase()}
                                </span>
                            </td>
                            <td className="p-4 text-center">
                                <form action={updateOrderStatus} className="flex flex-col gap-2 items-center">
                                    <input type="hidden" name="id" value={order.id} />
                                    <select 
                                        name="status" 
                                        defaultValue={order.status}
                                        className="text-xs p-1 border border-stone-300 rounded bg-white max-w-[100px]"
                                        // O ideal seria usar onChange com JS para submit automático, mas aqui precisa de botão
                                    >
                                        <option value="pendente">Pendente</option>
                                        <option value="pago">Pago</option>
                                        <option value="enviado">Enviado</option>
                                        <option value="concluido">Concluído</option>
                                        <option value="cancelado">Cancelado</option>
                                    </select>
                                    <button type="submit" className="text-xs text-blue-600 hover:underline">Atualizar</button>
                                </form>
                            </td>
                        </tr>
                    ))}
                    {orders.length === 0 && (
                        <tr>
                            <td colSpan={7} className="p-12 text-center text-stone-400 flex flex-col items-center">
                                <Clock size={48} className="mb-4 opacity-20"/>
                                <p>Nenhum pedido encontrado no histórico.</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </main>
    </div>
  );
}