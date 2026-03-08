import React from "react";
import { motion as Motion } from "framer-motion";

const variants = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-700",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  success:
    "bg-green-600 text-white hover:bg-green-700",
  danger:
    "bg-red-600 text-white hover:bg-red-700",
};

const Button = ({
  children,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
  ...props
}) => {
  return (
    <Motion.button
      type={type}
      disabled={disabled}
      whileTap={{ scale: 0.97 }}
      whileHover={disabled ? {} : { scale: 1.01 }}
      transition={{ duration: 0.15 }}
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </Motion.button>
  );
};

export default Button;
