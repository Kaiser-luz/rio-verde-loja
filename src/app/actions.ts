'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { MeasurementType } from '@/lib/types';

// ... (código existente de User, Profile, Order mantido)

// --- FUNÇÃO DE BUSCA DE DADOS PARA A HOME ---
export async function getCategoriesAndProducts() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  const productsRaw = await prisma.product.findMany();

  // Converte Decimal para Number para o Frontend não reclamar
  const products = productsRaw.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: Number(p.price),
    priceUpholsterer: p.priceUpholsterer ? Number(p.priceUpholsterer) : null,
    stock: Number(p.stock),
    type: p.type as MeasurementType,
    image: p.image,
    colors: p.colors as any,
    pdfUrl: p.pdfUrl
  }));

  return { categories, products };
}

// ... (restante das funções createProduct, createOrder, etc. mantidas)
// Vou recolocar o conteúdo completo do actions.ts aqui para garantir que nada se perca, 
// adicionando a nova função e mantendo as anteriores.

// --- USUÁRIOS (COM ENDEREÇO) ---

interface CreateProfileData {
    userId: string;
    name: string;
    email: string;
    cpf: string;
    phone: string;
    role: string;
    cnpj?: string;
    // Endereço
    zipCode?: string;
    street?: string;
    number?: string;
    complement?: string;
    district?: string;
    city?: string;
    state?: string;
}

export async function createProfile(data: CreateProfileData) {
    const isApproved = data.role === 'customer';

    await prisma.profile.create({
        data: {
            userId: data.userId,
            name: data.name,
            email: data.email,
            cpf: data.cpf,
            phone: data.phone,
            role: data.role,
            cnpj: data.cnpj,
            approved: isApproved,
            zipCode: data.zipCode,
            street: data.street,
            number: data.number,
            complement: data.complement,
            district: data.district,
            city: data.city,
            state: data.state
        }
    });
}

export async function getProfileByUserId(userId: string) {
    return await prisma.profile.findUnique({
        where: { userId }
    });
}

// --- PEDIDOS (COM FRETE E LOGÍSTICA) ---

export async function createOrder(
    cartItems: any[], 
    itemsTotal: number, 
    customerName: string, 
    userId?: string,
    shippingCost: number = 0,
    deliveryMethod: string = 'retirada_loja'
) {
    let shippingData = {};

    if (userId) {
        const profile = await prisma.profile.findUnique({ where: { userId } });
        if (profile) {
            shippingData = {
                shippingZipCode: profile.zipCode,
                shippingStreet: profile.street,
                shippingNumber: profile.number,
                shippingComplement: profile.complement,
                shippingDistrict: profile.district,
                shippingCity: profile.city,
                shippingState: profile.state,
            };
        }
    }

    const finalTotal = itemsTotal + shippingCost;

    const order = await prisma.order.create({
        data: {
            customer: customerName || "Visitante",
            userId: userId || null,
            total: finalTotal,
            status: "pendente",
            shippingCost: shippingCost,
            deliveryMethod: deliveryMethod,
            ...shippingData,
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
    await prisma.order.update({ where: { id }, data: { status } });
    revalidatePath('/admin');
}

// --- PRODUTOS (COM PDF) ---

export async function createProduct(formData: FormData) {
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const priceUpholstererRaw = formData.get('priceUpholsterer') as string;
    const priceUpholsterer = priceUpholstererRaw ? parseFloat(priceUpholstererRaw) : price;
    const stock = parseFloat(formData.get('stock') as string);
    const categoryId = formData.get('category') as string;
    const image = formData.get('image') as string;
    const pdfUrl = formData.get('pdfUrl') as string;
    const colorsRaw = formData.get('colorsJson') as string;
    const colors = colorsRaw ? JSON.parse(colorsRaw) : [];

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
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
            colors,
            pdfUrl: pdfUrl || null
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

export async function createCategory(formData: FormData) {
    const name = formData.get('name') as string;
    const id = name.toLowerCase().trim().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const type = formData.get('type') as string;
    try { await prisma.category.create({ data: { id, name, type } }); } catch (error: any) { if (error.code !== 'P2002') throw error; }
    revalidatePath('/');
    revalidatePath('/admin');
}

export async function deleteCategory(formData: FormData) {
    const id = formData.get('id') as string;
    try { await prisma.category.delete({ where: { id } }); } catch (error) { console.error(error); }
    revalidatePath('/');
    revalidatePath('/admin');
}

// Admin Users Actions
export async function getPendingUsers() {
    return await prisma.profile.findMany({ where: { role: 'upholsterer', approved: false }, orderBy: { createdAt: 'desc' } });
}
export async function approveUser(formData: FormData) {
    const userId = formData.get('userId') as string;
    await prisma.profile.update({ where: { userId }, data: { approved: true } });
    revalidatePath('/admin');
}
export async function rejectUser(formData: FormData) {
    const userId = formData.get('userId') as string;
    await prisma.profile.delete({ where: { userId } });
    revalidatePath('/admin');
}