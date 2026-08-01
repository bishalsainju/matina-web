import { useState } from 'react'
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

function parseIntentArray(raw) {
  if (Array.isArray(raw)) return raw
  if (!raw) return []
  try {
    const p = JSON.parse(raw)
    return Array.isArray(p) ? p : [p].filter(Boolean)
  } catch { return raw ? [raw] : [] }
}

export default function EditProfile() {
  const { user, refreshUser } = useAuth()
  const navigate              = useNavigate()
  const [saving, setSaving]   = useState(false)
  const [saveError, setSaveError] = useState('')

  const [form, setForm] = useState(() => ({
    name:              user?.name              || '',
    age:               user?.age               || '',
    gender:            user?.gender            || '',
    intents:           parseIntentArray(user?.intent),
    interested_in:     user?.interested_in     || 'Everyone',
    country:           user?.country           || '',
    state:             user?.state             || '',
    city:              user?.city              || '',
    bio:               user?.bio               || '',
    height:            user?.height            || '',
    hometown:          user?.hometown          || '',
    religion:          user?.religion          || '',
    community:         user?.community         || '',
    occupation:        user?.occupation        || '',
    education:         user?.education         || '',
    drinking:          user?.drinking          || '',
    smoking:           user?.smoking           || '',
    diet:              user?.diet              || '',
    languages:         user?.languages         || [],
    interests:         user?.interests         || [],
    show_me:           user?.show_me           || 'Everyone',
    preferred_age_min: user?.preferred_age_min || 18,
    preferred_age_max: user?.preferred_age_max || 60,
  }))

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function toggleArr(key, val) {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val],
    }))
  }

  async function save() {
    if (!form.name?.trim())                   { setSaveError('Name is required'); return }
    if (!form.age || parseInt(form.age) < 18) { setSaveError('Age must be 18 or older'); return }
    if (form.bio && form.bio.length < 10)     { setSaveError('Bio must be at least 10 characters'); return }
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
      navigate('/profile')
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  const bioLen = form.bio.length

  return (
    <div>
      <Nav />
      <div className="app-main">

        <div className="ep-header">
          <button className="btn btn-secondary ep-back" onClick={() => navigate('/profile')}>← Back to profile</button>
          <div>
            <h1 className="ep-title">Edit Profile</h1>
            <p className="ep-subtitle">Changes save when you click Save changes.</p>
          </div>
        </div>

        {saveError && <div className="alert-error">{saveError}</div>}

        {/* What are you looking for? */}
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

        {/* About you */}
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

        {/* Age & Height */}
        <div className="ep-section">
          <div className="ep-section-title">Age &amp; height</div>
          <div className="field-row">
            <div className="field">
              <label>Age <span style={{ color: '#EF4444' }}>*</span></label>
              <input type="number" min="18" max="99" value={form.age} onChange={e => set('age', e.target.value)} />
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

        {/* Your story */}
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

        {/* Where do you live? */}
        <div className="ep-section">
          <div className="ep-section-title">Where do you live?</div>
          <div className="field">
            <label>Country</label>
            <select value={form.country} onChange={e => set('country', e.target.value)}>
              <option value="">Select country…</option>
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
            </select>
          </div>
          <div className="field">
            <label>State / Province</label>
            <input type="text" value={form.state} onChange={e => set('state', e.target.value)} placeholder="e.g. Texas" />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>City</label>
            <input type="text" value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Dallas" />
          </div>
        </div>

        {/* Your roots */}
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

        {/* Community */}
        <div className="ep-section">
          <div className="ep-section-title">
            Community / Caste{' '}
            <span style={{ fontWeight: 400, fontSize: 13, color: 'var(--fg-4)' }}>(optional)</span>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <input type="text" value={form.community} onChange={e => set('community', e.target.value)} placeholder="e.g. Newar, Gurung, Brahmin…" />
          </div>
        </div>

        {/* Lifestyle */}
        <div className="ep-section">
          <div className="ep-section-title">Lifestyle</div>
          <div className="field">
            <label>Occupation <span style={{ color: 'var(--fg-4)', fontWeight: 400 }}>(optional)</span></label>
            <input type="text" value={form.occupation} onChange={e => set('occupation', e.target.value)} placeholder="e.g. Software Engineer" />
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

        {/* Languages */}
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

        {/* Interests */}
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

        {/* Who do you want to meet? */}
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
                <input type="number" min="18" max="80" value={form.preferred_age_min}
                  onChange={e => set('preferred_age_min', Math.min(+e.target.value, form.preferred_age_max))} />
              </div>
              <div className="ep-age-field">
                <span className="ep-age-label">Max</span>
                <input type="number" min="18" max="80" value={form.preferred_age_max}
                  onChange={e => set('preferred_age_max', Math.max(+e.target.value, form.preferred_age_min))} />
              </div>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="step-actions" style={{ marginTop: 32, paddingBottom: 24 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/profile')}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>

      </div>
    </div>
  )
}
