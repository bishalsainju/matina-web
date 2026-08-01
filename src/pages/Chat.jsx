import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api.js'

let socketSingleton = null

function getSocket() {
  if (!socketSingleton) {
    socketSingleton = io('/', {
      auth: { token: localStorage.getItem('nh_token') },
      autoConnect: false,
    })
  }
  return socketSingleton
}

function avatarGradient(seed) {
  const h = parseInt(seed) || 30
  return `linear-gradient(135deg, hsl(${h},80%,75%), hsl(${(h + 40) % 360},70%,55%))`
}

function formatTime(ts) {
  if (!ts) return ''
  return new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function Chat() {
  const [params]        = useSearchParams()
  const otherId         = params.get('id')
  const otherName       = params.get('name') || 'Match'
  const { user }        = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [typing, setTyping]     = useState(false)
  const [loading, setLoading]   = useState(true)
  const bodyRef  = useRef(null)
  const typingTimer = useRef(null)

  // Load history and connect socket
  useEffect(() => {
    if (!otherId) return

    // Mark conversation as seen (mirrors mobile nh_seen_* logic)
    localStorage.setItem(`nh_seen_${otherId}`, String(Date.now()))

    api.messages(otherId)
      .then(setMessages)
      .catch(() => {})
      .finally(() => setLoading(false))

    const socket = getSocket()
    socket.connect()
    socket.emit('chat:join', otherId)

    const onMessage = (msg) => {
      setMessages(prev => [...prev, msg])
    }
    const onTyping = ({ from }) => {
      if (from !== otherId) return
      setTyping(true)
      clearTimeout(typingTimer.current)
      typingTimer.current = setTimeout(() => setTyping(false), 2000)
    }

    socket.on('chat:message', onMessage)
    socket.on('chat:typing',  onTyping)

    return () => {
      socket.emit('chat:leave', otherId)
      socket.off('chat:message', onMessage)
      socket.off('chat:typing',  onTyping)
    }
  }, [otherId])

  // Scroll to bottom on new messages
  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, typing])

  const send = useCallback(() => {
    const text = input.trim()
    if (!text || !otherId) return
    setInput('')
    const socket = getSocket()
    socket.emit('chat:send', { to: otherId, content: text })
  }, [input, otherId])

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
    else {
      const socket = getSocket()
      socket.emit('chat:typing', { to: otherId })
    }
  }

  const myAvatar    = avatarGradient(user?.avatar_seed)
  const otherAvatar = avatarGradient(null)

  return (
    <div>
      <nav>
        <div className="wrap">
          <Link to="/matches" style={{ fontSize: 20, marginRight: 6, textDecoration: 'none', color: 'var(--fg-2)' }}>←</Link>
          <Link
            className="brand"
            to={`/users/${otherId}`}
            style={{ gap: 10, flex: 1, textDecoration: 'none' }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: otherAvatar, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg-1)', lineHeight: 1.2 }}>{otherName}</div>
              <div style={{ fontSize: 11, color: 'var(--primary-600)', fontWeight: 600 }}>View profile</div>
            </div>
          </Link>
        </div>
      </nav>

      <div className="chat-wrap">
        <div className="chat-body" ref={bodyRef}>
          {loading && (
            <div style={{ textAlign: 'center', color: 'var(--fg-4)', padding: '20px 0', fontSize: 14 }}>Loading…</div>
          )}

          {!loading && messages.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--fg-3)', padding: '40px 24px' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>👋</div>
              <div style={{ fontWeight: 600 }}>You matched with {otherName}</div>
              <div style={{ fontSize: 14, marginTop: 6 }}>Say hello!</div>
            </div>
          )}

          {messages.map((m) => {
            const isMe = m.sender_id === user?.user_id
            return (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap: 2 }}>
                <div className={`bubble ${isMe ? 'me' : 'them'}`}>{m.content}</div>
                <span style={{ fontSize: 11, color: 'var(--fg-4)', margin: isMe ? '0 4px 8px' : '0 4px 8px' }}>
                  {formatTime(m.created_at)}
                </span>
              </div>
            )
          })}

          {typing && (
            <div className="bubble them" style={{ width: 56 }}>
              <span className="typing-dots"><span /><span /><span /></span>
            </div>
          )}
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder="Type a message…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <button onClick={send}>➤</button>
        </div>
      </div>
    </div>
  )
}
