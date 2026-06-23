import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { getProducts, type DbProduct } from "@/actions/products";
import { ProductCard } from "@/components/ProductCard";
import { categories, colors, type Category, type Color } from "@/data/products";

const search = z.object({
  category: z.enum(["Outerwear", "Tops", "Bottoms", "Dresses"]).optional(),
  color: z.string().optional(),
  sort: z.enum(["new", "low", "high"]).optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Shop the Collection — Atelier Öra" },
      { name: "description", content: "Browse outerwear, dresses, knitwear and tailoring from Atelier Öra." },
      { property: "og:title", content: "Shop — Atelier Öra" },
    ],
  }),
  component: Shop,
});

function Shop() {
  const navigate = useNavigate({ from: "/shop" });
  const params = Route.useSearch();
  const [openFilters, setOpenFilters] = useState(false);
  const [allProducts, setAllProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const getProductsFn = useServerFn(getProducts);

  useEffect(() => {
    setLoading(true);
    getProductsFn({ data: {} })
      .then((res) => setAllProducts(res.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = allProducts.slice();
    if (params.category) list = list.filter((p) => p.category === params.category);
    if (params.color) list = list.filter((p) => p.color === params.color);
    if (params.sort === "low") list.sort((a, b) => a.price - b.price);
    if (params.sort === "high") list.sort((a, b) => b.price - a.price);
    return list;
  }, [allProducts, params]);

  const update = (patch: Partial<typeof params>) =>
    navigate({ search: (prev: typeof params) => ({ ...prev, ...patch }) as never });

  return (
    <div>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-24">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
            The Collection · {loading ? "…" : `${filtered.length} pieces`}
          </p>
          <h1 className="mt-4 font-display text-6xl tracking-wide md:text-8xl">
            {params.category ?? "All garments"}
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-[1500px] px-5 py-8 md:px-10">
        <div className="sticky top-16 z-30 -mx-5 mb-8 flex items-center justify-between border-b border-border bg-background/85 px-5 py-4 backdrop-blur md:-mx-10 md:px-10">
          <button
            onClick={() => setOpenFilters((o) => !o)}
            className="text-xs uppercase tracking-[0.3em] underline-grow"
          >
            {openFilters ? "Hide filters −" : "Filters +"}
          </button>
          <select
            value={params.sort ?? "new"}
            onChange={(e) => update({ sort: e.target.value as "new" | "low" | "high" })}
            className="bg-transparent text-xs uppercase tracking-[0.3em] focus:outline-none"
          >
            <option value="new">Sort: New</option>
            <option value="low">Price: Low to high</option>
            <option value="high">Price: High to low</option>
          </select>
        </div>

        {openFilters && (
          <div className="mb-10 grid gap-8 border-b border-border pb-8 md:grid-cols-2">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">Category</p>
              <div className="flex flex-wrap gap-2">
                <Chip active={!params.category} onClick={() => update({ category: undefined })}>All</Chip>
                {categories.map((c) => (
                  <Chip
                    key={c}
                    active={params.category === c}
                    onClick={() => update({ category: params.category === c ? undefined : (c as Category) })}
                  >
                    {c}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">Colour</p>
              <div className="flex flex-wrap gap-2">
                <Chip active={!params.color} onClick={() => update({ color: undefined })}>All</Chip>
                {colors.map((c) => (
                  <Chip
                    key={c}
                    active={params.color === c}
                    onClick={() => update({ color: params.color === c ? undefined : (c as Color) })}
                  >
                    {c}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p className="py-24 text-center text-sm uppercase tracking-[0.3em] text-muted-foreground">
            No pieces match. Adjust your filters.
          </p>
        )}
      </div>
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`border px-4 py-2 text-xs uppercase tracking-[0.25em] transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border hover:border-primary"
      }`}
    >
      {children}
    </button>
  );
}