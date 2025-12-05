'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Copy } from 'lucide-react';
import { Suspense } from 'react';

function SuccessContent() {
    const searchParams = useSearchParams();
    const pixCode = searchParams.get('pix_code');
    const pixImage = searchParams.get('pix_image');

    const copyPix = () => {
        if (pixCode) {
            navigator.clipboard.writeText(pixCode);
            alert("Código Pix copiado!");
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4 bg-stone-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-green-600" />
                </div>

                <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Pedido Criado!</h1>
                <p className="text-stone-500 mb-6">Realize o pagamento para confirmar.</p>

                {pixImage && (
                    <div className="mb-6 flex flex-col items-center">
                        <p className="text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">Escaneie o QR Code</p>
                        <div className="border-4 border-stone-100 rounded-xl overflow-hidden">
                            <img src={pixImage} alt="QR Code Pix" className="w-48 h-48" />
                        </div>
                    </div>
                )}

                {pixCode && (
                    <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 mb-6">
                        <p className="text-xs text-stone-400 mb-2 uppercase font-bold">Ou copie e cole</p>
                        <div className="flex gap-2">
                            <input
                                readOnly
                                value={pixCode}
                                className="flex-1 bg-white border border-stone-200 rounded px-3 py-2 text-xs text-stone-600 font-mono truncate"
                            />
                            <button onClick={copyPix} className="bg-stone-200 hover:bg-stone-300 text-stone-700 p-2 rounded transition-colors" title="Copiar">
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>
                )}

                <Link href="/" className="block w-full bg-stone-900 text-white py-3 rounded-lg font-bold hover:bg-stone-800 transition-colors">
                    Voltar à Loja
                </Link>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <SuccessContent />
        </Suspense>
    );
}