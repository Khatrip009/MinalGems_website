// src/pages/GoldPage.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Container from "../components/layout/Container";
import AnimatedSection from "../components/ui/AnimatedSection";

type AccordionItem = {
  q: string;
  a: string;
};

const Accordion: React.FC<{ items: AccordionItem[] }> = ({ items }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.05 }}
            className="overflow-hidden rounded-2xl border border-amber-200/70 bg-white/80 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <span className="text-lg font-semibold text-slate-900">
                {item.q}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.18 }}
                className="ml-3 text-2xl font-semibold text-rose-500"
              >
                {isOpen ? "›" : "+"}
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="answer"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  className="px-5 pb-4 text-base leading-relaxed text-slate-700"
                >
                  {item.a}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

const GoldPage: React.FC = () => {
  return (
    <main className="relative bg-slate-950 text-[15px]">
      {/* Background luxury gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-32 h-80 w-80 rounded-full bg-gradient-to-br from-amber-500/40 via-amber-200/20 to-transparent blur-3xl" />
        <div className="absolute top-10 right-[-120px] h-96 w-96 rounded-full bg-gradient-to-br from-rose-500/25 via-amber-300/25 to-transparent blur-3xl" />
        <div className="absolute bottom-[-160px] left-1/3 h-80 w-[520px] rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-transparent blur-3xl" />
      </div>

      {/* HERO */}
      <AnimatedSection className="relative h-[52vh] overflow-hidden">
        {/* Hero background with subtle floating motion */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/hero/Gold-hero.jpg')",
          }}
          initial={{ scale: 1.08, y: 10 }}
          animate={{ scale: 1.02, y: 0 }}
          transition={{ duration: 6, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black/40" />

        {/* Subtle animated light sweep overlay */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/10 via-transparent to-transparent mix-blend-screen"
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: [0, 0.6, 0], y: [0, 40, 80] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        />

        <Container className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
          {/* HERO TITLE WITH SHIMMER */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="font-['Playfair_Display'] text-4xl font-semibold tracking-[0.12em] md:text-5xl"
            style={{
              backgroundImage:
                "linear-gradient(120deg,#fef9c3 0%,#facc15 20%,#f97316 40%,#facc15 60%,#fef9c3 80%)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            All About Gold
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mt-4 max-w-2xl text-base text-slate-100/90 md:text-lg"
          >
            History, karats, colours, crafting methods, sourcing, testing and
            buying advice for fine gold jewellery.
          </motion.p>

          {/* slow shimmer movement */}
          <motion.div
            aria-hidden
            initial={{ backgroundPositionX: "0%" }}
            animate={{ backgroundPositionX: "100%" }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
            style={{
              backgroundImage:
                "linear-gradient(120deg,transparent,rgba(250,204,21,0.5),transparent)",
              backgroundSize: "200% 100%",
            }}
            className="mt-6 h-px w-40 rounded-full opacity-80"
          />
        </Container>
      </AnimatedSection>

      {/* MAIN CONTENT */}
      <AnimatedSection className="py-14 sm:py-20">
        <Container>
          {/* SECTION 1 — Intro */}
          <motion.section
            className="mb-14"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div className="space-y-4">
                <p className="inline-flex rounded-full bg-amber-500/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
                  ESSENTIAL GOLD GUIDE
                </p>
                <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-amber-50 md:text-4xl">
                  Why gold matters
                </h2>
                <p className="text-base leading-relaxed text-slate-100/85 md:text-lg">
                  Gold has been treasured since ancient times for its beauty,
                  scarcity and stability. It has served as currency, a cultural
                  symbol and a premium material in jewellery for centuries.
                </p>
                <p className="text-sm leading-relaxed text-slate-100/80 md:text-base">
                  <span className="mr-2 inline-block rounded-full bg-amber-300/90 px-3 py-1 text-xs font-semibold text-slate-900">
                    Quick fact
                  </span>
                  Gold (Au) is extremely malleable and resistant to tarnish – 1g
                  can be beaten into a sheet of many square metres.
                </p>
              </div>

              {/* IMAGE: Shine + parallax hover */}
              <motion.div
                className="group relative rounded-3xl border border-amber-300/40 bg-gradient-to-br from-amber-100/15 via-amber-50/5 to-slate-900/60 p-[2px] shadow-[0_24px_60px_rgba(15,23,42,0.65)] backdrop-blur-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                viewport={{ once: true, amount: 0.3 }}
                whileHover={{
                  y: -6,
                  boxShadow:
                    "0 30px 80px rgba(250,204,21,0.45),0 18px 45px rgba(15,23,42,0.8)",
                }}
              >
                <motion.div
                  className="relative overflow-hidden rounded-[1.4rem]"
                  initial="initial"
                  whileHover="hover"
                >
                  <motion.img
                    src="/images/hero/why_gold_matter.jpg"
                    alt="Gold bar"
                    className="h-full w-full object-cover"
                    variants={{
                      initial: { scale: 1.02, y: 0 },
                      hover: { scale: 1.06, y: -4 },
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />

                  {/* Shine sweep overlay */}
                  <motion.div
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

          {/* SECTION 2 — History (glassmorphism) */}
          <motion.section
            className="mb-14 rounded-3xl border border-amber-200/75 bg-gradient-to-br from-amber-50/15 via-slate-900/70 to-slate-950/95 p-9 shadow-[0_26px_70px_rgba(15,23,42,0.85)] backdrop-blur-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.25 }}
          >
            <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-amber-50 md:text-4xl">
              History & cultural importance
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-100/85 md:text-lg">
              From Egyptian burial treasures and Greek coins to Asian ornaments
              and Roman crowns, gold has symbolised wealth, purity, prosperity
              and divinity across civilisations.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-100/80 md:text-base">
              Gold also shaped monetary systems (the gold standard) and remains
              both a luxury metal and an important industrial commodity.
            </p>
          </motion.section>

          {/* SECTION 3 — Karats */}
          <motion.section
            className="mb-14"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-amber-50 md:text-4xl">
              Karat & purity – what the numbers mean
            </h2>
            <ul className="mt-4 ml-6 list-disc space-y-2 text-sm text-slate-100/85 md:text-base">
              <li>
                <strong>24K</strong> – 99.9% pure, very soft, rarely used for
                intricate pieces.
              </li>
              <li>
                <strong>22K</strong> – 91.6%, rich Indian tone, ideal for heavy
                traditional designs.
              </li>
              <li>
                <strong>18K</strong> – 75%, perfect balance of purity and
                durability for fine jewellery.
              </li>
              <li>
                <strong>14K</strong> – 58.5%, very durable and popular in
                Western markets.
              </li>
              <li>
                <strong>10K</strong> – 41.7%, minimum legal gold in some
                countries.
              </li>
            </ul>

            <motion.div
              className="mt-7 rounded-2xl border border-amber-200/70 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/90 p-6 shadow-[0_20px_55px_rgba(15,23,42,0.85)] backdrop-blur-xl"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              viewport={{ once: true, amount: 0.4 }}
            >
              <h3 className="text-xl font-semibold text-amber-50">
                Karat vs Hallmark
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-100/85 md:text-base">
                <strong>Karat</strong> is the measure of purity.{" "}
                <strong>Hallmark</strong> is the official stamp from BIS/Assay
                Office confirming that purity. Always buy hallmarked jewellery
                for complete peace of mind.
              </p>
            </motion.div>
          </motion.section>

          {/* SECTION 4 — Colours (glassmorphism cards) */}
          <motion.section
            className="mb-14 rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50/10 via-slate-900/85 to-slate-950 p-9 shadow-[0_26px_70px_rgba(15,23,42,0.9)] backdrop-blur-2xl"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.25 }}
          >
            <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-amber-50 md:text-4xl">
              Gold colours & alloys
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Yellow Gold",
                  text: "Gold blended with copper and silver for the classic warm tone.",
                },
                {
                  title: "White Gold",
                  text: "Alloyed with palladium, zinc or nickel and usually rhodium plated for a bright white finish.",
                },
                {
                  title: "Rose Gold",
                  text: "Copper-rich alloy that gives a romantic pinkish tone, perfect for modern designs.",
                },
              ].map((card, idx) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 18, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 * idx }}
                  viewport={{ once: true, amount: 0.3 }}
                  whileHover={{
                    y: -6,
                    boxShadow:
                      "0 22px 60px rgba(250,204,21,0.45),0 15px 40px rgba(15,23,42,0.9)",
                  }}
                  className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.9)]"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(250,204,21,0.18),transparent_55%),radial-gradient(circle_at_100%_0%,rgba(248,113,113,0.15),transparent_55%)] opacity-70" />
                  <div className="relative">
                    <h3 className="text-lg font-semibold text-amber-50">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-100/85 md:text-base">
                      {card.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-relaxed text-slate-100/85 md:text-base">
              You’ll also find artistic variants like green, grey or black gold,
              created via special alloy mixes or surface treatments.
            </p>
          </motion.section>

          {/* SECTION 5 — FAQ */}
          <motion.section
            className="mb-14"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-amber-50 md:text-4xl">
              Frequently Asked Questions
            </h2>
            <div className="mt-6">
              <Accordion
                items={[
                  {
                    q: "Is 22K better than 18K?",
                    a: "22K has a richer colour and higher gold content, but is softer. 18K is more durable and better for everyday wear. Choose depending on how often you’ll wear the piece and how detailed the design is.",
                  },
                  {
                    q: "How are making charges calculated?",
                    a: "Making charges reflect the labour involved, design complexity, wastage and finishing quality. Hand-crafted or intricate designs typically have higher making charges than simple machine-made jewellery.",
                  },
                  {
                    q: "Can gold be recycled?",
                    a: "Yes. Old jewellery can be refined back to pure gold and reused. Recycled gold is chemically identical to newly mined gold and is kinder to the environment.",
                  },
                ]}
              />
            </div>
          </motion.section>

          {/* SECTION 6 — Contact Cards (glass + gold border) */}
          <motion.section
            className="mb-2 grid gap-7 md:grid-cols-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div
              whileHover={{
                y: -6,
                boxShadow:
                  "0 26px 75px rgba(250,204,21,0.45),0 18px 50px rgba(15,23,42,0.9)",
              }}
              className="relative overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-br from-slate-900/90 via-slate-900/85 to-slate-950 px-7 py-7 shadow-[0_24px_65px_rgba(15,23,42,0.9)] backdrop-blur-xl"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(250,204,21,0.25),transparent_55%),radial-gradient(circle_at_100%_0%,rgba(248,113,113,0.2),transparent_55%)]" />
              <div className="relative">
                <h3 className="font-['Playfair_Display'] text-2xl font-semibold text-amber-50">
                  Want personalised advice?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-100/90 md:text-base">
                  Book a one-to-one consultation with our gold specialists for
                  buying guidance, sizing and styling help.
                </p>
                <Link
                  to="/contact?topic=gold-consultation"
                  className="mt-5 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 px-7 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_16px_35px_rgba(250,204,21,0.5)] transition hover:brightness-110"
                >
                  Book a consultation
                </Link>
              </div>
            </motion.div>

            <motion.div
              whileHover={{
                y: -6,
                boxShadow:
                  "0 24px 70px rgba(250,204,21,0.35),0 18px 50px rgba(15,23,42,0.9)",
              }}
              className="relative overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-br from-slate-900/90 via-slate-900/85 to-slate-950 px-7 py-7 shadow-[0_24px_65px_rgba(15,23,42,0.9)] backdrop-blur-xl"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(250,204,21,0.2),transparent_55%),radial-gradient(circle_at_0%_100%,rgba(56,189,248,0.18),transparent_55%)]" />
              <div className="relative">
                <h3 className="font-['Playfair_Display'] text-2xl font-semibold text-amber-50">
                  Trade-in & recycling
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-100/90 md:text-base">
                  Bring your old gold jewellery for transparent valuation,
                  exchange options and responsible recycling with Minal Gems.
                </p>
              </div>
            </motion.div>
          </motion.section>
        </Container>
      </AnimatedSection>
    </main>
  );
};

export default GoldPage;
