import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api.js'

function avatarGradient(seed) {
  const h = parseInt(seed) || 30
  return `linear-gradient(135deg, hsl(${h},80%,75%), hsl(${(h+40)%360},70%,55%))`
}

function cardPhotos(seed) {
  const h = parseInt(seed) || 30
  return [
    `linear-gradient(135deg, hsl(${h},80%,75%) 0%, hsl(${(h+40)%360},70%,55%) 100%)`,
    `linear-gradient(160deg, hsl(${(h+120)%360},75%,72%) 0%, hsl(${(h+160)%360},65%,52%) 100%)`,
    `linear-gradient(115deg, hsl(${(h+230)%360},70%,78%) 0%, hsl(${(h+270)%360},60%,58%) 100%)`,
  ]
}

export default function Discover() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [profiles, setProfiles]       = useState([])
  const [idx, setIdx]                 = useState(0)
  const [history, setHistory]         = useState([])
  const [locationScope, setLocationScope] = useState('everywhere')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filterCity,    setFilterCity]    = useState('')
  const [filterState,   setFilterState]   = useState('')
  const [filterCountry, setFilterCountry] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [exitAnim, setExitAnim]       = useState(null)
  const [toast, setToast]             = useState('')
  const [match, setMatch]             = useState(null)
  const [loading, setLoading]         = useState(true)

  // Drag state
  const [dragX, setDragX]       = useState(0)
  const [dragging, setDragging] = useState(false)
  const startXRef  = useRef(0)
  const draggedRef = useRef(false)

  // Photo carousel
  const [photoIdx, setPhotoIdx] = useState(0)

  // Tier system
  const [tier, setTierState] = useState(() => localStorage.getItem('nh_tier') || 'free')
  const TIER_LIMITS = { free: 10, gold: 50, platinum: 150, diamond: Infinity }
  const DAILY_LIMIT  = TIER_LIMITS[tier] ?? 10
  const canUndo      = ['gold', 'platinum', 'diamond'].includes(tier)
  const canSuperLike = ['platinum', 'diamond'].includes(tier)

  const [showLikesInfo, setShowLikesInfo] = useState(false)

  const [dailyCount, setDailyCount] = useState(() => {
    try {
      const d = JSON.parse(localStorage.getItem('nh_daily') || '{}')
      return d.date === new Date().toDateString() ? (d.count || 0) : 0
    } catch { return 0 }
  })
  const [undoCount, setUndoCount] = useState(() => {
    try {
      const d = JSON.parse(localStorage.getItem('nh_undo_daily') || '{}')
      return d.date === new Date().toDateString() ? (d.count || 0) : 0
    } catch { return 0 }
  })

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200) }

  const load = useCallback(async (filters = {}) => {
    setLoading(true)
    try {
      const data = await api.discover(filters)
      setProfiles(data)
      setIdx(0)
      setPhotoIdx(0)
      setHistory([])
    } catch {
      showToast('Could not load profiles — is the server running?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load({ location_scope: locationScope }) }, [load])

  const applyFilters = () => {
    const params = { verified_only: verifiedOnly, location_scope: locationScope }
    if (filterCity.trim())    params.filter_city    = filterCity.trim()
    if (filterState.trim())   params.filter_state   = filterState.trim()
    if (filterCountry.trim()) params.filter_country = filterCountry.trim()
    load(params)
    setFiltersOpen(false)
  }

  const resetFilters = () => {
    setFilterCity(''); setFilterState(''); setFilterCountry(''); setVerifiedOnly(false)
  }

  const changeScope = (scope) => {
    setLocationScope(scope)
    const params = { verified_only: verifiedOnly, location_scope: scope }
    if (filterCity.trim())    params.filter_city    = filterCity.trim()
    if (filterState.trim())   params.filter_state   = filterState.trim()
    if (filterCountry.trim()) params.filter_country = filterCountry.trim()
    load(params)
  }

  const resetSwipes = () => {
    localStorage.removeItem('nh_daily')
    setDailyCount(0)
  }

  const swipe = useCallback(async (action) => {
    if (idx >= profiles.length || exitAnim) return
    if (DAILY_LIMIT !== Infinity && dailyCount >= DAILY_LIMIT) return
    if (action === 'super_like' && !canSuperLike) {
      showToast('⭐ Super Like requires Platinum or Diamond')
      return
    }

    const p = profiles[idx]
    setExitAnim(action)
    setHistory(h => [...h, idx])
    setDragX(0)
    setDragging(false)

    const newCount = dailyCount + 1
    setDailyCount(newCount)
    localStorage.setItem('nh_daily', JSON.stringify({ date: new Date().toDateString(), count: newCount }))

    try {
      const { matched } = await api.swipe(p.user_id, action)
      setTimeout(() => {
        setIdx(i => i + 1)
        setPhotoIdx(0)
        setExitAnim(null)
        if (matched) setMatch(p)
      }, 300)
    } catch {
      setTimeout(() => { setIdx(i => i + 1); setPhotoIdx(0); setExitAnim(null) }, 300)
    }
  }, [idx, profiles, exitAnim, dailyCount])

  const undo = () => {
    if (!canUndo) {
      showToast('⚡ Upgrade to Gold or higher to unlock undo')
      return
    }
    setHistory(h => {
      if (!h.length) return h
      const newCount = undoCount + 1
      setUndoCount(newCount)
      localStorage.setItem('nh_undo_daily', JSON.stringify({ date: new Date().toDateString(), count: newCount }))
      setPhotoIdx(0)
      const last = h[h.length - 1]
      setIdx(last)
      return h.slice(0, -1)
    })
  }

  // Keyboard shortcuts: ← pass, → like
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowLeft')  swipe('pass')
      if (e.key === 'ArrowRight') swipe('like')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [swipe])

  // Drag handlers (pointer events for mouse + touch)
  function onPointerDown(e) {
    if (exitAnim) return
    startXRef.current = e.clientX
    draggedRef.current = false
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e) {
    if (!dragging || exitAnim) return
    const dx = e.clientX - startXRef.current
    if (Math.abs(dx) > 5) draggedRef.current = true
    setDragX(dx)
  }

  function onPointerUp(e) {
    if (!dragging) return
    const dx = e.clientX - startXRef.current
    setDragging(false)
    setDragX(0)
    if (Math.abs(dx) > 80) swipe(dx > 0 ? 'like' : 'pass')
  }

  // Photo navigation: tap left half → prev, right half → next
  function onPrevPhoto(e) {
    e.stopPropagation()
    if (draggedRef.current) return
    setPhotoIdx(i => Math.max(0, i - 1))
  }

  function onNextPhoto(e) {
    e.stopPropagation()
    if (draggedRef.current) return
    const photos = cardPhotos(profiles[idx]?.avatar_seed)
    setPhotoIdx(i => Math.min(photos.length - 1, i + 1))
  }

  const visible   = profiles.slice(idx, idx + 2)
  const remaining = Math.max(profiles.length - idx, 0)

  return (
    <div>
      <Nav />
      <div className="app-main">
        {/* Header — matches mobile layout */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-600)', fontFamily: 'var(--font-display)' }}>Matina</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setShowLikesInfo(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--fg-3)', padding: '4px 8px' }}
            >
              {DAILY_LIMIT === Infinity ? `${dailyCount}/∞` : `${dailyCount}/${DAILY_LIMIT}`}
            </button>
          </div>
        </div>

        <div className="discover-head">
          <span className="chip">📍 {user?.city || 'Worldwide'}</span>
          <button className={`filter-btn${filtersOpen ? ' active' : ''}`} onClick={() => setFiltersOpen(o => !o)}>
            ⚙ Filters
          </button>
        </div>

        <div className="scope-selector">
          {[
            { id: 'city',       label: 'City' },
            { id: 'state',      label: 'State' },
            { id: 'country',    label: 'Country' },
            { id: 'everywhere', label: 'Everywhere' },
          ].map(s => (
            <button
              key={s.id}
              className={`scope-btn${locationScope === s.id ? ' active' : ''}`}
              onClick={() => changeScope(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        {filtersOpen && (
          <div className="filter-panel open">
            <div className="filter-row">
              <label>City</label>
              <input
                type="text"
                placeholder="e.g. Dallas"
                value={filterCity}
                onChange={e => setFilterCity(e.target.value)}
              />
            </div>
            <div className="filter-row">
              <label>State / Province</label>
              <input
                type="text"
                placeholder="e.g. Texas"
                value={filterState}
                onChange={e => setFilterState(e.target.value)}
              />
            </div>
            <div className="filter-row">
              <label>Country</label>
              <input
                type="text"
                placeholder="e.g. USA"
                value={filterCountry}
                onChange={e => setFilterCountry(e.target.value)}
              />
            </div>
            <div className="filter-toggle">
              <span>Verified members only</span>
              <div className={`switch${verifiedOnly ? ' on' : ''}`} onClick={() => setVerifiedOnly(v => !v)}>
                <div className="knob" />
              </div>
            </div>
            <div className="filter-actions">
              <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={resetFilters}>Reset</button>
              <button className="btn btn-primary"   style={{ flex: 1, justifyContent: 'center' }} onClick={applyFilters}>Apply</button>
            </div>
          </div>
        )}

        <div className="match-count-bar">
          {loading ? 'Loading…' : `${remaining} member${remaining !== 1 ? 's' : ''} to discover`}
        </div>

        <div className="deck-stage-app">
          {loading ? (
            <div className="empty-deck"><div className="icon" style={{ fontSize: 36 }}>⏳</div></div>
          ) : (DAILY_LIMIT !== Infinity && dailyCount >= DAILY_LIMIT) ? (
            <div className="oos-card">
              <div className="oos-icon">⚡</div>
              <h2 className="oos-heading">You're out of free swipes</h2>
              <p className="oos-body">
                Free accounts get <strong>{DAILY_LIMIT} swipes per day</strong>. Come back tomorrow,
                or upgrade for unlimited swipes and messaging.
              </p>
              <button className="oos-upgrade-btn">Upgrade to Premium</button>
              <p className="oos-reset">Free swipes reset daily at midnight UTC</p>
              <button
                onClick={resetSwipes}
                style={{ marginTop: 8, background: 'none', border: 'none', color: 'var(--fg-4)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Reset swipes (dev)
              </button>
            </div>
          ) : remaining === 0 ? (
            <div className="empty-deck">
              <div className="icon">🔍</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--fg-1)' }}>That's everyone for now</div>
              <div style={{ marginTop: 6 }}>Try widening your filters, or check back soon.</div>
            </div>
          ) : (
            [...visible].reverse().map((p, i) => {
              const isTop  = i === visible.length - 1
              const photos = cardPhotos(p.avatar_seed)
              const bg     = isTop ? photos[photoIdx] : photos[0]
              const tags   = p.interests?.slice(0, 3) || []

              let transform
              if (isTop) {
                if (exitAnim === 'like')             transform = 'translateX(150%) rotate(20deg)'
                else if (exitAnim === 'pass')        transform = 'translateX(-150%) rotate(-20deg)'
                else if (exitAnim === 'super_like')  transform = 'translateY(-150%) rotate(10deg)'
                else if (dragging)                   transform = `translateX(${dragX}px) rotate(${dragX * 0.08}deg)`
                else                                 transform = 'none'
              } else {
                transform = 'scale(0.96) translateY(10px)'
              }

              const stampOpacity = isTop && dragging
                ? Math.min(Math.abs(dragX) / 80, 1)
                : 0

              return (
                <div
                  key={p.user_id}
                  className="swipe-card"
                  style={{
                    transform,
                    transition: dragging && isTop
                      ? 'none'
                      : 'transform 300ms var(--ease-out), opacity 300ms var(--ease-out)',
                    opacity: isTop && exitAnim ? 0 : 1,
                    zIndex: isTop ? 2 : 1,
                    cursor: isTop ? (dragging ? 'grabbing' : 'grab') : 'default',
                  }}
                  onPointerDown={isTop ? onPointerDown : undefined}
                  onPointerMove={isTop ? onPointerMove : undefined}
                  onPointerUp={isTop ? onPointerUp : undefined}
                  onPointerCancel={isTop ? onPointerUp : undefined}
                >
                  {/* Like / Nope / Super Like stamps */}
                  {isTop && (
                    <>
                      <div className="swipe-stamp like" style={{ opacity: exitAnim === 'super_like' ? 0 : (dragX > 0 ? stampOpacity : 0) }}>LIKE</div>
                      <div className="swipe-stamp nope" style={{ opacity: dragX < 0 ? stampOpacity : 0 }}>NOPE</div>
                      <div className="swipe-stamp like" style={{ opacity: exitAnim === 'super_like' ? 1 : 0, top: 20, left: '50%', transform: 'translateX(-50%)', borderColor: '#F59E0B', color: '#F59E0B' }}>SUPER LIKE ⭐</div>
                    </>
                  )}

                  <div className="photo" style={{ background: bg }}>
                    {/* Photo indicator dots */}
                    <div className="photo-dots">
                      {photos.map((_, pi) => (
                        <span key={pi} className={pi === (isTop ? photoIdx : 0) ? 'active' : ''} />
                      ))}
                    </div>

                    {/* Photo navigation arrows */}
                    {isTop && photoIdx > 0 && (
                      <button
                        className="photo-arrow prev"
                        onPointerDown={e => e.stopPropagation()}
                        onClick={onPrevPhoto}
                      >❮</button>
                    )}
                    {isTop && photoIdx < photos.length - 1 && (
                      <button
                        className="photo-arrow next"
                        onPointerDown={e => e.stopPropagation()}
                        onClick={onNextPhoto}
                      >❯</button>
                    )}

                    <div className="top-actions">
                      <span className="icon-btn" onClick={() => showToast(`Saved ${p.name}`)} title="Save">🔖</span>
                      <span className="icon-btn" onClick={() => showToast('Reported — our team will review')} title="Report">⚑</span>
                    </div>
                    <div>
                      <div className="name">
                        {p.name}, {p.age}
                        {p.is_verified ? <span className="verified-badge">✓ Verified</span> : null}
                      </div>
                      <div className="loc">📍 {p.city}</div>
                    </div>
                  </div>

                  <div className="info" onPointerDown={e => e.stopPropagation()}>
                    <p>{p.bio || `${p.name} hasn't written a bio yet.`}</p>
                    {/* Detail chips */}
                    {[p.occupation, p.education, p.height, p.hometown, p.religion,
                      p.drinking && `Drinks ${p.drinking.toLowerCase()}`,
                      p.diet].filter(Boolean).length > 0 && (
                      <div className="card-details">
                        {p.occupation && <span>💼 {p.occupation}</span>}
                        {p.education  && <span>🎓 {p.education}</span>}
                        {p.height     && <span>📏 {p.height}</span>}
                        {p.hometown   && <span>🏠 {p.hometown}</span>}
                        {p.religion   && <span>🕉 {p.religion}</span>}
                        {p.drinking   && <span>🍺 {p.drinking}</span>}
                        {p.diet       && <span>🥗 {p.diet}</span>}
                      </div>
                    )}
                    {p.languages?.length > 0 && (
                      <div className="card-details">
                        {p.languages.map(l => <span key={l}>🗣 {l}</span>)}
                      </div>
                    )}
                    {tags.length > 0 && <div className="tags">{tags.map(t => <span key={t}>{t}</span>)}</div>}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {!loading && remaining > 0 && (DAILY_LIMIT === Infinity || dailyCount < DAILY_LIMIT) && (
          <div className="deck-actions">
            <span className={`undo${!canUndo ? ' disabled' : ''}`} onClick={undo} title={canUndo ? 'Undo' : 'Upgrade to Gold to unlock undo'}>↺</span>
            <span className="pass" onClick={() => swipe('pass')}>✕</span>
            <span
              onClick={() => swipe('super_like')}
              title={canSuperLike ? 'Super Like' : 'Upgrade to Platinum for Super Like'}
              style={{
                fontSize: 22, cursor: 'pointer', opacity: canSuperLike ? 1 : 0.4,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 52, height: 52, borderRadius: '50%',
                border: '2px solid #F59E0B', background: '#fff', userSelect: 'none',
              }}
            >⭐</span>
            <span className="like" onClick={() => swipe('like')}>♥</span>
          </div>
        )}

      </div>

      {/* Likes info modal */}
      {showLikesInfo && (() => {
        const TIER_META = { free: { label: 'Free', color: 'var(--fg-3)', icon: '☁️' }, gold: { label: 'Gold', color: '#F59E0B', icon: '🥇' }, platinum: { label: 'Platinum', color: '#8B5CF6', icon: '🔷' }, diamond: { label: 'Diamond', color: '#06B6D4', icon: '💎' } }
        const TIERS_LIST = [
          { id: 'free', label: 'Free', price: 'Free', features: '10 likes/day' },
          { id: 'gold', label: '🥇 Gold', price: '$19.99/mo', features: '50 likes/day · Undo' },
          { id: 'platinum', label: '🔷 Platinum', price: '$29.99/mo', features: '150 likes/day · Super Like' },
          { id: 'diamond', label: '💎 Diamond', price: '$39.99/mo', features: 'Unlimited · All features' },
        ]
        const meta  = TIER_META[tier] || TIER_META.free
        const total = DAILY_LIMIT === Infinity ? null : DAILY_LIMIT
        const pct   = total ? Math.min(dailyCount / total, 1) : 0

        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setShowLikesInfo(false)}>
            <div style={{ background: '#fff', borderRadius: '24px 24px 0 0', padding: 28, width: '100%', maxWidth: 480, maxHeight: '70vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ width: 40, height: 4, borderRadius: 99, background: 'var(--border)', margin: '0 auto 16px' }} />
                <div style={{ fontWeight: 800, fontSize: 18, fontFamily: 'var(--font-display)', color: 'var(--fg-1)' }}>Daily Likes</div>
              </div>

              {/* Tier badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>{meta.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: meta.color }}>{meta.label} Plan</div>
                  <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>{total ? `${total} likes per day` : 'Unlimited likes'}</div>
                </div>
              </div>

              {/* Progress */}
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: 'var(--fg-2)' }}>Used today</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: meta.color }}>{dailyCount}{total ? `/${total}` : ''}</span>
                </div>
                {total ? (
                  <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 10 }}>
                    <div style={{ height: '100%', width: `${pct * 100}%`, background: meta.color, borderRadius: 99 }} />
                  </div>
                ) : (
                  <div style={{ fontSize: 15, fontWeight: 700, color: meta.color, marginBottom: 10 }}>∞ Unlimited</div>
                )}
                <div style={{ fontSize: 11, color: 'var(--fg-4)' }}>Resets at midnight · local time</div>
              </div>

              {/* Dev tier selector */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Dev — Change Tier</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {TIERS_LIST.map(t => (
                    <button key={t.id} onClick={() => { setTierState(t.id); localStorage.setItem('nh_tier', t.id) }} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', border: tier === t.id ? `2px solid ${TIER_META[t.id]?.color}` : '1.5px solid var(--border)', background: tier === t.id ? `${TIER_META[t.id]?.color}18` : '#fff', fontFamily: 'inherit' }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: tier === t.id ? TIER_META[t.id]?.color : 'var(--fg-1)' }}>{t.label}</span>
                      <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>{t.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => { localStorage.removeItem('nh_daily'); setDailyCount(0); setShowLikesInfo(false) }} style={{ width: '100%', background: 'none', border: 'none', color: 'var(--fg-4)', fontSize: 12, cursor: 'pointer', paddingBlock: 8 }}>
                Reset counter (dev)
              </button>
            </div>
          </div>
        )
      })()}

      <div className={`toast${toast ? ' show' : ''}`}>{toast}</div>

      {match && (
        <div className="match-modal show">
          <div className="match-modal-inner">
            <div className="match-avatars">
              <div className="av" style={{ background: avatarGradient(user?.avatar_seed) }} />
              <div className="av" style={{ background: avatarGradient(match.avatar_seed) }} />
            </div>
            <h2>It's a match!</h2>
            <p>You and {match.name} both said yes.</p>
            <div className="actions" style={{ flexDirection: 'column' }}>
              <button
                className="btn btn-primary btn-block"
                onClick={() => navigate(`/chat?id=${match.user_id}&name=${encodeURIComponent(match.name)}`)}
              >
                Send a message
              </button>
              <button className="btn btn-secondary btn-block" onClick={() => setMatch(null)}>
                Keep exploring
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
