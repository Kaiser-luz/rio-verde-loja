import { NextResponse } from 'next/server';

// Token do Melhor Envio (Sandbox/Teste).
// Em produção, você DEVE colocar isso no arquivo .env como MELHOR_ENVIO_TOKEN
const TOKEN = process.env.MELHOR_ENVIO_TOKEN || "SEU_TOKEN_AQUI"; 
const EMAIL = process.env.MELHOR_ENVIO_EMAIL || "email_do_cadastro@loja.com";

// CEP de Origem (Sua loja em Curitiba - Bacacheri)
const FROM_CEP = "82510000"; 

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { cep, items } = body;

        if (!cep || cep.length < 8) {
            return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
        }

        // 1. Prepara os produtos para o formato do Melhor Envio
        const products = items.map((item: any) => ({
            id: String(item.id),
            width: 20, // cm (Mínimo)
            height: 20, // cm
            length: 20, // cm
            weight: item.type === 'meter' ? (item.quantity * 0.5) : (item.quantity * 1), // Peso estimado
            insurance_value: Number(item.price), // Seguro
            quantity: Math.max(1, Math.ceil(item.quantity))
        }));

        // 2. Define URL (Sandbox ou Produção)
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

        // 3. Chama a API do Melhor Envio
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
            console.error("Erro API Melhor Envio:", response.status, errorText);
            
            // Retorna erro específico para o frontend saber que falhou
            // Se quiser manter o fallback fixo para testes, descomente as linhas abaixo:
            /*
            return NextResponse.json([
                { id: 1, name: "PAC (Correios)", price: 28.50, delivery_time: 7, company: { name: "Correios" } },
                { id: 2, name: "SEDEX (Correios)", price: 45.90, delivery_time: 3, company: { name: "Correios" } },
            ]);
            */
           return NextResponse.json({ error: "Falha ao calcular frete na transportadora." }, { status: 502 });
        }

        const data = await response.json();

        // 4. Filtra e Formata a resposta
        const options = data
            .filter((opt: any) => !opt.error) // Remove transportadoras com erro
            .map((opt: any) => ({
                id: opt.id,
                name: opt.name, 
                company: opt.company.name, 
                price: Number(opt.price), 
                delivery_time: opt.delivery_time 
            }))
            .sort((a: any, b: any) => a.price - b.price); // Mais barato primeiro

        return NextResponse.json(options);

    } catch (error: any) {
        console.error("Erro interno cálculo frete:", error);
        return NextResponse.json({ error: "Erro ao calcular frete" }, { status: 500 });
    }
}