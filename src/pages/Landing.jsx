import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Logo from '../components/Logo.jsx'

export default function Landing() {
  return (
    <div>
      <Nav />

      <div className="hero">
        <div className="topo" style={{ backgroundImage: "url('/topo-pattern.svg')" }} />
        <div className="flag-stripe" />
        <div className="hero-inner">
          <div className="eyebrow">One app. One purpose.</div>
          <h1>The right person.<br />Same roots.<br /><span className="accent">Closer than you think.</span></h1>
          <p>Meet verified Nepalis nearby who understand your culture, values, and what truly matters.</p>
          <div className="actions">
            <Link className="btn btn-primary" to="/signup">Join free</Link>
            <a className="btn" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', color: '#FAFAF7' }} href="#how">See how it works</a>
          </div>
        </div>
        <div className="flag-stripe" />
      </div>

      {/* Problem */}
      <section className="section-cream">
        <div className="problem">
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(30px,4vw,48px)', lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--fg-1)', margin: 0 }}>
            Millions around the world.<br /><span style={{ color: 'var(--primary-600)' }}>But still hard to<br />find each other.</span>
          </h2>
          <div>
            <p>There are millions of Nepalis living outside Nepal, yet meeting someone compatible is surprisingly difficult. Most people rely on chance — a mutual friend, a community event, a wedding, or a Facebook group.</p>
            <p>General dating apps are built for everyone, which means finding another Nepali often feels like searching for a needle in a haystack.</p>
            <p className="strong">There should be one place where Nepalis, wherever they live, can meet with intention.</p>
          </div>
        </div>
      </section>

      {/* Idea */}
      <section>
        <div className="section-head">
          <div className="eyebrow">The idea</div>
          <h2>One app. One purpose.</h2>
        </div>
        <div className="wrap">
          <div className="grid3">
            <div className="card">
              <div className="num">01</div>
              <h3>Same city, same roots.</h3>
              <p>Meet verified Nepalis who actually live near you, and can have chiya with this weekend.</p>
            </div>
            <div className="card" style={{ background: 'var(--primary-50)', borderColor: 'var(--primary-200)' }}>
              <div className="num">02</div>
              <h3>Built on trust.</h3>
              <p>Government ID and selfie verification keep the community authentic.</p>
            </div>
            <div className="card">
              <div className="num">03</div>
              <h3>Just dating. No noise.</h3>
              <p>No feeds. No marketplace. No distractions. Just meaningful connections.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={{ background: 'var(--warm-900)', color: '#FAFAF7' }}>
        <div className="section-head">
          <div className="eyebrow">How it works</div>
          <h2 style={{ color: '#FAFAF7' }}>Three steps.<br /><span style={{ color: 'var(--saffron-300)' }}>One minute.</span></h2>
        </div>
        <div className="wrap">
          <div className="grid3">
            <div className="card" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }}>
              <div className="num" style={{ color: 'var(--saffron-300)' }}>1</div>
              <h3 style={{ color: '#FAFAF7' }}>Verify</h3>
              <p style={{ color: 'rgba(250,246,239,0.78)' }}>Upload your ID and selfie once.</p>
            </div>
            <div className="card" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }}>
              <div className="num" style={{ color: 'var(--saffron-300)' }}>2</div>
              <h3 style={{ color: '#FAFAF7' }}>Set your city</h3>
              <p style={{ color: 'rgba(250,246,239,0.78)' }}>Dallas. Sydney. Toronto. London. Anywhere.</p>
            </div>
            <div className="card" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }}>
              <div className="num" style={{ color: 'var(--saffron-300)' }}>3</div>
              <h3 style={{ color: '#FAFAF7' }}>Meet nearby</h3>
              <p style={{ color: 'rgba(250,246,239,0.78)' }}>Discover verified Nepalis nearby and chat when you both match.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="section-cream">
        <div className="trust">
          <div className="trust-copy">
            <div className="eyebrow">Trust</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(30px,4vw,44px)', lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--fg-1)', margin: '16px 0 20px' }}>
              The orange check<br />means a real person.
            </h2>
            <p>Government ID + selfie verification helps ensure you're meeting real people — not bots, fake accounts, or scammers.</p>
            <div className="checklist">
              <div><span className="tick">✓</span>Required before matching</div>
              <div><span className="tick">✓</span>Required before messaging</div>
              <div><span className="tick">✓</span>Always free</div>
            </div>
          </div>
          <div className="verify-card">
            <div className="avatar-ring"><div className="check">✓</div></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--fg-1)' }}>Priya Shrestha</div>
              <div style={{ fontSize: 15, color: 'var(--fg-3)', marginTop: 4 }}>Sydney · 27</div>
            </div>
            <div className="badge-pill"><span style={{ color: 'var(--primary-600)', fontWeight: 800 }}>✓</span>Verified member</div>
          </div>
        </div>
      </section>

      {/* Product */}
      <section>
        <div className="product">
          <div className="product-copy">
            <div className="eyebrow">Product</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(30px,4vw,44px)', lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--fg-1)', margin: '16px 0 20px' }}>
              Simple.<br />Intentional.
            </h2>
            <p>One profile at a time. No endless swiping. No social feed. No games. Just verified Nepalis nearby looking for meaningful relationships.</p>
          </div>
          <div className="phone-frame">
            <div className="phone-screen">
              <div className="match-card">
                <div className="match-photo">
                  <span className="dist">📍 4 mi away</span>
                  <div>
                    <div className="name">Sabina, 26</div>
                    <div className="loc">Toronto, ON</div>
                  </div>
                </div>
                <div className="match-body">
                  <p>Grew up in Pokhara, moved to Toronto for grad school. Loves hiking, weekend markets, and slow Sunday mornings.</p>
                  <div className="match-actions">
                    <span className="pass">✕</span>
                    <span className="like">♥</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global */}
      <section style={{ background: 'var(--warm-900)' }}>
        <div className="section-head">
          <div className="eyebrow">Global from day one</div>
          <h2 style={{ color: '#FAFAF7' }}>Wherever Nepalis are,<br /><span style={{ color: 'var(--saffron-300)' }}>NepHearts is there.</span></h2>
        </div>
        <div className="global-grid">
          <div className="grid4">
            <div className="city-card live"><div className="name">USA</div><div className="sub" style={{ color: 'rgba(255,255,255,0.85)' }}>Dallas · NYC · Bay Area</div></div>
            <div className="city-card"><div className="name">Canada</div><div className="sub">Toronto · Vancouver</div></div>
            <div className="city-card"><div className="name">Australia</div><div className="sub">Sydney · Melbourne</div></div>
            <div className="city-card"><div className="name">UK</div><div className="sub">London · Reading</div></div>
          </div>
          <p className="global-note">Launch isn't tied to one city. As soon as enough verified members join an area, matching becomes available — Canada, Australia, United Kingdom, United States, Middle East, and everywhere Nepalis call home.</p>
        </div>
      </section>

      {/* Free */}
      <section className="section-cream">
        <div className="section-head">
          <div className="eyebrow">No catch</div>
          <h2>Free to start.<br />Free to match.</h2>
        </div>
        <div className="free-list">
          <div className="free-item"><span className="tick">✓</span><div><div className="t1">Verification</div><div className="t2">Free. Always.</div></div></div>
          <div className="free-item"><span className="tick">✓</span><div><div className="t1">Matching &amp; messaging</div><div className="t2">Free. Always.</div></div></div>
        </div>
        <p style={{ textAlign: 'center', maxWidth: 620, margin: '24px auto 0', fontSize: 16, color: 'var(--fg-3)' }}>No paywalls. No ads. Premium features may come later, but meeting people will always remain free.</p>
      </section>

      {/* Final CTA */}
      <section id="join" className="cta-final">
        <div className="topo" style={{ position: 'absolute', inset: 0, backgroundImage: "url('/topo-pattern.svg')", backgroundSize: '600px', opacity: 0.06 }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className="deva">धन्यवाद</div>
          <h2>Find your person.<br />Wherever home is now.</h2>
          <div className="actions" style={{ marginTop: 8 }}>
            <Link className="btn btn-primary" to="/signup">Join free — nephearts.app</Link>
          </div>
        </div>
      </section>

      <footer>
        <div className="brand">
          <Logo size={20} />
          NepHearts
        </div>
        Built for Nepalis, wherever home is now.
      </footer>
    </div>
  )
}
