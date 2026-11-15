import { create } from 'zustand'

export interface Product {
    id: number
    libelle: string
    prix: number
    quantite: number
}

interface ProductStore {
    products: Product[]
    setProducts: (products: Product[]) => void
}

export const useProduct = create<ProductStore>((set) => ({
    products: [],
    setProducts: (products: Product[]) => set({ products }),
}))
