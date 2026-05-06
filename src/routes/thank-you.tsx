import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/thank-you")({
  head: () => ({
    meta: [
      { title: "Thank You — Atelier Öra" },
      { name: "description", content: "Your order has been received." },
    ],
  }),
  component: ThankYou,
});

interface Order {
  orderId: string;
  total: number;
  items: { name: string; qty: number; size: string; price: number }[];
  fullName: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  country: string;
}

function ThankYou() {
  const [order, setOrder] = useState<Order | null>(null);
  useEffect(() => {
    const raw = sessionStorage.getItem("last-order");
    if (raw) setOrder(JSON.parse(raw));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-5 py-20 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-center"
      >
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
          Step 03 of 03 · Order confirmed
        </p>
        <h1 className="mt-6 font-display text-6xl leading-[0.95] tracking-wide md:text-8xl">
          Thank you,<br />
          <span className="italic font-body font-light">{order?.fullName?.split(" ")[0] ?? "friend"}.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
          Your pieces are being prepared with care. A confirmation has been sent to{" "}
          <span className="text-foreground">{order?.email ?? "your email"}</span>.
        </p>
      </motion.div>

      {order && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 border border-border bg-secondary p-8 md:p-10"
        >
          <div className="flex items-center justify-between border-b border-border pb-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Order №</p>
            <p className="font-display text-xl tracking-widest">{order.orderId}</p>
          </div>

          <ul className="mt-6 divide-y divide-border">
            {order.items.map((i, k) => (
              <li key={k} className="flex justify-between py-4 text-sm">
                <span>
                  <span className="font-medium">{i.name}</span>{" "}
                  <span className="text-muted-foreground">— {i.size} · ×{i.qty}</span>
                </span>
                <span>${i.price * i.qty}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-medium">
            <span>Total paid</span>
            <span>${order.total}</span>
          </div>

          <div className="mt-8 grid gap-4 border-t border-border pt-6 text-sm md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Shipping to</p>
              <p className="mt-2">{order.fullName}</p>
              <p className="text-muted-foreground">{order.address}</p>
              <p className="text-muted-foreground">{order.city}, {order.zip}</p>
              <p className="text-muted-foreground">{order.country}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Estimated delivery</p>
              <p className="mt-2">3–5 working days</p>
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">Tracking</p>
              <p className="mt-2">Available within 24 hours</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="mt-12 flex flex-col items-center gap-3">
        <Link
          to="/shop"
          className="bg-primary px-8 py-4 text-xs uppercase tracking-[0.3em] text-primary-foreground transition hover:bg-primary/90"
        >
          Continue shopping
        </Link>
        <a href="#" className="text-xs uppercase tracking-[0.3em] underline-grow">
          Track your order →
        </a>
      </div>
    </div>
  );
}
