'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { MeasurementType } from '@/lib/types';

// --- BUSCA DE DADOS (DASHBOARD) ---
export async function getAdminData() {
  const productsRaw = await prisma.product.findMany();
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  const pendingUsers = await prisma.profile.findMany({ 
    where: { role: 'upholsterer', approved: false }, 
    orderBy: { createdAt: 'desc' } 
  });
  const orders = await prisma.order.findMany({ 
    orderBy: { createdAt: 'desc' }, 
    include: { items: true } 
  });

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
    pdfUrl: p.pdfUrl,
    width: p.width ? Number(p.width) : null,
    weight: p.weight ? Number(p.weight) : null,
    composition: p.composition
  }));

  return { products, categories, pendingUsers, orders };
}

// --- ATUALIZAÇÃO DE STATUS DE PEDIDO ---
export async function updateOrderStatus(formData: FormData) {
    const id = formData.get('id') as string;
    const status = formData.get('status') as string;
    
    if (!id || !status) return;
    
    await prisma.order.update({ 
        where: { id }, 
        data: { status } 
    });
    
    // Atualiza tanto a home do admin quanto a página de pedidos
    revalidatePath('/admin');
    revalidatePath('/admin/pedidos');
}

// --- GESTÃO DE USUÁRIOS ---
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

// --- GESTÃO DE PRODUTOS ---
export async function createProduct(formData: FormData) {
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const priceUpholstererRaw = formData.get('priceUpholsterer') as string;
    const priceUpholsterer = priceUpholstererRaw ? parseFloat(priceUpholstererRaw) : price;
    const stock = parseFloat(formData.get('stock') as string);
    const categoryId = formData.get('category') as string;
    const image = formData.get('image') as string;
    const pdfUrl = formData.get('pdfUrl') as string;
    
    const widthRaw = formData.get('width') as string;
    const width = widthRaw ? parseFloat(widthRaw) : null;
    
    const weightRaw = formData.get('weight') as string;
    const weight = weightRaw ? parseFloat(weightRaw) : null;
    
    const composition = formData.get('composition') as string;

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
            pdfUrl: pdfUrl || null,
            width, 
            weight, 
            composition: composition || null
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

// --- GESTÃO DE CATEGORIAS ---
export async function createCategory(formData: FormData) {
    const name = formData.get('name') as string;
    const id = name.toLowerCase().trim().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const type = formData.get('type') as string;
    try { 
        await prisma.category.create({ data: { id, name, type } }); 
    } catch (error: any) { 
        if (error.code !== 'P2002') throw error; 
    }
    revalidatePath('/');
    revalidatePath('/admin');
}

export async function deleteCategory(formData: FormData) {
    const id = formData.get('id') as string;
    try { 
        await prisma.category.delete({ where: { id } }); 
    } catch (error) { 
        console.error(error); 
    }
    revalidatePath('/');
    revalidatePath('/admin');
}