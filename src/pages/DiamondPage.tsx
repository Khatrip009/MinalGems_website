// src/pages/DiamondPage.tsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Container from "../components/layout/Container";
import AnimatedSection from "../components/ui/AnimatedSection";

/* ---------------------------------------------
 * Small SVG icons for diamond shapes
 * -------------------------------------------*/
type ShapeVariant =
  | "round"
  | "princess"
  | "emerald"
  | "oval"
  | "marquise"
  | "pear"
  | "heart"
  | "cushion"
  | "radiant";

interface DiamondShapeIconProps {
  variant: ShapeVariant;
}

const DiamondShapeIcon: React.FC<DiamondShapeIconProps> = ({ variant }) => {
  const common = {
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (variant) {
    case "round":
      return (
        <svg viewBox="0 0 64 64" className="h-10 w-10">
          <circle cx="32" cy="32" r="18" fill="none" stroke="#0ea5e9" {...common} />
          <polygon
            points="32,14 42,20 46,32 42,44 32,50 22,44 18,32 22,20"
            fill="none"
            stroke="#e2e8f0"
            {...common}
          />
        </svg>
      );
    case "princess":
      return (
        <svg viewBox="0 0 64 64" className="h-10 w-10">
          <rect
            x="16"
            y="16"
            width="32"
            height="32"
            rx="4"
            ry="4"
            fill="none"
            stroke="#0ea5e9"
            {...common}
          />
          <path d="M16 32 L32 16 L48 32 L32 48 Z" fill="none" stroke="#e2e8f0" {...common} />
        </svg>
      );
    case "emerald":
      return (
        <svg viewBox="0 0 64 64" className="h-10 w-10">
          <polygon
            points="22,14 42,14 50,22 50,42 42,50 22,50 14,42 14,22"
            fill="none"
            stroke="#0ea5e9"
            {...common}
          />
          <rect x="22" y="22" width="20" height="20" fill="none" stroke="#e2e8f0" {...common} />
        </svg>
      );
    case "oval":
      return (
        <svg viewBox="0 0 64 64" className="h-10 w-10">
          <ellipse cx="32" cy="32" rx="18" ry="12" fill="none" stroke="#0ea5e9" {...common} />
          <path d="M18 32 L32 20 L46 32 L32 44 Z" fill="none" stroke="#e2e8f0" {...common} />
        </svg>
      );
    case "marquise":
      return (
        <svg viewBox="0 0 64 64" className="h-10 w-10">
          <polygon
            points="32,12 48,32 32,52 16,32"
            fill="none"
            stroke="#0ea5e9"
            {...common}
          />
          <path
            d="M24 20 L40 20 L44 32 L40 44 L24 44 L20 32 Z"
            fill="none"
            stroke="#e2e8f0"
            {...common}
          />
        </svg>
      );
    case "pear":
      return (
        <svg viewBox="0 0 64 64" className="h-10 w-10">
          <path
            d="M32 12 C26 18 22 24 22 32 C22 40 26 50 32 52 C38 50 42 40 42 32 C42 24 38 18 32 12 Z"
            fill="none"
            stroke="#0ea5e9"
            {...common}
          />
          <path d="M26 30 L32 20 L38 30 L36 40 L28 40 Z" fill="none" stroke="#e2e8f0" {...common} />
        </svg>
      );
    case "heart":
      return (
        <svg viewBox="0 0 64 64" className="h-10 w-10">
          <path
            d="M32 50 L18 36 C14 32 14 26 17 22 C20 18 26 18 30 20 C32 21 32 21 32 21 C32 21 32 21 34 20 C38 18 44 18 47 22 C50 26 50 32 46 36 Z"
            fill="none"
            stroke="#0ea5e9"
            {...common}
          />
          <path
            d="M24 26 L32 20 L40 26 L38 36 L32 42 L26 36 Z"
            fill="none"
            stroke="#e2e8f0"
            {...common}
          />
        </svg>
      );
    case "cushion":
      return (
        <svg viewBox="0 0 64 64" className="h-10 w-10">
          <rect
            x="18"
            y="18"
            width="28"
            height="28"
            rx="8"
            ry="8"
            fill="none"
            stroke="#0ea5e9"
            {...common}
          />
          <path d="M18 32 L32 18 L46 32 L32 46 Z" fill="none" stroke="#e2e8f0" {...common} />
        </svg>
      );
    case "radiant":
      return (
        <svg viewBox="0 0 64 64" className="h-10 w-10">
          <polygon
            points="22,14 42,14 50,22 50,42 42,50 22,50 14,42 14,22"
            fill="none"
            stroke="#0ea5e9"
            {...common}
          />
          <path
            d="M22 22 L42 22 L46 32 L42 42 L22 42 L18 32 Z"
            fill="none"
            stroke="#e2e8f0"
            {...common}
          />
        </svg>
      );
    default:
      return null;
  }
};

/* ---------------------------------------------
 * Static data
 * -------------------------------------------*/
const colorScale = [
  { range: "D", label: "Exceptional White +" },
  { range: "E", label: "Exceptional White" },
  { range: "F", label: "Rare White +" },
  { range: "G", label: "Rare White" },
  { range: "H", label: "White" },
  { range: "I–J", label: "Slightly Tinted White" },
  { range: "K–L", label: "Tinted White" },
  { range: "M–S", label: "Tinted Colour" },
];

const clarityScale = [
  { grade: "FL", desc: "Flawless – no inclusions or blemishes visible under 10×." },
  { grade: "IF", desc: "Internally Flawless – surface marks only, no internal inclusions." },
  { grade: "VVS₁ / VVS₂", desc: "Very, very small inclusions, extremely hard to see at 10×." },
  { grade: "VS₁ / VS₂", desc: "Very small inclusions, difficult to see at 10×." },
  { grade: "SI₁ / SI₂", desc: "Small inclusions, easily seen at 10× but often eye-clean." },
  {
    grade: "I₁ / I₂ / I₃",
    desc: "Noticeable inclusions that may affect transparency or brilliance.",
  },
];

const caratScale = [
  "4 cts",
  "3 cts",
  "2 cts",
  "1.75 cts",
  "1.50 cts",
  "1.25 cts",
  "1.00 ct",
  "0.75 ct",
  "0.50 ct",
  "0.25 ct",
  "0.10 ct",
  "0.05 ct",
];

/* ---------------------------------------------
 * Page component
 * -------------------------------------------*/
const DiamondPage: React.FC = () => {
  return (
    <main className="relative bg-slate-950 text-[15px] text-slate-50">
      {/* HERO */}
      <AnimatedSection className="relative flex h-[52vh] items-center justify-center overflow-hidden">
        {/* Hero background */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/hero/diamond-hero.jpg')",
          }}
          initial={{ scale: 1.08, y: 10 }}
          animate={{ scale: 1.02, y: 0 }}
          transition={{ duration: 7, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-950/85 to-slate-900/70" />

        {/* Vertical aurora beams */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-[-40px] left-1/2 w-[55%] -translate-x-1/2 bg-[radial-gradient(circle_at_0%_0%,rgba(125,211,252,0.7),transparent_60%),radial-gradient(circle_at_100%_0%,rgba(56,189,248,0.6),transparent_60%)] opacity-40 blur-3xl"
          initial={{ scaleX: 0.9 }}
          animate={{ scaleX: 1.05 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        />

        <Container className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="font-['Playfair_Display'] text-4xl font-semibold tracking-[0.16em] md:text-5xl"
            style={{
              backgroundImage:
                "linear-gradient(120deg,#f9fafb 0%,#e0f2fe 18%,#38bdf8 40%,#a5b4fc 65%,#f9fafb 90%)",
              backgroundSize: "220% 100%",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Discover the World of Diamonds
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1 }}
            className="mt-4 max-w-2xl text-base text-slate-100/90 md:text-lg"
          >
            Cut, colour, clarity, carat weight – plus shapes, grading and buying guidance from
            the Payal &amp; Minal Gems experts.
          </motion.p>

          <motion.div
            aria-hidden="true"
            initial={{ backgroundPositionX: "0%" }}
            animate={{ backgroundPositionX: "100%" }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
            style={{
              backgroundImage:
                "linear-gradient(120deg,transparent,rgba(125,211,252,0.8),rgba(129,140,248,0.9),transparent)",
              backgroundSize: "200% 100%",
            }}
            className="mt-6 h-[2px] w-40 rounded-full opacity-80"
          />
        </Container>
      </AnimatedSection>

      {/* MAIN CONTENT */}
      <section className="py-14 sm:py-20">
        <Container>
          {/* INTRO */}
          <motion.section
            className="mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div className="space-y-4">
                <p className="inline-flex rounded-full bg-cyan-500/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
                  DIAMOND ESSENTIALS
                </p>
                <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-slate-50 md:text-4xl">
                  What is a diamond?
                </h2>
                <p className="text-base leading-relaxed text-slate-100/85 md:text-lg">
                  Diamonds are crystals of pure carbon formed deep inside the earth under
                  tremendous heat and pressure. Their unique structure bends and breaks light,
                  creating the brilliance, fire and sparkle that makes them so desirable.
                </p>
                <p className="text-sm leading-relaxed text-slate-100/85 md:text-base">
                  At{" "}
                  <span className="font-semibold text-cyan-100">
                    Payal &amp; Minal Gems
                  </span>{" "}
                  we focus on ethically sourced rough, precision cutting and transparent grading,
                  so each diamond offers both beauty and long-term value.
                </p>
                <p className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 px-4 py-1.5 text-xs font-semibold text-slate-900 shadow-[0_16px_40px_rgba(56,189,248,0.55)]">
                  Tip: A perfectly cut diamond often looks brighter – and even larger – than a
                  heavier stone with a poor cut.
                </p>
              </div>

              <motion.div
                className="group relative rounded-3xl border border-cyan-300/40 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950 p-[2px] shadow-[0_26px_70px_rgba(15,23,42,0.95)] backdrop-blur-2xl"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                whileHover={{
                  y: -6,
                  boxShadow:
                    "0 32px 85px rgba(56,189,248,0.5),0 20px 60px rgba(15,23,42,0.95)",
                }}
              >
                <motion.div
                  className="relative overflow-hidden rounded-[1.4rem]"
                  initial="initial"
                  whileHover="hover"
                >
                  <motion.img
                    src="/images/hero/diamond.jpg"
                    alt="Diamond macro"
                    className="h-full w-full object-cover"
                    variants={{
                      initial: { scale: 1.03, y: 0 },
                      hover: { scale: 1.07, y: -4 },
                    }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                  />

                  <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-[1.4rem] bg-gradient-to-tr from-transparent via-white/60 to-transparent mix-blend-screen opacity-0"
                    variants={{
                      initial: { opacity: 0, x: "-40%" },
                      hover: { opacity: 1, x: "40%" },
                    }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                </motion.div>
              </motion.div>
            </div>
          </motion.section>

          {/* 4Cs OVERVIEW */}
          <motion.section
            className="mb-14"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-slate-50 md:text-4xl">
              The 4Cs – Cut, Colour, Clarity, Carat Weight
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-200/90 md:text-base">
              These four characteristics were systematised by De&nbsp;Beers and global
              laboratories. The balance between them determines both the look and the price of
              your diamond.
            </p>

            <div className="mt-7 grid gap-6 md:grid-cols-2">
              {/* Cut */}
              <motion.div
                whileHover={{
                  y: -6,
                  boxShadow:
                    "0 26px 70px rgba(56,189,248,0.45),0 18px 50px rgba(15,23,42,0.95)",
                }}
                className="relative overflow-hidden rounded-2xl border border-sky-300/60 bg-gradient-to-br from-slate-900/90 via-slate-900/85 to-slate-950 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.9)] backdrop-blur-xl"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(56,189,248,0.35),transparent_55%),radial-gradient(circle_at_100%_0%,rgba(129,140,248,0.25),transparent_55%)] opacity-70" />
                <div className="relative">
                  <h3 className="text-xl font-semibold text-cyan-50">Cut – the most important C</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-100/90 md:text-base">
                    Cut is not the shape; it is the precision of angles, proportions and polish.
                    A well-cut stone reflects light back through the top of the diamond, creating
                    intense brilliance and fire.
                  </p>
                  <ul className="mt-3 ml-5 list-disc space-y-1 text-xs text-slate-100/85 md:text-sm">
                    <li>Excellent / Very Good cuts look bright from edge to edge.</li>
                    <li>Shallow or deep cuts leak light and look smaller or dull.</li>
                    <li>A superior cut can make a smaller diamond out-sparkle a larger one.</li>
                  </ul>
                </div>
              </motion.div>

              {/* Carat */}
              <motion.div
                whileHover={{
                  y: -6,
                  boxShadow:
                    "0 26px 70px rgba(56,189,248,0.45),0 18px 50px rgba(15,23,42,0.95)",
                }}
                className="relative overflow-hidden rounded-2xl border border-sky-300/60 bg-gradient-to-br from-slate-900/90 via-slate-900/85 to-slate-950 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.9)] backdrop-blur-xl"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(59,130,246,0.35),transparent_55%),radial-gradient(circle_at_0%_100%,rgba(56,189,248,0.28),transparent_55%)] opacity-80" />
                <div className="relative">
                  <h3 className="text-xl font-semibold text-cyan-50">
                    Carat – weight &amp; size
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-100/90 md:text-base">
                    Carat is purely weight: 1&nbsp;ct = 0.2&nbsp;grams. Face-up size also depends
                    on cut. Two 1&nbsp;ct diamonds can look different in diameter.
                  </p>
                  <ul className="mt-3 ml-5 list-disc space-y-1 text-xs text-slate-100/85 md:text-sm">
                    <li>“Magic” sizes (0.50, 0.75, 1.00&nbsp;ct) often jump in price.</li>
                    <li>A 0.90&nbsp;ct stone can look almost like 1&nbsp;ct with better value.</li>
                    <li>Carat has no direct effect on colour or clarity grades.</li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* COLOUR SCALE */}
          <motion.section
            className="mb-14 rounded-3xl border border-sky-400/60 bg-gradient-to-br from-sky-950/95 via-slate-900/95 to-slate-950 px-6 py-8 text-sky-50 shadow-[0_26px_70px_rgba(15,23,42,0.95)] backdrop-blur-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-cyan-100 md:text-4xl">
              Colour – from D to Z
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-sky-100/90 md:text-base">
              Most diamonds look colourless at first glance, yet subtle body tones make a big
              difference in rarity and value. Stones closer to{" "}
              <span className="font-semibold text-sky-50">no colour</span> are more scarce.
              Trace elements such as nitrogen (yellow) or boron (blue) get locked into the
              crystal while it forms, giving each diamond its natural tint.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-sky-100/85 md:text-sm">
              In the standard scale, colour is graded from D (absolutely colourless) down to Z
              (noticeable yellow or brown). Your board groups them approximately as:
            </p>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-sky-600/40 bg-slate-950/40">
              <table className="min-w-full text-left text-xs md:text-sm">
                <thead className="bg-slate-900/60">
                  <tr className="border-b border-sky-700/60">
                    <th className="py-2 pl-4 pr-4 font-semibold text-cyan-100">
                      GIA Grade
                    </th>
                    <th className="py-2 pr-4 font-semibold text-cyan-100">
                      CIBJO / IDC Description
                    </th>
                    <th className="py-2 pr-4 font-semibold text-cyan-100">Look</th>
                  </tr>
                </thead>
                <tbody>
                  {colorScale.map((c) => (
                    <tr
                      key={c.range}
                      className="border-b border-sky-800/50 last:border-0 odd:bg-slate-900/40"
                    >
                      <td className="py-2 pl-4 pr-4 align-top font-semibold text-sky-50">
                        {c.range}
                      </td>
                      <td className="py-2 pr-4 align-top text-sky-100/90">{c.label}</td>
                      <td className="py-2 pr-4 align-top">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-cyan-200/80 bg-cyan-100/40" />
                          <span className="text-sky-100/85">
                            {c.range === "D" || c.range === "E"
                              ? "Ice-white, extremely rare."
                              : c.range === "F" || c.range === "G"
                              ? "Fine white; excellent everyday choice."
                              : c.range === "H"
                              ? "Soft white; faint warmth in some lighting."
                              : c.range === "I–J" || c.range === "K–L"
                              ? "Noticeable warmth, lovely in yellow gold."
                              : "Clearly tinted; often chosen for vintage looks."}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-[11px] text-sky-200/80 md:text-xs">
              Fancy colours (strong pink, blue, vivid yellow, etc.) are graded on a separate
              system and can be rarer than colourless diamonds.
            </p>
          </motion.section>

          {/* CLARITY SCALE */}
          <motion.section
            className="mb-14 rounded-3xl border border-slate-200/70 bg-slate-950/60 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.9)] backdrop-blur-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-slate-50 md:text-4xl">
              Clarity – nature’s fingerprint
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-200/90 md:text-base">
              Every diamond carries tiny internal crystals or surface marks formed during its
              growth. Gemmologists call them inclusions and blemishes. The number, size and
              position of these features determine the clarity grade.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {clarityScale.map((row) => (
                <motion.div
                  key={row.grade}
                  whileHover={{
                    y: -4,
                    boxShadow:
                      "0 20px 55px rgba(148,163,184,0.5),0 14px 35px rgba(15,23,42,0.9)",
                  }}
                  className="flex items-center gap-4 rounded-2xl border border-slate-600/50 bg-slate-900/80 p-4"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 shadow-[0_10px_25px_rgba(15,23,42,0.9)]">
                    <div className="relative h-9 w-9 rounded-full border border-slate-400">
                      <span className="absolute left-1 top-2 h-1 w-1 rounded-full bg-slate-200" />
                      <span className="absolute left-3 top-5 h-1 w-1 rounded-full bg-slate-400" />
                      <span className="absolute right-2 top-3 h-1 w-1 rounded-full bg-slate-200" />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-50">{row.grade}</div>
                    <div className="mt-1 text-xs leading-relaxed text-slate-200/90">
                      {row.desc}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <p className="mt-4 text-xs text-slate-300">
              In practice, many{" "}
              <span className="font-semibold">VS and SI diamonds are “eye-clean”</span> – you
              cannot see inclusions without magnification, making them excellent value.
            </p>
          </motion.section>

          {/* CARAT WEIGHT BAR */}
          <motion.section
            className="mb-14 rounded-3xl border border-slate-200/70 bg-slate-950/60 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.9)] backdrop-blur-2xl"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-slate-50 md:text-4xl">
              Carat Weight – visual size guide
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-200/90 md:text-base">
              Your De&nbsp;Beers chart shows carat as a simple unit of weight, with a standard
              metric carat of 0.2&nbsp;g. Traditionally it was based on the weight of carob
              seeds, which are surprisingly consistent.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-200/80 md:text-sm">
              The row of circles below mirrors your board: as carat increases, the diameter of
              a well-cut round diamond grows. Remember, this is approximate and assumes
              excellent proportions.
            </p>

            <div className="mt-6 flex flex-wrap items-end justify-between gap-y-4">
              {caratScale.map((label, index) => {
                const size = 64 - index * 4; // decreasing size
                return (
                  <div key={label} className="flex flex-col items-center gap-1 px-1">
                    <div
                      className="rounded-full border border-cyan-300/80 bg-cyan-100/70 shadow-[0_10px_28px_rgba(56,189,248,0.65)]"
                      style={{ width: size / 2, height: size / 2 }}
                    />
                    <span className="text-[10px] font-medium text-slate-200">{label}</span>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-[11px] text-slate-300 md:text-xs">
              Carat weight does <span className="font-semibold">not</span> tell you anything
              about cut, colour or clarity. Always look at the full 4C profile.
            </p>
          </motion.section>

          {/* SHAPES & SVG ICONS */}
          <motion.section
            className="mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-slate-50 md:text-4xl">
              Diamond Shapes &amp; Popular Cuts
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-200/90 md:text-base">
              Shape is the outline of the stone. Each shape plays with light differently and
              suits different personalities and settings.
            </p>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {[
                {
                  title: "Round Brilliant",
                  variant: "round" as ShapeVariant,
                  desc: "Most popular; 57–58 facets, maximum sparkle and versatility.",
                },
                {
                  title: "Princess",
                  variant: "princess" as ShapeVariant,
                  desc: "Square brilliant cut with sharp corners and modern look.",
                },
                {
                  title: "Emerald",
                  variant: "emerald" as ShapeVariant,
                  desc: "Step-cut; emphasises clarity and a calm, mirror-like sparkle.",
                },
                {
                  title: "Oval",
                  variant: "oval" as ShapeVariant,
                  desc: "Elongated brilliant; flatters the finger and often looks larger.",
                },
                {
                  title: "Marquise",
                  variant: "marquise" as ShapeVariant,
                  desc: "Boat-shaped with pointed ends; maximises perceived size.",
                },
                {
                  title: "Pear",
                  variant: "pear" as ShapeVariant,
                  desc: "Tear-drop with brilliant faceting; elegant for pendants and rings.",
                },
                {
                  title: "Heart",
                  variant: "heart" as ShapeVariant,
                  desc: "Romantic shape; requires excellent symmetry to look balanced.",
                },
                {
                  title: "Cushion",
                  variant: "cushion" as ShapeVariant,
                  desc: "Soft square with rounded corners; vintage charm and strong fire.",
                },
                {
                  title: "Radiant",
                  variant: "radiant" as ShapeVariant,
                  desc: "Rectangular or square, combining step-cut outline with brilliant facets.",
                },
              ].map((s) => (
                <motion.div
                  key={s.title}
                  whileHover={{
                    y: -4,
                    boxShadow:
                      "0 20px 55px rgba(56,189,248,0.4),0 14px 38px rgba(15,23,42,0.9)",
                  }}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-600/60 bg-slate-900/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.9)]"
                >
                  <div className="flex items-center gap-3">
                    <DiamondShapeIcon variant={s.variant} />
                    <h3 className="text-base font-semibold text-slate-50">{s.title}</h3>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-200/90 md:text-sm">
                    {s.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* BUYING GUIDE */}
          <motion.section
            className="mb-14 rounded-3xl border border-slate-600/70 bg-slate-950/70 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.9)] backdrop-blur-2xl"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-slate-50 md:text-4xl">
              How to Choose the Right Diamond
            </h2>
            <ol className="mt-3 ml-6 list-decimal space-y-1.5 text-xs leading-relaxed text-slate-200/90 md:text-sm">
              <li>Fix your budget and preferred visual size (diameter or mm).</li>
              <li>
                Prioritise <span className="font-semibold">cut</span> – never compromise here.
              </li>
              <li>
                Choose colour based on metal: warmer grades suit yellow/rose gold beautifully.
              </li>
              <li>
                Look for eye-clean clarity (often VS or SI) rather than chasing FL/IF.
              </li>
              <li>Ask for lab certificate (GIA / IGI / HRD etc.) and verify report number online.</li>
              <li>
                View the diamond in different lighting – daylight, spotlight and soft indoor
                light.
              </li>
              <li>
                Discuss after-sales service: cleaning, checking prongs, resizing, and upgrades.
              </li>
            </ol>
          </motion.section>

          {/* CERTIFICATION & ETHICAL SOURCING */}
          <motion.section
            className="mb-14 grid gap-6 md:grid-cols-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              whileHover={{
                y: -4,
                boxShadow:
                  "0 22px 60px rgba(56,189,248,0.35),0 18px 50px rgba(15,23,42,0.95)",
              }}
              className="rounded-3xl border border-slate-600/70 bg-slate-950/80 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.9)] backdrop-blur-xl"
            >
              <h2 className="font-['Playfair_Display'] text-2xl font-semibold text-slate-50">
                Grading &amp; Certificates
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-200/90 md:text-sm">
                Independent labs grade each diamond for the 4Cs and issue a detailed report.
              </p>
              <ul className="mt-2 ml-5 list-disc space-y-1 text-xs text-slate-200/90 md:text-sm">
                <li>GIA – widely considered the global reference standard.</li>
                <li>IGI – common in fine jewellery; reliable grading for most retail sizes.</li>
                <li>HRD / AGS – respected labs with strong technical grading systems.</li>
              </ul>
              <p className="mt-3 text-[11px] text-slate-300 md:text-xs">
                At Payal &amp; Minal Gems we provide certificates and help you read them
                line-by-line so you understand exactly what you are buying.
              </p>
            </motion.div>

            <motion.div
              whileHover={{
                y: -4,
                boxShadow:
                  "0 22px 60px rgba(56,189,248,0.35),0 18px 50px rgba(15,23,42,0.95)",
              }}
              className="rounded-3xl border border-slate-600/70 bg-slate-950/80 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.9)] backdrop-blur-xl"
            >
              <h2 className="font-['Playfair_Display'] text-2xl font-semibold text-slate-50">
                Ethical Sourcing &amp; Lab-grown Options
              </h2>
              <ul className="mt-2 ml-5 list-disc space-y-1 text-xs text-slate-200/90 md:text-sm">
                <li>Rough purchased only from documented, conflict-free channels.</li>
                <li>Compliance with the Kimberley Process and local regulations.</li>
                <li>Lab-grown diamonds available for customers prioritising sustainability.</li>
              </ul>
            </motion.div>
          </motion.section>

          {/* CARE & INSURANCE */}
          <motion.section
            className="mb-14 rounded-3xl border border-slate-600/70 bg-slate-950/75 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.9)] backdrop-blur-2xl"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-slate-50 md:text-4xl">
              Care, Cleaning &amp; Insurance
            </h2>
            <ul className="mt-3 ml-6 list-disc space-y-1.5 text-xs leading-relaxed text-slate-200/90 md:text-sm">
              <li>Clean regularly with warm water, mild soap and a soft brush.</li>
              <li>Avoid harsh chemicals and check with us before using ultrasonic cleaners.</li>
              <li>Store pieces separately so diamonds don’t scratch each other or softer gems.</li>
              <li>
                Have prongs and settings inspected every 6–12 months, especially for daily-wear
                rings.
              </li>
              <li>Insure high-value jewellery against loss, theft and accidental damage.</li>
            </ul>
          </motion.section>

          {/* HELP CARDS / CTA */}
          <motion.section
            className="mb-4 grid gap-7 md:grid-cols-2"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <motion.div
              whileHover={{
                y: -6,
                boxShadow:
                  "0 26px 70px rgba(56,189,248,0.5),0 20px 55px rgba(15,23,42,0.95)",
              }}
              className="relative overflow-hidden rounded-3xl border border-sky-300/70 bg-gradient-to-br from-slate-950/95 via-slate-950/90 to-slate-950 px-7 py-7 shadow-[0_26px_70px_rgba(15,23,42,0.95)] backdrop-blur-xl"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(56,189,248,0.35),transparent_55%),radial-gradient(circle_at_100%_0%,rgba(129,140,248,0.3),transparent_55%)] opacity-80" />
              <div className="relative">
                <h3 className="font-['Playfair_Display'] text-2xl font-semibold text-slate-50">
                  Need help choosing a diamond?
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-200/90 md:text-sm">
                  Our specialists can walk you through live comparisons, certificates and design
                  options for rings, pendants and more.
                </p>
                <Link
                  to="/contact"
                  className="mt-5 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 px-7 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_16px_38px_rgba(56,189,248,0.7)] transition hover:brightness-110"
                >
                  Book a consultation
                </Link>
              </div>
            </motion.div>

            <motion.div
              whileHover={{
                y: -6,
                boxShadow:
                  "0 26px 70px rgba(56,189,248,0.4),0 20px 55px rgba(15,23,42,0.95)",
              }}
              className="relative overflow-hidden rounded-3xl border border-slate-600/70 bg-slate-950/90 px-7 py-7 shadow-[0_26px_70px_rgba(15,23,42,0.95)] backdrop-blur-xl"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(56,189,248,0.3),transparent_55%),radial-gradient(circle_at_0%_100%,rgba(129,140,248,0.25),transparent_55%)] opacity-80" />
              <div className="relative">
                <h3 className="font-['Playfair_Display'] text-2xl font-semibold text-slate-50">
                  Certification &amp; After-sales
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-200/90 md:text-sm">
                  Every major diamond purchase from Payal &amp; Minal Gems comes with verified
                  grading, complimentary cleaning and lifetime checking of settings so your
                  jewels stay secure and sparkling.
                </p>
              </div>
            </motion.div>
          </motion.section>
        </Container>
      </section>
    </main>
  );
};

export default DiamondPage;
