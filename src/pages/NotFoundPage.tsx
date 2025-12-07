import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Sparkles, Gem } from "lucide-react";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";

/* =========================================================
 * Small animated SVG pieces
 * ======================================================= */

function FloatingDiamond({
  delay = 0,
  size = 80,
  opacity = 0.18,
  className = "",
}: {
  delay?: number;
  size?: number;
  opacity?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: -10, opacity }}
      transition={{
        delay,
        duration: 5,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_30px_rgba(244,114,182,0.35)]"
      >
        <defs>
          <linearGradient id="diamondGrad" x1="0" y1="0" x2="80" y2="80">
            <stop offset="0%" stopColor="#f9a8d4" />
            <stop offset="40%" stopColor="#e5e7eb" />
            <stop offset="100%" stopColor="#bfdbfe" />
          </linearGradient>
        </defs>
        <polygon
          points="40,4 10,26 20,60 60,60 70,26"
          fill="url(#diamondGrad)"
          stroke="rgba(15,23,42,0.14)"
          strokeWidth="1.6"
        />
        <polyline
          points="10,26 40,60 70,26"
          stroke="rgba(15,23,42,0.25)"
          strokeWidth="1.2"
          fill="none"
        />
        <polyline
          points="40,4 30,26 40,60 50,26 40,4"
          stroke="rgba(15,23,42,0.25)"
          strokeWidth="1.2"
          fill="none"
        />
      </svg>
    </motion.div>
  );
}

function SparkleBurst({
  delay = 0,
  className = "",
}: {
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1, 0.7, 1], opacity: [0, 1, 0.6, 0] }}
      transition={{
        delay,
        duration: 3.2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <Sparkles className="h-6 w-6 text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.7)]" />
    </motion.div>
  );
}

/* =========================================================
 * Main 404 Page
 * ======================================================= */

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      {/* Soft vignette background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#fecaca33_0,_transparent_55%),radial-gradient(circle_at_bottom,_#bfdbfe33_0,_transparent_55%)]" />

      {/* Floating diamonds background */}
      <FloatingDiamond
        delay={0.4}
        size={110}
        opacity={0.25}
        className="pointer-events-none absolute -left-6 top-24"
      />
      <FloatingDiamond
        delay={1.2}
        size={90}
        opacity={0.22}
        className="pointer-events-none absolute right-10 top-32"
      />
      <FloatingDiamond
        delay={0.8}
        size={70}
        opacity={0.16}
        className="pointer-events-none absolute left-16 bottom-10"
      />
      <SparkleBurst delay={0.5} className="pointer-events-none absolute left-32 top-40" />
      <SparkleBurst delay={1.3} className="pointer-events-none absolute right-20 top-24" />
      <SparkleBurst delay={2.1} className="pointer-events-none absolute right-36 bottom-20" />

      <Container className="relative z-10 flex min-h-screen items-center justify-center py-20">
        <div className="w-full max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mx-auto flex flex-col items-center text-center"
          >
            {/* 404 & big diamond */}
            <div className="relative mb-10 flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="relative flex items-center justify-center"
              >
                {/* Glow ring */}
                <div className="absolute h-52 w-52 rounded-full bg-[radial-gradient(circle,_rgba(248,250,252,0.1)_0,_transparent_60%)] blur-sm" />

                {/* Rotating halo */}
                <motion.div
                  className="absolute h-64 w-64 rounded-full border border-dashed border-rose-300/40"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                {/* Diamond icon */}
                <motion.div
                  className="relative flex h-40 w-40 items-center justify-center rounded-[32px] bg-gradient-to-br from-rose-500 via-fuchsia-500 to-sky-400 shadow-[0_18px_60px_rgba(248,113,181,0.7)]"
                  animate={{
                    y: [0, -6, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Gem className="h-16 w-16 text-slate-50 drop-shadow-[0_0_24px_rgba(248,250,252,0.9)]" />
                </motion.div>

                {/* 404 text behind */}
                <div className="pointer-events-none absolute -z-10 text-[7rem] font-black uppercase tracking-[0.3em] text-slate-900/60 mix-blend-screen">
                  404
                </div>
              </motion.div>
            </div>

            {/* Heading & copy */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.35 }}
              className="font-['Playfair_Display'] text-4xl md:text-5xl font-semibold tracking-tight text-slate-50"
            >
              This Gem Went Missing
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.35 }}
              className="mt-3 max-w-2xl text-sm md:text-base text-slate-300"
            >
              The page you were searching for isn&apos;t in our showcase.
              It may have been moved, renamed or is still being crafted in our
              design studio. While we polish things up, explore more of our
              jewellery collection.
            </motion.p>

            {/* Chips / quick hints */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              className="mt-5 flex flex-wrap justify-center gap-2 text-[11px]"
            >
              <span className="rounded-full bg-slate-900/70 px-3 py-1 text-slate-200 border border-slate-700">
                Premium gold & diamond jewellery
              </span>
              <span className="rounded-full bg-slate-900/70 px-3 py-1 text-slate-200 border border-slate-700">
                Certified stones • Transparent pricing
              </span>
              <span className="rounded-full bg-slate-900/70 px-3 py-1 text-slate-200 border border-slate-700">
                Crafted at Payal &amp; Minal Gems
              </span>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.3 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
            >
              <Button
                variant="primary"
                className="flex items-center justify-center gap-2 text-sm px-5 py-2.5 shadow-[0_10px_35px_rgba(248,113,181,0.55)]"
                onClick={() => navigate("/")}
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Button>

              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 text-sm border-rose-300/60 text-rose-100 hover:bg-rose-500/10"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4" />
                Go to Previous Page
              </Button>
            </motion.div>

            {/* Quick links */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.3 }}
              className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-slate-400"
            >
              <button
                onClick={() => navigate("/products")}
                className="hover:text-rose-200 underline-offset-4 hover:underline"
              >
                Browse all jewellery
              </button>
              <span className="text-slate-600">•</span>
              <button
                onClick={() => navigate("/gold")}
                className="hover:text-rose-200 underline-offset-4 hover:underline"
              >
                Learn about gold
              </button>
              <span className="text-slate-600">•</span>
              <button
                onClick={() => navigate("/diamonds")}
                className="hover:text-rose-200 underline-offset-4 hover:underline"
              >
                Diamond education
              </button>
              <span className="text-slate-600">•</span>
              <button
                onClick={() => navigate("/contact")}
                className="hover:text-rose-200 underline-offset-4 hover:underline"
              >
                Talk to our experts
              </button>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </div>
  );
}
