'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/auth'

export default function LoginPage() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('CUSTOMER')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(name, password, role)
      if (data.user?.role === 'CUSTOMER') {
        router.push('/customer')
      } else if (data.user?.role === 'RESTAURANT') {
        router.push('/restaurant')
      } else if (data.user?.role === 'DELIVERY') {
        router.push('/delivery')
      } else {
        router.push('/')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
  <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-red-50 via-white to-red-100 px-4">
    <div className="w-full max-w-md bg-white/80 backdrop-blur-md p-8 rounded-2xl border border-gray-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">

      {/* Heading */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Login to continue
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 text-sm bg-red-50 text-red-600 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Name */}
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="
            w-full px-4 py-2.5 rounded-lg border border-gray-200
            bg-white text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent
            transition
          "
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="
            w-full px-4 py-2.5 rounded-lg border border-gray-200
            bg-white text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent
            transition
          "
        />

        {/* Role */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="
            w-full px-4 py-2.5 rounded-lg border border-gray-200
            bg-white text-gray-900
            focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent
            transition
          "
        >
          <option value="CUSTOMER">Customer</option>
          <option value="RESTAURANT">Restaurant</option>
          <option value="DELIVERY">Delivery</option>
        </select>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full py-2.5 rounded-lg
            bg-red-500 text-white font-medium
            shadow-[0_6px_20px_rgba(239,68,68,0.35)]
            hover:bg-red-600 hover:shadow-[0_8px_25px_rgba(239,68,68,0.45)]
            active:scale-[0.98]
            disabled:bg-gray-300 disabled:shadow-none
            transition-all
          "
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-sm text-gray-500">
        Don’t have an account?{" "}
        <a
          href="/register"
          className="text-red-500 font-medium hover:underline"
        >
          Register
        </a>
      </p>
    </div>
  </div>
  )
}
