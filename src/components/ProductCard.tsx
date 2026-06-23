import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { DbProduct } from "@/actions/products";
import { useCart } from "@/store/cart";
import { formatPKR } from "@/lib/currency";

export function ProductCard({ product, index = 0 }: { product: DbProduct; index?: number }) {
  const add = useCart((s) => s.add);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link to="/shop" className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <img
            src={product.image_url ?? ""}
            alt={product.name}
            loading="lazy"
            className="img-zoom absolute inset-0 h-full w-full object-cover"
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              add(product);
            }}
            className="absolute bottom-3 left-3 right-3 translate-y-2 bg-background/95 py-3 text-xs uppercase tracking-[0.3em] opacity-0 backdrop-blur-md transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"
          >
            Quick add
          </button>
        </div>
      </Link>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{product.name}</p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {product.color}
          </p>
        </div>
        <p className="text-sm">{formatPKR(product.price)}</p>
      </div>
    </motion.div>
  );
}