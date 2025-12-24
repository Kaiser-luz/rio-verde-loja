'use client';

import { deleteProduct } from '@/app/admin/actions'; // Importa a ação de deletar
import { Product } from '@/lib/types';
import { Trash2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface ProductListProps {
    products: Product[];
}

export default function ProductList({ products }: ProductListProps) {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleDelete = async (id: number) => {
        const confirm = window.confirm("Tem certeza que deseja excluir este produto? Essa ação não pode ser desfeita.");
        if (!confirm) return;

        setDeletingId(id);
        const formData = new FormData();
        formData.append('id', id.toString());

        try {
            await deleteProduct(formData);
        } catch (error) {
            alert("Erro ao excluir produto.");
        } finally {
            setDeletingId(null);
        }
    };

    if (products.length === 0) {
        return (
            <div className="bg-white p-12 rounded-xl shadow-sm border border-stone-200 text-center flex flex-col items-center">
                <div className="bg-stone-100 p-4 rounded-full mb-4">
                    <AlertCircle size={32} className="text-stone-400" />
                </div>
                <h3 className="text-lg font-bold text-stone-700">Nenhum produto encontrado</h3>
                <p className="text-stone-500">Cadastre seu primeiro produto no formulário ao lado.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto">
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
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-stone-200 shrink-0">
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="font-medium text-stone-900">{product.name}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-stone-500">{product.category}</td>
                                <td className="p-4 text-right font-medium">R$ {Number(product.price).toFixed(2)}</td>
                                <td className="p-4 text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${Number(product.stock) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {Number(product.stock)}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => handleDelete(product.id)}
                                        disabled={deletingId === product.id}
                                        className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors disabled:opacity-50"
                                        title="Excluir Produto"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}