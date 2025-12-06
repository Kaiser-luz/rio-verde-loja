import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const token = process.env.PAGSEGURO_TOKEN; 
    if (!token) return NextResponse.json({ error: "Token ausente." }, { status: 500 });

    const body = await request.json();
    const { orderId } = body;
    if (!orderId) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

    // 1. Busca o pedido e seus itens
    const order = await prisma.order.findUnique({ 
        where: { id: orderId }, 
        include: { items: true } 
    });
    
    if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

    // 2. Prepara os dados do cliente (Reais ou Visitante)
    let customerData = {
        name: "Visitante", 
        email: "cliente@loja.com", 
        tax_id: "00000000000", // CPF genérico para visitante (ideal validar se PagSeguro aceita em Prod)
        phones: [{ country: "55", area: "41", number: "999999999", type: "MOBILE" }]
    };

    // Se o pedido tiver um usuário vinculado, usamos os dados do perfil
    if (order.userId) {
        const profile = await prisma.profile.findUnique({ 
            where: { userId: order.userId } 
        });

        if (profile) {
            // Limpeza de caracteres não numéricos para o padrão da API
            const cleanCPF = profile.cpf?.replace(/\D/g, '') || "00000000000";
            let cleanPhone = profile.phone?.replace(/\D/g, '') || "41999999999";
            
            // Tratamento básico para telefone curto/incompleto
            if (cleanPhone.length < 10) cleanPhone = "41999999999";
            
            customerData = {
                name: profile.name, 
                email: profile.email, 
                tax_id: cleanCPF,
                phones: [{ 
                    country: "55", 
                    area: cleanPhone.substring(0, 2), 
                    number: cleanPhone.substring(2), 
                    type: "MOBILE" 
                }]
            };
        }
    }

    // 3. Monta a lista de itens
    const items = order.items.map(item => ({
      reference_id: item.id,
      name: item.productName,
      quantity: Math.max(1, Math.floor(Number(item.quantity))), // Garante inteiro e > 0
      unit_amount: Math.round(Number(item.price) * 100), // Valor em centavos
    }));

    // 4. Adiciona o Custo de Frete como um item extra (se houver)
    // Para checkout transparente digital, muitas vezes é mais simples adicionar como um item
    if (Number(order.shippingCost) > 0) {
        items.push({
            reference_id: "SHIPPING_COST",
            name: "Frete / Entrega",
            quantity: 1,
            unit_amount: Math.round(Number(order.shippingCost) * 100)
        });
    }

    // 5. Configura Ambiente e URLs
    const isProduction = process.env.NODE_ENV === 'production';
    const apiUrl = isProduction 
        ? 'https://api.pagseguro.com/checkouts' 
        : 'https://sandbox.api.pagseguro.com/checkouts';
    
    // Obtém a URL base (origin) para redirecionamento
    const origin = request.headers.get('origin') || "http://localhost:3000";

    const payload: any = {
      reference_id: order.id,
      expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expira em 24h
      customer: customerData,
      items: items,
      payment_methods: [ 
          { type: "CREDIT_CARD" }, 
          { type: "PIX" }, 
          { type: "BOLETO" } 
      ]
    };

    // PagSeguro exige HTTPS para redirect_url
    if (isProduction || origin.startsWith("https")) {
        payload.redirect_url = `${origin}/sucesso`;
    }

    console.log("📦 Payload enviado ao PagSeguro:", JSON.stringify(payload, null, 2));

    // 6. Envia para o PagSeguro
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}`, 
          'x-api-version': '4.0' 
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // 7. Tratamento de Erros da API
    if (!response.ok) {
        console.error("❌ Erro PagSeguro:", data);
        const errorMsg = data.error_messages?.[0]?.description || 
                         data.message || 
                         "Erro ao criar pagamento";
        return NextResponse.json({ error: `PagSeguro recusou: ${errorMsg}` }, { status: 500 });
    }

    // 8. Retorna o Link de Pagamento
    const paymentLink = data.links.find((link: any) => link.rel === 'PAY')?.href;
    
    if (paymentLink) {
        return NextResponse.json({ url: paymentLink });
    }

    return NextResponse.json({ error: "Link não gerado pela operadora." }, { status: 500 });

  } catch (error: any) {
    console.error("❌ Erro Interno:", error);
    return NextResponse.json({ error: "Erro interno: " + error.message }, { status: 500 });
  }
}