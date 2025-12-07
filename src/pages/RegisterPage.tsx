import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { apiFetch } from "../api/client";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

type RegisterResponse = {
  ok: boolean;
  user?: {
    id: string;
    email: string;
    full_name?: string;
    role_id?: number;
  };
  token?: string;
  error?: string;
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fromPath = "/profile"; // After registration → update profile details

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setErrorMsg("Please enter a valid email.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await apiFetch<RegisterResponse>("/auth/register", {
        method: "POST",
        body: {
          full_name: fullName,
          email,
          password,
        },
      });

      if (!res.ok || !res.token || !res.user) {
        let msg = "Unable to create your account. Please try again.";

        if (res.error === "email_already_registered") {
          msg = "This email is already registered. Try logging in instead.";
        } else if (res.error === "password_too_short") {
          msg = "Password is too short (min 6 characters).";
        }

        setErrorMsg(msg);
        setSubmitting(false);
        return;
      }

      // Save auth token
      localStorage.setItem("auth_token", res.token);
      localStorage.setItem("auth_user", JSON.stringify(res.user));

      toast.success("Account created successfully!");

      navigate(fromPath, { replace: true });
    } catch (err) {
      console.error("Register error:", err);
      setErrorMsg("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7FB] via-[#FFF8EF] to-[#FFE9FA] flex items-center justify-center px-4 py-8 font-body">
      <div className="w-full max-w-5xl rounded-3xl bg-white/80 shadow-2xl shadow-pink-100/70 overflow-hidden border border-pink-50 backdrop-blur-sm">

        <div className="grid md:grid-cols-2 min-h-[520px]">

          {/* LEFT PANEL (IMAGE) */}
          <motion.div
            className="hidden md:flex items-center justify-center relative overflow-hidden"
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 22 }}
            style={{
              backgroundImage: `url('/images/products/product04.jpg')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* RIGHT PANEL (FORM) */}
          <div className="flex flex-col justify-center px-6 py-10 md:px-10">

            {/* Logo */}
            <div className="mb-6 flex items-center justify-center gap-3 md:justify-start">
              <img
                src="/logo_minalgems.png"
                alt="Minal Gems"
                className="h-20 w-auto drop-shadow-sm"
              />
              <div className="leading-tight">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-pink-500">
                  Minal Gems
                </p>
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                  Jewellery for all occasions
                </p>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-semibold text-slate-800">
              Create your account
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Join us and enjoy personalised shopping experience.
            </p>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">

              {/* FULL NAME */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  Full Name
                </label>
                <div className="relative">
                  <User className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    className="w-full rounded-full border border-pink-100 bg-white/80 py-2.5 pl-10 pr-3 text-sm text-slate-800 shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    autoComplete="email"
                    className="w-full rounded-full border border-pink-100 bg-white/80 py-2.5 pl-10 pr-3 text-sm text-slate-800 shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="w-full rounded-full border border-pink-100 bg-white/80 py-2.5 pl-10 pr-10 text-sm text-slate-800 shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full rounded-full border border-pink-100 bg-white/80 py-2.5 pl-10 pr-3 text-sm text-slate-800 shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
                    placeholder="Repeat password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>
              </div>

              {/* ERRORS */}
              {errorMsg && (
                <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600 border border-red-100">
                  {errorMsg}
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={submitting}
                className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-md hover:from-pink-600 hover:to-rose-600 disabled:opacity-70"
              >
                {submitting ? (
                  <span className="text-xs">Creating your account...</span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-4 text-center text-[11px] text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-pink-500 hover:text-pink-600">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* INPUT ANIMATIONS */}
      <style jsx>{`
        .font-body {
          font-family: ui-sans-serif, system-ui, -apple-system, 'Inter', Arial;
        }

        input {
          transition: box-shadow 0.18s ease, transform 0.12s ease;
        }

        input:focus {
          box-shadow: 0 8px 20px rgba(232, 121, 149, 0.12);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
