import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth, useToast } from '../App'

export default function ChatPanel({ friendIds }) {
  const { user } = useAuth()
  const showToast = useToast()
  const [conversations, setConversations] = useState([])
  const [activeChat, setActiveChat] = useState(null) // { userId, displayName }
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)
  const [profiles, setProfiles] = useState({})
  const msgsEndRef = useRef(null)
  const channelRef = useRef(null)

  // Load friend profiles and conversations
  useEffect(() => {
    if (!user) return
    loadConversations()
  }, [user])

  async function loadConversations() {
    // Get all messages involving the user
    const { data: msgs } = await supabase
      .from('messages')
      .select('sender_id, receiver_id, body, created_at, read')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (!msgs) return

    // Group by conversation partner
    const convMap = {}
    msgs.forEach(m => {
      const partnerId = m.sender_id === user.id ? m.receiver_id : m.sender_id
      if (!convMap[partnerId]) {
        convMap[partnerId] = {
          partnerId,
          lastMessage: m.body,
          lastAt: m.created_at,
          unread: m.receiver_id === user.id && !m.read
        }
      } else if (m.receiver_id === user.id && !m.read) {
        convMap[partnerId].unread = true
      }
    })

    // Also add friends with no messages yet
    const friendUserIds = friendIds || []
    friendUserIds.forEach(fid => {
      if (!convMap[fid]) convMap[fid] = { partnerId: fid, lastMessage: null, lastAt: null, unread: false }
    })

    // Fetch profiles for all partners
    const partnerIds = Object.keys(convMap)
    if (partnerIds.length > 0) {
      const { data: profs } = await supabase.from('profiles').select('id, display_name').in('id', partnerIds)
      const profMap = {}
      ;(profs || []).forEach(p => { profMap[p.id] = p })
      setProfiles(profMap)
    }

    setConversations(Object.values(convMap).sort((a, b) => {
      if (!a.lastAt) return 1
      if (!b.lastAt) return -1
      return new Date(b.lastAt) - new Date(a.lastAt)
    }))
  }

  // Load messages for active chat
  useEffect(() => {
    if (!activeChat) return
    loadMessages(activeChat.userId)

    // Subscribe to realtime
    channelRef.current = supabase
      .channel(`chat-${activeChat.userId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `sender_id=eq.${activeChat.userId}`
      }, payload => {
        if (payload.new.receiver_id === user.id) {
          setMessages(prev => [...prev, payload.new])
          // Mark as read
          supabase.from('messages').update({ read: true }).eq('id', payload.new.id)
        }
      })
      .subscribe()

    return () => { channelRef.current?.unsubscribe() }
  }, [activeChat])

  // Auto-scroll on new messages
  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadMessages(partnerId) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })

    setMessages(data || [])

    // Mark unread as read
    await supabase.from('messages').update({ read: true })
      .eq('sender_id', partnerId).eq('receiver_id', user.id).eq('read', false)
  }

  async function sendMessage() {
    if (!newMsg.trim() || !activeChat) return
    setSending(true)
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: activeChat.userId,
      body: newMsg.trim()
    })
    if (error) { showToast('Neizdev\u0101s nos\u016bt\u012bt', 'error'); setSending(false); return }
    setMessages(prev => [...prev, { sender_id: user.id, receiver_id: activeChat.userId, body: newMsg.trim(), created_at: new Date().toISOString(), read: false }])
    setNewMsg('')
    setSending(false)
  }

  function formatTime(iso) {
    const d = new Date(iso)
    const now = new Date()
    const diffMins = Math.floor((now - d) / 60000)
    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  // Conversation list view
  if (!activeChat) {
    return (
      <div>
        <div className="panel-header">
          <div className="panel-title">Sarunas</div>
          <div className="panel-subtitle">Rakstiet saviem draugiem</div>
        </div>

        {conversations.length === 0 ? (
          <div className="empty-state">
            <span className="emoji">&#128172;</span>
            V&#275;l nav sarunu.<br />Pievienojiet draugu un s&#257;ciet sarun&#257;ties par kop&#299;go mantojumu.
          </div>
        ) : (
          <div className="chat-list">
            {conversations.map(c => {
              const prof = profiles[c.partnerId]
              const name = prof?.display_name || 'Unknown'
              return (
                <div key={c.partnerId} className="chat-thread-item" onClick={() => setActiveChat({ userId: c.partnerId, displayName: name })}>
                  <div className="friend-avatar">{name[0].toUpperCase()}</div>
                  <div className="chat-thread-preview">
                    <div className="chat-thread-name">{name}</div>
                    {c.lastMessage && <div className="chat-thread-last">{c.lastMessage}</div>}
                  </div>
                  {c.lastAt && <div className="chat-thread-time">{formatTime(c.lastAt)}</div>}
                  {c.unread && <div className="chat-unread-dot" />}
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Message thread view
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="chat-header">
        <button className="chat-back-btn" onClick={() => { setActiveChat(null); loadConversations() }}>←</button>
        <div className="friend-avatar" style={{ width: 28, height: 28, fontSize: '.7rem' }}>{activeChat.displayName[0].toUpperCase()}</div>
        <div className="chat-thread-name">{activeChat.displayName}</div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--ink-light)', fontSize: '.82rem', padding: '32px 16px' }}>
            V&#275;l nav zi&#326;u. Sakiet sveiki!
          </div>
        )}
        {messages.map((m, i) => (
          <div key={m.id || i} className={`chat-bubble ${m.sender_id === user.id ? 'mine' : 'theirs'}`}>
            {m.body}
            <div className="chat-bubble-time">{formatTime(m.created_at)}</div>
          </div>
        ))}
        <div ref={msgsEndRef} />
      </div>

      <div className="chat-input-bar">
        <textarea
          className="chat-input"
          placeholder="Rakst&#299;t zi&#326;u..."
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
          rows={1}
        />
        <button className="chat-send-btn" onClick={sendMessage} disabled={sending || !newMsg.trim()}>S&#363;t&#299;t</button>
      </div>
    </div>
  )
}
