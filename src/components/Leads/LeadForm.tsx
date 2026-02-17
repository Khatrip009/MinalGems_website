// src/components/leads/LeadForm.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Loader2 } from "lucide-react";
import Button from "../ui/Button";
import { createLeadPublic, type CreateLeadPayload } from "../../api/leads.api";

interface LeadFormProps {
  /** Optional product slug or name to pre‑fill product interest */
  productInterest?: string;
  /** Button trigger – if not provided, the component expects to be controlled via `isOpen` */
  trigger?: React.ReactNode;
  /** For controlled usage */
  isOpen?: boolean;
  /** For controlled usage */
  onClose?: () => void;
}

export default function LeadForm({
  productInterest,
  trigger,
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}: LeadFormProps) {
  // Internal state for uncontrolled mode
  const [internalOpen, setInternalOpen] = useState(false);

  // Determine if controlled or uncontrolled
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalOpen;
  const closeModal = () => {
    if (isControlled) {
      controlledOnClose?.();
    } else {
      setInternalOpen(false);
    }
  };

  // Form state
  const [formData, setFormData] = useState<CreateLeadPayload>({
    name: "",
    email: "",
    phone: "",
    company: "",
    country: "",
    message: "",
    product_interest: productInterest || "",
    source: "product_page", // will be overridden in submission
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await createLeadPublic({
        ...formData,
        source: "product_page", // or "lead_form"
      });
      if (result.ok) {
        setSuccess(true);
        // Reset form after success
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          country: "",
          message: "",
          product_interest: productInterest || "",
          source: "product_page",
        });
        // Auto close after 2 seconds
        setTimeout(() => {
          setSuccess(false);
          closeModal();
        }, 2000);
      } else {
        setError(result.error || "Something went wrong. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Backdrop click handler
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Uncontrolled trigger
  const defaultTrigger = (
    <Button
      variant="primary"
      className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg"
      onClick={() => setInternalOpen(true)}
    >
      <Sparkles className="h-4 w-4 mr-2" />
      Request Price
    </Button>
  );

  return (
    <>
      {/* Trigger button (uncontrolled mode) */}
      {!isControlled && (trigger || defaultTrigger)}

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={handleBackdropClick}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header */}
              <div className="pt-8 px-6 pb-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100">
                <h2 className="text-2xl font-bold text-gray-900 font-['Playfair_Display']">
                  Request Price
                </h2>
                <p className="text-gray-600 mt-1">
                  {productInterest
                    ? `Interested in ${productInterest}`
                    : "Get an exclusive quote for your desired piece"}
                </p>
              </div>

              {/* Success state */}
              {success ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                    <Send className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Request Sent!
                  </h3>
                  <p className="text-gray-600">
                    Our jewellery expert will contact you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-colors"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  {/* Company & Country (optional) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                        Company
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-colors"
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-colors"
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message (optional)
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-colors resize-none"
                      placeholder="Any specific requirements?"
                    />
                  </div>

                  {/* Hidden product interest (already in state) */}

                  {/* Error message */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Submit button */}
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="w-full rounded-xl py-4 text-base font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Send className="h-5 w-5" />
                        Submit Request
                      </span>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    We'll respond within 24 hours. Your data is kept private.
                  </p>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}