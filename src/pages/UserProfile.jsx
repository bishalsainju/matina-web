import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import { api } from '../api.js'

const INTENTS = [
  { id: 'friendship', icon: '🤝', label: 'Friendship' },
  { id: 'dating',     icon: '💕', label: 'Dating'     },
  { id: 'marriage',   icon: '💍', label: 'Marriage'   },
]

function avatarGradient(seed) {
  const h = parseInt(seed) || 30
  return `linear-gradient(135deg, hsl(${h},80%,75%), hsl(${(h+40)%360},70%,55%))`
}

function cardSlides(seed) {
  const h = parseInt(seed) || 30
  return [
    `linear-gradient(135deg, hsl(${h},68%,62%), hsl(${(h+65)%360},60%,55%))`,
    `linear-gradient(160deg, hsl(${(h+120)%360},72%,65%), hsl(${(h+160)%360},62%,50%))`,
    `linear-gradient(115deg, hsl(${(h+230)%360},70%,70%), hsl(${(h+270)%360},60%,55%))`,
  ]
}

export default function UserProfile() {
  const { id }         = useParams()
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const fromLikedMe    = searchParams.get('fromLikedMe') === 'true'

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [slide,   setSlide]   = useState(0)
  const [acted,   setActed]   = useState(false)
  const [matched, setMatched] = useState(false)
  const [toast,   setToast]   = useState('')

  useEffect(() => {
    api.userProfile(id)
      .then(setProfile)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  async function handleLike() {
    setActed(true)
    try {
      const res = await api.like(id)
      if (res.matched) { setMatched(true); showToast(`It's a match with ${profile.name}! 💕`) }
      else { showToast(`Liked ${profile.name} ♥`); setTimeout(() => navigate(-1), 1500) }
    } catch { setActed(false) }
  }

  async function handlePass() {
    setActed(true)
    try { await api.pass(id); navigate(-1) }
    catch { setActed(false) }
  }

  if (loading) return (
    <div><Nav /><div className="app-main" style={{ textAlign: 'center', paddingTop: 80 }}>⏳</div></div>
  )

  if (error || !profile) return (
    <div>
      <Nav />
      <div className="app-main" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>😕</div>
        <div style={{ color: 'var(--fg-3)' }}>{error || 'Profile not found'}</div>
        <button className="btn btn-secondary" style={{ marginTop: 20 }} onClick={() => navigate(-1)}>← Back</button>
      </div>
    </div>
  )

  const slides      = cardSlides(profile.avatar_seed)
  const locationStr = [profile.city, profile.state, profile.country].filter(Boolean).join(', ')
  const intents     = Array.isArray(profile.intent) ? profile.intent : []
  const showActions = fromLikedMe && !acted && !matched

  function goToChat() {
    navigate(`/chat?id=${profile.user_id}&name=${encodeURIComponent(profile.name)}`)
  }

  return (
    <div>
      {/* Custom minimal header */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(250,250,247,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="wrap" style={{ height: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--fg-2)', padding: '4px 8px' }}>←</button>
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' }}>{profile.name.split(' ')[0]}</span>
        </div>
      </nav>

      {/* Full-width photo slider */}
      <div style={{ width: '100%', maxHeight: 480, aspectRatio: '1 / 1.1', maxWidth: '100%', position: 'relative', overflow: 'hidden', background: slides[slide] }}>
        {/* Slide dots */}
        <div style={{ position: 'absolute', top: 12, left: 10, right: 10, display: 'flex', gap: 4, zIndex: 10 }}>
          {slides.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i === slide ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.38)' }} />
          ))}
        </div>

        {/* Tap zones */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
          <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setSlide(s => Math.max(0, s - 1))} />
          <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setSlide(s => Math.min(slides.length - 1, s + 1))} />
        </div>

        {/* Avatar initial */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, fontWeight: 800, color: '#fff' }}>
            {(profile.name || '?')[0]}
          </div>
        </div>

        {/* Verified badge */}
        {!!profile.is_verified && (
          <div style={{ position: 'absolute', top: 22, right: 14, width: 28, height: 28, borderRadius: '50%', background: 'var(--emerald-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff', color: '#fff', fontWeight: 800, fontSize: 11, zIndex: 10 }}>✓</div>
        )}
      </div>

      {/* Content */}
      <div className="app-main" style={{ paddingBottom: 80 }}>
        {toast && (
          <div style={{ position: 'fixed', top: 70, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.78)', color: '#fff', borderRadius: 20, padding: '10px 20px', fontSize: 14, fontWeight: 600, zIndex: 999, whiteSpace: 'nowrap' }}>
            {toast}
          </div>
        )}

        {/* Identity */}
        <div style={{ textAlign: 'center', padding: '20px 0 16px' }}>
          <div style={{ fontWeight: 800, fontSize: 26, fontFamily: 'var(--font-display)', color: 'var(--fg-1)', marginBottom: 4 }}>
            {profile.name}{profile.age ? `, ${profile.age}` : ''}
          </div>
          {locationStr && <div style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 10 }}>📍 {locationStr}</div>}
          {intents.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {intents.map(i => {
                const meta = INTENTS.find(x => x.id === i)
                return meta ? (
                  <div key={i} style={{ background: 'var(--primary-50)', borderRadius: 99, padding: '5px 14px', fontSize: 13, fontWeight: 600, color: 'var(--primary-700)' }}>
                    {meta.icon} {meta.label}
                  </div>
                ) : null
              })}
            </div>
          )}
        </div>

        {/* Primary CTA */}
        {matched ? (
          <button className="btn btn-primary btn-block" style={{ marginBottom: 16 }} onClick={goToChat}>
            💬 Send a message
          </button>
        ) : showActions ? (
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <button onClick={handlePass} style={{ flex: 1, padding: '14px 0', borderRadius: 14, border: '1.5px solid #EF4444', background: '#fff', color: '#EF4444', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>
              ✕ Pass
            </button>
            <button onClick={handleLike} className="btn btn-primary" style={{ flex: 1 }}>
              ♥ Like
            </button>
          </div>
        ) : !fromLikedMe ? (
          <button className="btn btn-primary btn-block" style={{ marginBottom: 16 }} onClick={goToChat}>
            💬 Send a message
          </button>
        ) : null}

        {/* About */}
        {profile.bio && (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>About</div>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.65 }}>{profile.bio}</p>
          </div>
        )}

        {/* Details */}
        {[profile.gender, profile.occupation, profile.education, profile.height, profile.hometown,
          profile.religion, profile.community, profile.drinking, profile.smoking, profile.diet].some(Boolean) && (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Details</div>
            <div className="profile-details-list">
              {profile.gender      && <div className="profile-detail-item">🪪 <span>{profile.gender}</span></div>}
              {profile.occupation  && <div className="profile-detail-item">💼 <span>{profile.occupation}</span></div>}
              {profile.education   && <div className="profile-detail-item">🎓 <span>{profile.education}</span></div>}
              {profile.height      && <div className="profile-detail-item">📏 <span>{profile.height}</span></div>}
              {profile.hometown    && <div className="profile-detail-item">🏠 <span>{profile.hometown}</span></div>}
              {profile.religion    && <div className="profile-detail-item">✨ <span>{profile.religion}</span></div>}
              {profile.community   && <div className="profile-detail-item">👥 <span>{profile.community}</span></div>}
              {profile.drinking    && <div className="profile-detail-item">🍷 <span>Drinks {profile.drinking.toLowerCase()}</span></div>}
              {profile.smoking     && <div className="profile-detail-item">🔥 <span>Smokes {profile.smoking.toLowerCase()}</span></div>}
              {profile.diet        && <div className="profile-detail-item">🥗 <span>{profile.diet}</span></div>}
            </div>
          </div>
        )}

        {/* Languages */}
        {profile.languages?.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Languages</div>
            <div className="profile-details-list">
              {profile.languages.map(l => (
                <div key={l} className="profile-detail-item">🗣 <span>{l}</span></div>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {profile.interests?.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Interests</div>
            <div className="interest-grid">
              {profile.interests.map(i => (
                <div key={i} className="interest-tag active" style={{ cursor: 'default' }}>
                  <span className="tag-check">✓</span>{i}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        {!fromLikedMe && (
          <button className="btn btn-primary btn-block" style={{ marginTop: 8 }} onClick={goToChat}>
            💬 Message {profile.name.split(' ')[0]}
          </button>
        )}
        {showActions && (
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button onClick={handlePass} style={{ flex: 1, padding: '14px 0', borderRadius: 14, border: '1.5px solid #EF4444', background: '#fff', color: '#EF4444', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>
              ✕ Pass
            </button>
            <button onClick={handleLike} className="btn btn-primary" style={{ flex: 1 }}>
              ♥ Like
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
