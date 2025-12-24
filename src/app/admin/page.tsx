import { getAdminData } from './actions';
import ProductForm from '@/components/ProductForm';
import ProductList from '@/components/ProductList'; // Assumindo que você componentizou a lista, se não, manteremos aqui
import { Package, Users, ShoppingBag, ChevronRight, Settings } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const { products, categories, pendingUsers, orders } = await getAdminData();

  // Filtra apenas pedidos pendentes para um resumo rápido (opcional)
  const pendingOrders = orders.filter(o => o.status === 'pendente').slice(0, 5);

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header Admin */}
      <header className="bg-stone-900 text-white pt-10 pb-24 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif font-bold">Painel Administrativo</h1>
            <p className="text-stone-400 mt-1">Gerencie produtos, pedidos e usuários.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="px-4 py-2 bg-stone-800 rounded-lg hover:bg-stone-700 transition text-sm">Ver Loja</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 -mt-16 space-y-8">
        
        {/* CARDS DE RESUMO E NAVEGAÇÃO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Pedidos */}
          <Link href="/admin/pedidos" className="bg-white p-6 rounded-xl shadow-md border border-stone-100 hover:shadow-lg transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShoppingBag size={64} className="text-green-800"/>
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-lg text-green-800"><ShoppingBag size={24}/></div>
                    <h3 className="font-bold text-lg text-stone-800">Pedidos</h3>
                </div>
                <p className="text-3xl font-bold text-stone-900 mb-1">{orders.length}</p>
                <p className="text-sm text-stone-500 mb-4">{pendingOrders.length} pendentes</p>
                <span className="text-green-700 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    Ver Histórico Completo <ChevronRight size={16}/>
                </span>
            </div>
          </Link>

          {/* Card Usuários (Se tiver lógica de aprovação) */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-stone-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Users size={64} className="text-blue-800"/>
            </div>
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-800"><Users size={24}/></div>
                <h3 className="font-bold text-lg text-stone-800">Estofadores</h3>
            </div>
            {pendingUsers.length > 0 ? (
                <div>
                    <p className="text-3xl font-bold text-blue-600 mb-1">{pendingUsers.length}</p>
                    <p className="text-sm text-stone-500">Aprovações pendentes</p>
                </div>
            ) : (
                <p className="text-stone-500 py-2">Nenhum cadastro pendente.</p>
            )}
          </div>

          {/* Card Produtos */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-stone-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Package size={64} className="text-orange-800"/>
            </div>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-800"><Package size={24}/></div>
                <h3 className="font-bold text-lg text-stone-800">Catálogo</h3>
            </div>
            <p className="text-3xl font-bold text-stone-900 mb-1">{products.length}</p>
            <p className="text-sm text-stone-500">Produtos cadastrados</p>
          </div>
        </div>

        {/* ÁREA DE GESTÃO DE PRODUTOS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário (Esquerda) */}
          <div className="lg:col-span-1">
            <ProductForm categories={categories} />
          </div>

          {/* Lista de Produtos (Direita) */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                <Package size={20}/> Produtos Ativos
            </h2>
            {/* Aqui você pode manter a lista de produtos ou criar um componente separado */}
            {/* Vou simplificar a visualização aqui para não ficar muito longo o código */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-stone-50 border-b border-stone-200">
                        <tr>
                            <th className="p-4 font-bold text-stone-600">Produto</th>
                            <th className="p-4 font-bold text-stone-600">Categoria</th>
                            <th className="p-4 font-bold text-stone-600 text-right">Preço</th>
                            <th className="p-4 font-bold text-stone-600 text-center">Estoque</th>
                            <th className="p-4 font-bold text-stone-600 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {products.map(product => (
                            <tr key={product.id} className="hover:bg-stone-50">
                                <td className="p-4 font-medium text-stone-900">{product.name}</td>
                                <td className="p-4 text-stone-500">{product.category}</td>
                                <td className="p-4 text-right">R$ {Number(product.price).toFixed(2)}</td>
                                <td className="p-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${Number(product.stock) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {Number(product.stock)}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <form action={async () => { 'use server'; /* Lógica de delete aqui ou importada */ }}>
                                        <input type="hidden" name="id" value={product.id} />
                                        <button className="text-red-500 hover:text-red-700 font-bold text-xs">Excluir</button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && (
                            <tr><td colSpan={5} className="p-8 text-center text-stone-400">Nenhum produto cadastrado.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}