import React, {
    useState, useEffect, useRef, useCallback, useMemo
  } from 'react';
  import toast from 'react-hot-toast';
  import {
    Search, Plus, X, Send, Paperclip, Mic, MicOff, Square,
    ArrowLeft, MessageCircle, FileText, Check, CheckCheck,
    Pin, Forward, Edit3, Trash2, Smile, MoreHorizontal,
    Video, Image as ImageIcon, Phone, PhoneOff, Download,
    Copy, Star, StarOff, Reply, Lock, Shield, Hash,
    ChevronDown, Eye, EyeOff, Volume2, VolumeX, Zap,
    BookMarked, Clock, TrendingUp, Gift
  } from 'lucide-react';
  import { useChatSocket } from '../hooks/useChatSocket';
  import { OnlineBadge, Avatar, Spinner } from './UI';
  import api, { getAvatarSrc, formatTime, formatDate, formatDuration, formatFileSize } from '../utils/api';
  
  // ─── CONSTANTS ────────────────────────────────────────────
  const REACTION_EMOJIS = ['👍','❤️','😂','😮','😢','🔥','👏','🎉','😍','💯','🤔','😎'];
  
  // ─── REACTION PICKER ──────────────────────────────────────
  const ReactionPicker = ({ onSelect, onClose }) => (
    <div
      className="absolute bottom-full mb-2 left-0 z-50 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-2 flex gap-1 reaction-picker"
      onClick={e => e.stopPropagation()}
      style={{ minWidth: 'max-content' }}
    >
      {REACTION_EMOJIS.map(e => (
        <button
          key={e}
          onClick={() => { onSelect(e); onClose(); }}
          className="w-9 h-9 text-xl hover:bg-slate-700 rounded-xl transition-all hover:scale-125 flex items-center justify-center"
        >
          {e}
        </button>
      ))}
    </div>
  );
  
  // ─── PINNED BAR ───────────────────────────────────────────
  function PinnedBar({ pins, onScrollTo, onUnpin }) {
    const [idx, setIdx] = useState(0);
    const total = pins.length;
    useEffect(() => { if (idx >= total && total > 0) setIdx(total - 1); }, [total, idx]);
    if (total === 0) return null;
    const cur = pins[idx] || pins[0];
    const preview = (p) => {
      if (!p) return '';
      if (p.message_type === 'voice') return '🎤 Ovozli xabar';
      if (p.message_type === 'video') return '📹 Video xabar';
      if (p.message_type === 'image') return '🖼 Rasm';
      if (p.message_type === 'file')  return `📎 ${p.file_name || 'Fayl'}`;
      return p.content || '…';
    };
    return (
      <div className="px-4 py-2.5 border-b border-amber-500/20 bg-amber-500/5 flex items-center gap-2.5 shrink-0">
        <div className="flex flex-col gap-0.5 shrink-0">
          {total > 1 && pins.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`w-1 rounded-full transition-all ${i === idx ? 'h-4 bg-amber-400' : 'h-1.5 bg-amber-700'}`}
            />
          ))}
        </div>
        <Pin size={14} className="text-amber-400 shrink-0" />
        <button className="flex-1 text-left min-w-0 group" onClick={() => onScrollTo(cur?.message_id)}>
          <p className="text-[10px] font-bold text-amber-400 leading-none mb-0.5">
            Pin qilingan{total > 1 && ` (${idx + 1}/${total})`}
          </p>
          <p className="text-xs text-slate-300 truncate group-hover:text-white transition">{preview(cur)}</p>
        </button>
        {total > 1 && (
          <div className="flex gap-1 shrink-0">
            <button onClick={() => setIdx(i => (i - 1 + total) % total)} className="p-1 text-amber-400 hover:bg-amber-500/20 rounded-lg text-sm font-bold">‹</button>
            <button onClick={() => setIdx(i => (i + 1) % total)} className="p-1 text-amber-400 hover:bg-amber-500/20 rounded-lg text-sm font-bold">›</button>
          </div>
        )}
        <button onClick={() => onUnpin(cur?.pin_id)} className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition shrink-0">
          <X size={12} />
        </button>
      </div>
    );
  }
  
  // ─── FORWARD MODAL ────────────────────────────────────────
  const ForwardModal = ({ message, rooms, currentUserId, onForward, onClose }) => {
    const [selected, setSelected] = useState([]);
    const toggle = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    const getOther = (room) => (room.participants || []).find(p => p.id !== currentUserId) || { full_name: "Noma'lum" };
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-black text-lg text-white">Xabarni Yuborish</h3>
              <p className="text-xs text-slate-400 mt-0.5">Chatlarni tanlang</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition"><X size={18} className="text-slate-400" /></button>
          </div>
          <div className="p-3 max-h-72 overflow-y-auto space-y-1.5">
            {rooms.map(room => {
              const other = getOther(room);
              const isSel = selected.includes(room.id);
              return (
                <button key={room.id} onClick={() => toggle(room.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition ${
                    isSel ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 hover:bg-slate-800/50'
                  }`}>
                  <Avatar src={getAvatarSrc(other.avatar, other.full_name)} name={other.full_name} size="sm" />
                  <span className="font-semibold text-sm text-white flex-1 text-left">{other.full_name}</span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${isSel ? 'border-indigo-500 bg-indigo-500' : 'border-slate-600'}`}>
                    {isSel && <Check size={12} className="text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="p-4 border-t border-slate-800 flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 border border-slate-700 rounded-xl font-semibold text-slate-300 hover:bg-slate-800 transition text-sm">Bekor</button>
            <button
              disabled={selected.length === 0}
              onClick={() => { onForward(selected); onClose(); }}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-40 transition flex items-center justify-center gap-2 text-sm"
            >
              <Send size={14} /> Yuborish ({selected.length})
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // ─── MESSAGE BUBBLE ───────────────────────────────────────
  const MessageBubble = React.memo(({
    msg, isMine, currentUser, onReact, onReply, onForward, onPin, onEdit, onDelete,
    onScrollTo, reactionPickerMsgId, setReactionPickerMsgId, messageRefs
  }) => {
    const reactions = msg.reactions || {};
    const hasReactions = Object.keys(reactions).length > 0;
  
    const renderContent = () => {
      if (msg.is_deleted) return (
        <p className="text-sm italic text-slate-500 flex items-center gap-1.5">
          <Trash2 size={13} /> Xabar o'chirildi
        </p>
      );
      switch (msg.message_type) {
        case 'image':
          return msg.file ? (
            <div className="relative group/img">
              <img src={msg.file} alt="rasm" className="max-w-[240px] rounded-xl cursor-pointer hover:opacity-95 transition" />
              <a href={msg.file} download className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg opacity-0 group-hover/img:opacity-100 transition">
                <Download size={13} className="text-white" />
              </a>
            </div>
          ) : null;
        case 'voice':
          return msg.file ? (
            <div className="flex items-center gap-2.5 min-w-[200px] max-w-[260px]">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isMine ? 'bg-white/20' : 'bg-indigo-500/20'}`}>
                <Mic size={15} className={isMine ? 'text-white' : 'text-indigo-400'} />
              </div>
              <div className="flex-1 min-w-0">
                <audio controls src={msg.file} className="w-full h-8" />
              </div>
              {msg.duration > 0 && <span className={`text-[10px] shrink-0 ${isMine ? 'text-white/60' : 'text-slate-400'}`}>{formatDuration(msg.duration)}</span>}
            </div>
          ) : null;
        case 'video':
          return msg.file ? (
            <div className="relative rounded-xl overflow-hidden bg-black" style={{ width: '260px', aspectRatio: '16/9' }}>
              <video src={msg.file} controls playsInline className="w-full h-full object-contain" />
              {msg.duration > 0 && (
                <div className="absolute top-2 left-2 bg-black/70 rounded-lg px-2 py-0.5">
                  <span className="text-white text-[10px] font-bold">📹 {formatDuration(msg.duration)}</span>
                </div>
              )}
            </div>
          ) : null;
        case 'file':
          return msg.file ? (
            <a href={msg.file} target="_blank" rel="noreferrer"
              className={`flex items-center gap-3 p-3 rounded-xl transition hover:opacity-80 ${isMine ? 'bg-white/10' : 'bg-slate-700/50'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isMine ? 'bg-white/20' : 'bg-indigo-500/20'}`}>
                <FileText size={18} className={isMine ? 'text-white' : 'text-indigo-400'} />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-semibold truncate ${isMine ? 'text-white' : 'text-slate-200'}`}>{msg.file_name || 'Fayl'}</p>
                <p className={`text-[10px] ${isMine ? 'text-white/60' : 'text-slate-400'}`}>Yuklab olish</p>
              </div>
              <Download size={16} className={isMine ? 'text-white/60' : 'text-slate-400'} />
            </a>
          ) : null;
        default:
          return <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>;
      }
    };
  
    return (
      <div
        ref={el => { if (el && msg.id) messageRefs.current[msg.id] = el; }}
        className={`flex ${isMine ? 'justify-end' : 'justify-start'} group mb-1`}
      >
        {!isMine && (
          <Avatar
            src={getAvatarSrc(msg.sender?.avatar, msg.sender?.full_name)}
            name={msg.sender?.full_name || '?'}
            size="sm"
            className="mr-2 mt-auto mb-1"
          />
        )}
  
        <div className={`max-w-[72%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
          {!isMine && !msg.is_deleted && (
            <span className="text-[11px] text-slate-400 font-semibold mb-1 ml-1">{msg.sender?.full_name}</span>
          )}
  
          {/* Forward indicator */}
          {msg.forwarded_from && !msg.is_deleted && (
            <div className={`text-[10px] font-semibold mb-1 flex items-center gap-1 ${isMine ? 'text-indigo-300' : 'text-slate-400'}`}>
              <Forward size={11} /> Yuborilgan: {msg.forwarded_from.sender?.full_name || 'Noma\'lum'}
            </div>
          )}
  
          {/* Bubble */}
          <div className={`relative rounded-2xl ${
            msg.message_type === 'video' && msg.file && !msg.is_deleted ? '' : 'px-3.5 py-2.5'
          } ${
            msg.is_deleted
              ? 'bg-slate-800/50 border border-slate-700'
              : isMine
                ? 'bg-indigo-600 text-white rounded-br-sm shadow-lg shadow-indigo-500/10'
                : 'bg-slate-800 text-slate-100 rounded-bl-sm border border-slate-700/50'
          }`}>
  
            {/* Reply preview */}
            {msg.reply_to && !msg.is_deleted && (
              <button
                onClick={() => onScrollTo(msg.reply_to.id)}
                className={`w-full text-left mb-2 pl-2.5 border-l-2 rounded-sm hover:opacity-80 transition ${isMine ? 'border-white/50' : 'border-indigo-500'}`}
              >
                <p className={`text-[11px] font-bold ${isMine ? 'text-white/70' : 'text-indigo-400'}`}>
                  {msg.reply_to.sender?.full_name || 'Kim'}
                </p>
                <p className={`text-xs truncate ${isMine ? 'text-white/55' : 'text-slate-400'}`}>
                  {msg.reply_to.is_deleted ? '🗑 O\'chirildi'
                    : msg.reply_to.message_type === 'voice' ? '🎤 Ovozli xabar'
                    : msg.reply_to.message_type === 'video' ? '📹 Video'
                    : msg.reply_to.message_type !== 'text' ? `📎 ${msg.reply_to.file_name}`
                    : msg.reply_to.content}
                </p>
              </button>
            )}
  
            {renderContent()}
  
            {/* Hover actions */}
            {!msg.is_deleted && (
              <div className={`absolute ${isMine ? 'right-full mr-2' : 'left-full ml-2'} top-1/2 -translate-y-1/2
                hidden group-hover:flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1 shadow-xl`}>
                <div className="relative reaction-picker">
                  <button
                    onClick={e => { e.stopPropagation(); setReactionPickerMsgId(p => p === msg.id ? null : msg.id); }}
                    className="w-7 h-7 flex items-center justify-center hover:bg-slate-700 rounded-lg transition text-sm"
                    title="Reaction"
                  ><Smile size={14} className="text-slate-300" /></button>
                  {reactionPickerMsgId === msg.id && (
                    <ReactionPicker onSelect={e => onReact(msg.id, e)} onClose={() => setReactionPickerMsgId(null)} />
                  )}
                </div>
                <button onClick={() => onReply(msg)} className="w-7 h-7 flex items-center justify-center hover:bg-slate-700 rounded-lg transition" title="Javob"><Reply size={13} className="text-slate-300" /></button>
                <button onClick={() => onForward(msg)} className="w-7 h-7 flex items-center justify-center hover:bg-slate-700 rounded-lg transition" title="Forward"><Forward size={13} className="text-slate-300" /></button>
                <button onClick={() => onPin(msg)} className="w-7 h-7 flex items-center justify-center hover:bg-slate-700 rounded-lg transition" title="Pin"><Pin size={13} className="text-slate-300" /></button>
                {isMine && msg.message_type === 'text' && (
                  <button onClick={() => onEdit(msg)} className="w-7 h-7 flex items-center justify-center hover:bg-slate-700 rounded-lg transition" title="Tahrirlash"><Edit3 size={13} className="text-slate-300" /></button>
                )}
                {isMine && (
                  <button onClick={() => onDelete(msg)} className="w-7 h-7 flex items-center justify-center hover:bg-rose-500/20 rounded-lg transition" title="O'chirish"><Trash2 size={13} className="text-rose-400" /></button>
                )}
              </div>
            )}
          </div>
  
          {/* Reactions */}
          {!msg.is_deleted && hasReactions && (
            <div className={`flex flex-wrap gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
              {Object.entries(reactions).map(([emoji, data]) => (
                <button
                  key={emoji}
                  onClick={() => onReact(msg.id, emoji)}
                  title={data.users?.join(', ')}
                  className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-full px-2 py-0.5 text-xs hover:border-indigo-500 hover:bg-indigo-500/10 transition"
                >
                  <span>{emoji}</span>
                  <span className="font-bold text-slate-300">{data.count}</span>
                </button>
              ))}
            </div>
          )}
  
          {/* Timestamp */}
          <div className={`flex items-center gap-1.5 mt-0.5 ${isMine ? 'flex-row-reverse' : ''}`}>
            <span className="text-[10px] text-slate-500">{formatTime(msg.created_at)}</span>
            {msg.is_edited && !msg.is_deleted && <span className="text-[10px] text-slate-500 italic">tahrirlangan</span>}
            {isMine && !msg.is_deleted && (
              msg.is_read
                ? <CheckCheck size={13} className="text-indigo-400" />
                : <Check size={13} className="text-slate-500" />
            )}
          </div>
        </div>
      </div>
    );
  });
  
  // ─── ROOM ITEM ────────────────────────────────────────────
  const RoomItem = ({ room, isActive, currentUser, onOpen, onDelete, onlineStatus }) => {
    const other   = (room.participants || []).find(p => p.id !== currentUser.id) || { full_name: "Noma'lum" };
    const lastMsg = room.last_message;
  
    const preview = () => {
      if (!lastMsg) return 'Xabar yo\'q';
      if (lastMsg.is_deleted) return '🗑 O\'chirildi';
      const prefix = lastMsg.sender?.id === currentUser.id ? 'Siz: ' : '';
      switch (lastMsg.message_type) {
        case 'voice': return '🎤 Ovozli xabar';
        case 'video': return '📹 Video';
        case 'image': return '🖼 Rasm';
        case 'file':  return `📎 ${lastMsg.file_name || 'Fayl'}`;
        default: return prefix + (lastMsg.content || '');
      }
    };
  
    return (
      <div className={`relative flex items-center group transition-all ${
        isActive ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500' : 'border-l-2 border-l-transparent hover:bg-slate-800/50'
      }`}>
        <button onClick={() => onOpen(room)} className="flex-1 flex items-center gap-3 px-4 py-3.5 text-left">
          <Avatar
            src={getAvatarSrc(other.avatar, other.full_name)}
            name={other.full_name}
            size="md"
            online={onlineStatus?.is_online}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-semibold text-sm text-white truncate">{other.full_name}</span>
              <span className="text-[10px] text-slate-500 shrink-0 ml-2">{formatTime(lastMsg?.created_at)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-slate-400 truncate flex-1">{preview()}</p>
              {room.unread_count > 0 && (
                <span className="bg-indigo-600 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full font-black shrink-0 flex items-center justify-center">
                  {room.unread_count > 99 ? '99+' : room.unread_count}
                </span>
              )}
            </div>
          </div>
        </button>
        <button
          onClick={() => onDelete(room)}
          className="shrink-0 mr-3 p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
        >
          <X size={14} />
        </button>
      </div>
    );
  };
  
  // ─── MAIN CHAT PANEL ──────────────────────────────────────
  export default function ChatPanel({ currentUser }) {
    const [rooms,           setRooms]           = useState([]);
    const [activeRoom,      setActiveRoom]       = useState(null);
    const [messages,        setMessages]         = useState([]);
    const [loadingRooms,    setLoadingRooms]     = useState(true);
    const [loadingMsgs,     setLoadingMsgs]      = useState(false);
    const [inputText,       setInputText]        = useState('');
    const [typingUser,      setTypingUser]       = useState(null);
    const [mobileShowChat,  setMobileShowChat]   = useState(false);
    const [showNewChat,     setShowNewChat]      = useState(false);
    const [userQuery,       setUserQuery]        = useState('');
    const [userResults,     setUserResults]      = useState([]);
    const [searchingUsers,  setSearchingUsers]   = useState(false);
    const [creatingRoom,    setCreatingRoom]     = useState(false);
    const [roomSearch,      setRoomSearch]       = useState('');
    const [replyTo,         setReplyTo]          = useState(null);
    const [editingMsg,      setEditingMsg]       = useState(null);
    const [pinnedMessages,  setPinnedMessages]   = useState([]);
    const [forwardMsg,      setForwardMsg]       = useState(null);
    const [reactionPickerMsgId, setReactionPickerMsgId] = useState(null);
    const [onlineStatuses,  setOnlineStatuses]   = useState({});
    const [isRecording,     setIsRecording]      = useState(false);
    const [recordingTime,   setRecordingTime]    = useState(0);
    const [audioBlob,       setAudioBlob]        = useState(null);
    const [audioUrl,        setAudioUrl]         = useState(null);
    const [isVideoRec,      setIsVideoRec]       = useState(false);
    const [videoRecTime,    setVideoRecTime]     = useState(0);
    const [videoBlob,       setVideoBlob]        = useState(null);
    const [videoUrl,        setVideoUrl]         = useState(null);
    const [showVideoPreview,setShowVideoPreview] = useState(false);
    const [wsStatus,        setWsStatus]         = useState('disconnected'); // 'connected'|'reconnecting'|'disconnected'
  
    // NEW FEATURES state
    const [searchMsgQuery,  setSearchMsgQuery]   = useState('');
    const [showSearch,      setShowSearch]       = useState(false);
    const [starredMsgs,     setStarredMsgs]      = useState(new Set());
    const [showStarred,     setShowStarred]      = useState(false);
    const [mediaFilter,     setMediaFilter]      = useState('all'); // 'all'|'media'|'files'|'voice'
    const [unreadOnly,      setUnreadOnly]       = useState(false);
  
    const messagesEndRef   = useRef(null);
    const typingTimeout    = useRef(null);
    const fileInputRef     = useRef(null);
    const userQueryTimer   = useRef(null);
    const activeRoomRef    = useRef(null);
    const chatInputRef     = useRef(null);
    const messageRefs      = useRef({});
    const longPressTimer   = useRef(null);
    const mediaRecRef      = useRef(null);
    const audioChunksRef   = useRef([]);
    const recTimerRef      = useRef(null);
    const videoRecRef      = useRef(null);
    const videoChunksRef   = useRef([]);
    const videoRecTimerRef = useRef(null);
    const videoPreviewRef  = useRef(null);
    const videoStreamRef   = useRef(null);
    const onlinePingRef    = useRef(null);
  
    useEffect(() => { activeRoomRef.current = activeRoom; }, [activeRoom]);
  
    // Online ping
    useEffect(() => {
      const ping = () => api.post('/chat/online/', { is_online: true }).catch(() => {});
      ping();
      onlinePingRef.current = setInterval(ping, 25000);
      return () => {
        clearInterval(onlinePingRef.current);
        api.post('/chat/online/', { is_online: false }).catch(() => {});
      };
    }, []);
  
    // WS message handler
    const onMessageRef = useRef(null);
    onMessageRef.current = useCallback((data) => {
      const { type, message } = data;
  
      if (type === 'connected') { setWsStatus('connected'); return; }
  
      if (type === 'new_message' && message) {
        setMessages(prev => {
          const withoutTemp = prev.filter(m =>
            !(typeof m.id === 'string' && m.id.startsWith('temp-') &&
              m.content === message.content && m.sender?.id === message.sender?.id)
          );
          if (withoutTemp.some(m => m.id === message.id)) return withoutTemp;
          return [...withoutTemp, message];
        });
        setRooms(prev => prev.map(r =>
          r.id === activeRoomRef.current?.id
            ? { ...r, last_message: message, unread_count: 0 }
            : r
        ));
        return;
      }
      if (type === 'reaction_updated' && message) {
        setMessages(prev => prev.map(m => m.id === message.id ? { ...m, reactions: message.reactions } : m));
        return;
      }
      if (type === 'message_edited' && message) {
        setMessages(prev => prev.map(m => m.id === message.id ? { ...m, content: message.content, is_edited: true } : m));
        return;
      }
      if (type === 'message_deleted' && message) {
        setMessages(prev => prev.map(m => m.id === message.id ? { ...m, is_deleted: true, content: '', file: null } : m));
        return;
      }
      if (type === 'typing') {
        if (data.user_id !== currentUser.id)
          setTypingUser(data.is_typing ? data.username : null);
        return;
      }
      if (type === 'messages_read') {
        setMessages(prev => prev.map(m => ({ ...m, is_read: true })));
        return;
      }
      if (type === 'message_pinned' && data.pin) {
        setPinnedMessages(prev =>
          prev.some(p => p.pin_id === data.pin.id || p.id === data.pin.id)
            ? prev
            : [{ ...data.pin, pin_id: data.pin.id }, ...prev]
        );
        toast.success('📌 Xabar pin qilindi');
        return;
      }
      if (type === 'message_unpinned') {
        setPinnedMessages(prev => prev.filter(p => p.pin_id !== data.pin_id && p.id !== data.pin_id));
        return;
      }
      if (type === 'user_status') {
        setOnlineStatuses(prev => ({ ...prev, [data.user_id]: { is_online: data.is_online, last_seen: data.last_seen } }));
        return;
      }
    }, [currentUser.id]);
  
    const { send } = useChatSocket(activeRoom?.id, onMessageRef);
  
    useEffect(() => { fetchRooms(); }, []);
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typingUser]);
    useEffect(() => {
      const close = (e) => {
        setReactionPickerMsgId(null);
      };
      window.addEventListener('click', close);
      return () => window.removeEventListener('click', close);
    }, []);
  
    const fetchRooms = async () => {
      try {
        setLoadingRooms(true);
        const res  = await api.get('/chat/rooms/');
        const data = res.data;
        const list = Array.isArray(data) ? data : (data?.results || data?.rooms || []);
        setRooms(list);
      } catch { setRooms([]); }
      finally { setLoadingRooms(false); }
    };
  
    const openRoom = async (room) => {
      setActiveRoom(room);
      activeRoomRef.current = room;
      setMobileShowChat(true);
      setMessages([]);
      setReplyTo(null);
      setEditingMsg(null);
      setWsStatus('reconnecting');
      try {
        const pinRes = await api.get(`/chat/rooms/${room.id}/pin/`);
        setPinnedMessages((pinRes.data || []).map(p => ({ ...p, pin_id: p.id })));
      } catch { setPinnedMessages([]); }
      setLoadingMsgs(true);
      try {
        const res  = await api.get(`/chat/rooms/${room.id}/messages/`);
        const msgs = res.data?.results || res.data || [];
        setMessages(Array.isArray(msgs) ? msgs : []);
        setRooms(prev => prev.map(r => r.id === room.id ? { ...r, unread_count: 0 } : r));
      } catch {}
      finally { setLoadingMsgs(false); }
    };
  
    const getOther = useCallback((room) =>
      (room.participants || []).find(p => p.id !== currentUser.id) || { full_name: "Noma'lum", id: 0 }
    , [currentUser.id]);
  
    const deleteRoom = async (room) => {
      const other = getOther(room);
      if (!window.confirm(`"${other.full_name}" bilan chatni o'chirmoqchimisiz?`)) return;
      try {
        await api.delete(`/chat/rooms/${room.id}/`);
        setRooms(prev => prev.filter(r => r.id !== room.id));
        if (activeRoom?.id === room.id) { setActiveRoom(null); setMessages([]); setMobileShowChat(false); }
        toast.success("Chat o'chirildi");
      } catch { toast.error("O'chirishda xatolik"); }
    };
  
    const sendReaction = (msgId, emoji) => { send({ type: 'react', message_id: msgId, emoji }); setReactionPickerMsgId(null); };
    const pinMessage   = (msg) => { send({ type: 'pin', message_id: msg.id }); };
    const unpinMessage = (pinId) => {
      if (!pinId) return;
      send({ type: 'unpin', pin_id: pinId });
      setPinnedMessages(prev => prev.filter(p => p.pin_id !== pinId));
    };
    const toggleStar = (msgId) => {
      setStarredMsgs(prev => {
        const next = new Set(prev);
        if (next.has(msgId)) { next.delete(msgId); toast('Yulduzdan olib tashlandi'); }
        else { next.add(msgId); toast.success('⭐ Yulduzga saqlandi'); }
        return next;
      });
    };
  
    // Recording
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
        const mr = new MediaRecorder(stream, { mimeType });
        mediaRecRef.current = mr;
        audioChunksRef.current = [];
        mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
        mr.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: mr.mimeType || 'audio/webm' });
          setAudioBlob(blob);
          setAudioUrl(URL.createObjectURL(blob));
          stream.getTracks().forEach(t => t.stop());
        };
        mr.start(100);
        setIsRecording(true);
        setRecordingTime(0);
        recTimerRef.current = setInterval(() => {
          setRecordingTime(p => { if (p >= 120) { stopRecording(); return p; } return p + 1; });
        }, 1000);
      } catch { toast.error("Mikrofonga ruxsat berilmadi!"); }
    };
  
    const stopRecording = () => {
      if (mediaRecRef.current?.state === 'recording') mediaRecRef.current.stop();
      clearInterval(recTimerRef.current);
      setIsRecording(false);
    };
  
    const cancelRecording = () => {
      if (mediaRecRef.current?.state === 'recording') mediaRecRef.current.stop();
      clearInterval(recTimerRef.current);
      setIsRecording(false); setAudioBlob(null); setAudioUrl(null); setRecordingTime(0);
      audioChunksRef.current = [];
    };
  
    const sendVoiceMessage = async () => {
      if (!audioBlob || !activeRoom) return;
      try {
        const ext = audioBlob.type.includes('ogg') ? 'ogg' : 'webm';
        const fd  = new FormData();
        fd.append('file', new File([audioBlob], `voice_${Date.now()}.${ext}`, { type: audioBlob.type }));
        fd.append('message_type', 'voice');
        fd.append('content', '');
        fd.append('duration', recordingTime || 0);
        if (replyTo?.id) fd.append('reply_to_id', replyTo.id);
        await api.post(`/chat/rooms/${activeRoom.id}/messages/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setReplyTo(null);
        cancelRecording();
      } catch { toast.error('Ovozli xabar yuborishda xatolik'); }
    };
  
    const sendMessage = () => {
      const text = inputText.trim();
      if (!text || !activeRoom) return;
      if (editingMsg) {
        setMessages(prev => prev.map(m => m.id === editingMsg.id ? { ...m, content: text, is_edited: true } : m));
        send({ type: 'edit', message_id: editingMsg.id, content: text });
        setEditingMsg(null); setInputText(''); return;
      }
      const tempMsg = {
        id: `temp-${Date.now()}`,
        sender: { id: currentUser.id, full_name: currentUser.full_name, avatar: currentUser.avatar },
        content: text, message_type: 'text',
        reply_to: replyTo ? { ...replyTo } : null,
        reactions: {}, is_deleted: false, is_edited: false, is_read: false,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, tempMsg]);
      setInputText(''); setReplyTo(null);
      send({ type: 'text', content: text, reply_to_id: replyTo?.id || null });
      send({ type: 'typing', is_typing: false });
    };
  
    const deleteMessage = (message) => {
      if (message.sender?.id !== currentUser.id) return;
      setMessages(prev => prev.map(m => m.id === message.id ? { ...m, is_deleted: true, content: '', file: null } : m));
      send({ type: 'delete', message_id: message.id });
    };
  
    const startReply = (msg) => {
      setEditingMsg(null);
      setReplyTo({ id: msg.id, content: msg.content, file_name: msg.file_name, message_type: msg.message_type, sender: msg.sender });
      chatInputRef.current?.focus();
    };
  
    const startEdit = (msg) => {
      setReplyTo(null);
      setEditingMsg({ id: msg.id, original: msg.content });
      setInputText(msg.content);
      chatInputRef.current?.focus();
    };
  
    const scrollToMessage = (msgId) => {
      const el = messageRefs.current[msgId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-indigo-400', 'rounded-2xl', 'transition');
        setTimeout(() => el.classList.remove('ring-2', 'ring-indigo-400', 'rounded-2xl'), 1500);
      }
    };
  
    const handleInputChange = (e) => {
      setInputText(e.target.value);
      if (!activeRoom) return;
      send({ type: 'typing', is_typing: true });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => send({ type: 'typing', is_typing: false }), 2000);
    };
  
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
      if (e.key === 'Escape') { setReplyTo(null); setEditingMsg(null); setInputText(''); }
    };
  
    const handleFileUpload = async (e) => {
      const file = e.target.files?.[0];
      if (!file || !activeRoom) return;
      try {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('message_type', file.type.startsWith('image/') ? 'image' : 'file');
        fd.append('content', file.name);
        if (replyTo?.id) fd.append('reply_to_id', replyTo.id);
        await api.post(`/chat/rooms/${activeRoom.id}/messages/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setReplyTo(null);
      } catch { toast.error('Fayl yuborishda xatolik'); }
      e.target.value = '';
    };
  
    const searchUsers = async (q) => {
      if (!q || q.trim().length < 2) { setUserResults([]); return; }
      setSearchingUsers(true);
      try {
        const r = await api.get('/users/search/', { params: { q: q.trim() } });
        setUserResults((r.data?.results || r.data || []).filter(u => u.id !== currentUser.id));
      } catch { setUserResults([]); }
      finally { setSearchingUsers(false); }
    };
  
    const onUserQueryChange = (e) => {
      const val = e.target.value; setUserQuery(val);
      clearTimeout(userQueryTimer.current);
      userQueryTimer.current = setTimeout(() => searchUsers(val), 400);
    };
  
    const startChatWithUser = async (targetUser) => {
      const existing = rooms.find(r => (r.participants || []).some(p => p.id === targetUser.id));
      if (existing) { openRoom(existing); setShowNewChat(false); setUserQuery(''); setUserResults([]); return; }
      setCreatingRoom(true);
      try {
        const res = await api.post('/chat/rooms/', { participant_id: targetUser.id });
        setRooms(prev => [res.data, ...prev]);
        openRoom(res.data); setShowNewChat(false); setUserQuery(''); setUserResults([]);
      } catch { toast.error('Chat boshlashda xatolik!'); }
      finally { setCreatingRoom(false); }
    };
  
    const getOtherOnlineStatus = useCallback((room) => {
      const other = getOther(room);
      return onlineStatuses[other.id] || { is_online: other.is_online || false, last_seen: other.last_seen };
    }, [getOther, onlineStatuses]);
  
    const filteredRooms = useMemo(() => rooms.filter(r => {
      if (unreadOnly && !r.unread_count) return false;
      if (!roomSearch) return true;
      const o = getOther(r);
      return o.full_name?.toLowerCase().includes(roomSearch.toLowerCase()) ||
             o.username?.toLowerCase().includes(roomSearch.toLowerCase());
    }), [rooms, roomSearch, getOther, unreadOnly]);
  
    const totalUnread = useMemo(() => rooms.reduce((s, r) => s + (r.unread_count || 0), 0), [rooms]);
  
    const groupedMessages = useMemo(() => {
      let filtered = messages;
      if (searchMsgQuery.trim()) {
        filtered = messages.filter(m =>
          !m.is_deleted && m.content?.toLowerCase().includes(searchMsgQuery.toLowerCase())
        );
      }
      if (mediaFilter !== 'all') {
        const map = { media: ['image', 'video'], files: ['file'], voice: ['voice'] };
        filtered = filtered.filter(m => map[mediaFilter]?.includes(m.message_type));
      }
      if (showStarred) {
        filtered = filtered.filter(m => starredMsgs.has(m.id));
      }
      const groups = []; let curDate = null;
      filtered.forEach(msg => {
        const ds = formatDate(msg.created_at);
        if (ds !== curDate) { groups.push({ type: 'date', label: ds }); curDate = ds; }
        groups.push({ type: 'message', data: msg });
      });
      return groups;
    }, [messages, searchMsgQuery, mediaFilter, showStarred, starredMsgs]);
  
    const isMediaActive = isRecording || !!audioUrl || isVideoRec || showVideoPreview;
  
    // ─── RENDER ──────────────────────────────────────────────
    return (
      <div className="flex h-[calc(100vh-8rem)] rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
  
        {/* Forward modal */}
        {forwardMsg && (
          <ForwardModal
            message={forwardMsg}
            rooms={rooms.filter(r => r.id !== activeRoom?.id)}
            currentUserId={currentUser.id}
            onForward={(ids) => {
              send({ type: 'forward', message_id: forwardMsg.id, room_ids: ids });
              toast.success(`${ids.length} ta chatga yuborildi`);
              setForwardMsg(null);
            }}
            onClose={() => setForwardMsg(null)}
          />
        )}
  
        {/* ── LEFT SIDEBAR ───────────────────────────────── */}
        <div className={`${mobileShowChat ? 'hidden md:flex' : 'flex'} md:flex w-full md:w-80 flex-col border-r border-slate-800 shrink-0 bg-slate-950`}>
  
          {/* Header */}
          <div className="p-4 border-b border-slate-800 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">Xabarlar</h2>
                {totalUnread > 0 && (
                  <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">{totalUnread}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setUnreadOnly(p => !p)}
                  className={`p-2 rounded-xl transition text-xs font-bold ${unreadOnly ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                  title="Faqat o'qilmaganlar"
                >
                  <Eye size={15} />
                </button>
                <button
                  onClick={() => { setShowNewChat(p => !p); setUserQuery(''); setUserResults([]); }}
                  className={`p-2 rounded-xl transition ${showNewChat ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
  
            {showNewChat ? (
              <div>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Foydalanuvchi qidirish..."
                    value={userQuery}
                    onChange={onUserQueryChange}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-indigo-500/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 ml-1">Kamida 2 belgi kiriting</p>
                {searchingUsers && (
                  <div className="flex items-center gap-2 py-2 text-xs text-slate-400 pl-1">
                    <Spinner size={14} className="text-indigo-400" /> Qidirilmoqda...
                  </div>
                )}
                {!searchingUsers && userQuery.length >= 2 && userResults.length === 0 && (
                  <p className="text-center py-4 text-sm text-slate-500">Topilmadi</p>
                )}
                {userResults.length > 0 && (
                  <div className="mt-2 rounded-2xl border border-slate-700 overflow-hidden divide-y divide-slate-700/50">
                    {userResults.map(user => (
                      <button key={user.id} onClick={() => !creatingRoom && startChatWithUser(user)} disabled={creatingRoom}
                        className="w-full flex items-center gap-3 p-3 hover:bg-slate-800 transition text-left">
                        <Avatar src={getAvatarSrc(user.avatar, user.full_name || user.username)} name={user.full_name || user.username} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-white truncate">{user.full_name || user.username}</p>
                          {user.username && <p className="text-xs text-slate-400">@{user.username}</p>}
                        </div>
                        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                          <MessageCircle size={13} className="text-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Suhbatlarni qidirish..."
                  value={roomSearch}
                  onChange={e => setRoomSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>
  
          {/* Room list */}
          <div className="flex-1 overflow-y-auto">
            {!showNewChat && (
              loadingRooms ? (
                <div className="flex items-center justify-center py-16">
                  <Spinner size={24} className="text-indigo-500" />
                </div>
              ) : filteredRooms.length > 0 ? (
                filteredRooms.map(room => (
                  <RoomItem
                    key={room.id}
                    room={room}
                    isActive={activeRoom?.id === room.id}
                    currentUser={currentUser}
                    onOpen={openRoom}
                    onDelete={deleteRoom}
                    onlineStatus={getOtherOnlineStatus(room)}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <MessageCircle size={40} className="text-slate-700 mb-3" />
                  <p className="font-semibold text-slate-500 text-sm">
                    {roomSearch ? `"${roomSearch}" topilmadi` : unreadOnly ? "O'qilmagan xabar yo'q" : "Hali suhbatlar yo'q"}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {!roomSearch && !unreadOnly && <><span className="text-indigo-400">+</span> tugmasini bosing</>}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
  
        {/* ── RIGHT: CHAT AREA ───────────────────────────── */}
        <div className={`${!mobileShowChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col min-w-0`}>
          {activeRoom ? (
            <>
              {/* Chat header */}
              <div className="px-5 py-3.5 border-b border-slate-800 flex items-center gap-3 bg-slate-950 shrink-0">
                <button onClick={() => setMobileShowChat(false)} className="md:hidden p-1.5 hover:bg-slate-800 rounded-xl">
                  <ArrowLeft size={18} className="text-slate-300" />
                </button>
                {(() => {
                  const o = getOther(activeRoom);
                  const status = getOtherOnlineStatus(activeRoom);
                  return (
                    <>
                      <Avatar src={getAvatarSrc(o.avatar, o.full_name)} name={o.full_name} size="md" online={status.is_online} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm">{o.full_name}</h3>
                        <div className="text-xs mt-0.5">
                          {typingUser
                            ? <span className="text-indigo-400 font-medium italic">{typingUser} yozmoqda...</span>
                            : <OnlineBadge isOnline={status.is_online} lastSeen={status.last_seen} />
                          }
                        </div>
                      </div>
                      {/* Header actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setShowSearch(p => !p)}
                          className={`p-2 rounded-xl transition ${showSearch ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                          title="Xabar qidirish"
                        ><Search size={16} /></button>
                        <button
                          onClick={() => setShowStarred(p => !p)}
                          className={`p-2 rounded-xl transition ${showStarred ? 'bg-amber-500 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                          title="Yulduzli xabarlar"
                        ><Star size={16} /></button>
                        {/* Media filter */}
                        <div className="relative group">
                          <button className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition" title="Filter">
                            <Hash size={16} />
                          </button>
                          <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50 min-w-[140px]">
                            {[['all','Barchasi'],['media','Rasm/Video'],['files','Fayllar'],['voice','Ovozli']].map(([val, label]) => (
                              <button key={val} onClick={() => setMediaFilter(val)}
                                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition ${mediaFilter === val ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* WS status */}
                        <div className={`w-2 h-2 rounded-full ${wsStatus === 'connected' ? 'bg-emerald-400' : wsStatus === 'reconnecting' ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} title={wsStatus} />
                      </div>
                      <button onClick={() => deleteRoom(activeRoom)} className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition">
                        <X size={18} />
                      </button>
                    </>
                  );
                })()}
              </div>
  
              {/* Search bar */}
              {showSearch && (
                <div className="px-4 py-2 border-b border-slate-800 bg-slate-900 shrink-0">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Xabarlarda qidirish..."
                      value={searchMsgQuery}
                      onChange={e => setSearchMsgQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    {searchMsgQuery && (
                      <button onClick={() => setSearchMsgQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}
  
              <PinnedBar pins={pinnedMessages} onScrollTo={scrollToMessage} onUnpin={unpinMessage} />
  
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5 bg-slate-950/80"
                style={{ backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.04) 0%, transparent 60%)' }}>
  
                {loadingMsgs ? (
                  <div className="flex items-center justify-center py-16">
                    <Spinner size={24} className="text-indigo-500" />
                  </div>
                ) : groupedMessages.length > 0 ? groupedMessages.map((item, idx) => {
                  if (item.type === 'date') return (
                    <div key={`d-${idx}`} className="flex items-center gap-3 py-3">
                      <div className="flex-1 h-px bg-slate-800" />
                      <span className="text-[11px] font-semibold text-slate-500 px-3 bg-slate-900 py-1 rounded-full border border-slate-800">{item.label}</span>
                      <div className="flex-1 h-px bg-slate-800" />
                    </div>
                  );
                  const msg   = item.data;
                  const isMine = msg.sender?.id === currentUser.id;
                  return (
                    <MessageBubble
                      key={msg.id}
                      msg={msg}
                      isMine={isMine}
                      currentUser={currentUser}
                      onReact={sendReaction}
                      onReply={startReply}
                      onForward={(m) => setForwardMsg(m)}
                      onPin={pinMessage}
                      onEdit={startEdit}
                      onDelete={deleteMessage}
                      onScrollTo={scrollToMessage}
                      reactionPickerMsgId={reactionPickerMsgId}
                      setReactionPickerMsgId={setReactionPickerMsgId}
                      messageRefs={messageRefs}
                    />
                  );
                }) : (
                  <div className="flex flex-col items-center justify-center h-full py-20">
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                      <MessageCircle size={28} className="text-slate-600" />
                    </div>
                    <p className="text-slate-500 font-semibold">
                      {showStarred ? 'Yulduzli xabar yo\'q' : searchMsgQuery ? 'Topilmadi' : 'Birinchi xabarni yuboring!'}
                    </p>
                  </div>
                )}
  
                {/* Typing indicator */}
                {typingUser && (
                  <div className="flex items-end gap-2 pl-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-xs text-slate-400 font-bold shrink-0">
                      {typingUser[0]?.toUpperCase()}
                    </div>
                    <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm">
                      <div className="flex gap-1 items-center">
                        {[0,150,300].map(d => (
                          <span key={d} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
  
              {/* Reply/Edit bar */}
              {(replyTo || editingMsg) && (
                <div className={`px-4 py-2.5 border-t flex items-center gap-3 shrink-0 ${
                  editingMsg
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-indigo-500/5 border-indigo-500/20'
                }`}>
                  <div className={`flex-1 border-l-2 pl-3 ${editingMsg ? 'border-emerald-500' : 'border-indigo-500'}`}>
                    <p className={`text-xs font-bold mb-0.5 ${editingMsg ? 'text-emerald-400' : 'text-indigo-400'}`}>
                      {editingMsg ? '✏️ Tahrirlash' : `↩️ ${replyTo?.sender?.full_name || 'Javob'}`}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {editingMsg ? editingMsg.original
                        : replyTo?.message_type === 'voice' ? '🎤 Ovozli xabar'
                        : replyTo?.message_type === 'video' ? '📹 Video'
                        : replyTo?.message_type !== 'text' ? `📎 ${replyTo?.file_name}`
                        : replyTo?.content}
                    </p>
                  </div>
                  <button onClick={() => { setReplyTo(null); setEditingMsg(null); setInputText(''); }}
                    className="p-1 text-slate-500 hover:text-rose-400 transition">
                    <X size={15} />
                  </button>
                </div>
              )}
  
              {/* Input area */}
              <div className="px-4 py-3 border-t border-slate-800 bg-slate-950 shrink-0">
                {/* Voice preview */}
                {audioUrl && !isRecording && (
                  <div className="flex items-center gap-3 mb-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                    <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                      <Mic size={16} className="text-white" />
                    </div>
                    <audio controls src={audioUrl} className="flex-1 h-8" style={{ minWidth: 0 }} />
                    <span className="text-xs font-bold text-indigo-400 shrink-0">{formatDuration(recordingTime)}</span>
                    <button onClick={cancelRecording} className="p-1.5 text-slate-500 hover:text-rose-400 transition"><X size={15} /></button>
                    <button onClick={sendVoiceMessage}
                      className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20">
                      <Send size={16} className="text-white" />
                    </button>
                  </div>
                )}
  
                {/* Recording indicator */}
                {isRecording && (
                  <div className="flex items-center gap-3 mb-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                    <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping shrink-0" />
                    <span className="text-sm font-bold text-rose-400 flex-1">Yozilmoqda... {formatDuration(recordingTime)}</span>
                    <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${(recordingTime / 120) * 100}%` }} />
                    </div>
                    <button onClick={cancelRecording} className="p-1.5 text-slate-400 hover:text-rose-400 transition"><X size={15} /></button>
                    <button onClick={stopRecording} className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-xl transition"><Square size={16} /></button>
                  </div>
                )}
  
                <div className="flex items-end gap-2">
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} disabled={isMediaActive}
                    className="p-2.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition shrink-0 disabled:opacity-30">
                    <Paperclip size={19} />
                  </button>
  
                  {!isMediaActive ? (
                    <textarea
                      ref={chatInputRef}
                      value={inputText}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder={editingMsg ? "Tahrirlash..." : "Xabar yozing..."}
                      rows={1}
                      className={`flex-1 px-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-1 resize-none max-h-32 bg-slate-800 text-white placeholder-slate-500 border ${
                        editingMsg
                          ? 'border-emerald-500/50 focus:ring-emerald-500'
                          : 'border-slate-700 focus:ring-indigo-500'
                      } transition`}
                      style={{ minHeight: '46px' }}
                    />
                  ) : <div className="flex-1" />}
  
                  {inputText.trim() || audioUrl ? (
                    <button
                      onClick={audioUrl ? sendVoiceMessage : sendMessage}
                      disabled={!inputText.trim() && !audioUrl}
                      className={`p-3 rounded-2xl transition shrink-0 ${
                        editingMsg
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20'
                      } text-white disabled:opacity-30`}
                    >
                      <Send size={18} />
                    </button>
                  ) : !isRecording ? (
                    <button
                      onMouseDown={startRecording}
                      onMouseUp={stopRecording}
                      onTouchStart={startRecording}
                      onTouchEnd={stopRecording}
                      className={`p-3 rounded-2xl transition shrink-0 ${
                        isRecording
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-slate-800 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 border border-slate-700'
                      }`}
                    >
                      {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                  ) : null}
                </div>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center"
              style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.05) 0%, transparent 70%)' }}>
              <div className="w-20 h-20 bg-slate-800 border border-slate-700 rounded-3xl flex items-center justify-center mb-5 shadow-2xl">
                <MessageCircle size={36} className="text-indigo-500" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Xabarlar</h3>
              <p className="text-slate-500 max-w-xs text-sm mb-6">Mavjud suhbatni tanlang yoki yangi chat boshlang</p>
              <button
                onClick={() => { setShowNewChat(true); setMobileShowChat(false); }}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20 text-sm"
              >
                <Plus size={16} /> Yangi Chat
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }