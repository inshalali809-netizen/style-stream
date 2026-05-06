import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary">
      <div className="mx-auto grid max-w-[1500px] gap-12 px-5 py-16 md:grid-cols-4 md:px-10">
        <div className="md:col-span-2">
          <p className="font-display text-3xl tracking-[0.15em]">ATELIER ÖRA</p>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Considered garments made in small batches from natural fibres.
            Designed in Copenhagen, woven in Portugal.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-8 flex max-w-sm border-b border-foreground"
          >
            <input
              type="email"
              required
              placeholder="Your email"
              className="flex-1 bg-transparent py-3 text-sm placeholder:text-muted-foreground focus:outline-none"
            />
            <button className="text-xs uppercase tracking-[0.3em]">Subscribe →</button>
          </form>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Shop</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/shop" className="underline-grow">All</Link></li>
            <li><Link to="/shop" className="underline-grow">New arrivals</Link></li>
            <li><Link to="/shop" className="underline-grow">Outerwear</Link></li>
            <li><Link to="/shop" className="underline-grow">Dresses</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">House</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/about" className="underline-grow">Atelier</Link></li>
            <li><a href="#" className="underline-grow">Care guide</a></li>
            <li><a href="#" className="underline-grow">Shipping</a></li>
            <li><a href="#" className="underline-grow">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-3 px-5 py-6 text-xs uppercase tracking-[0.25em] text-muted-foreground md:flex-row md:px-10">
          <p>© {new Date().getFullYear()} Atelier Öra</p>
          <div className="flex items-center gap-5">
            <Instagram className="h-4 w-4" />
            <Twitter className="h-4 w-4" />
            <Youtube className="h-4 w-4" />
          </div>
        </div>
      </div>
    </footer>
  );
}
