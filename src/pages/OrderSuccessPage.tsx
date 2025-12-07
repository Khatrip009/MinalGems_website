import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSparkles(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fafafa] via-[#ffffff] to-[#f8f8f8] flex justify-center items-center px-4 py-20">
      {/* Background glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-r from-pink-200/40 to-purple-200/40 blur-3xl opacity-60" />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative max-w-xl w-full bg-white/90 backdrop-blur-xl border border-white/70 shadow-2xl rounded-3xl p-12 text-center flex flex-col items-center"
      >
        {/* Subtle glow above card */}
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-r from-pink-300/30 to-yellow-300/30 blur-2xl rounded-full opacity-80 pointer-events-none" />

        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 180 }}
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl"
        >
          <CheckCircle2 className="h-14 w-14 text-white" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-5xl font-['Playfair_Display'] font-semibold text-slate-900 tracking-wide"
        >
          Order Confirmed
        </motion.h1>

        <p className="mt-3 text-xl text-slate-700">
          Thank you for choosing{" "}
          <span className="text-pink-600 font-semibold">Minal Gems</span>.
        </p>

        {/* Order ID Box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="w-full mt-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl text-xl text-slate-700"
        >
          <div className="font-semibold text-slate-800 mb-1 text-2xl">
            Order Reference
          </div>
          <div className="text-lg text-slate-600 break-all">{id}</div>
        </motion.div>

        {/* View Order Details Button */}
        <Link to={`/orders/${id}`} className="mt-8 w-full">
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-full text-white font-semibold text-xl shadow-lg 
                       bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400
                       hover:opacity-95 transition"
          >
            View Order Details
          </motion.button>
        </Link>

        {/* Continue Shopping */}
        <Link to="/" className="mt-5 w-full">
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-full border border-slate-300 text-slate-700 font-semibold text-xl bg-white hover:bg-slate-50 transition"
          >
            Continue Shopping
          </motion.button>
        </Link>

        {/* Sparkles Animation */}
        {showSparkles && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ delay: 0.6 }}
            className="absolute -top-8 right-8 text-pink-400"
          >
            <Sparkles className="h-8 w-8 animate-pulse" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
