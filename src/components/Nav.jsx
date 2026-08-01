import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Nav({ showLinks = true, showCta = true }) {
  const { pathname }  = useLocation()
  const { user }      = useAuth()
  const isActive = (p) => pathname === p

  return (
    <nav>
      <div className="wrap">
        <Link className="brand" to="/">
          <Logo size={30} />
          NepHearts
        </Link>
        {showLinks && (
          <div className="links">
            <Link to="/discover"  className={isActive('/discover')  ? 'active' : ''}>Discover</Link>
            <Link to="/liked-me" className={isActive('/liked-me') ? 'active' : ''}>Likes ⭐</Link>
            <Link to="/matches"  className={isActive('/matches')   ? 'active' : ''}>Matches</Link>
            <Link to="/profile"  className={isActive('/profile')   ? 'active' : ''}>Profile</Link>
          </div>
        )}
        {showCta && !user && (
          <div className="cta">
            <Link className="btn btn-secondary" to="/login"  style={{ padding: '10px 20px', fontSize: 14 }}>Sign in</Link>
            <Link className="btn btn-primary"  to="/signup">Join free</Link>
          </div>
        )}
        {showCta && user && (
          <div className="cta">
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--fg-1)', fontWeight: 600, fontSize: 14 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: `linear-gradient(135deg, hsl(${parseInt(user.avatar_seed)||30},80%,75%), hsl(${(parseInt(user.avatar_seed)||30)+40}%,70%,55%))`,
                flexShrink: 0,
              }} />
              {user.name?.split(' ')[0]}
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
