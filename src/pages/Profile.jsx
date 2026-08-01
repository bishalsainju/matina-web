import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api.js'

const INTENTS = [
  { id: 'friendship', icon: '🤝', label: 'Friendship', desc: 'Make Nepali friends nearby' },
  { id: 'dating',     icon: '💕', label: 'Dating',     desc: 'Meet someone special' },
  { id: 'marriage',   icon: '💍', label: 'Marriage',   desc: 'Find a life partner' },
]

const GENDERS       = ['Man', 'Woman', 'Non-binary', 'Other']
const INTERESTED_IN = ['Men', 'Women', 'Non-binary people', 'Everyone']
const SHOW_ME       = ['Everyone', 'Men', 'Women']

const HEIGHTS = [
  "Under 5'0\"", "5'0\"", "5'1\"", "5'2\"", "5'3\"", "5'4\"", "5'5\"",
  "5'6\"", "5'7\"", "5'8\"", "5'9\"", "5'10\"", "5'11\"", "6'0\"", "Over 6'0\"",
]

const COUNTRIES = [
  { code: 'USA',          flag: '🇺🇸' }, { code: 'Canada',       flag: '🇨🇦' },
  { code: 'Australia',    flag: '🇦🇺' }, { code: 'UK',           flag: '🇬🇧' },
  { code: 'UAE',          flag: '🇦🇪' }, { code: 'Qatar',        flag: '🇶🇦' },
  { code: 'Saudi Arabia', flag: '🇸🇦' }, { code: 'Malaysia',     flag: '🇲🇾' },
  { code: 'Singapore',    flag: '🇸🇬' }, { code: 'Japan',        flag: '🇯🇵' },
  { code: 'South Korea',  flag: '🇰🇷' }, { code: 'Norway',       flag: '🇳🇴' },
  { code: 'Germany',      flag: '🇩🇪' }, { code: 'Ireland',      flag: '🇮🇪' },
  { code: 'France',       flag: '🇫🇷' }, { code: 'Other',        flag: '🌍' },
]

const NEPAL_HOMETOWNS = [
  'Kathmandu', 'Pokhara', 'Lalitpur (Patan)', 'Bhaktapur', 'Biratnagar',
  'Chitwan', 'Butwal', 'Dharan', 'Hetauda', 'Janakpur', 'Nepalgunj',
  'Birgunj', 'Dhangadhi', 'Tulsipur', 'Outside Nepal',
]

const RELIGIONS  = ['Hindu', 'Buddhist', 'Kirat', 'Christian', 'Muslim', 'Secular', 'Prefer not to say']
const EDUCATIONS = ["High School", "Some College", "Bachelor's", "Master's", "PhD", "Trade / Vocational", "Other"]
const DRINKING   = ['Never', 'Socially', 'Regularly']
const SMOKING    = ['Never', 'Occasionally', 'Regularly']
const DIETS      = ['Vegetarian', 'Vegan', 'Non-vegetarian', 'Halal', 'No preference']
const LANGUAGES  = ['Nepali', 'Hindi', 'English', 'Maithili', 'Bhojpuri', 'Newari', 'Tamang', 'Gurung', 'Rai', 'Limbu']

const INTERESTS = [
  'Hiking & Trekking', 'Yoga & Meditation', 'Nepali Cuisine', 'Traditional Music',
  'Photography', 'Travel', 'Fitness', 'Reading', 'Movies', 'Gaming',
  'Cooking', 'Art & Crafts', 'Dancing', 'Sports', 'Festivals & Culture',
  'Volunteering', 'Entrepreneurship', 'Tech & Science', 'Fashion',
  'Spirituality', 'Pets', 'Gardening', 'Writing', 'Podcasts', 'Poetry',
]

const BIO_MAX = 500

function avatarGradient(seed) {
  const h = parseInt(seed) || 30
  return `linear-gradient(135deg, hsl(${h},80%,75%), hsl(${(h+40)%360},70%,55%))`
}

function parseIntentArray(raw) {
  if (Array.isArray(raw)) return raw
  if (!raw) return []
  try {
    const p = JSON.parse(raw)
    return Array.isArray(p) ? p : [p].filter(Boolean)
  } catch {
    return raw ? [raw] : []
  }
}

export default function Profile() {
  const { user, logout, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [saveError, setSaveError] = useState('')
  const [form, setForm]           = useState(null)
  const [stats, setStats]         = useState({ matches: 0, liked_you: 0, passed: 0, liked: 0 })

  const DAILY_LIMIT = 10
  const [dailyCount, setDailyCount] = useState(() => {
    try {
      const d = JSON.parse(localStorage.getItem('nh_daily') || '{}')
      return d.date === new Date().toDateString() ? (d.count || 0) : 0
    } catch { return 0 }
  })

  function resetSwipes() {
    localStorage.removeItem('nh_daily')
    setDailyCount(0)
  }

  const loadStats = useCallback(async () => {
    try { setStats(await api.stats()) } catch {}
  }, [])

  useEffect(() => { loadStats() }, [loadStats])

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function toggleArr(key, val) {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val],
    }))
  }

  function startEdit() {
    setForm({
      name:              user.name              || '',
      age:               user.age               || '',
      gender:            user.gender            || '',
      intents:           parseIntentArray(user.intent),
      interested_in:     user.interested_in     || 'Everyone',
      country:           user.country           || '',
      state:             user.state             || '',
      city:              user.city              || '',
      bio:               user.bio               || '',
      height:            user.height            || '',
      hometown:          user.hometown          || '',
      religion:          user.religion          || '',
      community:         user.community         || '',
      occupation:        user.occupation        || '',
      education:         user.education         || '',
      drinking:          user.drinking          || '',
      smoking:           user.smoking           || '',
      diet:              user.diet              || '',
      languages:         user.languages         || [],
      interests:         user.interests         || [],
      show_me:           user.show_me           || 'Everyone',
      preferred_age_min: user.preferred_age_min || 18,
      preferred_age_max: user.preferred_age_max || 60,
    })
    setEditing(true)
    setSaveError('')
  }

  function cancelEdit() { setEditing(false); setSaveError('') }

  async function saveEdit() {
    if (!form.name?.trim())                  { setSaveError('Name is required'); return }
    if (!form.age || parseInt(form.age) < 18) { setSaveError('Age must be 18 or older'); return }
    if (form.bio && form.bio.length < 10)    { setSaveError('Bio must be at least 10 characters'); return }
    setSaving(true)
    setSaveError('')
    try {
      await api.updateProfile({
        ...form,
        intent: form.intents,
        age:    parseInt(form.age),
        preferred_age_min: parseInt(form.preferred_age_min),
        preferred_age_max: parseInt(form.preferred_age_max),
      })
      await refreshUser()
      setEditing(false)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function handleLogout() { logout(); navigate('/') }

  if (!user) return null

  const avatarBg    = avatarGradient(user.avatar_seed)
  const userIntents = parseIntentArray(user.intent)
  const locationStr = [user.city, user.state, user.country].filter(Boolean).join(', ')

  // ── Edit form ────────────────────────────────────────────────────
  if (editing && form) {
    const bioLen = form.bio.length
    return (
      <div>
        <Nav />
        <div className="app-main">

          {/* Header */}
          <div className="ep-header">
            <button className="btn btn-secondary ep-back" onClick={cancelEdit}>← Back to profile</button>
            <div>
              <h1 className="ep-title">Edit Connect profile</h1>
              <p className="ep-subtitle">Changes are saved immediately when you click Save.</p>
            </div>
          </div>

          {saveError && <div className="alert-error">{saveError}</div>}

          {/* ── What are you looking for? ── */}
          <div className="ep-section">
            <div className="ep-section-title">What are you looking for?</div>
            <div className="ep-section-sub">Select all that apply</div>
            <div className="ep-intent-cards">
              {INTENTS.map(it => (
                <button
                  key={it.id}
                  type="button"
                  className={`ep-intent-card${form.intents.includes(it.id) ? ' active' : ''}`}
                  onClick={() => toggleArr('intents', it.id)}
                >
                  <div className="ep-intent-icon">{it.icon}</div>
                  <div className="ep-intent-label">{it.label}</div>
                  <div className="ep-intent-desc">{it.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* ── About you ── */}
          <div className="ep-section">
            <div className="ep-section-title">About you</div>
            <div className="field">
              <label>I am a…</label>
              <div className="chip-group">
                {GENDERS.map(g => (
                  <button key={g} type="button"
                    className={`chip-btn${form.gender === g ? ' active' : ''}`}
                    onClick={() => set('gender', g)}>{g}</button>
                ))}
              </div>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>I'm interested in…</label>
              <div className="chip-group">
                {INTERESTED_IN.map(opt => (
                  <button key={opt} type="button"
                    className={`chip-btn${form.interested_in === opt ? ' active' : ''}`}
                    onClick={() => set('interested_in', opt)}>{opt}</button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Age & Height ── */}
          <div className="ep-section">
            <div className="ep-section-title">Age &amp; height</div>
            <div className="field-row">
              <div className="field">
                <label>Age <span style={{ color: '#EF4444' }}>*</span></label>
                <input
                  type="number" min="18" max="99"
                  value={form.age}
                  onChange={e => set('age', e.target.value)}
                />
              </div>
              <div className="field">
                <label>Height <span style={{ color: 'var(--fg-4)', fontWeight: 400 }}>(optional)</span></label>
                <select value={form.height} onChange={e => set('height', e.target.value)}>
                  <option value="">Select…</option>
                  {HEIGHTS.map(h => <option key={h}>{h}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── Your story ── */}
          <div className="ep-section">
            <div className="ep-section-title">Your story</div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>
                <span>Bio</span>
                <span className="bio-counter" style={{ color: bioLen > BIO_MAX * 0.9 ? '#EF4444' : 'var(--fg-4)' }}>
                  {bioLen} / {BIO_MAX}
                </span>
              </label>
              <textarea
                rows="5"
                value={form.bio}
                onChange={e => { if (e.target.value.length <= BIO_MAX) set('bio', e.target.value) }}
                placeholder="Tell people about yourself… (min 10 characters)"
              />
              {form.bio.length > 0 && form.bio.length < 10 && (
                <div className="field-msg">At least 10 characters needed</div>
              )}
            </div>
          </div>

          {/* ── Where do you live? ── */}
          <div className="ep-section">
            <div className="ep-section-title">Where do you live?</div>
            <div className="field">
              <label>Country</label>
              <select value={form.country} onChange={e => set('country', e.target.value)}>
                <option value="">Select country…</option>
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>State / Province</label>
              <input
                type="text"
                value={form.state}
                onChange={e => set('state', e.target.value)}
                placeholder="e.g. Texas"
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>City</label>
              <input
                type="text"
                value={form.city}
                onChange={e => set('city', e.target.value)}
                placeholder="e.g. Dallas"
              />
            </div>
          </div>

          {/* ── Your roots ── */}
          <div className="ep-section">
            <div className="ep-section-title">Your roots</div>
            <div className="field">
              <label>🇳🇵 Hometown in Nepal</label>
              <select value={form.hometown} onChange={e => set('hometown', e.target.value)}>
                <option value="">Select hometown…</option>
                {NEPAL_HOMETOWNS.map(h => <option key={h}>{h}</option>)}
              </select>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Religion</label>
              <div className="chip-group">
                {RELIGIONS.map(r => (
                  <button key={r} type="button"
                    className={`chip-btn${form.religion === r ? ' active' : ''}`}
                    onClick={() => set('religion', form.religion === r ? '' : r)}>{r}</button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Community ── */}
          <div className="ep-section">
            <div className="ep-section-title">
              Community / Caste{' '}
              <span style={{ fontWeight: 400, fontSize: 13, color: 'var(--fg-4)' }}>(optional)</span>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <input
                type="text"
                value={form.community}
                onChange={e => set('community', e.target.value)}
                placeholder="e.g. Newar, Gurung, Brahmin…"
              />
            </div>
          </div>

          {/* ── Lifestyle ── */}
          <div className="ep-section">
            <div className="ep-section-title">Lifestyle</div>

            <div className="field">
              <label>Occupation <span style={{ color: 'var(--fg-4)', fontWeight: 400 }}>(optional)</span></label>
              <input
                type="text"
                value={form.occupation}
                onChange={e => set('occupation', e.target.value)}
                placeholder="e.g. Software Engineer"
              />
            </div>

            <div className="field">
              <label>Education</label>
              <select value={form.education} onChange={e => set('education', e.target.value)}>
                <option value="">Select…</option>
                {EDUCATIONS.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>

            <div className="field">
              <label>Drinking</label>
              <div className="chip-group">
                {DRINKING.map(d => (
                  <button key={d} type="button"
                    className={`chip-btn${form.drinking === d ? ' active' : ''}`}
                    onClick={() => set('drinking', form.drinking === d ? '' : d)}>{d}</button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Smoking</label>
              <div className="chip-group">
                {SMOKING.map(s => (
                  <button key={s} type="button"
                    className={`chip-btn${form.smoking === s ? ' active' : ''}`}
                    onClick={() => set('smoking', form.smoking === s ? '' : s)}>{s}</button>
                ))}
              </div>
            </div>

            <div className="field" style={{ marginBottom: 0 }}>
              <label>Diet</label>
              <div className="chip-group">
                {DIETS.map(d => (
                  <button key={d} type="button"
                    className={`chip-btn${form.diet === d ? ' active' : ''}`}
                    onClick={() => set('diet', form.diet === d ? '' : d)}>{d}</button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Languages ── */}
          <div className="ep-section">
            <div className="ep-section-title">Languages spoken</div>
            <div className="interest-grid">
              {LANGUAGES.map(l => (
                <button key={l} type="button"
                  className={`interest-tag${form.languages.includes(l) ? ' active' : ''}`}
                  onClick={() => toggleArr('languages', l)}>
                  {form.languages.includes(l) && <span className="tag-check">✓</span>}
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* ── Interests ── */}
          <div className="ep-section">
            <div className="ep-section-title">Interests</div>
            <div className="interest-grid">
              {INTERESTS.map(i => (
                <button key={i} type="button"
                  className={`interest-tag${form.interests.includes(i) ? ' active' : ''}`}
                  onClick={() => toggleArr('interests', i)}>
                  {form.interests.includes(i) && <span className="tag-check">✓</span>}
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* ── Who do you want to meet? ── */}
          <div className="ep-section">
            <div className="ep-section-title">Who do you want to meet?</div>

            <div className="field">
              <label>Show me</label>
              <div className="chip-group">
                {SHOW_ME.map(opt => (
                  <button key={opt} type="button"
                    className={`chip-btn${form.show_me === opt ? ' active' : ''}`}
                    onClick={() => set('show_me', opt)}>{opt}</button>
                ))}
              </div>
            </div>

            <div className="field" style={{ marginBottom: 0 }}>
              <label>Age range: {form.preferred_age_min}–{form.preferred_age_max}</label>
              <div className="ep-age-range">
                <div className="ep-age-field">
                  <span className="ep-age-label">Min</span>
                  <input
                    type="number" min="18" max="80"
                    value={form.preferred_age_min}
                    onChange={e => set('preferred_age_min', Math.min(+e.target.value, form.preferred_age_max))}
                  />
                </div>
                <div className="ep-age-field">
                  <span className="ep-age-label">Max</span>
                  <input
                    type="number" min="18" max="80"
                    value={form.preferred_age_max}
                    onChange={e => set('preferred_age_max', Math.max(+e.target.value, form.preferred_age_min))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="step-actions" style={{ marginTop: 32, paddingBottom: 24 }}>
            <button className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
            <button className="btn btn-primary" onClick={saveEdit} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>

        </div>
      </div>
    )
  }

  // ── View mode ────────────────────────────────────────────────────
  return (
    <div>
      <Nav />
      <div className="profile-layout">
      <div className="profile-col">

        <div className="profile-card">
          <div className="av" style={{ background: avatarBg }}>
            {user.is_verified ? <div className="check">✓</div> : null}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--fg-1)', marginTop: 4 }}>
            {user.name}{user.age ? `, ${user.age}` : ''}
          </div>
          {locationStr && (
            <div style={{ fontSize: 15, color: 'var(--fg-3)', marginTop: 4 }}>📍 {locationStr}</div>
          )}
          {userIntents.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              {userIntents.map(id => {
                const it = INTENTS.find(x => x.id === id)
                return it ? (
                  <span key={id} style={{ fontSize: 13, color: 'var(--fg-3)' }}>
                    {it.icon} {it.label}
                  </span>
                ) : null
              })}
            </div>
          )}
          <div className="badge-pill" style={{ margin: '14px auto 0' }}>
            <span style={{ color: user.is_verified ? 'var(--emerald-500)' : 'var(--fg-4)', fontWeight: 800 }}>
              {user.is_verified ? '✓' : '○'}
            </span>
            {user.is_verified ? 'Verified member' : 'Verification pending'}
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: 20, width: '100%' }}
            onClick={startEdit}
          >
            ✎ Edit profile
          </button>
        </div>

        {user.bio && (
          <div style={{ marginTop: 28, padding: '20px 0', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)', marginBottom: 8 }}>About</div>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.65 }}>{user.bio}</p>
          </div>
        )}

        {user.interests?.length > 0 && (
          <div style={{ marginTop: 20, padding: '20px 0', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)', marginBottom: 12 }}>Interests</div>
            <div className="interest-grid">
              {user.interests.map(i => (
                <div key={i} className="interest-tag active" style={{ cursor: 'default' }}>
                  <span className="tag-check">✓</span>{i}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Details ── */}
        {[user.gender, user.occupation, user.education, user.height, user.hometown, user.religion, user.community, user.drinking, user.smoking, user.diet].some(Boolean) && (
          <div style={{ marginTop: 20, padding: '20px 0', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)', marginBottom: 14 }}>Details</div>
            <div className="profile-details-list">
              {user.gender      && <div className="profile-detail-item">🪪 <span>{user.gender}</span></div>}
              {user.occupation  && <div className="profile-detail-item">💼 <span>{user.occupation}</span></div>}
              {user.education   && <div className="profile-detail-item">🎓 <span>{user.education}</span></div>}
              {user.height      && <div className="profile-detail-item">📏 <span>{user.height}</span></div>}
              {user.hometown    && <div className="profile-detail-item">🏠 <span>{user.hometown}</span></div>}
              {user.religion    && <div className="profile-detail-item">🕉 <span>{user.religion}</span></div>}
              {user.community   && <div className="profile-detail-item">👥 <span>{user.community}</span></div>}
              {user.drinking    && <div className="profile-detail-item">🍺 <span>Drinks {user.drinking.toLowerCase()}</span></div>}
              {user.smoking     && <div className="profile-detail-item">🚬 <span>Smokes {user.smoking.toLowerCase()}</span></div>}
              {user.diet        && <div className="profile-detail-item">🥗 <span>{user.diet}</span></div>}
            </div>
          </div>
        )}

        {/* ── Languages ── */}
        {user.languages?.length > 0 && (
          <div style={{ marginTop: 20, padding: '20px 0', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)', marginBottom: 12 }}>Languages</div>
            <div className="profile-details-list">
              {user.languages.map(l => (
                <div key={l} className="profile-detail-item">🗣 <span>{l}</span></div>
              ))}
            </div>
          </div>
        )}

        {/* ── Looking for ── */}
        {(user.interested_in || user.show_me || user.preferred_age_min || user.preferred_age_max) && (
          <div style={{ marginTop: 20, padding: '20px 0', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)', marginBottom: 8 }}>Looking for</div>
            <div className="settings-row">
              <span style={{ color: 'var(--fg-3)' }}>Interested in</span>
              <span style={{ fontWeight: 600, color: 'var(--fg-2)' }}>{user.interested_in || '—'}</span>
            </div>
            <div className="settings-row">
              <span style={{ color: 'var(--fg-3)' }}>Show me</span>
              <span style={{ fontWeight: 600, color: 'var(--fg-2)' }}>{user.show_me || '—'}</span>
            </div>
            {(user.preferred_age_min || user.preferred_age_max) && (
              <div className="settings-row">
                <span style={{ color: 'var(--fg-3)' }}>Age range</span>
                <span style={{ fontWeight: 600, color: 'var(--fg-2)' }}>
                  {user.preferred_age_min || 18}–{user.preferred_age_max || 60}
                </span>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--fg-1)', margin: '0 0 8px' }}>Account</h2>
          <div className="settings-row">
            <span>Email</span>
            <span style={{ color: 'var(--fg-3)', fontSize: 14 }}>{user.email}</span>
          </div>
          <div className="settings-row">
            <span>Member since</span>
            <span style={{ color: 'var(--fg-3)', fontSize: 14 }}>
              {new Date((user.created_at || 0) * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div style={{ marginTop: 28 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--fg-1)', margin: '0 0 8px' }}>Trust &amp; safety</h2>
          <div className="settings-row">
            <span>Verification status</span>
            <span style={{ color: user.is_verified ? 'var(--emerald-500)' : 'var(--fg-3)', fontWeight: 600 }}>
              {user.is_verified ? 'Verified ✓' : 'Pending'}
            </span>
          </div>
          <div className="settings-row" style={{ cursor: 'pointer' }}>
            <span>Report a problem</span>
            <span style={{ color: 'var(--fg-3)' }}>›</span>
          </div>
        </div>

        <div style={{ marginTop: 40 }}>
          <button className="btn btn-secondary btn-block" onClick={handleLogout}>Sign out</button>
        </div>

      </div>{/* end left col */}

      {/* ── Right column ── */}
      <div className="profile-col profile-right-col">

        {/* Daily Swipes */}
        <div className="ds-panel">
          <div className="ds-panel-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Daily Swipes</span>
            {dailyCount > 0 && (
              <button onClick={resetSwipes} style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--fg-4)', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
                Reset
              </button>
            )}
          </div>
          <div className="ds-swipe-row">
            <span><strong>{dailyCount}</strong> / {DAILY_LIMIT}</span>
            <span className="ds-left">{Math.max(DAILY_LIMIT - dailyCount, 0)} left</span>
          </div>
          <div className="ds-bar-track">
            <div className="ds-bar-fill" style={{ width: `${Math.min((dailyCount / DAILY_LIMIT) * 100, 100)}%` }} />
          </div>
          <button className="btn ds-upgrade-btn">⚡ Upgrade for unlimited</button>
        </div>

        {/* Your Matches */}
        <div className="ds-panel">
          <div className="ds-panel-title">Your Matches</div>
          <div className="ds-stats-grid">
            <div className="ds-stat" style={{ background: '#FDF2F8' }}>
              <div className="ds-stat-num" style={{ color: '#BE185D' }}>{stats.matches}</div>
              <div className="ds-stat-label" style={{ color: '#BE185D' }}>Matches</div>
            </div>
            <div className="ds-stat" style={{ background: '#FFF7ED' }}>
              <div className="ds-stat-num" style={{ color: '#EA580C' }}>{stats.liked_you}</div>
              <div className="ds-stat-label" style={{ color: '#EA580C' }}>Liked you</div>
            </div>
            <div className="ds-stat" style={{ background: '#FEF2F2' }}>
              <div className="ds-stat-num" style={{ color: '#DC2626' }}>{stats.passed}</div>
              <div className="ds-stat-label" style={{ color: '#DC2626' }}>Passed</div>
            </div>
            <div className="ds-stat" style={{ background: '#F0FDF4' }}>
              <div className="ds-stat-num" style={{ color: '#16A34A' }}>{stats.liked}</div>
              <div className="ds-stat-label" style={{ color: '#16A34A' }}>Liked</div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="ds-panel">
          <div className="ds-panel-title">Tips</div>
          <ul className="ds-tips-list">
            <li>Use the location scope on Discover to filter by city or country</li>
            <li>← → arrow keys to pass / like while swiping</li>
            <li>Tap the left or right side of a card photo to browse more photos</li>
            <li>Edit your profile to control who you see in Discover</li>
            <li>Hit ↺ undo on Discover to take back your last swipe</li>
          </ul>
        </div>

      </div>{/* end right col */}

      </div>{/* end profile-layout */}
    </div>
  )
}
