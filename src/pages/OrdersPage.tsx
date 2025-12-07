// src/pages/OrdersPage.tsx
import { useEffect, useState } from "react";
import { getMyOrders } from "../api/orders.api";
import { Link } from "react-router-dom";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getMyOrders();
        setOrders(res.orders || []);
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center text-xl text-slate-600">
        Loading your orders...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-base sm:text-lg">
      <h1 className="text-3xl font-semibold text-slate-900 mb-8">
        My Orders
      </h1>

      {orders.length === 0 && (
        <p className="text-xl text-gray-500">
          You have not placed any orders yet.
        </p>
      )}

      <div className="space-y-5">
        {orders.map((o) => (
          <Link
            key={o.order_id}
            to={`/orders/${o.order_id}`}
            className="block border border-slate-200 p-5 rounded-2xl shadow-sm hover:bg-slate-50 transition"
          >
            <div className="flex justify-between items-center gap-4">
              <div>
                <p className="font-semibold text-xl text-slate-900">
                  Order #{o.order_number}
                </p>
                <p className="text-base text-gray-500 mt-1">
                  Placed:{" "}
                  {o.placed_at
                    ? new Date(o.placed_at).toLocaleString()
                    : "—"}
                </p>
                <p className="text-base mt-1">
                  Status:{" "}
                  <span className="font-semibold capitalize text-slate-800">
                    {o.status}
                  </span>
                </p>
              </div>

              <div className="text-right font-semibold text-2xl text-slate-900">
                ₹{Number(o.grand_total).toFixed(2)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
