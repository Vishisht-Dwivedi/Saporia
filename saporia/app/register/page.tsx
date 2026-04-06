'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { register } from '@/lib/auth'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('CUSTOMER')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(name, password, role, lat ? parseFloat(lat) : undefined, lng ? parseFloat(lng) : undefined)
      router.push('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Register</h1>
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="CUSTOMER">Customer</option>
            <option value="RESTAURANT">Restaurant</option>
            <option value="DELIVERY">Delivery</option>
          </select>
          <input
            type="number"
            placeholder="Latitude (optional)"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            step="0.0001"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Longitude (optional)"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            step="0.0001"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Already have an account? <a href="/login" className="text-blue-500 hover:underline">Login</a>
        </p>
      </div>
    </div>
  )
}
