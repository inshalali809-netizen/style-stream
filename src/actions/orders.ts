import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getOptionalUserId } from "@/integrations/supabase/optional-auth";
import { products } from "@/data/products";
import {
  createCheckoutSession,
  isPspConfigured,
  PaymentGatewayNotConfiguredError,
} from "@/actions/psp";
import { calculateShipping } from "@/lib/shipping";

const itemSchema = z.object({
  productId: z.string().max(100),
  size: z.string().max(20),
  quantity: z.number().int().min(1).max(99),
  // Note: no `price` field here on purpose. The price the customer is
  // charged is always looked up server-side from the canonical product
  // catalog below — never trusted from the client.
});

const placeOrderSchema = z.object({
  email: z.string().email().max(255),
  fullName: z.string().min(1).max(120),
  phone: z.string().min(6).max(40),
  address: z.string().min(1).max(255),
  city: z.string().min(1).max(120),
  zip: z.string().min(1).max(20),
  country: z.string().min(1).max(80),
  notes: z.string().max(500).optional(),
  items: z.array(itemSchema).min(1).max(50),
  paymentMethod: z.enum(["easypaisa", "raast", "card", "cod"]),
});

function generateOrderNumber(): string {
  // Unguessable token (not a sequential/timestamp id) since this also acts
  // as the lookup key for the public order-status page.
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const code = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `SS-${code}`;
}

export const placeOrder = createServerFn({ method: "POST" })
  .validator((input: unknown) => placeOrderSchema.parse(input))
  .handler(async ({ data }) => {
    // Recompute every line item's price from the real product catalog —
    // the previous version trusted a `price` field sent by the browser,
    // which meant anyone could edit the request and pay whatever they wanted.
    let subtotalRs = 0;
    const itemsForOrder = data.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Unknown product: ${item.productId}`);
      const lineTotal = product.price * item.quantity;
      subtotalRs += lineTotal;
      return {
        productId: product.id,
        name: product.name,
        size: item.size,
        quantity: item.quantity,
        price: product.price, // snapshot of the verified price, for the receipt
      };
    });

    const shippingRs = calculateShipping(subtotalRs);
    const totalRs = subtotalRs + shippingRs;
    const totalCents = Math.round(totalRs * 100);

    // Only trust a user id we've verified from the bearer token ourselves —
    // never one supplied directly in the request body.
    const userId = await getOptionalUserId();
    const orderNumber = generateOrderNumber();

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: userId,
        email: data.email,
        status: "pending", // becomes 'paid' only via the webhook, or immediately for COD below
        payment_status: "unpaid",
        payment_method: data.paymentMethod,
        total_cents: totalCents,
        currency: "pkr",
        shipping_address: {
          fullName: data.fullName,
          phone: data.phone,
          address: data.address,
          city: data.city,
          zip: data.zip,
          country: data.country,
          notes: data.notes,
        },
        items: itemsForOrder,
      })
      .select("id, order_number")
      .single();

    if (error) {
      console.error("placeOrder: insert failed", error);
      throw new Error("Could not create order");
    }

    // Cash on Delivery needs no gateway — it's payable today even before a
    // PSP is connected. Payment is collected at delivery and marked paid
    // manually by an admin afterwards.
    if (data.paymentMethod === "cod") {
      return { orderNumber: order.order_number, checkoutUrl: null as string | null };
    }

    if (!isPspConfigured()) {
      // The order stays recorded as 'pending' (nothing was charged), and we
      // tell the customer plainly that online payment isn't live yet rather
      // than faking success.
      throw new Error(
        "Online payment isn't connected yet. Please choose Cash on Delivery, or contact us to complete your order."
      );
    }

    try {
      const siteUrl = process.env.SITE_URL ?? "";
      const session = await createCheckoutSession({
        orderNumber: order.order_number!,
        amountCents: totalCents,
        currency: "pkr",
        customerEmail: data.email,
        customerPhone: data.phone,
        paymentMethod: data.paymentMethod,
        successUrl: `${siteUrl}/thank-you?order=${order.order_number}`,
        cancelUrl: `${siteUrl}/checkout`,
        webhookUrl: `${siteUrl}/api/payments/webhook`,
      });

      await supabaseAdmin
        .from("orders")
        .update({ psp_provider: process.env.PSP_PROVIDER ?? "unknown", psp_reference: session.pspReference })
        .eq("id", order.id);

      return { orderNumber: order.order_number, checkoutUrl: session.checkoutUrl };
    } catch (err) {
      if (err instanceof PaymentGatewayNotConfiguredError) {
        throw new Error(
          "Online payment isn't connected yet. Please choose Cash on Delivery, or contact us to complete your order."
        );
      }
      throw err;
    }
  });

const orderStatusSchema = z.object({
  orderNumber: z.string().min(1).max(40),
});

// Public lookup used by the post-checkout / order-status page. Safe because
// orderNumber is an unguessable random token, not a sequential id — knowing
// it is equivalent to holding the receipt link.
export const getOrderStatus = createServerFn({ method: "GET" })
  .validator((input: unknown) => orderStatusSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        "order_number, status, payment_status, payment_method, total_cents, currency, items, shipping_address, created_at"
      )
      .eq("order_number", data.orderNumber)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) throw new Error("Order not found");
    return { order };
  });

export const getMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select(
        "id, order_number, created_at, status, payment_status, payment_method, total_cents, currency, items, shipping_address"
      )
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
  .validator((input: unknown) => profileUpdateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update(data)
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
