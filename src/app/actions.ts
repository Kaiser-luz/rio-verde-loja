'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { MeasurementType } from '@/lib/types';

// ... (getCategoriesAndProducts, createProfile, getProfileByUserId mantidos)

// --- PEDIDOS (ATUALIZADO PARA RECEBER ENDEREÇO) ---
export async function createOrder(
    cartItems: any[], 
    itemsTotal: number, 
    customerName: string, 
    userId?: string,
    shippingCost: number = 0,
    deliveryMethod: string = 'retirada_loja',
    addressData?: any // Novo parâmetro opcional
) {
    let shippingData = {};

    // 1. Tenta usar o endereço passado explicitamente pelo checkout
    if (addressData) {
        shippingData = {
            shippingZipCode: addressData.zipCode,
            shippingStreet: addressData.street,
            shippingNumber: addressData.number,
            shippingComplement: addressData.complement,
            shippingDistrict: addressData.district,
            shippingCity: addressData.city,
            shippingState: addressData.state,
        };
    } 
    // 2. Se não passou, tenta pegar do perfil (fallback)
    else if (userId) {
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
                create: cartItems.map((item: any) => ({
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

// ... (Resto do arquivo createProduct, etc. mantido igual)
// Para garantir que o arquivo não quebre, vou incluir o restante do conteúdo padrão das actions aqui embaixo de forma resumida para você copiar se precisar.

export async function getCategoriesAndProducts() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  const productsRaw = await prisma.product.findMany();
  const products = productsRaw.map(p => ({
    id: p.id, name: p.name, category: p.category, price: Number(p.price), priceUpholsterer: p.priceUpholsterer ? Number(p.priceUpholsterer) : null,
    stock: Number(p.stock), type: p.type as MeasurementType, image: p.image, colors: p.colors as any, pdfUrl: p.pdfUrl,
    width: p.width ? Number(p.width) : null, weight: p.weight ? Number(p.weight) : null, composition: p.composition
  }));
  return { categories, products };
}

export async function createProfile(data: any) {
    const isApproved = data.role === 'customer';
    await prisma.profile.create({
        data: {
            userId: data.userId, name: data.name, email: data.email, cpf: data.cpf, phone: data.phone,
            role: data.role, cnpj: data.cnpj, approved: isApproved, zipCode: data.zipCode, street: data.street, number: data.number,
            complement: data.complement, district: data.district, city: data.city, state: data.state
        }
    });
}

export async function getProfileByUserId(userId: string) { return await prisma.profile.findUnique({ where: { userId } }); }
export async function getUserOrders(userId: string) {
    if (!userId) return [];
    const orders = await prisma.order.findMany({ where: { userId: userId }, orderBy: { createdAt: 'desc' }, include: { items: true } });
    return orders.map(order => ({ ...order, total: Number(order.total), items: order.items.map((item:any) => ({ ...item, quantity: Number(item.quantity), price: Number(item.price) })) }));
}
export async function updateOrderStatus(formData: FormData) { const id = formData.get('id') as string; const status = formData.get('status') as string; if (!id || !status) return; await prisma.order.update({ where: { id }, data: { status } }); revalidatePath('/admin'); }
export async function createProduct(formData: FormData) {
    const name = formData.get('name') as string; const price = parseFloat(formData.get('price') as string); const priceUpholstererRaw = formData.get('priceUpholsterer') as string; const priceUpholsterer = priceUpholstererRaw ? parseFloat(priceUpholstererRaw) : price; const stock = parseFloat(formData.get('stock') as string); const categoryId = formData.get('category') as string; const image = formData.get('image') as string; const pdfUrl = formData.get('pdfUrl') as string; const widthRaw = formData.get('width') as string; const width = widthRaw ? parseFloat(widthRaw) : null; const weightRaw = formData.get('weight') as string; const weight = weightRaw ? parseFloat(weightRaw) : null; const composition = formData.get('composition') as string; const colorsRaw = formData.get('colorsJson') as string; const colors = colorsRaw ? JSON.parse(colorsRaw) : []; const category = await prisma.category.findUnique({ where: { id: categoryId } }); if (!category) throw new Error("Categoria não encontrada");
    await prisma.product.create({ data: { name, price, priceUpholsterer, stock, category: categoryId, type: category.type, image, colors, pdfUrl: pdfUrl || null, width, weight, composition: composition || null }, }); revalidatePath('/'); revalidatePath('/admin');
}
export async function deleteProduct(formData: FormData) { const id = parseInt(formData.get('id') as string); await prisma.product.delete({ where: { id } }); revalidatePath('/'); revalidatePath('/admin'); }
export async function createCategory(formData: FormData) { const name = formData.get('name') as string; const id = name.toLowerCase().trim().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, ""); const type = formData.get('type') as string; try { await prisma.category.create({ data: { id, name, type } }); } catch (error: any) { if (error.code !== 'P2002') throw error; } revalidatePath('/'); revalidatePath('/admin'); }
export async function deleteCategory(formData: FormData) { const id = formData.get('id') as string; try { await prisma.category.delete({ where: { id } }); } catch (error) { console.error(error); } revalidatePath('/'); revalidatePath('/admin'); }
export async function getPendingUsers() { return await prisma.profile.findMany({ where: { role: 'upholsterer', approved: false }, orderBy: { createdAt: 'desc' } }); }
export async function approveUser(formData: FormData) { const userId = formData.get('userId') as string; await prisma.profile.update({ where: { userId }, data: { approved: true } }); revalidatePath('/admin'); }
export async function rejectUser(formData: FormData) { const userId = formData.get('userId') as string; await prisma.profile.delete({ where: { userId } }); revalidatePath('/admin'); }