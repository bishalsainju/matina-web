import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

export default function UserProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    api.userProfile(id)
      .then(setProfile)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div>
      <Nav />
      <div className="app-main" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 36 }}>⏳</div>
      </div>
    </div>
  )

  if (error || !profile) return (
    <div>
      <Nav />
      <div className="app-main" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>😕</div>
        <div style={{ color: 'var(--fg-3)' }}>{error || 'Profile not found'}</div>
      </div>
    </div>
  )

  const avatarBg    = avatarGradient(profile.avatar_seed)
  const locationStr = [profile.city, profile.state, profile.country].filter(Boolean).join(', ')
  const intents     = Array.isArray(profile.intent) ? profile.intent : []

  return (
    <div>
      <Nav />
      <div className="app-main" style={{ maxWidth: 560, paddingBottom: 80 }}>

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
          style={{ marginBottom: 24, padding: '10px 20px', fontSize: 14 }}
        >
          ← Back
        </button>

        {/* Avatar hero */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 120, height: 120, borderRadius: '50%', background: avatarBg,
            margin: '0 auto 16px', position: 'relative',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}>
            {profile.is_verified ? (
              <div style={{
                position: 'absolute', bottom: 4, right: 4,
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--emerald-500)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800, border: '2px solid #fff',
              }}>✓</div>
            ) : null}
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--fg-1)', margin: '0 0 6px' }}>
            {profile.name}{profile.age ? `, ${profile.age}` : ''}
          </h1>

          {locationStr && (
            <div style={{ fontSize: 15, color: 'var(--fg-3)', marginBottom: 10 }}>📍 {locationStr}</div>
          )}

          {intents.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
              {intents.map(id => {
                const it = INTENTS.find(x => x.id === id)
                return it ? (
                  <span key={id} style={{
                    background: 'var(--primary-50)', color: 'var(--primary-700)',
                    border: '1.5px solid var(--primary-200)', borderRadius: 9999,
                    padding: '5px 14px', fontSize: 13, fontWeight: 600,
                  }}>
                    {it.icon} {it.label}
                  </span>
                ) : null
              })}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/chat?id=${profile.user_id}&name=${encodeURIComponent(profile.name)}`)}
            >
              💬 Send a message
            </button>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div style={{ padding: '20px 0', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>About</div>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.65 }}>{profile.bio}</p>
          </div>
        )}

        {/* Details */}
        {[profile.gender, profile.occupation, profile.education, profile.height, profile.hometown,
          profile.religion, profile.community, profile.drinking, profile.smoking, profile.diet].some(Boolean) && (
          <div style={{ padding: '20px 0', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Details</div>
            <div className="profile-details-list">
              {profile.gender      && <div className="profile-detail-item">🪪 <span>{profile.gender}</span></div>}
              {profile.occupation  && <div className="profile-detail-item">💼 <span>{profile.occupation}</span></div>}
              {profile.education   && <div className="profile-detail-item">🎓 <span>{profile.education}</span></div>}
              {profile.height      && <div className="profile-detail-item">📏 <span>{profile.height}</span></div>}
              {profile.hometown    && <div className="profile-detail-item">🏠 <span>{profile.hometown}</span></div>}
              {profile.religion    && <div className="profile-detail-item">🕉 <span>{profile.religion}</span></div>}
              {profile.community   && <div className="profile-detail-item">👥 <span>{profile.community}</span></div>}
              {profile.drinking    && <div className="profile-detail-item">🍺 <span>Drinks {profile.drinking.toLowerCase()}</span></div>}
              {profile.smoking     && <div className="profile-detail-item">🚬 <span>Smokes {profile.smoking.toLowerCase()}</span></div>}
              {profile.diet        && <div className="profile-detail-item">🥗 <span>{profile.diet}</span></div>}
            </div>
          </div>
        )}

        {/* Languages */}
        {profile.languages?.length > 0 && (
          <div style={{ padding: '20px 0', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Languages</div>
            <div className="profile-details-list">
              {profile.languages.map(l => (
                <div key={l} className="profile-detail-item">🗣 <span>{l}</span></div>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {profile.interests?.length > 0 && (
          <div style={{ padding: '20px 0', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Interests</div>
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
        <div style={{ paddingTop: 32, borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <button
            className="btn btn-primary btn-block"
            onClick={() => navigate(`/chat?id=${profile.user_id}&name=${encodeURIComponent(profile.name)}`)}
          >
            💬 Send a message to {profile.name.split(' ')[0]}
          </button>
        </div>

      </div>
    </div>
  )
}
