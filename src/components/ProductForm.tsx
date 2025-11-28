'use client';

import { useState } from 'react';
import { createProduct } from '@/app/actions';
import { Plus, Trash2, Palette } from 'lucide-react';
import { Category } from '@/lib/types';
import ImageUpload from './ImageUpload'; // IMPORT NOVO

interface ProductFormProps {
  categories: Category[];
}

export default function ProductForm({ categories }: ProductFormProps) {
  const [colors, setColors] = useState([{ name: 'Padrão', hex: '#FFFFFF' }]);
  const [imageUrl, setImageUrl] = useState("https://picsum.photos/800/600"); // Estado para a URL

  const addColor = () => setColors([...colors, { name: '', hex: '#000000' }]);
  
  const removeColor = (index: number) => {
    if (colors.length > 1) {
      const newColors = [...colors];
      newColors.splice(index, 1);
      setColors(newColors);
    }
  };

  const updateColor = (index: number, field: 'name' | 'hex', value: string) => {
    const newColors = [...colors];
    newColors[index] = { ...newColors[index], [field]: value };
    setColors(newColors);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-fit">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-stone-800">
        <Plus size={20} className="text-green-600"/> Novo Produto
      </h2>
      
      <form action={createProduct} className="space-y-4">
        <input type="hidden" name="colorsJson" value={JSON.stringify(colors)} />
        
        {/* Campo de Imagem Escondido (Recebe valor do Upload) */}
        <input type="hidden" name="image" value={imageUrl} />

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Nome do Produto</label>
          <input name="name" type="text" placeholder="Ex: Linho Misto" required className="w-full p-2 border border-stone-300 rounded-lg" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
             <label className="block text-sm font-medium text-stone-700 mb-1">Preço</label>
             <input name="price" type="number" step="0.01" required className="w-full p-2 border border-stone-300 rounded-lg" />
          </div>
          <div>
             <label className="block text-sm font-medium text-stone-700 mb-1">Estoque</label>
             <input name="stock" type="number" step="0.1" required className="w-full p-2 border border-stone-300 rounded-lg" />
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

        {/* Gerenciador de Cores */}
        <div className="bg-stone-50 p-3 rounded-lg border border-stone-100">
          <label className="block text-sm font-medium text-stone-700 mb-2 flex items-center gap-2">
            <Palette size={16} /> Cores
          </label>
          <div className="space-y-2">
            {colors.map((color, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input 
                  type="color" 
                  value={color.hex}
                  onChange={(e) => updateColor(index, 'hex', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
                />
                <input 
                  type="text" 
                  value={color.name}
                  onChange={(e) => updateColor(index, 'name', e.target.value)}
                  placeholder="Nome da cor"
                  className="flex-1 p-2 border border-stone-300 rounded-lg text-sm"
                  required
                />
                <button type="button" onClick={() => removeColor(index)} className="text-stone-400 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addColor} className="mt-3 text-xs text-green-700 font-bold uppercase hover:underline">
            + Adicionar Cor
          </button>
        </div>

        {/* --- UPLOAD DE IMAGEM --- */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Foto do Produto</label>
          {/* Componente de Upload que atualiza o estado imageUrl */}
          <ImageUpload onUpload={(url) => setImageUrl(url)} />
          <p className="text-xs text-stone-400 mt-1 truncate">Link atual: {imageUrl}</p>
        </div>

        <button type="submit" className="w-full bg-green-800 text-white py-3 rounded-lg font-bold hover:bg-green-900 transition-colors">
          Cadastrar Produto
        </button>
      </form>
    </div>
  );
}