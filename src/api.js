const BASE = '/api'

function token() { return localStorage.getItem('nh_token') }

async function req(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const t = token()
  if (t) headers['Authorization'] = `Bearer ${t}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Request failed (${res.status})`)
  }
  return res.json()
}

export const api = {
  // Auth
  register:  (data)            => req('POST', '/auth/register', data),
  login:     (email, password) => req('POST', '/auth/login', { email, password }),
  me:        ()                => req('GET',  '/auth/me'),

  // Profiles
  updateProfile: (data)        => req('PATCH', '/profiles/me', data),
  updateMe:      (data)        => req('PATCH', '/profiles/me', data),

  // Discover
  discover: (filters = {})    => req('GET', '/discover?' + new URLSearchParams(filters)),

  // Likes
  swipe:    (to_user_id, action) => req('POST', '/likes', { to_user_id, action }),
  like:     (to_user_id)         => req('POST', '/likes', { to_user_id, action: 'like' }),
  pass:     (to_user_id)         => req('POST', '/likes', { to_user_id, action: 'pass' }),
  superLike:(to_user_id)         => req('POST', '/likes', { to_user_id, action: 'super_like' }),
  likedMe:  ()                   => req('GET',  '/likes/liked-me'),
  iLiked:   ()                   => req('GET',  '/likes/i-liked'),

  // Matches
  matches: ()                 => req('GET', '/matches'),

  // Stats
  stats: () => req('GET', '/stats'),

  // Messages
  messages:    (otherId)           => req('GET',  `/messages/${otherId}`),
  sendMessage: (otherId, content)  => req('POST', `/messages/${otherId}`, { content }),

  // Public profiles
  userProfile: (userId)            => req('GET',  `/users/${userId}`),
}
