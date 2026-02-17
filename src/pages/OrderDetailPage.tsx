// src/pages/OrderDetailPage.tsx
import { useEffect, useState } from "react";
import { getOrder, getOrderTimeline } from "../api/orders.api";
import { useParams } from "react-router-dom";

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getOrder(id!);
        setOrder(res.order);
        setItems(res.items);

        const tl = await getOrderTimeline(id!);
        setTimeline(tl.timeline || tl.rows || []);
      } catch (err) {
        console.error("Failed to load order:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="p-6 text-center">Loading order...</div>;
  if (!order) return <div className="p-6 text-center">Order not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">
          Order #{order.order_number}
        </h1>
        <p className="text-gray-500">
          Placed: {order.placed_at ? new Date(order.placed_at).toLocaleString() : "—"}
        </p>
        
      </div>

      {/* ORDER ITEMS */}
      <div className="border bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-xl font-semibold mb-4">Items</h2>

        <div className="divide-y">
          {items.map((it) => (
            <div key={it.id} className="py-3 flex justify-between">
              <div>
                <p className="font-medium">{it.title}</p>
                <p className="text-sm text-gray-500">Qty: {it.quantity}</p>
              </div>

              <div className="text-right">
                
              </div>
            </div>
          ))}
        </div>

        <hr className="my-4" />

        {/* TOTALS */}
        <div className="text-right space-y-1">
          
        </div>
      </div>

      {/* TIMELINE */}
      <div className="border bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-xl font-semibold mb-4">Order Timeline</h2>

        {timeline.length === 0 && (
          <p className="text-gray-500">No timeline updates yet.</p>
        )}

        <div className="space-y-4">
          {timeline.map((t) => (
            <div key={t.id} className="flex gap-4 items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <p className="font-medium capitalize">
                  {t.from_status} → {t.to_status}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(t.changed_at).toLocaleString()}
                </p>
                {t.note && <p className="text-sm mt-1">{t.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
