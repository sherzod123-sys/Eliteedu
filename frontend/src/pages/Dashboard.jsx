import api from '../services/api';
import React, { useEffect, useState, useMemo, useCallback, createContext, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import {
  BookOpen, Trophy, Moon, Sun, LogOut, LayoutDashboard, Settings, Zap, MoreVertical,
  Layers, Award, PlayCircle, FileText, CheckCircle2, AlertCircle, X, Upload, Star,
  Medal, Crown, ChevronRight, ArrowLeft, Video, AlertTriangle, Keyboard,
  Flame, RotateCcw, Users, Send, Check, XCircle, MessageCircle, Search, Paperclip,
  Plus, Mic, MicOff, Square, Pin, PinOff, Share2, Forward, Radio, VideoOff, Users2,
  Bell, Eye
} from 'lucide-react';

// ─── CONFIG ───────────────────────────────────────────────
const WS_BASE = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/ws/chat';
const WS_HOST = window.location.host;

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('access_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
}, e => Promise.reject(e));

api.interceptors.response.use(r => r, e => {
  if (e.response?.status === 401) {
    toast.error('Sessiya tugadi. Qayta kiring!');
    localStorage.clear();
    window.location.href = '/login';
  }
  return Promise.reject(e);
});

// ─── HELPERS ──────────────────────────────────────────────
const getYouTubeEmbedUrl = url => {
  if (!url) return null;
  try {
    let id = null;
    if (url.includes('youtube.com/watch?v='))   id = url.split('watch?v=')[1]?.split('&')[0];
    else if (url.includes('youtu.be/'))          id = url.split('youtu.be/')[1]?.split('?')[0];
    else if (url.includes('youtube.com/embed/')) return url;
    return id ? `https://www.youtube.com/embed/${id}?autoplay=0&rel=0&modestbranding=1` : url;
  } catch { return url; }
};

const fixAvatarUrl = url => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${url}`;
  return url;
};

const getAvatarSrc = (av, name = 'U') => {
  const f = fixAvatarUrl(av);
  return f || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`;
};

const fmtTime = d => d ? new Date(d).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : '';
const fmtSec  = s => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

// ─── Lesson type helpers ────────────────────────────────────
const QUIZ_TYPES = ['quiz', 'test', 'exam'];
const TASK_TYPES = ['assignment', 'task', 'homework', 'project'];
const VIDEO_TYPES = ['video', 'article', 'lesson', 'text', 'pdf', 'youtube'];

const isQuizLesson = l => {
  if (!l) return false;
  const t = (l.lesson_type || l.type || '').toLowerCase().trim();
  if (QUIZ_TYPES.includes(t)) return true;
  if (l.quiz && typeof l.quiz === 'object' && Array.isArray(l.quiz.questions) && l.quiz.questions.length > 0) return true;
  if (Array.isArray(l.questions) && l.questions.length > 0 && !l.video_url && !l.video && !l.content) return true;
  return false;
};

const isTaskLesson = l => {
  if (!l) return false;
  const t = (l.lesson_type || l.type || '').toLowerCase().trim();
  return TASK_TYPES.includes(t);
};

const isVideoLesson = l => {
  if (!l) return false;
  if (isQuizLesson(l)) return false;
  if (isTaskLesson(l)) return false;
  const t = (l.lesson_type || l.type || '').toLowerCase().trim();
  return VIDEO_TYPES.includes(t) || !t || !!l.video_url || !!l.video || !!l.content;
};

// ─── THEME ────────────────────────────────────────────────
const ThemeCtx = createContext();

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);
  return <ThemeCtx.Provider value={{ dark, toggle: () => setDark(p => !p) }}>{children}</ThemeCtx.Provider>;
};

export default function ImprovedLMS() { return <ThemeProvider><LMSContent /></ThemeProvider>; }

// ─── PREMIUM CSS ──────────────────────────────────────────
const premiumStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
  :root {
    --pr: #6366f1; --pr2: #4f46e5; --pr3: #818cf8;
    --ac: #f59e0b; --ac2: #ef4444; --ac3: #10b981;
    --bg: #f1f5f9; --bg2: #ffffff; --bg3: #e2e8f0;
    --tx: #0f172a; --tx2: #475569; --tx3: #94a3b8;
    --br: #e2e8f0; --sh: 0 4px 24px rgba(99,102,241,0.10);
    --r: 20px; --r2: 14px; --r3: 10px;
  }
  .dark {
    --bg: #0a0f1e; --bg2: #111827; --bg3: #1e2537;
    --tx: #f1f5f9; --tx2: #94a3b8; --tx3: #475569;
    --br: #1e293b; --sh: 0 4px 32px rgba(0,0,0,0.4);
  }
  * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
  h1,h2,h3,.font-display { font-family: 'Syne', sans-serif !important; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--pr3); border-radius: 99px; }
  .glass { background: rgba(255,255,255,0.08); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.12); }
  .dark .glass { background: rgba(15,23,42,0.7); border-color: rgba(99,102,241,0.15); }
  .glow { box-shadow: 0 0 30px rgba(99,102,241,0.35); }
  .glow-sm { box-shadow: 0 0 12px rgba(99,102,241,0.25); }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse-ring { 0%,100%{opacity:1} 50%{opacity:0.5} }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  .anim-up { animation: fadeUp .4s ease both; }
  .anim-up-1 { animation: fadeUp .4s .08s ease both; }
  .anim-up-2 { animation: fadeUp .4s .16s ease both; }
  .anim-up-3 { animation: fadeUp .4s .24s ease both; }
`;

// ─── SMALL UI COMPONENTS ──────────────────────────────────
const Loader = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 80, height: 80, border: '3px solid transparent', borderTopColor: 'var(--pr)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
      <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, color: 'var(--tx)', fontWeight: 800 }}>EliteLMS</h2>
      <p style={{ color: 'var(--tx3)', marginTop: 6, fontSize: 14 }}>Yuklanmoqda...</p>
    </div>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const SidebarItem = ({ icon, label, active, onClick, open, badge }) => (
  <button onClick={onClick} style={{
    width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: open ? '12px 16px' : '12px',
    borderRadius: 'var(--r2)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'all .2s',
    background: active ? 'linear-gradient(135deg, var(--pr), var(--pr2))' : 'transparent',
    color: active ? '#fff' : 'var(--tx2)', boxShadow: active ? 'var(--sh)' : 'none',
    justifyContent: open ? 'flex-start' : 'center'
  }}>
    <span style={{ position: 'relative', flexShrink: 0 }}>
      {icon}
      {badge > 0 && !open && (
        <span style={{ position: 'absolute', top: -4, right: -4, width: 14, height: 14, background: '#ef4444', color: '#fff', fontSize: 8, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{badge > 9 ? '9+' : badge}</span>
      )}
    </span>
    {open && <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>}
    {open && badge > 0 && (
      <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 800 }}>{badge}</span>
    )}
  </button>
);

const Card = ({ children, style, className, onClick, onMouseEnter, onMouseLeave }) => (
  <div onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
    style={{ background: 'var(--bg2)', border: '1px solid var(--br)', borderRadius: 'var(--r)', boxShadow: 'var(--sh)', ...style }} className={className}>
    {children}
  </div>
);

const Btn = ({ children, onClick, variant = 'primary', disabled, style, size = 'md' }) => {
  const base = { display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all .2s', opacity: disabled ? 0.5 : 1, fontFamily: 'DM Sans,sans-serif' };
  const sizes = { sm: { padding: '8px 16px', fontSize: 12, borderRadius: 'var(--r3)' }, md: { padding: '12px 22px', fontSize: 14, borderRadius: 'var(--r2)' }, lg: { padding: '15px 28px', fontSize: 16, borderRadius: 'var(--r)' } };
  const variants = {
    primary: { background: 'linear-gradient(135deg, var(--pr), var(--pr2))', color: '#fff', boxShadow: '0 4px 16px rgba(99,102,241,.3)' },
    danger:  { background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', boxShadow: '0 4px 16px rgba(239,68,68,.3)' },
    success: { background: 'linear-gradient(135deg, var(--ac3), #059669)', color: '#fff', boxShadow: '0 4px 16px rgba(16,185,129,.3)' },
    ghost:   { background: 'var(--bg3)', color: 'var(--tx2)' },
    outline: { background: 'transparent', color: 'var(--pr)', border: '1.5px solid var(--pr)' },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>{children}</button>;
};

const StatCard = ({ icon, label, value, color }) => {
  const gradients = { blue: 'linear-gradient(135deg,#6366f1,#4f46e5)', purple: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', green: 'linear-gradient(135deg,#10b981,#059669)', orange: 'linear-gradient(135deg,#f59e0b,#d97706)' };
  return (
    <Card style={{ padding: 24 }} className="anim-up">
      <div style={{ width: 52, height: 52, borderRadius: 'var(--r2)', background: gradients[color], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: 18 }}>{icon}</div>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--tx)', fontFamily: 'Syne,sans-serif' }}>{value}</p>
    </Card>
  );
};

const EmptyState = ({ message }) => (
  <Card style={{ padding: '64px 32px', textAlign: 'center' }}>
    <AlertCircle size={48} style={{ color: 'var(--tx3)', margin: '0 auto 16px' }} />
    <p style={{ color: 'var(--tx2)', fontWeight: 600 }}>{message}</p>
  </Card>
);

const OnlineBadge = ({ isOnline, lastSeen, style }) => {
  if (isOnline) return <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, ...style }}><span style={{ width: 7, height: 7, background: '#10b981', borderRadius: '50%', animation: 'pulse-ring 1.5s ease infinite', display: 'inline-block' }} />Online</span>;
  if (lastSeen) {
    const d = Date.now() - new Date(lastSeen).getTime(), m = Math.floor(d / 60000), h = Math.floor(d / 3600000), dd = Math.floor(d / 86400000);
    const l = m < 1 ? 'Hozirgina' : m < 60 ? `${m} daq oldin` : h < 24 ? `${h} soat oldin` : `${dd} kun oldin`;
    return <span style={{ fontSize: 11, color: 'var(--tx3)', ...style }}>{l}</span>;
  }
  return <span style={{ fontSize: 11, color: 'var(--tx3)', ...style }}>Offline</span>;
};

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡', '🔥', '👏', '🎉', '😍'];

const ForwardModal = ({ message, rooms, currentUserId, onForward, onClose }) => {
  const [sel, setSel] = useState([]);
  const toggle = id => setSel(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const getOther = r => (r.participants || []).find(p => p.id !== currentUserId) || { full_name: "Noma'lum" };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <Card style={{ maxWidth: 440, width: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--br)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 16, color: 'var(--tx)' }}>Forward</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx3)' }}><X size={18} /></button>
        </div>
        <div style={{ padding: 16, maxHeight: 280, overflowY: 'auto' }}>
          {rooms.map(r => { const o = getOther(r), isSel = sel.includes(r.id); return (
            <button key={r.id} onClick={() => toggle(r.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 'var(--r2)', border: `1.5px solid ${isSel ? 'var(--pr)' : 'var(--br)'}`, background: isSel ? 'rgba(99,102,241,.08)' : 'none', cursor: 'pointer', marginBottom: 6, transition: 'all .15s' }}>
              <img src={getAvatarSrc(o.avatar, o.full_name)} style={{ width: 38, height: 38, borderRadius: 'var(--r3)', objectFit: 'cover' }} alt="" />
              <span style={{ flex: 1, textAlign: 'left', fontWeight: 600, fontSize: 13, color: 'var(--tx)' }}>{o.full_name}</span>
              {isSel && <Check size={16} style={{ color: 'var(--pr)' }} />}
            </button>
          ); })}
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--br)', display: 'flex', gap: 10 }}>
          <Btn onClick={onClose} variant="ghost" style={{ flex: 1, justifyContent: 'center' }}>Bekor</Btn>
          <Btn onClick={() => { onForward(sel); onClose(); }} disabled={sel.length === 0} style={{ flex: 1, justifyContent: 'center' }}><Send size={14} />Yuborish ({sel.length})</Btn>
        </div>
      </Card>
    </div>
  );
};

function PinnedBar({ pins, onScrollTo, onUnpin }) {
  const [idx, setIdx] = useState(0);
  const total = pins.length;
  useEffect(() => { if (idx >= total && total > 0) setIdx(total - 1); }, [total, idx]);
  if (total === 0) return null;
  const cur = pins[idx] || pins[0];
  const preview = p => {
    if (!p) return '';
    if (p.message_type === 'voice') return '🎤 Ovozli';
    if (p.message_type === 'video') return '📹 Video';
    if (p.message_type === 'image') return '🖼 Rasm';
    if (p.message_type === 'file') return `📎 ${p.file_name || 'Fayl'}`;
    return p.content || '…';
  };
  return (
    <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--br)', background: 'rgba(245,158,11,.06)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
      {total > 1 && <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>{pins.map((_, i) => <button key={i} onClick={() => setIdx(i)} style={{ width: 3, height: i === idx ? 14 : 8, borderRadius: 99, background: i === idx ? '#f59e0b' : 'rgba(245,158,11,.3)', border: 'none', cursor: 'pointer', transition: 'all .2s' }} />)}</div>}
      <span>📌</span>
      <button onClick={() => onScrollTo(cur?.message_id)} style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', minWidth: 0 }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: '#f59e0b', marginBottom: 2 }}>{cur?.pinned_by || 'Pin'}{total > 1 && <span style={{ opacity: .7, fontWeight: 400 }}> ({idx + 1}/{total})</span>}</p>
        <p style={{ fontSize: 12, color: 'var(--tx2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{preview(cur)}</p>
      </button>
      {total > 1 && <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
        <button onClick={() => setIdx(i => (i - 1 + total) % total)} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b', fontSize: 14, fontWeight: 900 }}>‹</button>
        <button onClick={() => setIdx(i => (i + 1) % total)} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b', fontSize: 14, fontWeight: 900 }}>›</button>
      </div>}
      <button onClick={() => onUnpin(cur?.pin_id)} style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx3)', borderRadius: 'var(--r3)', transition: 'color .15s' }} onMouseEnter={e => e.target.style.color = '#ef4444'} onMouseLeave={e => e.target.style.color = 'var(--tx3)'}><X size={13} /></button>
    </div>
  );
}

// ─── WS HOOK ──────────────────────────────────────────────
function useChatSocket(roomId, onMsgRef) {
  const wsRef = useRef(null), recoRef = useRef(null);
  const onMsgRefLocal = useRef(onMsgRef);
  useEffect(() => { onMsgRefLocal.current = onMsgRef; }, [onMsgRef]);

  useEffect(() => {
    if (!roomId) return;
    const connect = () => {
      if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(); }
      const ws = new WebSocket(`${WS_BASE}/${roomId}/?token=${localStorage.getItem('access_token')}`);
      wsRef.current = ws;
      ws.onopen = () => {};
      ws.onmessage = e => { try { onMsgRefLocal.current?.current?.(JSON.parse(e.data)); } catch {} };
      ws.onclose = e => { if (e.code !== 1000) recoRef.current = setTimeout(connect, 3000); };
      ws.onerror = () => ws.close();
    };
    connect();
    return () => { clearTimeout(recoRef.current); if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(1000); } };
  }, [roomId]);
  return { send: useCallback(d => { if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify(d)); }, []) };
}

// ═══════════════════════════════════════════════════════════
//  STREAM VIEWER
// ═══════════════════════════════════════════════════════════
function StreamViewerPanel({ currentUser }) {
  const [streams, setStreams] = useState([]);
  const [active, setActive] = useState(null);
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState('');
  const [viewers, setViewers] = useState(0);
  const [wsOk, setWsOk] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vErr, setVErr] = useState(null);
  const wsRef = useRef(null), chatEndRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!cancelled) setLoading(true);
      try {
        const r = await api.get('/stream/live/');
        const data = Array.isArray(r.data?.results) ? r.data.results : Array.isArray(r.data) ? r.data : [];
        if (!cancelled) setStreams(data);
      } catch (e) { console.log(e); }
      finally { if (!cancelled) setLoading(false); }
    };
    load();
    const iv = setInterval(load, 15000);
    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  useEffect(() => {
    if (!active?.uid) return;
    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${WS_HOST}/ws/stream/${active.uid}/?token=${localStorage.getItem('access_token') || ''}`);
    wsRef.current = ws;
    ws.onopen = () => { setWsOk(true); setChat([]); };
    ws.onclose = () => setWsOk(false);
    ws.onerror = () => setWsOk(false);
    ws.onmessage = e => {
      try {
        const d = JSON.parse(e.data);
        if (d.type === 'chat') { setChat(p => [...p, d]); setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50); }
        if (d.type === 'viewer_count') setViewers(d.count);
        if (d.type === 'stream_event' && d.event === 'ended') { toast('Efir tugadi', { icon: '📺' }); setActive(p => p ? { ...p, status: 'ended' } : null); setStreams(p => p.filter(s => s.uid !== active.uid)); }
        if (d.type === 'reaction') setChat(p => [...p, { id: Date.now(), sender: d.sender, content: d.emoji, role: 'reaction', created_at: new Date().toISOString() }]);
      } catch {}
    };
    return () => { ws.close(1000); wsRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.uid]);

  const sendChat = useCallback(() => {
    const t = input.trim();
    if (!t || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: 'chat', content: t })); setInput('');
  }, [input]);

  const sendReact = useCallback(emoji => { if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return; wsRef.current.send(JSON.stringify({ type: 'reaction', emoji })); }, []);
  const join = useCallback(s => { setActive(s); setViewers(s.viewer_count || 0); setChat([]); setVErr(null); }, []);
  const leave = useCallback(() => { if (wsRef.current) { wsRef.current.close(1000); wsRef.current = null; } setActive(null); setChat([]); setWsOk(false); setVErr(null); }, []);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}><div style={{ width: 40, height: 40, border: '3px solid transparent', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>;

  if (active) {
    const isLive = active.status === 'live';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 10rem)', borderRadius: 'var(--r)', overflow: 'hidden', border: '1px solid var(--br)', background: 'var(--bg2)', boxShadow: 'var(--sh)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--br)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={leave} style={{ width: 36, height: 36, borderRadius: 'var(--r3)', border: 'none', background: 'var(--bg3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tx2)' }}><ArrowLeft size={18} /></button>
            <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', background: isLive ? '#ef4444' : 'var(--bg3)', color: isLive ? '#fff' : 'var(--tx3)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: isLive ? '#fff' : 'var(--tx3)' }} />{isLive ? 'JONLI' : 'TUGAGAN'}
            </span>
            <div>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 15, color: 'var(--tx)', margin: 0 }}>{active.title}</h3>
              <p style={{ fontSize: 11, color: 'var(--tx3)', margin: 0 }}>{active.teacher_name}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: 'rgba(99,102,241,.1)', color: 'var(--pr)' }}><Users2 size={12} />{viewers}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 99, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', background: wsOk ? 'rgba(16,185,129,.1)' : 'rgba(245,158,11,.1)', color: wsOk ? '#10b981' : '#f59e0b' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: wsOk ? '#10b981' : '#f59e0b' }} />{wsOk ? 'Ulangan' : 'Ulanmoqda'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#000' }}>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isLive && <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, display: 'flex', alignItems: 'center', gap: 6, background: '#ef4444', padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 800, color: '#fff', pointerEvents: 'none' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />LIVE</div>}
              <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,.6)', padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, color: '#fff', backdropFilter: 'blur(8px)', pointerEvents: 'none' }}><Users2 size={11} />{viewers}</div>
              {isLive
                ? vErr
                  ? <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, color: '#fff', textAlign: 'center', padding: 32 }}>
                    <AlertTriangle size={48} style={{ color: '#f59e0b' }} /><p style={{ fontSize: 16, fontWeight: 800 }}>{vErr}</p>
                    <Btn variant="danger" onClick={() => setVErr(null)}>Qayta urinish</Btn>
                  </div>
                  : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, color: '#fff', textAlign: 'center', padding: 32 }}>
                    <div style={{ width: 80, height: 80, background: 'rgba(239,68,68,.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Radio size={36} style={{ color: 'rgba(239,68,68,.8)' }} /></div>
                    <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18 }}>{active.title}</h3>
                    <p style={{ fontSize: 13, opacity: .6 }}>{active.teacher_name} tayyorlanmoqda...</p>
                  </div>
                : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,.3)' }}><VideoOff size={56} /><p style={{ fontWeight: 700, fontSize: 18 }}>Efir tugadi</p></div>
              }
            </div>
            {isLive && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 12, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)', flexShrink: 0 }}>
              {['👍', '❤️', '😂', '🔥', '👏', '🎉'].map(e => <button key={e} onClick={() => sendReact(e)} style={{ width: 38, height: 38, fontSize: 20, border: 'none', background: 'none', cursor: 'pointer', transition: 'transform .15s' }} onMouseEnter={ev => ev.target.style.transform = 'scale(1.3)'} onMouseLeave={ev => ev.target.style.transform = 'scale(1)'}>{e}</button>)}
            </div>}
          </div>
          <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--br)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--br)', flexShrink: 0 }}>
              <h4 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 13, margin: 0, color: 'var(--tx)' }}>Jonli Chat</h4>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', background: 'var(--bg)', gap: 6, display: 'flex', flexDirection: 'column' }}>
              {chat.length === 0 ? <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--tx3)', textAlign: 'center', padding: 32 }}><MessageCircle size={28} style={{ opacity: .2, marginBottom: 8 }} /><p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Hali xabar yo'q</p></div>
                : chat.map((m, i) => {
                  if (m.role === 'reaction') return <div key={m.id || i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--tx3)' }}><span style={{ fontSize: 16 }}>{m.content}</span><span>{m.sender}</span></div>;
                  const isMe = m.sender === (currentUser.full_name || 'Siz');
                  return (
                    <div key={m.id || i} style={{ display: 'flex', gap: 6, flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                      <div style={{ width: 24, height: 24, flexShrink: 0, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 9, background: m.role === 'teacher' ? '#ef4444' : 'var(--bg3)', color: m.role === 'teacher' ? '#fff' : 'var(--tx2)' }}>{(m.sender || '?')[0].toUpperCase()}</div>
                      <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                        <p style={{ fontSize: 9, fontWeight: 800, marginBottom: 2, color: m.role === 'teacher' ? '#ef4444' : 'var(--tx3)' }}>{m.sender}{m.role === 'teacher' ? ' 👨‍🏫' : ''}</p>
                        <div style={{ padding: '7px 12px', borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px', fontSize: 11, fontWeight: 500, background: isMe ? 'linear-gradient(135deg,var(--pr),var(--pr2))' : 'var(--bg2)', color: isMe ? '#fff' : 'var(--tx)', border: isMe ? 'none' : '1px solid var(--br)' }}>{m.content}</div>
                      </div>
                    </div>
                  );
                })}
              <div ref={chatEndRef} />
            </div>
            {isLive && <div style={{ padding: '10px 12px', borderTop: '1px solid var(--br)', background: 'var(--bg2)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 'var(--r2)', border: '1.5px solid var(--br)', background: 'var(--bg)' }}>
                <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendChat(); }} placeholder="Xabar..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'var(--tx)' }} />
                <button onClick={sendChat} disabled={!input.trim()} style={{ width: 30, height: 30, borderRadius: 'var(--r3)', background: input.trim() ? 'var(--pr)' : 'var(--bg3)', color: input.trim() ? '#fff' : 'var(--tx3)', border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}><Send size={12} /></button>
              </div>
            </div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ gap: 24, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'linear-gradient(135deg,#ef4444,#be123c,#9f1239)', padding: '48px 40px', borderRadius: 'var(--r)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <Radio style={{ position: 'absolute', right: -40, bottom: -40, width: 220, height: 220, opacity: .1, transform: 'rotate(12deg)' }} />
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 36, margin: '0 0 8px', position: 'relative' }}>Jonli Efirlar</h2>
        <p style={{ color: 'rgba(255,255,255,.7)', position: 'relative', margin: 0 }}>O'qituvchilaringizning jonli darslarini tomosha qiling</p>
      </div>
      {streams.length === 0 ? (
        <Card style={{ padding: '80px 32px', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, background: 'var(--bg3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><Radio size={36} style={{ color: 'var(--tx3)' }} /></div>
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--tx)', margin: '0 0 8px' }}>Hozircha jonli efir yo'q</h3>
          <p style={{ color: 'var(--tx3)', fontSize: 13 }}>O'qituvchi efir boshlaganda bu yerda ko'rinadi</p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
          {streams.map(s => (
            <Card key={s.id || s.uid} style={{ overflow: 'hidden', transition: 'all .2s', cursor: 'pointer' }} onMouseEnter={ev => ev.currentTarget.style.borderColor = 'var(--ac2)'} onMouseLeave={ev => ev.currentTarget.style.borderColor = 'var(--br)'}>
              <div style={{ height: 160, background: 'linear-gradient(135deg,#7f1d1d,#000)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ width: 72, height: 72, background: 'rgba(239,68,68,.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Radio size={30} style={{ color: 'rgba(239,68,68,.8)' }} /></div>
                <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 5, background: '#ef4444', padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 800, color: '#fff' }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />LIVE</div>
                <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,.6)', padding: '3px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, color: '#fff' }}><Users2 size={10} />{s.viewer_count || 0}</div>
              </div>
              <div style={{ padding: 20 }}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 16, margin: '0 0 4px', color: 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</h3>
                <p style={{ fontSize: 12, color: 'var(--tx3)', margin: '0 0 2px' }}>👨‍🏫 {s.teacher_name}</p>
                {s.course_title && <p style={{ fontSize: 11, color: 'var(--tx3)', margin: '0 0 14px' }}>📚 {s.course_title}</p>}
                <Btn onClick={() => join(s)} style={{ width: '100%', justifyContent: 'center' }}><Eye size={14} />Tomosha Qilish</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  CHAT PANEL
// ═══════════════════════════════════════════════════════════
function ChatPanel({ currentUser }) {
  const [rooms, setRooms] = useState([]), [activeRoom, setActiveRoom] = useState(null), [messages, setMessages] = useState([]);
  const [loadRooms, setLoadRooms] = useState(true), [loadMsgs, setLoadMsgs] = useState(false);
  const [input, setInput] = useState(''), [typing, setTyping] = useState(null);
  const [mobileChat, setMobileChat] = useState(false), [newChat, setNewChat] = useState(false);
  const [userQ, setUserQ] = useState(''), [userRes, setUserRes] = useState([]), [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false), [roomSearch, setRoomSearch] = useState('');
  const [replyTo, setReplyTo] = useState(null), [editing, setEditing] = useState(null);
  const [ctxMenu, setCtxMenu] = useState(null), [pinned, setPinned] = useState([]);
  const [fwdMsg, setFwdMsg] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState({});
  const [isRec, setIsRec] = useState(false), [recTime, setRecTime] = useState(0), [audioBlob, setAudioBlob] = useState(null), [audioUrl, setAudioUrl] = useState(null);
  const [isVidRec, setIsVidRec] = useState(false), [vidRecTime, setVidRecTime] = useState(0), [vidBlob, setVidBlob] = useState(null), [vidUrl, setVidUrl] = useState(null), [showVidPrev, setShowVidPrev] = useState(false);

  const endRef = useRef(null), typingTout = useRef(null), fileRef = useRef(null);
  const uqTimer = useRef(null), roomRef = useRef(null), chatRef = useRef(null), msgRefs = useRef({});
  const lpTimer = useRef(null), mediaRecRef = useRef(null), audioChunks = useRef([]), recTimer = useRef(null);
  const vidRecRef = useRef(null), vidChunks = useRef([]), vidTimer = useRef(null), vidPrevRef = useRef(null), vidStream = useRef(null), pingRef = useRef(null);

  useEffect(() => { roomRef.current = activeRoom; }, [activeRoom]);

  useEffect(() => {
    const ping = async () => { try { await api.post('/chat/online/', { is_online: true }); } catch {} };
    ping(); pingRef.current = setInterval(ping, 25000);
    return () => { clearInterval(pingRef.current); api.post('/chat/online/', { is_online: false }).catch(() => {}); };
  }, []);

  const onMsgFnRef = useRef(null);
  onMsgFnRef.current = useCallback(data => {
    const { type, message } = data;
    if (type === 'new_message') {
      if (!message) return;
      setMessages(prev => { const noTemp = prev.filter(m => !(typeof m.id === 'string' && m.id.startsWith('temp-') && m.content === message.content && m.sender?.id === message.sender?.id)); return noTemp.some(m => m.id === message.id) ? noTemp : [...noTemp, message]; });
      setRooms(prev => prev.map(r => r.id === roomRef.current?.id ? { ...r, last_message: message, unread_count: 0 } : r));
      return;
    }
    if (type === 'reaction_updated' && message) setMessages(prev => prev.map(m => m.id === message.id ? { ...m, reactions: message.reactions } : m));
    if (type === 'message_edited' && message) setMessages(prev => prev.map(m => m.id === message.id ? { ...m, content: message.content, is_edited: true } : m));
    if (type === 'message_deleted' && message) setMessages(prev => prev.map(m => m.id === message.id ? { ...m, is_deleted: true, content: '', file: null } : m));
    if (type === 'typing' && data.user_id !== currentUser.id) setTyping(data.is_typing ? data.username : null);
    if (type === 'messages_read') setMessages(prev => prev.map(m => ({ ...m, is_read: true })));
    if (type === 'message_pinned' && data.pin) setPinned(prev => prev.some(p => p.pin_id === data.pin.id || p.id === data.pin.id) ? prev : [{ ...data.pin, pin_id: data.pin.id }, ...prev]);
    if (type === 'message_unpinned') setPinned(prev => prev.filter(p => p.pin_id !== data.pin_id && p.id !== data.pin_id));
    if (type === 'user_status') setOnlineStatus(prev => ({ ...prev, [data.user_id]: { is_online: data.is_online, last_seen: data.last_seen } }));
  }, [currentUser.id]);

  const { send } = useChatSocket(activeRoom?.id, onMsgFnRef);

  useEffect(() => { fetchRooms(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);
  useEffect(() => {
    const close = () => setCtxMenu(null);
    window.addEventListener('click', close); return () => window.removeEventListener('click', close);
  }, []);

  const fetchRooms = async () => {
    try {
      setLoadRooms(true);
      const r = await api.get('/chat/rooms/'), d = r.data;
      setRooms(Array.isArray(d) ? d : Array.isArray(d?.results) ? d.results : Array.isArray(d?.rooms) ? d.rooms : []);
    } catch { setRooms([]); } finally { setLoadRooms(false); }
  };

  const openRoom = async room => {
    setActiveRoom(room); roomRef.current = room; setMobileChat(true); setMessages([]); setReplyTo(null); setEditing(null);
    try { const pr = await api.get(`/chat/rooms/${room.id}/pin/`); setPinned((pr.data || []).map(p => ({ ...p, pin_id: p.id }))); } catch { setPinned([]); }
    setLoadMsgs(true);
    try { const r = await api.get(`/chat/rooms/${room.id}/messages/`); const msgs = r.data?.results || r.data || []; setMessages(Array.isArray(msgs) ? msgs : []); setRooms(prev => prev.map(x => x.id === room.id ? { ...x, unread_count: 0 } : x)); }
    catch {} finally { setLoadMsgs(false); }
  };

  const getOther = useCallback(r => (r.participants || []).find(p => p.id !== currentUser.id) || { full_name: "Noma'lum", id: 0 }, [currentUser.id]);

  const deleteRoom = async r => {
    setCtxMenu(null); const o = getOther(r);
    if (!window.confirm(`"${o.full_name}" bilan chatni o'chirmoqchimisiz?`)) return;
    try { await api.delete(`/chat/rooms/${r.id}/`); setRooms(p => p.filter(x => x.id !== r.id)); if (activeRoom?.id === r.id) { setActiveRoom(null); setMessages([]); setMobileChat(false); } toast.success("Chat o'chirildi"); }
    catch { toast.error("O'chirishda xatolik"); }
  };

  const sendReact = (id, e) => { send({ type: 'react', message_id: id, emoji: e }); };
  const pinMsg = m => { setCtxMenu(null); send({ type: 'pin', message_id: m.id }); };
  const unpinMsg = id => { if (!id) return; send({ type: 'unpin', pin_id: id }); setPinned(p => p.filter(x => x.pin_id !== id)); };
  const doFwd = ids => { if (!fwdMsg) return; send({ type: 'forward', message_id: fwdMsg.id, room_ids: ids }); toast.success(`${ids.length} ta chatga yuborildi`); setFwdMsg(null); };

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
      const mr = new MediaRecorder(stream, { mimeType: mime }); mediaRecRef.current = mr; audioChunks.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) audioChunks.current.push(e.data); };
      mr.onstop = () => { const b = new Blob(audioChunks.current, { type: mr.mimeType || 'audio/webm' }); setAudioBlob(b); setAudioUrl(URL.createObjectURL(b)); stream.getTracks().forEach(t => t.stop()); };
      mr.start(100); setIsRec(true); setRecTime(0);
      recTimer.current = setInterval(() => setRecTime(p => { if (p >= 120) { stopRec(); return p; } return p + 1; }), 1000);
    } catch { toast.error("Mikrofonga ruxsat berilmadi!"); }
  };

  const stopRec = () => { if (mediaRecRef.current?.state === 'recording') mediaRecRef.current.stop(); clearInterval(recTimer.current); setIsRec(false); };
  const cancelRec = () => { if (mediaRecRef.current?.state === 'recording') mediaRecRef.current.stop(); clearInterval(recTimer.current); setIsRec(false); setAudioBlob(null); setAudioUrl(null); setRecTime(0); audioChunks.current = []; };

  const sendVoice = async () => {
    if (!audioBlob || !activeRoom) return;
    try {
      const ext = audioBlob.type.includes('ogg') ? 'ogg' : 'webm', fd = new FormData();
      fd.append('file', new File([audioBlob], `voice_${Date.now()}.${ext}`, { type: audioBlob.type }));
      fd.append('message_type', 'voice'); fd.append('content', ''); fd.append('duration', recTime || 0);
      if (replyTo?.id) fd.append('reply_to_id', replyTo.id);
      await api.post(`/chat/rooms/${activeRoom.id}/messages/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setReplyTo(null); cancelRec();
    } catch { toast.error('Voice xatosi'); }
  };

  const startVidRec = async () => {
    if (isRec || audioUrl) return;
    try {
      let stream; try { stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); } catch { stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); }
      vidStream.current = stream;
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : '';
      const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream); vidRecRef.current = mr; vidChunks.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) vidChunks.current.push(e.data); };
      mr.onstop = () => {
        if (vidStream.current) { vidStream.current.getTracks().forEach(t => t.stop()); vidStream.current = null; }
        if (vidPrevRef.current) { vidPrevRef.current.pause(); vidPrevRef.current.srcObject = null; }
        const b = new Blob(vidChunks.current, { type: mr.mimeType || 'video/webm' }); setVidBlob(b); setVidUrl(URL.createObjectURL(b)); setShowVidPrev(true);
      };
      setIsVidRec(true); setVidRecTime(0);
      setTimeout(() => { if (vidPrevRef.current && vidStream.current) { vidPrevRef.current.srcObject = vidStream.current; vidPrevRef.current.muted = true; vidPrevRef.current.play().catch(() => {}); } }, 100);
      mr.start(250);
      vidTimer.current = setInterval(() => setVidRecTime(p => { if (p >= 60) { stopVidRec(); return p; } return p + 1; }), 1000);
    } catch (e) { toast.error(`${e.name}: ${e.message}`); }
  };

  const stopVidRec = () => { if (vidRecRef.current?.state === 'recording') vidRecRef.current.stop(); clearInterval(vidTimer.current); setIsVidRec(false); };

  const cancelVid = () => {
    if (vidRecRef.current?.state === 'recording') vidRecRef.current.stop();
    if (vidStream.current) { vidStream.current.getTracks().forEach(t => t.stop()); vidStream.current = null; }
    if (vidPrevRef.current) { vidPrevRef.current.pause(); vidPrevRef.current.srcObject = null; }
    clearInterval(vidTimer.current); setIsVidRec(false); setVidBlob(null);
    if (vidUrl) URL.revokeObjectURL(vidUrl); setVidUrl(null); setShowVidPrev(false); setVidRecTime(0); vidChunks.current = [];
  };

  const sendVideo = async () => {
    if (!vidBlob || !activeRoom) return;
    try {
      const ext = vidBlob.type.includes('mp4') ? 'mp4' : 'webm', file = new File([vidBlob], `video_${Date.now()}.${ext}`, { type: vidBlob.type || 'video/webm' });
      const fd = new FormData(); fd.append('message_type', 'video'); fd.append('file', file); fd.append('content', ''); fd.append('duration', String(vidRecTime));
      if (replyTo?.id) fd.append('reply_to_id', String(replyTo.id));
      const r = await api.post(`/chat/rooms/${activeRoom.id}/send/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessages(p => [...p, r.data]); setReplyTo(null); cancelVid(); toast.success("Video yuborildi");
    } catch (e) { toast.error(e?.response?.data?.error || "Video xatosi"); }
  };

  const sendMsg = () => {
    const t = input.trim(); if (!t || !activeRoom) return;
    if (editing) { setMessages(p => p.map(m => m.id === editing.id ? { ...m, content: t, is_edited: true } : m)); send({ type: 'edit', message_id: editing.id, content: t }); setEditing(null); setInput(''); return; }
    const tmp = { id: `temp-${Date.now()}`, sender: { id: currentUser.id, full_name: currentUser.full_name, avatar: currentUser.avatar }, content: t, message_type: 'text', reply_to: replyTo ? { ...replyTo } : null, reactions: {}, is_deleted: false, is_edited: false, is_read: false, created_at: new Date().toISOString() };
    setMessages(p => [...p, tmp]); setInput(''); setReplyTo(null);
    send({ type: 'text', content: t, reply_to_id: replyTo?.id || null }); send({ type: 'typing', is_typing: false });
  };

  const deleteMsg = m => { setCtxMenu(null); if (m.sender?.id !== currentUser.id) return; setMessages(p => p.map(x => x.id === m.id ? { ...x, is_deleted: true, content: '', file: null } : x)); send({ type: 'delete', message_id: m.id }); };
  const startReply = m => { setCtxMenu(null); setEditing(null); setReplyTo({ id: m.id, content: m.content, file_name: m.file_name, message_type: m.message_type, sender: m.sender }); chatRef.current?.focus(); };
  const startEdit = m => { setCtxMenu(null); setReplyTo(null); setEditing({ id: m.id, original: m.content }); setInput(m.content); chatRef.current?.focus(); };
  const scrollTo = id => { const el = msgRefs.current[id]; if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.style.outline = '2px solid var(--pr)'; setTimeout(() => el.style.outline = 'none', 1500); } };

  const openCtx = (e, m) => {
    if (m.is_deleted) return; e.preventDefault(); e.stopPropagation();
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 100, y = e.clientY ?? e.touches?.[0]?.clientY ?? 100;
    setCtxMenu({ x: Math.min(x, window.innerWidth - 200), y: Math.min(y, window.innerHeight - 220), message: m });
  };

  const onInputChange = e => {
    setInput(e.target.value); if (!activeRoom) return;
    send({ type: 'typing', is_typing: true }); clearTimeout(typingTout.current);
    typingTout.current = setTimeout(() => send({ type: 'typing', is_typing: false }), 2000);
  };

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }
    if (e.key === 'Escape') { setReplyTo(null); setEditing(null); setInput(''); }
  };

  const uploadFile = async e => {
    const f = e.target.files?.[0]; if (!f || !activeRoom) return;
    try {
      const fd = new FormData(); fd.append('file', f); fd.append('message_type', f.type.startsWith('image/') ? 'image' : 'file'); fd.append('content', f.name);
      if (replyTo?.id) fd.append('reply_to_id', replyTo.id);
      await api.post(`/chat/rooms/${activeRoom.id}/messages/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); setReplyTo(null);
    } catch { toast.error('Upload xatosi'); }
    e.target.value = '';
  };

  const searchUsers = async q => {
    if (!q || q.trim().length < 2) { setUserRes([]); return; } setSearching(true);
    try { const r = await api.get('/users/search/', { params: { q: q.trim() } }); setUserRes((r.data?.results || r.data || []).filter(u => u.id !== currentUser.id)); }
    catch { setUserRes([]); } finally { setSearching(false); }
  };

  const startChat = async u => {
    const ex = rooms.find(r => (r.participants || []).some(p => p.id === u.id));
    if (ex) { openRoom(ex); closeNC(); return; }
    setCreating(true);
    try { const r = await api.post('/chat/rooms/', { participant_id: u.id }); setRooms(p => [r.data, ...p]); openRoom(r.data); closeNC(); }
    catch { toast.error('Chat xatosi!'); } finally { setCreating(false); }
  };

  const closeNC = () => { setNewChat(false); setUserQ(''); setUserRes([]); };

  const fmtDate = useCallback(d => {
    if (!d) return ''; const dt = new Date(d), now = new Date(), yd = new Date(now); yd.setDate(yd.getDate() - 1);
    return dt.toDateString() === now.toDateString() ? 'Bugun' : dt.toDateString() === yd.toDateString() ? 'Kecha' : dt.toLocaleDateString('uz-UZ');
  }, []);

  const getStatus = useCallback(r => { const o = getOther(r); return onlineStatus[o.id] || { is_online: o.is_online || false, last_seen: o.last_seen }; }, [getOther, onlineStatus]);

  const filteredRooms = useMemo(() => rooms.filter(r => { if (!roomSearch) return true; const o = getOther(r); return o.full_name?.toLowerCase().includes(roomSearch.toLowerCase()) || o.username?.toLowerCase().includes(roomSearch.toLowerCase()); }), [rooms, roomSearch, getOther]);

  const totalUnread = useMemo(() => rooms.reduce((s, r) => s + (r.unread_count || 0), 0), [rooms]);

  const groupedMsgs = useMemo(() => {
    const g = []; let cur = null;
    messages.forEach(m => { const ds = fmtDate(m.created_at); if (ds !== cur) { g.push({ type: 'date', label: ds }); cur = ds; } g.push({ type: 'msg', data: m }); });
    return g;
  }, [messages, fmtDate]);

  const mediaActive = isRec || !!audioUrl || isVidRec || showVidPrev;

  const S = {
    wrap: { display: 'flex', height: 'calc(100vh - 8rem)', borderRadius: 'var(--r)', overflow: 'hidden', border: '1px solid var(--br)', background: 'var(--bg2)', boxShadow: 'var(--sh)' },
    sidebar: { display: mobileChat ? 'none' : 'flex', flexDirection: 'column', width: 300, borderRight: '1px solid var(--br)', flexShrink: 0 },
    chat: { display: !mobileChat ? 'none' : 'flex', flexDirection: 'column', flex: 1 },
  };

  void [Pin, PinOff, Share2, Forward, Star];

  return (
    <div style={S.wrap}>
      {ctxMenu && (
        <div style={{ position: 'fixed', zIndex: 200, background: 'var(--bg2)', border: '1px solid var(--br)', borderRadius: 'var(--r2)', boxShadow: '0 8px 32px rgba(0,0,0,.15)', padding: 6, minWidth: 190, overflow: 'hidden', top: ctxMenu.y, left: ctxMenu.x }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', gap: 4, padding: '6px 8px 8px', borderBottom: '1px solid var(--br)' }}>
            {REACTIONS.slice(0, 6).map(e => <button key={e} onClick={() => { sendReact(ctxMenu.message.id, e); setCtxMenu(null); }} style={{ width: 32, height: 32, fontSize: 16, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 'var(--r3)', transition: 'background .15s' }} onMouseEnter={ev => ev.target.style.background = 'var(--bg3)'} onMouseLeave={ev => ev.target.style.background = 'none'}>{e}</button>)}
          </div>
          {[['↩️', 'Javob', () => startReply(ctxMenu.message)], ['↪️', 'Forward', () => { setCtxMenu(null); setFwdMsg(ctxMenu.message); }], ['📌', 'Pin', () => pinMsg(ctxMenu.message)]].map(([icon, label, fn]) => (
            <button key={label} onClick={fn} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--tx)', transition: 'background .15s' }} onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={ev => ev.currentTarget.style.background = 'none'}><span>{icon}</span>{label}</button>
          ))}
          {ctxMenu.message.sender?.id === currentUser.id && !ctxMenu.message.is_deleted && (<>
            {ctxMenu.message.message_type === 'text' && <button onClick={() => startEdit(ctxMenu.message)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--tx)', transition: 'background .15s' }} onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={ev => ev.currentTarget.style.background = 'none'}><span>✏️</span>Tahrirlash</button>}
            <button onClick={() => deleteMsg(ctxMenu.message)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#ef4444', transition: 'background .15s' }} onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(239,68,68,.06)'} onMouseLeave={ev => ev.currentTarget.style.background = 'none'}><span>🗑️</span>O'chirish</button>
          </>)}
        </div>
      )}
      {fwdMsg && <ForwardModal message={fwdMsg} rooms={rooms.filter(r => r.id !== activeRoom?.id)} currentUserId={currentUser.id} onForward={doFwd} onClose={() => setFwdMsg(null)} />}

      <div style={{ ...S.sidebar }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--br)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--tx)', margin: 0 }}>Xabarlar</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {totalUnread > 0 && <span style={{ background: 'var(--pr)', color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 800 }}>{totalUnread}</span>}
              <button onClick={() => newChat ? closeNC() : setNewChat(true)} style={{ width: 32, height: 32, borderRadius: 'var(--r3)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: newChat ? 'var(--pr)' : 'var(--bg3)', color: newChat ? '#fff' : 'var(--tx2)', transition: 'all .2s' }}><Plus size={16} /></button>
            </div>
          </div>
          {newChat ? (
            <div>
              <div style={{ position: 'relative', marginBottom: 4 }}>
                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--pr)' }} />
                <input autoFocus type="text" placeholder="Username yoki ism..." value={userQ} onChange={e => { setUserQ(e.target.value); clearTimeout(uqTimer.current); uqTimer.current = setTimeout(() => searchUsers(e.target.value), 400); }} style={{ width: '100%', padding: '9px 9px 9px 32px', borderRadius: 'var(--r2)', border: '1.5px solid var(--pr)', background: 'rgba(99,102,241,.06)', fontSize: 12, color: 'var(--tx)', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <p style={{ fontSize: 10, color: 'var(--tx3)', marginLeft: 4, marginBottom: 8 }}>Kamida 2 ta belgi</p>
              {searching && <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 11, color: 'var(--tx3)' }}><div style={{ width: 14, height: 14, border: '2px solid var(--pr)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />Qidirilmoqda...</div>}
              {!searching && userQ.length >= 2 && userRes.length === 0 && <div style={{ padding: '14px 0', textAlign: 'center', fontSize: 12, color: 'var(--tx3)' }}>Topilmadi: "{userQ}"</div>}
              {userRes.length > 0 && <div style={{ marginTop: 4, maxHeight: 220, overflowY: 'auto', borderRadius: 'var(--r2)', border: '1px solid var(--br)' }}>
                {userRes.map(u => <button key={u.id} onClick={() => !creating && startChat(u)} disabled={creating} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: 'none', borderBottom: '1px solid var(--br)', background: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background .15s' }} onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={ev => ev.currentTarget.style.background = 'none'}>
                  <img src={getAvatarSrc(u.avatar, u.full_name || u.username)} style={{ width: 36, height: 36, borderRadius: 'var(--r3)', objectFit: 'cover', flexShrink: 0 }} alt="" />
                  <div style={{ flex: 1, minWidth: 0 }}><p style={{ fontWeight: 700, fontSize: 12, color: 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.full_name || u.username}</p>{u.username && <p style={{ fontSize: 10, color: 'var(--tx3)' }}> @{u.username}</p>}</div>
                  <div style={{ width: 26, height: 26, borderRadius: 'var(--r3)', background: 'var(--pr)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageCircle size={12} style={{ color: '#fff' }} /></div>
                </button>)}
              </div>}
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--tx3)' }} />
              <input type="text" placeholder="Suhbatlarni qidirish..." value={roomSearch} onChange={e => setRoomSearch(e.target.value)} style={{ width: '100%', padding: '9px 9px 9px 32px', borderRadius: 'var(--r2)', border: '1px solid var(--br)', background: 'var(--bg3)', fontSize: 12, color: 'var(--tx)', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          )}
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {!newChat && (loadRooms ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div style={{ width: 28, height: 28, border: '2px solid var(--pr)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} /></div>
            : filteredRooms.length > 0 ? filteredRooms.map(room => {
              const o = getOther(room), st = getStatus(room), isAct = activeRoom?.id === room.id, last = room.last_message;
              return (
                <div key={room.id} style={{ position: 'relative', display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--br)', background: isAct ? 'rgba(99,102,241,.07)' : 'none', borderLeft: isAct ? '3px solid var(--pr)' : '3px solid transparent', transition: 'all .15s' }}>
                  <button onClick={() => openRoom(room)} style={{ flex: 1, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }} onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={ev => ev.currentTarget.style.background = 'none'}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img src={getAvatarSrc(o.avatar, o.full_name)} style={{ width: 44, height: 44, borderRadius: 'var(--r2)', objectFit: 'cover' }} alt="" />
                      <div style={{ position: 'absolute', bottom: -2, right: -2, width: 11, height: 11, border: '2px solid var(--bg2)', borderRadius: '50%', background: st.is_online ? '#10b981' : 'var(--tx3)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.full_name}</span>
                        <span style={{ fontSize: 10, color: 'var(--tx3)', flexShrink: 0, marginLeft: 6 }}>{fmtTime(last?.created_at)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ fontSize: 11, color: 'var(--tx3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>{last?.is_deleted ? '🗑 Oʼchirildi' : last?.message_type === 'voice' ? '🎤 Ovozli' : last?.message_type === 'video' ? '📹 Video' : (last?.sender?.id === currentUser.id ? '✓ ' : '') + (last?.content || "Xabar yo'q")}</p>
                        {room.unread_count > 0 && <span style={{ marginLeft: 6, background: 'var(--pr)', color: '#fff', fontSize: 9, padding: '1px 6px', borderRadius: 99, fontWeight: 800, flexShrink: 0 }}>{room.unread_count}</span>}
                      </div>
                    </div>
                  </button>
                  <button onClick={() => deleteRoom(room)} style={{ padding: '6px 10px', marginRight: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx3)', borderRadius: 'var(--r3)', opacity: 0, transition: 'all .15s' }} onMouseEnter={ev => { ev.currentTarget.style.opacity = '1'; ev.currentTarget.style.color = '#ef4444'; }} onMouseLeave={ev => { ev.currentTarget.style.opacity = '0'; ev.currentTarget.style.color = 'var(--tx3)'; }}>
                    <X size={14} />
                  </button>
                </div>
              );
            })
              : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center' }}>
                <MessageCircle size={40} style={{ color: 'var(--tx3)', marginBottom: 12, opacity: .4 }} />
                <p style={{ fontWeight: 700, color: 'var(--tx3)', fontSize: 13 }}>{roomSearch ? `"${roomSearch}" topilmadi` : "Hali suhbatlar yo'q"}</p>
                <p style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 4 }}>Yangi chat uchun <span style={{ color: 'var(--pr)', fontWeight: 700 }}>+</span> bosing</p>
              </div>)}
        </div>
      </div>

      <div style={S.chat}>
        {activeRoom ? (
          <>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--br)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg2)', flexShrink: 0 }}>
              <button onClick={() => setMobileChat(false)} style={{ width: 34, height: 34, borderRadius: 'var(--r3)', border: 'none', background: 'var(--bg3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tx2)' }}><ArrowLeft size={16} /></button>
              {(() => { const o = getOther(activeRoom), st = getStatus(activeRoom); return (<>
                <div style={{ position: 'relative' }}>
                  <img src={getAvatarSrc(o.avatar, o.full_name)} style={{ width: 40, height: 40, borderRadius: 'var(--r2)', objectFit: 'cover' }} alt="" />
                  <div style={{ position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, border: '2px solid var(--bg2)', borderRadius: '50%', background: st.is_online ? '#10b981' : 'var(--tx3)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 800, fontSize: 14, color: 'var(--tx)', margin: 0 }}>{o.full_name}</h3>
                  {typing ? <span style={{ fontSize: 11, color: 'var(--pr)', fontWeight: 700 }}>{typing} yozmoqda...</span> : <OnlineBadge isOnline={st.is_online} lastSeen={st.last_seen} />}
                </div>
                <button onClick={() => deleteRoom(activeRoom)} style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx3)', borderRadius: 'var(--r3)', transition: 'color .15s' }} onMouseEnter={ev => ev.target.style.color = '#ef4444'} onMouseLeave={ev => ev.target.style.color = 'var(--tx3)'}><X size={18} /></button>
              </>); })()}
            </div>
            <PinnedBar pins={pinned} onScrollTo={scrollTo} onUnpin={unpinMsg} />
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 2, background: 'var(--bg)' }}>
              {loadMsgs ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div style={{ width: 28, height: 28, border: '2px solid var(--pr)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} /></div>
                : groupedMsgs.map((item, idx) => {
                  if (item.type === 'date') return (
                    <div key={`d${idx}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
                      <div style={{ flex: 1, height: 1, background: 'var(--br)' }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', padding: '3px 12px', background: 'var(--bg2)', border: '1px solid var(--br)', borderRadius: 99 }}>{item.label}</span>
                      <div style={{ flex: 1, height: 1, background: 'var(--br)' }} />
                    </div>
                  );
                  const msg = item.data, mine = msg.sender?.id === currentUser.id, rxns = msg.reactions || {};
                  return (
                    <div key={msg.id} ref={el => { if (el) msgRefs.current[msg.id] = el; }}
                      style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 2, position: 'relative' }}
                      onContextMenu={e => openCtx(e, msg)} onTouchStart={e => { lpTimer.current = setTimeout(() => openCtx(e, msg), 500); }} onTouchEnd={() => clearTimeout(lpTimer.current)} onTouchMove={() => clearTimeout(lpTimer.current)}>
                      {!mine && <img src={getAvatarSrc(msg.sender?.avatar, msg.sender?.full_name)} style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'cover', marginRight: 8, marginTop: 'auto', flexShrink: 0 }} alt="" />}
                      <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
                        {!mine && <span style={{ fontSize: 10, color: 'var(--tx3)', fontWeight: 700, marginBottom: 3, marginLeft: 4 }}>{msg.sender?.full_name}</span>}
                        {msg.forwarded_from && !msg.is_deleted && <div style={{ fontSize: 9, fontWeight: 800, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--tx3)' }}><span>↪️</span>Forward: {msg.forwarded_from.sender?.full_name || "Noma'lum"}</div>}
                        <div style={{
                          position: 'relative', padding: msg.message_type === 'video' && msg.file && !msg.is_deleted ? 0 : '10px 14px',
                          borderRadius: mine ? '16px 16px 3px 16px' : '16px 16px 16px 3px',
                          background: msg.is_deleted ? 'var(--bg3)' : mine ? 'linear-gradient(135deg, var(--pr), var(--pr2))' : 'var(--bg2)',
                          color: msg.is_deleted ? 'var(--tx3)' : mine ? '#fff' : 'var(--tx)',
                          border: msg.is_deleted ? 'none' : mine ? 'none' : '1px solid var(--br)',
                          boxShadow: mine ? '0 2px 12px rgba(99,102,241,.25)' : 'var(--sh)',
                          fontStyle: msg.is_deleted ? 'italic' : 'normal', overflow: msg.message_type === 'video' && msg.file && !msg.is_deleted ? 'hidden' : 'visible'
                        }}>
                          {msg.reply_to && !msg.is_deleted && <button onClick={() => scrollTo(msg.reply_to.id)} style={{ width: '100%', textAlign: 'left', marginBottom: 8, background: 'none', cursor: 'pointer', padding: '0 0 0 10px', border: 'none', borderLeft: `2.5px solid ${mine ? 'rgba(255,255,255,.5)' : 'var(--pr)'}` }}>
                            <p style={{ fontSize: 10, fontWeight: 800, color: mine ? 'rgba(255,255,255,.7)' : 'var(--pr)', margin: '0 0 2px' }}>{msg.reply_to.sender?.full_name || 'Kim'}</p>
                            <p style={{ fontSize: 11, color: mine ? 'rgba(255,255,255,.6)' : 'var(--tx3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160, margin: 0 }}>{msg.reply_to.is_deleted ? '🗑' : msg.reply_to.message_type === 'voice' ? '🎤' : msg.reply_to.message_type === 'video' ? '📹' : msg.reply_to.message_type !== 'text' ? `📎 ${msg.reply_to.file_name}` : msg.reply_to.content}</p>
                          </button>}
                          {msg.is_deleted ? <p style={{ fontSize: 12, margin: 0 }}>🗑 Xabar o'chirildi</p>
                            : msg.message_type === 'image' && msg.file ? <img src={msg.file} alt="rasm" style={{ maxWidth: 200, borderRadius: 'var(--r2)', display: 'block' }} />
                              : msg.message_type === 'voice' && msg.file ? <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 200, maxWidth: 260 }}>
                                <Mic size={14} style={{ color: mine ? 'rgba(255,255,255,.7)' : 'var(--pr)', flexShrink: 0 }} /><audio controls src={msg.file} style={{ flex: 1, height: 28, minWidth: 0 }} />{msg.duration > 0 && <span style={{ fontSize: 9, flexShrink: 0, color: mine ? 'rgba(255,255,255,.6)' : 'var(--tx3)' }}>{fmtSec(msg.duration)}</span>}
                              </div>
                                : msg.message_type === 'video' && msg.file ? <div style={{ width: 280, aspectRatio: '16/9', background: '#000', position: 'relative' }}>
                                  <video src={msg.file} controls playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                  {msg.duration > 0 && <div style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(0,0,0,.6)', borderRadius: 6, padding: '2px 7px' }}><span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>📹 {fmtSec(msg.duration)}</span></div>}
                                </div>
                                  : msg.message_type === 'file' && msg.file ? <a href={msg.file} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: mine ? '#fff' : 'var(--pr)', textDecoration: 'underline' }}><FileText size={14} />{msg.file_name || 'Fayl'}</a>
                                    : <p style={{ fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap', margin: 0 }}>{msg.content}</p>}
                        </div>
                        {!msg.is_deleted && Object.keys(rxns).length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4, justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                            {Object.entries(rxns).map(([e, d]) => <button key={e} onClick={() => sendReact(msg.id, e)} title={d.users?.join(', ')} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 99, border: '1px solid var(--br)', background: 'var(--bg2)', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: 'var(--tx2)' }}><span>{e}</span>{d.count}</button>)}
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, flexDirection: mine ? 'row-reverse' : 'row' }}>
                          <span style={{ fontSize: 9, color: 'var(--tx3)' }}>{fmtTime(msg.created_at)}</span>
                          {msg.is_edited && !msg.is_deleted && <span style={{ fontSize: 9, color: 'var(--tx3)', fontStyle: 'italic' }}>tahrirlangan</span>}
                          {mine && !msg.is_deleted && <span style={{ fontSize: 9, color: msg.is_read ? 'var(--pr)' : 'var(--tx3)' }}>{msg.is_read ? '✓✓' : '✓'}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              {messages.length === 0 && !loadMsgs && <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48 }}><MessageCircle size={40} style={{ color: 'var(--tx3)', opacity: .3, marginBottom: 12 }} /><p style={{ color: 'var(--tx3)', fontWeight: 700 }}>Birinchi xabarni yuboring!</p></div>}
              {typing && <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 40 }}>
                <div style={{ padding: '10px 14px', borderRadius: '14px 14px 14px 3px', background: 'var(--bg2)', border: '1px solid var(--br)' }}>
                  <div style={{ display: 'flex', gap: 4 }}>{[0, 150, 300].map(d => <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--tx3)', animation: `pulse-ring 1.2s ${d}ms ease infinite`, display: 'inline-block' }} />)}</div>
                </div>
              </div>}
              <div ref={endRef} />
            </div>
            {(replyTo || editing) && <div style={{ padding: '8px 16px', borderTop: `1px solid ${editing ? 'rgba(16,185,129,.3)' : 'rgba(99,102,241,.3)'}`, background: editing ? 'rgba(16,185,129,.06)' : 'rgba(99,102,241,.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, paddingLeft: 10, borderLeft: `3px solid ${editing ? '#10b981' : 'var(--pr)'}` }}>
                <p style={{ fontSize: 10, fontWeight: 800, color: editing ? '#10b981' : 'var(--pr)', marginBottom: 2 }}>{editing ? '✏️ Tahrirlash' : `↩️ ${replyTo?.sender?.full_name || 'Javob'}`}</p>
                <p style={{ fontSize: 11, color: 'var(--tx3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{editing ? editing.original : replyTo?.message_type === 'voice' ? '🎤' : replyTo?.message_type === 'video' ? '📹' : replyTo?.message_type !== 'text' ? `📎 ${replyTo?.file_name}` : replyTo?.content}</p>
              </div>
              <button onClick={() => { setReplyTo(null); setEditing(null); setInput(''); }} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx3)' }}><X size={14} /></button>
            </div>}
            <div style={{ padding: '12px 14px', borderTop: '1px solid var(--br)', background: 'var(--bg2)', flexShrink: 0 }}>
              {isVidRec && <div style={{ marginBottom: 10, borderRadius: 'var(--r2)', overflow: 'hidden', border: '2px solid #ef4444', background: '#000', aspectRatio: '16/9', maxHeight: 200, position: 'relative' }}>
                <video ref={vidPrevRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,.6)', borderRadius: 10, padding: '4px 10px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse-ring 1s ease infinite' }} /><span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{fmtSec(vidRecTime)} / 1:00</span></div>
                <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 10 }}>
                  <Btn variant="ghost" size="sm" onClick={cancelVid}><X size={12} />Bekor</Btn>
                  <Btn variant="danger" size="sm" onClick={stopVidRec}><Square size={12} />To'xtat</Btn>
                </div>
              </div>}
              {showVidPrev && vidUrl && !isVidRec && <div style={{ marginBottom: 10, borderRadius: 'var(--r2)', overflow: 'hidden', border: '2px solid var(--pr)', background: '#000', aspectRatio: '16/9', maxHeight: 200, position: 'relative' }}>
                <video src={vidUrl} controls playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={cancelVid} style={{ position: 'absolute', top: 6, right: 6, padding: 4, background: 'rgba(0,0,0,.6)', border: 'none', cursor: 'pointer', borderRadius: 'var(--r3)', color: '#fff' }}><X size={12} /></button>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 12px', background: 'linear-gradient(to top,rgba(0,0,0,.8),transparent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>📹 {fmtSec(vidRecTime)}</span>
                  <Btn size="sm" onClick={sendVideo}><Send size={12} />Yuborish</Btn>
                </div>
              </div>}
              {audioUrl && !isRec && <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, padding: '10px 12px', background: 'rgba(99,102,241,.08)', borderRadius: 'var(--r2)', border: '1px solid rgba(99,102,241,.2)' }}>
                <audio controls src={audioUrl} style={{ flex: 1, height: 28, minWidth: 0 }} /><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--pr)', flexShrink: 0 }}>{fmtSec(recTime)}</span>
                <button onClick={cancelRec} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><X size={14} /></button>
                <button onClick={sendVoice} style={{ width: 34, height: 34, borderRadius: 'var(--r3)', background: 'var(--pr)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Send size={14} /></button>
              </div>}
              {isRec && <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, padding: '10px 12px', background: 'rgba(239,68,68,.08)', borderRadius: 'var(--r2)', border: '1px solid rgba(239,68,68,.2)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', animation: 'pulse-ring 1s ease infinite', flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', flex: 1 }}>Yozilmoqda... {fmtSec(recTime)}</span>
                <button onClick={cancelRec} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx3)' }}><X size={14} /></button>
                <button onClick={stopRec} style={{ width: 32, height: 32, borderRadius: 'var(--r3)', background: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Square size={14} /></button>
              </div>}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                <input type="file" ref={fileRef} onChange={uploadFile} style={{ display: 'none' }} />
                {[{ icon: <Paperclip size={18} />, onClick: () => fileRef.current?.click(), disabled: mediaActive }, { icon: <Video size={18} />, onClick: () => { if (!isVidRec && !showVidPrev) startVidRec(); }, disabled: isRec || !!audioUrl, active: isVidRec || showVidPrev }].map((btn, i) => (
                  <button key={i} onClick={btn.onClick} disabled={btn.disabled} style={{ width: 36, height: 36, borderRadius: 'var(--r3)', border: 'none', cursor: btn.disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: btn.active ? 'rgba(99,102,241,.15)' : 'none', color: btn.active ? 'var(--pr)' : btn.disabled ? 'var(--tx3)' : 'var(--tx2)', flexShrink: 0, opacity: btn.disabled ? .4 : 1, transition: 'all .15s' }}>{btn.icon}</button>
                ))}
                {!mediaActive ? <textarea ref={chatRef} value={input} onChange={onInputChange} onKeyDown={handleKey} placeholder={editing ? "Tahrirlash..." : "Xabar yozing... (Enter)"}
                  rows={1} style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--r2)', border: `1.5px solid ${editing ? 'rgba(16,185,129,.5)' : 'var(--br)'}`, background: 'var(--bg3)', fontSize: 13, color: 'var(--tx)', outline: 'none', resize: 'none', maxHeight: 120, minHeight: 40, fontFamily: 'DM Sans,sans-serif', transition: 'border .2s' }}
                  onFocus={ev => ev.target.style.borderColor = editing ? '#10b981' : 'var(--pr)'} onBlur={ev => ev.target.style.borderColor = editing ? 'rgba(16,185,129,.5)' : 'var(--br)'} /> : <div style={{ flex: 1 }} />}
                {showVidPrev ? <button onClick={sendVideo} style={{ width: 40, height: 40, borderRadius: 'var(--r2)', background: 'linear-gradient(135deg,var(--pr),var(--pr2))', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}><Send size={16} /></button>
                  : input.trim() || audioUrl ? <button onClick={audioUrl ? sendVoice : sendMsg} disabled={!input.trim() && !audioUrl} style={{ width: 40, height: 40, borderRadius: 'var(--r2)', background: editing ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,var(--pr),var(--pr2))', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                    {editing ? <CheckCircle2 size={18} /> : <Send size={16} />}
                  </button>
                    : !isVidRec ? <button onMouseDown={startRec} onMouseUp={stopRec} onTouchStart={startRec} onTouchEnd={stopRec} style={{ width: 40, height: 40, borderRadius: 'var(--r2)', background: isRec ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'var(--bg3)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isRec ? '#fff' : 'var(--tx2)', flexShrink: 0 }}>
                      {isRec ? <MicOff size={18} /> : <Mic size={18} />}
                    </button> : null}
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, textAlign: 'center' }}>
            <div style={{ width: 88, height: 88, background: 'linear-gradient(135deg,rgba(99,102,241,.1),rgba(139,92,246,.1))', borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><MessageCircle size={40} style={{ color: 'var(--pr)' }} /></div>
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--tx)', margin: '0 0 8px' }}>Chat</h3>
            <p style={{ color: 'var(--tx3)', maxWidth: 260, marginBottom: 24, fontSize: 13 }}>Mavjud suhbatni tanlang yoki yangi chat boshlang</p>
            <Btn onClick={() => { setNewChat(true); setMobileChat(false); }}><Plus size={16} />Yangi Chat</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  MAIN LMS CONTENT
// ═══════════════════════════════════════════════════════════
function LMSContent() {
  const navigate = useNavigate();
  const { dark, toggle } = useContext(ThemeCtx);
  const typingRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [sidebar, setSidebar] = useState(true);
  const [unreadChat, setUnreadChat] = useState(0);
  const [streamNotifs, setStreamNotifs] = useState([]);
  const [unreadStream, setUnreadStream] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const notifWs = useRef(null);

  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({ total_courses: 0, total_lessons: 0, completed_lessons: 0, overall_progress: 0 });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem('user') || '{}');
      return { id: s.id || 0, full_name: s.full_name || s.username || 'Foydalanuvchi', avatar: fixAvatarUrl(s.avatar || null), phone: s.phone || '', email: s.email || '', points: s.points || 0 };
    } catch { return { id: 0, full_name: 'Foydalanuvchi', avatar: null, phone: '', email: '', points: 0 }; }
  });

  const [selMod, setSelMod] = useState(null);
  const [modSection, setModSection] = useState(null);
  const [modLessons, setModLessons] = useState([]);
  const [modTests, setModTests] = useState([]);
  const [modTasks, setModTasks] = useState([]);
  const [selLesson, setSelLesson] = useState(null);
  const [selQuiz, setSelQuiz] = useState(null);
  const [quizAns, setQuizAns] = useState({});
  const [selTask, setSelTask] = useState(null);
  const [taskFile, setTaskFile] = useState(null);
  const [doneLesson, setDoneLesson] = useState(false);
  const [sendingQuiz, setSendingQuiz] = useState(false);
  const [sendingTask, setSendingTask] = useState(false);

  const [arenaLB, setArenaLB] = useState([]);
  const [genLB, setGenLB] = useState([]);
  const [typingStats, setTypingStats] = useState(null);
  const [lang, setLang] = useState('uz');
  const [diff, setDiff] = useState('medium');
  const [dur, setDur] = useState(60);
  const [tLimit, setTLimit] = useState(null);
  const [typingMode, setTypingMode] = useState(false);
  const [curTest, setCurTest] = useState(null);
  const [uInput, setUInput] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [errs, setErrs] = useState(0);
  const [startT, setStartT] = useState(null);
  const [finished, setFinished] = useState(false);
  const [typRes, setTypRes] = useState(null);
  const [arenaMode, setArenaMode] = useState(false);
  const [lbTab, setLbTab] = useState('arena');
  const [elapsed, setElapsed] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showArena, setShowArena] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selOpp, setSelOpp] = useState(null);
  const [arenaSession, setArenaSession] = useState(null);
  const [incoming, setIncoming] = useState([]);

  useEffect(() => {
    if (Notification.permission === 'default') Notification.requestPermission();
    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${WS_HOST}/ws/notifications/?token=${localStorage.getItem('access_token') || ''}`);
    notifWs.current = ws;
    ws.onmessage = e => {
      try {
        const d = JSON.parse(e.data);
        if (d.type === 'unread_count') setUnreadStream(d.count);
        if (d.type === 'stream_live') {
          if (Notification.permission === 'granted') new Notification('🔴 Jonli efir!', { body: `${d.teacher}: ${d.title}` });
          toast.custom(t => (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'var(--bg2)', border: '2px solid #ef4444', borderRadius: 'var(--r2)', padding: 14, maxWidth: 340, boxShadow: '0 8px 24px rgba(239,68,68,.15)' }}>
              <div style={{ width: 36, height: 36, background: '#ef4444', borderRadius: 'var(--r3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Radio size={18} style={{ color: '#fff' }} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: '#ef4444', margin: '0 0 3px' }}>🔴 Jonli Efir!</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</p>
                <p style={{ fontSize: 11, color: 'var(--tx3)', margin: '0 0 8px' }}>{d.teacher}{d.course ? ` · ${d.course}` : ''}</p>
                <button onClick={() => { setTab('stream'); toast.dismiss(t.id); }} style={{ padding: '5px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 'var(--r3)', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>Tomosha →</button>
              </div>
              <button onClick={() => toast.dismiss(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx3)' }}><X size={14} /></button>
            </div>
          ), { duration: 8000 });
          setStreamNotifs(p => [{ id: Date.now(), stream_uid: d.stream_uid, title: d.title, teacher: d.teacher, course: d.course, time: new Date().toISOString() }, ...p.slice(0, 19)]);
          setUnreadStream(p => p + 1);
        }
      } catch {}
    };
    ws.onerror = () => {};
    return () => ws.close();
  }, []);

  useEffect(() => { const h = () => setShowNotif(false); if (showNotif) window.addEventListener('click', h); return () => window.removeEventListener('click', h); }, [showNotif]);

  useEffect(() => {
    const load = async () => { try { const r = await api.get('/chat/unread/'); setUnreadChat(r.data?.unread_count || 0); } catch {} };
    load(); const iv = setInterval(load, 30000); return () => clearInterval(iv);
  }, []);

  useEffect(() => { if (tab === 'chat') setUnreadChat(0); }, [tab]);
  useEffect(() => { if (tab === 'stream') setUnreadStream(0); }, [tab]);

  // ═══════════════════════════════════════════════════════
  // FIX: fetchData — modul va darslarni to'g'ri yuklash
  // ═══════════════════════════════════════════════════════
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Barcha so'rovlarni parallel yuboramiz
      const [dR, cR, lR, uR] = await Promise.allSettled([
        api.get('/courses/dashboard/').catch(() => null),
        api.get('/enrollments/').catch(() => null),
        api.get('/users/leaderboard/').catch(() => null),
        api.get('/users/me/').catch(() => null),
      ]);
      // mR o'rniga modullarni kurslar ichidan olamiz
      const mR = { status: 'skipped', value: null };

      // ── Foydalanuvchi ma'lumotlari ──────────────────
      if (uR.status === 'fulfilled' && uR.value?.data) {
        const u = uR.value.data;
        const updatedUser = {
          id: u.id || currentUser.id,
          full_name: u.full_name || u.username || currentUser.full_name,
          avatar: fixAvatarUrl(u.avatar || null) || currentUser.avatar,
          phone: u.phone || currentUser.phone,
          email: u.email || currentUser.email,
          points: typeof u.points === 'number' ? u.points : (u.total_points || 0),
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('user', JSON.stringify({ ...u, ...updatedUser }));
      }

      // ── Dashboard statistika ─────────────────────────
      if (dR.status === 'fulfilled' && dR.value?.data?.stats) {
        const d = dR.value.data.stats;
        setStats({
          total_courses:     d.total_courses || 0,
          total_lessons:     d.total_lessons || 0,
          completed_lessons: d.completed_lessons || 0,
          overall_progress:  d.overall_progress || 0,
        });
      }

      // ── Modullarni qurish funksiyasi ─────────────────
      const buildModule = (mod, course) => {
        // Darslarni barcha mumkin bo'lgan maydonlardan olish
        const rawLessons = (
          mod.lessons ||
          mod.items ||
          mod.content ||
          mod.lesson_set ||
          mod.lessons_list ||
          []
        );
        const allLessons = Array.isArray(rawLessons) ? rawLessons.filter(Boolean) : [];

        // Har bir darsni to'g'ri kategoriyalash
        const videos  = allLessons.filter(l => isVideoLesson(l));
        const quizzes = allLessons.filter(l => isQuizLesson(l));
        const tasks   = allLessons.filter(l => isTaskLesson(l));

        const thumbnail = course?.thumbnail || course?.image || mod.thumbnail || mod.image ||
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400';

        return {
          id:               mod.id,
          title:            mod.title || mod.name || 'Modul',
          description:      mod.description || '',
          order:            mod.order ?? mod.position ?? 0,
          course_id:        course?.id || mod.course || mod.course_id || 0,
          course_name:      course?.title || course?.name || mod.course_name || mod.course_title || 'Kurs',
          course_thumbnail: thumbnail,
          lessons:          allLessons,
          lessons_count:    allLessons.length,
          duration_minutes: mod.duration_minutes || mod.duration || 0,
          _videos:          videos,
          _quizzes:         quizzes,
          _tasks:           tasks,
        };
      };

      let builtMods = [];
      let courseList = [];

      // ── KURSLAR ──────────────────────────────────────
      if (cR.status === 'fulfilled' && cR.value?.data) {
        const raw = cR.value.data;
        const enrollments = Array.isArray(raw) ? raw
          : Array.isArray(raw?.results) ? raw.results : [];
      
        // Enrollment ichidan course ob'ektini chiqaramiz
        courseList = enrollments
          .map(e => e.course || e)   // {course: {...}} yoki to'g'ridan kurs
          .filter(c => c && c.id);
      
        setCourses(courseList);
      }

      // ── YO'L 1: /courses/modules/ endpoint ──────────
      if (mR.status === 'fulfilled' && mR.value?.data) {
        const raw = mR.value.data;
        const modList = Array.isArray(raw) ? raw
          : Array.isArray(raw?.results) ? raw.results
          : Array.isArray(raw?.modules) ? raw.modules : [];

        if (modList.length > 0) {
          builtMods = modList.map(m => {
            // Kursni courseList dan topamiz
            const course = courseList.find(c => c.id === (m.course || m.course_id)) || {
              id: m.course || m.course_id,
              title: m.course_name || m.course_title || 'Kurs',
              thumbnail: m.course_thumbnail || m.thumbnail,
            };
            return buildModule(m, course);
          });
        }
      }

      // ── YO'L 2: Kurslar ichidan modullar ─────────────
      if (builtMods.length === 0 && courseList.length > 0) {
        courseList.forEach(course => {
          if (!course) return;
          const courseModules = (
            course.modules ||
            course.sections ||
            course.module_set ||
            course.chapters ||
            []
          );
          const mods = Array.isArray(courseModules) ? courseModules : [];
          mods.forEach(mod => {
            if (!mod) return;
            builtMods.push(buildModule(mod, course));
          });
        });
      }

      // ── YO'L 3: Har bir kurs uchun alohida so'rov ────
      // if (builtMods.length === 0 && courseList.length > 0) {
      //   const modRequests = courseList.map(c =>
      //     api.get(`/courses/${c.id}/modules/`).catch(() => null)
      //   );
      //   const modResults = await Promise.allSettled(modRequests);
      //   modResults.forEach((r, i) => {
      //     if (r.status !== 'fulfilled' || !r.value?.data) return;
      //     const raw = r.value.data;
      //     const mods = Array.isArray(raw) ? raw
      //       : Array.isArray(raw?.results) ? raw.results
      //       : Array.isArray(raw?.modules) ? raw.modules : [];
      //     mods.forEach(mod => {
      //       if (!mod) return;
      //       builtMods.push(buildModule(mod, courseList[i]));
      //     });
      //   });
      // }

      // Modullarni order bo'yicha tartiblash
      builtMods.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setModules(builtMods);

      // ── Statistika fallback ──────────────────────────
      if (dR.status !== 'fulfilled' || !dR.value?.data?.stats) {
        const totalLessons = builtMods.reduce((s, m) => s + m.lessons_count, 0);
        const completedLessons = builtMods.reduce((s, m) => s + m.lessons.filter(l => l?.is_completed).length, 0);
        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        setStats({
          total_courses:     courseList.length,
          total_lessons:     totalLessons,
          completed_lessons: completedLessons,
          overall_progress:  progress,
        });
      }

      // ── Leaderboard ──────────────────────────────────
      if (lR.status === 'fulfilled' && lR.value?.data) {
        const lb = lR.value.data;
        setLeaderboard(Array.isArray(lb) ? lb : lb?.results || []);
      }

    } catch (e) {
      console.error('fetchData error:', e);
      toast.error("Ma'lumotlarni yuklashda xatolik!");
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const finishRef = useRef(null);

  const submitTyping = useCallback(async (w, acc, time, e) => {
    if (!curTest?.id) return;
    try {
      const r = await api.post('/typing/results/', { test: curTest.id, wpm: Math.round(w), accuracy: Math.round(acc * 10) / 10, time_taken: Math.round(time), errors: e, is_arena: arenaMode, session_id: arenaSession?.id || null });
      setTypRes(r.data || null); toast.success(`✅ ${Math.round(w)} WPM`);
      // Ball yangilash
      fetchData();
    } catch { toast.error('Natijada xatolik!'); }
  }, [curTest, arenaMode, arenaSession, fetchData]);

  const finishTest = useCallback(() => {
    if (!startT || !curTest?.text || finished) return;
    const t = (Date.now() - startT) / 1000, w = (curTest.text.split(' ').length / t) * 60, acc = Math.max(0, ((curTest.text.length - errs) / curTest.text.length) * 100);
    setFinished(true); submitTyping(w, acc, t, errs);
  }, [startT, curTest, finished, errs, submitTyping]);

  finishRef.current = finishTest;

  useEffect(() => {
    if (!startT || finished || !typingMode) return;
    const t = setInterval(() => {
      const e = (Date.now() - startT) / 1000; setElapsed(e);
      const w = uInput.trim().split(/\s+/).filter(Boolean).length; setWpm(w > 0 ? (w / e) * 60 : 0);
      if (tLimit && e >= tLimit) { clearInterval(t); finishRef.current?.(); }
    }, 100); return () => clearInterval(t);
  }, [startT, finished, typingMode, uInput, tLimit]);

  const fetchArenaLB  = useCallback(async () => { try { const r = await api.get('/typing/leaderboard/arena/');   setArenaLB(r.data?.results || []); } catch { setArenaLB([]); } }, []);
  const fetchGenLB    = useCallback(async () => { try { const r = await api.get('/typing/leaderboard/general/'); setGenLB(r.data?.results || []); } catch { setGenLB([]); } }, []);
  const fetchTypStats = useCallback(async () => { try { const r = await api.get('/typing/results/my_stats/');   setTypingStats(r.data?.stats || null); } catch { setTypingStats(null); } }, []);
  const fetchOnline   = useCallback(async () => { try { const r = await api.get('/typing/online-users/');       setOnlineUsers((r.data?.users || []).filter(u => u.id !== currentUser.id)); } catch { setOnlineUsers([]); } }, [currentUser.id]);

  useEffect(() => { if (tab === 'typing') { fetchArenaLB(); fetchGenLB(); fetchTypStats(); } }, [tab, fetchArenaLB, fetchGenLB, fetchTypStats]);

  useEffect(() => {
    if (tab !== 'typing') return;
    const iv = setInterval(async () => { try { const r = await api.get('/typing/arena/incoming-requests/'); setIncoming(r.data?.requests || []); } catch {} }, 3000);
    return () => clearInterval(iv);
  }, [tab]);

  const sendArena = async id => { try { await api.post('/typing/arena/request/', { opponent_id: id, duration: dur, language: lang, difficulty: diff }); toast.success("So'rov yuborildi!"); } catch { toast.error("Xatolik!"); } };

  const respondArena = async (id, accept) => {
    try {
      const r = await api.post(`/typing/arena/request/${id}/${accept ? 'accept' : 'reject'}/`);
      if (accept && r.data?.session) { setArenaSession(r.data.session); startTyping(r.data.session.duration); }
      setIncoming(p => p.filter(x => x.id !== id));
    } catch { toast.error('Javobda xatolik!'); }
  };

  const TEXTS = useMemo(() => ({
    uz: { easy: "Dasturlash dunyosi juda keng va qiziqarli.", medium: "O'zbekiston Markaziy Osiyoning yurak qismida joylashgan. Mamlakatimiz o'ziga xos tabiati, boy tarixi va go'zal madaniyati bilan mashhur.", hard: "Sun'iy intellekt texnologiyalari tez rivojlanmoqda. Mashina o'rganishi, tabiiy tilni qayta ishlash va kompyuter ko'rish kabi sohalarda katta yutuqlarga erishilmoqda." },
    en: { easy: "Programming is the process of creating instructions for computers.", medium: "The quick brown fox jumps over the lazy dog. Typing practice helps improve speed and accuracy.", hard: "Artificial intelligence is transforming industries. Machine learning algorithms recognize patterns with incredible accuracy." },
    ru: { easy: "Программирование это процесс создания программ.", medium: "Съешь ещё этих мягких французских булок, да выпей же чаю.", hard: "Искусственный интеллект меняет мир. Машинное обучение позволяет компьютерам решать сложные задачи." }
  }), []);

  const startTyping = useCallback((d = dur) => {
    const obj = { id: Date.now(), title: `${lang.toUpperCase()} Test`, text: TEXTS[lang]?.[diff] || '', language: lang, difficulty: diff };
    setCurTest(obj); setUInput(''); setWordIdx(0); setErrs(0); setElapsed(0); setWpm(0); setFinished(false); setTypingMode(true); setTypRes(null); setTLimit(d); setStartT(Date.now()); setShowSettings(false); setArenaMode(false);
    setTimeout(() => typingRef.current?.focus(), 100);
  }, [lang, diff, dur, TEXTS]);

  const onTypeInput = e => {
    if (!curTest || finished) return;
    const typed = e.target.value || ''; setUInput(typed); if (!startT) setStartT(Date.now());
    const tw = curTest.text.split(/\s+/).filter(Boolean), tp = typed.trim() ? typed.trim().split(/\s+/).filter(Boolean) : [];
    setWordIdx(Math.max(0, tp.length - 1));
    let e2 = 0; tp.forEach((w, i) => { const t = tw[i]; if (t) { for (let j = 0; j < Math.min(w.length, t.length); j++) if (w[j] !== t[j]) e2++; e2 += Math.abs(w.length - t.length); } else e2 += w.length; }); setErrs(e2);
    if (typed.trim() === (curTest.text || '').trim()) finishRef.current?.();
  };

  const resetTest = useCallback(() => { setUInput(''); setWordIdx(0); setErrs(0); setStartT(null); setElapsed(0); setWpm(0); setFinished(false); setTypRes(null); setTimeout(() => typingRef.current?.focus(), 100); }, []);
  const closeTyping = useCallback(() => { setTypingMode(false); setCurTest(null); setArenaSession(null); resetTest(); }, [resetTest]);

  // ── Modulni ochish ────────────────────────────────────
  const onModClick = useCallback(m => {
    if (!m) return;
    setSelMod(m);
    setModSection(null);
    setModLessons(m._videos || []);
    setModTests(m._quizzes || []);
    setModTasks(m._tasks || []);
  }, []);

  const closeMod = () => { setSelMod(null); setModSection(null); setModLessons([]); setModTests([]); setModTasks([]); };

  // ── Darsni yakunlash ──────────────────────────────────
  const completeLesson = async () => {
    if (!selLesson?.id || doneLesson) return;
    setDoneLesson(true);
    try {
      let res = null;
      // Barcha mumkin bo'lgan endpointlarni sinab ko'ramiz
      const endpoints = [
        `/lessons/${selLesson.id}/complete/`,
        `/courses/lessons/${selLesson.id}/complete/`,
        `/courses/${selLesson.course_id || selMod?.course_id || ''}/lessons/${selLesson.id}/complete/`,
        `/courses/lessons/${selLesson.id}/mark-complete/`,
        `/lessons/${selLesson.id}/mark-complete/`,
      ];
      for (const ep of endpoints) {
        try { res = await api.post(ep); if (res) break; }
        catch (e) { if (e.response?.status !== 404 && e.response?.status !== 405) throw e; }
      }
      if (!res) throw new Error('Endpoint topilmadi');

      toast.success('✅ Dars muvaffaqiyatli yakunlandi!');
      setSelLesson(prev => prev ? { ...prev, is_completed: true } : null);
      setModLessons(prev => prev.map(l => l.id === selLesson.id ? { ...l, is_completed: true } : l));
      setModules(prev => prev.map(mod => ({
        ...mod,
        lessons:  mod.lessons.map(l => l.id === selLesson.id ? { ...l, is_completed: true } : l),
        _videos:  (mod._videos  || []).map(l => l.id === selLesson.id ? { ...l, is_completed: true } : l),
        _quizzes: (mod._quizzes || []).map(l => l.id === selLesson.id ? { ...l, is_completed: true } : l),
        _tasks:   (mod._tasks   || []).map(l => l.id === selLesson.id ? { ...l, is_completed: true } : l),
      })));
      // Ballni yangilash
      await fetchData();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 400) {
        toast('Bu dars allaqachon yakunlangan', { icon: 'ℹ️' });
        setSelLesson(prev => prev ? { ...prev, is_completed: true } : null);
      } else {
        toast.error(`Xato: ${status || err.message}`);
      }
    } finally {
      setDoneLesson(false);
    }
  };

  // ── Testni boshlash ───────────────────────────────────
  const startQuiz = l => {
    if (!l) return;
    // Quiz data turli joylarda bo'lishi mumkin
    const quizObj   = l.quiz || l;
    const questions = quizObj?.questions || l?.questions || [];

    if (!questions.length) {
      toast.error("Test savolları topilmadi!");
      return;
    }
    setSelQuiz({
      id:            l.quiz?.id || l.id || Date.now(),
      title:         l.quiz?.title || l.title || 'Test',
      duration:      l.quiz?.time_limit_minutes || l.time_limit_minutes || 30,
      passing_score: l.quiz?.passing_score || l.passing_score || 70,
      questions,
      lesson_id:     l.id,
      course_id:     l.course_id || selMod?.course_id,
    });
    setQuizAns({});
  };

  // ── Testni yuborish ───────────────────────────────────
  const submitQuiz = async () => {
    if (!selQuiz || sendingQuiz) return;
    if (Object.keys(quizAns).length < selQuiz.questions.length) {
      toast.error('Barcha savollarga javob bering!');
      return;
    }
    setSendingQuiz(true);
    try {
      // Javoblarni ikkala formatda ham tayyorlaymiz
      const answersDict = quizAns;
      const answersArr  = Object.entries(quizAns).map(([qid, opts]) => ({
        question_id:      parseInt(qid),
        option_id:        Array.isArray(opts) ? opts[0] : opts,
        selected_options: Array.isArray(opts) ? opts : [opts],
      }));

      let res = null;
      const endpoints = [
        { url: `/courses/quizzes/${selQuiz.id}/submit/`,      body: { answers: answersDict } },
        { url: `/quizzes/${selQuiz.id}/submit/`,              body: { answers: answersDict } },
        { url: `/courses/quizzes/${selQuiz.id}/submit/`,      body: { answers: answersArr } },
        { url: `/quizzes/${selQuiz.id}/submit/`,              body: { answers: answersArr } },
        { url: `/lessons/${selQuiz.lesson_id}/submit-quiz/`,  body: { answers: answersDict, quiz_id: selQuiz.id } },
        { url: `/courses/lessons/${selQuiz.lesson_id}/quiz/submit/`, body: { answers: answersDict } },
      ];

      for (const { url, body } of endpoints) {
        try { res = await api.post(url, body); if (res) break; }
        catch (e) { if (e.response?.status !== 404 && e.response?.status !== 405) throw e; }
      }
      if (!res) throw new Error('Quiz endpoint topilmadi');

      const { score = 0, is_passed = false, passed = false, correct = 0, total = 0 } = res.data || {};
      const finalScore = typeof score === 'number' ? score : (total > 0 ? Math.round((correct / total) * 100) : 0);
      const didPass = is_passed || passed || finalScore >= (selQuiz.passing_score || 70);
      toast.success(`${finalScore.toFixed(1)}% | ${didPass ? "✅ O'tdingiz" : "❌ O'tmadingiz"}`, { duration: 5000 });

      setSelQuiz(null); setQuizAns({}); setModSection(null);
      fetchData();
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.response?.data?.error || e.message || 'Xatolik!';
      toast.error(msg);
    } finally {
      setSendingQuiz(false);
    }
  };

  // ── Topshiriqni yuborish ──────────────────────────────
  const submitTask = async () => {
    if (!selTask || !taskFile || sendingTask || !selTask.id) return;
    setSendingTask(true);
    try {
      const fd = new FormData();
      fd.append('file', taskFile);
      fd.append('lesson_id', selTask.id);

      let res = null;
      const endpoints = [
        `/lessons/${selTask.id}/submit-assignment/`,
        `/courses/lessons/${selTask.id}/submit-assignment/`,
        `/assignments/${selTask.id}/submit/`,
        `/lessons/${selTask.id}/submit/`,
        `/courses/lessons/${selTask.id}/submit/`,
        `/homework/${selTask.id}/submit/`,
      ];
      for (const ep of endpoints) {
        try { res = await api.post(ep, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); if (res) break; }
        catch (e) { if (e.response?.status !== 404 && e.response?.status !== 405) throw e; }
      }
      if (!res) throw new Error('Assignment endpoint topilmadi');

      toast.success('Vazifa muvaffaqiyatli topshirildi! ✅');
      setSelTask(null); setTaskFile(null); setModSection(null);
      setModules(prev => prev.map(mod => ({
        ...mod,
        _tasks:   (mod._tasks   || []).map(t => t.id === selTask.id ? { ...t, is_submitted: true, is_completed: true } : t),
        lessons:  mod.lessons.map(l => l.id === selTask.id ? { ...l, is_submitted: true, is_completed: true } : l),
      })));
      setModTasks(prev => prev.map(t => t.id === selTask.id ? { ...t, is_submitted: true } : t));
      fetchData();
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.response?.data?.error || e.message || 'Xatolik!';
      toast.error(msg);
    } finally {
      setSendingTask(false);
    }
  };

  const renderWords = () => {
    if (!curTest?.text) return null;
    const ws = curTest.text.split(/\s+/).filter(Boolean), tw = uInput.trim() ? uInput.trim().split(/\s+/).filter(Boolean) : [];
    return (
      <div style={{ fontSize: 22, fontFamily: 'DM Mono,monospace', lineHeight: 2, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {ws.map((w, i) => {
          const past = i < wordIdx, cur = i === wordIdx, correct = tw[i] === w;
          return <span key={i} style={{ color: past ? (correct ? '#10b981' : '#ef4444') : cur ? 'var(--pr)' : 'var(--tx3)', textDecoration: cur ? 'underline' : 'none', fontWeight: cur ? 700 : 400, transition: 'color .15s' }}>{w}</span>;
        })}
      </div>
    );
  };

  if (loading) return (<><style>{premiumStyles + `@keyframes spin{to{transform:rotate(360deg)}}`}</style><Loader /></>);

  const GH = {
    purple: 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
    blue:   'linear-gradient(135deg,#6366f1,#4f46e5)',
    red:    'linear-gradient(135deg,#ef4444,#dc2626)',
    green:  'linear-gradient(135deg,#10b981,#059669)',
    orange: 'linear-gradient(135deg,#f59e0b,#d97706)',
    dark:   'linear-gradient(135deg,#1e2537,#0a0f1e)',
  };

  const navItems = [
    ['overview',     'Dashboard',    <LayoutDashboard size={20} />],
    ['courses',      'Kurslarim',    <BookOpen size={20} />],
    ['modules',      'Modullar',     <Layers size={20} />],
    ['leaderboard',  'Reyting',      <Award size={20} />],
    ['typing',       'Typing',       <Keyboard size={20} />],
    ['chat',         'Chat',         <MessageCircle size={20} />, unreadChat],
    ['stream',       'Efir',         <Radio size={20} />,         unreadStream],
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      <style>{premiumStyles + `@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: 'var(--bg2)', color: 'var(--tx)', border: '1px solid var(--br)', borderRadius: 'var(--r2)', fontFamily: 'DM Sans,sans-serif', fontSize: 13 } }} />

      {incoming.length > 0 && (
        <div style={{ position: 'fixed', top: 100, right: 20, zIndex: 80, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 340 }}>
          {incoming.map(r => (
            <Card key={r.id} style={{ padding: 16, border: '2px solid #ef4444' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Flame style={{ color: '#ef4444', flexShrink: 0 }} size={22} />
                <div style={{ flex: 1 }}><h4 style={{ fontWeight: 800, fontSize: 14, margin: 0, color: 'var(--tx)' }}>Arena!</h4><p style={{ fontSize: 11, color: 'var(--tx3)', margin: 0 }}>{r.sender_name} chaqirdi</p></div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn variant="success" size="sm" onClick={() => respondArena(r.id, true)} style={{ flex: 1, justifyContent: 'center' }}><Check size={14} />Qabul</Btn>
                <Btn variant="danger"  size="sm" onClick={() => respondArena(r.id, false)} style={{ flex: 1, justifyContent: 'center' }}><XCircle size={14} />Rad</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* SIDEBAR */}
      <aside style={{ width: sidebar ? 280 : 76, background: 'var(--bg2)', borderRight: '1px solid var(--br)', display: 'flex', flexDirection: 'column', transition: 'width .3s', zIndex: 50, flexShrink: 0 }}>
        <div style={{ height: 80, display: 'flex', alignItems: 'center', padding: sidebar ? '0 20px' : '0', justifyContent: sidebar ? 'flex-start' : 'center', flexShrink: 0 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--r2)', background: GH.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(99,102,241,.4)', flexShrink: 0 }}><Zap style={{ color: '#fff', fill: '#fff' }} size={22} /></div>
          {sidebar && <h1 style={{ marginLeft: 12, fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px', color: 'var(--tx)', textTransform: 'uppercase', fontStyle: 'italic' }}>Elite<span style={{ color: 'var(--pr)' }}>LMS</span></h1>}
        </div>
        <nav style={{ flex: 1, padding: '8px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {navItems.map(([id, label, icon, badge]) => <SidebarItem key={id} icon={icon} label={label} active={tab === id} onClick={() => setTab(id)} open={sidebar} badge={badge || 0} />)}
          <div style={{ height: 1, background: 'var(--br)', margin: '8px 4px' }} />
          <SidebarItem icon={<Settings size={20} />} label="Sozlamalar" active={tab === 'settings'} onClick={() => setTab('settings')} open={sidebar} />
        </nav>
        <div style={{ padding: '12px', flexShrink: 0 }}>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '11px 14px', borderRadius: 'var(--r2)', border: 'none', cursor: 'pointer', background: 'none', color: '#ef4444', fontSize: 13, fontWeight: 700, justifyContent: sidebar ? 'flex-start' : 'center', transition: 'background .2s' }} onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(239,68,68,.08)'} onMouseLeave={ev => ev.currentTarget.style.background = 'none'}>
            <LogOut size={20} />{sidebar && 'CHIQISH'}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: 80, background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--br)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <button onClick={() => setSidebar(p => !p)} style={{ width: 38, height: 38, borderRadius: 'var(--r3)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg3)', color: 'var(--tx2)', transition: 'all .2s' }} onMouseEnter={ev => ev.currentTarget.style.background = 'var(--br)'} onMouseLeave={ev => ev.currentTarget.style.background = 'var(--bg3)'}>
            <MoreVertical size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: GH.orange, padding: '7px 14px', borderRadius: 'var(--r2)', boxShadow: '0 4px 14px rgba(245,158,11,.3)' }}><Trophy style={{ color: '#fff' }} size={16} /><span style={{ fontWeight: 800, color: '#fff', fontSize: 14 }}>{currentUser.points}</span></div>
            <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
              <button onClick={() => { setShowNotif(p => !p); setUnreadStream(0); }} style={{ width: 40, height: 40, borderRadius: 'var(--r2)', border: '1px solid var(--br)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: 'var(--sh)' }}>
                <Bell size={18} style={{ color: unreadStream > 0 ? '#ef4444' : 'var(--tx2)' }} />
                {unreadStream > 0 && <span style={{ position: 'absolute', top: -3, right: -3, width: 18, height: 18, background: '#ef4444', color: '#fff', fontSize: 9, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{unreadStream > 9 ? '9+' : unreadStream}</span>}
              </button>
              {showNotif && <div style={{ position: 'absolute', right: 0, top: 52, width: 320, background: 'var(--bg2)', border: '1px solid var(--br)', borderRadius: 'var(--r)', boxShadow: '0 8px 32px rgba(0,0,0,.15)', overflow: 'hidden', zIndex: 100 }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--br)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 14, color: 'var(--tx)', margin: 0 }}>Bildirishnomalar</h4>
                  <button onClick={() => setStreamNotifs([])} style={{ fontSize: 11, color: 'var(--tx3)', background: 'none', border: 'none', cursor: 'pointer' }}>Tozalash</button>
                </div>
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {streamNotifs.length === 0 ? <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--tx3)' }}><Bell size={28} style={{ margin: '0 auto 8px', opacity: .2, display: 'block' }} /><p style={{ fontSize: 12, fontWeight: 700 }}>Bildirishnoma yo'q</p></div>
                    : streamNotifs.map(n => <button key={n.id} onClick={() => { setTab('stream'); setShowNotif(false); }} style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', border: 'none', borderBottom: '1px solid var(--br)', background: 'none', cursor: 'pointer', textAlign: 'left' }} onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg3)'} onMouseLeave={ev => ev.currentTarget.style.background = 'none'}>
                      <div style={{ width: 34, height: 34, background: '#ef4444', borderRadius: 'var(--r3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Radio size={14} style={{ color: '#fff' }} /></div>
                      <div style={{ flex: 1, minWidth: 0 }}><p style={{ fontSize: 10, fontWeight: 800, color: '#ef4444', margin: '0 0 2px' }}>🔴 LIVE</p><p style={{ fontSize: 12, fontWeight: 700, color: 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '0 0 2px' }}>{n.title}</p><p style={{ fontSize: 10, color: 'var(--tx3)', margin: 0 }}>{n.teacher}{n.course ? ` · ${n.course}` : ''}</p></div>
                    </button>)}
                </div>
              </div>}
            </div>
            <button onClick={toggle} style={{ width: 40, height: 40, borderRadius: 'var(--r2)', border: '1px solid var(--br)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--sh)' }}>{dark ? <Sun size={18} style={{ color: '#f59e0b' }} /> : <Moon size={18} style={{ color: 'var(--pr)' }} />}</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 14, borderLeft: '1px solid var(--br)' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)', margin: 0 }}>{currentUser.full_name}</p>
                <p style={{ fontSize: 10, color: 'var(--pr)', margin: 0, textTransform: 'uppercase', fontWeight: 700 }}>ID: {currentUser.id}</p>
              </div>
              <img src={getAvatarSrc(currentUser.avatar, currentUser.full_name)} style={{ width: 44, height: 44, borderRadius: 'var(--r2)', objectFit: 'cover', border: '2px solid var(--br)', boxShadow: 'var(--sh)' }} alt="profile" onError={ev => { ev.target.onerror = null; ev.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.full_name)}&background=6366f1&color=fff`; }} />
            </div>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>

            {/* ══ DASHBOARD ══ */}
            {tab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="anim-up">
                <div style={{ background: GH.dark, backgroundImage: 'radial-gradient(ellipse at 80% 0%,rgba(99,102,241,.35) 0%,transparent 60%)', padding: '48px 40px', borderRadius: 'var(--r)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', right: -60, bottom: -60, width: 360, height: 360, background: 'radial-gradient(circle,rgba(99,102,241,.2),transparent 70%)', borderRadius: '50%' }} />
                  <div style={{ position: 'relative' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Xush kelibsiz</p>
                    <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 44, margin: '0 0 12px', lineHeight: 1.1 }}>Salom, {currentUser.full_name.split(' ')[0]}! 👋</h1>
                    <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 16, margin: 0 }}>Bugun qanday bilim olasiz?</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
                  <StatCard icon={<BookOpen size={24} />}    label="Kurslarim"  value={stats.total_courses}     color="blue" />
                  <StatCard icon={<Layers size={24} />}       label="Darslar"    value={stats.total_lessons}     color="purple" />
                  <StatCard icon={<CheckCircle2 size={24} />} label="Tugatilgan" value={stats.completed_lessons} color="green" />
                  <StatCard icon={<Trophy size={24} />}       label="Progress"   value={`${stats.overall_progress}%`} color="orange" />
                </div>
              </div>
            )}

            {/* ══ KURSLAR ══ */}
            {tab === 'courses' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, color: 'var(--tx)', margin: 0 }}>Mening Kurslarim</h2>
                  <Btn onClick={fetchData} variant="outline" size="sm"><RotateCcw size={14} />Yangilash</Btn>
                </div>
                {courses.length === 0 ? <EmptyState message="Siz hali hech qanday kursga yozilmagansiz" />
                  : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
                    {courses.map(c => (
                      <Card key={c.id} style={{ overflow: 'hidden', transition: 'all .2s', cursor: 'pointer' }} onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-3px)'; ev.currentTarget.style.boxShadow = '0 12px 36px rgba(99,102,241,.15)'; }} onMouseLeave={ev => { ev.currentTarget.style.transform = ''; ev.currentTarget.style.boxShadow = 'var(--sh)'; }}>
                        {(c.thumbnail || c.image) && <img src={c.thumbnail || c.image} alt={c.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} onError={ev => ev.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'} />}
                        <div style={{ padding: 20 }}>
                          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 16, color: 'var(--tx)', margin: '0 0 6px' }}>{c.title || c.name || 'Nomsiz'}</h3>
                          <p style={{ fontSize: 11, color: 'var(--tx3)', margin: '0 0 16px' }}>{c.total_lessons || c.lessons_count || 0} ta dars</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, marginBottom: 6 }}><span>PROGRESS</span><span style={{ color: 'var(--pr)' }}>{c.progress || c.completion_percentage || 0}%</span></div>
                          <div style={{ height: 5, background: 'var(--bg3)', borderRadius: 99, overflow: 'hidden' }}><div style={{ height: '100%', background: GH.blue, borderRadius: 99, width: `${c.progress || c.completion_percentage || 0}%`, transition: 'width .5s' }} /></div>
                        </div>
                      </Card>
                    ))}
                  </div>
                }
              </div>
            )}

            {/* ══ MODULLAR ══ */}
            {tab === 'modules' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, color: 'var(--tx)', margin: 0 }}>Kurs Modullari</h2>
                  <Btn onClick={fetchData} variant="outline" size="sm"><RotateCcw size={14} />Yangilash</Btn>
                </div>

                {/* Debug xabari */}
                {modules.length === 0 && courses.length > 0 && (
                  <Card style={{ padding: 20, background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.3)' }}>
                    <p style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600, margin: '0 0 8px' }}>
                      ⚠️ {courses.length} ta kurs topildi, lekin modullar yuklanmadi.
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--tx3)', margin: 0 }}>
                      Backend <code>/courses/modules/</code> yoki kurs ichidagi <code>modules</code> maydonini tekshiring.
                    </p>
                  </Card>
                )}

                {modules.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
                    {modules.map(m => (
                      <Card key={m.id} style={{ overflow: 'hidden', transition: 'all .2s', cursor: 'pointer' }}
                        onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-3px)'; ev.currentTarget.style.boxShadow = '0 12px 36px rgba(99,102,241,.15)'; }}
                        onMouseLeave={ev => { ev.currentTarget.style.transform = ''; ev.currentTarget.style.boxShadow = 'var(--sh)'; }}>
                        <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
                          <img src={m.course_thumbnail} alt={m.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s' }} onError={ev => ev.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'} />
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,.75),transparent)' }} />
                          <div style={{ position: 'absolute', bottom: 12, left: 16 }}><span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.8)', textTransform: 'uppercase', letterSpacing: 1 }}>{m.course_name}</span></div>
                        </div>
                        <div style={{ padding: 20 }}>
                          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 16, color: 'var(--tx)', margin: '0 0 6px' }}>{m.title}</h3>
                          <p style={{ fontSize: 12, color: 'var(--tx3)', margin: '0 0 14px', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.description || 'Modul tavsifi'}</p>
                          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'rgba(99,102,241,.1)', color: 'var(--pr)' }}>📚 {m.lessons_count} dars</span>
                            {m._videos.length > 0  && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'rgba(99,102,241,.08)', color: 'var(--pr)' }}>🎥 {m._videos.length}</span>}
                            {m._quizzes.length > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'rgba(245,158,11,.1)', color: '#f59e0b' }}>📝 {m._quizzes.length}</span>}
                            {m._tasks.length > 0   && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'rgba(16,185,129,.1)', color: '#10b981' }}>✏️ {m._tasks.length}</span>}
                            {m.duration_minutes > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'rgba(139,92,246,.1)', color: '#8b5cf6' }}>⏱ {m.duration_minutes} min</span>}
                          </div>
                          <Btn onClick={() => onModClick(m)} style={{ width: '100%', justifyContent: 'center' }}>Modulga kirish<ChevronRight size={16} /></Btn>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : <EmptyState message="Modullar topilmadi. Avval kursga yoziling!" />}
              </div>
            )}

            {/* ══ LEADERBOARD ══ */}
            {tab === 'leaderboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)', padding: '40px 36px', borderRadius: 'var(--r)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                  <Crown style={{ position: 'absolute', right: -20, top: -20, width: 160, height: 160, opacity: .15 }} />
                  <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 32, margin: '0 0 6px' }}>Reyting Jadvali</h2>
                  <p style={{ opacity: .8, margin: 0 }}>Ko'proq dars tugatgan o'quvchilar yuqorida</p>
                </div>
                {leaderboard.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {leaderboard.map((s, i) => (
                      <Card key={s.id || i} style={{ padding: '16px 20px', border: i < 3 ? '1px solid var(--ac)' : '1px solid var(--br)', transition: 'all .2s' }} onMouseEnter={ev => ev.currentTarget.style.transform = 'translateX(4px)'} onMouseLeave={ev => ev.currentTarget.style.transform = ''}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 52, height: 52, borderRadius: 'var(--r2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: i < 3 ? 20 : 16, background: i === 0 ? GH.orange : i === 1 ? 'linear-gradient(135deg,#94a3b8,#64748b)' : i === 2 ? 'linear-gradient(135deg,#f97316,#ea580c)' : 'var(--bg3)', color: i < 3 ? '#fff' : 'var(--tx2)', flexShrink: 0 }}>
                              {i === 0 ? <Crown size={22} /> : i === 1 ? <Medal size={22} /> : i === 2 ? <Star size={22} /> : i + 1}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <img src={getAvatarSrc(s.avatar, s.full_name)} style={{ width: 48, height: 48, borderRadius: 'var(--r2)', objectFit: 'cover' }} alt={s.full_name} onError={ev => { ev.target.onerror = null; ev.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.full_name || 'U')}&background=6366f1&color=fff`; }} />
                              <div>
                                <h4 style={{ fontWeight: 800, fontSize: 15, color: 'var(--tx)', margin: '0 0 3px' }}>{s.full_name || "Noma'lum"}{s.id === currentUser.id && <span style={{ marginLeft: 8, fontSize: 10, background: 'rgba(99,102,241,.12)', color: 'var(--pr)', padding: '2px 8px', borderRadius: 99 }}>Siz</span>}</h4>
                                <p style={{ fontSize: 11, color: 'var(--tx3)', margin: 0 }}>✅ {s.completed_lessons || 0} dars · 📝 {s.completed_tests || 0} test</p>
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}><Trophy style={{ color: '#f59e0b' }} size={18} /><span style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--tx)' }}>{s.points || 0}</span></div>
                            <p style={{ fontSize: 10, color: 'var(--tx3)', textTransform: 'uppercase', margin: 0, fontWeight: 700 }}>Ball</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : <EmptyState message="Reyting topilmadi" />}
              </div>
            )}

            {/* ══ TYPING ══ */}
            {tab === 'typing' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777,#ef4444)', padding: '48px 40px', borderRadius: 'var(--r)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                  <Keyboard style={{ position: 'absolute', right: -40, bottom: -40, width: 280, height: 280, opacity: .1, transform: 'rotate(12deg)' }} />
                  <div style={{ position: 'relative' }}>
                    <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 40, margin: '0 0 8px' }}>Typing Test Arena</h1>
                    <p style={{ opacity: .85, margin: '0 0 24px', fontSize: 16 }}>Klaviatura tezligingizni sinab ko'ring!</p>
                    {typingStats && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                      {[["O'rtacha WPM", Math.round(typingStats.avg_wpm || 0)], ['Eng yaxshi', Math.round(typingStats.best_wpm || 0)], ['Testlar', typingStats.total_tests || 0]].map(([l, v]) => (
                        <div key={l} style={{ background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(8px)', padding: 16, borderRadius: 'var(--r2)' }}><p style={{ fontSize: 11, opacity: .8, margin: '0 0 4px' }}>{l}</p><p style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, margin: 0 }}>{v}</p></div>
                      ))}
                    </div>}
                  </div>
                </div>
                <Card style={{ padding: 24 }}>
                  <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--tx)', margin: '0 0 16px' }}>Test Boshlash</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Btn onClick={() => setShowSettings(true)} size="lg" style={{ justifyContent: 'center' }}><PlayCircle size={22} />Oddiy Test</Btn>
                    <Btn onClick={() => { setShowArena(true); fetchOnline(); }} variant="danger" size="lg" style={{ justifyContent: 'center' }}><Flame size={22} />Arena 1v1</Btn>
                  </div>
                </Card>
                <Card style={{ padding: 24 }}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                    {[['arena', '🔥 Arena', 'red'], ['general', '📊 Umumiy', 'blue']].map(([t, l, c]) => (
                      <button key={t} onClick={() => setLbTab(t)} style={{ padding: '9px 18px', borderRadius: 'var(--r3)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, background: lbTab === t ? (c === 'red' ? GH.red : GH.blue) : 'var(--bg3)', color: lbTab === t ? '#fff' : 'var(--tx2)' }}>{l}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(lbTab === 'arena' ? arenaLB : genLB).length > 0 ? (lbTab === 'arena' ? arenaLB : genLB).map((u, i) => (
                      <div key={u.id || i} style={{ padding: '12px 16px', borderRadius: 'var(--r2)', border: `1px solid ${i < 3 ? (lbTab === 'arena' ? 'rgba(239,68,68,.3)' : 'rgba(99,102,241,.3)') : 'var(--br)'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 38, height: 38, borderRadius: 'var(--r3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, background: i === 0 ? GH.orange : i === 1 ? 'linear-gradient(135deg,#94a3b8,#64748b)' : i === 2 ? GH.orange : 'var(--bg3)', color: i < 3 ? '#fff' : 'var(--tx2)', fontSize: 14 }}>{i + 1}</div>
                          <div><h4 style={{ fontWeight: 700, fontSize: 13, color: 'var(--tx)', margin: 0 }}>{u.full_name || u.username || 'Foydalanuvchi'}</h4><p style={{ fontSize: 10, color: 'var(--tx3)', margin: 0 }}>{lbTab === 'arena' ? `${u.total_arena_tests || 0} arena` : `${u.total_tests || 0} test`}</p></div>
                        </div>
                        <div style={{ textAlign: 'right' }}><p style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800, color: lbTab === 'arena' ? '#ef4444' : 'var(--pr)', margin: 0 }}>{lbTab === 'arena' ? (u.best_wpm || 0) : Number(u.avg_wpm || 0).toFixed(1)} WPM</p><p style={{ fontSize: 10, color: 'var(--tx3)', margin: 0 }}>{Number((lbTab === 'arena' ? u.best_accuracy : u.avg_accuracy) || 0).toFixed(1)}%</p></div>
                      </div>
                    )) : <EmptyState message="Reyting bo'sh" />}
                  </div>
                </Card>
              </div>
            )}

            {tab === 'chat'   && <ChatPanel currentUser={currentUser} />}
            {tab === 'stream' && <StreamViewerPanel currentUser={currentUser} />}

            {/* ══ SOZLAMALAR ══ */}
            {tab === 'settings' && (
              <div>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, color: 'var(--tx)', margin: '0 0 20px' }}>Sozlamalar</h2>
                <Card style={{ padding: 24 }}>
                  <h3 style={{ fontWeight: 800, fontSize: 16, color: 'var(--tx)', margin: '0 0 16px' }}>Profil</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: 16, background: 'var(--bg3)', borderRadius: 'var(--r2)' }}>
                    <img src={getAvatarSrc(currentUser.avatar, currentUser.full_name)} style={{ width: 72, height: 72, borderRadius: 'var(--r2)', objectFit: 'cover', border: '2px solid var(--br)' }} alt="profile" onError={ev => { ev.target.onerror = null; ev.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.full_name)}&background=6366f1&color=fff`; }} />
                    <div><p style={{ fontWeight: 800, fontSize: 16, color: 'var(--tx)', margin: 0 }}>{currentUser.full_name}</p><p style={{ fontSize: 11, color: 'var(--pr)', margin: '4px 0 0', fontWeight: 700 }}>ID: {currentUser.id}</p></div>
                  </div>
                  {[['ID', currentUser.id], ['Ism', currentUser.full_name], ['Telefon', currentUser.phone || 'N/A'], ['Email', currentUser.email || 'N/A'], ['Ballar', currentUser.points]].map(([l, v], i, a) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < a.length - 1 ? '1px solid var(--br)' : 'none' }}>
                      <span style={{ fontWeight: 600, color: 'var(--tx2)', fontSize: 13 }}>{l}</span>
                      <span style={{ fontWeight: 800, color: l === 'Ballar' ? 'var(--pr)' : 'var(--tx)', fontSize: 13 }}>{v}</span>
                    </div>
                  ))}
                </Card>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* ════ MODALS ════ */}

      {/* Typing settings */}
      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <Card style={{ maxWidth: 400, width: '100%', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--br)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: GH.blue }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Keyboard size={28} style={{ color: '#fff' }} /><div><h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, color: '#fff', margin: 0 }}>Test Parametrlari</h3><p style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', margin: 0 }}>Til, qiyinlik va vaqt</p></div></div>
              <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.7)' }}><X size={20} /></button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                ['Tilni tanlang', [['uz', "🇺🇿 O'zbek"], ['en', '🇬🇧 English'], ['ru', '🇷🇺 Русский']], lang, setLang],
                ['Qiyinlik', [['easy', '🟢 Oson'], ['medium', "🟡 O'rta"], ['hard', '🔴 Qiyin']], diff, setDiff],
                ['Vaqt', [[30, '30s'], [60, '60s'], [120, '120s']], dur, setDur]
              ].map(([label, opts, val, setV]) => (
                <div key={label}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--tx2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: .5 }}>{label}</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                    {opts.map(([v, l]) => <button key={v} onClick={() => setV(v)} style={{ padding: '10px 8px', borderRadius: 'var(--r3)', border: `1.5px solid ${val === v ? 'var(--pr)' : 'var(--br)'}`, background: val === v ? 'rgba(99,102,241,.1)' : 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12, color: val === v ? 'var(--pr)' : 'var(--tx2)' }}>{l}</button>)}
                  </div>
                </div>
              ))}
              <Btn onClick={() => startTyping(dur)} size="lg" style={{ width: '100%', justifyContent: 'center' }}><PlayCircle size={20} />Boshlash</Btn>
            </div>
          </Card>
        </div>
      )}

      {/* Arena modal */}
      {showArena && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <Card style={{ maxWidth: 600, width: '100%', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--br)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: GH.red }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Flame size={28} style={{ color: '#fff' }} /><div><h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, color: '#fff', margin: 0 }}>Arena 1v1</h3><p style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', margin: 0 }}>Raqibingizni tanlang</p></div></div>
              <button onClick={() => setShowArena(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.7)' }}><X size={20} /></button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                {[
                  ['Vaqt', [[30, '30s'], [60, '60s'], [120, '120s']], dur, setDur, '#ef4444'],
                  ['Til', [['uz', 'UZ'], ['en', 'EN'], ['ru', 'RU']], lang, setLang, '#ef4444']
                ].map(([label, opts, val, setV, ac]) => (
                  <div key={label}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--tx2)', marginBottom: 8, textTransform: 'uppercase' }}>{label}</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
                      {opts.map(([v, l]) => <button key={v} onClick={() => setV(v)} style={{ padding: '8px 6px', borderRadius: 'var(--r3)', border: `1.5px solid ${val === v ? ac : 'var(--br)'}`, background: val === v ? 'rgba(239,68,68,.1)' : 'none', cursor: 'pointer', fontWeight: 700, fontSize: 11, color: val === v ? ac : 'var(--tx2)' }}>{l}</button>)}
                    </div>
                  </div>
                ))}
              </div>
              <h4 style={{ fontWeight: 800, fontSize: 14, color: 'var(--tx)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}><Users size={16} style={{ color: '#10b981' }} />Online ({onlineUsers.length})</h4>
              <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {onlineUsers.length > 0 ? onlineUsers.map(u => (
                  <button key={u.id} onClick={() => setSelOpp(u)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 'var(--r2)', border: `1.5px solid ${selOpp?.id === u.id ? '#ef4444' : 'var(--br)'}`, background: selOpp?.id === u.id ? 'rgba(239,68,68,.08)' : 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <img src={getAvatarSrc(u.avatar, u.full_name)} style={{ width: 44, height: 44, borderRadius: 'var(--r3)', objectFit: 'cover' }} alt={u.full_name} />
                    <div style={{ flex: 1 }}><h5 style={{ fontWeight: 700, fontSize: 13, color: 'var(--tx)', margin: 0 }}>{u.full_name}</h5><p style={{ fontSize: 11, color: 'var(--tx3)', margin: 0 }}>⚡ {u.best_wpm || 0} WPM</p></div>
                    {selOpp?.id === u.id && <Check size={18} style={{ color: '#ef4444' }} />}
                  </button>
                )) : <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--tx3)' }}><Users size={36} style={{ margin: '0 auto 10px', opacity: .3, display: 'block' }} /><p style={{ fontWeight: 700, fontSize: 13 }}>Online foydalanuvchilar yo'q</p></div>}
              </div>
              {selOpp && <Btn variant="danger" size="lg" onClick={() => { sendArena(selOpp.id); setShowArena(false); }} style={{ width: '100%', justifyContent: 'center' }}><Send size={18} />Challenge Yuborish</Btn>}
            </div>
          </Card>
        </div>
      )}

      {/* Typing modal */}
      {typingMode && curTest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.95)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <Card style={{ maxWidth: 900, width: '100%', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--br)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {arenaMode && <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,.1)', color: '#ef4444', padding: '6px 12px', borderRadius: 'var(--r3)', fontWeight: 800, fontSize: 12 }}><Flame size={16} />ARENA 1v1</span>}
                <div><h3 style={{ fontWeight: 800, fontSize: 15, color: 'var(--tx)', margin: 0 }}>{curTest.title}</h3><p style={{ fontSize: 11, color: 'var(--tx3)', margin: 0 }}>{lang.toUpperCase()} | {diff}</p></div>
              </div>
              <button onClick={closeTyping} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx3)' }}><X size={22} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, padding: '14px 18px', background: 'var(--bg3)' }}>
              {[
                ['WPM', Math.round(wpm), 'var(--pr)'],
                ['ANIQLIK', `${curTest.text ? Math.round(((curTest.text.length - errs) / curTest.text.length) * 100) : 0}%`, '#10b981'],
                ['XATOLAR', errs, '#ef4444'],
                ['VAQT', tLimit ? `${Math.floor(elapsed)}/${tLimit}s` : `${Math.floor(elapsed)}s`, '#8b5cf6']
              ].map(([l, v, c]) => (
                <div key={l} style={{ textAlign: 'center' }}><p style={{ fontSize: 10, color: 'var(--tx3)', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 700 }}>{l}</p><p style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color: c, margin: 0 }}>{v}</p></div>
              ))}
            </div>
            <div style={{ padding: 24 }}>
              {!finished ? (
                <>
                  <div style={{ background: 'var(--bg3)', padding: 24, borderRadius: 'var(--r2)', marginBottom: 16, minHeight: 180 }}>{renderWords()}</div>
                  <textarea ref={typingRef} value={uInput} onChange={onTypeInput} rows={3} autoFocus placeholder="Boshlash uchun yozishni boshlang..."
                    style={{ width: '100%', padding: '14px 16px', border: '2px solid var(--pr)', borderRadius: 'var(--r2)', background: 'var(--bg3)', fontSize: 16, color: 'var(--tx)', outline: 'none', resize: 'none', fontFamily: 'DM Mono,monospace', boxSizing: 'border-box' }} />
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ width: 80, height: 80, background: GH.green, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><CheckCircle2 size={40} style={{ color: '#fff' }} /></div>
                  {typRes && <>
                    <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 32, fontWeight: 800, color: 'var(--tx)', margin: '0 0 24px' }}>{arenaMode ? '🔥 Arena!' : '✅ Tugadi!'}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, maxWidth: 480, margin: '0 auto 24px' }}>
                      {[['WPM', 'var(--pr)', typRes.wpm || 0], ['Aniqlik', '#10b981', `${(typRes.accuracy || 0).toFixed(1)}%`], ['Vaqt', '#8b5cf6', `${typRes.time_taken || 0}s`]].map(([l, c, v]) => (
                        <div key={l} style={{ padding: 20, borderRadius: 'var(--r2)', border: '1px solid var(--br)', background: 'var(--bg3)' }}><p style={{ fontSize: 11, color: c, margin: '0 0 6px', fontWeight: 700, textTransform: 'uppercase' }}>{l}</p><p style={{ fontFamily: 'Syne,sans-serif', fontSize: 30, fontWeight: 800, color: 'var(--tx)', margin: 0 }}>{v}</p></div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                      <Btn onClick={() => startTyping(dur)} size="lg"><RotateCcw size={18} />Qayta</Btn>
                      <Btn onClick={closeTyping} variant="ghost" size="lg">Yopish</Btn>
                    </div>
                  </>}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Modul overview */}
      {selMod && !modSection && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <Card style={{ maxWidth: 800, width: '100%', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--br)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--tx)', margin: '0 0 4px' }}>{selMod.title}</h2>
                  <p style={{ fontSize: 12, color: 'var(--tx3)', margin: 0 }}>{selMod.course_name}</p>
                </div>
                <button onClick={closeMod} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx3)' }}><X size={22} /></button>
              </div>
            </div>
            <div style={{ padding: 24, overflowY: 'auto' }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 16px' }}>Bo'limlar</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
                {[
                  ['videos',      GH.blue,   <Video size={28} />,    'Video Darsliklar', 'Video va maqolalar',    modLessons.length],
                  ['assignments', GH.green,  <FileText size={28} />, 'Topshiriqlar',     'Amaliy vazifalar',      modTasks.length],
                  ['tests',       GH.orange, <Trophy size={28} />,   'Testlar',          "Bilimingizni sinang",   modTests.length],
                ].map(([sec, bg, icon, title, sub, cnt]) => (
                  <button key={sec} onClick={() => cnt > 0 ? setModSection(sec) : toast(`${title} mavjud emas`, { icon: 'ℹ️' })}
                    style={{ background: bg, padding: '24px 20px', borderRadius: 'var(--r2)', color: '#fff', textAlign: 'left', border: 'none', cursor: cnt > 0 ? 'pointer' : 'default', opacity: cnt > 0 ? 1 : 0.6, transition: 'transform .2s', boxShadow: '0 4px 16px rgba(0,0,0,.15)' }}
                    onMouseEnter={ev => { if (cnt > 0) ev.currentTarget.style.transform = 'scale(1.04)'; }} onMouseLeave={ev => ev.currentTarget.style.transform = 'scale(1)'}>
                    <div style={{ width: 52, height: 52, background: 'rgba(255,255,255,.15)', borderRadius: 'var(--r2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>{icon}</div>
                    <h4 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, margin: '0 0 4px' }}>{title}</h4>
                    <p style={{ fontSize: 12, opacity: .8, margin: '0 0 14px' }}>{sub}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800 }}>{cnt}</span>
                      <ChevronRight size={20} />
                    </div>
                  </button>
                ))}
              </div>

              {/* Kategoriyalanmagan darslarni ko'rsatish */}
              {modLessons.length === 0 && modTests.length === 0 && modTasks.length === 0 && selMod.lessons.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <p style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700, marginBottom: 12 }}>⚠️ Darslar turi aniqlanmagan — hammasi ko'rsatilmoqda:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selMod.lessons.map((l, i) => (
                      <div key={l.id || i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 'var(--r2)', border: '1px solid var(--br)', background: 'none' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 'var(--r3)', background: 'rgba(99,102,241,.1)', color: 'var(--pr)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{l.is_completed ? <CheckCircle2 size={18} style={{ color: '#10b981' }} /> : i + 1}</div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontWeight: 700, fontSize: 13, color: 'var(--tx)', margin: 0 }}>{l.title || `Dars ${i + 1}`}</h4>
                          <p style={{ fontSize: 10, color: 'var(--tx3)', margin: 0 }}>{l.lesson_type || l.type || 'lesson'}</p>
                        </div>
                        <Btn size="sm" onClick={() => setSelLesson(l)}><PlayCircle size={13} />Ko'rish</Btn>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Modul bo'lim ko'rinishi */}
      {selMod && modSection && (() => {
        const isVid  = modSection === 'videos';
        const isTsk  = modSection === 'assignments';
        const isTest = modSection === 'tests';
        const items  = isVid ? modLessons : isTsk ? modTasks : modTests;
        const sectionTitle = isVid ? 'Video Darsliklar' : isTsk ? 'Topshiriqlar' : 'Testlar';
        const acColor = isVid ? 'var(--pr)' : isTsk ? '#10b981' : '#f59e0b';
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <Card style={{ maxWidth: 800, width: '100%', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--br)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <button onClick={() => setModSection(null)} style={{ width: 34, height: 34, borderRadius: 'var(--r3)', border: 'none', background: 'var(--bg3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tx2)' }}><ArrowLeft size={16} /></button>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontWeight: 800, fontSize: 18, color: 'var(--tx)', margin: 0 }}>{sectionTitle}</h2>
                  <p style={{ fontSize: 11, color: 'var(--tx3)', margin: 0 }}>{selMod.title} · {items.length} ta element</p>
                </div>
                <button onClick={closeMod} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx3)' }}><X size={20} /></button>
              </div>
              <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.length > 0 ? items.map((item, i) => (
                  <div key={item.id || i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 'var(--r2)', border: '1px solid var(--br)', background: item.is_completed ? 'rgba(16,185,129,.04)' : 'none', transition: 'border .15s' }}
                    onMouseEnter={ev => ev.currentTarget.style.borderColor = acColor} onMouseLeave={ev => ev.currentTarget.style.borderColor = item.is_completed ? 'rgba(16,185,129,.3)' : 'var(--br)'}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--r3)', background: item.is_completed ? 'rgba(16,185,129,.15)' : `${acColor}18`, color: item.is_completed ? '#10b981' : acColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                      {item.is_completed ? <CheckCircle2 size={20} /> : i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontWeight: 700, fontSize: 14, color: 'var(--tx)', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title || `Element ${i + 1}`}</h4>
                      <div style={{ display: 'flex', gap: 10, fontSize: 10, color: 'var(--tx3)', flexWrap: 'wrap' }}>
                        {isVid  && <span>{(item.lesson_type || item.type) === 'video' ? '🎥 Video' : '📄 Maqola'}</span>}
                        {isTsk  && item.deadline && <span>📅 {new Date(item.deadline).toLocaleDateString('uz-UZ')}</span>}
                        {isTest && (item.quiz?.questions || item.questions) && <span>❓ {(item.quiz?.questions || item.questions || []).length} savol</span>}
                        {item.is_completed && <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Tugatilgan</span>}
                        {item.is_submitted && !item.is_completed && <span style={{ color: '#f59e0b', fontWeight: 700 }}>⏳ Tekshirilmoqda</span>}
                      </div>
                    </div>
                    {isVid && <Btn size="sm" onClick={() => setSelLesson(item)}><PlayCircle size={13} />Ko'rish</Btn>}
                    {isTsk && (
                      item.is_submitted || item.is_completed
                        ? <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', padding: '6px 12px', borderRadius: 'var(--r3)', background: 'rgba(16,185,129,.1)' }}>✓ Topshirilgan</span>
                        : <Btn size="sm" variant="success" onClick={() => { setSelTask(item); setTaskFile(null); }}>Topshirish</Btn>
                    )}
                    {isTest && (
                      item.is_completed
                        ? <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', padding: '6px 12px', borderRadius: 'var(--r3)', background: 'rgba(16,185,129,.1)' }}>✓ Tugallangan</span>
                        : <Btn size="sm" variant="outline" onClick={() => startQuiz(item)} style={{ borderColor: acColor, color: acColor }}>Boshlash</Btn>
                    )}
                  </div>
                )) : (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, textAlign: 'center' }}>
                    <AlertTriangle size={40} style={{ color: 'var(--tx3)', opacity: .3, marginBottom: 12 }} />
                    <p style={{ color: 'var(--tx3)', fontWeight: 700 }}>{sectionTitle} mavjud emas</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        );
      })()}

      {/* Dars ko'rish */}
      {selLesson && (() => {
        const embed  = getYouTubeEmbedUrl(selLesson.video_url || selLesson.video);
        const isVideo = !!(selLesson.video_url || selLesson.video);
        const isYT    = (selLesson.video_url || selLesson.video || '').includes('youtube') || (selLesson.video_url || selLesson.video || '').includes('youtu.be');
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.9)', backdropFilter: 'blur(8px)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <Card style={{ maxWidth: 900, width: '100%', maxHeight: '94vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--br)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <h2 style={{ fontWeight: 800, fontSize: 16, color: 'var(--tx)', margin: 0 }}>{selLesson.title}</h2>
                <button onClick={() => setSelLesson(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx3)' }}><X size={20} /></button>
              </div>
              <div style={{ overflowY: 'auto', flex: 1, padding: 20 }}>
                {isVideo && (
                  <div style={{ aspectRatio: '16/9', background: '#000', borderRadius: 'var(--r2)', overflow: 'hidden', marginBottom: 16 }}>
                    {isYT
                      ? <iframe style={{ width: '100%', height: '100%', border: 'none' }} src={embed || ''} title={selLesson.title} allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen />
                      : <video controls style={{ width: '100%', height: '100%' }} src={selLesson.video_url || selLesson.video} />
                    }
                  </div>
                )}
                {selLesson.content && (
                  <div style={{ background: 'var(--bg3)', padding: 24, borderRadius: 'var(--r2)', marginBottom: 16 }} dangerouslySetInnerHTML={{ __html: selLesson.content }} />
                )}
                {selLesson.description && (
                  <div style={{ background: 'rgba(99,102,241,.06)', border: '1px solid rgba(99,102,241,.2)', padding: 16, borderRadius: 'var(--r2)', marginBottom: 16 }}>
                    <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--pr)', textTransform: 'uppercase', margin: '0 0 6px' }}>Dars haqida</p>
                    <p style={{ fontSize: 13, color: 'var(--tx2)', margin: 0 }}>{selLesson.description}</p>
                  </div>
                )}
                {!isVideo && !selLesson.content && !selLesson.description && (
                  <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--tx3)' }}>
                    <AlertCircle size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: .3 }} />
                    <p style={{ fontWeight: 700 }}>Kontent topilmadi</p>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <Btn onClick={() => setSelLesson(null)} variant="ghost">Yopish</Btn>
                  {selLesson.is_completed
                    ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 'var(--r2)', background: 'rgba(16,185,129,.1)', color: '#10b981', fontWeight: 700, fontSize: 14 }}><CheckCircle2 size={18} />Tugatilgan</span>
                    : <Btn onClick={completeLesson} variant="success" disabled={doneLesson}>
                      {doneLesson
                        ? <><div style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />Yuklanmoqda...</>
                        : <><CheckCircle2 size={16} />Darsni Tugatdim</>
                      }
                    </Btn>
                  }
                </div>
              </div>
            </Card>
          </div>
        );
      })()}

      {/* Test (Quiz) */}
      {selQuiz && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
          <Card style={{ maxWidth: 680, width: '100%', margin: '16px auto', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--br)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 18, color: 'var(--tx)', margin: '0 0 4px' }}>{selQuiz.title}</h2>
                <p style={{ fontSize: 11, color: 'var(--tx3)', margin: 0 }}>⏱ {selQuiz.duration} daq · ✅ {selQuiz.passing_score}% · 📝 {selQuiz.questions?.length || 0} savol</p>
              </div>
              <button onClick={() => { setSelQuiz(null); setQuizAns({}); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx3)' }}><X size={20} /></button>
            </div>
            <div style={{ padding: 20, maxHeight: '65vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {selQuiz.questions?.map((q, qi) => (
                <div key={q.id || qi} style={{ background: 'var(--bg3)', padding: 20, borderRadius: 'var(--r2)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--r3)', background: 'rgba(245,158,11,.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>{qi + 1}</div>
                    <h4 style={{ fontWeight: 800, fontSize: 14, color: 'var(--tx)', flex: 1, margin: 0, lineHeight: 1.5 }}>{q.text || q.question}</h4>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 48 }}>
                    {(q.options || q.choices || []).map(opt => {
                      const optId = opt.id || opt.value;
                      const selected = Array.isArray(quizAns[q.id]) ? quizAns[q.id][0] === optId : quizAns[q.id] === optId;
                      return (
                        <button key={optId} onClick={() => setQuizAns(p => ({ ...p, [q.id]: [optId] }))} style={{ textAlign: 'left', padding: '11px 16px', borderRadius: 'var(--r3)', border: `1.5px solid ${selected ? '#f59e0b' : 'var(--br)'}`, background: selected ? 'rgba(245,158,11,.1)' : 'none', cursor: 'pointer', fontWeight: 500, fontSize: 13, color: 'var(--tx)' }}>
                          {opt.text || opt.label || opt.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--br)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg3)' }}>
              <span style={{ fontSize: 12, color: 'var(--tx3)' }}>{Object.keys(quizAns).length}/{selQuiz.questions?.length || 0} javob</span>
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn onClick={() => { setSelQuiz(null); setQuizAns({}); }} variant="ghost">Bekor</Btn>
                <Btn onClick={submitQuiz} variant="outline" disabled={sendingQuiz || Object.keys(quizAns).length < (selQuiz.questions?.length || 0)} style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>
                  {sendingQuiz
                    ? <><div style={{ width: 14, height: 14, border: '2px solid #f59e0b', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />Tekshirilmoqda...</>
                    : <><Trophy size={16} />Yakunlash</>
                  }
                </Btn>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Topshiriq yuborish */}
      {selTask && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <Card style={{ maxWidth: 480, width: '100%', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--br)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontWeight: 800, fontSize: 18, color: 'var(--tx)', margin: 0 }}>Vazifa topshirish</h2>
              <button onClick={() => { setSelTask(null); setTaskFile(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx3)' }}><X size={20} /></button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--bg3)', padding: 16, borderRadius: 'var(--r2)' }}>
                <h4 style={{ fontWeight: 800, fontSize: 15, color: 'var(--tx)', margin: '0 0 6px' }}>{selTask.title}</h4>
                <p style={{ fontSize: 13, color: 'var(--tx2)', margin: 0 }}>{selTask.description || "Vazifa tavsifi mavjud emas"}</p>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 10, color: 'var(--tx2)' }}>Fayl yuklash</label>
                <div style={{ border: '2px dashed var(--br)', borderRadius: 'var(--r2)', padding: 32, textAlign: 'center', cursor: 'pointer', transition: 'border .15s' }}
                  onMouseEnter={ev => ev.currentTarget.style.borderColor = '#10b981'} onMouseLeave={ev => ev.currentTarget.style.borderColor = 'var(--br)'}>
                  <input type="file" id="tFile" style={{ display: 'none' }} onChange={e => {
                    const f = e.target.files?.[0];
                    if (f && f.size <= 50 * 1024 * 1024) { setTaskFile(f); toast.success(`Fayl: ${f.name}`); }
                    else if (f) toast.error('50MB dan oshmasin!');
                  }} />
                  <label htmlFor="tFile" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <Upload size={40} style={{ color: 'var(--tx3)' }} />
                    <p style={{ fontWeight: 600, color: 'var(--tx2)', margin: 0, fontSize: 13 }}>Faylni tanlang (maks 50MB)</p>
                  </label>
                </div>
                {taskFile && <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(16,185,129,.08)', borderRadius: 'var(--r2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={16} style={{ color: '#10b981' }} /><span style={{ fontWeight: 600, fontSize: 12, color: 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{taskFile.name}</span></div>
                  <span style={{ fontSize: 10, color: 'var(--tx3)' }}>{(taskFile.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn onClick={() => { setSelTask(null); setTaskFile(null); }} variant="ghost" style={{ flex: 1, justifyContent: 'center' }}>Bekor</Btn>
                <Btn onClick={submitTask} variant="success" disabled={!taskFile || sendingTask} style={{ flex: 1, justifyContent: 'center' }}>
                  {sendingTask
                    ? <><div style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />Yuborilmoqda...</>
                    : <><Upload size={15} />Topshirish</>
                  }
                </Btn>
              </div>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}