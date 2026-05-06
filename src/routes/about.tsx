import { createFileRoute, Link } from "@tanstack/react-router";
import heroSecondary from "@/assets/hero-secondary.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Journal — Atelier Öra" },
      { name: "description", content: "Behind the workshop. Slow design, honest materials." },
      { property: "og:title", content: "Journal — Atelier Öra" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div>
      <section className="mx-auto max-w-[1200px] px-5 py-20 md:px-10 md:py-32">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Journal · 01</p>
        <h1 className="mt-6 font-display text-6xl leading-[0.95] tracking-wide md:text-[10rem]">
          Inside the<br />Porto workshop.
        </h1>
      </section>

      <section className="grid gap-10 px-5 md:grid-cols-2 md:px-10 md:gap-16 max-w-[1500px] mx-auto">
        <div className="aspect-[4/5] overflow-hidden bg-muted">
          <img src={heroSecondary} alt="Atelier" className="h-full w-full object-cover" loading="lazy" />
        </div>
        <div className="flex flex-col justify-center gap-6">
          <p className="text-base leading-relaxed">
            Atelier Öra was founded in 2021 with a simple commitment: to make
            fewer, better garments that respect the people who make them and the
            people who wear them. Every piece is cut and sewn in our workshop in
            Porto, Portugal, by a team of nine.
          </p>
          <p className="text-base leading-relaxed text-muted-foreground">
            We work in small production runs — never more than 200 pieces per
            style — using natural fibres traceable to the field. Our linen comes
            from Normandy, our wool from a cooperative in the Pyrénées, our
            cotton from a single organic farm in the Aegean.
          </p>
          <Link to="/shop" className="mt-4 inline-flex w-fit items-center gap-3 bg-primary px-7 py-4 text-xs uppercase tracking-[0.3em] text-primary-foreground">
            See the collection →
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-32 max-w-[1500px] px-5 md:px-10">
        <div className="grid gap-8 border-y border-border py-16 md:grid-cols-3">
          {[
            { n: "200", l: "Max units per style" },
            { n: "9", l: "Hands in the workshop" },
            { n: "100%", l: "Natural fibres" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="font-display text-7xl tracking-widest">{s.n}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
