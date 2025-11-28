// --- DEFINIÇÃO DOS TIPOS ---
export type MeasurementType = 'meter' | 'unit';

export interface ProductColor {
    name: string;
    hex: string;
}

export interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    stock: number;
    type: MeasurementType;
    image: string;
    colors: ProductColor[];
}

export interface Category {
    id: string;
    name: string;
    type: MeasurementType;
}

// --- DADOS DA LOJA ATUALIZADOS ---

export const CATEGORIES: Category[] = [
    { id: 'linho', name: 'Linho Puro', type: 'meter' },
    { id: 'veludo', name: 'Veludo Premium', type: 'meter' },
    { id: 'boucle', name: 'Bouclé', type: 'meter' },
    { id: 'espumas', name: 'Espumas & Enchimentos', type: 'unit' },
    { id: 'colas', name: 'Colas & Adesivos', type: 'unit' },
    // NOVAS CATEGORIAS:
    { id: 'armarinho', name: 'Armarinhos', type: 'unit' },
    { id: 'borrachas', name: 'Borrachas e Pisos', type: 'meter' },
    { id: 'tapetes', name: 'Tapetes', type: 'unit' },
];

// Produtos Iniciais (Mantidos como exemplo, o banco real vai sobrescrever isso na visualização)
export const INITIAL_PRODUCTS: Product[] = [
    {
        id: 1,
        name: 'Linho Rústico Natural',
        category: 'linho',
        price: 89.90,
        stock: 120.5,
        type: 'meter',
        image: 'https://picsum.photos/id/1036/800/600',
        colors: [
            { name: 'Natural', hex: '#E3DAC9' },
            { name: 'Areia', hex: '#C2B280' },
            { name: 'Terracota', hex: '#E2725B' }
        ]
    },
    // ... outros produtos
];