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

export interface CartItem extends Product {
    quantity: number;
    selectedColor: ProductColor;
}

export interface Category {
    id: string;
    name: string;
    type: MeasurementType;
}