import React, { useState, useEffect, useRef, useCallback } from 'react';
import Hls from 'hls.js';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Radio, Users2, Send, MessageCircle, X,
  AlertTriangle, Eye, Volume2, VolumeX, Maximize, Wifi, WifiOff
} from 'lucide-react';
import api, { WS_HOST } from '../utils/api';
import { getAvatarSrc, formatTime } from '../utils/api';
import { Avatar, Spinner } from './UI';

const STREAM_REACTIONS = ['👍','❤️','😂','🔥','👏','🎉'];

export default function StreamViewerPanel({ currentUser }) {
  const [liveStreams,    setLiveStreams]    = useState([]);
  const [activeStream,  setActiveStream]  = useState(null);
  const [playbackUrl,   setPlaybackUrl]   = useState(null);
  const [chatMsgs,      setChatMsgs]      = useState([]);
  const [chatInput,     setChatInput]     = useState('');
  const [viewers,       setViewers]       = useState(0);
  const [wsConnected,   setWsConnected]   = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [videoError,    setVideoError]    = useState(null);
  const [videoLoading,  setVideoLoading]  = useState(false);
  const [isMuted,       setIsMuted]       = useState(false);
  const [floatingReactions, setFloatingReactions] = useState([]);

  const wsRef      = useRef(null);
  const chatEndRef = useRef(null);
  const videoRef   = useRef(null);
  const hlsRef     = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const fetchLive = async () => {
      if (!cancelled) setLoading(true);
      try {
        const res  = await api.get('/stream/live/');
        const list = res.data.results ?? res.data ?? [];
        if (!cancelled) setLiveStreams(list);
      } catch {}
      finally { if (!cancelled) setLoading(false); }
    };
    fetchLive();
    const iv = setInterval(fetchLive, 15000);
    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  useEffect(() => {
    if (!activeStream) return;
    let cancelled = false;
    const fetchDetail = async () => {
      if (!cancelled) { setVideoLoading(true); setVideoError(null); setPlaybackUrl(null); }
      try {
        const res = await api.get(`/stream/${activeStream.uid || activeStream.id}/`);
        if (!cancelled) {
          const url = res.data?.playback_url || null;
          setPlaybackUrl(url);
          if (!url) setVideoError('Video URL hali tayyor emas');
        }
      } catch {
        if (!cancelled) {
          const fallback = activeStream.playback_url || null;
          setPlaybackUrl(fallback);
          if (!fallback) setVideoError('Video manbasini yuklashda xatolik');
        }
      }
      finally { if (!cancelled) setVideoLoading(false); }
    };
    fetchDetail();
    return () => { cancelled = true; };
  }, [activeStream]);

  useEffect(() => {
    if (!playbackUrl || !videoRef.current) return;
    const isHls = playbackUrl.includes('.m3u8');
    if (isHls) {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hlsRef.current = hls;
        hls.loadSource(playbackUrl);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => videoRef.current?.play().catch(() => {}));
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) setVideoError('Video oqimida xatolik. Qayta urinib ko\'ring.');
        });
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = playbackUrl;
        videoRef.current.play().catch(() => {});
      } else {
        setVideoError('Brauzeringiz HLS formatini qo\'llab-quvvatlamaydi');
      }
    } else {
      videoRef.current.src = playbackUrl;
      videoRef.current.play().catch(() => {});
    }
    return () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
      if (videoRef.current) { videoRef.current.pause(); videoRef.current.src = ''; }
    };
  }, [playbackUrl]);

  useEffect(() => {
    if (!activeStream?.uid) return;
    const token = localStorage.getItem('access_token') || '';
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws    = new WebSocket(`${proto}://${WS_HOST}/ws/stream/${activeStream.uid}/?token=${token}`);
    wsRef.current = ws;
    ws.onopen  = () => { setWsConnected(true); setChatMsgs([]); };
    ws.onclose = () => setWsConnected(false);
    ws.onerror = () => setWsConnected(false);
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'chat') {
          setChatMsgs(prev => [...prev.slice(-200), data]);
          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        }
        if (data.type === 'viewer_count') setViewers(data.count);
        if (data.type === 'stream_event' && data.event === 'ended') {
          toast('Efir tugadi 📺', { icon: '📺' });
          setActiveStream(prev => prev ? { ...prev, status: 'ended' } : null);
          setLiveStreams(prev => prev.filter(s => s.uid !== activeStream.uid));
        }
        if (data.type === 'reaction') {
          const id = `${Date.now()}-${Math.random()}`;
          setFloatingReactions(prev => [...prev.slice(-10), { id, emoji: data.emoji, sender: data.sender }]);
          setTimeout(() => setFloatingReactions(prev => prev.filter(r => r.id !== id)), 2500);
        }
        if (data.type === 'announce') {
          toast.success(`📢 ${data.teacher}: ${data.text}`, { duration: 5000 });
        }
      } catch {}
    };
    return () => { ws.close(1000); wsRef.current = null; };
  }, [activeStream?.uid]);

  const sendChat = useCallback(() => {
    const text = chatInput.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: 'chat', content: text }));
    setChatInput('');
  }, [chatInput]);

  const sendReaction = useCallback((emoji) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: 'reaction', emoji }));
  }, []);

  const joinStream = useCallback((stream) => {
    setActiveStream(stream);
    setViewers(stream.viewer_count || 0);
    setChatMsgs([]);
    setVideoError(null);
    setPlaybackUrl(null);
  }, []);

  const leaveStream = useCallback(() => {
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.src = ''; }
    if (wsRef.current) { wsRef.current.close(1000); wsRef.current = null; }
    setActiveStream(null); setPlaybackUrl(null); setChatMsgs([]);
    setWsConnected(false); setVideoError(null); setVideoLoading(false);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size={32} className="text-rose-500" />
    </div>
  );

  if (activeStream) {
    const isLive = activeStream.status === 'live';
    return (
      <div className="flex flex-col h-[calc(100vh-10rem)] rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={leaveStream} className="p-2 hover:bg-slate-800 rounded-xl transition">
              <ArrowLeft size={18} className="text-slate-300" />
            </button>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase flex items-center gap-1.5 ${
                isLive ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-slate-500'}`} />
                {isLive ? 'LIVE' : 'Tugagan'}
              </span>
              <div>
                <h3 className="font-black text-white text-sm">{activeStream.title}</h3>
                <p className="text-[11px] text-slate-400">{activeStream.teacher_name}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-xl text-xs font-bold text-slate-300">
              <Users2 size={12} className="text-indigo-400" /> {viewers}
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold ${
              wsConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
            }`}>
              {wsConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
              {wsConnected ? 'Ulangan' : 'Ulanmoqda'}
            </div>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Video */}
          <div className="flex-1 flex flex-col bg-black relative">
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
              {/* LIVE badge */}
              {isLive && (
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-rose-600 px-3 py-1.5 rounded-full text-xs font-black text-white pointer-events-none">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" /> LIVE
                </div>
              )}
              {/* Viewer count */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-black/70 px-3 py-1.5 rounded-full text-xs font-bold text-white backdrop-blur-sm pointer-events-none">
                <Eye size={12} className="text-rose-400" /> {viewers}
              </div>

              {/* Floating reactions */}
              <div className="absolute bottom-20 left-4 z-20 flex flex-col gap-1 pointer-events-none">
                {floatingReactions.map(r => (
                  <div key={r.id} className="flex items-center gap-1.5 bg-black/60 rounded-full px-2.5 py-1 backdrop-blur-sm animate-[fadeUp_2.5s_ease-out_forwards]">
                    <span className="text-lg">{r.emoji}</span>
                    <span className="text-xs text-white/80 font-medium">{r.sender}</span>
                  </div>
                ))}
              </div>

              {isLive ? (
                videoLoading ? (
                  <div className="flex flex-col items-center gap-4 text-white">
                    <Spinner size={40} className="text-rose-500" />
                    <p className="text-sm text-white/50">Video yuklanmoqda...</p>
                  </div>
                ) : playbackUrl ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    controls
                    playsInline
                    autoPlay
                    muted={isMuted}
                    onError={() => setVideoError('Videoni yuklashda xatolik')}
                  />
                ) : videoError ? (
                  <div className="flex flex-col items-center gap-4 text-white text-center px-8">
                    <AlertTriangle size={44} className="text-amber-400" />
                    <p className="font-bold">{videoError}</p>
                    <button
                      onClick={() => {
                        setVideoLoading(true); setVideoError(null);
                        api.get(`/stream/${activeStream.uid || activeStream.id}/`)
                          .then(r => { setPlaybackUrl(r.data?.playback_url || null); if (!r.data?.playback_url) setVideoError('URL hali tayyor emas'); })
                          .catch(() => setVideoError('Xatolik'))
                          .finally(() => setVideoLoading(false));
                      }}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition text-sm"
                    >
                      Qayta urinish
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 text-white text-center px-8">
                    <div className="w-24 h-24 rounded-full bg-rose-500/10 flex items-center justify-center">
                      <Radio size={44} className="text-rose-400 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-black">{activeStream.title}</h3>
                    <p className="text-white/40 text-sm">{activeStream.teacher_name} efir tayyorlanmoqda...</p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center gap-4 text-white/30">
                  <Radio size={56} />
                  <p className="font-bold">Efir tugadi</p>
                </div>
              )}

              {/* Mute btn */}
              {playbackUrl && (
                <button
                  onClick={() => setIsMuted(p => !p)}
                  className="absolute bottom-4 left-4 z-10 p-2.5 bg-black/60 rounded-xl backdrop-blur-sm hover:bg-black/80 transition"
                >
                  {isMuted
                    ? <VolumeX size={18} className="text-rose-400" />
                    : <Volume2 size={18} className="text-white" />}
                </button>
              )}
            </div>

            {/* Reaction bar */}
            {isLive && (
              <div className="flex items-center justify-center gap-3 p-3 bg-black/60 backdrop-blur-sm shrink-0">
                {STREAM_REACTIONS.map(emoji => (
                  <button key={emoji} onClick={() => sendReaction(emoji)}
                    className="w-10 h-10 text-2xl hover:scale-150 active:scale-90 transition-transform">
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat panel */}
          <div className="w-72 flex-shrink-0 flex flex-col border-l border-slate-800 bg-slate-950">
            <div className="px-4 py-3.5 border-b border-slate-800 shrink-0">
              <h4 className="font-black text-sm text-white">Jonli Chat</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">{chatMsgs.filter(m => !m.role).length} xabar</p>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-slate-950/80">
              {chatMsgs.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center gap-2 text-slate-600">
                  <MessageCircle size={28} />
                  <p className="text-xs font-semibold">Hali xabar yo'q</p>
                </div>
              ) : chatMsgs.map((msg, i) => {
                const isMe = msg.sender === currentUser.full_name;
                return (
                  <div key={i} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 ${
                      msg.role === 'teacher' ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {(msg.sender || '?')[0].toUpperCase()}
                    </div>
                    <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <p className={`text-[10px] font-bold mb-0.5 ${msg.role === 'teacher' ? 'text-rose-400' : 'text-slate-500'}`}>
                        {msg.sender}{msg.role === 'teacher' ? ' 👨‍🏫' : ''}
                      </p>
                      <div className={`px-2.5 py-1.5 rounded-xl text-xs ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-tr-sm'
                          : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {isLive && (
              <div className="px-3 py-3 border-t border-slate-800 bg-slate-950 shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') sendChat(); }}
                    placeholder="Xabar yozing..."
                    className="flex-1 px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                  <button onClick={sendChat} disabled={!chatInput.trim()}
                    className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-700 active:scale-90 transition disabled:opacity-30">
                    <Send size={14} className="text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Streams list
  return (
    <div className="space-y-6">
      <div className="relative bg-gradient-to-br from-rose-900 via-rose-800 to-red-900 p-10 rounded-3xl text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 50%)' }} />
        <Radio className="absolute -right-8 -bottom-8 w-56 h-56 text-white/10" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-rose-500 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 bg-white rounded-full" /> JONLI
            </span>
          </div>
          <h2 className="text-4xl font-black mb-2">Jonli Efirlar</h2>
          <p className="text-white/60">O'qituvchilaringizning real-time darslarini kuzating</p>
        </div>
      </div>

      {liveStreams.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 p-16 rounded-3xl text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Radio size={36} className="text-slate-600" />
          </div>
          <h3 className="text-lg font-black text-white mb-2">Hozircha jonli efir yo'q</h3>
          <p className="text-slate-500 text-sm">O'qituvchi efir boshlaganda bu yerda ko'rinadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {liveStreams.map(stream => (
            <div key={stream.id || stream.uid}
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden group hover:border-rose-500/50 transition-all shadow-lg hover:shadow-rose-500/5">
              <div className="relative h-44 bg-gradient-to-br from-rose-950 to-black flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 flex items-center justify-center">
                  <Radio size={32} className="text-rose-400 animate-pulse" />
                </div>
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-rose-600 text-white px-2.5 py-1 rounded-full text-[11px] font-black">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" /> LIVE
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded-full text-[11px] font-bold">
                  <Eye size={11} className="text-rose-400" /> {stream.viewer_count || 0}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-black text-white text-base mb-1 line-clamp-1">{stream.title}</h3>
                <p className="text-sm text-slate-400 mb-0.5">👨‍🏫 {stream.teacher_name}</p>
                {stream.course_title && <p className="text-xs text-slate-500 mb-4">📚 {stream.course_title}</p>}
                <button
                  onClick={() => joinStream(stream)}
                  className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-xl font-bold text-sm hover:from-rose-700 hover:to-red-700 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
                >
                  <Eye size={15} /> Ko'rish
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}