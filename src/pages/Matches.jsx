import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import { api } from '../api.js'

function avatarGradient(seed) {
  const h = parseInt(seed) || 30
  return `linear-gradient(135deg, hsl(${h},80%,75%), hsl(${(h + 40) % 360},70%,55%))`
}

function timeAgo(ts) {
  if (!ts) return ''
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function Matches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    api.matches()
      .then(setMatches)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <Nav />
      <div className="app-main">
        <div className="eyebrow">Your matches</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--fg-1)', margin: '8px 0 28px' }}>
          People who said yes
        </h1>

        {loading && (
          <div style={{ textAlign: 'center', color: 'var(--fg-3)', padding: '40px 0' }}>Loading…</div>
        )}
        {error && <div className="alert-error">{error}</div>}

        {!loading && !error && matches.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--fg-3)', padding: '48px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💛</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--fg-1)', marginBottom: 8 }}>No matches yet</div>
            <div>Head to Discover and start swiping.</div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {matches.map(m => (
            <div key={m.user_id} className="match-row" style={{ cursor: 'default' }}>
              <Link
                to={`/users/${m.user_id}`}
                style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit' }}
              >
                <div className="av" style={{ background: avatarGradient(m.avatar_seed), flexShrink: 0 }}>
                  {m.is_verified ? <div className="dot" style={{ background: 'var(--emerald-500)' }} /> : <div className="dot" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="name">{m.name}, {m.age}</div>
                  <div className="preview">
                    {m.last_message || 'New match — say hello!'}
                  </div>
                </div>
                <div className="time">{timeAgo(m.last_message_at)}</div>
              </Link>
              <Link
                to={`/chat?id=${m.user_id}&name=${encodeURIComponent(m.name)}`}
                title="Send a message"
                style={{
                  flexShrink: 0, marginLeft: 8,
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--primary-50)', border: '1.5px solid var(--primary-200)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, textDecoration: 'none',
                }}
              >
                💬
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
