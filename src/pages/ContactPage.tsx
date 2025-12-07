// src/pages/ContactPage.tsx
import React, {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useSearchParams } from "react-router-dom";
import Container from "../components/layout/Container";
import AnimatedSection from "../components/ui/AnimatedSection";
import SectionTitle from "../components/ui/SectionTitle";
import Button from "../components/ui/Button";
import {
  Phone,
  Mail,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { createLead } from "../api/leads.api";

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  product_interest: string;
  message: string;
}

export default function ContactPage(): JSX.Element {
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState<ContactForm>({
    name: "",
    email: "",
    phone: "",
    company: "",
    country: "",
    product_interest: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Prefill product_interest from ?topic=
  useEffect(() => {
    const topic = searchParams.get("topic");
    if (topic && !form.product_interest) {
      setForm((prev) => ({
        ...prev,
        product_interest:
          topic === "gold-consultation"
            ? "Gold jewellery consultation"
            : topic.replace(/-/g, " "),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!form.name.trim() || !form.email.trim()) {
      setErrorMsg("Please enter your name and email.");
      return;
    }

    try {
      setSubmitting(true);
      const res: any = await createLead(form);

      if (!res?.ok) {
        throw new Error(res?.error || "Unable to submit your enquiry.");
      }

      setSuccessMsg(
        "Thank you! Your enquiry has been received. Our team will contact you shortly."
      );
      setForm((prev) => ({
        ...prev,
        name: "",
        email: "",
        phone: "",
        company: "",
        country: "",
        message: "",
        // keep product_interest if we came from a specific topic
        product_interest: prev.product_interest,
      }));
    } catch (err) {
      console.error("[ContactPage] submit error:", err);
      setErrorMsg("Something went wrong while submitting. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="bg-slate-50">
      {/* HERO / INTRO */}
      <AnimatedSection className="border-b border-slate-200/60 bg-gradient-to-b from-white to-pink-50/60">
        <Container className="py-10 md:py-14">
          <SectionTitle
            title="Get in touch with Minal Gems"
            subtitle="Have a question about gold, diamonds, custom designs or an existing order? Share your details and our team will get back to you."
            align="left"
          />
        </Container>
      </AnimatedSection>

      {/* MAIN CONTENT */}
      <AnimatedSection className="py-10 md:py-14">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            {/* FORM CARD */}
            <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 md:p-8 shadow-sm shadow-slate-900/5">
              <h2 className="text-2xl md:text-3xl font-['Playfair_Display'] font-semibold text-slate-900 mb-2">
                Send us an enquiry
              </h2>
              <p className="mb-6 text-base leading-relaxed text-slate-600">
                Fill in the form and we’ll respond within one business day. For
                urgent queries, you can reach us directly on WhatsApp or phone.
              </p>

              {errorMsg && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name + Email */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-1">
                      Full Name<span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-1">
                      Email Address<span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>

                {/* Phone + Country */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 70697 85900"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      placeholder="India"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>

                {/* Company + Interest */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-1">
                      Company / Store (optional)
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={form.company}
                      onChange={handleChange}
                      placeholder="Your company or brand"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-1">
                      Interest / Topic
                    </label>
                    <input
                      type="text"
                      name="product_interest"
                      value={form.product_interest}
                      onChange={handleChange}
                      placeholder="Gold, diamonds, bridal sets, bulk order..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-1">
                    Your Message
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Share details about your requirement, occasion, budget range or any questions you have..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div className="pt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500 max-w-sm">
                    By submitting this form, you agree to be contacted by Minal
                    Gems for your enquiry. We respect your privacy and do not
                    share your details with third parties.
                  </p>

                  <Button
                    type="submit"
                    className="mt-2 inline-flex items-center justify-center rounded-full px-6 py-2.5 text-base font-semibold sm:mt-0"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      "Submit Enquiry"
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* CONTACT INFO / SIDE CARD */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-pink-100 bg-gradient-to-br from-[#FFF7FB] via-[#FFF9F2] to-[#FFEFFC] p-6 shadow-sm">
                <h3 className="font-['Playfair_Display'] text-2xl font-semibold text-slate-900">
                  Visit or contact us
                </h3>
                <p className="mt-2 text-base leading-relaxed text-slate-700">
                  Based in Surat, Gujarat – serving clients across India and
                  internationally with curated jewellery collections.
                </p>

                <div className="mt-4 space-y-3 text-base text-slate-700">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 text-pink-500" />
                    <p>
                      33, Sant Tukaram Society-2,
                      <br />
                      Surat, Gujarat, India
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-pink-500" />
                    <a
                      href="tel:+917069785900"
                      className="hover:text-pink-600"
                    >
                      +91 70697 85900
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-pink-500" />
                    <a
                      href="mailto:khatrip.009@gmail.com"
                      className="hover:text-pink-600"
                    >
                      khatrip.009@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white/90 p-5 text-sm text-slate-600 shadow-sm">
                <p className="font-medium text-slate-800">
                  Prefer WhatsApp instead?
                </p>
                <p className="mt-1">
                  Message us directly for quick questions, order updates or
                  sharing reference photos.
                </p>
                <a
                  href="https://wa.me/917069785900"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center justify-center rounded-full bg-[#25D366] px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-500 transition"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </Container>
      </AnimatedSection>
    </main>
  );
}
