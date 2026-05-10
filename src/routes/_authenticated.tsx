import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated")({
  component: AuthGuard,
});

function AuthGuard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login", search: { redirect: window.location.pathname } });
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-md px-5 py-32 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Loading…</p>
      </div>
    );
  }
  return <Outlet />;
}
