import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    console.log("🔄 Iniciando checkout no servidor...");

    try {
        // -------------------------------------------------------------------------
        // TOKEN (Mantenha o que está funcionando)
        // -------------------------------------------------------------------------
        const token = "e75d9de4-0fcd-4e99-8f65-c05627c6026c1c23e08f479cb85e966adb6112557ab11fb6-538e-4661-b0f6-ae5e5afcebb7";
        // -------------------------------------------------------------------------

        const body = await request.json();
        const { orderId } = body;

        // ... Validações ...
        if (!orderId) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
        const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
        if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

        const items = order.items.map(item => ({
            reference_id: item.id,
            name: item.productName,
            quantity: Number(item.quantity),
            unit_amount: Math.round(Number(item.price) * 100),
        }));

        // Configurações de ambiente
        const origin = request.headers.get('origin') || "http://localhost:3000";
        const isProduction = origin.startsWith("https://"); // Só envia redirect se for HTTPS

        // Data de expiração (Obrigatório para Checkout Pro)
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 1); // +1 dia

        const payload: any = {
            reference_id: order.id,
            expiration_date: expirationDate.toISOString(),
            customer: {
                name: "Cliente Teste Sandbox",
                email: "comprador@sandbox.pagseguro.com.br",
                tax_id: "12345678909",
                phones: [{ country: "55", area: "11", number: "999999999", type: "MOBILE" }]
            },
            items: items,
            // CORREÇÃO: Removemos redirect_url se for localhost para evitar erro 40002
            // O PagSeguro bloqueia http://localhost no endpoint /checkouts
        };

        if (isProduction) {
            payload.redirect_url = `${origin}/sucesso`;
        }

        console.log("📦 Criando Checkout Pro...");

        // MUDANÇA CRÍTICA: Endpoint mudou de /orders para /checkouts
        const response = await fetch('https://sandbox.api.pagseguro.com/checkouts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'x-api-version': '4.0' // Mantemos a versão 4
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ ERRO PAGSEGURO:", JSON.stringify(data, null, 2));
            const errorMsg = data.error_messages?.[0]?.description || data.message || "Erro desconhecido";
            return NextResponse.json({ error: `PagSeguro: ${errorMsg}` }, { status: 500 });
        }

        console.log("✅ Checkout criado!");

        // No endpoint /checkouts, o link vem direto em 'links' com rel='PAY' e method='GET'
        const paymentLink = data.links.find((link: any) => link.rel === 'PAY')?.href;

        if (paymentLink) {
            return NextResponse.json({ url: paymentLink });
        }

        return NextResponse.json({ error: "Link de redirecionamento não encontrado." }, { status: 500 });

    } catch (error: any) {
        console.error("❌ ERRO INTERNO:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}