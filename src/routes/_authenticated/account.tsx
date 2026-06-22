import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getMyOrders, getMyProfile, updateMyProfile } from "@/api/orders.functions";
import { categories } from "@/data/products";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Account — Atelier Öra" }] }),
  component: AccountPage,
});

function AccountPage() {
  const { user, signOut } = useAuth();
  const ordersFn = useServerFn(getMyOrders);
  const profileFn = useServerFn(getMyProfile);
  const updateFn = useServerFn(updateMyProfile);

  const ordersQ = useQuery({ queryKey: ["my-orders"], queryFn: () => ordersFn() });
  const profileQ = useQuery({ queryKey: ["my-profile"], queryFn: () => profileFn() });

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    size_preference: "M",
    address: "",
    city: "",
    zip: "",
    country: "",
    favorites: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const p = profileQ.data?.profile;
    if (!p) return;
    const sa = (p.shipping_address ?? {}) as Record<string, string>;
    setForm({
      full_name: p.full_name ?? "",
      phone: p.phone ?? "",
      size_preference: p.size_preference ?? "M",
      address: sa.address ?? "",
      city: sa.city ?? "",
      zip: sa.zip ?? "",
      country: sa.country ?? "",
      favorites: p.favorite_categories ?? [],
    });
  }, [profileQ.data]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await updateFn({
        data: {
          full_name: form.full_name,
          phone: form.phone,
          size_preference: form.size_preference,
          favorite_categories: form.favorites,
          shipping_address: {
            address: form.address,
            city: form.city,
            zip: form.zip,
            country: form.country,
          },
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const toggleFav = (c: string) =>
    setForm((f) => ({
      ...f,
      favorites: f.favorites.includes(c) ? f.favorites.filter((x) => x !== c) : [...f.favorites, c],
    }));

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-16 md:px-10 md:py-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Your account</p>
          <h1 className="mt-3 font-display text-5xl tracking-wide md:text-7xl">
            Hello, {form.full_name?.split(" ")[0] || user?.email?.split("@")[0]}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <button
          onClick={() => signOut()}
          className="text-xs uppercase tracking-[0.3em] underline-grow"
        >
          Sign out →
        </button>
      </div>

      <div className="mt-16 grid gap-16 md:grid-cols-[1fr_1fr]">
        {/* PROFILE */}
        <section>
          <h2 className="font-display text-2xl tracking-widest">PROFILE</h2>
          <form onSubmit={onSave} className="mt-6 space-y-5">
            <Field label="Full name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
            <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Field label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
            <div className="grid grid-cols-2 gap-5">
              <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
              <Field label="Zip" value={form.zip} onChange={(v) => setForm({ ...form, zip: v })} />
            </div>
            <Field label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Preferred size</p>
              <div className="mt-2 flex gap-2">
                {["XS", "S", "M", "L", "XL"].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setForm({ ...form, size_preference: s })}
                    className={`h-10 w-12 border text-xs ${
                      form.size_preference === s ? "border-foreground bg-primary text-primary-foreground" : "border-border"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Favorite categories</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => toggleFav(c)}
                    className={`border px-4 py-2 text-xs uppercase tracking-[0.2em] ${
                      form.favorites.includes(c)
                        ? "border-foreground bg-primary text-primary-foreground"
                        : "border-border"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-4 w-full bg-primary py-4 text-xs uppercase tracking-[0.3em] text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? "Saving…" : saved ? "Saved ✓" : "Save profile"}
            </button>
          </form>
        </section>

        {/* ORDERS */}
        <section>
          <h2 className="font-display text-2xl tracking-widest">ORDER HISTORY</h2>
          {ordersQ.isLoading && (
            <p className="mt-6 text-xs uppercase tracking-[0.3em] text-muted-foreground">Loading orders…</p>
          )}
          {ordersQ.data?.orders.length === 0 && (
            <div className="mt-6 border border-border bg-secondary p-8 text-center">
              <p className="text-sm text-muted-foreground">No orders yet.</p>
              <Link
                to="/shop"
                className="mt-4 inline-block text-xs uppercase tracking-[0.3em] underline-grow"
              >
                Browse the collection →
              </Link>
            </div>
          )}
          <ul className="mt-6 space-y-4">
            {ordersQ.data?.orders.map((o) => {
              const items = (o.items as Array<{ name: string; quantity: number; size: string }>) ?? [];
              return (
                <li key={o.id} className="border border-border bg-secondary p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-display text-sm tracking-widest">
                      ATL-{o.id.slice(0, 6).toUpperCase()}
                    </p>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      {o.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleDateString(undefined, {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </p>
                  <ul className="mt-3 space-y-1 text-xs">
                    {items.map((it, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{it.name} <span className="text-muted-foreground">— {it.size} · ×{it.quantity}</span></span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm font-medium">
                    <span>Total</span>
                    <span>${(o.total_cents / 100).toFixed(2)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-b border-border bg-transparent py-2 text-sm focus:border-foreground focus:outline-none"
      />
    </label>
  );
}
