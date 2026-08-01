import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const INTENT_LABELS = {
  friendship: '🤝 Friendship',
  dating:     '💕 Dating',
  marriage:   '💍 Marriage',
}

const TIERS = [
  { id: 'free',     label: 'Free',       price: 'Free',      color: 'var(--fg-3)', features: '10 likes/day · Unlimited pass' },
  { id: 'gold',     label: '🥇 Gold',     price: '$19.99/mo', color: '#F59E0B',     features: '50 likes/day · Undo swipes' },
  { id: 'platinum', label: '🔷 Platinum', price: '$29.99/mo', color: '#8B5CF6',     features: '150/day · Super Like · See likes' },
  { id: 'diamond',  label: '💎 Diamond',  price: '$39.99/mo', color: '#06B6D4',     features: 'Unlimited · All features' },
]

function avatarBg(seed) {
  const h = parseInt(seed) || 30
  return `linear-gradient(135deg, hsl(${h},78%,72%), hsl(${(h + 40) % 360},70%,55%))`
}

function parseIntentArray(raw) {
  if (Array.isArray(raw)) return raw
  if (!raw) return []
  try {
    const p = JSON.parse(raw)
    return Array.isArray(p) ? p : [p].filter(Boolean)
  } catch { return raw ? [raw] : [] }
}

function completionPct(p) {
  const checks = [
    p.bio, p.occupation, p.education, p.height,
    p.city, p.religion, p.community, p.diet,
    p.languages?.length > 0, p.interests?.length > 0,
  ]
  return Math.round(checks.filter(Boolean).length / checks.length * 100)
}

export default function Profile() {
  const navigate       = useNavigate()
  const { user, logout } = useAuth()
  const [tier, setTierState] = useState(() => localStorage.getItem('nh_tier') || 'free')

  function setTier(t) {
    setTierState(t)
    localStorage.setItem('nh_tier', t)
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  if (!user) return <div><Nav /></div>

  const intents     = parseIntentArray(user.intent)
  const locationStr = [user.city, user.state, user.country].filter(Boolean).join(', ')
  const completion  = completionPct(user)
  const avatar      = avatarBg(user.avatar_seed)

  return (
    <div>
      <Nav />
      <div className="app-main" style={{ paddingBottom: 60 }}>

        {/* Avatar */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 28, paddingBottom: 4 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 108, height: 108, borderRadius: 54, background: avatar, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46, fontWeight: 700, color: '#fff' }}>
              {(user.name || '?')[0]}
            </div>
            {!!user.is_verified && (
              <div style={{ position: 'absolute', bottom: 2, right: 2, width: 26, height: 26, borderRadius: 13, background: 'var(--emerald-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2.5px solid var(--bg)', color: '#fff', fontWeight: 700, fontSize: 11 }}>✓</div>
            )}
          </div>
        </div>

        {/* Name / location / intents */}
        <div style={{ textAlign: 'center', paddingInline: 24, paddingTop: 14, paddingBottom: 18 }}>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--fg-1)', marginBottom: 4 }}>
            {user.name}{user.age ? `, ${user.age}` : ''}
          </div>
          {locationStr && <div style={{ fontSize: 14, color: 'var(--fg-3)', marginBottom: 10 }}>📍 {locationStr}</div>}
          {intents.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {intents.map(id => INTENT_LABELS[id] ? (
                <div key={id} style={{ background: 'var(--primary-50)', borderRadius: 99, paddingInline: 13, paddingBlock: 5, fontSize: 13, fontWeight: 600, color: 'var(--primary-700)' }}>
                  {INTENT_LABELS[id]}
                </div>
              ) : null)}
            </div>
          )}
        </div>

        {/* Profile completion bar */}
        {completion < 100 && (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-2)' }}>Profile strength</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-600)' }}>{completion}%</span>
            </div>
            <div style={{ height: 5, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: 5, width: `${completion}%`, background: 'var(--primary-600)', borderRadius: 99 }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>A complete profile gets 3× more matches</div>
          </div>
        )}

        {/* Edit Profile button */}
        <button
          onClick={() => navigate('/profile/edit')}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--primary-600)', borderRadius: 14, paddingBlock: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 20, boxShadow: '0 6px 20px rgba(255,77,109,0.28)' }}
        >
          ✏ Edit Profile
        </button>

        {/* About */}
        {user.bio && (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>About</div>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.65 }}>{user.bio}</p>
          </div>
        )}

        {/* Details */}
        {[user.gender, user.occupation, user.education, user.height, user.hometown, user.religion, user.community, user.drinking, user.smoking, user.diet].some(Boolean) && (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Details</div>
            <div className="profile-details-list">
              {user.gender     && <div className="profile-detail-item">🪪 <span>{user.gender}</span></div>}
              {user.occupation && <div className="profile-detail-item">💼 <span>{user.occupation}</span></div>}
              {user.education  && <div className="profile-detail-item">🎓 <span>{user.education}</span></div>}
              {user.height     && <div className="profile-detail-item">📏 <span>{user.height}</span></div>}
              {user.hometown   && <div className="profile-detail-item">🏠 <span>{user.hometown}</span></div>}
              {user.religion   && <div className="profile-detail-item">✨ <span>{user.religion}</span></div>}
              {user.community  && <div className="profile-detail-item">👥 <span>{user.community}</span></div>}
              {user.drinking   && <div className="profile-detail-item">🍷 <span>Drinks {user.drinking.toLowerCase()}</span></div>}
              {user.smoking    && <div className="profile-detail-item">🔥 <span>Smokes {user.smoking.toLowerCase()}</span></div>}
              {user.diet       && <div className="profile-detail-item">🥗 <span>{user.diet}</span></div>}
            </div>
          </div>
        )}

        {/* Languages */}
        {user.languages?.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Languages</div>
            <div className="profile-details-list">
              {user.languages.map(l => (
                <div key={l} className="profile-detail-item">🗣 <span>{l}</span></div>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {user.interests?.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Interests</div>
            <div className="interest-grid">
              {user.interests.map(i => (
                <div key={i} className="interest-tag active" style={{ cursor: 'default' }}>
                  <span className="tag-check">✓</span>{i}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dev tier selector */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: 14, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 15 }}>🔧</span>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-3)' }}>Dev — Select Tier</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TIERS.map(t => (
              <button
                key={t.id}
                onClick={() => setTier(t.id)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', border: tier === t.id ? `2px solid ${t.color}` : '1.5px solid var(--border)', background: tier === t.id ? `${t.color}18` : '#fff', color: 'var(--fg-1)', fontFamily: 'inherit' }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: tier === t.id ? t.color : 'var(--fg-1)' }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{t.features}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: tier === t.id ? t.color : 'var(--fg-3)' }}>{t.price}</div>
                  {tier === t.id && <span style={{ color: t.color, fontSize: 14 }}>✓</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', paddingBlock: 20, marginTop: 4, fontSize: 14, fontWeight: 600, color: 'var(--fg-3)', fontFamily: 'inherit' }}
        >
          ↪ Sign out
        </button>

      </div>
    </div>
  )
}
