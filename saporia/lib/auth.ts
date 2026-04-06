export async function login(name: string, password: string, role: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password, role }),
    credentials: 'include',
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error)
  }
  const data = await res.json()
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user))
  }
  return data
}

export async function register(name: string, password: string, role: string, lat?: number, lng?: number) {
  const res = await fetch('/api/auth/registration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password, role, lat, lng }),
    credentials: 'include',
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error)
  }
  const data = await res.json()
  if (data.id) {
    localStorage.setItem('user', JSON.stringify(data))
  }
  return data
}

export async function verify() {
  const res = await fetch('/api/auth/verify', {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) return null
  return res.json()
}

export async function logout() {
  document.cookie = 'token=; Path=/; Max-Age=0'
}
