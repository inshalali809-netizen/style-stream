import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import heroMain from "@/assets/hero-main.jpg";
import heroSecondary from "@/assets/hero-secondary.jpg";
import { products } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const bestsellers = products.filter((p) => p.bestseller);

  return (
    <div>
      {/* HERO — magazine split */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-[1500px] grid-cols-12 gap-4 px-5 py-8 md:px-10 md:py-12">
          <div className="col-span-12 flex flex-col justify-between md:col-span-5">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                Vol. 04 · Autumn / Winter 26
              </p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 font-display text-[clamp(3.5rem,9vw,8rem)] leading-[0.9] tracking-tight"
              >
                QUIET<br />FORM,<br /><span className="italic font-body font-light text-[0.78em] tracking-normal">made to last.</span>
              </motion.h1>
            </div>
            <div className="mt-10 flex flex-col gap-6 md:mt-0">
              <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
                Twelve pieces. Natural fibres. Cut and sewn in a single Porto
                workshop. The new collection arrives.
              </p>
              <Link
                to="/shop"
                className="group inline-flex w-fit items-center gap-3 bg-primary px-7 py-4 text-xs uppercase tracking-[0.3em] text-primary-foreground transition-all hover:gap-5"
              >
                Shop the edit
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="col-span-12 md:col-span-7">
            <div className="grid grid-cols-5 grid-rows-6 gap-4 h-[70vh] min-h-[520px]">
              <motion.div
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="col-span-3 row-span-6 overflow-hidden bg-muted"
              >
                <img src={heroMain} alt="Linen Atelier suit" className="h-full w-full object-cover" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="col-span-2 row-span-4 overflow-hidden bg-muted"
              >
                <img src={heroSecondary} alt="Camel coat" className="h-full w-full object-cover" loading="lazy" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="col-span-2 row-span-2 flex flex-col justify-center bg-accent p-6 text-accent-foreground"
              >
                <p className="text-xs uppercase tracking-[0.3em] opacity-80">Editorial</p>
                <p className="mt-2 font-display text-2xl leading-tight">Inside the Porto workshop →</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="mx-auto max-w-[1500px] px-5 py-24 md:px-10">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">№ 02</p>
            <h2 className="mt-3 font-display text-5xl tracking-wide md:text-7xl">
              The bestsellers
            </h2>
          </div>
          <Link to="/shop" className="hidden text-xs uppercase tracking-[0.3em] underline-grow md:block">
            View all 8 pieces →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {bestsellers.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* EDITORIAL band */}
      <section className="border-y border-border bg-secondary">
        <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-24 md:grid-cols-2 md:px-10 md:py-32">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Manifesto</p>
            <h3 className="mt-4 font-display text-4xl leading-[1.05] md:text-6xl">
              Slow design,<br /> honest materials,<br /> garments worn for years —<br /> not seasons.
            </h3>
          </div>
          <div className="flex flex-col justify-end gap-6">
            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              We work with linen, organic cotton, undyed cashmere and recycled
              wool. Every piece carries the maker's mark and a lifetime repair
              guarantee. Less, but better — chosen with intention.
            </p>
            <Link to="/about" className="inline-flex w-fit items-center gap-3 text-xs uppercase tracking-[0.3em] underline-grow">
              Read the journal →
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-[1500px] px-5 py-24 md:px-10">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Outerwear", img: products[3].image },
            { label: "Dresses", img: products[4].image },
            { label: "Tailoring", img: products[0].image },
          ].map((c) => (
            <Link
              key={c.label}
              to="/shop"
              search={{ category: c.label === "Tailoring" ? "Bottoms" : c.label } as never}
              className="group relative block aspect-[4/5] overflow-hidden bg-muted"
            >
              <img src={c.img} alt={c.label} loading="lazy" className="img-zoom absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-primary/50 via-transparent p-6">
                <div className="flex w-full items-center justify-between text-primary-foreground">
                  <p className="font-display text-3xl tracking-widest">{c.label}</p>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
