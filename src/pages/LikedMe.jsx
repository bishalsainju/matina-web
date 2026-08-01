import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import { api } from '../api.js'

function avatarGradient(seed) {
  const h = parseInt(seed) || 30
  return `linear-gradient(135deg, hsl(${h},80%,75%), hsl(${(h+40)%360},70%,55%))`
}

function getTier() {
  return localStorage.getItem('nh_tier') || 'free'
}

const TIER_META = {
  free:     { label: 'Free',     color: 'var(--fg-3)',    icon: '☁️' },
  gold:     { label: 'Gold',     color: '#F59E0B',        icon: '🥇' },
  platinum: { label: 'Platinum', color: '#8B5CF6',        icon: '🔷' },
  diamond:  { label: 'Diamond',  color: '#06B6D4',        icon: '💎' },
}

const TIERS = [
  { id: 'free',     label: 'Free',       price: 'Free',      features: '10 likes/day' },
  { id: 'gold',     label: '🥇 Gold',     price: '$19.99/mo', features: '50 likes/day · Undo' },
  { id: 'platinum', label: '🔷 Platinum', price: '$29.99/mo', features: '150 likes/day · Super Like · See likes' },
  { id: 'diamond',  label: '💎 Diamond',  price: '$39.99/mo', features: 'Unlimited · All features · Location filter' },
]

export default function LikedMe() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('liked-me')
  const [likers,    setLikers]    = useState([])
  const [sentLikes, setSentLikes] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [loadingSent, setLoadingSent] = useState(false)
  const [tier, setTierState]      = useState(() => getTier())
  const [toast, setToast]         = useState('')

  const canSeeLikes = ['platinum', 'diamond'].includes(tier)

  useEffect(() => {
    api.likedMe()
      .then(setLikers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (activeTab === 'sent') {
      setLoadingSent(true)
      api.iLiked()
        .then(setSentLikes)
        .catch(() => setSentLikes([]))
        .finally(() => setLoadingSent(false))
    }
  }, [activeTab])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2400)
  }

  function setTier(t) {
    setTierState(t)
    localStorage.setItem('nh_tier', t)
  }

  async function handleLike(item) {
    setLikers(prev => prev.filter(l => l.user_id !== item.user_id))
    try {
      const res = await api.like(item.user_id)
      if (res.matched) showToast(`It's a match with ${item.name}! 💕`)
      else showToast(`Liked ${item.name} ♥`)
    } catch {
      setLikers(prev => [...prev, item])
    }
  }

  async function handlePass(item) {
    setLikers(prev => prev.filter(l => l.user_id !== item.user_id))
    try { await api.pass(item.user_id) }
    catch { setLikers(prev => [...prev, item]) }
  }

  // ── Tab bar ──────────────────────────────────────────────
  const TabBar = (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 24, background: '#fff' }}>
      {[
        { id: 'liked-me', label: `Liked Me${likers.length > 0 ? ` (${likers.length})` : ''}` },
        { id: 'sent',     label: `Likes Sent${sentLikes.length > 0 ? ` (${sentLikes.length})` : ''}` },
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            flex: 1, padding: '12px 0', fontWeight: 600, fontSize: 14,
            background: 'none', border: 'none', cursor: 'pointer',
            color: activeTab === tab.id ? 'var(--primary-600)' : 'var(--fg-3)',
            borderBottom: activeTab === tab.id ? '2.5px solid var(--primary-600)' : '2.5px solid transparent',
            marginBottom: -1, transition: 'color 120ms',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )

  // ── "Liked Me" tab ───────────────────────────────────────
  if (activeTab === 'liked-me') {
    if (loading) return (
      <div><Nav /><div className="app-main">{TabBar}<div style={{ textAlign: 'center', paddingTop: 40, color: 'var(--fg-3)' }}>Loading…</div></div></div>
    )

    return (
      <div>
        <Nav />
        <div className="app-main">
          {TabBar}

          {/* Tier status banner */}
          {canSeeLikes ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
              <span style={{ fontSize: 18 }}>{TIER_META[tier]?.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#15803D' }}>
                {TIER_META[tier]?.label} active — all profiles visible
              </span>
            </div>
          ) : (
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: 18, marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 24 }}>🔒</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg-1)', marginBottom: 4 }}>Upgrade to see who liked you</div>
                  <div style={{ fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.5 }}>Platinum and Diamond members can see all profiles that liked them.</div>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {likers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>💛</div>
              <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--fg-1)', marginBottom: 8 }}>No likes yet</div>
              <div style={{ color: 'var(--fg-3)' }}>Keep swiping to get noticed!</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
              {likers.map(person => {
                const isSuperLike = person.their_action === 'super_like'
                return (
                  <div
                    key={person.user_id}
                    onClick={() => canSeeLikes ? navigate(`/users/${person.user_id}?fromLikedMe=true`) : showToast('Upgrade to Platinum or Diamond to see who liked you')}
                    style={{ borderRadius: 16, overflow: 'hidden', cursor: 'pointer', position: 'relative', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', aspectRatio: '0.72', background: '#fff' }}
                  >
                    {/* Avatar background */}
                    <div style={{ position: 'absolute', inset: 0, background: avatarGradient(person.avatar_seed), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, fontWeight: 800, color: '#fff', filter: canSeeLikes ? 'none' : 'blur(8px)', transform: 'scale(1.05)' }}>
                      {canSeeLikes ? (person.name || '?')[0] : '?'}
                    </div>

                    {!canSeeLikes && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 4px 14px rgba(0,0,0,0.14)' }}>🔒</div>
                      </div>
                    )}

                    {isSuperLike && (
                      <div style={{ position: 'absolute', top: 8, right: 8, background: '#F59E0B', borderRadius: 99, paddingInline: 8, paddingBlock: 3, fontSize: 10, fontWeight: 700, color: '#fff', zIndex: 3 }}>⭐ Super</div>
                    )}

                    {/* Bottom info + actions */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, zIndex: 3 }}>
                      {canSeeLikes ? (
                        <>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.5)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {person.name}{person.age ? `, ${person.age}` : ''}
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={e => { e.stopPropagation(); handlePass(person) }}
                              style={{ flex: 1, height: 32, borderRadius: 16, background: 'rgba(0,0,0,0.45)', border: 'none', color: '#EF4444', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
                            >✕</button>
                            <button
                              onClick={e => { e.stopPropagation(); handleLike(person) }}
                              style={{ flex: 1, height: 32, borderRadius: 16, background: 'var(--primary-600)', border: 'none', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
                            >♥</button>
                          </div>
                        </>
                      ) : (
                        <div style={{ height: 12, background: 'rgba(255,255,255,0.5)', borderRadius: 6 }} />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Dev tier selector */}
          <div style={{ marginTop: 40, background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Dev — Select Tier</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TIERS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTier(t.id)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                    border: tier === t.id ? `2px solid ${TIER_META[t.id]?.color}` : '1.5px solid var(--border)',
                    background: tier === t.id ? `${TIER_META[t.id]?.color}18` : '#fff',
                    color: 'var(--fg-1)', fontFamily: 'inherit',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: tier === t.id ? TIER_META[t.id]?.color : 'var(--fg-1)' }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{t.features}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: tier === t.id ? TIER_META[t.id]?.color : 'var(--fg-3)' }}>{t.price}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className={`toast${toast ? ' show' : ''}`}>{toast}</div>
      </div>
    )
  }

  // ── "Likes Sent" tab ─────────────────────────────────────
  return (
    <div>
      <Nav />
      <div className="app-main">
        {TabBar}

        {loadingSent ? (
          <div style={{ textAlign: 'center', paddingTop: 40, color: 'var(--fg-3)' }}>Loading…</div>
        ) : sentLikes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>💌</div>
            <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--fg-1)', marginBottom: 8 }}>No sent likes yet</div>
            <div style={{ color: 'var(--fg-3)' }}>Start swiping to see your likes here.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
            {sentLikes.map(person => (
              <div
                key={person.user_id}
                onClick={() => navigate(`/users/${person.user_id}`)}
                style={{ borderRadius: 16, overflow: 'hidden', cursor: 'pointer', position: 'relative', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', aspectRatio: '0.72', background: '#fff' }}
              >
                <div style={{ position: 'absolute', inset: 0, background: avatarGradient(person.avatar_seed), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, fontWeight: 800, color: '#fff' }}>
                  {(person.name || '?')[0]}
                </div>

                {!!person.matched && (
                  <div style={{ position: 'absolute', top: 8, right: 8, background: 'var(--primary-600)', borderRadius: 99, paddingInline: 8, paddingBlock: 3, fontSize: 10, fontWeight: 700, color: '#fff', zIndex: 2 }}>💕 Matched</div>
                )}

                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, zIndex: 2 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {person.name}{person.age ? `, ${person.age}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={`toast${toast ? ' show' : ''}`}>{toast}</div>
    </div>
  )
}
