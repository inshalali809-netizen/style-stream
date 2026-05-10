import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";
import { useCart } from "@/store/cart";
import { useAuth } from "@/hooks/useAuth";
import { createOrder } from "@/server/orders.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Atelier Öra" },
      { name: "description", content: "Secure checkout with multiple payment options." },
    ],
  }),
  component: Checkout,
});

const schema = z.object({
  fullName: z.string().trim().min(2, "Required").max(120),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(6, "Required").max(40),
  address: z.string().trim().min(4, "Required").max(255),
  city: z.string().trim().min(1, "Required").max(120),
  zip: z.string().trim().min(2, "Required").max(20),
  country: z.string().trim().min(2, "Required").max(80),
  notes: z.string().max(500).optional(),
  payment: z.enum(["card", "paypal", "applepay", "googlepay"]),
});

export type CheckoutForm = z.infer<typeof schema>;

function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const createOrderFn = useServerFn(createOrder);
  const [form, setForm] = useState<CheckoutForm>({
    fullName: "", email: user?.email ?? "", phone: "", address: "", city: "", zip: "", country: "",
    notes: "", payment: "card",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const ship = subtotal() >= 200 ? 0 : 12;
  const total = subtotal() + ship;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <h1 className="font-display text-5xl tracking-wide">Nothing to checkout</h1>
        <Link to="/shop" className="mt-8 inline-block border-b border-foreground pb-1 text-xs uppercase tracking-[0.3em]">
          Browse the collection
        </Link>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const errs: Partial<Record<keyof CheckoutForm, string>> = {};
      result.error.issues.forEach((i) => {
        const key = i.path[0] as keyof CheckoutForm;
        errs[key] = i.message;
      });
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    setSubmitError("");
    try {
      const order = await createOrderFn({
        data: {
          email: result.data.email,
          fullName: result.data.fullName,
          phone: result.data.phone,
          address: result.data.address,
          city: result.data.city,
          zip: result.data.zip,
          country: result.data.country,
          notes: result.data.notes,
          totalCents: Math.round(total * 100),
          userId: user?.id ?? null,
          items: items.map((i) => ({
            productId: i.product.id,
            name: i.product.name,
            size: i.size,
            quantity: i.quantity,
            price: i.product.price,
          })),
        },
      });
      const summary = {
        orderId: order.orderId, total,
        items: items.map((i) => ({ name: i.product.name, qty: i.quantity, size: i.size, price: i.product.price })),
        ...result.data,
      };
      sessionStorage.setItem("last-order", JSON.stringify(summary));
      clear();
      navigate({ to: "/thank-you" });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not place order");
      setSubmitting(false);
    }
  };

  const field = (key: keyof CheckoutForm, label: string, type = "text") => (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
      <input
        type={type}
        value={form[key] as string}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="border-b border-border bg-transparent py-2 text-sm focus:border-foreground focus:outline-none"
      />
      {errors[key] && <span className="text-xs text-destructive">{errors[key]}</span>}
    </label>
  );

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-16 md:px-10 md:py-24">
      <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Step 02 of 03</p>
      <h1 className="mt-3 font-display text-5xl tracking-wide md:text-7xl">Checkout</h1>

      <form onSubmit={onSubmit} className="mt-12 grid gap-12 md:grid-cols-[1fr_400px]">
        <div className="space-y-10">
          <section>
            <h2 className="font-display text-2xl tracking-widest">CONTACT</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {field("fullName", "Full name")}
              {field("email", "Email", "email")}
              {field("phone", "Phone", "tel")}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-widest">SHIPPING</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">{field("address", "Address")}</div>
              {field("city", "City")}
              {field("zip", "Zip / Postcode")}
              <div className="md:col-span-2">{field("country", "Country")}</div>
            </div>
            <div className="mt-6">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Notes (optional)</span>
                <textarea
                  rows={3}
                  value={form.notes ?? ""}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="border border-border bg-transparent p-3 text-sm focus:border-foreground focus:outline-none"
                />
              </label>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-widest">PAYMENT</h2>
            <p className="mt-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Encrypted · PCI-compliant gateway
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {[
                { id: "card", label: "Card · Visa / Mastercard / Amex" },
                { id: "paypal", label: "PayPal" },
                { id: "applepay", label: "Apple Pay" },
                { id: "googlepay", label: "Google Pay" },
              ].map((p) => (
                <label
                  key={p.id}
                  className={`flex cursor-pointer items-center gap-3 border p-4 transition ${
                    form.payment === p.id ? "border-primary bg-secondary" : "border-border"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={form.payment === p.id}
                    onChange={() => setForm({ ...form, payment: p.id as CheckoutForm["payment"] })}
                    className="accent-foreground"
                  />
                  <span className="text-sm">{p.label}</span>
                </label>
              ))}
            </div>
            {form.payment === "card" && (
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                <div className="md:col-span-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Card number</span>
                    <input placeholder="•••• •••• •••• ••••" className="border-b border-border bg-transparent py-2 text-sm focus:border-foreground focus:outline-none" />
                  </label>
                </div>
                <label className="flex flex-col gap-1.5 md:col-span-2">
                  <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Expiry</span>
                  <input placeholder="MM / YY" className="border-b border-border bg-transparent py-2 text-sm focus:border-foreground focus:outline-none" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">CVC</span>
                  <input placeholder="•••" className="border-b border-border bg-transparent py-2 text-sm focus:border-foreground focus:outline-none" />
                </label>
              </div>
            )}
          </section>
        </div>

        <aside className="h-fit border border-border bg-secondary p-6 md:sticky md:top-24">
          <p className="font-display text-2xl tracking-widest">ORDER · {items.length}</p>
          <ul className="mt-5 divide-y divide-border">
            {items.map((i) => (
              <li key={`${i.product.id}-${i.size}`} className="flex gap-3 py-3">
                <div className="h-16 w-12 shrink-0 overflow-hidden bg-muted">
                  <img src={i.product.image} alt={i.product.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-medium">{i.product.name}</p>
                  <p className="text-muted-foreground">{i.size} · ×{i.quantity}</p>
                </div>
                <p className="text-xs">${i.product.price * i.quantity}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>${subtotal()}</dd></div>
            <div className="flex justify-between text-muted-foreground"><dt>Shipping</dt><dd>{ship === 0 ? "Free" : `$${ship}`}</dd></div>
          </dl>
          <div className="mt-3 flex justify-between border-t border-border pt-4 text-base font-medium">
            <span>Total</span><span>${total}</span>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 block w-full bg-primary py-4 text-center text-xs uppercase tracking-[0.3em] text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? "Processing…" : `Pay $${total}`}
          </button>
          {submitError && (
            <p className="mt-3 text-center text-xs text-destructive">{submitError}</p>
          )}
          <p className="mt-3 text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            🔒 Secure HTTPS · Demo checkout
          </p>
        </aside>
      </form>
    </div>
  );
}
