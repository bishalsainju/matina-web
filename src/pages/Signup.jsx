import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const CITIES = [
  'Dallas, USA', 'New York, USA', 'Bay Area, USA', 'Houston, USA',
  'Chicago, USA', 'Los Angeles, USA', 'Seattle, USA',
  'Toronto, Canada', 'Vancouver, Canada', 'Calgary, Canada',
  'Sydney, Australia', 'Melbourne, Australia', 'Brisbane, Australia',
  'London, UK', 'Manchester, UK',
  'Doha, Qatar', 'Dubai, UAE', 'Riyadh, Saudi Arabia',
  'Other',
]

const GENDERS = ['Man', 'Woman', 'Non-binary', 'Prefer not to say']

const INTENTS = [
  { id: 'friendship', label: 'Friendship', icon: '🤝', color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
  { id: 'dating',     label: 'Dating',     icon: '💛', color: '#E31C5F', bg: '#FFF1F2', border: '#FECDD3' },
  { id: 'marriage',  label: 'Marriage',   icon: '💍', color: '#0E9F6E', bg: '#F0FDF4', border: '#BBF7D0' },
]

const INTERESTS = [
  'Hiking & Trekking', 'Yoga & Meditation', 'Nepali Cuisine', 'Traditional Music',
  'Photography', 'Travel', 'Fitness', 'Reading', 'Movies', 'Gaming',
  'Cooking', 'Art & Crafts', 'Dancing', 'Sports', 'Festivals & Culture',
  'Volunteering', 'Entrepreneurship', 'Tech & Science', 'Fashion',
  'Spirituality', 'Pets', 'Gardening', 'Writing', 'Podcasts', 'Poetry',
]

const RELIGIONS = ['Hindu', 'Buddhist', 'Christian', 'Muslim', 'Kirant', 'Secular / None', 'Other']

const HEIGHTS = Array.from({ length: 37 }, (_, i) => {
  const totalInches = 58 + i
  const ft = Math.floor(totalInches / 12)
  const inn = totalInches % 12
  const cm = Math.round(totalInches * 2.54)
  return { value: `${ft}'${inn}"`, label: `${ft}'${inn}"  (${cm} cm)` }
})

const TOTAL_STEPS = 6

function passwordStrength(pw) {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

const STRENGTH_COLORS = ['', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#10B981']
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong']

function validate(step, data) {
  const errs = {}
  if (step === 1) {
    if (!data.email) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = 'Enter a valid email address'
    if (!data.password) errs.password = 'Password is required'
    else if (data.password.length < 8) errs.password = 'Must be at least 8 characters'
    if (data.password !== data.confirmPassword) errs.confirmPassword = 'Passwords do not match'
  }
  if (step === 2) {
    if (!data.name.trim()) errs.name = 'Name is required'
    if (!data.age) errs.age = 'Age is required'
    else if (parseInt(data.age) < 18) errs.age = 'You must be 18 or older'
    else if (parseInt(data.age) > 99) errs.age = 'Enter a valid age'
    if (!data.gender) errs.gender = 'Please select your gender'
    if (!data.intent) errs.intent = "Please select what you're looking for"
  }
  if (step === 3) {
    if (!data.city) errs.city = 'Please select your city'
  }
  return errs
}

export default function Signup() {
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  // Step 1 — Account
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Step 2 — Identity
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [intent, setIntent] = useState('')

  // Step 3 — Story
  const [city, setCity] = useState('')
  const [bio, setBio] = useState('')
  const BIO_MAX = 280

  // Step 4 — Details
  const [height, setHeight] = useState('')
  const [religion, setReligion] = useState('')
  const [interests, setInterests] = useState([])

  // Step 5 — Verify
  const [idDone, setIdDone] = useState(false)
  const [selfieDone, setSelfieDone] = useState(false)

  const pwStrength = passwordStrength(password)

  function attempt(nextStep) {
    const data = { email, password, confirmPassword, name, age, gender, intent, city }
    const errs = validate(step, data)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setStep(nextStep)
  }

  function toggleInterest(i) {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
  }

  const progressPct = step >= TOTAL_STEPS ? 100 : (step / TOTAL_STEPS) * 100

  return (
    <div>
      <Nav showLinks={false} showCta={false} />
      <div className="app-main">

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>

        {/* ── Step 1: Account ────────────────────────────────────── */}
        {step === 1 && (
          <div className="step-panel active">
            <div className="eyebrow">Step 1 of {TOTAL_STEPS}</div>
            <h1 className="step-title">Create your account</h1>
            <p className="step-sub">Your email stays private — we never share it.</p>

            <div className={`field${errors.email ? ' field-error' : ''}`}>
              <label>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && <div className="field-msg">{errors.email}</div>}
            </div>

            <div className={`field${errors.password ? ' field-error' : ''}`}>
              <label>Password</label>
              <div className="input-wrap">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              {password && (
                <div className="pw-strength">
                  <div className="pw-bars">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className="pw-bar"
                        style={{ background: pwStrength >= i ? STRENGTH_COLORS[pwStrength] : 'var(--border)' }}
                      />
                    ))}
                  </div>
                  <span style={{ color: STRENGTH_COLORS[pwStrength], fontSize: 12, fontWeight: 600 }}>
                    {STRENGTH_LABELS[pwStrength]}
                  </span>
                </div>
              )}
              {errors.password && <div className="field-msg">{errors.password}</div>}
            </div>

            <div className={`field${errors.confirmPassword ? ' field-error' : ''}`}>
              <label>Confirm password</label>
              <div className="input-wrap">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />
                <button type="button" className="pw-toggle" onClick={() => setShowConfirm(v => !v)}>
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.confirmPassword && <div className="field-msg">{errors.confirmPassword}</div>}
            </div>

            <div className="step-actions">
              <button className="btn btn-primary btn-block" onClick={() => attempt(2)}>
                Continue
              </button>
            </div>
            <p className="signin-link">
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Sign in</Link>
            </p>
          </div>
        )}

        {/* ── Step 2: Identity ───────────────────────────────────── */}
        {step === 2 && (
          <div className="step-panel active">
            <div className="eyebrow">Step 2 of {TOTAL_STEPS}</div>
            <h1 className="step-title">Who are you?</h1>
            <p className="step-sub">Help people know who they're meeting.</p>

            <div className={`field${errors.name ? ' field-error' : ''}`}>
              <label>Full name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Sabina Gurung"
                autoComplete="name"
              />
              {errors.name && <div className="field-msg">{errors.name}</div>}
            </div>

            <div className={`field${errors.age ? ' field-error' : ''}`}>
              <label>Age</label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="26"
                min="18"
                max="99"
              />
              {errors.age && <div className="field-msg">{errors.age}</div>}
            </div>

            <div className={`field${errors.gender ? ' field-error' : ''}`}>
              <label>I am a</label>
              <div className="chip-group">
                {GENDERS.map(g => (
                  <button
                    key={g}
                    type="button"
                    className={`chip-btn${gender === g ? ' active' : ''}`}
                    onClick={() => setGender(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
              {errors.gender && <div className="field-msg">{errors.gender}</div>}
            </div>

            <div className={`field${errors.intent ? ' field-error' : ''}`}>
              <label>I'm looking for</label>
              <div className="intent-group">
                {INTENTS.map(it => (
                  <button
                    key={it.id}
                    type="button"
                    className={`intent-btn${intent === it.id ? ' active' : ''}`}
                    style={intent === it.id
                      ? { borderColor: it.color, background: it.bg, color: it.color }
                      : {}}
                    onClick={() => setIntent(it.id)}
                  >
                    <span className="intent-icon">{it.icon}</span>
                    <span>{it.label}</span>
                  </button>
                ))}
              </div>
              {errors.intent && <div className="field-msg">{errors.intent}</div>}
            </div>

            <div className="step-actions">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary" onClick={() => attempt(3)}>Continue</button>
            </div>
          </div>
        )}

        {/* ── Step 3: Story ──────────────────────────────────────── */}
        {step === 3 && (
          <div className="step-panel active">
            <div className="eyebrow">Step 3 of {TOTAL_STEPS}</div>
            <h1 className="step-title">Your story</h1>
            <p className="step-sub">Where are you based, and what makes you, you?</p>

            <div className={`field${errors.city ? ' field-error' : ''}`}>
              <label>City</label>
              <select value={city} onChange={e => setCity(e.target.value)}>
                <option value="">Select your city...</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.city && <div className="field-msg">{errors.city}</div>}
            </div>

            <div className="field">
              <label>
                <span>
                  Bio{' '}
                  <span style={{ color: 'var(--fg-4)', fontWeight: 400 }}>(optional)</span>
                </span>
                <span
                  className="bio-counter"
                  style={{ color: bio.length > BIO_MAX * 0.9 ? '#EF4444' : 'var(--fg-4)' }}
                >
                  {bio.length}/{BIO_MAX}
                </span>
              </label>
              <textarea
                rows="5"
                value={bio}
                onChange={e => {
                  if (e.target.value.length <= BIO_MAX) setBio(e.target.value)
                }}
                placeholder="Grew up in Pokhara, moved to Toronto for grad school. Love hiking, momos, and late-night philosophy debates..."
              />
            </div>

            <div className="step-actions">
              <button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button>
              <button className="btn btn-primary" onClick={() => attempt(4)}>Continue</button>
            </div>
          </div>
        )}

        {/* ── Step 4: Details ────────────────────────────────────── */}
        {step === 4 && (
          <div className="step-panel active">
            <div className="eyebrow">Step 4 of {TOTAL_STEPS}</div>
            <h1 className="step-title">A few more details</h1>
            <p className="step-sub">Optional — but profiles with more info get more matches.</p>

            <div className="field-row">
              <div className="field">
                <label>
                  Height{' '}
                  <span style={{ color: 'var(--fg-4)', fontWeight: 400 }}>(optional)</span>
                </label>
                <select value={height} onChange={e => setHeight(e.target.value)}>
                  <option value="">Select...</option>
                  {HEIGHTS.map(h => (
                    <option key={h.value} value={h.value}>{h.label}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>
                  Religion{' '}
                  <span style={{ color: 'var(--fg-4)', fontWeight: 400 }}>(optional)</span>
                </label>
                <select value={religion} onChange={e => setReligion(e.target.value)}>
                  <option value="">Select...</option>
                  {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="field">
              <label>
                Interests{' '}
                <span style={{ color: 'var(--fg-4)', fontWeight: 400 }}>
                  — pick as many as you like
                  {interests.length > 0 && ` (${interests.length} selected)`}
                </span>
              </label>
              <div className="interest-grid">
                {INTERESTS.map(i => (
                  <button
                    key={i}
                    type="button"
                    className={`interest-tag${interests.includes(i) ? ' active' : ''}`}
                    onClick={() => toggleInterest(i)}
                  >
                    {interests.includes(i) && <span className="tag-check">✓</span>}
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div className="step-actions">
              <button className="btn btn-secondary" onClick={() => setStep(3)}>Back</button>
              <button className="btn btn-primary" onClick={() => setStep(5)}>Continue</button>
            </div>
          </div>
        )}

        {/* ── Step 5: Verify ─────────────────────────────────────── */}
        {step === 5 && (
          <div className="step-panel active">
            <div className="eyebrow">Step 5 of {TOTAL_STEPS}</div>
            <h1 className="step-title">Verify it's really you</h1>
            <p className="step-sub">Optional — get a verified badge on your profile and build more trust.</p>

            <div className="verify-why">
              <div className="verify-why-item">
                <span className="verify-why-icon">🔒</span>
                <span>Your ID is never shown to other users</span>
              </div>
              <div className="verify-why-item">
                <span className="verify-why-icon">✓</span>
                <span>You'll get a verified badge on your profile</span>
              </div>
              <div className="verify-why-item">
                <span className="verify-why-icon">🤝</span>
                <span>Verified profiles get more matches</span>
              </div>
            </div>

            <div
              className={`upload-box${idDone ? ' done' : ''}`}
              onClick={() => setIdDone(true)}
            >
              <div style={{ fontSize: 36, marginBottom: 10 }}>🪪</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {idDone ? '✓ ID uploaded' : 'Upload government ID'}
              </div>
              <div style={{ fontSize: 13, color: idDone ? 'var(--emerald-700)' : 'var(--fg-3)', marginTop: 4 }}>
                {idDone ? 'Looking good' : "Passport, driver's license, or national ID"}
              </div>
            </div>

            <div
              className={`upload-box${selfieDone ? ' done' : ''}`}
              style={{ marginTop: 16 }}
              onClick={() => setSelfieDone(true)}
            >
              <div style={{ fontSize: 36, marginBottom: 10 }}>🤳</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {selfieDone ? '✓ Selfie captured' : 'Take a selfie'}
              </div>
              <div style={{ fontSize: 13, color: selfieDone ? 'var(--emerald-700)' : 'var(--fg-3)', marginTop: 4 }}>
                {selfieDone ? 'Photo verified' : 'Hold your ID next to your face'}
              </div>
            </div>

            <p className="verify-hint">Click the boxes above to simulate upload. You can also skip and verify later from your profile.</p>

            {submitError && <div className="alert-error" style={{ marginTop: 16 }}>{submitError}</div>}

            <div className="step-actions">
              <button className="btn btn-secondary" onClick={() => setStep(4)}>Back</button>
              <button
                className="btn btn-primary"
                disabled={submitting}
                onClick={async () => {
                  setSubmitting(true)
                  setSubmitError('')
                  try {
                    await register({ email, password, name, age, gender, intent, city, bio, height, religion, interests })
                    setStep(6)
                  } catch (err) {
                    setSubmitError(err.message)
                  } finally {
                    setSubmitting(false)
                  }
                }}
              >
                {submitting ? 'Creating account…' : 'Complete signup'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 6: Success ────────────────────────────────────── */}
        {step === 6 && (
          <div className="step-panel active" style={{ textAlign: 'center' }}>
            <div className="success-ring">✓</div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 34, color: 'var(--fg-1)', margin: '28px 0 12px' }}>
              You're in, {name || 'friend'}.
            </h1>
            <p style={{ color: 'var(--fg-3)', fontSize: 17, lineHeight: 1.65, margin: '0 0 24px' }}>
              Welcome to Matina — a verified Nepali community you can trust.
            </p>

            <div className="success-pills">
              {city && (
                <div className="success-pill">📍 {city}</div>
              )}
              {intent && (
                <div className="success-pill">
                  {intent === 'friendship' ? '🤝' : intent === 'dating' ? '💛' : '💍'}
                  {' '}Open to {intent}
                </div>
              )}
              {interests.length > 0 && (
                <div className="success-pill">✨ {interests.length} interest{interests.length !== 1 ? 's' : ''} added</div>
              )}
            </div>

            <Link className="btn btn-primary btn-block" to="/discover" style={{ marginTop: 32, display: 'flex' }}>
              Start discovering →
            </Link>
            <Link
              to="/profile"
              style={{ display: 'block', marginTop: 14, color: 'var(--primary-600)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}
            >
              Complete your profile first
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
