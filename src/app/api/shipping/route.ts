import { NextResponse } from 'next/server';

// Token do Melhor Envio (Sandbox/Teste).
const TOKEN = process.env.MELHOR_ENVIO_TOKEN || ""; 
const EMAIL = process.env.MELHOR_ENVIO_EMAIL || "email@loja.com";

// CEP de Origem (Sua loja em Curitiba - Bacacheri)
const FROM_CEP = "82510000"; 

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { cep, items } = body;

        // Log para debug no terminal
        console.log(`🚚 Calculando frete para CEP: ${cep}`);

        if (!cep || cep.length < 8) {
            return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
        }

        // Se não tiver token configurado, já usa o fallback direto para não perder tempo
        if (!TOKEN) {
            console.warn("⚠️ Token do Melhor Envio não configurado. Usando valores de teste.");
            return NextResponse.json(getFallbackShipping());
        }

        const products = items.map((item: any) => ({
            id: String(item.id),
            width: 20,
            height: 20,
            length: 20,
            weight: item.type === 'meter' ? (item.quantity * 0.5) : (item.quantity * 1),
            insurance_value: Number(item.price),
            quantity: Math.max(1, Math.ceil(item.quantity))
        }));

        const isProduction = process.env.NODE_ENV === 'production';
        const url = isProduction 
            ? 'https://melhorenvio.com.br/api/v2/me/shipment/calculate' 
            : 'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate';

        const payload = {
            from: { postal_code: FROM_CEP },
            to: { postal_code: cep },
            products: products,
            options: { receipt: false, own_hand: false }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`,
                'User-Agent': `${EMAIL}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Erro API Melhor Envio:", response.status, errorText);
            // Retorna o fallback em vez de erro para não travar o cliente
            return NextResponse.json(getFallbackShipping());
        }

        const data = await response.json();

        const options = data
            .filter((opt: any) => !opt.error)
            .map((opt: any) => ({
                id: opt.id,
                name: opt.name, 
                company: opt.company.name, 
                price: Number(opt.price), 
                delivery_time: opt.delivery_time 
            }))
            .sort((a: any, b: any) => a.price - b.price);

        // Se a API retornou lista vazia (nenhuma transportadora atende), usa fallback
        if (options.length === 0) {
             return NextResponse.json(getFallbackShipping());
        }

        return NextResponse.json(options);

    } catch (error: any) {
        console.error("❌ Erro interno cálculo frete:", error);
        // Em último caso, retorna fallback
        return NextResponse.json(getFallbackShipping());
    }
}

// Função auxiliar com valores fictícios para teste/erro
function getFallbackShipping() {
    return [
        { 
            id: 1, 
            name: "PAC (Estimado)", 
            price: 28.90, 
            delivery_time: 7, 
            company: "Correios" 
        },
        { 
            id: 2, 
            name: "SEDEX (Estimado)", 
            price: 45.50, 
            delivery_time: 3, 
            company: "Correios" 
        },
        { 
            id: 3, 
            name: "Transportadora", 
            price: 35.00, 
            delivery_time: 5, 
            company: "Jadlog" 
        }
    ];
}