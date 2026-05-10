import { Link } from "@tanstack/react-router";
import { ShoppingBag, Search, Menu, X, User } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/store/cart";
import { CartDrawer } from "./CartDrawer";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const count = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const toggle = useCart((s) => s.toggle);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  const links = [
    { to: "/shop", label: "Shop" },
    { to: "/shop", label: "Outerwear", search: { category: "Outerwear" } },
    { to: "/shop", label: "Dresses", search: { category: "Dresses" } },
    { to: "/about", label: "Journal" },
  ];

  return (
    <>
      <div className="overflow-hidden border-b border-border bg-primary py-2 text-primary-foreground">
        <div className="marquee flex whitespace-nowrap text-xs uppercase tracking-[0.3em]">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex shrink-0 items-center gap-12 px-6">
              {[
                "Free Shipping over $200",
                "Crafted in small batches",
                "30-day returns",
                "New Drop / Autumn 26",
                "Carbon-neutral delivery",
              ].map((t, i) => (
                <span key={`${k}-${i}`} className="flex items-center gap-12">
                  {t}
                  <span aria-hidden>✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-5 md:px-10">
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <nav className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                search={l.search as never}
                className="text-xs uppercase tracking-[0.25em] underline-grow"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <Link
            to="/"
            className="font-display text-3xl tracking-[0.15em] md:absolute md:left-1/2 md:-translate-x-1/2"
          >
            ATELIER ÖRA
          </Link>

          <div className="flex items-center gap-5">
            <button aria-label="Search" className="hidden md:block">
              <Search className="h-5 w-5" />
            </button>
            <Link
              to={user ? "/account" : "/login"}
              aria-label={user ? "Account" : "Sign in"}
              className="hidden md:block"
            >
              <User className="h-5 w-5" />
            </Link>
            <button
              aria-label="Cart"
              onClick={() => toggle(true)}
              className="relative"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-background p-6 md:hidden">
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute right-5 top-5"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
          <nav className="mt-20 flex flex-col gap-6">
            {links.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                search={l.search as never}
                onClick={() => setMobileOpen(false)}
                className="font-display text-4xl"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <CartDrawer />
    </>
  );
}
