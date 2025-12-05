import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // TOKEN SANDBOX (Mantenha o que já está funcionando)
    const token = "e75d9de4-0fcd-4e99-8f65-c05627c6026c1c23e08f479cb85e966adb6112557ab11fb6-538e-4661-b0f6-ae5e5afcebb7"; 

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

    const items = order.items.map(item => ({
      reference_id: item.id,
      name: item.productName,
      quantity: Number(item.quantity),
      unit_amount: Math.round(Number(item.price) * 100),
    }));

    // Detecta se é Produção (HTTPS)
    const origin = request.headers.get('origin') || "http://localhost:3000";
    const isProduction = origin.startsWith("https://");

    const payload: any = {
      reference_id: order.id,
      expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      customer: {
        name: "Cliente Teste Sandbox",
        email: `cliente_${Date.now()}@sandbox.pagseguro.com.br`, // Email único
        tax_id: "12345678909",
        phones: [{ country: "55", area: "11", number: "999999999", type: "MOBILE" }]
      },
      items: items
    };

    // CORREÇÃO CRÍTICA: Só envia redirect_url e notification_urls se for HTTPS
    // O PagSeguro Sandbox rejeita http://localhost no redirect_url com erro 40002
    if (isProduction) {
      payload.redirect_url = `${origin}/sucesso`;
      payload.notification_urls = [`${origin}/api/webhook/pagseguro`];
    }
    // Em localhost, não enviamos nada. O link será gerado, mas o cliente terá que voltar manualmente.

    console.log("📦 Enviando payload para PagSeguro...");

    const response = await fetch('https://sandbox.api.pagseguro.com/checkouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-api-version': '4.0'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ ERRO PAGSEGURO:", JSON.stringify(data, null, 2));
      const errorMsg = data.error_messages?.[0]?.description || data.message || "Erro desconhecido";
      return NextResponse.json({ error: `PagSeguro: ${errorMsg}` }, { status: 500 });
    }

    // Procura o Link de Pagamento
    const paymentLink = data.links.find((link: any) => link.rel === 'PAY')?.href;

    if (paymentLink) {
        return NextResponse.json({ url: paymentLink });
    }

    return NextResponse.json({ error: "Link não gerado." }, { status: 500 });

  } catch (error: any) {
    console.error("❌ ERRO INTERNO:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}