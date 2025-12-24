'use client';

import { useState, useEffect, Suspense } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { createOrder } from '@/app/actions';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, MapPin, CreditCard, Package, ChevronRight, User, Store } from 'lucide-react';

function CheckoutContent() {
    const { cart, cartTotal } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Lê parâmetros da URL vindos do carrinho
    const mode = searchParams.get('mode') || 'shipping'; // 'pickup' ou 'shipping'
    const urlCep = searchParams.get('cep') || '';
    const urlShippingCost = parseFloat(searchParams.get('shippingCost') || '0');
    const urlMethod = searchParams.get('shippingMethod') || '';

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    // Estados
    const [shippingCost, setShippingCost] = useState(urlShippingCost);
    const [cep, setCep] = useState(urlCep);
    const [address, setAddress] = useState({
        street: '', district: '', city: '', state: '', number: '', complement: '', reference: '', receiver: ''
    });

    useEffect(() => {
        if (cart.length === 0) router.push('/');
        
        // Se já veio com CEP, tenta preencher (para shipping)
        if (mode === 'shipping' && urlCep) {
            handleBlurCep(urlCep);
        }
    }, [cart, router, mode, urlCep]);

    const handleBlurCep = async (cepValue: string) => {
        const cleanCep = cepValue.replace(/\D/g, '');
        if (cleanCep.length !== 8) return;

        setLoading(true);
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await res.json();
            if (!data.erro) {
                setAddress(prev => ({
                    ...prev,
                    street: data.logradouro,
                    district: data.bairro,
                    city: data.localidade,
                    state: data.uf
                }));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFinalize = async () => {
        // Validação diferente para Retirada vs Entrega
        if (!address.receiver) {
            alert("Por favor, informe quem irá receber/retirar o pedido.");
            return;
        }

        if (mode === 'shipping' && (!address.street || !address.number)) {
            alert("Por favor, preencha o endereço completo.");
            return;
        }

        setLoading(true);
        try {
            const finalDeliveryMethod = mode === 'pickup' ? 'Retirada na Loja (Bacacheri)' : (urlMethod || 'Entrega Padrão');
            const finalShippingCost = mode === 'pickup' ? 0 : shippingCost;

            const orderId = await createOrder(
                cart,
                cartTotal,
                user?.user_metadata?.full_name || address.receiver,
                user?.id,
                finalShippingCost,
                finalDeliveryMethod,
                { ...address, zipCode: cep }
            );

            if (!orderId) throw new Error("Falha ao criar pedido.");

            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error("Erro ao gerar link de pagamento.");
            }

        } catch (error: any) {
            alert(error.message);
            setLoading(false);
        }
    };

    if (cart.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
                
                {/* ETAPA 1: RESUMO */}
                {step === 1 && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 animate-in fade-in">
                        <h2 className="text-xl font-serif font-bold mb-4 flex items-center gap-2"><Package size={20}/> Resumo do Pedido</h2>
                        <div className="space-y-4">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex gap-4 border-b border-stone-100 pb-4">
                                    <img src={item.image} className="w-16 h-16 rounded-lg object-cover bg-stone-100" />
                                    <div>
                                        <h3 className="font-bold text-stone-900 text-sm">{item.name}</h3>
                                        <p className="text-xs text-stone-500">Cor: {item.selectedColor.name}</p>
                                        <p className="text-xs font-medium mt-1">{item.quantity} {item.type === 'meter' ? 'm' : 'un'} x R$ {item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="ml-auto font-bold text-green-800 text-sm">R$ {(item.price * item.quantity).toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setStep(2)} className="bg-stone-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-800 transition-colors flex items-center gap-2 text-sm">
                                Continuar <ChevronRight size={18}/>
                            </button>
                        </div>
                    </div>
                )}

                {/* ETAPA 2: ENTREGA OU RETIRADA */}
                {step === 2 && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 animate-in fade-in">
                        <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
                            {mode === 'pickup' ? <Store size={20}/> : <MapPin size={20}/>} 
                            {mode === 'pickup' ? 'Dados para Retirada' : 'Endereço de Entrega'}
                        </h2>
                        
                        <div className="space-y-4">
                            {/* CAMPO DE QUEM RECEBE (COMUM PARA AMBOS) */}
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">
                                    {mode === 'pickup' ? 'Nome de quem vai retirar' : 'Quem vai receber?'}
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Nome completo"
                                        className="w-full pl-10 p-3 border rounded-xl"
                                        value={address.receiver}
                                        onChange={e => setAddress({...address, receiver: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* CONDICIONAL: SE FOR RETIRADA */}
                            {mode === 'pickup' ? (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
                                    <p className="text-sm font-bold text-green-800 mb-2">📍 Local de Retirada:</p>
                                    <p className="text-sm text-stone-700">Rua Prefeito Erasto Gaertner, 1217</p>
                                    <p className="text-sm text-stone-700">Bacacheri, Curitiba - PR</p>
                                    <p className="text-xs text-stone-500 mt-2">Horário: Seg-Sex 09h às 18h / Sáb 09h às 13h</p>
                                </div>
                            ) : (
                                /* CONDICIONAL: SE FOR ENTREGA (MOSTRA FORMULÁRIO COMPLETO) */
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">CEP</label>
                                            <input type="text" placeholder="00000-000" className="w-full p-3 border rounded-xl" value={cep} onChange={e => setCep(e.target.value)} onBlur={(e) => handleBlurCep(e.target.value)} maxLength={9} />
                                        </div>
                                        <div><label className="block text-sm font-medium text-stone-700 mb-1">Estado</label><input type="text" className="w-full p-3 border rounded-xl bg-stone-50" value={address.state} readOnly /></div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-2"><label className="block text-sm font-medium text-stone-700 mb-1">Rua</label><input type="text" className="w-full p-3 border rounded-xl bg-stone-50" value={address.street} readOnly /></div>
                                        <div><label className="block text-sm font-medium text-stone-700 mb-1">Número</label><input type="text" className="w-full p-3 border rounded-xl" placeholder="123" value={address.number} onChange={e => setAddress({...address, number: e.target.value})} /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="block text-sm font-medium text-stone-700 mb-1">Bairro</label><input type="text" className="w-full p-3 border rounded-xl bg-stone-50" value={address.district} readOnly /></div>
                                        <div><label className="block text-sm font-medium text-stone-700 mb-1">Complemento</label><input type="text" className="w-full p-3 border rounded-xl" placeholder="Ap 101" value={address.complement} onChange={e => setAddress({...address, complement: e.target.value})} /></div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="mt-6 flex justify-between">
                            <button onClick={() => setStep(1)} className="text-stone-500 hover:text-stone-800 font-medium text-sm">Voltar</button>
                            <button 
                                onClick={handleFinalize} 
                                disabled={loading || !address.receiver || (mode === 'shipping' && !address.street)}
                                className="bg-green-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-800 transition-colors flex items-center gap-2 disabled:bg-stone-300 text-sm"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18}/> : <CreditCard size={18}/>}
                                Ir para Pagamento
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* RESUMO LATERAL */}
            <div className="h-fit space-y-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                    <h3 className="font-bold text-stone-900 mb-4">Total a Pagar</h3>
                    <div className="flex justify-between mb-2 text-stone-600 text-sm"><span>Subtotal</span><span>R$ {cartTotal.toFixed(2)}</span></div>
                    <div className="flex justify-between mb-4 text-stone-600 text-sm">
                        <span>Frete ({mode === 'pickup' ? 'Retirada' : 'Entrega'})</span>
                        <span className={mode === 'pickup' ? 'text-green-600 font-bold' : ''}>
                            {mode === 'pickup' ? 'Grátis' : `R$ ${shippingCost.toFixed(2)}`}
                        </span>
                    </div>
                    <div className="border-t border-stone-100 pt-4 flex justify-between items-center">
                        <span className="font-bold text-lg">Total</span>
                        <span className="font-bold text-2xl text-green-800">R$ {(cartTotal + (mode === 'pickup' ? 0 : shippingCost)).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Wrapper para Suspense (Necessário em Next.js 13+ com useSearchParams)
export default function CheckoutPage() {
    return (
        <div className="min-h-screen bg-stone-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="animate-spin text-green-800" size={40}/></div>}>
                    <CheckoutContent />
                </Suspense>
            </div>
        </div>
    );
}