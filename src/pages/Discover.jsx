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

  // Daily swipe limit
  const DAILY_LIMIT = 10
  const UNDO_LIMIT  = 3
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
    if (dailyCount >= DAILY_LIMIT) return

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
    if (undoCount >= UNDO_LIMIT) {
      showToast(`⚡ Upgrade to Premium for unlimited undos`)
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
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div className="eyebrow">Discover</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, color: 'var(--fg-1)', margin: '8px 0 0' }}>
            Nearby &amp; verified
          </h1>
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
          ) : dailyCount >= DAILY_LIMIT ? (
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

        {!loading && remaining > 0 && dailyCount < DAILY_LIMIT && (
          <div className="deck-actions">
            <span className={`undo${undoCount >= UNDO_LIMIT ? ' disabled' : ''}`} onClick={undo} title={undoCount >= UNDO_LIMIT ? `${UNDO_LIMIT} undos used today` : 'Undo'}>↺</span>
            <span className={`pass${dailyCount >= DAILY_LIMIT ? ' disabled' : ''}`} onClick={() => swipe('pass')}>✕</span>
            <span className={`super-like${dailyCount >= DAILY_LIMIT ? ' disabled' : ''}`} onClick={() => swipe('super_like')} title="Super Like" style={{ fontSize: 22, cursor: 'pointer', opacity: dailyCount >= DAILY_LIMIT ? 0.4 : 1, transition: 'transform 0.15s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: '50%', border: '2px solid #F59E0B', background: '#fff', userSelect: 'none' }}>⭐</span>
            <span className={`like${dailyCount >= DAILY_LIMIT ? ' disabled' : ''}`} onClick={() => swipe('like')}>♥</span>
          </div>
        )}

      </div>

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
