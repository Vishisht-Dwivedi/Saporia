import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100 ${className}`}
      style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}
    >
      {children}
    </div>
  );
}
