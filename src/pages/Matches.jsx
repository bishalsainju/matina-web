import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import { api } from '../api.js'

function avatarGradient(seed) {
  const h = parseInt(seed) || 30
  return `linear-gradient(135deg, hsl(${h},80%,75%), hsl(${(h + 40) % 360},70%,55%))`
}

function timeAgo(ts) {
  if (!ts) return ''
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 60)    return 'now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

function getSeenMap() {
  const map = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('nh_seen_')) {
      map[key.replace('nh_seen_', '')] = Number(localStorage.getItem(key))
    }
  }
  return map
}

export default function Matches() {
  const navigate = useNavigate()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [seenMap, setSeenMap] = useState({})

  useEffect(() => {
    setSeenMap(getSeenMap())
    api.matches()
      .then(setMatches)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const newMatches    = matches.filter(m => !m.last_message)
  const conversations = matches.filter(m =>  m.last_message)

  return (
    <div>
      <Nav />
      <div className="app-main">

        {loading && (
          <div style={{ textAlign: 'center', color: 'var(--fg-3)', padding: '60px 0' }}>Loading…</div>
        )}
        {error && <div className="alert-error">{error}</div>}

        {!loading && !error && matches.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>💕</div>
            <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--fg-1)', marginBottom: 8 }}>No matches yet</div>
            <div style={{ color: 'var(--fg-3)', fontSize: 15 }}>Keep swiping — your first match is close!</div>
          </div>
        )}

        {/* ── New Matches ────────────────────────────────── */}
        {!loading && newMatches.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
              New Matches
            </div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
              {newMatches.map(m => (
                <Link
                  key={m.user_id}
                  to={`/users/${m.user_id}`}
                  style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
                >
                  <div style={{
                    width: 76, height: 104, borderRadius: 14, background: avatarGradient(m.avatar_seed),
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                    fontSize: 30, fontWeight: 800, color: '#fff',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                  }}>
                    {(m.name || '?')[0]}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-1)', maxWidth: 76, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.name.split(' ')[0]}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Conversations ──────────────────────────────── */}
        {!loading && conversations.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
              Messages
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {conversations.map(m => {
                const lastSeenMs = seenMap[m.user_id] ?? 0
                const lastMsgMs  = m.last_message_at ? m.last_message_at * 1000 : 0
                const isUnread   = lastMsgMs > lastSeenMs

                return (
                  <div
                    key={m.user_id}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', cursor: 'pointer' }}
                    onClick={() => navigate(`/chat?id=${m.user_id}&name=${encodeURIComponent(m.name)}`)}
                  >
                    {/* Avatar — rounded square to match mobile */}
                    <div style={{
                      width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                      background: avatarGradient(m.avatar_seed),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, fontWeight: 700, color: '#fff',
                    }}>
                      {(m.name || '?')[0]}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                        <div style={{
                          fontWeight: isUnread ? 700 : 600,
                          fontSize: 15,
                          color: 'var(--fg-1)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {m.name}{m.age ? `, ${m.age}` : ''}
                        </div>
                        <div style={{
                          fontSize: 12,
                          color: isUnread ? 'var(--primary-600)' : 'var(--fg-4)',
                          fontWeight: isUnread ? 600 : 400,
                          flexShrink: 0, marginLeft: 8,
                        }}>
                          {timeAgo(m.last_message_at)}
                        </div>
                      </div>
                      <div style={{
                        fontSize: 14,
                        color: isUnread ? 'var(--fg-2)' : 'var(--fg-3)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {m.last_message}
                      </div>
                    </div>

                    {/* Unread dot or chevron */}
                    {isUnread
                      ? <div style={{ width: 10, height: 10, borderRadius: 5, background: 'var(--primary-600)', flexShrink: 0 }} />
                      : <div style={{ color: 'var(--fg-4)', fontSize: 16, flexShrink: 0 }}>›</div>
                    }
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
