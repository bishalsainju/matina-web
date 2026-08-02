import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Logo from '../components/Logo.jsx'

export default function Landing() {
  return (
    <div>
      <Nav />

      {/* Hero */}
      <div className="hero">
        <div className="topo" style={{ backgroundImage: "url('/topo-pattern.svg')" }} />
        <div className="flag-stripe" />
        <div className="hero-inner">
          <div className="eyebrow">🇳🇵 Meet Matina.</div>
          <h1>Meeting<br />Nepali Hearts.</h1>
          <p>A dating app created exclusively for Nepalis living abroad — wherever home is now.</p>
          <div className="actions">
            <Link className="btn btn-primary" to="/signup" style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.45)' }}>Join Matina free</Link>
          </div>
        </div>
        <div className="flag-stripe" />
      </div>

      {/* The Problem — narrative */}
      <section className="section-cream">
        <div className="wrap" style={{ maxWidth: 720, paddingTop: 72, paddingBottom: 72 }}>
          <div className="eyebrow" style={{ marginBottom: 32 }}>The problem</div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(22px,3.2vw,34px)', lineHeight: 1.35, color: 'var(--fg-1)', marginBottom: 28 }}>
            If you've ever used Tinder or Bumble, you know the experience.
          </p>
          <p style={{ fontSize: 'clamp(17px,2vw,21px)', lineHeight: 1.75, color: 'var(--fg-2)', marginBottom: 20 }}>
            You can swipe through hundreds — even thousands — of people nearby.
          </p>
          <p style={{ fontSize: 'clamp(17px,2vw,21px)', lineHeight: 1.75, color: 'var(--fg-1)', fontWeight: 600, marginBottom: 0 }}>
            But if you're specifically looking to meet another Nepali, it can still feel almost impossible.
          </p>
        </div>
      </section>

      {/* Cities */}
      <section style={{ background: 'var(--warm-900)' }}>
        <div className="wrap" style={{ maxWidth: 720, paddingTop: 72, paddingBottom: 40 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(20px,3vw,32px)', lineHeight: 1.45, color: '#FAFAF7', marginBottom: 20 }}>
            Whether you're in Dallas, Sydney, Toronto, London, Dubai, or Tokyo —
          </p>
          <p style={{ fontSize: 'clamp(17px,2vw,21px)', lineHeight: 1.7, color: 'rgba(250,246,239,0.78)', marginBottom: 0 }}>
            your Nepali community may be there. You just can't easily find each other.
          </p>
        </div>
        <div className="global-grid" style={{ paddingTop: 8, paddingBottom: 64 }}>
          <div className="grid4">
            <div className="city-card live"><div className="name">USA</div><div className="sub" style={{ color: 'rgba(255,255,255,0.85)' }}>Dallas · NYC · Bay Area</div></div>
            <div className="city-card"><div className="name">Canada</div><div className="sub">Toronto · Vancouver</div></div>
            <div className="city-card"><div className="name">Australia</div><div className="sub">Sydney · Melbourne</div></div>
            <div className="city-card"><div className="name">UK</div><div className="sub">London · Reading</div></div>
            <div className="city-card"><div className="name">UAE</div><div className="sub">Dubai · Abu Dhabi</div></div>
            <div className="city-card"><div className="name">Japan</div><div className="sub">Tokyo · Osaka</div></div>
            <div className="city-card"><div className="name">Germany</div><div className="sub">Berlin · Frankfurt</div></div>
            <div className="city-card"><div className="name">+ More</div><div className="sub">Everywhere Nepalis are</div></div>
          </div>
        </div>
      </section>

      {/* Why Matina — solution + phone mock */}
      <section>
        <div className="product">
          <div className="product-copy">
            <div className="eyebrow">That's why we're building Matina.</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(28px,3.8vw,42px)', lineHeight: 1.12, letterSpacing: '-0.02em', color: 'var(--fg-1)', margin: '16px 0 20px' }}>
              A dating app created exclusively for Nepalis living abroad.
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: 'var(--fg-2)', marginBottom: 28 }}>
              Whether you're looking for dating, a meaningful relationship, or eventually marriage — Matina helps you connect with Nepalis who share your culture, language, and values.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
              {['Dating', 'Relationship', 'Marriage'].map(label => (
                <span key={label} style={{ background: 'var(--primary-50)', color: 'var(--primary-600)', border: '1.5px solid var(--primary-200)', borderRadius: 99, padding: '7px 18px', fontSize: 14, fontWeight: 600 }}>{label}</span>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {['Culture', 'Language', 'Values'].map(label => (
                <span key={label} style={{ background: 'rgba(0,0,0,0.04)', color: 'var(--fg-2)', border: '1.5px solid var(--border)', borderRadius: 99, padding: '7px 18px', fontSize: 14, fontWeight: 500 }}>{label}</span>
              ))}
            </div>
          </div>
          <div className="phone-frame">
            <div className="phone-screen">
              <div style={{ margin: 12, borderRadius: 20, overflow: 'hidden' }}>
                <div className="match-card-fullbleed">
                  <div style={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', gap: 4, zIndex: 2 }}>
                    <div style={{ flex: 1, height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.9)' }} />
                    <div style={{ flex: 1, height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.38)' }} />
                    <div style={{ flex: 1, height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.38)' }} />
                  </div>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 800, color: '#fff' }}>S</div>
                  </div>
                  <div className="match-card-scrim">
                    <div className="name">Sabina, 26 <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(255,255,255,0.92)', color: 'var(--primary-700)', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, marginLeft: 4 }}>✓ Verified</span></div>
                    <div className="loc">📍 Toronto, ON</div>
                    <div className="bio">Grew up in Pokhara, moved to Toronto for grad school. Loves hiking and weekend markets.</div>
                    <div className="match-actions">
                      <span className="pass">✕</span>
                      <span className="like">♥</span>
                    </div>
                  </div>
                </div>
              </div>
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
              The ✓ badge<br />means a real person.
            </h2>
            <p>Government ID + selfie verification ensures you're meeting real people — not bots, fake accounts, or scammers.</p>
            <div className="checklist">
              <div><span className="tick">✓</span>Required before matching</div>
              <div><span className="tick">✓</span>Required before messaging</div>
              <div><span className="tick">✓</span>Always free</div>
            </div>
          </div>
          <div className="verify-card">
            <div className="avatar-ring">
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 800, color: '#fff' }}>P</div>
              <div className="check">✓</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--fg-1)' }}>Priya Shrestha</div>
              <div style={{ fontSize: 15, color: 'var(--fg-3)', marginTop: 4 }}>Sydney · 27</div>
            </div>
            <div className="badge-pill"><span style={{ color: 'var(--primary-600)', fontWeight: 800 }}>✓</span>Verified member</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="join" className="cta-final">
        <div className="topo" style={{ position: 'absolute', inset: 0, backgroundImage: "url('/topo-pattern.svg')", backgroundSize: '600px', opacity: 0.06 }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 20 }}>Follow our journey as we build the community.</div>
          <h2>❤️ Meeting<br />Nepali Hearts.</h2>
          <div className="actions" style={{ marginTop: 8 }}>
            <Link className="btn btn-primary" to="/signup" style={{ background: 'var(--primary-500)', boxShadow: '0 8px 28px rgba(255,77,109,0.45)' }}>Join Matina free</Link>
          </div>
        </div>
      </section>

      <footer>
        <div className="brand">
          <Logo size={22} />
          Matina
        </div>
        ❤️ Meeting Nepali Hearts.
      </footer>
    </div>
  )
}
