import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function ProductGrid() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://apiminalgems.exotech.co.in/api/masters/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data?.data || []);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="text-center text-gray-400 py-10">
        Loading Products…
      </div>
    );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {products.map((p) => (
        <div key={p.id} className="product-card border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition">
          
          {/* Image */}
          <div className="h-64 bg-gray-100 flex items-center justify-center">
            <img
              src={p.primary_image_url || "/assets/images/placeholder.jpg"}
              alt={p.name}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="p-4 text-center">
            <h6 className="text-lg font-medium mb-1">{p.name}</h6>

            <div className="flex justify-center items-baseline gap-2">
              <div className="text-black font-semibold">
                ₹{p.price?.toLocaleString()}
              </div>
              <small className="text-gray-500">/ piece</small>
            </div>

            <div className="mt-3 flex justify-center gap-3">
              <Link
                to={`/product/${p.slug}`}
                className="px-3 py-1 border border-black rounded hover:bg-black hover:text-white transition"
              >
                View
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
