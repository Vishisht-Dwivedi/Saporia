"use client";

import React from "react";
import clsx from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export default function Card({
  children,
  className = "",
  hoverable = true,
}: CardProps) {
  return (
    <div
      className={clsx(
        "relative rounded-sm border border-gray-200/60 bg-white/70 backdrop-blur-md",
        "transition-all duration-300 ease-out",
        "shadow-[0_4px_20px_rgba(0,0,0,0.06)]",
        "p-1",
        hoverable &&
          "hover:shadow-[0_10px_30px_rgba(0,0,0,0.10)] hover:-translate-y-1 hover:scale-[1.01]",
        className
      )}
    >
      {children}
    </div>
  );
}