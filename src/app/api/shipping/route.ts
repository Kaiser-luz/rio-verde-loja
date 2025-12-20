import { NextResponse } from 'next/server';

// CEP DA LOJA (Bacacheri)
const ORIGIN_CEP = 82515000; 

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { cep, items } = body;

        // Limpa o CEP
        const cleanCep = cep.replace(/\D/g, '');
        const destinationCepNum = parseInt(cleanCep);

        if (cleanCep.length !== 8) {
            return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
        }

        // --- 1. ANÁLISE DO CARRINHO (Peso/Volume) ---
        let totalMeters = 0;
        let totalUnits = 0;

        items.forEach((item: any) => {
            const qty = Number(item.quantity);
            if (item.type === 'meter') {
                totalMeters += qty;
            } else {
                totalUnits += qty;
            }
        });

        // Regra de Negócio: Carro vs Moto
        const isHeavyLoad = totalMeters > 10 || totalUnits > 5;

        // --- 2. VERIFICAÇÃO DE REGIÃO (CURITIBA E RMC) ---
        // Faixas de CEP: 80xxx a 83xxx geralmente cobrem Curitiba e região metropolitana
        const isLocal = destinationCepNum >= 80000000 && destinationCepNum <= 83800000;

        let shippingOptions = [];

        if (isLocal) {
            // --- CÁLCULO LOCAL (Simulação de KM) ---
            
            const diff = Math.abs(destinationCepNum - ORIGIN_CEP);
            const variation = Math.ceil(diff / 5000) * 0.10; 

            if (isHeavyLoad) {
                // FRETE DE CARRO
                const basePriceCar = 25.00; 
                const finalPrice = basePriceCar + variation;
                
                shippingOptions.push({
                    id: 'local-car',
                    name: "Entrega Expressa (Carro)",
                    price: finalPrice,
                    delivery_time: 1,
                    company: { name: "Logística Própria" }
                });
            } else {
                // FRETE DE MOTO
                const basePriceMoto = 12.00; 
                const finalPrice = basePriceMoto + variation;

                shippingOptions.push({
                    id: 'local-moto',
                    name: "Entrega Expressa (Moto)",
                    price: finalPrice,
                    delivery_time: 1,
                    company: { name: "Logística Própria" }
                });
            }

            // Opção de Retirada sempre disponível para locais
            shippingOptions.push({
                id: 'pickup',
                name: "Retirada na Loja (Bacacheri)",
                price: 0.00,
                delivery_time: 0,
                company: { name: "Loja Física" }
            });

        } else {
            // --- CÁLCULO NACIONAL (DIRECIONAR PARA WHATSAPP) ---
            // Para fora de Curitiba, retornamos uma opção especial que o frontend vai tratar diferente
            
            shippingOptions.push({
                id: 'whatsapp-quote', 
                name: "Frete a Combinar (WhatsApp)", 
                price: 0.00, // Preço zero pois será combinado
                delivery_time: 0, // Indefinido
                company: { name: "Transportadora" },
                isQuote: true // Flag especial para o frontend saber
            });
        }

        // Ordena pelo preço (embora aqui tenhamos poucas opções)
        shippingOptions.sort((a, b) => a.price - b.price);

        return NextResponse.json(shippingOptions);

    } catch (error: any) {
        console.error("Erro no cálculo simulado:", error);
        return NextResponse.json({ error: "Erro interno no cálculo." }, { status: 500 });
    }
}