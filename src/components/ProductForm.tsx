'use client';

import { useState } from 'react';
import { createProduct } from '@/app/actions';
import { Plus, Trash2, Palette, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';
import { Category } from '@/lib/types';
import ImageUpload from './ImageUpload';
import { supabase } from '@/lib/supabase';

interface ProductFormProps {
    categories: Category[];
}

export default function ProductForm({ categories }: ProductFormProps) {
    const [colors, setColors] = useState([{ name: 'Padrão', hex: '#FFFFFF', image: '' }]);
    const [mainImage, setMainImage] = useState("https://picsum.photos/800/600");
    
    // --- ESTADO DO PDF ---
    const [pdfUrl, setPdfUrl] = useState<string>("");
    const [isUploadingPdf, setIsUploadingPdf] = useState(false);

    const addColor = () => {
        setColors([...colors, { name: '', hex: '#000000', image: '' }]);
    };

    const removeColor = (index: number) => {
        if (colors.length > 1) {
            const newColors = [...colors];
            newColors.splice(index, 1);
            setColors(newColors);
        }
    };

    const updateColor = (index: number, field: string, value: string) => {
        const newColors = [...colors];
        // @ts-ignore
        newColors[index][field] = value;
        setColors(newColors);
    };

    // --- UPLOAD DE PDF ---
    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (file.type !== 'application/pdf') {
            alert("Por favor, envie apenas arquivos PDF.");
            return;
        }

        setIsUploadingPdf(true);
        try {
            // Salva na pasta 'monstruarios'
            const fileName = `monstruarios/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
            
            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('products').getPublicUrl(fileName);
            setPdfUrl(data.publicUrl);
        } catch (error) {
            console.error(error);
            alert("Erro ao enviar PDF. Verifique se o bucket 'products' é público.");
        } finally {
            setIsUploadingPdf(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-fit">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-stone-800">
                <Plus size={20} className="text-green-600" /> Novo Produto
            </h2>

            <form action={createProduct} className="space-y-4">
                <input type="hidden" name="colorsJson" value={JSON.stringify(colors)} />
                <input type="hidden" name="image" value={mainImage} />
                {/* Envia a URL do PDF para a server action */}
                <input type="hidden" name="pdfUrl" value={pdfUrl} />

                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Nome do Produto</label>
                    <input name="name" type="text" placeholder="Ex: Linho Misto" required className="w-full p-2 border border-stone-300 rounded-lg" />
                </div>

                <div className="grid grid-cols-2 gap-4 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                    <div>
                        <label className="block text-sm font-bold text-stone-700 mb-1">Preço Público</label>
                        <input name="price" type="number" step="0.01" placeholder="R$ 0.00" required className="w-full p-2 border border-stone-300 rounded-lg bg-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-green-700 mb-1">Preço Estofador</label>
                        <input name="priceUpholsterer" type="number" step="0.01" placeholder="R$ 0.00" className="w-full p-2 border border-green-300 rounded-lg bg-white" />
                    </div>
                </div>

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

                {/* IMAGEM PRINCIPAL */}
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Foto Principal</label>
                    <ImageUpload onUpload={(url) => setMainImage(url)} />
                </div>

                {/* MONSTRUÁRIO PDF */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <label className="block text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                        <FileText size={16} /> Monstruário Digital (PDF)
                    </label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="file" 
                            accept=".pdf"
                            onChange={handlePdfUpload}
                            className="text-xs text-stone-500 file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                        />
                        {isUploadingPdf && <Loader2 size={16} className="animate-spin text-blue-600" />}
                    </div>
                    {pdfUrl && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1 font-bold">
                            <FileText size={12} /> PDF Anexado!
                        </p>
                    )}
                </div>

                {/* CORES */}
                <div className="bg-stone-50 p-3 rounded-lg border border-stone-100">
                    <label className="block text-sm font-medium text-stone-700 mb-3 flex items-center gap-2">
                        <Palette size={16} /> Variações de Cor
                    </label>
                    <div className="space-y-4">
                        {colors.map((color, index) => (
                            <div key={index} className="flex flex-col gap-3 p-3 bg-white border border-stone-200 rounded-lg shadow-sm">
                                <div className="flex gap-2 items-center">
                                    <input type="color" value={color.hex} onChange={(e) => updateColor(index, 'hex', e.target.value)} className="w-10 h-10 rounded cursor-pointer border-none bg-transparent" />
                                    <input type="text" value={color.name} onChange={(e) => updateColor(index, 'name', e.target.value)} placeholder="Nome da cor" className="flex-1 p-2 border border-stone-300 rounded-lg text-sm" required />
                                    <button type="button" onClick={() => removeColor(index)} className="text-stone-400 hover:text-red-500"><Trash2 size={18} /></button>
                                </div>
                                <div className="flex items-center gap-2 pl-1">
                                    <ImageIcon size={16} className="text-stone-400 shrink-0" />
                                    <div className="flex-1 scale-90 origin-left -my-2">
                                        <ImageUpload onUpload={(url) => updateColor(index, 'image', url)} />
                                    </div>
                                    {color.image && <img src={color.image} className="w-12 h-12 object-cover rounded border border-green-200" />}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addColor} className="mt-4 w-full py-2 border border-dashed border-green-300 text-green-700 rounded-lg text-xs font-bold uppercase hover:bg-green-50">+ Adicionar Cor</button>
                </div>

                <button type="submit" className="w-full bg-green-800 text-white py-3 rounded-lg font-bold hover:bg-green-900 shadow-lg">Cadastrar Produto</button>
            </form>
        </div>
    );
}