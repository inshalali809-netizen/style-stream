import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminOrders, updateOrderStatus } from "@/api/orders.functions";
import { formatPKR } from "@/lib/currency";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Atelier Öra" }] }),
  component: AdminPage,
});

type OrderStatus = "pending" | "paid" | "fulfilled" | "cancelled" | "refunded";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  paid:      "bg-blue-100 text-blue-800",
  fulfilled: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded:  "bg-gray-100 text-gray-800",
};

const STATUS_OPTIONS: OrderStatus[] = ["pending", "paid", "fulfilled", "cancelled", "refunded"];

function AdminPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const getOrdersFn = useServerFn(getAdminOrders);
  const updateStatusFn = useServerFn(updateOrderStatus);

  const ordersQ = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => getOrdersFn(),
    retry: false,
  });

  const statusMut = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateStatusFn({ data: { orderId, status } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-orders"] }),
  });

  if (ordersQ.error) {
    const msg = ordersQ.error instanceof Error ? ordersQ.error.message : String(ordersQ.error);
    return (
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <h1 className="font-display text-4xl tracking-wide">Access denied</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          {msg.includes("403") || msg.includes("Forbidden")
            ? "Your account doesn't have admin access."
            : `Error: ${msg}`}
        </p>
      </div>
    );
  }

  const orders = ordersQ.data?.orders ?? [];

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-24">
      <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Atelier Öra</p>
      <h1 className="mt-3 font-display text-5xl tracking-wide md:text-7xl">Orders</h1>
      <p className="mt-2 text-xs text-muted-foreground">Logged in as {user?.email}</p>

      {ordersQ.isLoading && (
        <p className="mt-16 text-xs uppercase tracking-[0.3em] text-muted-foreground">Loading…</p>
      )}

      {!ordersQ.isLoading && orders.length === 0 && (
        <div className="mt-16 border border-border bg-secondary p-12 text-center">
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        </div>
      )}

      {orders.length > 0 && (
        <div className="mt-10 space-y-4">
          {orders.map((order) => {
            const addr = (order.shipping_address ?? {}) as Record<string, string>;
            const items = (order.items ?? []) as Array<{
              name: string; size: string; quantity: number; price: number;
            }>;
            const status = order.status as OrderStatus;

            return (
              <div key={order.id} className="border border-border bg-background p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-mono text-xs text-muted-foreground">
                      ATL-{order.id.slice(0, 6).toUpperCase()}
                    </p>
                    <p className="text-sm font-medium">{order.email}</p>
                    {addr.fullName && (
                      <p className="text-xs text-muted-foreground">{addr.fullName}</p>
                    )}
                    {addr.phone && (
                      <p className="text-xs text-muted-foreground">{addr.phone}</p>
                    )}
                    {addr.address && (
                      <p className="text-xs text-muted-foreground">
                        {addr.address}, {addr.city} {addr.zip}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleString("en-PK", {
                        dateStyle: "medium", timeStyle: "short",
                      })}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <p className="text-lg font-medium">
                      {formatPKR(order.total_cents / 100)}
                    </p>
                    <span className={`rounded px-2 py-0.5 text-xs font-medium uppercase tracking-wider ${STATUS_COLORS[status]}`}>
                      {status}
                    </span>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                      {order.payment_method}
                    </span>
                  </div>
                </div>

                <ul className="mt-4 divide-y divide-border border-t border-border">
                  {items.map((item, idx) => (
                    <li key={idx} className="flex justify-between py-2 text-xs">
                      <span>{item.name} · {item.size} × {item.quantity}</span>
                      <span>{formatPKR(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Update status:
                  </span>
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      disabled={s === status || statusMut.isPending}
                      onClick={() => statusMut.mutate({ orderId: order.id, status: s })}
                      className={`border px-3 py-1 text-xs uppercase tracking-[0.2em] transition disabled:opacity-40 ${
                        s === status
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
