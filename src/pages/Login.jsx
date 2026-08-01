import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login }               = useAuth()
  const navigate                = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in both fields'); return }
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/discover')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(160deg, #FF7A59 0%, #FF4D6D 55%, #C22A48 100%)' }}>

      {/* Gradient hero */}
      <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 72, paddingBottom: 52, gap: 8 }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, marginBottom: 4, backdropFilter: 'blur(4px)', border: '1.5px solid rgba(255,255,255,0.3)' }}>
          💕
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '0.5px' }}>
          Matina
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.08em' }}>
          — Where Nepali Hearts Meet —
        </div>
      </div>

      {/* White sheet */}
      <div style={{ flex: 1, background: '#fff', borderRadius: '28px 28px 0 0', marginTop: -24, padding: '32px 28px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--fg-1)', marginBottom: 24 }}>
            Welcome back
          </div>

          {error && <div className="alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="field">
              <label>Password</label>
              <div className="input-wrap">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="step-actions" style={{ marginTop: 8 }}>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ boxShadow: '0 6px 20px rgba(255,77,109,0.35)' }}>
                {loading ? 'Signing in…' : 'Sign in →'}
              </button>
            </div>
          </form>

          <p className="signin-link" style={{ marginTop: 24 }}>
            New to Matina?{' '}
            <Link to="/signup" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Create an account</Link>
          </p>

          <div className="demo-hint">
            <strong>Demo accounts</strong>
            <span>sabina@demo.com / anish@demo.com / kripa@demo.com</span>
            <span>Password: <code>demo1234</code></span>
          </div>
        </div>
      </div>
    </div>
  )
}
