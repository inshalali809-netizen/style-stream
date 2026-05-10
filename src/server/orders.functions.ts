import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const itemSchema = z.object({
  productId: z.string().max(100),
  name: z.string().max(200),
  size: z.string().max(20),
  quantity: z.number().int().min(1).max(99),
  price: z.number().min(0).max(100000),
});

const createOrderSchema = z.object({
  email: z.string().email().max(255),
  fullName: z.string().min(1).max(120),
  phone: z.string().max(40).optional(),
  address: z.string().min(1).max(255),
  city: z.string().min(1).max(120),
  zip: z.string().min(1).max(20),
  country: z.string().min(1).max(80),
  notes: z.string().max(500).optional(),
  items: z.array(itemSchema).min(1).max(50),
  totalCents: z.number().int().min(1).max(10_000_000),
  userId: z.string().uuid().nullable().optional(),
});

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => createOrderSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: data.userId ?? null,
        email: data.email,
        status: "paid",
        total_cents: data.totalCents,
        currency: "usd",
        shipping_address: {
          fullName: data.fullName,
          phone: data.phone,
          address: data.address,
          city: data.city,
          zip: data.zip,
          country: data.country,
          notes: data.notes,
        },
        items: data.items,
      })
      .select("id")
      .single();

    if (error) {
      console.error("createOrder failed", error);
      throw new Error("Could not create order");
    }
    const orderId = "ATL-" + order.id.slice(0, 6).toUpperCase();
    return { id: order.id, orderId };
  });

export const getMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select("id, created_at, status, total_cents, currency, items, shipping_address")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { orders: data ?? [] };
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { profile: data };
  });

const profileUpdateSchema = z.object({
  full_name: z.string().max(120).nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  size_preference: z.string().max(20).nullable().optional(),
  favorite_categories: z.array(z.string().max(40)).max(10).nullable().optional(),
  shipping_address: z
    .object({
      address: z.string().max(255).optional(),
      city: z.string().max(120).optional(),
      zip: z.string().max(20).optional(),
      country: z.string().max(80).optional(),
    })
    .nullable()
    .optional(),
});

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => profileUpdateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update(data)
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
