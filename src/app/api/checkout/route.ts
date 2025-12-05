import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    console.log("🔄 Iniciando checkout...");

    try {
        // -------------------------------------------------------------------------
        // TOKEN SEGURO (Lê do arquivo .env ou da Vercel)
        // -------------------------------------------------------------------------
        // Removemos o token hardcoded para segurança no Git
        const token = process.env.PAGSEGURO_TOKEN;

        if (!token) {
            console.error("❌ ERRO CRÍTICO: PAGSEGURO_TOKEN não encontrado nas variáveis de ambiente.");
            return NextResponse.json({ error: "Servidor não configurado para pagamentos." }, { status: 500 });
        }
        // -------------------------------------------------------------------------

        const body = await request.json();
        const { orderId } = body;

        // Validações
        if (!orderId) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
        const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
        if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

        const items = order.items.map(item => ({
            reference_id: item.id,
            name: item.productName,
            quantity: Number(item.quantity),
            unit_amount: Math.round(Number(item.price) * 100),
        }));

        // Detecção de Ambiente (Produção vs Localhost)
        const origin = request.headers.get('origin') || "http://localhost:3000";
        // O PagSeguro só aceita Webhooks se o site tiver HTTPS (estiver na internet)
        const isProduction = origin.startsWith("https://");

        // Email único para evitar erro de duplicidade no Sandbox
        const randomEmail = `cliente_${Date.now()}@sandbox.pagseguro.com.br`;

        // Montagem do Payload Dinâmico
        const payload: any = {
            reference_id: order.id,
            customer: {
                name: "Cliente Teste Sandbox",
                email: randomEmail,
                tax_id: "12345678909", // CPF válido para Sandbox
                phones: [{ country: "55", area: "11", number: "999999999", type: "MOBILE" }]
            },
            items: items,
            // O redirect_url geralmente aceita localhost no Sandbox, mas é bom garantir
            redirect_url: `${origin}/sucesso`
        };

        // CORREÇÃO DO ERRO 40002:
        // Só adicionamos o campo notification_urls se estivermos em Produção (HTTPS).
        // Se for localhost, NÃO enviamos esse campo (nem vazio, nem com localhost).
        if (isProduction) {
            payload.notification_urls = [`${origin}/api/webhook/pagseguro`];
        }

        console.log(`📦 Enviando para PagSeguro (Notificações ativas: ${isProduction})...`);

        const response = await fetch('https://sandbox.api.pagseguro.com/orders', {
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
            // Tratamento de erro amigável
            const errorItem = data.error_messages?.[0];
            const errorMsg = errorItem
                ? `${errorItem.code}: ${errorItem.description} (${errorItem.parameter_name || ''})`
                : "Erro desconhecido no PagSeguro";

            return NextResponse.json({ error: errorMsg }, { status: 500 });
        }

        console.log("✅ Pedido criado com sucesso!");

        // Busca o Link de Pagamento (PAY)
        const paymentLink = data.links.find((link: any) => link.rel === 'PAY')?.href;

        if (paymentLink) {
            return NextResponse.json({ url: paymentLink });
        }

        return NextResponse.json({ error: "O PagSeguro não retornou o link de pagamento." }, { status: 500 });

    } catch (error: any) {
        console.error("❌ ERRO INTERNO:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}