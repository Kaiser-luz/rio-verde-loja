'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, Upload, Loader2 } from 'lucide-react';
import { createProduct } from '@/app/actions';

export default function ExcelManager({ products }: { products: any[] }) {
    const [isImporting, setIsImporting] = useState(false);

    // --- EXPORTAR ---
    const handleExport = () => {
        const dataToExport = products.map(p => ({
            Nome: p.name,
            Preco: Number(p.price),
            Estoque: Number(p.stock),
            Categoria_ID: p.category,
            Tipo_Venda: p.type,
            Imagem_URL: p.image,
            Cor_Nome: p.colors?.[0]?.name || 'Padrão',
            Cor_Hex: p.colors?.[0]?.hex || '#FFFFFF'
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Produtos");
        XLSX.writeFile(workbook, "Estoque_RioVerde.xlsx");
    };

    // --- IMPORTAR ---
    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const binaryStr = event.target?.result;
                const workbook = XLSX.read(binaryStr, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                // Converte para array genérico para evitar erros de tipagem no loop
                const data = XLSX.utils.sheet_to_json(sheet) as any[];

                let count = 0;

                for (const row of data) {
                    const formData = new FormData();

                    if (!row['Nome']) continue;

                    formData.append('name', row['Nome']);
                    formData.append('price', String(row['Preco'] || 0));
                    formData.append('stock', String(row['Estoque'] || 0));
                    formData.append('category', row['Categoria_ID'] || 'outros');
                    formData.append('image', row['Imagem_URL'] || 'https://picsum.photos/800/600');

                    const colors = [{
                        name: row['Cor_Nome'] || 'Padrão',
                        hex: row['Cor_Hex'] || '#FFFFFF'
                    }];
                    formData.append('colorsJson', JSON.stringify(colors));

                    await createProduct(formData);
                    count++;
                }

                alert(`Sucesso! ${count} produtos importados.`);
                window.location.reload();

            } catch (error) {
                console.error(error);
                alert("Erro ao importar. Verifique o modelo da planilha.");
            } finally {
                setIsImporting(false);
            }
        };

        reader.readAsBinaryString(file);
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors text-sm font-medium shadow-sm"
            >
                <Download size={16} /> Baixar Planilha
            </button>

            <label className={`flex items-center gap-2 px-4 py-2 border border-green-700 text-green-800 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium shadow-sm cursor-pointer ${isImporting ? 'opacity-50' : ''}`}>
                {isImporting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {isImporting ? 'Importando...' : 'Subir Planilha'}
                <input type="file" accept=".xlsx, .xls" onChange={handleImport} className="hidden" disabled={isImporting} />
            </label>
        </div>
    );
}