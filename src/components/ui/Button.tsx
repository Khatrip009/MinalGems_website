// components/ui/Button.tsx
import React from "react";
import { motion } from "framer-motion";

type ButtonVariant = "primary" | "outline" | "ghost";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const base =
  "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium tracking-wide transition-all duration-200 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed";

const variants: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-[#FF1493] via-[#FF3CA0] to-[#FFD700] 
    text-white 
    shadow-lg shadow-rose-300/40 
    hover:shadow-xl hover:brightness-110 
  `,
  outline: `
    border border-rose-500/60 text-rose-600 
    bg-white/40 backdrop-blur-sm 
    hover:bg-rose-50/70 hover:text-rose-700
  `,
  ghost: `
    text-slate-600 hover:bg-slate-100 
  `,
};

export default function Button({
  variant = "primary",
  children,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -2 }}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
