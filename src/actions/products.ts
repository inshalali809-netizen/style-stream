import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// The shape the DB returns — matches our products table schema exactly.
export interface DbProduct {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
  color: string;
  description: string;
  bestseller: boolean;
  active: boolean;
}

const filterSchema = z.object({
  category: z.string().optional(),
  color: z.string().optional(),
});

export const getProducts = createServerFn({ method: "GET" })
  .validator((input: unknown) => filterSchema.parse(input ?? {}))
  .handler(async ({ data }): Promise<{ products: DbProduct[] }> => {
    let query = supabaseAdmin
      .from("products")
      .select("id, name, price, image_url, category, color, description, bestseller, active")
      .eq("active", true)
      .order("bestseller", { ascending: false })
      .order("name");

    if (data.category) query = query.eq("category", data.category);
    if (data.color) query = query.eq("color", data.color);

    const { data: rows, error } = await query;
    if (error) {
      console.error("getProducts error:", error);
      throw new Error("Could not load products");
    }
    return { products: rows ?? [] };
  });

export const getBestsellers = createServerFn({ method: "GET" })
  .handler(async (): Promise<{ products: DbProduct[] }> => {
    const { data: rows, error } = await supabaseAdmin
      .from("products")
      .select("id, name, price, image_url, category, color, description, bestseller, active")
      .eq("active", true)
      .eq("bestseller", true)
      .order("name")
      .limit(4);

    if (error) {
      console.error("getBestsellers error:", error);
      throw new Error("Could not load products");
    }
    return { products: rows ?? [] };
  });

export const getCategoryHeroes = createServerFn({ method: "GET" })
  .handler(async (): Promise<{ byCategory: Record<string, DbProduct> }> => {
    // One representative product per category for the home page category panels.
    const { data: rows, error } = await supabaseAdmin
      .from("products")
      .select("id, name, price, image_url, category, color, description, bestseller, active")
      .eq("active", true)
      .order("bestseller", { ascending: false });

    if (error) throw new Error("Could not load products");

    const byCategory: Record<string, DbProduct> = {};
    for (const row of rows ?? []) {
      if (!byCategory[row.category]) byCategory[row.category] = row;
    }
    return { byCategory };
  });
