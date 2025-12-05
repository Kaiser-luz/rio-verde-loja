'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// --- USUÁRIOS ---

export async function createProfile(data: { userId: string, name: string, email: string, cpf: string, phone: string, role: string, cnpj?: string }) {
    // Regra de Negócio:
    // Se for 'customer' (cliente normal), já nasce Aprovado (true).
    // Se for 'upholsterer' (estofador), nasce Pendente (false) e precisa de aprovação.
    const isApproved = data.role === 'customer';

    await prisma.profile.create({
        data: {
            userId: data.userId,
            name: data.name,
            email: data.email,
            cpf: data.cpf,
            phone: data.phone,
            role: data.role,
            cnpj: data.cnpj, // Salva o CNPJ se tiver
            approved: isApproved
        }
    });
}

export async function getProfileByUserId(userId: string) {
    return await prisma.profile.findUnique({
        where: { userId }
    });
}

// --- ADMINISTRAÇÃO DE USUÁRIOS (NOVO) ---

// Busca usuários que estão esperando aprovação
export async function getPendingUsers() {
    return await prisma.profile.findMany({
        where: {
            role: 'upholsterer',
            approved: false
        },
        orderBy: { createdAt: 'desc' }
    });
}

// Aprova um estofador
export async function approveUser(formData: FormData) {
    const userId = formData.get('userId') as string;
    await prisma.profile.update({
        where: { userId },
        data: { approved: true }
    });
    revalidatePath('/admin');
}

// Rejeita/Deleta um cadastro (opcional)
export async function rejectUser(formData: FormData) {
    const userId = formData.get('userId') as string;
    // Aqui poderíamos deletar o profile ou marcar como rejeitado. 
    // Vamos deletar para ele poder tentar de novo.
    await prisma.profile.delete({
        where: { userId }
    });
    revalidatePath('/admin');
}

// --- PEDIDOS ---

export async function createOrder(cartItems: any[], total: number, customerName: string, userId?: string) {
    const order = await prisma.order.create({
        data: {
            customer: customerName || "Visitante",
            userId: userId || null,
            total: total,
            status: "pendente",
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

    return order.id;
}

export async function getUserOrders(userId: string) {
    if (!userId) return [];

    const orders = await prisma.order.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
        include: { items: true }
    });

    return orders.map(order => ({
        ...order,
        total: Number(order.total),
        items: order.items.map(item => ({
            ...item,
            quantity: Number(item.quantity),
            price: Number(item.price)
        }))
    }));
}

export async function updateOrderStatus(formData: FormData) {
    const id = formData.get('id') as string;
    const status = formData.get('status') as string;

    if (!id || !status) return;

    await prisma.order.update({
        where: { id },
        data: { status }
    });

    revalidatePath('/admin');
}

// --- PRODUTOS ---

export async function createProduct(formData: FormData) {
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);

    const priceUpholstererRaw = formData.get('priceUpholsterer') as string;
    const priceUpholsterer = priceUpholstererRaw ? parseFloat(priceUpholstererRaw) : price;

    const stock = parseFloat(formData.get('stock') as string);
    const categoryId = formData.get('category') as string;
    const image = formData.get('image') as string;

    const colorsRaw = formData.get('colorsJson') as string;
    const colors = colorsRaw ? JSON.parse(colorsRaw) : [];

    const category = await prisma.category.findUnique({
        where: { id: categoryId }
    });

    if (!category) throw new Error("Categoria não encontrada");

    await prisma.product.create({
        data: {
            name,
            price,
            priceUpholsterer,
            stock,
            category: categoryId,
            type: category.type,
            image,
            colors
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
    const id = name.toLowerCase().trim().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const type = formData.get('type') as string;

    try {
        await prisma.category.create({
            data: { id, name, type }
        });
    } catch (error: any) {
        if (error.code !== 'P2002') {
            throw error;
        }
    }

    revalidatePath('/');
    revalidatePath('/admin');
}

export async function deleteCategory(formData: FormData) {
    const id = formData.get('id') as string;
    try {
        await prisma.category.delete({ where: { id } });
    } catch (error) {
        console.error("Erro ao deletar categoria:", error);
    }
    revalidatePath('/');
    revalidatePath('/admin');
}