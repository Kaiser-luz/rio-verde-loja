'use client';

import { useState } from 'react';
import { createProduct } from '@/app/actions';
import { Plus, Trash2, Palette, Image as ImageIcon } from 'lucide-react';
import { Category } from '@/lib/types';
import ImageUpload from './ImageUpload';

interface ProductFormProps {
    categories: Category[];
}

export default function ProductForm({ categories }: ProductFormProps) {
    // Estado inicial das cores (agora com campo 'image')
    const [colors, setColors] = useState([{ name: 'Padrão', hex: '#FFFFFF', image: '' }]);
    const [mainImage, setMainImage] = useState("https://picsum.photos/800/600");

    // Adiciona nova linha de cor
    const addColor = () => {
        setColors([...colors, { name: '', hex: '#000000', image: '' }]);
    };

    // Remove linha de cor
    const removeColor = (index: number) => {
        if (colors.length > 1) {
            const newColors = [...colors];
            newColors.splice(index, 1);
            setColors(newColors);
        }
    };

    // Atualiza um campo específico de uma cor (nome, hex ou imagem)
    const updateColor = (index: number, field: string, value: string) => {
        const newColors = [...colors];
        // @ts-ignore: Ignora erro de tipagem dinâmica para simplificar
        newColors[index][field] = value;
        setColors(newColors);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-fit">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-stone-800">
                <Plus size={20} className="text-green-600" /> Novo Produto
            </h2>

            <form action={createProduct} className="space-y-4">
                {/* Campos Ocultos para enviar os dados complexos ao servidor */}
                <input type="hidden" name="colorsJson" value={JSON.stringify(colors)} />
                <input type="hidden" name="image" value={mainImage} />

                {/* NOME */}
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Nome do Produto</label>
                    <input name="name" type="text" placeholder="Ex: Linho Misto" required className="w-full p-2 border border-stone-300 rounded-lg" />
                </div>

                {/* PREÇOS DIFERENCIADOS (Normal vs Estofador) */}
                <div className="grid grid-cols-2 gap-4 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                    <div>
                        <label className="block text-sm font-bold text-stone-700 mb-1">Preço Público</label>
                        <input name="price" type="number" step="0.01" placeholder="R$ 0.00" required className="w-full p-2 border border-stone-300 rounded-lg bg-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-green-700 mb-1">Preço Estofador</label>
                        <input name="priceUpholsterer" type="number" step="0.01" placeholder="R$ 0.00 (Opcional)" className="w-full p-2 border border-green-300 rounded-lg bg-white" />
                        <p className="text-xs text-green-600 mt-1">Desconto para profissionais cadastrados</p>
                    </div>
                </div>

                {/* ESTOQUE E CATEGORIA */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Estoque</label>
                        <input name="stock" type="number" step="0.1" required className="w-full p-2 border border-stone-300 rounded-lg" />
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
                </div>

                {/* UPLOAD IMAGEM PRINCIPAL */}
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Foto Principal (Capa)</label>
                    <ImageUpload onUpload={(url) => setMainImage(url)} />
                    {mainImage && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-stone-500">
                            <img src={mainImage} className="w-10 h-10 object-cover rounded border" />
                            <span className="truncate max-w-[200px]">{mainImage}</span>
                        </div>
                    )}
                </div>

                {/* GERENCIADOR DE CORES COM FOTOS */}
                <div className="bg-stone-50 p-3 rounded-lg border border-stone-100">
                    <label className="block text-sm font-medium text-stone-700 mb-3 flex items-center gap-2">
                        <Palette size={16} /> Variações de Cor e Foto
                    </label>

                    <div className="space-y-4">
                        {colors.map((color, index) => (
                            <div key={index} className="flex flex-col gap-3 p-3 bg-white border border-stone-200 rounded-lg shadow-sm">

                                {/* Linha 1: Cor e Nome */}
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="color"
                                        value={color.hex}
                                        onChange={(e) => updateColor(index, 'hex', e.target.value)}
                                        className="w-10 h-10 rounded cursor-pointer border-none bg-transparent"
                                        title="Escolher tom da cor"
                                    />
                                    <input
                                        type="text"
                                        value={color.name}
                                        onChange={(e) => updateColor(index, 'name', e.target.value)}
                                        placeholder="Nome da cor (ex: Azul Marinho)"
                                        className="flex-1 p-2 border border-stone-300 rounded-lg text-sm"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeColor(index)}
                                        className="text-stone-400 hover:text-red-500 p-2 hover:bg-red-50 rounded transition-colors"
                                        title="Remover cor"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                {/* Linha 2: Upload da Foto Específica */}
                                <div className="flex items-center gap-2 pl-1">
                                    <ImageIcon size={16} className="text-stone-400 shrink-0" />
                                    <div className="flex-1">
                                        {/* Reutilizamos o componente de Upload para cada cor! */}
                                        <div className="scale-90 origin-left -my-2">
                                            <ImageUpload onUpload={(url) => updateColor(index, 'image', url)} />
                                        </div>
                                    </div>
                                    {color.image ? (
                                        <img src={color.image} className="w-12 h-12 object-cover rounded border border-green-200" title="Foto vinculada" />
                                    ) : (
                                        <div className="w-12 h-12 rounded border border-dashed border-stone-300 flex items-center justify-center text-xs text-stone-400">
                                            Sem foto
                                        </div>
                                    )}
                                </div>

                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addColor}
                        className="mt-4 w-full py-2 border border-dashed border-green-300 text-green-700 rounded-lg text-xs font-bold uppercase hover:bg-green-50 transition-colors"
                    >
                        + Adicionar Variação
                    </button>
                </div>

                <button type="submit" className="w-full bg-green-800 text-white py-3 rounded-lg font-bold hover:bg-green-900 transition-colors shadow-lg">
                    Cadastrar Produto Completo
                </button>
            </form>
        </div>
    );
}