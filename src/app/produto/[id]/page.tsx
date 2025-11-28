import { prisma } from '@/lib/prisma';
import { Product, MeasurementType } from '@/lib/types';
import ProductDetail from '@/components/ProductDetail';

// Busca o produto no banco pelo ID
async function getProduct(id: number) {
    // Tratamento de erro caso o ID não seja um número válido
    if (isNaN(id)) return null;

    const p = await prisma.product.findUnique({
        where: { id },
    });

    if (!p) return null;

    // Converte Decimal para Number
    return {
        id: p.id,
        name: p.name,
        category: p.category,
        price: Number(p.price),
        stock: Number(p.stock),
        type: p.type as MeasurementType,
        image: p.image,
        colors: p.colors as any,
    } as Product;
}

// Componente Principal (Servidor)
// CORREÇÃO: params agora é tipado como Promise
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params; // Aguardamos os parâmetros carregarem
    const product = await getProduct(Number(resolvedParams.id));

    if (!product) {
        return <div className="min-h-screen flex items-center justify-center">Produto não encontrado.</div>;
    }

    return <ProductDetail product={product} />;
}