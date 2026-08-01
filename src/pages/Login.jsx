import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const { login }             = useAuth()
  const navigate              = useNavigate()

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
    <div>
      <Nav showLinks={false} showCta={false} />
      <div className="app-main">
        <div className="eyebrow">Welcome back</div>
        <h1 className="step-title">Sign in to NepHearts</h1>
        <p className="step-sub">Continue finding your community.</p>

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

          <div className="step-actions">
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </div>
        </form>

        <p className="signin-link" style={{ marginTop: 24 }}>
          New to NepHearts?{' '}
          <Link to="/signup" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Create an account</Link>
        </p>

        <div className="demo-hint">
          <strong>Demo accounts</strong>
          <span>sabina@demo.com / anish@demo.com / kripa@demo.com</span>
          <span>Password: <code>demo1234</code></span>
        </div>
      </div>
    </div>
  )
}
