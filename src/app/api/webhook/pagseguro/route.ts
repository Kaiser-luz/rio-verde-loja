import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Token fixo (ou do .env) para consultar o status real
const TOKEN = process.env.PAGSEGURO_TOKEN || "e75d9de4-0fcd-4e99-8f65-c05627c6026c1c23e08f479cb85e966adb6112557ab11fb6-538e-4661-b0f6-ae5e5afcebb7";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("🔔 Webhook PagSeguro Recebido:", JSON.stringify(body, null, 2));

    // O PagSeguro manda vários tipos de aviso. Queremos saber de mudança de status.
    const orderIdPagSeguro = body.id; // ID do pedido no PagSeguro (ex: ORDE_...)
    const referenceId = body.reference_id; // NOSSO ID (do banco de dados)
    
    if (!referenceId) {
      return NextResponse.json({ message: "Ignorado: Sem reference_id" }, { status: 200 });
    }

    // Para garantir segurança, não confiamos só no aviso. 
    // Vamos perguntar ao PagSeguro: "Como está esse pedido agora?"
    const checkResponse = await fetch(`https://sandbox.api.pagseguro.com/orders/${orderIdPagSeguro}`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'x-api-version': '4.0'
      }
    });

    if (!checkResponse.ok) {
      console.error("Erro ao confirmar status com PagSeguro");
      return NextResponse.json({ error: "Falha na verificação" }, { status: 500 });
    }

    const orderData = await checkResponse.json();
    
    // Traduz o status do PagSeguro para o nosso sistema
    let newStatus = 'pendente';
    const statusPagSeguro = orderData.charges?.[0]?.status || orderData.status;

    if (statusPagSeguro === 'PAID') newStatus = 'pago';
    if (statusPagSeguro === 'CANCELED' || statusPagSeguro === 'DECLINED') newStatus = 'cancelado';
    if (statusPagSeguro === 'IN_ANALYSIS') newStatus = 'pendente';

    console.log(`🔄 Atualizando Pedido ${referenceId} para: ${newStatus}`);

    // Atualiza no Banco de Dados
    await prisma.order.update({
      where: { id: referenceId },
      data: { status: newStatus }
    });

    return NextResponse.json({ message: "Recebido e Atualizado" }, { status: 200 });

  } catch (error) {
    console.error("Erro no Webhook:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}