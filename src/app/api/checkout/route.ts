import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const token = process.env.PAGSEGURO_TOKEN; 
    if (!token) return NextResponse.json({ error: "Token ausente." }, { status: 500 });

    const body = await request.json();
    const { orderId } = body;

    const order = await prisma.order.findUnique({ 
        where: { id: orderId }, 
        include: { items: true } 
    });
    
    if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

    // DADOS DO CLIENTE
    // Se tiver perfil, usa. Se não, usa os dados do pedido (se salvamos) ou genérico.
    let customerData = {
        name: "Cliente Visitante", 
        email: "cliente@loja.com", 
        tax_id: "00000000000",
        phones: [{ country: "55", area: "41", number: "999999999", type: "MOBILE" }]
    };

    if (order.userId) {
        const profile = await prisma.profile.findUnique({ where: { userId: order.userId } });
        if (profile) {
            const cleanCPF = profile.cpf?.replace(/\D/g, '') || "00000000000";
            let cleanPhone = profile.phone?.replace(/\D/g, '') || "41999999999";
            if (cleanPhone.length < 10) cleanPhone = "41999999999";
            
            customerData = {
                name: profile.name, 
                email: profile.email, 
                tax_id: cleanCPF,
                phones: [{ country: "55", area: cleanPhone.substring(0, 2), number: cleanPhone.substring(2), type: "MOBILE" }]
            };
        }
    }

    // --- CORREÇÃO PARA PAGSEGURO (Inteiros) ---
    const items = order.items.map(item => {
        const qty = Number(item.quantity);
        const price = Number(item.price);
        
        // Se for fração (ex: 1.5 metros), transformamos em 1 unidade com valor total
        // Se for inteiro (ex: 2 tesouras), mandamos normal
        const isFraction = qty % 1 !== 0;

        if (isFraction) {
            return {
                reference_id: item.id,
                name: `${item.productName} (${qty}m)`, // Ex: "Linho (2.5m)"
                quantity: 1, // Sempre inteiro
                unit_amount: Math.round((price * qty) * 100), // Valor total do item em centavos
            };
        } else {
            return {
                reference_id: item.id,
                name: item.productName,
                quantity: qty,
                unit_amount: Math.round(price * 100), // Valor unitário em centavos
            };
        }
    });

    // Frete
    if (Number(order.shippingCost) > 0) {
        items.push({
            reference_id: "SHIPPING",
            name: "Frete / Entrega",
            quantity: 1,
            unit_amount: Math.round(Number(order.shippingCost) * 100)
        });
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const apiUrl = isProduction ? 'https://api.pagseguro.com/checkouts' : 'https://sandbox.api.pagseguro.com/checkouts';
    const origin = request.headers.get('origin') || "http://localhost:3000";

    const payload: any = {
      reference_id: order.id,
      expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      customer: customerData,
      items: items,
      payment_methods: [ { type: "CREDIT_CARD" }, { type: "PIX" }, { type: "BOLETO" } ]
    };

    if (isProduction || origin.startsWith("https")) {
        payload.redirect_url = `${origin}/sucesso`;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'x-api-version': '4.0' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
        const errorMsg = data.error_messages?.[0]?.description || data.message || "Erro desconhecido";
        return NextResponse.json({ error: `PagSeguro: ${errorMsg}` }, { status: 500 });
    }

    const paymentLink = data.links.find((link: any) => link.rel === 'PAY')?.href;
    if (paymentLink) return NextResponse.json({ url: paymentLink });

    return NextResponse.json({ error: "Link não gerado." }, { status: 500 });

  } catch (error: any) {
    return NextResponse.json({ error: "Erro interno: " + error.message }, { status: 500 });
  }
}