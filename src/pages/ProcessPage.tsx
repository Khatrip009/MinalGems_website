// src/pages/ProcessPage.tsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Container from "../components/layout/Container";
import AnimatedSection from "../components/ui/AnimatedSection";

const ProcessPage: React.FC = () => {
  return (
    <main className="relative bg-slate-950 text-[15px] text-slate-50">
      {/* HERO */}
      <AnimatedSection className="relative h-[60vh] overflow-hidden">
        {/* Hero background */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/hero/process-hero.jpg')",
          }}
          initial={{ scale: 1.08, y: 10 }}
          animate={{ scale: 1.02, y: 0 }}
          transition={{ duration: 7, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        />

        {/* Gradient + soft vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-950/85 to-slate-900/70" />

        {/* Rose / gold aurora beams */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-[-40px] left-1/2 w-[60%] -translate-x-1/2 bg-[radial-gradient(circle_at_0%_0%,rgba(251,113,133,0.6),transparent_60%),radial-gradient(circle_at_100%_0%,rgba(244,114,182,0.6),transparent_60%)] opacity-45 blur-3xl"
          initial={{ scaleX: 0.9 }}
          animate={{ scaleX: 1.05 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        />

        <Container className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="font-['Playfair_Display'] text-4xl font-semibold tracking-[0.18em] text-rose-50 md:text-5xl"
            style={{
              backgroundImage:
                "linear-gradient(120deg,#fee2e2 0%,#fecaca 18%,#fb7185 40%,#f472b6 65%,#fef2f2 90%)",
              backgroundSize: "220% 100%",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Jewellery Making Process
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1 }}
            className="mt-3 max-w-2xl text-base text-rose-50/90 md:text-lg"
          >
            From imagination to timeless creation — how each piece of Minal Gems jewellery comes to
            life.
          </motion.p>

          {/* shimmering underline */}
          <motion.div
            aria-hidden="true"
            initial={{ backgroundPositionX: "0%" }}
            animate={{ backgroundPositionX: "100%" }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
            style={{
              backgroundImage:
                "linear-gradient(120deg,transparent,rgba(251,113,133,0.8),rgba(244,114,182,0.9),transparent)",
              backgroundSize: "200% 100%",
            }}
            className="mt-6 h-[2px] w-40 rounded-full opacity-90"
          />
        </Container>
      </AnimatedSection>

      {/* MAIN CONTENT */}
      <AnimatedSection className="py-12 sm:py-16">
        <Container>
          {/* Intro */}
          <motion.section
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <p className="inline-flex rounded-full bg-rose-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-rose-200">
              CRAFTSMANSHIP JOURNEY
            </p>
            <h2 className="mt-3 font-['Playfair_Display'] text-3xl font-semibold text-rose-100 md:text-4xl">
              A Journey of Craftsmanship
            </h2>
            <p className="mt-4 mx-auto max-w-3xl text-base leading-relaxed text-rose-50/85 md:text-lg">
              Every piece of jewellery is a masterpiece born from a blend of art, skill and
              technology. At Payal &amp; Minal Gems, each ornament goes through a meticulous
              process to deliver unmatched quality and beauty.
            </p>
          </motion.section>

          {/* Helper: shared card styles */}
          {/* STEP 1 – DESIGNING */}
          <motion.section
            className="mb-12 rounded-3xl border border-rose-200/40 bg-gradient-to-br from-slate-950/90 via-slate-950/85 to-slate-900/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.95)] backdrop-blur-2xl"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-rose-200">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-sm font-bold text-rose-50 shadow-[0_10px_25px_rgba(248,113,113,0.5)]">
                    1
                  </span>
                  DESIGNING
                </div>
                <h3 className="font-['Playfair_Display'] text-2xl font-semibold text-rose-50">
                  Designing
                </h3>
                <p className="text-sm leading-relaxed text-rose-50/80 md:text-base">
                  The process begins with an idea. Our designers create hand sketches and detailed
                  3D CAD models to visualise the jewellery piece. Every curve, angle and gem
                  placement is planned with precision so that the final piece balances beauty,
                  comfort and practicality.
                </p>
              </div>

              <motion.div
                className="relative overflow-hidden rounded-[1.4rem] border border-rose-200/50 bg-gradient-to-br from-rose-200/10 via-rose-100/5 to-transparent p-[3px] shadow-[0_26px_70px_rgba(15,23,42,0.9)]"
                whileHover={{
                  y: -6,
                  boxShadow:
                    "0 30px 85px rgba(248,113,113,0.55),0 20px 60px rgba(15,23,42,0.95)",
                }}
              >
                <div className="relative overflow-hidden rounded-[1.25rem]">
                  <img
                    src="/images/hero/process-hero.jpg"
                    alt="Jewellery designing"
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-rose-100/35 to-transparent mix-blend-screen" />
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* STEP 2 – WAX MODEL */}
          <motion.section
            className="mb-12 rounded-3xl border border-rose-200/35 bg-gradient-to-br from-slate-950/90 via-slate-950/85 to-slate-900/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.95)] backdrop-blur-2xl"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.05 }}
          >
            <div className="grid items-center gap-8 md:grid-cols-2">
              <motion.div
                className="relative order-2 overflow-hidden rounded-[1.4rem] border border-rose-200/45 bg-gradient-to-br from-rose-200/10 via-rose-100/5 to-transparent p-[3px] shadow-[0_26px_70px_rgba(15,23,42,0.9)] md:order-1"
                whileHover={{
                  y: -6,
                  boxShadow:
                    "0 30px 85px rgba(248,113,113,0.55),0 20px 60px rgba(15,23,42,0.95)",
                }}
              >
                <div className="relative overflow-hidden rounded-[1.25rem]">
                  <img
                    src="/images/hero/process-hero2.jpg"
                    alt="Wax jewellery model"
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-bl from-transparent via-rose-100/35 to-transparent mix-blend-screen" />
                </div>
              </motion.div>

              <div className="order-1 space-y-3 md:order-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-rose-200">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-sm font-bold text-rose-50 shadow-[0_10px_25px_rgba(248,113,113,0.5)]">
                    2
                  </span>
                  WAX MODEL / PROTOTYPE
                </div>
                <h3 className="font-['Playfair_Display'] text-2xl font-semibold text-rose-50">
                  Wax Model / Prototype
                </h3>
                <p className="text-sm leading-relaxed text-rose-50/80 md:text-base">
                  A wax or resin prototype is created using 3D printing or traditional hand
                  carving. This model lets us inspect proportions, prong positions and comfort
                  details before moving ahead. It becomes the base for casting the jewellery in
                  metal.
                </p>
              </div>
            </div>
          </motion.section>

          {/* STEP 3 – CASTING */}
          <motion.section
            className="mb-12 rounded-3xl border border-rose-200/35 bg-gradient-to-br from-slate-950/90 via-slate-950/85 to-slate-900/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.95)] backdrop-blur-2xl"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.05 }}
          >
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-rose-200">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-sm font-bold text-rose-50 shadow-[0_10px_25px_rgba(248,113,113,0.5)]">
                    3
                  </span>
                  CASTING
                </div>
                <h3 className="font-['Playfair_Display'] text-2xl font-semibold text-rose-50">
                  Casting
                </h3>
                <p className="text-sm leading-relaxed text-rose-50/80 md:text-base">
                  The wax model is encased in a special plaster (investment). Once it hardens,
                  the wax is melted away, leaving a detailed cavity. Molten gold is poured into
                  this mold, forming the raw metal structure of the jewellery. After cooling,
                  the casting is broken out and cleaned.
                </p>
              </div>

              <motion.div
                className="relative overflow-hidden rounded-[1.4rem] border border-rose-200/45 bg-gradient-to-br from-rose-200/10 via-rose-100/5 to-transparent p-[3px] shadow-[0_26px_70px_rgba(15,23,42,0.9)]"
                whileHover={{
                  y: -6,
                  boxShadow:
                    "0 30px 85px rgba(248,113,113,0.55),0 20px 60px rgba(15,23,42,0.95)",
                }}
              >
                <div className="relative overflow-hidden rounded-[1.25rem]">
                  <img
                    src="/images/hero/process-hero3.jpg"
                    alt="Gold casting process"
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-rose-100/35 to-transparent mix-blend-screen" />
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* STEP 4 – STONE SETTING */}
          <motion.section
            className="mb-12 rounded-3xl border border-rose-200/35 bg-gradient-to-br from-slate-950/90 via-slate-950/85 to-slate-900/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.95)] backdrop-blur-2xl"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.05 }}
          >
            <div className="grid items-center gap-8 md:grid-cols-2">
              <motion.div
                className="relative order-2 overflow-hidden rounded-[1.4rem] border border-rose-200/45 bg-gradient-to-br from-rose-200/10 via-rose-100/5 to-transparent p-[3px] shadow-[0_26px_70px_rgba(15,23,42,0.9)] md:order-1"
                whileHover={{
                  y: -6,
                  boxShadow:
                    "0 30px 85px rgba(248,113,113,0.55),0 20px 60px rgba(15,23,42,0.95)",
                }}
              >
                <div className="relative overflow-hidden rounded-[1.25rem]">
                  <img
                    src="/images/hero/process-hero4.jpg"
                    alt="Stone setting in jewellery"
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-bl from-transparent via-rose-100/35 to-transparent mix-blend-screen" />
                </div>
              </motion.div>

              <div className="order-1 space-y-3 md:order-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-rose-200">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-sm font-bold text-rose-50 shadow-[0_10px_25px_rgba(248,113,113,0.5)]">
                    4
                  </span>
                  STONE SETTING
                </div>
                <h3 className="font-['Playfair_Display'] text-2xl font-semibold text-rose-50">
                  Stone Setting
                </h3>
                <p className="text-sm leading-relaxed text-rose-50/80 md:text-base">
                  Skilled artisans carefully set diamonds and gemstones into the casted structure
                  — prong by prong, channel by channel. Each stone is checked for symmetry, height
                  and security, ensuring maximum brilliance without compromising daily-wear safety.
                </p>
              </div>
            </div>
          </motion.section>

          {/* STEP 5 – POLISHING & FINISHING */}
          <motion.section
            className="mb-12 rounded-3xl border border-rose-200/35 bg-gradient-to-br from-slate-950/90 via-slate-950/85 to-slate-900/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.95)] backdrop-blur-2xl"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.05 }}
          >
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-rose-200">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-sm font-bold text-rose-50 shadow-[0_10px_25px_rgba(248,113,113,0.5)]">
                    5
                  </span>
                  POLISHING &amp; FINISHING
                </div>
                <h3 className="font-['Playfair_Display'] text-2xl font-semibold text-rose-50">
                  Polishing &amp; Finishing
                </h3>
                <p className="text-sm leading-relaxed text-rose-50/80 md:text-base">
                  The raw piece is refined, filed and polished in multiple stages to remove tiny
                  marks and imperfections. Depending on the design, it may be rhodium plated,
                  textured or given a high-gloss mirror finish. This final stage enhances shine and
                  ensures smoothness and comfort on the skin.
                </p>
              </div>

              <motion.div
                className="relative overflow-hidden rounded-[1.4rem] border border-rose-200/45 bg-gradient-to-br from-rose-200/10 via-rose-100/5 to-transparent p-[3px] shadow-[0_26px_70px_rgba(15,23,42,0.9)]"
                whileHover={{
                  y: -6,
                  boxShadow:
                    "0 30px 85px rgba(248,113,113,0.55),0 20px 60px rgba(15,23,42,0.95)",
                }}
              >
                <div className="relative overflow-hidden rounded-[1.25rem]">
                  <img
                    src="/images/hero/process-hero5.jpg"
                    alt="Polishing jewellery"
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-rose-100/35 to-transparent mix-blend-screen" />
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* PROCESS FLOW DIAGRAM */}
          <motion.section
            className="mb-12 rounded-3xl border border-rose-300/60 bg-gradient-to-br from-rose-100/10 via-rose-200/10 to-rose-100/5 p-6 text-center shadow-[0_24px_60px_rgba(15,23,42,0.85)] backdrop-blur-2xl"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-rose-100 md:text-4xl">
              Complete Process Flow
            </h2>
            <p className="mt-3 text-sm text-rose-50/85 md:text-base">
              Every stage is carefully supervised by our team, ensuring that your jewellery
              matches the design, the comfort and the emotion you imagined.
            </p>
            <div className="mt-5 rounded-2xl border border-rose-200/60 bg-rose-100/10 px-4 py-5 text-base font-medium text-rose-50 shadow-[0_14px_40px_rgba(15,23,42,0.95)]">
              <span className="inline-block">
                🎨 Designing &rarr; 🕯️ Wax Model &rarr; 🔥 Casting &rarr; 💎 Stone Setting &rarr; ✨
                Polishing &rarr; 💍 Final Jewellery
              </span>
            </div>
          </motion.section>

          {/* CTA */}
          <motion.section
            className="mb-4 text-center"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-rose-100 md:text-4xl">
              Crafted with Perfection
            </h2>
            <p className="mt-3 mx-auto max-w-2xl text-base leading-relaxed text-rose-50/85 md:text-lg">
              Every piece at Payal &amp; Minal Gems reflects dedication, artistry and
              uncompromising quality — so your jewellery feels as special as your moments.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center justify-center rounded-full border border-rose-300 bg-gradient-to-r from-rose-500 via-rose-600 to-rose-500 px-8 py-3 text-sm font-semibold text-rose-50 shadow-[0_18px_45px_rgba(248,113,113,0.7)] transition hover:brightness-110"
            >
              Explore Jewellery Collection
            </Link>
          </motion.section>
        </Container>
      </AnimatedSection>
    </main>
  );
};

export default ProcessPage;
