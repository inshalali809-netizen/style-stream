import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl tracking-widest">404</h1>
        <p className="mt-4 text-sm uppercase tracking-[0.3em] text-muted-foreground">
          This page is out of stock
        </p>
        <Link
          to="/"
          className="mt-8 inline-block border-b border-foreground pb-1 text-xs uppercase tracking-[0.3em]"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Atelier Öra — Considered garments, made in small batches" },
      { name: "description", content: "Modern, considered clothing crafted from natural fibres. Outerwear, dresses, knitwear and tailoring." },
      { property: "og:title", content: "Atelier Öra" },
      { property: "og:description", content: "Considered garments, made in small batches." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
