import React, { useContext, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";

export default function CartPage() {
  const { cart, refreshCart, updateItemQty, removeItem } =
    useContext(CartContext);

  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = cart?.items || [];

  const subtotal = cart?.total ?? 0;
  const grandTotal = cart?.total ?? 0;

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 font-body text-base sm:text-lg">
      <h1 className="text-3xl font-semibold text-slate-800 mb-8">
        Your Cart
      </h1>

      {/* Empty cart */}
      {items.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-slate-500 text-xl">
            Your cart is empty.
          </p>
          <Link
            to="/products"
            className="mt-6 inline-block px-8 py-3.5 bg-rose-600 text-white rounded-full text-xl font-semibold shadow hover:bg-rose-700 transition"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-[2fr_1fr] gap-10">
          {/* LEFT: Items */}
          <div className="space-y-6">
            {items.map((item: any) => (
              <div
                key={item.item_id}
                className="flex items-center gap-5 p-5 rounded-2xl border border-pink-100 shadow-sm bg-white"
              >
                {/* Product image */}
                <img
                  src={item.primary_image}
                  alt={item.product_title}
                  className="w-28 h-28 object-cover rounded-xl border"
                />

                {/* Item Info */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-800">
                    {item.product_title}
                  </h3>

                  {/* Quantity */}
                  <div className="flex items-center mt-3 gap-3">
                    <button
                      className="px-4 py-1.5 rounded-full border text-xl bg-white hover:bg-slate-100 transition"
                      onClick={() =>
                        updateItemQty(
                          item.item_id,
                          Math.max(1, item.quantity - 1)
                        )
                      }
                    >
                      -
                    </button>

                    <span className="px-4 py-1.5 rounded-full bg-slate-100 text-xl">
                      {item.quantity}
                    </span>

                    <button
                      className="px-4 py-1.5 rounded-full border text-xl bg-white hover:bg-slate-100 transition"
                      onClick={() =>
                        updateItemQty(item.item_id, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>

                  
                </div>

                {/* Remove */}
                <button
                  className="text-red-500 hover:text-red-600 transition"
                  onClick={() => removeItem(item.item_id)}
                  aria-label="Remove item"
                >
                  <Trash2 className="h-6 w-6" />
                </button>
              </div>
            ))}
          </div>

          {/* RIGHT: Summary */}
          <div className="p-6 bg-white border border-pink-100 rounded-2xl shadow-md">
            <h2 className="text-2xl font-semibold text-slate-800 mb-5">
              Order Summary
            </h2>

            <div className="space-y-3 text-xl">
              <div className="flex justify-between">
                
              </div>

              <hr className="my-4" />

              <div className="flex justify-between text-2xl font-semibold">
                
              </div>
            </div>

            <Link
              to="/checkout"
              className="mt-8 inline-block w-full rounded-full bg-rose-600 text-white text-center py-3.5 text-xl font-semibold shadow hover:bg-rose-700 transition"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
