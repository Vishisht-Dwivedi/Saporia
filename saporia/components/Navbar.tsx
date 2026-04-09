"use client";

import React from "react";
import Link from "next/link";

interface NavbarProps {
  user?: { name: string };
  onLogout?: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-[9999] backdrop-blur-lg bg-white/70 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-semibold tracking-tight text-gray-900 hover:opacity-80 transition"
        >
          <span className="text-red-500">S</span>aporia
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          
          {user && (
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition cursor-pointer">
              
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                {user.name?.charAt(0).toUpperCase()}
              </div>

              {/* Name */}
              <span className="text-sm font-medium text-gray-800">
                {user.name}
              </span>
            </div>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-full bg-red-500 text-white text-sm font-medium shadow-sm hover:bg-red-600 hover:shadow-md active:scale-95 transition-all"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}