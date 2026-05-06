import { Link } from "@tanstack/react-router";
import { X, Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/store/cart";

export function CartDrawer() {
  const { isOpen, toggle, items, setQty, remove, subtotal } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => toggle(false)}
            className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <h2 className="font-display text-2xl tracking-widest">YOUR BAG · {items.length}</h2>
              <button onClick={() => toggle(false)} aria-label="Close cart">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
                    Your bag is empty
                  </p>
                  <Link
                    to="/shop"
                    onClick={() => toggle(false)}
                    className="border-b border-foreground pb-1 text-xs uppercase tracking-[0.3em]"
                  >
                    Browse the collection
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {items.map((i) => (
                    <li key={`${i.product.id}-${i.size}`} className="flex gap-4 py-5">
                      <div className="h-28 w-20 shrink-0 overflow-hidden bg-muted">
                        <img
                          src={i.product.image}
                          alt={i.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex justify-between gap-2">
                            <p className="text-sm font-medium">{i.product.name}</p>
                            <p className="text-sm">${i.product.price * i.quantity}</p>
                          </div>
                          <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                            {i.product.color} · Size {i.size}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-border">
                            <button
                              className="px-2 py-1 hover:bg-muted"
                              onClick={() => setQty(i.product.id, i.size, i.quantity - 1)}
                              aria-label="Decrease"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm">{i.quantity}</span>
                            <button
                              className="px-2 py-1 hover:bg-muted"
                              onClick={() => setQty(i.product.id, i.size, i.quantity + 1)}
                              aria-label="Increase"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => remove(i.product.id, i.size)}
                            className="text-xs uppercase tracking-widest text-muted-foreground underline-grow"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border px-6 py-5">
                <div className="mb-4 flex justify-between text-sm uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>${subtotal()}</span>
                </div>
                <Link
                  to="/checkout"
                  onClick={() => toggle(false)}
                  className="block w-full bg-primary py-4 text-center text-xs uppercase tracking-[0.3em] text-primary-foreground transition hover:bg-primary/90"
                >
                  Checkout
                </Link>
                <Link
                  to="/cart"
                  onClick={() => toggle(false)}
                  className="mt-3 block text-center text-xs uppercase tracking-[0.3em] underline-grow"
                >
                  View bag
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
