// src/components/Chat/ChatPage.jsx
// O'rnatish: npm install react-hot-toast (allaqachon bor)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send, Paperclip, Image as ImageIcon, X, Search,
  MessageCircle, CheckCheck, Check, Loader2, Phone,
  MoreVertical, ArrowLeft, Smile, File
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosConfig';

// ─── WebSocket hook ───────────────────────────────────────────
function useChatSocket(roomId, onMessage) {
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (!roomId) return;

    const token = localStorage.getItem('access_token') || '';
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/chat/${roomId}/`;

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setIsConnected(true);
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
      // Avtomatik qayta ulanish (3 soniyadan keyin)
      setTimeout(connect, 3000);
    };

    wsRef.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        onMessage(data);
      } catch {}
    };

    wsRef.current.onerror = () => {
      setIsConnected(false);
    };
  }, [roomId, onMessage]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null; // avtomatik qayta ulanishni to'xtatish
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  return { isConnected, sendMessage };
}

// ─── Xabar bubble ───────────────────────────────────────────
function MessageBubble({ msg, isOwn }) {
  const isImage = msg.message_type === 'image';
  const isFile = msg.message_type === 'file';
  const time = new Date(msg.created_at).toLocaleTimeString('uz-UZ', {
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 group`}>
      {!isOwn && (
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 self-end">
          {msg.sender_name?.charAt(0)?.toUpperCase()}
        </div>
      )}
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isOwn && (
          <span className="text-[10px] font-bold text-slate-400 mb-1 ml-1 uppercase tracking-wider">
            {msg.sender_name}
          </span>
        )}
        <div className={`relative px-4 py-3 rounded-3xl shadow-sm ${
          isOwn
            ? 'bg-indigo-600 text-white rounded-br-sm'
            : 'bg-white text-slate-800 rounded-bl-sm border border-slate-100'
        }`}>
          {isImage && msg.file_url ? (
            <a href={msg.file_url} target="_blank" rel="noreferrer">
              <img
                src={msg.file_url}
                alt={msg.file_name}
                className="max-w-[240px] max-h-[240px] rounded-2xl object-cover cursor-pointer hover:opacity-90 transition"
              />
            </a>
          ) : isFile && msg.file_url ? (
            <a
              href={msg.file_url}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center gap-3 py-1 ${isOwn ? 'text-indigo-100' : 'text-indigo-600'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isOwn ? 'bg-indigo-500' : 'bg-indigo-50'
              }`}>
                <File size={18}/>
              </div>
              <div>
                <p className="text-xs font-bold line-clamp-1">{msg.file_name || 'Fayl'}</p>
                <p className={`text-[10px] ${isOwn ? 'text-indigo-200' : 'text-slate-400'}`}>Yuklab olish</p>
              </div>
            </a>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
          )}
        </div>
        <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-slate-400">{time}</span>
          {isOwn && (
            msg.is_read
              ? <CheckCheck size={12} className="text-indigo-400"/>
              : <Check size={12} className="text-slate-300"/>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Conversation item ──────────────────────────────────────
function ConversationItem({ room, isActive, onClick, currentUserId }) {
  const otherUser = room.other_user;
  const lastMsg = room.last_message;
  const unread = room.unread_count || 0;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left ${
        isActive
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
          : 'hover:bg-slate-50 text-slate-700'
      }`}
    >
      {/* Avatar */}
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
        isActive ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-600'
      }`}>
        {otherUser?.full_name?.charAt(0)?.toUpperCase() || otherUser?.username?.charAt(0)?.toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <p className={`font-bold text-sm truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
            {otherUser?.full_name || otherUser?.username}
          </p>
          {lastMsg && (
            <span className={`text-[10px] flex-shrink-0 ml-2 ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
              {new Date(lastMsg.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <p className={`text-xs truncate ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
            {lastMsg ? lastMsg.content || `📎 ${lastMsg.file_name || 'Fayl'}` : 'Xabar yo\'q'}
          </p>
          {unread > 0 && !isActive && (
            <span className="ml-2 flex-shrink-0 w-5 h-5 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </div>
        {/* Role badge */}
        <span className={`text-[9px] uppercase font-bold tracking-wider ${
          isActive ? 'text-indigo-300' : 'text-slate-300'
        }`}>
          {otherUser?.role === 'teacher' ? '👨‍🏫 O\'qituvchi' : otherUser?.role === 'admin' ? '⚙️ Admin' : '👨‍🎓 Talaba'}
        </span>
      </div>
    </button>
  );
}

// ─── Asosiy Chat komponenti ──────────────────────────────────
export default function ChatPage() {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimerRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // WebSocket xabarlarni qabul qilish
  const handleWsMessage = useCallback((data) => {
    switch (data.type) {
      case 'message':
        setMessages(prev => {
          // Duplicate oldini olish
          if (prev.find(m => m.id === data.message_id)) return prev;
          return [...prev, {
            id: data.message_id,
            message_type: data.message_type,
            content: data.content,
            file_url: data.file_url,
            file_name: data.file_name,
            sender_id: data.sender_id,
            sender_name: data.sender_name,
            is_read: data.sender_id === currentUser.id,
            created_at: data.created_at,
          }];
        });
        // Xona preview ni yangilash
        setRooms(prev => prev.map(r =>
          r.id === activeRoom?.id
            ? { ...r, last_message: { content: data.content, created_at: data.created_at } }
            : r
        ));
        break;
      case 'typing':
        setOtherTyping(data.is_typing);
        break;
      case 'read':
        setMessages(prev => prev.map(m =>
          m.sender_id === currentUser.id ? { ...m, is_read: true } : m
        ));
        break;
      default:
        break;
    }
  }, [activeRoom?.id, currentUser.id]);

  const { isConnected, sendMessage } = useChatSocket(activeRoom?.id, handleWsMessage);

  // Xonalarni yuklash
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      const res = await axiosInstance.get('/api/chat/rooms/');
      setRooms(res.data.results || res.data || []);
    } catch {
      toast.error('Xonalarni yuklashda xatolik');
    } finally {
      setLoadingRooms(false);
    }
  };

  // Xabarlarni yuklash
  const fetchMessages = async (room) => {
    try {
      setLoadingMessages(true);
      const res = await axiosInstance.get(`/api/chat/rooms/${room.id}/messages/`);
      setMessages(res.data || []);
    } catch {
      toast.error('Xabarlarni yuklashda xatolik');
    } finally {
      setLoadingMessages(false);
    }
  };

  // Xona tanlash
  const selectRoom = (room) => {
    setActiveRoom(room);
    fetchMessages(room);
    setShowMobileChat(true);
    // Unread ni 0 ga tushirish
    setRooms(prev => prev.map(r => r.id === room.id ? { ...r, unread_count: 0 } : r));
  };

  // Scroll pastga
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherTyping]);

  // Matn xabar yuborish
  const handleSendText = async () => {
    if (!input.trim() || !activeRoom || isSending) return;
    const text = input.trim();
    setInput('');
    setIsSending(true);

    // WebSocket orqali yuborish
    const sent = sendMessage({ type: 'text', content: text });

    if (!sent) {
      // WebSocket ishlamasa HTTP orqali
      try {
        await axiosInstance.post(`/api/chat/rooms/${activeRoom.id}/send/`, {
          message_type: 'text',
          content: text
        });
        await fetchMessages(activeRoom);
      } catch {
        toast.error('Xabar yuborishda xatolik');
        setInput(text);
      }
    }
    setIsSending(false);
  };

  // Fayl yuborish
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeRoom) return;

    const isImage = file.type.startsWith('image/');
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {
      toast.error('Fayl 10MB dan katta bo\'lishi mumkin emas');
      return;
    }

    setIsSending(true);

    // Base64 ga convert qilish (WebSocket uchun)
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      const sent = sendMessage({
        type: isImage ? 'image' : 'file',
        file_data: base64,
        file_name: file.name,
      });

      if (!sent) {
        // HTTP fallback
        try {
          const formData = new FormData();
          formData.append('message_type', isImage ? 'image' : 'file');
          formData.append('file', file);
          await axiosInstance.post(`/api/chat/rooms/${activeRoom.id}/send/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          await fetchMessages(activeRoom);
        } catch {
          toast.error('Fayl yuborishda xatolik');
        }
      }
      setIsSending(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Typing indicator
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      sendMessage({ type: 'typing', is_typing: true });
    }
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      sendMessage({ type: 'typing', is_typing: false });
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const filteredRooms = rooms.filter(r => {
    const name = r.other_user?.full_name || r.other_user?.username || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // ─── RENDER ───────────────────────────────────────────────

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden font-sans">
      <Toaster position="top-right"/>

      {/* ─── SIDEBAR: Xonalar ro'yxati ─── */}
      <aside className={`w-full md:w-96 bg-white border-r border-slate-100 flex flex-col flex-shrink-0 ${
        showMobileChat ? 'hidden md:flex' : 'flex'
      }`}>

        {/* Header */}
        <div className="p-6 border-b border-slate-50">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">
              Chat<span className="text-indigo-600">.</span>
            </h1>
            <div className="flex items-center gap-2">
              {/* Unread badge */}
              {rooms.reduce((sum, r) => sum + (r.unread_count || 0), 0) > 0 && (
                <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-full text-xs font-bold">
                  {rooms.reduce((sum, r) => sum + (r.unread_count || 0), 0)}
                </span>
              )}
            </div>
          </div>

          {/* Qidiruv */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
            <input
              type="text"
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 font-medium text-slate-700"
            />
          </div>
        </div>

        {/* Xonalar */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loadingRooms ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-indigo-400" size={32}/>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-20">
              <MessageCircle className="mx-auto text-slate-200 mb-4" size={48}/>
              <p className="text-sm font-bold text-slate-300 uppercase italic tracking-wider">
                Chatlar yo'q
              </p>
            </div>
          ) : (
            filteredRooms.map(room => (
              <ConversationItem
                key={room.id}
                room={room}
                isActive={activeRoom?.id === room.id}
                onClick={() => selectRoom(room)}
                currentUserId={currentUser.id}
              />
            ))
          )}
        </div>
      </aside>

      {/* ─── MAIN: Chat oynasi ─── */}
      <main className={`flex-1 flex flex-col min-w-0 ${
        !showMobileChat ? 'hidden md:flex' : 'flex'
      }`}>

        {activeRoom ? (
          <>
            {/* Chat Header */}
            <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-4 shadow-sm">
              <button
                onClick={() => setShowMobileChat(false)}
                className="md:hidden p-2 hover:bg-slate-50 rounded-xl transition"
              >
                <ArrowLeft size={20} className="text-slate-600"/>
              </button>

              {/* Avatar */}
              <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                {activeRoom.other_user?.full_name?.charAt(0)?.toUpperCase() ||
                 activeRoom.other_user?.username?.charAt(0)?.toUpperCase()}
              </div>

              <div className="flex-1">
                <p className="font-black text-slate-900 italic uppercase tracking-tight">
                  {activeRoom.other_user?.full_name || activeRoom.other_user?.username}
                </p>
                <p className="text-[11px] text-slate-400 font-bold">
                  {isConnected ? (
                    <span className="text-emerald-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"/>
                      Online
                    </span>
                  ) : (
                    <span className="text-slate-300">Ulanmoqda...</span>
                  )}
                </p>
              </div>

              {activeRoom.course && (
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase italic tracking-wider">
                  📚 {activeRoom.course_name || 'Kurs'}
                </span>
              )}
            </header>

            {/* Xabarlar */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-1 bg-slate-50/50">
              {loadingMessages ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-indigo-400" size={32}/>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center">
                  <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="text-indigo-300" size={36}/>
                  </div>
                  <p className="text-sm font-bold text-slate-400 uppercase italic tracking-wider">
                    Hali xabar yo'q
                  </p>
                  <p className="text-xs text-slate-300 mt-1">Birinchi xabarni yuboring!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isOwn={msg.sender_id === currentUser.id || msg.sender === currentUser.id}
                  />
                ))
              )}

              {/* Typing indicator */}
              {otherTyping && (
                <div className="flex items-center gap-2 pl-10">
                  <div className="bg-white border border-slate-100 rounded-3xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef}/>
            </div>

            {/* Input area */}
            <div className="bg-white border-t border-slate-100 p-4">
              <div className="flex items-end gap-3">
                {/* Fayl yuklash */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSending}
                  className="w-11 h-11 flex-shrink-0 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 text-slate-500 rounded-2xl flex items-center justify-center transition-all disabled:opacity-50"
                >
                  <Paperclip size={18}/>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                />

                {/* Matn input */}
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Xabar yozing... (Enter — yuborish, Shift+Enter — yangi qator)"
                    rows={1}
                    className="w-full px-5 py-3.5 bg-slate-50 rounded-3xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 resize-none font-medium text-slate-700 max-h-32 leading-relaxed"
                    style={{ height: 'auto' }}
                    onInput={e => {
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                    }}
                  />
                </div>

                {/* Yuborish */}
                <button
                  onClick={handleSendText}
                  disabled={!input.trim() || isSending}
                  className="w-11 h-11 flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95"
                >
                  {isSending
                    ? <Loader2 size={18} className="animate-spin"/>
                    : <Send size={18}/>
                  }
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Xona tanlanmagan holat */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mb-8">
              <MessageCircle className="text-indigo-300" size={56}/>
            </div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-200 mb-3">
              Chat Tanlang
            </h2>
            <p className="text-slate-400 font-medium text-sm max-w-xs">
              Chap tomondagi ro'yxatdan suhbatni tanlang yoki yangi chat boshlang
            </p>
          </div>
        )}
      </main>
    </div>
  );
}