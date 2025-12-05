'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, Loader2 } from 'lucide-react';

export default function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            // 1. Cria um nome único para o arquivo para não sobrescrever outros
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 2. Faz o upload para o bucket 'products'
            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 3. Pega a URL pública para salvar no banco
            const { data } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            // 4. Passa a URL para o formulário pai
            onUpload(data.publicUrl);
            setPreview(data.publicUrl);

        } catch (error) {
            alert('Erro ao fazer upload da imagem! Verifique se o Bucket "products" está criado e é Público no Supabase.');
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-stone-300 border-dashed rounded-lg cursor-pointer bg-stone-50 hover:bg-stone-100 transition-colors relative overflow-hidden">

                {preview ? (
                    <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {isUploading ? (
                            <Loader2 className="animate-spin text-stone-400 mb-2" />
                        ) : (
                            <Upload className="text-stone-400 mb-2" />
                        )}
                        <p className="text-xs text-stone-500">
                            {isUploading ? "Enviando..." : "Clique para enviar foto"}
                        </p>
                    </div>
                )}

                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
            </label>
        </div>
    );
}