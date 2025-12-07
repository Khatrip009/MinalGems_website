// src/components/ui/LuxuryToaster.tsx
import React from "react";
import { Toaster, ToastBar } from "react-hot-toast";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Heart, Gem } from "lucide-react";

export default function LuxuryToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 2600,
        style: {
          borderRadius: "14px",
          padding: "10px 14px",
          color: "white",
          background: "rgba(15, 23, 42, 0.72)", // slate-900/70
          backdropFilter: "blur(14px)",
        },
      }}
    >
      {(t) => (
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.9 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <ToastBar
            toast={t}
            style={{
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "15px",
              fontWeight: 500,
            }}
          >
            {(icon) => (
              <div className="flex items-center gap-3">
                {/* CUSTOM ICONS BASED ON TYPE */}
                {t.type === "success" && (
                  <CheckCircle className="h-5 w-5 text-emerald-300" />
                )}
                {t.type === "error" && (
                  <XCircle className="h-5 w-5 text-rose-300" />
                )}
                {t.type === "blank" &&
                  (typeof t.message === "string" &&
                  t.message.toLowerCase().includes("wishlist") ? (
                    <Heart className="h-5 w-5 text-pink-300" />
                  ) : (
                    <Gem className="h-5 w-5 text-cyan-300" />
                  ))}

                {/* MESSAGE */}
                <span>{t.message as any}</span>

                {/* CLOSE BUTTON */}
                {t.type !== "loading" && (
                  <button
                    onClick={() => t.dismiss(t.id)}
                    className="ml-auto text-slate-300 hover:text-white transition"
                  >
                    ×
                  </button>
                )}
              </div>
            )}
          </ToastBar>

          {/* Glow effect behind the toast */}
          <div className="absolute -z-10 left-0 top-0 right-0 bottom-0 rounded-2xl bg-gradient-to-r from-cyan-400/20 via-rose-400/20 to-indigo-400/20 blur-xl opacity-40" />
        </motion.div>
      )}
    </Toaster>
  );
}
