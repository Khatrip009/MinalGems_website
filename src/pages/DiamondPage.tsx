// src/pages/DiamondPage.tsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Container from "../components/layout/Container";
import AnimatedSection from "../components/ui/AnimatedSection";

/* ---------------------------------------------
 * Diamond Shape Grid Component
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

interface DiamondShapeProps {
  variant: ShapeVariant;
  name: string;
  description: string;
}

const DiamondShapeCard: React.FC<DiamondShapeProps> = ({ variant, name, description }) => {
  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-4 flex h-48 items-center justify-center">
        <img
          src={`/images/diamonds/shapes/${variant}.jpg`}
          alt={`${name} cut diamond`}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <h3 className="mb-2 font-['Playfair_Display'] text-xl font-bold text-gray-900">
        {name}
      </h3>
      <p className="text-sm text-gray-600">{description}</p>
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full" />
    </motion.div>
  );
};

/* ---------------------------------------------
 * Static data
 * -------------------------------------------*/
const diamondShapes: DiamondShapeProps[] = [
  { variant: "round", name: "Round Brilliant", description: "The most popular cut with maximum sparkle and brilliance" },
  { variant: "princess", name: "Princess Cut", description: "Modern square cut with sharp corners and excellent fire" },
  { variant: "emerald", name: "Emerald Cut", description: "Step-cut with rectangular facets and hall-of-mirrors effect" },
  { variant: "oval", name: "Oval Cut", description: "Elegant elongated shape that appears larger than round" },
  { variant: "marquise", name: "Marquise Cut", description: "Football-shaped cut that maximizes carat weight visually" },
  { variant: "pear", name: "Pear Cut", description: "Teardrop shape combining round and marquise characteristics" },
  { variant: "heart", name: "Heart Cut", description: "Romantic symbol-shaped cut requiring expert craftsmanship" },
  { variant: "cushion", name: "Cushion Cut", description: "Square or rectangular cut with rounded corners and soft appearance" },
  { variant: "radiant", name: "Radiant Cut", description: "Brilliant-cut rectangular or square shape with trimmed corners" },
];

const colorScale = [
  { range: "D", label: "Exceptional White +", color: "bg-gray-50" },
  { range: "E", label: "Exceptional White", color: "bg-gray-100" },
  { range: "F", label: "Rare White +", color: "bg-gray-200" },
  { range: "G", label: "Rare White", color: "bg-gray-300" },
  { range: "H", label: "White", color: "bg-gray-400" },
  { range: "I-J", label: "Slightly Tinted White", color: "bg-yellow-50" },
  { range: "K-L", label: "Tinted White", color: "bg-yellow-100" },
  { range: "M+", label: "Tinted Colour", color: "bg-yellow-200" },
];

const clarityScale = [
  { grade: "FL", desc: "Flawless – no inclusions or blemishes visible under 10×", level: "Exceptional" },
  { grade: "IF", desc: "Internally Flawless – surface marks only, no internal inclusions", level: "Excellent" },
  { grade: "VVS₁ / VVS₂", desc: "Very, very small inclusions, extremely hard to see at 10×", level: "Premium" },
  { grade: "VS₁ / VS₂", desc: "Very small inclusions, difficult to see at 10×", level: "Very Good" },
  { grade: "SI₁ / SI₂", desc: "Small inclusions, easily seen at 10× but often eye-clean", level: "Good" },
  { grade: "I₁ / I₂ / I₃", desc: "Noticeable inclusions that may affect transparency or brilliance", level: "Commercial" },
];

const caratExamples = [
  { carat: "0.25", diameter: "4.1mm", price: "$$", size: "Small" },
  { carat: "0.50", diameter: "5.2mm", price: "$$$", size: "Medium" },
  { carat: "0.75", diameter: "5.9mm", price: "$$$$", size: "Large" },
  { carat: "1.00", diameter: "6.5mm", price: "$$$$$", size: "Premium" },
  { carat: "1.50", diameter: "7.4mm", price: "$$$$$$", size: "Luxury" },
  { carat: "2.00", diameter: "8.2mm", price: "$$$$$$$", size: "Exceptional" },
];

/* ---------------------------------------------
 * Page component
 * -------------------------------------------*/
const DiamondPage: React.FC = () => {
  return (
    <main className="relative bg-gradient-to-b from-gray-50 to-white text-gray-900">
      {/* HERO */}
      <AnimatedSection className="relative flex h-[60vh] items-center justify-center overflow-hidden">
        {/* Hero background */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/hero/diamond-hero.jpg')",
          }}
          initial={{ scale: 1.08 }}
          animate={{ scale: 1.02 }}
          transition={{ duration: 7, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/85 to-white/70" />

        {/* Light effect */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent opacity-40"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 4, repeat: Infinity, repeatType: "mirror" }}
        />

        <Container className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="font-['Playfair_Display'] text-5xl font-bold tracking-tight md:text-6xl"
            style={{
              backgroundImage:
                "linear-gradient(135deg,#1e293b 0%,#334155 25%,#475569 50%,#64748b 75%,#94a3b8 100%)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            The Diamond Guide
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1 }}
            className="mt-6 max-w-3xl text-xl font-medium text-gray-700 md:text-2xl"
          >
            Master the 4Cs: Cut, Color, Clarity & Carat Weight
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.2 }}
            className="mt-4 max-w-2xl text-lg text-gray-600"
          >
            Expert guidance from Payal & Minal Gems
          </motion.p>

          <motion.div
            aria-hidden="true"
            initial={{ backgroundPositionX: "0%" }}
            animate={{ backgroundPositionX: "100%" }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
            style={{
              backgroundImage:
                "linear-gradient(90deg,transparent,rgba(59,130,246,0.8),rgba(139,92,246,0.8),transparent)",
              backgroundSize: "200% 100%",
            }}
            className="mt-8 h-1 w-64 rounded-full"
          />
        </Container>
      </AnimatedSection>

      {/* MAIN CONTENT */}
      <section className="py-16">
        <Container>
          {/* INTRO */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div className="space-y-6">
                <div className="inline-flex rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-2">
                  <span className="text-sm font-semibold uppercase tracking-wider text-white">
                    Diamond Essentials
                  </span>
                </div>
                <h2 className="font-['Playfair_Display'] text-4xl font-bold text-gray-900 md:text-5xl">
                  What Makes a Diamond Special?
                </h2>
                <p className="text-lg leading-relaxed text-gray-700">
                  Diamonds are nature's perfect crystals formed under immense pressure and heat
                  deep within the Earth. Their unique atomic structure allows them to bend, reflect,
                  and refract light like no other gemstone, creating that signature sparkle.
                </p>
                <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-6 shadow-sm">
                  <p className="font-medium text-gray-800">
                    <span className="font-bold text-blue-600">Expert Tip:</span> A well-cut diamond
                    can appear larger and brighter than a heavier stone with poor proportions.
                    Always prioritize cut quality.
                  </p>
                </div>
              </div>

              <motion.div
                className="group relative overflow-hidden rounded-3xl shadow-2xl"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <motion.img
                  src="/images/hero/diamond.jpg"
                  alt="Diamond macro photography"
                  className="h-full w-full object-cover"
                  initial={{ scale: 1.05 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-bold">Natural Diamond Crystal</h3>
                  <p className="text-sm opacity-90">Uncut beauty in its raw form</p>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* THE 4Cs SECTION */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center">
              <h2 className="font-['Playfair_Display'] text-4xl font-bold text-gray-900 md:text-5xl">
                The 4Cs of Diamond Quality
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600">
                These four characteristics determine a diamond's beauty, rarity, and value.
                Understanding them ensures you make an informed choice.
              </p>
            </div>
          </motion.section>

          {/* 1. SHAPE & CUT */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-10">
              <div className="inline-flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                  <span className="text-xl font-bold text-white">1</span>
                </div>
                <h3 className="font-['Playfair_Display'] text-3xl font-bold text-gray-900">
                  Shape & Cut Quality
                </h3>
              </div>
              <p className="mt-4 max-w-3xl text-lg text-gray-700">
                The cut determines how well a diamond interacts with light. It's the most important
                factor affecting sparkle, fire, and brilliance.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {diamondShapes.map((shape) => (
                <DiamondShapeCard key={shape.variant} {...shape} />
              ))}
            </div>
          </motion.section>

          {/* 2. COLOR */}
          <motion.section
            className="mb-20 rounded-3xl bg-gradient-to-br from-white to-blue-50 p-8 shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-10">
              <div className="inline-flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500">
                  <span className="text-xl font-bold text-white">2</span>
                </div>
                <h3 className="font-['Playfair_Display'] text-3xl font-bold text-gray-900">
                  Color Grade
                </h3>
              </div>
              <p className="mt-4 max-w-3xl text-lg text-gray-700">
                Most diamonds appear colorless but have subtle tints. The GIA scale runs from
                D (colorless) to Z (light color), with D being the rarest and most valuable.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {colorScale.map((color, index) => (
                <motion.div
                  key={color.range}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">{color.range}</span>
                      <div className={`h-8 w-8 rounded-full ${color.color} border border-gray-300`} />
                    </div>
                    <h4 className="mb-2 font-semibold text-gray-800">{color.label}</h4>
                    <p className="text-sm text-gray-600">
                      {index <= 3
                        ? "Exceptionally rare and valuable"
                        : index <= 5
                        ? "Excellent value for money"
                        : "Warm tones perfect for yellow gold settings"}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* 3. CLARITY */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-10">
              <div className="inline-flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                  <span className="text-xl font-bold text-white">3</span>
                </div>
                <h3 className="font-['Playfair_Display'] text-3xl font-bold text-gray-900">
                  Clarity Grade
                </h3>
              </div>
              <p className="mt-4 max-w-3xl text-lg text-gray-700">
                Clarity refers to the absence of inclusions and blemishes. Most diamonds have
                microscopic imperfections that don't affect beauty to the naked eye.
              </p>
            </div>

            <div className="grid gap-6">
              {clarityScale.map((clarity, index) => (
                <motion.div
                  key={clarity.grade}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-900">{clarity.grade}</span>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                          {clarity.level}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-600">{clarity.desc}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-500">Eye Clean?</div>
                      <div className={`mt-1 text-lg font-bold ${index <= 3 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {index <= 3 ? 'Yes' : 'With Care'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* 4. CARAT WEIGHT */}
          <motion.section
            className="mb-20 rounded-3xl bg-gradient-to-br from-white to-purple-50 p-8 shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-10">
              <div className="inline-flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500">
                  <span className="text-xl font-bold text-white">4</span>
                </div>
                <h3 className="font-['Playfair_Display'] text-3xl font-bold text-gray-900">
                  Carat Weight & Size
                </h3>
              </div>
              <p className="mt-4 max-w-3xl text-lg text-gray-700">
                Carat weight measures a diamond's physical weight. Size perception depends on cut
                quality and shape—some cuts face up larger than others.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {caratExamples.map((example, index) => (
                <motion.div
                  key={example.carat}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-gray-900">{example.carat} ct</div>
                        <div className="text-sm text-gray-500">{example.size} Diamond</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{example.price}</div>
                        <div className="text-sm text-gray-500">Approx. Range</div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-700">Face-up Diameter</div>
                      <div className="text-2xl font-bold text-blue-600">{example.diameter}</div>
                    </div>
                    <div className="relative h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
                        style={{ width: `${(index + 1) * 16}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* BUYING GUIDE */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <div className="rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white shadow-2xl">
              <h3 className="font-['Playfair_Display'] mb-6 text-3xl font-bold">
                How to Choose Your Diamond
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-4 text-xl font-semibold">Essential Steps</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-sm font-bold">
                        1
                      </div>
                      <span>Set a budget that includes setting and certification</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-sm font-bold">
                        2
                      </div>
                      <span>Choose shape based on personal style and finger shape</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-sm font-bold">
                        3
                      </div>
                      <span>Prioritize cut quality for maximum sparkle</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-4 text-xl font-semibold">Pro Tips</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-sm font-bold">
                        ✓
                      </div>
                      <span>VS/SI clarity diamonds often appear flawless to the naked eye</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-sm font-bold">
                        ✓
                      </div>
                      <span>Color H-I diamonds offer excellent value in yellow gold</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-sm font-bold">
                        ✓
                      </div>
                      <span>Always request GIA or IGI certification</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.section>

          {/* CERTIFICATION & ETHICS */}
          <motion.section
            className="mb-20 grid gap-8 md:grid-cols-2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="font-['Playfair_Display'] text-2xl font-bold text-gray-900">
                  Certification Matters
                </h3>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl bg-blue-50 p-4">
                  <h4 className="font-semibold text-blue-700">GIA Certified</h4>
                  <p className="mt-1 text-sm text-gray-600">Global standard for diamond grading</p>
                </div>
                <div className="rounded-xl bg-purple-50 p-4">
                  <h4 className="font-semibold text-purple-700">IGI Certified</h4>
                  <p className="mt-1 text-sm text-gray-600">Excellent for fancy colored diamonds</p>
                </div>
                <div className="rounded-xl bg-green-50 p-4">
                  <h4 className="font-semibold text-green-700">HRD Antwerp</h4>
                  <p className="mt-1 text-sm text-gray-600">European standard of excellence</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <span className="text-2xl">🌱</span>
                </div>
                <h3 className="font-['Playfair_Display'] text-2xl font-bold text-gray-900">
                  Ethical Sourcing
                </h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-gray-700">Kimberley Process compliant rough</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-gray-700">Conflict-free certification</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-gray-700">Lab-grown diamond options available</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-gray-700">Traceable supply chain</span>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* CTA SECTION */}
          <motion.section
            className="grid gap-8 md:grid-cols-2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 p-8 text-white shadow-2xl">
              <h3 className="font-['Playfair_Display'] mb-4 text-2xl font-bold">
                Personalized Consultation
              </h3>
              <p className="mb-6 opacity-90">
                Let our diamond experts guide you through the selection process with real
                diamonds side-by-side comparisons.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 font-semibold text-gray-900 shadow-lg transition-transform hover:scale-105"
              >
                Book Appointment
              </Link>
            </div>

            <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white shadow-2xl">
              <h3 className="font-['Playfair_Display'] mb-4 text-2xl font-bold">
                Lifetime Care Program
              </h3>
              <ul className="mb-6 space-y-3">
                <li className="flex items-center gap-3">
                  <span className="text-blue-400">✓</span>
                  <span>Complimentary cleaning & inspection</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-blue-400">✓</span>
                  <span>Prong tightening & maintenance</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-blue-400">✓</span>
                  <span>Upgrade program for future purchases</span>
                </li>
              </ul>
              <Link
                to="/services"
                className="inline-flex items-center justify-center rounded-full bg-blue-500 px-8 py-3 font-semibold transition-transform hover:scale-105"
              >
                Learn More
              </Link>
            </div>
          </motion.section>
        </Container>
      </section>
    </main>
  );
};

export default DiamondPage;