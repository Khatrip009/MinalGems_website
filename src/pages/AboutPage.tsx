// src/pages/AboutPage.tsx
import React from "react";
import { Link } from "react-router-dom";
import Container from "../components/layout/Container";
import AnimatedSection from "../components/ui/AnimatedSection";
import SectionTitle from "../components/ui/SectionTitle";

const AboutPage: React.FC = () => {
  return (
    <main className="bg-slate-50">
      {/* HERO */}
      <AnimatedSection className="relative flex h-[52vh] items-center justify-center overflow-hidden bg-black text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1526312426976-f4d754fa9bd6?q=80&w=1600&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/50" />

        <Container className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/90">
            Since 1985
          </p>
          <h1 className="mt-2 font-['Playfair_Display'] text-4xl font-semibold tracking-wide md:text-5xl">
            40 Years of Legacy in Fine Jewellery
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-100/90">
            From a small workshop in Surat to a trusted name in diamonds &amp; gold,
            Payal &amp; Minal Gems has been crafting heirloom pieces for
            generations of families.
          </p>
        </Container>
      </AnimatedSection>

      {/* STORY + STATS */}
      <AnimatedSection className="py-12 sm:py-16">
        <Container>
          <section className="mb-12 grid gap-10 md:grid-cols-[1.5fr_minmax(0,1fr)] md:items-center">
            <div>
              <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-slate-900">
                Our Story
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-700">
                The journey of Payal &amp; Minal Gems began in the mid-1980s with a
                single polishing wheel, a handful of rough diamonds and a belief:
                <span className="font-semibold"> quality and honesty never go out of style.</span>
              </p>
              <p className="mt-3 text-base leading-relaxed text-slate-700">
                What started as a family-run cutting and polishing unit slowly grew
                into a full-fledged jewellery house. Over four decades we have
                partnered with skilled artisans, gemmologists and designers to
                create jewellery that blends{" "}
                <span className="font-semibold">
                  traditional Indian craftsmanship
                </span>{" "}
                with a clean, contemporary aesthetic.
              </p>
              <p className="mt-3 text-base leading-relaxed text-slate-700">
                Today, our legacy lives in every engagement ring, bridal set and
                everyday piece that leaves our workshop. Many of our earliest
                clients now return with their children – and that trust is the
                greatest award we carry.
              </p>
            </div>

            <div className="space-y-4 rounded-3xl border border-rose-100 bg-white p-6 shadow-sm shadow-slate-900/5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                At a Glance
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-3xl font-semibold text-rose-600">40+</div>
                  <p className="mt-1 text-xs text-slate-600">Years of legacy</p>
                </div>
                <div>
                  <div className="text-3xl font-semibold text-rose-600">10k+</div>
                  <p className="mt-1 text-xs text-slate-600">Families served</p>
                </div>
                <div>
                  <div className="text-3xl font-semibold text-rose-600">5k+</div>
                  <p className="mt-1 text-xs text-slate-600">Unique designs crafted</p>
                </div>
                <div>
                  <div className="text-3xl font-semibold text-rose-600">25+</div>
                  <p className="mt-1 text-xs text-slate-600">Cities across India</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Numbers are approximate – our real measure of success is the
                stories and celebrations our jewellery becomes a part of.
              </p>
            </div>
          </section>

          {/* TIMELINE */}
          <section className="mb-12">
            <SectionTitle
              title="A Journey Through Four Decades"
              subtitle="Key milestones that shaped Payal & Minal Gems."
              align="left"
            />

            <div className="mt-6 space-y-4">
              {[
                {
                  year: "1985–1995",
                  title: "The Early Workshop Years",
                  text: "Our founders set up a small cutting and polishing unit in Surat, serving local jewellers with perfectly finished stones.",
                },
                {
                  year: "1996–2005",
                  title: "From Loose Stones to Jewellery",
                  text: "We began designing and manufacturing complete jewellery pieces – solitaires, mangalsutras, bangles and bridal sets.",
                },
                {
                  year: "2006–2015",
                  title: "Modern Craft & Global Standards",
                  text: "Gemmological training, CAD design and global grading standards (GIA / IGI) became the backbone of every collection.",
                },
                {
                  year: "2016–Today",
                  title: "Next-Generation Fine Jewellery",
                  text: "A new generation joined the business, bringing in contemporary styling, online experiences and custom-made engagement rings.",
                },
              ].map((item, idx) => (
                <div
                  key={item.year}
                  className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-rose-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                      {item.year}
                    </div>
                    {idx < 3 && (
                      <div className="mt-2 h-full w-px flex-1 bg-slate-200 md:block" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CRAFTSMANSHIP PILLARS */}
          <section className="mb-12 rounded-3xl bg-[#FFF8F0] p-6 shadow-sm">
            <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-slate-900">
              What Makes Our Jewellery Different
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-700">
              Every piece created at Payal &amp; Minal Gems passes through hands
              that specialise in a single stage of the process – from gem selection
              to final polishing.
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">
                  Curated Diamonds &amp; Gold
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  We handpick diamonds with excellent cut proportions and pair them
                  with hallmarked gold, ensuring both brilliance and purity.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">
                  Artisanship You Can Feel
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  Skilled setters, polishers and engravers finish every edge and
                  prong by hand so your jewellery feels smooth, secure and
                  comfortable to wear.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">
                  Honest Pricing &amp; Transparency
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  Open breakdown of gold, diamond and making charges, with clear
                  certificates and documentation for each major piece.
                </p>
              </div>
            </div>
          </section>

          {/* PROMISE CARDS */}
          <section className="mb-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">
                Legacy You Can Rely On
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                We believe jewellery should outlive trends. Our designs are
                crafted to be worn, loved and passed on – not just kept in lockers.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">
                Ethical &amp; Responsible
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Conflict-free sourcing, fair working practices and respect for the
                craft are non-negotiable parts of our everyday decisions.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">
                Lifelong Service
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Complimentary cleaning, prong checks and guidance for resizing,
                redesigning or upgrading your jewellery over the years.
              </p>
            </div>
          </section>

          {/* FOUNDER'S NOTE + CTA */}
          <section className="mb-4 grid gap-6 md:grid-cols-[1.5fr_minmax(0,1fr)]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-['Playfair_Display'] text-2xl font-semibold text-slate-900">
                A Note From Our Family to Yours
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                “We have watched children who once came to our store holding their
                parents’ hands now return as brides, grooms and proud parents
                themselves. For us, jewellery is not just metal and stones – it is
                a way of preserving emotion, memory and milestones.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Thank you for trusting Payal &amp; Minal Gems with your most
                precious moments. Our promise is simple: we will always treat your
                piece as if it were being made for our own family.”
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                — The Payal &amp; Minal Gems Family
              </p>
            </div>

            <div className="rounded-3xl bg-[#0f172a] p-6 text-slate-50 shadow-sm">
              <h3 className="font-['Playfair_Display'] text-2xl font-semibold">
                Visit or Talk to Us
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-100/90">
                Planning an engagement ring, bridal set or a special anniversary
                gift? We’d love to help you design something uniquely yours.
              </p>
              <div className="mt-4 space-y-2 text-sm">
                <p>Surat, Gujarat • India</p>
                <p className="text-slate-200">
                  Phone: <span className="font-semibold">+91 70697 85900</span>
                </p>
                <p className="text-slate-200">
                  Email:{" "}
                  <span className="font-semibold">khatrip.009@gmail.com</span>
                </p>
              </div>
              <Link
                to="/contact"
                className="mt-5 inline-block rounded-full bg-rose-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-rose-700 transition"
              >
                Book a consultation
              </Link>
            </div>
          </section>
        </Container>
      </AnimatedSection>
    </main>
  );
};

export default AboutPage;
