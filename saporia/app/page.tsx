'use client'

import Navbar from '@/components/Navbar'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Footer from '@/components/Footer'
import Link from 'next/link'
import React from 'react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
              Fresh meals, delivered fast.
            </h1>
            <p className="mt-4 text-gray-600 max-w-xl">
              Order from local restaurants and get your favorites at your doorstep in minutes.
            </p>

            <div className="mt-8 flex items-center gap-4">
              <Link href="/login" className="inline-block">
                <Button>Order Now</Button>
              </Link>

              <Link href="/login" className="inline-block">
                <Button variant="secondary">Explore</Button>
              </Link>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              <span className="font-medium text-red-500">Free</span> delivery on your first order
            </div>
          </div>

          {/* Right: Image-based CTA */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1400&q=80"
                alt="Delicious food"
                className="w-full h-105 object-cover"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Customer reviews */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-semibold">What customers say</h2>
          <p className="mt-2 text-gray-600 max-w-2xl">Real reviews from real people — honest, short, and sweet.</p>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <div className="p-6">
                <div className="text-red-500 mb-2">★★★★★</div>
                <p className="text-gray-700">Amazing food and lightning-fast delivery. Highly recommend!</p>
                <div className="mt-4 text-sm text-gray-500">— Jamie</div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="text-red-500 mb-2">★★★★★</div>
                <p className="text-gray-700">Great selection and the app is so easy to use.</p>
                <div className="mt-4 text-sm text-gray-500">— Priya</div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="text-red-500 mb-2">★★★★☆</div>
                <p className="text-gray-700">Food was fresh and hot. Delivery took a bit longer but worth it.</p>
                <div className="mt-4 text-sm text-gray-500">— Carlos</div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
