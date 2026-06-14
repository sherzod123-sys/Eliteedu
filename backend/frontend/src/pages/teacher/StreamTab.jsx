import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Radio, VideoOff, Users2, PlusCircle, X,
  Send, Trash2, MessageCircle,
  Mic, MicOff, Camera, CameraOff, Play, Pause, Clock, Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosConfig';

// ✅ FIX 1: CSRF interceptor va withCredentials faqat bir marta,
//    komponent ichida useEffect orqali qo'shiladi — takroriy qo'shilmaydi.
//    axiosInstance.defaults.withCredentials = true ni ham shu yerda qoldiramiz
//    lekin interceptor component OUTSIDE emas.

export default function StreamTab({ T, theme, courses }) {
  const [streams, setStreams] = useState([]);
  const [activeStream, setActiveStream] = useState(null);
  const [streamModal, setStreamModal] = useState(false);
  const [streamForm, setStreamForm] = useState({
    title: '',
    description: '',
    course: '',
    scheduled_at: '',
    playback_url: '',
  });

  // WebSocket
  const [streamConnected, setStreamConnected] = useState(false);
  const streamWsRef = useRef(null);

  // Chat
  const [streamChatMsgs, setStreamChatMsgs] = useState([]);
  const [streamChatInput, setStreamChatInput] = useState('');
  const [streamViewers, setStreamViewers] = useState(0);
  const streamChatEndRef = useRef(null);

  // Camera & Media
  const [localStream, setLocalStream] = useState(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const localStreamRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // ✅ FIX 2: CSRF interceptor faqat bir marta mount bo'lganda qo'shiladi,
  //    unmount bo'lganda olib tashlanadi — interceptor to'planmaydi.
  useEffect(() => {
    axiosInstance.defaults.withCredentials = true;

    const interceptorId = axiosInstance.interceptors.request.use((config) => {
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
      return config;
    });

    // Cleanup: component unmount bo'lganda interceptorni olib tashlash
    return () => {
      axiosInstance.interceptors.request.eject(interceptorId);
    };
  }, []); // Faqat bir marta ishlaydi

  // ── Streamlarni yuklash ─────────────────────────────────────────────
  useEffect(() => {
    const fetchStreams = async () => {
      try {
        setIsLoading(true);
        const res = await axiosInstance.get('/api/stream/teacher/');
        const list = res.data?.results ?? res.data ?? [];
        const safeList = Array.isArray(list) ? list : [];
        setStreams(safeList);

        const live = safeList.find((s) => s.status === 'live');
        if (live) setActiveStream(live);
      } catch (err) {
        console.error('Stream fetch error:', err);
        setStreams([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStreams();
  }, []);

  // ── Notification WebSocket ─────────────────────────────────────────
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const token = localStorage.getItem('access_token') || '';
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    let ws;
    try {
      ws = new WebSocket(`${proto}://${window.location.host}/ws/notifications/?token=${token}`);

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'stream_live') {
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('🎥 Jonli efir boshlandi!', {
                body: `${data.teacher}: ${data.title}`,
              });
            }
            toast.success(`"${data.title}" efiri boshlandi!`, { duration: 8000 });
          }
        } catch (err) {
          console.error('Notification parse error:', err);
        }
      };

      ws.onerror = () => {}; // Jimgina yutish
    } catch (err) {
      console.error('Notification WS connect error:', err);
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  // ── Stream WebSocket ───────────────────────────────────────────────
  useEffect(() => {
    if (!activeStream?.uid) return;

    const token = localStorage.getItem('access_token') || '';
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    let ws;
    try {
      ws = new WebSocket(`${proto}://${window.location.host}/ws/stream/${activeStream.uid}/?token=${token}`);
      streamWsRef.current = ws;

      ws.onopen = () => setStreamConnected(true);
      ws.onclose = () => setStreamConnected(false);
      ws.onerror = () => setStreamConnected(false);

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);

          if (data.type === 'chat') {
            setStreamChatMsgs((prev) => [...prev, data]);
            setTimeout(() => {
              streamChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }

          if (data.type === 'viewer_count') {
            setStreamViewers(data.count || 0);
          }

          if (data.type === 'stream_event' && data.event === 'ended') {
            setActiveStream((prev) => (prev ? { ...prev, status: 'ended' } : null));
            stopCamera();
          }
        } catch (err) {
          console.error('Stream WS parse error:', err);
        }
      };
    } catch (err) {
      console.error('Stream WS connect error:', err);
    }

    setStreamChatMsgs([]);

    return () => {
      if (ws) ws.close(1000);
      streamWsRef.current = null;
      setStreamConnected(false);
    };
  }, [activeStream?.uid]);

  // ── Camera Functions ───────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
      setMicOn(true);
      return true;
    } catch (err) {
      setCameraError("Kamera yoki mikrofon ochilmadi. Brauzer ruxsatini tekshiring.");
      return false;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const toggleCamera = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCameraOn(track.enabled);
    }
  };

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  };

  // ── REST API Functions ─────────────────────────────────────────────

  // ✅ FIX 3: Stream yaratishda to'liq validatsiya va xato ko'rsatish
  const createStream = async (e) => {
    e.preventDefault();

    if (!streamForm.title.trim()) {
      return toast.error("Sarlavha kiriting!");
    }
    if (!streamForm.playback_url.trim()) {
      return toast.error("Playback URL kiriting!");
    }

    // URL formatini tekshirish
    try {
      new URL(streamForm.playback_url);
    } catch {
      return toast.error("To'g'ri URL kiriting (https:// bilan boshlang)");
    }

    try {
      // Faqat kerakli fieldlarni yuborish
      const payload = {
        title: streamForm.title.trim(),
        playback_url: streamForm.playback_url.trim(),
      };
      if (streamForm.description.trim()) payload.description = streamForm.description.trim();
      if (streamForm.course) payload.course = streamForm.course;
      if (streamForm.scheduled_at) payload.scheduled_at = streamForm.scheduled_at;

      const res = await axiosInstance.post('/api/stream/teacher/', payload);

      setStreams(prev => [res.data, ...prev]);
      setActiveStream(res.data);
      setStreamModal(false);
      setStreamForm({ title: '', description: '', course: '', scheduled_at: '', playback_url: '' });
      toast.success('Stream muvaffaqiyatli yaratildi!');
    } catch (err) {
      console.error('Stream create error:', err.response?.data || err.message);
      // ✅ FIX 4: Backend xato xabarini aniq ko'rsatish
      const errData = err.response?.data;
      if (errData) {
        if (typeof errData === 'string') {
          toast.error(errData);
        } else if (errData.detail) {
          toast.error(errData.detail);
        } else {
          // Field-level xatolarni ko'rsatish
          const firstError = Object.entries(errData)[0];
          if (firstError) {
            const [field, msgs] = firstError;
            const msg = Array.isArray(msgs) ? msgs[0] : msgs;
            toast.error(`${field}: ${msg}`);
          } else {
            toast.error("Stream yaratishda xatolik yuz berdi");
          }
        }
      } else {
        toast.error("Server bilan bog'lanishda xatolik");
      }
    }
  };

  const startStream = async (stream) => {
    const camStarted = await startCamera();
    if (!camStarted) return toast.error("Kamera ishga tushmadi");

    setIsStarting(true);
    try {
      const res = await axiosInstance.post(`/api/stream/teacher/${stream.id}/start/`);
      const updated = { ...stream, status: 'live', ...res.data };
      setActiveStream(updated);
      setStreams(prev => prev.map(s => s.id === stream.id ? updated : s));
      toast.success('Efir boshlandi!');
    } catch (err) {
      console.error('Start stream error:', err.response?.data || err.message);
      stopCamera();
      toast.error(err.response?.data?.detail || 'Efirni boshlashda xatolik');
    } finally {
      setIsStarting(false);
    }
  };

  const endStream = async () => {
    if (!activeStream) return;
    if (!window.confirm('Efirni tugatmoqchimisiz?')) return;

    try {
      await axiosInstance.post(`/api/stream/teacher/${activeStream.id}/end/`);
      setActiveStream(prev => prev ? { ...prev, status: 'ended' } : null);
      setStreams(prev => prev.map(s => s.id === activeStream.id ? { ...s, status: 'ended' } : s));
      stopCamera();
      toast.success('Efir tugatildi');
    } catch (err) {
      console.error('End stream error:', err.response?.data || err.message);
      toast.error(err.response?.data?.detail || 'Efirni tugatishda xatolik');
    }
  };

  const deleteStream = async (id) => {
    if (!window.confirm("Streamni butunlay o'chirishga aminmisiz?")) return;
    try {
      await axiosInstance.delete(`/api/stream/teacher/${id}/`);
      setStreams(prev => prev.filter(s => s.id !== id));
      if (activeStream?.id === id) {
        setActiveStream(null);
        stopCamera();
      }
      toast.success("Stream o'chirildi");
    } catch (err) {
      console.error('Delete stream error:', err.response?.data || err.message);
      toast.error(err.response?.data?.detail || "O'chirishda xatolik");
    }
  };

  const sendStreamChat = () => {
    const text = streamChatInput.trim();
    if (!text) return;
    if (!streamWsRef.current || streamWsRef.current.readyState !== WebSocket.OPEN) {
      return toast.error("WebSocket ulanmagan");
    }
    streamWsRef.current.send(JSON.stringify({ type: 'chat', content: text }));
    setStreamChatInput('');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <div className="flex h-screen animate-in fade-in duration-500">
      {/* Chap panel - Stream ro'yxati */}
      <div className={`w-96 flex-shrink-0 ${T.chatSidebar} border-r flex flex-col`}>
        <div className="p-8 pb-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-3xl font-black italic uppercase tracking-tighter ${T.text}`}>Jonli Efirlar</h2>
            <button
              onClick={() => setStreamModal(true)}
              className={`${T.accent} text-white px-5 py-3 rounded-2xl font-black italic text-xs uppercase flex items-center gap-2 hover:opacity-90 transition-all shadow-lg`}
            >
              <PlusCircle size={16} /> Yangi Efir
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`p-5 rounded-2xl animate-pulse ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div className={`h-3 rounded w-3/4 mb-2 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                <div className={`h-2.5 rounded w-1/2 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
              </div>
            ))
          ) : streams.length === 0 ? (
            <div className={`py-16 text-center flex flex-col items-center gap-3 ${T.textMuted}`}>
              <Radio size={40} className="opacity-20" />
              <p className="text-xs font-black uppercase italic">Hozircha jonli efir yo'q</p>
            </div>
          ) : (
            streams.map((stream) => (
              <div
                key={stream.id}
                onClick={() => setActiveStream(stream)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  activeStream?.id === stream.id ? T.chatItemActive : `border-transparent ${T.chatItemHover}`
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="mb-1.5">
                      {stream.status === 'live' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full animate-pulse uppercase">
                          <span className="w-1.5 h-1.5 bg-white rounded-full" /> JONLI
                        </span>
                      )}
                      {stream.status === 'scheduled' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-white text-[9px] font-black rounded-full uppercase">
                          <Clock size={10} /> REJALASHTIRILGAN
                        </span>
                      )}
                      {stream.status === 'ended' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-400 text-white text-[9px] font-black rounded-full uppercase">
                          TUGAGAN
                        </span>
                      )}
                    </div>
                    <p className={`font-black italic text-sm uppercase tracking-tight truncate ${T.text}`}>
                      {stream.title}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteStream(stream.id); }}
                    className={`p-2 rounded-xl hover:bg-red-100 hover:text-red-500 transition-all flex-shrink-0 ${T.textMuted}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* ✅ FIX 5: stream.status === 'scheduled' bo'lsa "Boshlash" tugmasi */}
                {stream.status === 'scheduled' && activeStream?.id === stream.id && (
                  <button
                    onClick={(e) => { e.stopPropagation(); startStream(stream); }}
                    disabled={isStarting}
                    className="mt-3 w-full py-2 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all disabled:opacity-50"
                  >
                    {isStarting ? (
                      <span className="animate-pulse">Boshlanmoqda...</span>
                    ) : (
                      <><Play size={12} /> Efirni Boshlash</>
                    )}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* O'ng panel */}
      {activeStream ? (
        <div className="flex-1 flex flex-col min-w-0">
          <div className={`flex items-center justify-between px-8 py-4 border-b ${T.divider} ${T.card} flex-shrink-0`}>
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-black uppercase italic ${
                activeStream.status === 'live'
                  ? 'bg-red-500 text-white animate-pulse'
                  : activeStream.status === 'scheduled'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                <Radio size={14} />
                {activeStream.status === 'live'
                  ? 'JONLI EFIR'
                  : activeStream.status === 'scheduled'
                  ? 'REJALASHTIRILGAN'
                  : 'TUGAGAN'}
              </div>
              <h3 className={`font-black italic uppercase text-lg ${T.text}`}>{activeStream.title}</h3>
              {activeStream.status === 'live' && (
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                  <Users2 size={12} /> {streamViewers} tomoshabin
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {activeStream.status === 'scheduled' && (
                <button
                  onClick={() => startStream(activeStream)}
                  disabled={isStarting}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-sm hover:bg-emerald-600 disabled:opacity-50 transition-all"
                >
                  {isStarting ? <span className="animate-pulse">Boshlanmoqda...</span> : <><Play size={16} /> Boshlash</>}
                </button>
              )}
              {activeStream.status === 'live' && (
                <button
                  onClick={endStream}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-2xl font-black text-sm hover:bg-red-600 transition-all"
                >
                  <VideoOff size={16} /> Tugatish
                </button>
              )}
            </div>
          </div>

          <div className={`flex-1 flex min-h-0 ${T.bg}`}>
            {/* Video zona */}
            <div className="flex-1 flex flex-col p-6 gap-4">
              {cameraError && (
                <div className="px-5 py-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium">
                  ⚠️ {cameraError}
                </div>
              )}

              <div className="flex-1 relative bg-black rounded-[2rem] overflow-hidden">
                {localStream ? (
                  <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-4">
                    <Camera size={80} className="opacity-30" />
                    <p className="font-black italic text-xl opacity-50">
                      {activeStream.status === 'live' ? 'Kamera ulanmagan' : 'Efir boshlanmagan'}
                    </p>
                    {activeStream.status === 'scheduled' && (
                      <button
                        onClick={() => startStream(activeStream)}
                        disabled={isStarting}
                        className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase text-sm flex items-center gap-2 hover:bg-emerald-600 disabled:opacity-50 transition-all"
                      >
                        {isStarting ? 'Boshlanmoqda...' : <><Play size={16}/> Efirni Boshlash</>}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {localStream && (
                <div className={`flex justify-center gap-4 p-4 ${T.card} border rounded-[2rem]`}>
                  <button
                    onClick={toggleCamera}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all ${cameraOn ? (theme === 'dark' ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-700') : 'bg-red-500 text-white'}`}
                  >
                    {cameraOn ? <Camera size={18} /> : <CameraOff size={18} />}
                    <span>{cameraOn ? 'Kamera' : 'O\'chirilgan'}</span>
                  </button>
                  <button
                    onClick={toggleMic}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all ${micOn ? (theme === 'dark' ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-700') : 'bg-red-500 text-white'}`}
                  >
                    {micOn ? <Mic size={18} /> : <MicOff size={18} />}
                    <span>{micOn ? 'Mikrofon' : 'O\'chirilgan'}</span>
                  </button>
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-black ${streamConnected ? (theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : (theme === 'dark' ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-600')}`}>
                    <div className={`w-2 h-2 rounded-full ${streamConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                    {streamConnected ? 'Real-time' : 'Ulanmoqda...'}
                  </div>
                </div>
              )}
            </div>

            {/* Chat panel */}
            <div className={`w-80 flex-shrink-0 flex flex-col border-l ${T.divider}`}>
              <div className={`p-4 border-b ${T.divider}`}>
                <h4 className={`font-black italic uppercase ${T.text}`}>Jonli Chat</h4>
                <p className={`text-xs font-bold ${T.textMuted}`}>{streamViewers} tomoshabin</p>
              </div>

              <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${T.bg}`}>
                {streamChatMsgs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <MessageCircle size={32} className={`${T.textMuted} opacity-20`}/>
                    <p className={`text-sm font-medium italic ${T.textMuted}`}>Hali xabar yo'q</p>
                  </div>
                ) : (
                  streamChatMsgs.map((msg, i) => (
                    <div key={i} className="flex gap-3">
                      <div className={`w-8 h-8 rounded-2xl flex-shrink-0 flex items-center justify-center text-xs font-bold ${T.accent} text-white`}>
                        {(msg.sender || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-black italic ${T.accentText}`}>{msg.sender || 'Noma\'lum'}</p>
                        <p className={`text-sm break-words ${T.text}`}>{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={streamChatEndRef} />
              </div>

              <div className={`p-4 border-t ${T.divider}`}>
                <div className={`flex gap-2 rounded-2xl p-2 border-2 focus-within:border-indigo-400 ${T.msgInput}`}>
                  <input
                    type="text"
                    value={streamChatInput}
                    onChange={(e) => setStreamChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendStreamChat()}
                    placeholder="Xabar yozing..."
                    className={`flex-1 bg-transparent outline-none px-3 text-sm font-medium ${T.text}`}
                  />
                  <button
                    onClick={sendStreamChat}
                    disabled={!streamChatInput.trim()}
                    className={`w-10 h-10 ${T.accent} text-white rounded-xl flex items-center justify-center hover:opacity-90 disabled:opacity-30 transition-all`}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`flex-1 flex flex-col items-center justify-center ${T.bg}`}>
          <div className={`w-32 h-32 ${T.card} border rounded-[3rem] flex items-center justify-center mb-8 shadow-sm`}>
            <Radio size={52} className={`${T.textMuted} opacity-30`}/>
          </div>
          <h3 className={`text-4xl font-black italic uppercase tracking-tighter mb-3 ${T.text}`}>Efir tanlanmagan</h3>
          <p className={`text-sm font-medium italic mb-8 ${T.textMuted}`}>Chap paneldan efir tanlang yoki yangi efir yarating</p>
          <button
            onClick={() => setStreamModal(true)}
            className={`${T.accent} text-white px-12 py-6 rounded-[2rem] font-black italic uppercase tracking-wider flex items-center gap-3 shadow-2xl hover:scale-105 transition-all`}
          >
            <PlusCircle size={26} /> Yangi Efir Yaratish
          </button>
        </div>
      )}

      {/* ✅ FIX 6: Stream Yaratish Modal — to'liq form, xatosiz */}
      {streamModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-2xl p-6">
          <div className={`${T.card} border w-full max-w-lg rounded-[3rem] p-12 relative shadow-2xl`}>
            <button
              onClick={() => setStreamModal(false)}
              className={`absolute top-6 right-6 p-3 rounded-full hover:bg-red-100 hover:text-red-500 transition-all ${T.textMuted}`}
            >
              <X size={20}/>
            </button>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${T.accent} rounded-2xl flex items-center justify-center`}>
                  <Radio className="text-white" size={18}/>
                </div>
                <h2 className={`text-3xl font-black italic uppercase tracking-tighter ${T.text}`}>Yangi Efir</h2>
              </div>
              <p className={`text-xs font-bold italic ${T.textMuted}`}>Stream yaratilgandan so'ng "Boshlash" tugmasi bilan efirni ishga tushiring</p>
            </div>

            <form onSubmit={createStream} className="space-y-5">
              {/* Sarlavha */}
              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest ml-2 mb-2 block ${T.textMuted}`}>
                  Sarlavha <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={streamForm.title}
                  onChange={(e) => setStreamForm({ ...streamForm, title: e.target.value })}
                  className={`w-full p-5 rounded-2xl border-2 outline-none font-bold text-sm transition-all ${T.input} ${T.text}`}
                  placeholder="Masalan: Python OOP Darsi"
                  required
                />
              </div>

              {/* Tavsif (ixtiyoriy) */}
              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest ml-2 mb-2 block ${T.textMuted}`}>
                  Tavsif <span className={T.textMuted}>(ixtiyoriy)</span>
                </label>
                <textarea
                  rows={2}
                  value={streamForm.description}
                  onChange={(e) => setStreamForm({ ...streamForm, description: e.target.value })}
                  className={`w-full p-5 rounded-2xl border-2 outline-none font-medium text-sm resize-none transition-all ${T.input} ${T.text}`}
                  placeholder="Efir haqida qisqacha..."
                />
              </div>

              {/* Kurs (ixtiyoriy) */}
              {courses && courses.length > 0 && (
                <div>
                  <label className={`text-[10px] font-black uppercase tracking-widest ml-2 mb-2 block ${T.textMuted}`}>
                    Kurs <span className={T.textMuted}>(ixtiyoriy)</span>
                  </label>
                  <select
                    value={streamForm.course}
                    onChange={(e) => setStreamForm({ ...streamForm, course: e.target.value })}
                    className={`w-full p-5 rounded-2xl border-2 outline-none font-bold text-sm appearance-none transition-all ${T.input} ${T.text}`}
                  >
                    <option value="">Kurs tanlanmagan</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Playback URL */}
              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest ml-2 mb-2 block ${T.textMuted}`}>
                  Playback URL (HLS) <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={streamForm.playback_url}
                  onChange={(e) => setStreamForm({ ...streamForm, playback_url: e.target.value })}
                  className={`w-full p-5 rounded-2xl border-2 outline-none font-medium text-sm transition-all ${T.input} ${T.text}`}
                  placeholder="https://..."
                  required
                />
                <p className={`text-[10px] mt-1.5 ml-2 ${T.textMuted}`}>
                  HLS stream URL (m3u8 format). Masalan: https://stream.example.com/live/stream.m3u8
                </p>
              </div>

              <button
                type="submit"
                className={`w-full py-5 ${T.accent} text-white rounded-2xl font-black italic uppercase tracking-wider text-sm hover:opacity-90 transition-all shadow-xl flex items-center justify-center gap-3`}
              >
                <Radio size={18}/> Stream Yaratish
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}