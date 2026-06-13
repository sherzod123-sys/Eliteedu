import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  BookOpen, Users, PlusCircle, FileText, X, Edit3, Trash2, 
  Loader2, Image as ImageIcon, DollarSign, Wallet, Zap, Save, 
  Camera, CheckCircle, TrendingUp, Search, ChevronRight, 
  Calendar, Eye, BarChart3, LogOut, Settings, LayoutDashboard,
  Layers, Filter, ArrowUpRight, ArrowDownRight, MoreVertical,
  ChevronLeft, Award, Clock, UserCheck, UserX, Sun, Moon, Monitor,
  MessageCircle, Send, Reply, Check, CheckCheck, CornerUpLeft,
  Smile, Paperclip, MoreHorizontal, Circle, Pencil, File,
  ChevronDown, Bell, Radio, VideoOff, Users2
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosConfig';
import StreamTab from './StreamTab';

// ============================================================
// THEME CONFIGURATION
// ============================================================
const THEMES = {
  light: {
    name: 'Yorug\'',
    icon: Sun,
    bg: 'bg-[#F8FAFC]',
    sidebar: 'bg-white border-slate-100',
    card: 'bg-white border-slate-100',
    cardHover: 'hover:shadow-2xl hover:shadow-indigo-500/10',
    text: 'text-slate-900',
    textMuted: 'text-slate-400',
    input: 'bg-slate-50 border-transparent focus:border-indigo-100 focus:bg-white',
    tableHead: 'bg-slate-50/50',
    tableRow: 'hover:bg-slate-50/30',
    accent: 'bg-indigo-600',
    accentText: 'text-indigo-600',
    divider: 'border-slate-50',
    sidebarActive: 'bg-slate-900 text-white shadow-xl shadow-slate-200',
    sidebarInactive: 'text-slate-400 hover:bg-slate-50 hover:text-slate-600',
    msgBubbleOwn: 'bg-indigo-600 text-white',
    msgBubbleOther: 'bg-white text-slate-800 border border-slate-100 shadow-sm',
    msgInput: 'bg-slate-50 border-slate-100',
    chatSidebar: 'bg-white border-slate-100',
    chatItemActive: 'bg-indigo-50 border-indigo-100',
    chatItemHover: 'hover:bg-slate-50',
    contextMenu: 'bg-white border-slate-100 shadow-2xl shadow-slate-200/80',
  },
  dark: {
    name: 'Qorong\'u',
    icon: Moon,
    bg: 'bg-[#0F1117]',
    sidebar: 'bg-[#1A1D27] border-slate-800',
    card: 'bg-[#1A1D27] border-slate-800',
    cardHover: 'hover:shadow-2xl hover:shadow-indigo-500/20',
    text: 'text-slate-100',
    textMuted: 'text-slate-500',
    input: 'bg-[#252836] border-transparent focus:border-indigo-500/30 text-slate-100 focus:bg-[#2d3145]',
    tableHead: 'bg-[#252836]',
    tableRow: 'hover:bg-[#252836]/50',
    accent: 'bg-indigo-600',
    accentText: 'text-indigo-400',
    divider: 'border-slate-800',
    sidebarActive: 'bg-indigo-600 text-white shadow-xl shadow-indigo-900',
    sidebarInactive: 'text-slate-500 hover:bg-slate-800 hover:text-slate-300',
    msgBubbleOwn: 'bg-indigo-600 text-white',
    msgBubbleOther: 'bg-[#252836] text-slate-200 border border-slate-700',
    msgInput: 'bg-[#252836] border-slate-700',
    chatSidebar: 'bg-[#1A1D27] border-slate-800',
    chatItemActive: 'bg-indigo-900/30 border-indigo-800/50',
    chatItemHover: 'hover:bg-slate-800/60',
    contextMenu: 'bg-[#252836] border-slate-700 shadow-2xl shadow-black/50',
  },
  purple: {
    name: 'Binafsha',
    icon: Monitor,
    bg: 'bg-[#F5F3FF]',
    sidebar: 'bg-white border-purple-100',
    card: 'bg-white border-purple-100',
    cardHover: 'hover:shadow-2xl hover:shadow-purple-500/10',
    text: 'text-slate-900',
    textMuted: 'text-slate-400',
    input: 'bg-purple-50 border-transparent focus:border-purple-200 focus:bg-white',
    tableHead: 'bg-purple-50/50',
    tableRow: 'hover:bg-purple-50/30',
    accent: 'bg-purple-600',
    accentText: 'text-purple-600',
    divider: 'border-purple-50',
    sidebarActive: 'bg-purple-700 text-white shadow-xl shadow-purple-200',
    sidebarInactive: 'text-slate-400 hover:bg-purple-50 hover:text-purple-600',
    msgBubbleOwn: 'bg-purple-600 text-white',
    msgBubbleOther: 'bg-white text-slate-800 border border-purple-100 shadow-sm',
    msgInput: 'bg-purple-50 border-purple-100',
    chatSidebar: 'bg-white border-purple-100',
    chatItemActive: 'bg-purple-50 border-purple-200',
    chatItemHover: 'hover:bg-purple-50/50',
    contextMenu: 'bg-white border-purple-100 shadow-2xl shadow-purple-200/80',
  },
  ocean: {
    name: 'Okean',
    icon: Monitor,
    bg: 'bg-[#F0F9FF]',
    sidebar: 'bg-white border-cyan-100',
    card: 'bg-white border-cyan-100',
    cardHover: 'hover:shadow-2xl hover:shadow-cyan-500/10',
    text: 'text-slate-900',
    textMuted: 'text-slate-400',
    input: 'bg-cyan-50 border-transparent focus:border-cyan-200 focus:bg-white',
    tableHead: 'bg-cyan-50/50',
    tableRow: 'hover:bg-cyan-50/30',
    accent: 'bg-cyan-600',
    accentText: 'text-cyan-600',
    divider: 'border-cyan-50',
    sidebarActive: 'bg-cyan-700 text-white shadow-xl shadow-cyan-200',
    sidebarInactive: 'text-slate-400 hover:bg-cyan-50 hover:text-cyan-600',
    msgBubbleOwn: 'bg-cyan-600 text-white',
    msgBubbleOther: 'bg-white text-slate-800 border border-cyan-100 shadow-sm',
    msgInput: 'bg-cyan-50 border-cyan-100',
    chatSidebar: 'bg-white border-cyan-100',
    chatItemActive: 'bg-cyan-50 border-cyan-200',
    chatItemHover: 'hover:bg-cyan-50/50',
    contextMenu: 'bg-white border-cyan-100 shadow-2xl shadow-cyan-200/80',
  },
};

// ============================================================
// HELPERS
// ============================================================
const getAvatarLetter = (name) => (name || '?').charAt(0).toUpperCase();

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState('light');
  
  const T = THEMES[theme];

  // Data States
  const [courses, setCourses] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    total_courses: 0, total_students: 0, total_income: 0,
    published_courses: 0, total_views: 0
  });

  // Modal States
  const [modalType, setModalType] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [enrollFilter, setEnrollFilter] = useState('all');
  const [enrollCourseFilter, setEnrollCourseFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // ── MESSAGING STATE ──────────────────────────────────────────
  const [chatStudents, setChatStudents] = useState([]);
  const [chatStudentsLoading, setChatStudentsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [conversations, setConversations] = useState({});
  const [msgInput, setMsgInput] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [typingStudents, setTypingStudents] = useState({});
  const [msgSearch, setMsgSearch] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [editingMsg, setEditingMsg] = useState(null);
  const typingTimerRef = useRef(null);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const msgInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const msgRefs = useRef({});

  // Form States — yuqorida e'lon qilinadi, handleCourseAction ishlatishidan oldin
  const [courseForm, setCourseForm] = useState({
    title: '', category: '', price: '', discount_price: '',
    level: 'beginner', short_description: '', description: '', thumbnail: null
  });
  const [blogForm, setBlogForm] = useState({
    title: '', content: '', featured_image: null, status: 'published'
  });

  // ── DATA FETCHING ────────────────────────────────────────────
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, coursesRes, enrollRes, catRes, blogRes] = await Promise.all([
        axiosInstance.get('/api/teacher/stats/').catch(() => ({ data: {} })),
        axiosInstance.get('/api/teacher/courses/').catch(() => ({ data: { results: [] } })),
        axiosInstance.get('/api/teacher/enrollments/').catch(() => ({ data: { results: [] } })),
        axiosInstance.get('/api/categories/').catch(() => ({ data: { results: [] } })),
        axiosInstance.get('/api/blog/teacher/').catch(() => ({ data: { results: [] } }))
      ]);

      setStats({
        ...statsRes.data,
        total_income: Number(statsRes.data.total_income || 0),
        total_views: Number(statsRes.data.total_views || 0)
      });
      setCourses(coursesRes.data.results || coursesRes.data || []);

      // ✅ FIX 1: enrollments doim massiv bo'lishini ta'minlash
      const enrollData = enrollRes.data.results || enrollRes.data || [];
      setEnrollments(Array.isArray(enrollData) ? enrollData : []);

      setCategories(catRes.data.results || catRes.data || []);
      setBlogs(blogRes.data.results || blogRes.data || []);
    } catch (err) {
      console.error('Dashboard Fetch Error:', err);
      toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ── FETCH ROOMS ──────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'messages') return;
    const fetchRooms = async () => {
      setChatStudentsLoading(true);
      try {
        const res = await axiosInstance.get('/api/chat/rooms/');
        const rooms = res.data.results ?? res.data ?? [];
        const mapped = rooms.map(room => {
          const other = room.participants?.find(p =>
            p.role === 'student' || p.role !== 'teacher'
          ) ?? room.participants?.[0] ?? {};
          const lastMsg = room.last_message;
          return {
            roomId:          room.id,
            id:              other.id,
            name:            other.full_name || other.username || 'Talaba',
            username:        other.username ?? '',
            email:           other.email ?? '',
            avatar:          getAvatarLetter(other.full_name || other.username),
            online:          false,
            unread:          room.unread_count ?? 0,
            course:          room.course ?? '',
            lastMessageText: lastMsg
              ? (lastMsg.is_deleted ? "Xabar o'chirildi" : lastMsg.content)
              : '',
            lastMessageTime: lastMsg?.created_at ?? null,
          };
        });
        setChatStudents(mapped);
        const counts = {};
        mapped.forEach(s => { counts[s.roomId] = s.unread; });
        setUnreadCounts(counts);
      } catch (err) {
        console.error('Rooms fetch error:', err);
        // Fallback: enrollments dan foydalanish
        const safeEnrollments = Array.isArray(enrollments) ? enrollments : [];
        const uniqueStudents = [];
        const seen = new Set();
        safeEnrollments.forEach(en => {
          const sid = en.student_id ?? en.student;
          if (sid && !seen.has(sid)) {
            seen.add(sid);
            uniqueStudents.push({
              roomId: null,
              id: sid,
              name: en.student_name ?? 'Talaba',
              username: en.student_username ?? '',
              email: en.student_email ?? '',
              avatar: getAvatarLetter(en.student_name),
              online: false, unread: 0,
              course: en.course_title ?? '',
              lastMessageText: '', lastMessageTime: null,
            });
          }
        });
        setChatStudents(uniqueStudents);
      } finally {
        setChatStudentsLoading(false);
      }
    };
    fetchRooms();
  }, [activeTab, enrollments]);

  // ── GET OR CREATE ROOM ───────────────────────────────────────
  useEffect(() => {
    if (!selectedStudent) return;
    const roomKey = selectedStudent.roomId ?? `student_${selectedStudent.id}`;
    if (conversations[roomKey]) {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'read' }));
      }
      setUnreadCounts(prev => ({ ...prev, [roomKey]: 0 }));
      return;
    }

    const initRoom = async () => {
      try {
        let roomId = selectedStudent.roomId;
        if (!roomId) {
          const createRes = await axiosInstance.post('/api/chat/rooms/', {
            participant_id: selectedStudent.id,
          });
          roomId = createRes.data.id;
          setChatStudents(prev => prev.map(s =>
            s.id === selectedStudent.id ? { ...s, roomId } : s
          ));
          setSelectedStudent(prev => ({ ...prev, roomId }));
        }
        const msgRes = await axiosInstance.get(`/api/chat/rooms/${roomId}/messages/`);
        const rawMsgs = msgRes.data.results ?? msgRes.data ?? [];
        const msgs = rawMsgs.map(m => normalizeMessage(m, selectedStudent));
        setConversations(prev => ({ ...prev, [roomId]: msgs }));
        setUnreadCounts(prev => ({ ...prev, [roomId]: 0 }));
      } catch (err) {
        console.error('Init room error:', err);
        const roomId = selectedStudent.roomId ?? `student_${selectedStudent.id}`;
        setConversations(prev => ({ ...prev, [roomId]: [] }));
      }
    };
    initRoom();
  }, [selectedStudent?.id]);

  // ── NORMALIZE MESSAGE ────────────────────────────────────────
  const normalizeMessage = useCallback((m, student) => {
    const myUserId = parseInt(localStorage.getItem('user_id') || '0');
    const isOwn = myUserId > 0
      ? m.sender?.id === myUserId
      : m.sender?.role === 'teacher';
    return {
      id:         m.id,
      senderId:   isOwn ? 'teacher' : (m.sender?.id ?? student?.id),
      senderName: isOwn
        ? 'Siz'
        : (m.sender?.full_name || m.sender?.username || student?.name || ''),
      text:      m.is_deleted ? '' : (m.content ?? ''),
      timestamp: m.created_at ?? new Date().toISOString(),
      read:      m.is_read ?? false,
      replyTo:   m.reply_to ? {
        id:   m.reply_to.id,
        text: m.reply_to.is_deleted ? "Xabar o'chirildi" : (m.reply_to.content ?? ''),
      } : null,
      deleted: m.is_deleted ?? false,
    };
  }, []);

  // ── WEBSOCKET ────────────────────────────────────────────────
  const selectedStudentRef = useRef(null);
  useEffect(() => { selectedStudentRef.current = selectedStudent; }, [selectedStudent]);

  useEffect(() => {
    if (activeTab !== 'messages' || !selectedStudent?.roomId) return;
    const roomId = selectedStudent.roomId;

    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    let reconnectTimer = null;
    let unmounted = false;

    const connectWS = () => {
      if (unmounted) return;
      try {
        const token = localStorage.getItem('access_token') || '';
        const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const ws = new WebSocket(
          `${proto}://${window.location.host}/ws/chat/${roomId}/?token=${token}`
        );
        wsRef.current = ws;

        ws.onopen = () => {
          if (unmounted) return;
          setWsConnected(true);
          ws.send(JSON.stringify({ type: 'read' }));
        };

        ws.onmessage = (event) => {
          if (unmounted) return;
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'chat_message') {
              const msg = data.message;
              const myUserId = parseInt(localStorage.getItem('user_id') || '0');
              const isOwn = myUserId > 0
                ? msg.sender?.id === myUserId
                : msg.sender?.role === 'teacher';
              const currentStudent = selectedStudentRef.current;
              const normalized = {
                id:         msg.id,
                senderId:   isOwn ? 'teacher' : (msg.sender?.id ?? currentStudent?.id),
                senderName: isOwn
                  ? 'Siz'
                  : (msg.sender?.full_name || msg.sender?.username || currentStudent?.name || ''),
                text:       msg.is_deleted ? '' : (msg.content ?? ''),
                timestamp:  msg.created_at ?? new Date().toISOString(),
                read:       msg.is_read ?? false,
                replyTo:    msg.reply_to ? {
                  id:   msg.reply_to.id,
                  text: msg.reply_to.is_deleted ? "Xabar o'chirildi" : (msg.reply_to.content ?? ''),
                } : null,
                deleted:    msg.is_deleted ?? false,
                fileUrl:    msg.file_url ?? null,
                fileType:   msg.file_type ?? null,
                fileName:   msg.file_name ?? null,
              };

              setConversations(prev => {
                const existing = prev[roomId] || [];
                if (existing.some(m => m.id === msg.id)) return prev;
                if (isOwn) {
                  const tempIdx = [...existing].reverse().findIndex(m =>
                    m.senderId === 'teacher' &&
                    m.text === normalized.text &&
                    String(m.id).length >= 13
                  );
                  if (tempIdx !== -1) {
                    const realIdx = existing.length - 1 - tempIdx;
                    const updated = [...existing];
                    updated[realIdx] = normalized;
                    return { ...prev, [roomId]: updated };
                  }
                }
                return { ...prev, [roomId]: [...existing, normalized] };
              });

              if (!isOwn && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'read' }));
              }
            }

            if (data.type === 'typing_indicator') {
              if (data.is_typing) {
                setTypingStudents(prev => ({ ...prev, [roomId]: true }));
                clearTimeout(typingTimerRef.current);
                typingTimerRef.current = setTimeout(() => {
                  setTypingStudents(prev => ({ ...prev, [roomId]: false }));
                }, 3000);
              } else {
                setTypingStudents(prev => ({ ...prev, [roomId]: false }));
              }
            }

            if (data.type === 'messages_read') {
              setConversations(prev => ({
                ...prev,
                [roomId]: (prev[roomId] || []).map(m =>
                  m.senderId === 'teacher' ? { ...m, read: true } : m
                ),
              }));
            }

            if (data.type === 'message_deleted') {
              setConversations(prev => ({
                ...prev,
                [roomId]: (prev[roomId] || []).map(m =>
                  m.id === data.message_id ? { ...m, deleted: true, text: '' } : m
                ),
              }));
            }

            if (data.type === 'message_edited') {
              setConversations(prev => ({
                ...prev,
                [roomId]: (prev[roomId] || []).map(m =>
                  m.id === data.message_id ? { ...m, text: data.content, edited: true } : m
                ),
              }));
            }
          } catch (e) {
            console.error('WS parse error:', e);
          }
        };

        ws.onclose = (e) => {
          if (unmounted) return;
          setWsConnected(false);
          if (e.code !== 1000) {
            reconnectTimer = setTimeout(connectWS, 3000);
          }
        };
        ws.onerror = () => {
          if (unmounted) return;
          setWsConnected(false);
        };
      } catch (err) {
        console.error('WS connect error:', err);
        setWsConnected(false);
        reconnectTimer = setTimeout(connectWS, 3000);
      }
    };

    connectWS();
    return () => {
      unmounted = true;
      clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close(1000);
        wsRef.current = null;
      }
      setWsConnected(false);
    };
  }, [selectedStudent?.roomId, activeTab]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, selectedStudent]);

  // ── EDIT MESSAGE ─────────────────────────────────────────────
  const submitEdit = useCallback(() => {
    const text = msgInput.trim();
    if (!text || !editingMsg) return;
    const roomId = selectedStudent?.roomId;
    if (!roomId) return;

    setConversations(prev => ({
      ...prev,
      [roomId]: (prev[roomId] || []).map(m =>
        m.id === editingMsg.id ? { ...m, text, edited: true } : m
      ),
    }));
    setMsgInput('');
    setEditingMsg(null);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'edit', message_id: editingMsg.id, content: text }));
    } else {
      axiosInstance.patch(`/api/chat/messages/${editingMsg.id}/`, { content: text })
        .catch(err => { console.error('Edit REST error:', err); toast.error("Tahrirlashda xatolik"); });
    }
  }, [msgInput, editingMsg, selectedStudent]);

  // ── SEND MESSAGE ─────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    if (editingMsg) { submitEdit(); return; }
    const text = msgInput.trim();
    if (!text || !selectedStudent) return;
    const roomId = selectedStudent.roomId;
    if (!roomId) { toast.error("Chat xonasi topilmadi"); return; }

    const tempId = Date.now();
    const newMsg = {
      id: tempId, senderId: 'teacher', senderName: 'Siz',
      text, timestamp: new Date().toISOString(),
      read: false,
      replyTo: replyTo ? { id: replyTo.id, text: replyTo.text } : null,
      deleted: false,
    };

    setConversations(prev => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), newMsg],
    }));
    setMsgInput('');
    setReplyTo(null);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'text',
        content: text,
        reply_to_id: replyTo?.id ?? null,
      }));
    } else {
      axiosInstance.post(`/api/chat/rooms/${roomId}/send/`, {
        message_type: 'text',
        content: text,
        reply_to_id: replyTo?.id ?? null,
      }).then(res => {
        if (res?.data?.id) {
          setConversations(prev => ({
            ...prev,
            [roomId]: (prev[roomId] || []).map(m =>
              m.id === tempId ? { ...m, id: res.data.id } : m
            ),
          }));
        }
      }).catch(err => console.error('Send REST error:', err));
    }
  }, [msgInput, selectedStudent, replyTo, editingMsg, submitEdit]);

  const handleTyping = (e) => {
    setMsgInput(e.target.value);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'typing', is_typing: true }));
    }
  };

  // ── DELETE MESSAGE ───────────────────────────────────────────
  const deleteMessage = useCallback((msgId) => {
    const roomId = selectedStudent?.roomId;
    if (!roomId) return;
    setConversations(prev => ({
      ...prev,
      [roomId]: (prev[roomId] || []).map(m =>
        m.id === msgId ? { ...m, deleted: true, text: '' } : m
      ),
    }));
    setContextMenu(null);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'delete', message_id: msgId }));
    } else {
      axiosInstance.delete(`/api/chat/messages/${msgId}/`)
        .catch(err => console.error('Delete REST error:', err));
    }
    toast.success("Xabar o'chirildi");
  }, [selectedStudent]);

  // ── SEND FILE ────────────────────────────────────────────────
  const fileInputRef = useRef(null);
  const sendFile = useCallback(async (file) => {
    const roomId = selectedStudent?.roomId;
    if (!roomId || !file) return;
    const isImage = file.type.startsWith('image/');
    const tempId = Date.now();
    const tempUrl = URL.createObjectURL(file);
    const tempMsg = {
      id: tempId, senderId: 'teacher', senderName: 'Siz',
      text: '', timestamp: new Date().toISOString(),
      read: false, replyTo: null, deleted: false,
      fileUrl: tempUrl, fileType: isImage ? 'image' : 'file',
      fileName: file.name, uploading: true,
    };
    setConversations(prev => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), tempMsg],
    }));
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('message_type', isImage ? 'image' : 'file');
      if (replyTo) form.append('reply_to_id', replyTo.id);
      const res = await axiosInstance.post(`/api/chat/rooms/${roomId}/send/`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setConversations(prev => ({
        ...prev,
        [roomId]: (prev[roomId] || []).map(m =>
          m.id === tempId
            ? { ...m, id: res.data.id, fileUrl: res.data.file_url ?? tempUrl, uploading: false }
            : m
        ),
      }));
      setReplyTo(null);
    } catch (err) {
      console.error('File send error:', err);
      toast.error("Fayl yuborishda xatolik");
      setConversations(prev => ({
        ...prev,
        [roomId]: (prev[roomId] || []).filter(m => m.id !== tempId),
      }));
    }
  }, [selectedStudent, replyTo]);

  // ── CONTEXT MENU ─────────────────────────────────────────────
  const handleLongPressStart = (e, msg) => {
    e.preventDefault();
    const timer = setTimeout(() => {
      const touch = e.touches?.[0];
      const x = touch?.clientX ?? e.clientX;
      const y = touch?.clientY ?? e.clientY;
      setContextMenu({ x, y, message: msg });
    }, 500);
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) clearTimeout(longPressTimer);
    setLongPressTimer(null);
  };

  useEffect(() => {
    const handler = () => setContextMenu(null);
    window.addEventListener('click', handler);
    window.addEventListener('scroll', handler);
    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('scroll', handler);
    };
  }, []);

  // ── ENROLLMENT ACTIONS ───────────────────────────────────────
  const handleEnrollmentAction = async (enrollmentId, action) => {
    if (actionLoadingId === enrollmentId) return;
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    const successMsg = action === 'accept' ? 'Talaba qabul qilindi ✓' : 'Talaba rad etildi';

    setActionLoadingId(enrollmentId);

    setEnrollments(prev => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return safePrev.map(en =>
        en.id === enrollmentId ? { ...en, status: newStatus } : en
      );
    });

    try {
      await axiosInstance.patch(`/api/teacher/enrollments/${enrollmentId}/`, { status: newStatus });
      toast.success(successMsg);
    } catch (err) {
      console.error('Enrollment action error:', err);
      fetchDashboardData();
      toast.error(err.response?.data?.detail || "Xatolik yuz berdi");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAssignGroup = async (enrollmentId, groupName) => {
    const trimmed = groupName.trim();
    if (!trimmed) return toast.error("Guruh nomi bo'sh bo'lishi mumkin emas");

    try {
      await axiosInstance.patch(`/api/teacher/enrollments/${enrollmentId}/`, { group: trimmed });
      toast.success("Guruh tayinlandi");

      setEnrollments(prev => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return safePrev.map(en =>
          en.id === enrollmentId ? { ...en, group: trimmed } : en
        );
      });
    } catch (err) {
      toast.error("Guruh tayinlashda xatolik");
    }
  };

  // ── COURSE OPERATIONS ────────────────────────────────────────
  const handleCourseAction = async (e) => {
    e.preventDefault();
    if (!courseForm.category) return toast.error("Kategoriyani tanlang!");
    setIsSubmitting(true);
    const formData = new FormData();
    Object.keys(courseForm).forEach(key => {
      if (key === 'thumbnail') {
        if (courseForm[key] instanceof globalThis.File) formData.append('thumbnail', courseForm[key]);
      } else if (courseForm[key] !== null && courseForm[key] !== '') {
        formData.append(key, courseForm[key]);
      }
    });
    try {
      if (editingItem) {
        await axiosInstance.patch(`/api/teacher/courses/${editingItem.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("Kurs yangilandi");
      } else {
        const res = await axiosInstance.post('/api/teacher/courses/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        try { await axiosInstance.post(`/api/teacher/courses/${res.data.id}/publish/`); } catch {}
        toast.success("Kurs yaratildi va nashr etildi!");
      }
      setModalType(null);
      setCourseForm({ title: '', category: '', price: '', discount_price: '', level: 'beginner', short_description: '', description: '', thumbnail: null });
      setEditingItem(null);
      fetchDashboardData();
    } catch (err) {
      console.error('Course save error:', err.response?.data || err.message);
      toast.error(err.response?.data?.detail || Object.values(err.response?.data || {})[0]?.[0] || "Kursni saqlashda xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeCourse = async (id) => {
    if (!window.confirm("Kursni butunlay o'chirmoqchimisiz?")) return;
    try {
      await axiosInstance.delete(`/api/teacher/courses/${id}/`);
      toast.success("Kurs o'chirildi");
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch { toast.error("O'chirishda xatolik"); }
  };

  // ── BLOG OPERATIONS ──────────────────────────────────────────
  const handleBlogAction = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', blogForm.title);
    formData.append('content', blogForm.content);
    formData.append('status', 'published');
    if (blogForm.featured_image instanceof globalThis.File) formData.append('featured_image', blogForm.featured_image);
    try {
      if (editingItem) {
        await axiosInstance.patch(`/api/blog/teacher/${editingItem.id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success("Maqola yangilandi");
      } else {
        await axiosInstance.post('/api/blog/teacher/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success("Yangi maqola chop etildi");
      }
      setModalType(null);
      setBlogForm({ title: '', content: '', featured_image: null, status: 'published' });
      setEditingItem(null);
      fetchDashboardData();
    } catch (err) {
      console.error('Blog save error:', err.response?.data || err.message);
      toast.error(err.response?.data?.detail || Object.values(err.response?.data || {})[0]?.[0] || "Blog saqlashda xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeBlog = async (id) => {
    if (!window.confirm("Maqolani o'chirishga aminmisiz?")) return;
    try {
      await axiosInstance.delete(`/api/blog/teacher/${id}/`);
      toast.success("Maqola o'chirildi");
      setBlogs(prev => prev.filter(b => b.id !== id));
    } catch { toast.error("Maqolani o'chirishda xatolik"); }
  };

  // ── CALCULATIONS ─────────────────────────────────────────────
  const finance = useMemo(() => {
    const gross = stats.total_income || 0;
    return {
      total: gross,
      teacher: gross * 0.7,
      platform: gross * 0.3,
      formatted: new Intl.NumberFormat('uz-UZ').format(gross)
    };
  }, [stats.total_income]);

  // ✅ FIX 2: Barcha filter operatsiyalari Array.isArray bilan himoyalangan
  const safeEnrollments = Array.isArray(enrollments) ? enrollments : [];

  const filteredCourses = courses.filter(c => c.title?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredBlogs = blogs.filter(b => b.title?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredEnrollments = safeEnrollments.filter(en => {
    const enCourseId = (en.course_id ?? en.course)?.toString();
    const courseMatch = enrollCourseFilter === 'all' || enCourseId === enrollCourseFilter;
    const enStatus = en.status || 'pending';
    const statusMatch = enrollFilter === 'all' || enStatus === enrollFilter;
    return courseMatch && statusMatch;
  });

  const filteredStudents = chatStudents.filter(s => {
    const q = msgSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name?.toLowerCase().includes(q) ||
      s.username?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.course?.toLowerCase().includes(q)
    );
  });

  const currentRoomId = selectedStudent?.roomId ?? null;
  const currentMessages = currentRoomId ? (conversations[currentRoomId] || []) : [];
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  const scrollToMessage = useCallback((msgId) => {
    const el = msgRefs.current[msgId];
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('msg-highlight');
    setTimeout(() => el.classList.remove('msg-highlight'), 1500);
  }, []);

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Bugun';
    if (d.toDateString() === yesterday.toDateString()) return 'Kecha';
    return d.toLocaleDateString('uz-UZ');
  };

  const groupedMessages = useMemo(() => {
    const groups = {};
    currentMessages.forEach(msg => {
      const dateKey = formatDate(msg.timestamp);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(msg);
    });
    return groups;
  }, [currentMessages]);

  // ── UI COMPONENTS ────────────────────────────────────────────
  const SidebarLink = ({ active, onClick, icon, label, badge }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black italic uppercase text-xs tracking-widest transition-all duration-300 relative ${
        active ? T.sidebarActive + ' translate-x-2' : T.sidebarInactive
      }`}
    >
      {icon} <span>{label}</span>
      {badge > 0 && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );

  const StatusBadge = ({ type }) => {
    const config = {
      published: "bg-emerald-100 text-emerald-700",
      draft: "bg-amber-100 text-amber-700",
      beginner: "bg-blue-100 text-blue-700",
      intermediate: "bg-indigo-100 text-indigo-700",
      advanced: "bg-purple-100 text-purple-700",
      accepted: "bg-emerald-100 text-emerald-700",
      rejected: "bg-red-100 text-red-700",
      pending: "bg-amber-100 text-amber-700",
    };
    const labels = {
      published: 'Nashr', draft: 'Qoralama',
      accepted: 'Qabul', rejected: 'Rad', pending: 'Kutmoqda',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${config[type] || config.draft}`}>
        {labels[type] || type}
      </span>
    );
  };

  const GroupCell = ({ enrollment, onSave }) => {
    const [editMode, setEditMode] = useState(false);
    const [groupVal, setGroupVal] = useState(enrollment.group || '');
    useEffect(() => { setGroupVal(enrollment.group || ''); }, [enrollment.group]);
    const save = () => {
      if (!groupVal.trim()) { toast.error("Guruh nomi bo'sh bo'lishi mumkin emas"); return; }
      onSave(enrollment.id, groupVal);
      setEditMode(false);
    };
    if (editMode) {
      return (
        <div className="flex items-center gap-2">
          <input autoFocus value={groupVal} onChange={e => setGroupVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditMode(false); }}
            className={`w-28 px-3 py-2 rounded-xl text-xs font-bold border-2 outline-none ${T.input}`}
            placeholder="Guruh nomi" />
          <button onClick={save} className="p-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition"><CheckCircle size={14}/></button>
          <button onClick={() => { setGroupVal(enrollment.group || ''); setEditMode(false); }} className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200 transition"><X size={14}/></button>
        </div>
      );
    }
    return (
      <button onClick={() => setEditMode(true)}
        className={`px-4 py-2 rounded-xl text-xs font-black uppercase italic tracking-wider transition-all border-2 border-dashed ${
          enrollment.group ? `${T.accentText} border-current bg-opacity-10` : 'text-slate-300 border-slate-200 hover:border-indigo-300'
        }`}>
        {enrollment.group || '+ Guruh'}
      </button>
    );
  };

  // ── LOADING ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={`h-screen w-full flex flex-col items-center justify-center ${T.bg}`}>
        <Loader2 className={`animate-spin mb-4 ${T.accentText}`} size={48} />
        <p className={`font-black italic uppercase tracking-[0.3em] animate-pulse ${T.textMuted}`}>Sinxronizatsiya...</p>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className={`min-h-screen ${T.bg} flex font-sans`}>
      <Toaster position="top-right" />

      {/* ── CONTEXT MENU ─────────────────────────────────────── */}
      {contextMenu && (
        <div
          className={`fixed z-[200] min-w-[180px] rounded-2xl border overflow-hidden ${T.contextMenu}`}
          style={{ top: Math.min(contextMenu.y, window.innerHeight - 200), left: Math.min(contextMenu.x, window.innerWidth - 200) }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => { setReplyTo({ id: contextMenu.message.id, text: contextMenu.message.text }); setContextMenu(null); msgInputRef.current?.focus(); }}
            className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-bold hover:bg-indigo-500 hover:text-white transition-colors ${T.text}`}
          >
            <CornerUpLeft size={16}/> Javob berish
          </button>
          {contextMenu.message.senderId === 'teacher' && !contextMenu.message.deleted && !contextMenu.message.fileUrl && (
            <button
              onClick={() => {
                setEditingMsg({ id: contextMenu.message.id, text: contextMenu.message.text });
                setMsgInput(contextMenu.message.text);
                setReplyTo(null);
                setContextMenu(null);
                msgInputRef.current?.focus();
              }}
              className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-bold hover:bg-amber-500 hover:text-white transition-colors ${T.text}`}
            >
              <Pencil size={16}/> Tahrirlash
            </button>
          )}
          {contextMenu.message.senderId === 'teacher' && !contextMenu.message.deleted && (
            <button
              onClick={() => deleteMessage(contextMenu.message.id)}
              className="w-full flex items-center gap-3 px-5 py-4 text-sm font-bold text-red-500 hover:bg-red-500 hover:text-white transition-colors"
            >
              <Trash2 size={16}/> O'chirish
            </button>
          )}
          {!contextMenu.message.fileUrl && (
            <button
              onClick={() => { navigator.clipboard.writeText(contextMenu.message.text); toast.success("Nusxalandi"); setContextMenu(null); }}
              className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-bold hover:bg-slate-100 transition-colors ${T.text}`}
            >
              <CheckCircle size={16}/> Nusxalash
            </button>
          )}
        </div>
      )}

      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      <aside className={`w-80 ${T.sidebar} border-r flex flex-col sticky top-0 h-screen z-50`}>
        <div className="p-12">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${T.accent} rounded-2xl flex items-center justify-center shadow-2xl`}>
              <Zap className="text-white fill-current" size={24} />
            </div>
            <span className={`text-2xl font-black italic tracking-tighter uppercase ${T.text}`}>
              EDU<span className={T.accentText}>PRO</span>
            </span>
          </div>
        </div>

        <nav className="flex-1 px-8 space-y-3">
          <SidebarLink active={activeTab === 'overview'}  onClick={() => setActiveTab('overview')}  icon={<BarChart3 size={18}/>}     label="Dashboard" />
          <SidebarLink active={activeTab === 'courses'}   onClick={() => setActiveTab('courses')}   icon={<BookOpen size={18}/>}      label="Kurslarim" />
          <SidebarLink active={activeTab === 'blogs'}     onClick={() => setActiveTab('blogs')}     icon={<FileText size={18}/>}      label="Maqolalar" />
          <SidebarLink active={activeTab === 'students'}  onClick={() => setActiveTab('students')}  icon={<Users size={18}/>}         label="Talabalar" />
          <SidebarLink active={activeTab === 'messages'}  onClick={() => setActiveTab('messages')}  icon={<MessageCircle size={18}/>} label="Xabarlar"  badge={totalUnread} />
          <SidebarLink active={activeTab === 'stream'}    onClick={() => setActiveTab('stream')}    icon={<Radio size={18}/>}         label="Jonli Efir" />
          <SidebarLink active={activeTab === 'finance'}   onClick={() => setActiveTab('finance')}   icon={<Wallet size={18}/>}        label="Moliya" />
          <SidebarLink active={activeTab === 'settings'}  onClick={() => setActiveTab('settings')}  icon={<Settings size={18}/>}      label="Sozlamalar" />
        </nav>

        <div className={`p-10 border-t ${T.divider}`}>
          <button className={`w-full flex items-center gap-4 p-4 font-black italic uppercase text-xs hover:text-red-500 transition-colors ${T.textMuted}`}>
            <LogOut size={18}/> <span>Tizimdan Chiqish</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <main className={`flex-1 overflow-x-hidden ${activeTab === 'messages' || activeTab === 'stream' ? '' : 'p-12 lg:p-20'}`}>

        {/* HEADER */}
        {activeTab !== 'messages' && activeTab !== 'stream' && (
          <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-20">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className={`w-12 h-1.5 ${T.accent} rounded-full`}></span>
                <p className={`font-black uppercase italic tracking-[0.3em] text-[10px] ${T.accentText}`}>O'qituvchi Kabineti</p>
              </div>
              <h2 className={`text-7xl font-black italic tracking-tighter uppercase leading-tight ${T.text}`}>
                {activeTab === 'overview'  ? 'Xush Kelibsiz' :
                 activeTab === 'courses'   ? 'Kurslarim'     :
                 activeTab === 'blogs'     ? 'Maqolalar'     :
                 activeTab === 'students'  ? 'Talabalar'     :
                 activeTab === 'finance'   ? 'Moliya'        : 'Sozlamalar'}
              </h2>
            </div>
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-none">
                <Search className={`absolute left-5 top-1/2 -translate-y-1/2 ${T.textMuted}`} size={20} />
                <input type="text" placeholder="Qidirish..."
                  className={`border-2 py-5 pl-14 pr-8 rounded-[2rem] outline-none focus:ring-8 focus:ring-indigo-500/5 font-bold transition-all w-full lg:w-80 shadow-sm ${T.input}`}
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              {activeTab !== 'students' && activeTab !== 'settings' && activeTab !== 'finance' && activeTab !== 'overview' && (
                <button
                  onClick={() => {
                    setEditingItem(null);
                    if (activeTab === 'blogs') {
                      setBlogForm({ title: '', content: '', featured_image: null, status: 'published' });
                    } else {
                      setCourseForm({ title: '', category: '', price: '', discount_price: '', level: 'beginner', short_description: '', description: '', thumbnail: null });
                    }
                    setModalType(activeTab === 'blogs' ? 'blog' : 'course');
                  }}
                  className={`${T.accent} text-white px-10 py-5 rounded-[2rem] font-black italic uppercase tracking-wider shadow-2xl hover:opacity-90 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 whitespace-nowrap`}
                >
                  <PlusCircle size={22} /> Yangi Qo'shish
                </button>
              )}
            </div>
          </header>
        )}

        {/* ── TAB: OVERVIEW ──────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              <div className={`${T.card} border p-10 rounded-[3rem] shadow-sm ${T.cardHover} transition-all group`}>
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform"><Users size={28}/></div>
                <p className={`font-black uppercase italic text-[10px] tracking-widest mb-2 ${T.textMuted}`}>Talabalar</p>
                <h3 className={`text-5xl font-black italic tracking-tighter ${T.text}`}>{stats.total_students}</h3>
              </div>
              <div className={`${T.card} border p-10 rounded-[3rem] shadow-sm ${T.cardHover} transition-all group`}>
                <div className={`w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform ${T.accentText}`}><BookOpen size={28}/></div>
                <p className={`font-black uppercase italic text-[10px] tracking-widest mb-2 ${T.textMuted}`}>Kurslar</p>
                <h3 className={`text-5xl font-black italic tracking-tighter ${T.text}`}>{stats.total_courses}</h3>
              </div>
              <div className={`${T.card} border p-10 rounded-[3rem] shadow-sm ${T.cardHover} transition-all group`}>
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform"><Eye size={28}/></div>
                <p className={`font-black uppercase italic text-[10px] tracking-widest mb-2 ${T.textMuted}`}>Ko'rishlar</p>
                <h3 className={`text-5xl font-black italic tracking-tighter ${T.text}`}>{stats.total_views}</h3>
              </div>
              <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-8"><DollarSign size={28}/></div>
                  <p className="text-slate-500 font-black uppercase italic text-[10px] tracking-widest mb-2">Sizning Ulushingiz</p>
                  <h3 className="text-4xl font-black italic tracking-tighter text-indigo-400">
                    {new Intl.NumberFormat('uz-UZ').format(finance.teacher)} <span className="text-xs">UZS</span>
                  </h3>
                </div>
                <TrendingUp className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 -rotate-12" />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
              <div className={`xl:col-span-2 ${T.card} border rounded-[4rem] p-12 shadow-sm`}>
                <div className="flex justify-between items-center mb-12">
                  <h4 className={`text-2xl font-black italic uppercase tracking-tighter ${T.text}`}>Yaqinda yozilganlar</h4>
                  <button
                    onClick={() => setActiveTab('students')}
                    className={`bg-slate-50 px-6 py-3 rounded-xl font-black text-[10px] uppercase italic hover:bg-indigo-600 hover:text-white transition-all ${T.text}`}
                  >
                    Barchasi
                  </button>
                </div>
                <div className="space-y-6">
                  {safeEnrollments.slice(0, 5).map((en, i) => (
                    <div key={en.id || i} className={`flex items-center justify-between p-6 ${T.tableRow} rounded-[2rem] transition-all`}>
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center font-black text-indigo-400 italic text-xl shadow-lg">
                          {en.student_name?.charAt(0)}
                        </div>
                        <div>
                          <p className={`font-black italic uppercase text-lg ${T.text}`}>{en.student_name}</p>
                          <p className={`text-[10px] font-bold uppercase tracking-widest ${T.textMuted}`}>{en.course_title}</p>
                        </div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className={`text-xs font-black italic mb-2 ${T.text}`}>{new Date(en.enrolled_at).toLocaleDateString()}</p>
                        <StatusBadge type={en.status || 'pending'} />
                      </div>
                    </div>
                  ))}

                  {safeEnrollments.length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center">
                      <Layers className="text-slate-100 mb-4" size={64} />
                      <p className={`font-black italic uppercase tracking-widest text-xs ${T.textMuted}`}>Hali hech kim yozilmagan</p>
                    </div>
                  )}
                </div>
              </div>

              <div className={`${T.card} border rounded-[4rem] p-12 shadow-sm flex flex-col`}>
                <h4 className={`text-2xl font-black italic uppercase tracking-tighter mb-12 text-center ${T.text}`}>Moliya Taqsimoti</h4>
                <div className="flex-1 flex flex-col items-center justify-center relative mb-12">
                  <div className={`w-56 h-56 rounded-full border-[16px] ${theme === 'dark' ? 'border-slate-800' : 'border-slate-50'} flex items-center justify-center relative`}>
                    <div className="text-center">
                      <p className={`text-[10px] font-black uppercase tracking-widest italic mb-1 ${T.textMuted}`}>Umumiy Savdo</p>
                      <p className={`font-black italic text-xl ${T.text}`}>{finance.formatted}</p>
                    </div>
                    <div className={`absolute inset-0 rounded-full border-[16px] ${T.accent.replace('bg-','border-')} border-t-transparent border-r-transparent rotate-45`}></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className={`flex justify-between items-center p-5 ${theme === 'dark' ? 'bg-indigo-900/20 border-indigo-800' : 'bg-indigo-50 border-indigo-100'} rounded-2xl border`}>
                    <span className={`font-black italic uppercase text-[10px] ${T.accentText}`}>Sizning Ulushingiz (70%)</span>
                    <span className={`font-black italic ${T.text}`}>{new Intl.NumberFormat('uz-UZ').format(finance.teacher)}</span>
                  </div>
                  <div className={`flex justify-between items-center p-5 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'} rounded-2xl border`}>
                    <span className={`font-black italic uppercase text-[10px] ${T.textMuted}`}>Platforma (30%)</span>
                    <span className={`font-black italic ${T.text}`}>{new Intl.NumberFormat('uz-UZ').format(finance.platform)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: COURSES ───────────────────────────────────── */}
        {activeTab === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {filteredCourses.map(course => (
              <div key={course.id} className={`${T.card} border rounded-[3rem] overflow-hidden group ${T.cardHover} transition-all duration-500 flex flex-col border-b-8 border-b-transparent hover:border-b-indigo-500`}>
                <div className="h-72 bg-slate-100 relative overflow-hidden">
                  <img src={course.thumbnail || "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={course.title} />
                  <div className="absolute top-8 left-8 flex flex-col gap-2">
                    <StatusBadge type={course.status} />
                    <StatusBadge type={course.level} />
                  </div>
                  <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm">
                    <button onClick={() => { setEditingItem(course); setCourseForm({ title: course.title, category: course.category, price: course.price, discount_price: course.discount_price || '', level: course.level, short_description: course.short_description, description: course.description, thumbnail: null }); setModalType('course'); }} className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-2xl hover:scale-110"><Edit3 size={28}/></button>
                    <button onClick={() => removeCourse(course.id)} className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-2xl hover:scale-110"><Trash2 size={28}/></button>
                  </div>
                </div>
                <div className="p-12 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-2 h-2 ${T.accent} rounded-full`}></div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] italic ${T.accentText}`}>{course.category_name || "Dasturlash"}</p>
                  </div>
                  <h4 className={`text-3xl font-black italic uppercase tracking-tighter mb-6 line-clamp-1 ${T.text}`}>{course.title}</h4>
                  <p className={`text-sm font-medium line-clamp-2 mb-10 leading-relaxed italic ${T.textMuted}`}>{course.short_description}</p>
                  <div className={`mt-auto pt-10 border-t ${T.divider} flex items-center justify-between`}>
                    <div>
                      <p className={`text-[10px] font-black uppercase italic mb-1 tracking-widest ${T.textMuted}`}>Kurs Narxi</p>
                      <p className={`font-black italic text-xl tracking-tighter ${T.text}`}>{new Intl.NumberFormat('uz-UZ').format(course.price)} <span className="text-[10px] font-bold">UZS</span></p>
                    </div>
                    <div className="flex items-center -space-x-3">
                      {[1,2,3].map(i => (<div key={i} className={`w-10 h-10 rounded-full border-4 ${theme === 'dark' ? 'border-[#1A1D27]' : 'border-white'} bg-slate-100 flex items-center justify-center font-black text-[10px] italic`}>{i}</div>))}
                      <div className={`w-10 h-10 rounded-full border-4 ${theme === 'dark' ? 'border-[#1A1D27]' : 'border-white'} ${T.accent} text-white flex items-center justify-center font-black text-[10px] italic`}>+{course.total_students || 0}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {courses.length === 0 && (
              <div className="col-span-full py-60 text-center flex flex-col items-center">
                <div className={`w-32 h-32 ${T.card} border rounded-full flex items-center justify-center mb-8`}><LayoutDashboard className={T.textMuted} size={48}/></div>
                <h3 className={`text-4xl font-black italic uppercase tracking-tighter mb-4 ${T.textMuted}`}>Kurslaringiz Yo'q</h3>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: BLOGS ─────────────────────────────────────── */}
        {activeTab === 'blogs' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {filteredBlogs.map(blog => (
              <div key={blog.id} className={`${T.card} border p-10 rounded-[4rem] flex flex-col md:flex-row gap-10 group hover:border-indigo-100 transition-all shadow-sm relative overflow-hidden`}>
                <div className="w-full md:w-56 h-56 rounded-[3rem] overflow-hidden flex-shrink-0 bg-slate-50 relative">
                  <img src={blog.featured_image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800"} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" alt={blog.title} />
                </div>
                <div className="flex-1 flex flex-col py-2">
                  <div className="flex justify-between items-start mb-6">
                    <StatusBadge type={blog.status} />
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-500">
                      <button onClick={() => { setEditingItem(blog); setBlogForm({ title: blog.title, content: blog.content, featured_image: null, status: blog.status }); setModalType('blog'); }} className={`p-3 ${T.textMuted} hover:text-indigo-600 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'} rounded-2xl transition-all`}><Edit3 size={20}/></button>
                      <button onClick={() => removeBlog(blog.id)} className={`p-3 ${T.textMuted} hover:text-red-600 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'} rounded-2xl transition-all`}><Trash2 size={20}/></button>
                    </div>
                  </div>
                  <h4 className={`text-3xl font-black italic uppercase tracking-tighter mb-4 leading-tight line-clamp-2 ${T.text}`}>{blog.title}</h4>
                  <p className={`text-sm font-medium line-clamp-2 mb-8 leading-relaxed italic ${T.textMuted}`}>{blog.content}</p>
                  <div className={`mt-auto flex justify-between items-center text-[10px] font-black uppercase italic tracking-[0.2em] ${T.textMuted}`}>
                    <span className={`flex items-center gap-2 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'} px-4 py-2 rounded-full`}><Calendar size={14}/> {new Date(blog.created_at).toLocaleDateString()}</span>
                    <span className={`flex items-center gap-2 ${theme === 'dark' ? 'bg-indigo-900/20 text-indigo-400' : 'bg-indigo-50 text-indigo-400'} px-4 py-2 rounded-full`}><Eye size={14}/> {blog.views_count || 0}</span>
                  </div>
                </div>
              </div>
            ))}
            {blogs.length === 0 && (
              <div className={`col-span-full py-40 text-center flex flex-col items-center opacity-30 ${T.textMuted}`}>
                <FileText className="mb-6" size={80}/>
                <h3 className="text-3xl font-black italic uppercase tracking-widest">Hali maqola yo'q</h3>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: STUDENTS ──────────────────────────────────── */}
        {activeTab === 'students' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className={`${T.card} border rounded-[2.5rem] p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between shadow-sm`}>
              <div className="flex items-center gap-4 flex-wrap">
                <span className={`text-[10px] font-black uppercase italic tracking-widest ${T.textMuted}`}>Kurs:</span>
                <div className="flex gap-3 flex-wrap">
                  <button onClick={() => setEnrollCourseFilter('all')} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase italic tracking-wider transition-all ${enrollCourseFilter === 'all' ? `${T.accent} text-white shadow-lg` : `${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-400'} hover:opacity-80`}`}>Barcha Kurslar</button>
                  {courses.map(c => (<button key={c.id} onClick={() => setEnrollCourseFilter(c.id.toString())} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase italic tracking-wider transition-all ${enrollCourseFilter === c.id.toString() ? `${T.accent} text-white shadow-lg` : `${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-400'} hover:opacity-80`}`}>{c.title?.length > 20 ? c.title.slice(0, 20) + '...' : c.title}</button>))}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {['all', 'pending', 'accepted', 'rejected'].map(s => (<button key={s} onClick={() => setEnrollFilter(s)} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase italic tracking-wider transition-all ${enrollFilter === s ? s === 'accepted' ? 'bg-emerald-500 text-white shadow-lg' : s === 'rejected' ? 'bg-red-500 text-white shadow-lg' : s === 'pending' ? 'bg-amber-500 text-white shadow-lg' : `${T.accent} text-white shadow-lg` : `${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-400'} hover:opacity-80`}`}>{s === 'all' ? 'Barchasi' : s === 'pending' ? 'Kutmoqda' : s === 'accepted' ? 'Qabul' : 'Rad'}</button>))}
              </div>
            </div>

            {/* ✅ FIX 3: Statistika kartochkalarida safeEnrollments ishlatiladi */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'Kutmoqda',       count: safeEnrollments.filter(e => !e.status || e.status === 'pending').length,  color: 'text-amber-500',   bg: theme === 'dark' ? 'bg-amber-900/20'  : 'bg-amber-50'  },
                { label: 'Qabul qilingan', count: safeEnrollments.filter(e => e.status === 'accepted').length,              color: 'text-emerald-500', bg: theme === 'dark' ? 'bg-emerald-900/20': 'bg-emerald-50' },
                { label: 'Rad etilgan',    count: safeEnrollments.filter(e => e.status === 'rejected').length,              color: 'text-red-500',     bg: theme === 'dark' ? 'bg-red-900/20'    : 'bg-red-50'    },
              ].map((item, i) => (
                <div key={i} className={`${item.bg} rounded-[2rem] p-8 text-center`}>
                  <p className={`text-4xl font-black italic ${item.color}`}>{item.count}</p>
                  <p className={`text-[10px] font-black uppercase italic tracking-widest mt-2 ${T.textMuted}`}>{item.label}</p>
                </div>
              ))}
            </div>

            <div className={`${T.card} border rounded-[4rem] shadow-sm overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className={T.tableHead}>
                      {['#', 'Talaba', 'Kurs', 'Guruh', 'Holat', 'Amallar', 'Sana'].map(h => (
                        <th key={h} className={`p-8 font-black uppercase italic tracking-widest text-[10px] ${T.textMuted} ${h === 'Amallar' ? 'text-center' : h === 'Sana' ? 'text-right' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${T.divider}`}>
                    {filteredEnrollments.map((en, i) => (
                      <tr key={en.id || i} className={`${T.tableRow} transition-all group`}>
                        <td className={`p-8 font-black italic text-2xl ${T.textMuted}`}>{(i + 1).toString().padStart(2, '0')}</td>
                        <td className="p-8">
                          <div className="flex items-center gap-5">
                            <div className={`w-14 h-14 ${T.accent} rounded-[1.5rem] flex items-center justify-center font-black text-white italic text-lg shadow-lg group-hover:rotate-12 transition-transform duration-500`}>{en.student_name?.charAt(0)?.toUpperCase()}</div>
                            <div>
                              <span className={`font-black italic uppercase text-base block ${T.text}`}>{en.student_name}</span>
                              <span className={`text-[10px] font-bold italic lowercase ${T.textMuted}`}>{en.student_email || 'example@edu.uz'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-8">
                          <span className={`font-black text-xs italic uppercase tracking-wider px-4 py-2 rounded-full ${theme === 'dark' ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>{en.course_title?.length > 25 ? en.course_title.slice(0, 25) + '...' : en.course_title}</span>
                        </td>
                        <td className="p-8"><GroupCell enrollment={en} onSave={handleAssignGroup} /></td>
                        <td className="p-8"><StatusBadge type={en.status || 'pending'} /></td>
                        <td className="p-8">
                          <div className="flex items-center justify-center gap-3">
                            {actionLoadingId === en.id ? (<Loader2 className="animate-spin text-indigo-400" size={22}/>) : (
                              <>
                                {(en.status === 'pending' || !en.status) && (<><button onClick={() => handleEnrollmentAction(en.id, 'accept')} className="flex items-center gap-2 px-5 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase italic tracking-wider hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-100"><UserCheck size={14}/> Qabul</button><button onClick={() => handleEnrollmentAction(en.id, 'reject')} className="flex items-center gap-2 px-5 py-3 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase italic tracking-wider hover:bg-red-600 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-100"><UserX size={14}/> Rad</button></>)}
                                {en.status === 'accepted' && (<button onClick={() => handleEnrollmentAction(en.id, 'reject')} className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase italic tracking-wider hover:bg-red-500 hover:text-white transition-all ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}><UserX size={14}/> Rad et</button>)}
                                {en.status === 'rejected' && (<button onClick={() => handleEnrollmentAction(en.id, 'accept')} className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase italic tracking-wider hover:bg-emerald-500 hover:text-white transition-all ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}><UserCheck size={14}/> Qabul qil</button>)}
                              </>
                            )}
                          </div>
                        </td>
                        <td className={`p-8 text-right font-black italic text-sm ${T.textMuted}`}>{new Date(en.enrolled_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredEnrollments.length === 0 && (
                  <div className={`p-32 text-center font-black uppercase tracking-widest italic ${T.textMuted}`}>
                    <Users className="mx-auto mb-6 opacity-20" size={64}/>
                    <p>Hali talabalar yo'q</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: MESSAGES ──────────────────────────────────── */}
        {activeTab === 'messages' && (
          <div className={`flex h-screen animate-in fade-in duration-500`}>
          <style>{`
            .msg-highlight > div { animation: msgFlash 1.5s ease-out; }
            @keyframes msgFlash {
              0%   { background-color: rgba(99,102,241,0.35); border-radius: 1rem; }
              100% { background-color: transparent; }
            }
          `}</style>
            <div className={`w-96 flex-shrink-0 ${T.chatSidebar} border-r flex flex-col`}>
              <div className="p-8 pb-4">
                <h2 className={`text-3xl font-black italic uppercase tracking-tighter mb-6 ${T.text}`}>
                  Xabarlar
                  {totalUnread > 0 && (
                    <span className="ml-3 px-3 py-1 bg-red-500 text-white text-xs font-black rounded-full">{totalUnread}</span>
                  )}
                </h2>
                <div className="relative">
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${T.textMuted}`} size={16}/>
                  <input type="text" placeholder="Ism yoki username..." value={msgSearch} onChange={e => setMsgSearch(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-bold border outline-none transition-all ${T.msgInput} ${T.text}`} />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
                {chatStudentsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl animate-pulse`}>
                      <div className={`w-14 h-14 rounded-2xl flex-shrink-0 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`}></div>
                      <div className="flex-1 space-y-2">
                        <div className={`h-3 rounded-full w-3/4 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`}></div>
                        <div className={`h-2.5 rounded-full w-1/2 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}></div>
                      </div>
                    </div>
                  ))
                ) : filteredStudents.length === 0 ? (
                  <div className={`py-16 text-center flex flex-col items-center gap-3 ${T.textMuted}`}>
                    <MessageCircle size={40} className="opacity-20"/>
                    <p className="text-xs font-black uppercase italic tracking-widest">Talabalar yo'q</p>
                  </div>
                ) : (
                  filteredStudents.map(student => {
                    const msgs = conversations[student.roomId] || [];
                    const lastMsg = msgs[msgs.length - 1];
                    const lastText = lastMsg?.text || student.lastMessageText || student.course;
                    const lastTime = lastMsg?.timestamp || student.lastMessageTime;
                    const unread = unreadCounts[student.roomId] || 0;
                    const isTypingNow = typingStudents[student.roomId];
                    const isActive = selectedStudent?.roomId === student.roomId && selectedStudent?.id === student.id;
                    return (
                      <button key={student.id} onClick={() => setSelectedStudent(student)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left group ${isActive ? T.chatItemActive : `border-transparent ${T.chatItemHover}`}`}>
                        <div className="relative flex-shrink-0">
                          <div className={`w-14 h-14 ${isActive ? T.accent : 'bg-slate-200'} rounded-2xl flex items-center justify-center font-black text-xl italic ${isActive ? 'text-white' : T.textMuted} shadow-sm`}>
                            {student.avatar}
                          </div>
                          {student.online && (<div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-sm"></div>)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={`font-black italic text-sm uppercase tracking-tight truncate ${T.text}`}>{student.name}</span>
                            <span className={`text-[10px] font-bold flex-shrink-0 ml-2 ${T.textMuted}`}>{lastTime ? formatTime(lastTime) : ''}</span>
                          </div>
                          {student.username && (
                            <p className={`text-[10px] font-bold truncate mb-0.5 ${msgSearch && student.username.toLowerCase().includes(msgSearch.toLowerCase()) ? 'text-indigo-500' : T.textMuted}`}>@{student.username}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <p className={`text-xs truncate italic ${T.textMuted}`}>
                              {isTypingNow ? <span className="text-emerald-500 font-bold">yozmoqda...</span> : lastMsg?.deleted ? <span className="italic opacity-50">Xabar o'chirildi</span> : lastText}
                            </p>
                            {unread > 0 && (
                              <span className="ml-2 flex-shrink-0 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">{unread > 9 ? '9+' : unread}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {selectedStudent ? (
              <div className="flex-1 flex flex-col min-w-0">
                <div className={`flex items-center justify-between px-8 py-5 border-b ${T.divider} ${T.card} flex-shrink-0`}>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className={`w-12 h-12 ${T.accent} rounded-xl flex items-center justify-center font-black text-lg italic text-white shadow-lg`}>{selectedStudent.avatar}</div>
                      {selectedStudent.online && (<div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white"></div>)}
                    </div>
                    <div>
                      <h3 className={`font-black italic uppercase tracking-tight text-lg ${T.text}`}>{selectedStudent.name}</h3>
                      <p className={`text-xs font-bold italic ${T.textMuted}`}>
                        {typingStudents[selectedStudent.roomId] ? <span className="text-emerald-500">yozmoqda...</span> : selectedStudent.online ? <span className="text-emerald-500">Onlayn</span> : 'Oflayn'}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase italic ${wsConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                    {wsConnected ? 'Real-time' : 'Ulanmoqda...'}
                  </div>
                </div>

                <div ref={chatContainerRef} className={`flex-1 overflow-y-auto px-8 py-6 space-y-2 ${T.bg}`}>
                  {Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
                    <div key={dateLabel}>
                      <div className="flex items-center gap-4 my-6">
                        <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
                        <span className={`text-[10px] font-black uppercase italic tracking-widest px-3 py-1.5 rounded-full ${theme === 'dark' ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>{dateLabel}</span>
                        <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
                      </div>
                      {msgs.map((msg, idx) => {
                        const isOwn = msg.senderId === 'teacher';
                        const prevMsg = idx > 0 ? msgs[idx - 1] : null;
                        const isSameSender = prevMsg && prevMsg.senderId === msg.senderId;
                        return (
                          <div key={msg.id}
                            ref={el => { if (el) msgRefs.current[msg.id] = el; else delete msgRefs.current[msg.id]; }}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${isSameSender ? 'mt-1' : 'mt-4'} group/msg transition-colors duration-300`}>
                            {!isOwn && (
                              <div className="flex-shrink-0 mr-3 self-end">
                                {!isSameSender ? (
                                  <div className={`w-8 h-8 ${T.accent} rounded-xl flex items-center justify-center font-black text-white text-xs`}>{selectedStudent.avatar}</div>
                                ) : <div className="w-8"></div>}
                              </div>
                            )}
                            <div className={`max-w-[65%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                              <div className="relative group/bubble cursor-pointer select-none"
                                onTouchStart={e => handleLongPressStart(e, msg)}
                                onTouchEnd={handleLongPressEnd}
                                onTouchMove={handleLongPressEnd}
                                onContextMenu={e => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, message: msg }); }}>
                                {msg.replyTo && !msg.deleted && (
                                  <div onClick={() => scrollToMessage(msg.replyTo.id)}
                                    className={`mb-1 px-3 py-2 rounded-xl border-l-4 border-indigo-400 text-xs italic truncate max-w-full cursor-pointer hover:opacity-80 active:scale-95 transition-all ${isOwn ? 'bg-white/10 text-white/70' : theme === 'dark' ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                    <span className="font-black uppercase text-[9px] block mb-0.5 not-italic text-indigo-400">↩ Javob</span>
                                    {msg.replyTo.text.length > 60 ? msg.replyTo.text.slice(0, 60) + '...' : msg.replyTo.text}
                                  </div>
                                )}
                                <div className={`px-4 py-3 rounded-2xl transition-all ${msg.deleted ? `border-2 border-dashed ${theme === 'dark' ? 'border-slate-700 text-slate-600' : 'border-slate-200 text-slate-300'} bg-transparent italic text-sm` : isOwn ? `${T.msgBubbleOwn} rounded-tr-sm shadow-lg shadow-indigo-500/10` : `${T.msgBubbleOther} rounded-tl-sm`}`}>
                                  {msg.deleted ? (
                                    <span className="flex items-center gap-2 text-xs"><Trash2 size={12}/> Xabar o'chirildi</span>
                                  ) : msg.fileType === 'image' ? (
                                    <div className="relative">
                                      {msg.uploading && (<div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl"><Loader2 size={24} className="animate-spin text-white"/></div>)}
                                      <img src={msg.fileUrl} alt={msg.fileName || 'rasm'} className="max-w-[220px] max-h-[220px] rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(msg.fileUrl, '_blank')} />
                                    </div>
                                  ) : msg.fileType === 'file' ? (
                                    <a href={msg.fileUrl} target="_blank" rel="noreferrer" className={`flex items-center gap-3 px-1 py-1 rounded-lg hover:opacity-80 transition-opacity ${isOwn ? 'text-white' : T.text}`}>
                                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isOwn ? 'bg-white/20' : theme === 'dark' ? 'bg-slate-600' : 'bg-slate-200'}`}><File size={18}/></div>
                                      <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate max-w-[160px]">{msg.fileName || 'Fayl'}</p>
                                        <p className={`text-[10px] ${isOwn ? 'text-white/60' : T.textMuted}`}>Yuklab olish</p>
                                      </div>
                                    </a>
                                  ) : (
                                    <>
                                      <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                                      {msg.edited && (<p className={`text-[9px] mt-0.5 ${isOwn ? 'text-white/50' : T.textMuted}`}>✎ tahrirlangan</p>)}
                                    </>
                                  )}
                                </div>
                                {!msg.deleted && (
                                  <div className={`absolute top-1/2 -translate-y-1/2 ${isOwn ? '-left-28' : '-right-28'} opacity-0 group-hover/bubble:opacity-100 transition-all duration-200 flex items-center gap-1`}>
                                    <button onClick={() => { setReplyTo({ id: msg.id, text: msg.text }); msgInputRef.current?.focus(); }}
                                      className={`p-2 rounded-xl transition-all shadow-lg ${theme === 'dark' ? 'bg-slate-700 hover:bg-indigo-600 text-slate-300 hover:text-white' : 'bg-white hover:bg-indigo-600 text-slate-400 hover:text-white'}`}>
                                      <CornerUpLeft size={14}/>
                                    </button>
                                    {isOwn && !msg.fileUrl && (
                                      <button onClick={() => { setEditingMsg({ id: msg.id, text: msg.text }); setMsgInput(msg.text); setReplyTo(null); msgInputRef.current?.focus(); }}
                                        className={`p-2 rounded-xl transition-all shadow-lg ${theme === 'dark' ? 'bg-slate-700 hover:bg-amber-600 text-slate-300 hover:text-white' : 'bg-white hover:bg-amber-500 text-slate-400 hover:text-white'}`}>
                                        <Pencil size={14}/>
                                      </button>
                                    )}
                                    {isOwn && (
                                      <button onClick={() => deleteMessage(msg.id)}
                                        className={`p-2 rounded-xl transition-all shadow-lg ${theme === 'dark' ? 'bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white' : 'bg-white hover:bg-red-500 text-slate-400 hover:text-white'}`}>
                                        <Trash2 size={14}/>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className={`flex items-center gap-1.5 mt-1 px-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                                <span className={`text-[10px] font-bold italic ${T.textMuted}`}>{formatTime(msg.timestamp)}</span>
                                {isOwn && !msg.deleted && (
                                  <span className={`transition-all ${msg.read ? 'text-indigo-400' : T.textMuted}`}>
                                    {msg.read ? <CheckCheck size={14}/> : <Check size={14}/>}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isOwn && <div className="w-2 ml-2"></div>}
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  {typingStudents[selectedStudent.roomId] && (
                    <div className="flex items-end gap-3 mt-4">
                      <div className={`w-8 h-8 ${T.accent} rounded-xl flex items-center justify-center font-black text-white text-xs`}>{selectedStudent.avatar}</div>
                      <div className={`px-5 py-4 rounded-2xl rounded-tl-sm ${T.msgBubbleOther} shadow-sm`}>
                        <div className="flex gap-1.5 items-center">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef}></div>
                </div>

                {editingMsg && (
                  <div className={`flex items-center gap-4 px-6 py-3 border-t ${T.divider} ${theme === 'dark' ? 'bg-amber-900/20' : 'bg-amber-50'}`}>
                    <div className="w-1 h-10 bg-amber-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase italic tracking-widest mb-0.5 text-amber-500">✎ Tahrirlash rejimi</p>
                      <p className={`text-xs truncate italic ${T.textMuted}`}>{editingMsg.text}</p>
                    </div>
                    <button onClick={() => { setEditingMsg(null); setMsgInput(''); }} className={`p-2 rounded-xl hover:bg-red-100 hover:text-red-500 transition-all flex-shrink-0 ${T.textMuted}`}><X size={16}/></button>
                  </div>
                )}

                {replyTo && !editingMsg && (
                  <div className={`flex items-center gap-4 px-6 py-3 border-t ${T.divider} ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                    <div className="w-1 h-10 bg-indigo-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] font-black uppercase italic tracking-widest mb-0.5 ${T.accentText}`}>Javob berilmoqda</p>
                      <p className={`text-xs truncate italic ${T.textMuted}`}>{replyTo.text}</p>
                    </div>
                    <button onClick={() => setReplyTo(null)} className={`p-2 rounded-xl hover:bg-red-100 hover:text-red-500 transition-all flex-shrink-0 ${T.textMuted}`}><X size={16}/></button>
                  </div>
                )}

                <div className={`px-6 py-4 border-t ${T.divider} ${T.card} flex-shrink-0`}>
                  <input ref={fileInputRef} type="file" className="hidden"
                    accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
                    onChange={e => { const file = e.target.files?.[0]; if (file) sendFile(file); e.target.value = ''; }} />
                  <div className={`flex items-end gap-3 p-3 rounded-2xl border-2 transition-all ${editingMsg ? 'border-amber-400' : T.msgInput} focus-within:border-indigo-400`}>
                    <textarea ref={msgInputRef} rows={1} value={msgInput} onChange={handleTyping}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                        if (e.key === 'Escape' && editingMsg) { setEditingMsg(null); setMsgInput(''); }
                      }}
                      placeholder={editingMsg ? "Xabarni tahrirlang... (Esc — bekor)" : "Xabar yozing... (Enter — yuborish, Shift+Enter — qator)"}
                      className={`flex-1 bg-transparent outline-none resize-none font-medium text-sm leading-relaxed max-h-32 ${T.text}`}
                      style={{ minHeight: '24px' }} />
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!editingMsg && (
                        <button onClick={() => fileInputRef.current?.click()}
                          className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} ${T.textMuted}`}>
                          <Paperclip size={18}/>
                        </button>
                      )}
                      <button onClick={sendMessage} disabled={!msgInput.trim()}
                        className={`w-10 h-10 ${editingMsg ? 'bg-amber-500 hover:bg-amber-600' : T.accent} rounded-xl flex items-center justify-center text-white shadow-lg transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:scale-100 disabled:cursor-not-allowed`}>
                        {editingMsg ? <Check size={16}/> : <Send size={16}/>}
                      </button>
                    </div>
                  </div>
                  <p className={`text-center text-[9px] font-bold uppercase italic tracking-widest mt-2 ${T.textMuted}`}>
                    {editingMsg ? 'Enter — Saqlash · Esc — Bekor · ✎ Tahrirlash rejimi' : 'Enter — Yuborish · Shift+Enter — Qator · 📎 Fayl/Rasm'}
                  </p>
                </div>
              </div>
            ) : (
              <div className={`flex-1 flex flex-col items-center justify-center ${T.bg}`}>
                <div className={`w-32 h-32 ${T.card} border rounded-[3rem] flex items-center justify-center mb-8 shadow-sm`}>
                  <MessageCircle className={T.textMuted} size={52}/>
                </div>
                <h3 className={`text-3xl font-black italic uppercase tracking-tighter mb-3 ${T.text}`}>Suhbat tanlang</h3>
                <p className={`text-sm font-medium italic ${T.textMuted}`}>Chap paneldan talabani tanlang</p>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: STREAM ────────────────────────────────────── */}
        {activeTab === 'stream' && (
          // ✅ FIX 4: streams prop o'chirildi — StreamTab o'z ichida fetch qiladi
          <StreamTab T={T} theme={theme} courses={courses} />
        )}

        {/* ── TAB: FINANCE ───────────────────────────────────── */}
        {activeTab === 'finance' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
              <div className={`xl:col-span-2 ${T.card} border p-16 lg:p-24 rounded-[5rem] flex flex-col md:flex-row items-center justify-between gap-16 shadow-sm relative overflow-hidden group`}>
                <div className="relative z-10 text-center md:text-left">
                  <p className={`font-black uppercase italic text-xs mb-8 tracking-[0.4em] ${T.textMuted}`}>Yechib olish mumkin bo'lgan mablag'</p>
                  <h3 className={`text-[6rem] lg:text-[10rem] font-black italic tracking-tighter leading-none mb-12 flex items-baseline gap-4 justify-center md:justify-start ${T.text}`}>
                    {new Intl.NumberFormat('uz-UZ').format(finance.teacher)} <span className={`text-xl font-black uppercase italic ${T.accentText}`}>UZS</span>
                  </h3>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <button className={`${T.accent} text-white px-14 py-7 rounded-[2.5rem] font-black italic uppercase tracking-widest text-xs flex items-center gap-4 shadow-2xl hover:opacity-90 hover:scale-105 active:scale-95 transition-all`}><Wallet size={22}/> <span>Balansni Yechish</span></button>
                    <button className={`${T.card} border-2 px-14 py-7 rounded-[2.5rem] font-black italic uppercase tracking-widest text-xs hover:border-indigo-600 transition-all ${T.text}`}>Tarixni Ko'rish</button>
                  </div>
                </div>
                <div className={`w-80 h-80 ${theme === 'dark' ? 'bg-indigo-900/20' : 'bg-indigo-50'} rounded-[5rem] flex items-center justify-center group-hover:rotate-6 transition-transform duration-700`}>
                  <DollarSign className={`${T.accentText} scale-150 animate-bounce`} size={120}/>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-8">
                <div className="bg-slate-900 p-12 rounded-[4rem] text-white flex flex-col justify-center shadow-2xl">
                  <p className="text-slate-500 font-black uppercase italic text-[10px] mb-6 tracking-[0.3em]">Platforma komissiyasi (30%)</p>
                  <h4 className="text-4xl font-black italic text-red-400">-{new Intl.NumberFormat('uz-UZ').format(finance.platform)} <span className="text-xs italic text-slate-600">UZS</span></h4>
                </div>
                <div className={`${T.card} border p-12 rounded-[4rem] flex flex-col justify-center shadow-sm`}>
                  <p className={`font-black uppercase italic text-[10px] mb-6 tracking-[0.3em] ${T.accentText}`}>Muvaffaqiyatli Bitimlar</p>
                  <h4 className={`text-5xl font-black italic ${T.text}`}>{stats.total_students} <span className={`text-xs font-black italic ${T.textMuted}`}>Sotuvlar soni</span></h4>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: SETTINGS ──────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-3xl">
            <div className={`${T.card} border rounded-[4rem] p-16 shadow-sm`}>
              <div className="flex items-center gap-4 mb-12">
                <div className={`w-14 h-14 ${T.accent} rounded-2xl flex items-center justify-center`}><Monitor className="text-white" size={24}/></div>
                <div>
                  <h4 className={`text-3xl font-black italic uppercase tracking-tighter ${T.text}`}>Interfeys Temasi</h4>
                  <p className={`text-xs font-bold italic mt-1 ${T.textMuted}`}>Dashboard ko'rinishini o'zgartiring</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {Object.entries(THEMES).map(([key, t]) => {
                  const Icon = t.icon;
                  const isActive = theme === key;
                  return (
                    <button key={key} onClick={() => setTheme(key)}
                      className={`relative p-8 rounded-[3rem] border-4 transition-all duration-300 text-left ${isActive ? `border-indigo-500 ${theme === 'dark' ? 'bg-indigo-900/20' : 'bg-indigo-50'} shadow-2xl shadow-indigo-100 scale-[1.02]` : `${T.card} ${T.divider.replace('border-', 'border-')} hover:scale-[1.01] hover:shadow-lg`}`}>
                      <div className={`w-full h-24 rounded-2xl mb-6 overflow-hidden flex gap-2 p-3 ${key === 'dark' ? 'bg-[#1A1D27]' : 'bg-white'} border ${key === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
                        <div className={`w-1/4 h-full rounded-xl ${key === 'dark' ? 'bg-slate-800' : key === 'purple' ? 'bg-purple-50' : key === 'ocean' ? 'bg-cyan-50' : 'bg-slate-50'}`}>
                          <div className={`w-3/4 h-2 rounded-full mx-auto mt-2 ${t.accent}`}></div>
                          <div className="w-2/3 h-1.5 rounded-full mx-auto mt-1.5 bg-slate-200"></div>
                          <div className="w-2/3 h-1.5 rounded-full mx-auto mt-1.5 bg-slate-200"></div>
                        </div>
                        <div className="flex-1 flex flex-col gap-1.5">
                          <div className={`w-1/2 h-3 rounded-full ${t.accent}`}></div>
                          <div className={`w-full h-8 rounded-xl ${key === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`}></div>
                          <div className="flex gap-1">{[1,2,3].map(x => (<div key={x} className={`flex-1 h-5 rounded-lg ${key === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`}></div>))}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className={isActive ? T.accentText : T.textMuted} size={20}/>
                          <span className={`font-black italic uppercase tracking-widest text-sm ${isActive ? T.text : T.textMuted}`}>{t.name}</span>
                        </div>
                        {isActive && (<div className={`w-7 h-7 ${T.accent} rounded-full flex items-center justify-center`}><CheckCircle className="text-white" size={14}/></div>)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className={`${T.card} border rounded-[3rem] p-10 flex items-center gap-6 shadow-sm`}>
              <div className={`w-14 h-14 ${T.accent} rounded-2xl flex items-center justify-center`}><CheckCircle className="text-white" size={22}/></div>
              <div>
                <p className={`text-[10px] font-black uppercase italic tracking-widest mb-1 ${T.textMuted}`}>Hozirgi Tema</p>
                <p className={`text-2xl font-black italic uppercase tracking-tighter ${T.text}`}>{THEMES[theme].name} Rejimi</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── MODAL SYSTEM ─────────────────────────────────────── */}
      {modalType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12 bg-slate-900/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className={`${T.card} border w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-[5rem] p-16 lg:p-24 relative shadow-[0_50px_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-700`} style={{ scrollbarWidth: 'none' }}>
            <button onClick={() => { setModalType(null); setEditingItem(null); }}
              className={`absolute top-12 right-12 p-6 ${theme === 'dark' ? 'bg-slate-800 hover:bg-red-900/30' : 'bg-slate-50 hover:bg-red-50'} hover:text-red-500 rounded-full transition-all group ${T.text}`}>
              <X size={32} className="group-hover:rotate-90 transition-transform duration-500"/>
            </button>
            <div className="mb-20">
              <div className="flex items-center gap-3 mb-4">
                <span className={`w-10 h-1 ${T.accent} rounded-full`}></span>
                <p className={`font-black uppercase italic tracking-[0.4em] text-[10px] ${T.accentText}`}>Tizimga Kiritish</p>
              </div>
              <h2 className={`text-6xl font-black italic uppercase tracking-tighter leading-none ${T.text}`}>
                {editingItem ? 'Tahrirlash' : 'Yaratish'} <br/>
                <span className={T.textMuted}>/ {modalType === 'blog' ? 'Blog Post' : 'Video Kurs'}</span>
              </h2>
            </div>
            {modalType === 'course' ? (
              <form onSubmit={handleCourseAction} className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="space-y-10">
                  <div>
                    <label className={`text-[10px] font-black uppercase italic ml-6 mb-4 block tracking-widest ${T.textMuted}`}>Kurs Sarlavhasi</label>
                    <input type="text" value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} className={`w-full p-8 border-2 rounded-[2.5rem] outline-none font-black italic uppercase text-lg transition-all ${T.input} ${T.text}`} placeholder="Masalan: Python Masterclass" required />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className={`text-[10px] font-black uppercase italic ml-6 mb-4 block tracking-widest ${T.textMuted}`}>Kategoriya</label>
                      <select required value={courseForm.category} onChange={e => setCourseForm({...courseForm, category: e.target.value})} className={`w-full p-8 border-2 rounded-[2.5rem] outline-none font-black italic uppercase text-xs appearance-none transition-all ${T.input} ${T.text}`}>
                        <option value="">Tanlang</option>
                        {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className={`text-[10px] font-black uppercase italic ml-6 mb-4 block tracking-widest ${T.textMuted}`}>Daraja</label>
                      <select value={courseForm.level} onChange={e => setCourseForm({...courseForm, level: e.target.value})} className={`w-full p-8 border-2 rounded-[2.5rem] outline-none font-black italic uppercase text-xs appearance-none transition-all ${T.input} ${T.text}`}>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className={`text-[10px] font-black uppercase italic ml-6 mb-4 block tracking-widest ${T.textMuted}`}>Narx (UZS)</label>
                      <input type="number" value={courseForm.price} onChange={e => setCourseForm({...courseForm, price: e.target.value})} className={`w-full p-8 rounded-[2.5rem] outline-none font-black italic text-lg border-2 ${T.input} ${T.text}`} required />
                    </div>
                    <div>
                      <label className={`text-[10px] font-black uppercase italic ml-6 mb-4 block tracking-widest ${T.textMuted}`}>Chegirma Narxi</label>
                      <input type="number" value={courseForm.discount_price} onChange={e => setCourseForm({...courseForm, discount_price: e.target.value})} className={`w-full p-8 rounded-[2.5rem] outline-none font-black italic text-lg border-2 ${T.input} ${T.text}`} />
                    </div>
                  </div>
                </div>
                <div className="space-y-10">
                  <div>
                    <label className={`text-[10px] font-black uppercase italic ml-6 mb-4 block tracking-widest ${T.textMuted}`}>Qisqa Ta'rif</label>
                    <textarea rows="3" value={courseForm.short_description} onChange={e => setCourseForm({...courseForm, short_description: e.target.value})} className={`w-full p-8 rounded-[2.5rem] outline-none font-bold italic text-sm transition-all border-2 ${T.input} ${T.text}`} required />
                  </div>
                  <div>
                    <label className={`text-[10px] font-black uppercase italic ml-6 mb-4 block tracking-widest ${T.textMuted}`}>Muqova Rasmi</label>
                    <div className={`relative h-64 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'} rounded-[3rem] border-4 border-dashed flex flex-col items-center justify-center overflow-hidden`}>
                      {courseForm.thumbnail ? (
                        <img src={courseForm.thumbnail instanceof globalThis.File ? URL.createObjectURL(courseForm.thumbnail) : courseForm.thumbnail} className="w-full h-full object-cover" alt="" />
                      ) : (<><ImageIcon className={`mb-4 ${T.textMuted}`} size={48}/><p className={`text-[10px] font-black uppercase italic ${T.textMuted}`}>Rasm yuklash (PNG, JPG)</p></>)}
                      <input type="file" accept="image/*" onChange={e => setCourseForm({...courseForm, thumbnail: e.target.files[0]})} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                  <button type="submit" disabled={isSubmitting} className={`w-full ${T.accent} text-white p-10 rounded-[3rem] font-black italic uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:opacity-90 transition-all shadow-2xl disabled:opacity-50`}>
                    {isSubmitting ? <Loader2 className="animate-spin"/> : <CheckCircle/>} <span>{editingItem ? "O'zgarishlarni Saqlash" : "Kursni Nashr Etish"}</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleBlogAction} className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="space-y-10">
                  <div>
                    <label className={`text-[10px] font-black uppercase italic ml-6 mb-4 block tracking-widest ${T.textMuted}`}>Maqola Sarlavhasi</label>
                    <input type="text" value={blogForm.title} onChange={e => setBlogForm({...blogForm, title: e.target.value})} className={`w-full p-8 rounded-[2.5rem] outline-none font-black italic uppercase text-xl border-2 ${T.input} ${T.text}`} required />
                  </div>
                  <div>
                    <label className={`text-[10px] font-black uppercase italic ml-6 mb-4 block tracking-widest ${T.textMuted}`}>Maqola Matni</label>
                    <textarea rows="12" value={blogForm.content} onChange={e => setBlogForm({...blogForm, content: e.target.value})} className={`w-full p-8 rounded-[3rem] outline-none font-bold italic text-sm leading-relaxed border-2 ${T.input} ${T.text}`} required />
                  </div>
                </div>
                <div className="space-y-10">
                  <div>
                    <label className={`text-[10px] font-black uppercase italic ml-6 mb-4 block tracking-widest ${T.textMuted}`}>Asosiy Rasm</label>
                    <div className={`relative h-80 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'} rounded-[3.5rem] border-4 border-dashed flex flex-col items-center justify-center overflow-hidden`}>
                      {blogForm.featured_image ? (
                        <img src={blogForm.featured_image instanceof File ? URL.createObjectURL(blogForm.featured_image) : blogForm.featured_image} className="w-full h-full object-cover" alt="" />
                      ) : (<><Camera className={`mb-4 ${T.textMuted}`} size={56}/><p className={`text-[10px] font-black uppercase italic ${T.textMuted}`}>Rasm tanlang</p></>)}
                      <input type="file" accept="image/*" onChange={e => setBlogForm({...blogForm, featured_image: e.target.files[0]})} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                  <button type="submit" disabled={isSubmitting} className={`w-full ${T.accent} text-white p-10 rounded-[3rem] font-black italic uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:opacity-90 transition-all shadow-2xl disabled:opacity-50`}>
                    {isSubmitting ? <Loader2 className="animate-spin"/> : <Save/>} <span>{editingItem ? "Maqolani Yangilash" : "Blogni Chop Etish"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}