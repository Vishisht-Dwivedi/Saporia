"use client"

import Link from 'next/link'
import React from 'react'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-12 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-start justify-between gap-6">
        <div>
          <Link href="/" className="text-2xl font-semibold">
            <span className="text-red-500">S</span>aporia
          </Link>
          <p className="mt-2 text-sm text-gray-600">Fresh meals, delivered to your door.</p>
        </div>

        <div className="flex gap-10">
          <div>
            <h4 className="font-medium mb-2">Company</h4>
            <nav className="flex flex-col gap-2 text-sm text-gray-600">
              <Link href="/about" className="hover:text-red-500">About</Link>
              <Link href="/careers" className="hover:text-red-500">Careers</Link>
              <Link href="/contact" className="hover:text-red-500">Contact</Link>
            </nav>
          </div>

          <div>
            <h4 className="font-medium mb-2">Support</h4>
            <nav className="flex flex-col gap-2 text-sm text-gray-600">
              <Link href="/help" className="hover:text-red-500">Help Center</Link>
              <Link href="/terms" className="hover:text-red-500">Terms</Link>
              <Link href="/privacy" className="hover:text-red-500">Privacy</Link>
            </nav>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          © {new Date().getFullYear()} Saporia
        </div>
      </div>
    </footer>
  )
}
