'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { verify, logout } from '@/lib/auth'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const result = await verify()
      if (result?.user) {
        setUser(result.user)
      } else {
        router.push('/login')
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Saporia</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Welcome, {user?.name}!</h2>
          <div className="space-y-2">
            <p><strong>User ID:</strong> {user?.id}</p>
            <p><strong>Role:</strong> {user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
