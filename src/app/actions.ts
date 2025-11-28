'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// --- PRODUTOS ---

export async function createProduct(formData: FormData) {
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const stock = parseFloat(formData.get('stock') as string);
    const categoryId = formData.get('category') as string;
    const image = formData.get('image') as string;

    // LÊ AS CORES DO FORMULÁRIO (Virá como texto JSON)
    const colorsRaw = formData.get('colorsJson') as string;

    // Se não vier nada, usa uma cor padrão
    const colors = colorsRaw ? JSON.parse(colorsRaw) : [{ name: 'Padrão', hex: '#FFFFFF' }];

    // Busca categoria
    const category = await prisma.category.findUnique({
        where: { id: categoryId }
    });

    if (!category) throw new Error("Categoria não encontrada");

    await prisma.product.create({
        data: {
            name,
            price,
            stock,
            category: categoryId,
            type: category.type,
            image,
            colors: colors // Salva o array de cores dinâmico!
        },
    });

    revalidatePath('/');
    revalidatePath('/admin');
}

export async function deleteProduct(formData: FormData) {
    const id = parseInt(formData.get('id') as string);
    await prisma.product.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath('/admin');
}

// --- CATEGORIAS ---

export async function createCategory(formData: FormData) {
    const name = formData.get('name') as string;
    // Gera ID automático (ex: 'Linho Puro' -> 'linho-puro')
    const id = name.toLowerCase().trim().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const type = formData.get('type') as string;

    await prisma.category.create({
        data: { id, name, type }
    });

    revalidatePath('/');
    revalidatePath('/admin');
}

export async function deleteCategory(formData: FormData) {
    const id = formData.get('id') as string;
    await prisma.category.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath('/admin');
}
// ... (mantenha as importações e funções anteriores de createProduct, etc.)

// --- PEDIDOS (NOVO) ---

export async function createOrder(cartItems: any[], total: number, customerName: string) {
    // Cria o pedido no banco
    const order = await prisma.order.create({
        data: {
            customer: customerName || "Visitante",
            total: total,
            status: "pendente",
            // Cria os itens relacionados magicamente
            items: {
                create: cartItems.map(item => ({
                    productName: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    color: item.selectedColor.name
                }))
            }
        }
    });

    return order.id; // Retorna o ID do pedido para usarmos na mensagem
}
// ... (mantenha todo o código anterior)

// --- GESTÃO DE PEDIDOS (NOVO) ---

export async function updateOrderStatus(formData: FormData) {
    const id = formData.get('id') as string;
    const status = formData.get('status') as string;

    // CORREÇÃO: Verificação de segurança
    // Se por algum motivo o botão não mandar o valor, a função para aqui e não quebra o site.
    if (!id || !status) {
        console.error("Tentativa de atualizar pedido sem ID ou Status");
        return;
    }

    await prisma.order.update({
        where: { id },
        data: { status }
    });

    revalidatePath('/admin');
}