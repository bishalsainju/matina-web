import { useState, useEffect } from 'react'
import Nav from '../components/Nav.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api.js'

function avatarGradient(seed) {
  const h = parseInt(seed) || 30
  return `linear-gradient(135deg, hsl(${h},80%,75%), hsl(${(h+40)%360},70%,55%))`
}

function BlurredCard({ person, onClickCard }) {
  const [hovered, setHovered] = useState(false)

  const isSuperLike = person.their_action === 'super_like'
  const gradientBg  = avatarGradient(person.avatar_seed)

  return (
    <div
      onClick={onClickCard}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        boxShadow: hovered
          ? '0 8px 28px rgba(15,23,42,0.12)'
          : '0 2px 8px rgba(15,23,42,0.06)',
        border: '1px solid var(--border-subtle)',
        transition: 'box-shadow 180ms ease, transform 180ms ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* Super like badge */}
      {isSuperLike && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 10,
          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
          color: '#fff',
          fontSize: 11,
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: 9999,
          boxShadow: '0 2px 8px rgba(217,119,6,0.45)',
          letterSpacing: '0.02em',
        }}>
          Super like ⭐
        </div>
      )}

      {/* Avatar area — blurred */}
      <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
        {/* Gradient base (visible through blur) */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: gradientBg,
          filter: 'blur(8px)',
          transform: 'scale(1.1)', /* avoids white fringe from blur */
        }} />

        {/* Frosted overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(4px)',
        }} />

        {/* Center lock icon */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 6,
          zIndex: 2,
        }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
          }}>
            🔒
          </div>
        </div>

        {/* Hover overlay */}
        {hovered && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(234,88,12,0.82)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3,
            transition: 'opacity 160ms ease',
          }}>
            <span style={{
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
              textAlign: 'center',
              padding: '0 12px',
              lineHeight: 1.4,
            }}>
              Unlock with Premium
            </span>
          </div>
        )}
      </div>

      {/* Card body — blurred placeholder lines */}
      <div style={{ padding: '14px 14px 16px' }}>
        {/* Name placeholder */}
        <div style={{
          height: 14,
          width: '65%',
          background: 'var(--border-subtle)',
          borderRadius: 6,
          marginBottom: 8,
        }} />
        {/* Age / city placeholder */}
        <div style={{
          height: 11,
          width: '45%',
          background: 'var(--border-subtle)',
          borderRadius: 6,
          marginBottom: 10,
        }} />
        {/* Detail pill placeholders */}
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{
            height: 22,
            width: 52,
            background: 'var(--border-subtle)',
            borderRadius: 9999,
          }} />
          <div style={{
            height: 22,
            width: 40,
            background: 'var(--border-subtle)',
            borderRadius: 9999,
          }} />
        </div>
      </div>
    </div>
  )
}

export default function LikedMe() {
  const { user } = useAuth()
  const [admirers, setAdmirers] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [toast, setToast]       = useState('')

  useEffect(() => {
    api.likedMe()
      .then(setAdmirers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2400)
  }

  function handleCardClick() {
    showToast('Upgrade to Premium to see who liked you')
  }

  /* ── Loading ─────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div>
        <Nav />
        <div className="app-main" style={{ textAlign: 'center', paddingTop: 80 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
          <div style={{ color: 'var(--fg-3)', fontSize: 15 }}>Loading…</div>
        </div>
      </div>
    )
  }

  /* ── Error ───────────────────────────────────────────────────── */
  if (error) {
    return (
      <div>
        <Nav />
        <div className="app-main">
          <div className="alert-error">{error}</div>
        </div>
      </div>
    )
  }

  const count = admirers.length

  return (
    <div>
      <Nav />
      <div className="app-main">

        {/* Page header */}
        <div className="eyebrow">Who likes you</div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 28,
          color: 'var(--fg-1)',
          margin: '8px 0 6px',
        }}>
          Secret admirers
        </h1>

        {/* Count badge */}
        <div style={{
          fontSize: 15,
          color: 'var(--fg-3)',
          fontWeight: 600,
          marginBottom: 28,
        }}>
          {count} {count === 1 ? 'person' : 'people'} liked you
        </div>

        {/* Empty state */}
        {count === 0 ? (
          <div style={{
            textAlign: 'center',
            color: 'var(--fg-3)',
            padding: '56px 24px',
          }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>💛</div>
            <div style={{
              fontWeight: 700,
              fontSize: 18,
              color: 'var(--fg-1)',
              marginBottom: 8,
            }}>
              No likes yet
            </div>
            <div style={{ fontSize: 15, lineHeight: 1.6, maxWidth: 320, margin: '0 auto' }}>
              Keep swiping to get noticed — someone will like you soon!
            </div>
          </div>
        ) : (
          <>
            {/* Premium upgrade card */}
            <div style={{
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
              textAlign: 'center',
              boxShadow: '0 2px 10px rgba(15,23,42,0.05)',
            }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🔒</div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 18,
                color: 'var(--fg-1)',
                marginBottom: 8,
              }}>
                See who likes you
              </div>
              <p style={{
                fontSize: 14,
                color: 'var(--fg-3)',
                lineHeight: 1.6,
                margin: '0 auto 18px',
                maxWidth: 360,
              }}>
                Upgrade to Premium to reveal who has already liked your profile. Never miss a match.
              </p>
              <button
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, var(--saffron-500), var(--primary-600))',
                  color: '#fff',
                  borderRadius: 9999,
                  padding: '13px 32px',
                  fontSize: 15,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(234,88,12,0.32)',
                }}
                onClick={() => showToast('Premium upgrade coming soon!')}
              >
                Upgrade to Premium ✨
              </button>
            </div>

            {/* Grid of blurred profile cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 14,
            }}>
              {admirers.map(person => (
                <BlurredCard
                  key={person.user_id}
                  person={person}
                  onClickCard={handleCardClick}
                />
              ))}
            </div>
          </>
        )}

      </div>

      {/* Toast */}
      <div className={`toast${toast ? ' show' : ''}`}>{toast}</div>
    </div>
  )
}
