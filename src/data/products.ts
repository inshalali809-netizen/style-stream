import p1 from "@/assets/product-1.jpg";
import p2 from "@/assets/product-2.jpg";
import p3 from "@/assets/product-3.jpg";
import p4 from "@/assets/product-4.jpg";
import p5 from "@/assets/product-5.jpg";
import p6 from "@/assets/product-6.jpg";
import p7 from "@/assets/product-7.jpg";
import p8 from "@/assets/product-8.jpg";

export type Category = "Outerwear" | "Tops" | "Bottoms" | "Dresses";
export type Color = "Cream" | "Sand" | "White" | "Camel" | "Black" | "Olive" | "Rust";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: Category;
  color: Color;
  description: string;
  bestseller?: boolean;
}

export const products: Product[] = [
  { id: "lin-blazer", name: "Linen Atelier Blazer", price: 289, image: p1, category: "Outerwear", color: "Cream", description: "Unstructured linen blazer with peak lapels.", bestseller: true },
  { id: "wide-trouser", name: "Wide-Leg Trouser 02", price: 178, image: p2, category: "Bottoms", color: "Sand", description: "High-rise pleated trouser, fluid drape.", bestseller: true },
  { id: "core-tee", name: "Heavyweight Core Tee", price: 64, image: p3, category: "Tops", color: "White", description: "12oz combed cotton, boxy oversized fit.", bestseller: true },
  { id: "camel-coat", name: "Camel Long Coat", price: 489, image: p4, category: "Outerwear", color: "Camel", description: "Pure wool double-breasted coat.", bestseller: true },
  { id: "silk-slip", name: "Silk Bias Slip Dress", price: 224, image: p5, category: "Dresses", color: "Black", description: "100% silk charmeuse, midi length." },
  { id: "ribbed-knit", name: "Ribbed Cashmere Knit", price: 198, image: p6, category: "Tops", color: "Cream", description: "Soft rib cashmere blend, relaxed cut." },
  { id: "cargo-pant", name: "Field Cargo Pant", price: 158, image: p7, category: "Bottoms", color: "Olive", description: "Heavy twill utility pant, drawcord hem." },
  { id: "rust-midi", name: "Rust Midi Dress", price: 184, image: p8, category: "Dresses", color: "Rust", description: "Smocked waist, silk-touch viscose." },
];

export const categories: Category[] = ["Outerwear", "Tops", "Bottoms", "Dresses"];
export const colors: Color[] = ["Cream", "Sand", "White", "Camel", "Black", "Olive", "Rust"];
