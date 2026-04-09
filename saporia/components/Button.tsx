"use client";

import React from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary: clsx(
      "bg-red-500 text-white",
      "shadow-[0_4px_14px_rgba(239,68,68,0.35)]",
      "hover:bg-red-600 hover:shadow-[0_6px_20px_rgba(239,68,68,0.45)]",
      "active:scale-[0.97]"
    ),

    secondary: clsx(
      "bg-gray-100 text-gray-900",
      "shadow-sm",
      "hover:bg-gray-200",
      "active:scale-[0.97]"
    ),
  };

  const disabledStyles =
    "opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none";

  return (
    <button
      className={clsx(
        base,
        variants[variant],
        disabled && disabledStyles,
        "focus:ring-red-400",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}