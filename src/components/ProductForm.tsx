'use client';

import { useState } from 'react';
import { createProduct } from '@/app/actions';
import { Plus, Trash2, Palette } from 'lucide-react';
import { Category } from '@/lib/types';

interface ProductFormProps {
    categories: Category[]; // Recebe as categorias para montar o dropdown
}

export default function ProductForm({ categories }: ProductFormProps) {
    // Estado para gerenciar as cores dinâmicas
    const [colors, setColors] = useState([{ name: 'Padrão', hex: '#FFFFFF' }]);

    // Adicionar nova linha de cor
    const addColor = () => {
        setColors([...colors, { name: '', hex: '#000000' }]);
    };

    // Remover linha de cor
    const removeColor = (index: number) => {
        if (colors.length > 1) {
            const newColors = [...colors];
            newColors.splice(index, 1);
            setColors(newColors);
        }
    };

    // Atualizar dados da cor
    const updateColor = (index: number, field: 'name' | 'hex', value: string) => {
        const newColors = [...colors];
        newColors[index] = { ...newColors[index], [field]: value };
        setColors(newColors);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-fit">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus size={20} className="text-green-600" /> Novo Produto
            </h2>

            <form action={createProduct} className="space-y-4">
                {/* Campo Oculto que envia as cores como JSON para o servidor */}
                <input type="hidden" name="colorsJson" value={JSON.stringify(colors)} />

                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Nome do Produto</label>
                    <input name="name" type="text" placeholder="Ex: Linho Misto Bege" required className="w-full p-2 border border-stone-300 rounded-lg" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Preço (R$)</label>
                        <input name="price" type="number" step="0.01" placeholder="0.00" required className="w-full p-2 border border-stone-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Estoque</label>
                        <input name="stock" type="number" step="0.1" placeholder="0" required className="w-full p-2 border border-stone-300 rounded-lg" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Categoria</label>
                    <select name="category" className="w-full p-2 border border-stone-300 rounded-lg" required>
                        <option value="">Selecione...</option>
                        {categories.map((cat: any) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* --- GERENCIADOR DE CORES --- */}
                <div className="bg-stone-50 p-3 rounded-lg border border-stone-100">
                    <label className="block text-sm font-medium text-stone-700 mb-2 flex items-center gap-2">
                        <Palette size={16} /> Cores Disponíveis
                    </label>

                    <div className="space-y-2">
                        {colors.map((color, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                {/* Seletor de Cor (Visual) */}
                                <input
                                    type="color"
                                    value={color.hex}
                                    onChange={(e) => updateColor(index, 'hex', e.target.value)}
                                    className="w-10 h-10 rounded cursor-pointer border-none bg-transparent"
                                    title="Escolher cor"
                                />

                                {/* Nome da Cor */}
                                <input
                                    type="text"
                                    value={color.name}
                                    onChange={(e) => updateColor(index, 'name', e.target.value)}
                                    placeholder="Nome (ex: Azul Marinho)"
                                    className="flex-1 p-2 border border-stone-300 rounded-lg text-sm"
                                    required
                                />

                                {/* Botão Remover */}
                                <button
                                    type="button"
                                    onClick={() => removeColor(index)}
                                    className="text-stone-400 hover:text-red-500 p-2"
                                    disabled={colors.length === 1}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addColor}
                        className="mt-3 text-sm text-green-700 font-medium hover:underline flex items-center gap-1"
                    >
                        <Plus size={14} /> Adicionar outra cor
                    </button>
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Imagem</label>
                    <input name="image" type="text" placeholder="/imagem.jpg ou https://..." defaultValue="https://picsum.photos/800/600" required className="w-full p-2 border border-stone-300 rounded-lg text-sm" />
                </div>

                <button type="submit" className="w-full bg-green-800 text-white py-3 rounded-lg font-bold hover:bg-green-900 transition-colors">
                    Cadastrar Produto
                </button>
            </form>
        </div>
    );
}