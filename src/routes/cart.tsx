import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/store/cart";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — Atelier Öra" },
      { name: "description", content: "Review the pieces in your bag and proceed to checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, subtotal } = useCart();
  const ship = subtotal() >= 200 || items.length === 0 ? 0 : 12;

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-16 md:px-10 md:py-24">
      <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
        Step 01 of 03
      </p>
      <h1 className="mt-3 font-display text-5xl tracking-wide md:text-7xl">Your bag</h1>

      {items.length === 0 ? (
        <div className="mt-20 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Your bag is empty
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-block border-b border-foreground pb-1 text-xs uppercase tracking-[0.3em]"
          >
            Browse the collection
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-12 md:grid-cols-[1fr_360px]">
          <ul className="divide-y divide-border border-y border-border">
            {items.map((i) => (
              <li key={`${i.product.id}-${i.size}`} className="flex gap-6 py-6">
                <div className="h-40 w-32 shrink-0 overflow-hidden bg-muted">
                  <img src={i.product.image} alt={i.product.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-base font-medium">{i.product.name}</p>
                      <button onClick={() => remove(i.product.id, i.size)} aria-label="Remove">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                      {i.product.color} · Size {i.size}
                    </p>
                    <p className="mt-2 text-sm">${i.product.price}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-border">
                      <button className="px-3 py-2 hover:bg-muted" onClick={() => setQty(i.product.id, i.size, i.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-10 text-center text-sm">{i.quantity}</span>
                      <button className="px-3 py-2 hover:bg-muted" onClick={() => setQty(i.product.id, i.size, i.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-sm font-medium">${i.product.price * i.quantity}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit border border-border bg-secondary p-6">
            <p className="font-display text-2xl tracking-widest">SUMMARY</p>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>${subtotal()}</dd></div>
              <div className="flex justify-between text-muted-foreground"><dt>Shipping</dt><dd>{ship === 0 ? "Free" : `$${ship}`}</dd></div>
              <div className="flex justify-between text-muted-foreground"><dt>Tax (estimated)</dt><dd>Calculated at checkout</dd></div>
            </dl>
            <div className="mt-6 flex justify-between border-t border-border pt-4 text-base font-medium">
              <span>Total</span>
              <span>${subtotal() + ship}</span>
            </div>
            <Link
              to="/checkout"
              className="mt-6 block w-full bg-primary py-4 text-center text-xs uppercase tracking-[0.3em] text-primary-foreground transition hover:bg-primary/90"
            >
              Proceed to checkout
            </Link>
            <Link to="/shop" className="mt-3 block text-center text-xs uppercase tracking-[0.3em] underline-grow">
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
