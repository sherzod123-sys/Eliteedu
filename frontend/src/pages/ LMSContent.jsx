// import React, {
//     useState, useEffect, useRef, useCallback, useMemo, useContext
//   } from 'react';
//   import { useNavigate } from 'react-router-dom';
//   import { Toaster } from 'react-hot-toast';
//   import toast from 'react-hot-toast';
//   import {
//     BookOpen, Trophy, Moon, Sun, LogOut, LayoutDashboard,
//     Settings, Zap, Layers, Award, PlayCircle, FileText,
//     CheckCircle2, X, Upload, Star, Medal, Crown, ChevronRight,
//     ArrowLeft, Video, AlertTriangle, Keyboard, Flame, RotateCcw,
//     Users, Send, Check, XCircle, MessageCircle, Radio, Bell,
//     Eye, TrendingUp, BookMarked, Target, Gauge, Lock, Clock,
//     BarChart3, Gift, Hash, Globe, Wifi, Activity, Sparkles,
//     PenLine, ThumbsUp, UserCheck, Bookmark, ChevronDown,
//     ChevronUp, Download, Share2, Filter
//   } from 'lucide-react';
//   import { ThemeContext } from '../context/ThemeContext';
//   import {
//     PremiumLoader, SidebarItem, StatCard, EmptyState,
//     Badge, ProgressBar, Avatar, Tooltip, Spinner
//   } from './UI';
//   import ChatPanel from './ChatPanel';
//   import StreamViewerPanel from './StreamViewerPanel';
//   import api, { getAvatarSrc, fixAvatarUrl, WS_HOST } from '../utils/api';
  
//   // ─── MOCK TYPING TEXTS ────────────────────────────────────
//   const MOCK_TEXTS = {
//     uz: {
//       easy:   "Dasturlash dunyosi juda keng va qiziqarli. Har kun yangi narsalarni o'rganish mumkin.",
//       medium: "O'zbekiston Markaziy Osiyoning yurak qismida joylashgan. Mamlakatimiz o'ziga xos tabiati, boy tarixi va go'zal madaniyati bilan mashhur.",
//       hard:   "Sun'iy intellekt texnologiyalari tez rivojlanmoqda. Mashina o'rganishi, tabiiy tilni qayta ishlash va kompyuter ko'rish kabi sohalarda katta yutuqlarga erishilmoqda. Bu texnologiyalar zamonaviy hayotimizni tubdan o'zgartirib bormoqda.",
//     },
//     en: {
//       easy:   "Programming is the process of creating instructions for computers to follow.",
//       medium: "The quick brown fox jumps over the lazy dog. Typing practice helps improve speed and accuracy significantly over time.",
//       hard:   "Artificial intelligence is transforming industries at an unprecedented pace. Machine learning algorithms can now recognize complex patterns with incredible accuracy, enabling applications that were once considered impossible.",
//     },
//     ru: {
//       easy:   "Программирование это процесс создания программ для компьютера.",
//       medium: "Съешь ещё этих мягких французских булок, да выпей же чаю. Практика печати помогает улучшить скорость.",
//       hard:   "Искусственный интеллект кардинально меняет все отрасли промышленности. Алгоритмы машинного обучения могут распознавать сложные закономерности с невероятной точностью.",
//     },
//   };
  
//   // ─── NOTIFICATION BELL ────────────────────────────────────
//   function NotificationBell({ streamNotifs, unreadCount, onClear, onNavigate }) {
//     const [open, setOpen] = useState(false);
  
//     useEffect(() => {
//       if (!open) return;
//       const close = () => setOpen(false);
//       setTimeout(() => window.addEventListener('click', close), 0);
//       return () => window.removeEventListener('click', close);
//     }, [open]);
  
//     return (
//       <div className="relative" onClick={e => e.stopPropagation()}>
//         <Tooltip text="Bildirishnomalar">
//           <button
//             onClick={() => setOpen(p => !p)}
//             className="relative p-2.5 rounded-2xl bg-slate-800 border border-slate-700 hover:border-slate-600 transition"
//           >
//             <Bell size={18} className={unreadCount > 0 ? 'text-rose-400' : 'text-slate-400'} />
//             {unreadCount > 0 && (
//               <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[9px] rounded-full flex items-center justify-center font-black px-1">
//                 {unreadCount > 9 ? '9+' : unreadCount}
//               </span>
//             )}
//           </button>
//         </Tooltip>
//         {open && (
//           <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50"
//             onClick={e => e.stopPropagation()}>
//             <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
//               <h4 className="font-bold text-sm text-white">Bildirishnomalar</h4>
//               <button onClick={onClear} className="text-xs text-slate-400 hover:text-rose-400 transition font-medium">Tozalash</button>
//             </div>
//             <div className="max-h-72 overflow-y-auto">
//               {streamNotifs.length === 0 ? (
//                 <div className="py-10 text-center text-slate-500">
//                   <Bell size={28} className="mx-auto mb-2 opacity-20" />
//                   <p className="text-sm">Bildirishnoma yo'q</p>
//                 </div>
//               ) : streamNotifs.map(n => (
//                 <button key={n.id} onClick={() => { onNavigate(); setOpen(false); }}
//                   className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-800/50 transition text-left border-b border-slate-800/50 last:border-0">
//                   <div className="w-8 h-8 bg-rose-600 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
//                     <Radio size={14} className="text-white" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-[11px] font-bold text-rose-400">🔴 Jonli Efir</p>
//                     <p className="text-sm font-semibold text-white truncate">{n.title}</p>
//                     <p className="text-xs text-slate-400">{n.teacher}{n.course ? ` · ${n.course}` : ''}</p>
//                   </div>
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   }
  
//   // ─── SETTINGS PAGE ────────────────────────────────────────
//   function SettingsPage({ currentUser, isDarkMode, toggleTheme, accentColor, setAccentColor, fontSize, setFontSize }) {
//     const ACCENTS = [
//       { id: 'blue',   label: 'Indigo',  cls: 'bg-indigo-500' },
//       { id: 'purple', label: 'Violet',  cls: 'bg-violet-500' },
//       { id: 'green',  label: 'Emerald', cls: 'bg-emerald-500' },
//       { id: 'orange', label: 'Amber',   cls: 'bg-amber-500' },
//       { id: 'red',    label: 'Rose',    cls: 'bg-rose-500' },
//     ];
//     return (
//       <div className="space-y-6 max-w-2xl">
//         <div>
//           <h2 className="text-3xl font-black text-white mb-1">Sozlamalar</h2>
//           <p className="text-slate-400 text-sm">Ilovani sozlang</p>
//         </div>
  
//         {/* Profile card */}
//         <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
//           <div className="bg-gradient-to-br from-indigo-900/50 to-violet-900/50 p-6 flex items-center gap-5">
//             <Avatar src={getAvatarSrc(currentUser.avatar, currentUser.full_name)} name={currentUser.full_name} size="xl" />
//             <div>
//               <h3 className="text-2xl font-black text-white">{currentUser.full_name}</h3>
//               <p className="text-indigo-400 text-sm mt-0.5">ID: #{currentUser.id}</p>
//               <div className="flex items-center gap-2 mt-2">
//                 <Badge variant="blue">⭐ {currentUser.points} ball</Badge>
//               </div>
//             </div>
//           </div>
//           <div className="p-5 space-y-3">
//             {[
//               ['ID',     currentUser.id],
//               ['Ism',    currentUser.full_name],
//               ['Telefon',currentUser.phone || '—'],
//               ['Email',  currentUser.email || '—'],
//             ].map(([l, v]) => (
//               <div key={l} className="flex items-center justify-between py-2.5 border-b border-slate-800 last:border-0">
//                 <span className="text-slate-400 text-sm font-medium">{l}</span>
//                 <span className="text-white font-semibold text-sm">{v}</span>
//               </div>
//             ))}
//           </div>
//         </div>
  
//         {/* Appearance */}
//         <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
//           <h3 className="font-bold text-white text-base mb-5 flex items-center gap-2"><Sparkles size={16} className="text-indigo-400" /> Ko'rinish</h3>
//           <div className="space-y-5">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="font-semibold text-white text-sm">Mavzu</p>
//                 <p className="text-xs text-slate-400 mt-0.5">{isDarkMode ? 'Qorong\'u rejim' : 'Yorug\' rejim'}</p>
//               </div>
//               <button
//                 onClick={toggleTheme}
//                 className={`relative w-12 h-6 rounded-full transition-all ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-600'}`}
//               >
//                 <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${isDarkMode ? 'left-6' : 'left-0.5'}`} />
//               </button>
//             </div>
//             <div>
//               <p className="font-semibold text-white text-sm mb-3">Matn o'lchami</p>
//               <div className="flex gap-2">
//                 {[['small','Kichik'],['normal','Normal'],['large','Katta']].map(([v, l]) => (
//                   <button key={v} onClick={() => setFontSize(v)}
//                     className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${fontSize === v ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
//                     {l}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
  
//         {/* Security */}
//         <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
//           <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2"><Lock size={16} className="text-indigo-400" /> Xavfsizlik</h3>
//           <div className="space-y-3">
//             <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl">
//               <div className="flex items-center gap-3">
//                 <div className="w-9 h-9 bg-emerald-500/20 rounded-xl flex items-center justify-center">
//                   <CheckCircle2 size={16} className="text-emerald-400" />
//                 </div>
//                 <div>
//                   <p className="font-semibold text-white text-sm">Ikki bosqichli tasdiqlash</p>
//                   <p className="text-xs text-slate-400">Hisobingizni himoya qiling</p>
//                 </div>
//               </div>
//               <Badge variant="green">Faol</Badge>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }
  
//   // ─── TYPING TEST ──────────────────────────────────────────
//   function TypingPage({
//     currentUser, arenaLeaderboard, generalLeaderboard, activeLeaderboardTab, setActiveLeaderboardTab,
//     userTypingStats, incomingRequests, respondToArenaRequest,
//     onlineUsers, selectedOpponent, setSelectedOpponent,
//     sendArenaRequest, selectedTestDuration, setSelectedTestDuration,
//     selectedLanguage, setSelectedLanguage, selectedDifficulty, setSelectedDifficulty,
//     startTypingTest, showTestSettings, setShowTestSettings, showArenaSetup, setShowArenaSetup,
//     fetchOnlineUsers, isTypingMode,
//   }) {
//     return (
//       <div className="space-y-6">
//         {/* Hero */}
//         <div className="relative bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 p-10 rounded-3xl text-white overflow-hidden">
//           <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, violet 0%, transparent 50%), radial-gradient(circle at 70% 20%, indigo 0%, transparent 50%)' }} />
//           <Keyboard className="absolute -right-8 -bottom-8 w-64 h-64 text-white/5" />
//           <div className="relative z-10">
//             <div className="flex items-center gap-2 mb-3">
//               <Badge variant="purple">⚡ Arena Mode</Badge>
//             </div>
//             <h1 className="text-5xl font-black mb-3">Typing Arena</h1>
//             <p className="text-white/60 mb-6">Klaviatura tezligingizni sinab ko'ring va eng yuqoriga chiqing!</p>
//             {userTypingStats && (
//               <div className="grid grid-cols-3 gap-3 max-w-md">
//                 {[["O'rtacha WPM", Math.round(userTypingStats.avg_wpm || 0), '⚡'],
//                   ['Rekord',       Math.round(userTypingStats.best_wpm || 0), '🏆'],
//                   ['Jami test',    userTypingStats.total_tests || 0,          '📊']
//                 ].map(([l, v, icon]) => (
//                   <div key={l} className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
//                     <p className="text-white/60 text-xs mb-1">{icon} {l}</p>
//                     <p className="text-3xl font-black">{v}</p>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
  
//         {/* Action buttons */}
//         <div className="grid grid-cols-2 gap-4">
//           <button onClick={() => setShowTestSettings(true)}
//             className="flex flex-col items-start p-6 bg-slate-900 border border-slate-800 rounded-3xl hover:border-indigo-500/50 group transition">
//             <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-500/30 transition">
//               <PlayCircle size={24} className="text-indigo-400" />
//             </div>
//             <h3 className="font-black text-white text-lg">Oddiy Test</h3>
//             <p className="text-slate-400 text-sm mt-1">Yolg'iz mashq qilish</p>
//           </button>
//           <button onClick={() => { setShowArenaSetup(true); fetchOnlineUsers(); }}
//             className="flex flex-col items-start p-6 bg-slate-900 border border-slate-800 rounded-3xl hover:border-rose-500/50 group transition">
//             <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-rose-500/30 transition">
//               <Flame size={24} className="text-rose-400" />
//             </div>
//             <h3 className="font-black text-white text-lg">Arena 1v1</h3>
//             <p className="text-slate-400 text-sm mt-1">Raqib bilan bellashing</p>
//           </button>
//         </div>
  
//         {/* Leaderboard */}
//         <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
//           <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
//             <div className="flex bg-slate-800 p-1 rounded-xl gap-1">
//               {[['arena', '🔥 Arena'], ['general', '📊 Umumiy']].map(([tab, label]) => (
//                 <button key={tab} onClick={() => setActiveLeaderboardTab(tab)}
//                   className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeLeaderboardTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
//                   {label}
//                 </button>
//               ))}
//             </div>
//           </div>
//           <div className="p-4 space-y-2">
//             {(activeLeaderboardTab === 'arena' ? arenaLeaderboard : generalLeaderboard).length > 0
//               ? (activeLeaderboardTab === 'arena' ? arenaLeaderboard : generalLeaderboard).slice(0, 10).map((u, i) => (
//                 <div key={u.id || i}
//                   className={`flex items-center gap-4 p-4 rounded-2xl border transition ${
//                     i === 0 ? 'border-amber-500/30 bg-amber-500/5'
//                     : i === 1 ? 'border-slate-400/30 bg-slate-400/5'
//                     : i === 2 ? 'border-orange-500/30 bg-orange-500/5'
//                     : 'border-slate-800 hover:bg-slate-800/50'
//                   } ${u.id === currentUser.id ? 'ring-1 ring-indigo-500' : ''}`}>
//                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
//                     i === 0 ? 'bg-amber-500 text-white' : i === 1 ? 'bg-slate-400 text-white' : i === 2 ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'
//                   }`}>
//                     {i === 0 ? <Crown size={18} /> : i === 1 ? <Medal size={18} /> : i === 2 ? <Star size={18} /> : i + 1}
//                   </div>
//                   <Avatar src={getAvatarSrc(null, u.full_name || u.username)} name={u.full_name || u.username} size="sm" />
//                   <div className="flex-1 min-w-0">
//                     <p className="font-bold text-white text-sm truncate">
//                       {u.full_name || u.username}
//                       {u.id === currentUser.id && <span className="ml-2 text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full">Siz</span>}
//                     </p>
//                     <p className="text-xs text-slate-400">{activeLeaderboardTab === 'arena' ? `${u.total_arena_tests || 0} arena` : `${u.total_tests || 0} test`}</p>
//                   </div>
//                   <div className="text-right">
//                     <p className={`text-xl font-black ${activeLeaderboardTab === 'arena' ? 'text-rose-400' : 'text-indigo-400'}`}>
//                       {activeLeaderboardTab === 'arena' ? (u.best_wpm || 0) : Number(u.avg_wpm || 0).toFixed(1)} WPM
//                     </p>
//                     <p className="text-[10px] text-slate-500">{Number((activeLeaderboardTab === 'arena' ? u.best_accuracy : u.avg_accuracy) || 0).toFixed(1)}% aniq</p>
//                   </div>
//                 </div>
//               ))
//               : <EmptyState message={activeLeaderboardTab === 'arena' ? "Arena reytingi bo'sh" : "Umumiy reyting bo'sh"} />
//             }
//           </div>
//         </div>
//       </div>
//     );
//   }
  
//   // ═══════════════════════════════════════════════════════════
//   //  MAIN COMPONENT
//   // ═══════════════════════════════════════════════════════════
//   export default function LMSContent() {
//     const navigate = useNavigate();
//     const { isDarkMode, toggleTheme, accentColor, setAccentColor, fontSize, setFontSize } = useContext(ThemeContext);
//     const typingInputRef = useRef(null);
  
//     const [loading,          setLoading]          = useState(true);
//     const [activeTab,        setActiveTab]         = useState('overview');
//     const [isSidebarOpen,    setSidebarOpen]       = useState(true);
//     const [unreadChatCount,  setUnreadChatCount]   = useState(0);
//     const [streamNotifs,     setStreamNotifs]      = useState([]);
//     const [unreadStreamCount,setUnreadStreamCount] = useState(0);
//     const notifWsRef = useRef(null);
  
//     const [courses,        setCourses]        = useState([]);
//     const [modules,        setModules]        = useState([]);
//     const [leaderboard,    setLeaderboard]    = useState([]);
//     const [dashboardStats, setDashboardStats] = useState({ total_courses: 0, total_lessons: 0, completed_lessons: 0, overall_progress: 0 });
//     const [recentActivity, setRecentActivity] = useState([]);
  
//     // Module/lesson state
//     const [selectedModule,    setSelectedModule]    = useState(null);
//     const [moduleSection,     setModuleSection]     = useState(null);
//     const [moduleLessons,     setModuleLessons]     = useState([]);
//     const [moduleTests,       setModuleTests]       = useState([]);
//     const [moduleAssignments, setModuleAssignments] = useState([]);
//     const [selectedLesson,    setSelectedLesson]    = useState(null);
//     const [selectedQuiz,      setSelectedQuiz]      = useState(null);
//     const [quizAnswers,       setQuizAnswers]       = useState({});
//     const [selectedTask,      setSelectedTask]      = useState(null);
//     const [taskFile,          setTaskFile]          = useState(null);
//     const [isCompletingLesson,setIsCompletingLesson]= useState(false);
//     const [isSubmittingQuiz,  setIsSubmittingQuiz]  = useState(false);
//     const [isSubmittingTask,  setIsSubmittingTask]  = useState(false);
  
//     // Typing state
//     const [arenaLeaderboard,     setArenaLeaderboard]     = useState([]);
//     const [generalLeaderboard,   setGeneralLeaderboard]   = useState([]);
//     const [userTypingStats,      setUserTypingStats]       = useState(null);
//     const [selectedLanguage,     setSelectedLanguage]      = useState('uz');
//     const [selectedDifficulty,   setSelectedDifficulty]    = useState('medium');
//     const [selectedTestDuration, setSelectedTestDuration]  = useState(60);
//     const [isTypingMode,         setIsTypingMode]          = useState(false);
//     const [currentTest,          setCurrentTest]           = useState(null);
//     const [userInput,            setUserInput]             = useState('');
//     const [currentWordIndex,     setCurrentWordIndex]      = useState(0);
//     const [errors,               setErrors]                = useState(0);
//     const [startTime,            setStartTime]             = useState(null);
//     const [isTestFinished,       setIsTestFinished]        = useState(false);
//     const [typingResult,         setTypingResult]          = useState(null);
//     const [isArenaMode,          setIsArenaMode]           = useState(false);
//     const [activeLeaderboardTab, setActiveLeaderboardTab]  = useState('arena');
//     const [elapsedTime,          setElapsedTime]           = useState(0);
//     const [wpm,                  setWpm]                   = useState(0);
//     const [timeLimit,            setTimeLimit]             = useState(null);
//     const [showTestSettings,     setShowTestSettings]      = useState(false);
//     const [showArenaSetup,       setShowArenaSetup]        = useState(false);
//     const [onlineUsers,          setOnlineUsers]           = useState([]);
//     const [selectedOpponent,     setSelectedOpponent]      = useState(null);
//     const [arenaSession,         setArenaSession]          = useState(null);
//     const [incomingRequests,     setIncomingRequests]      = useState([]);
  
//     // Courses filter/search
//     const [courseSearch,     setCourseSearch]     = useState('');
//     const [courseFilter,     setCourseFilter]     = useState('all'); // 'all'|'inprogress'|'completed'
//     const [moduleSearch,     setModuleSearch]     = useState('');
//     const [expandedCourseId, setExpandedCourseId] = useState(null);
  
//     const currentUser = useMemo(() => {
//       try {
//         const s = JSON.parse(localStorage.getItem('user') || '{}');
//         return {
//           id:        s.id        || 0,
//           full_name: s.full_name || s.username || 'Foydalanuvchi',
//           avatar:    fixAvatarUrl(s.avatar || null),
//           phone:     s.phone     || '',
//           email:     s.email     || '',
//           points:    s.points    || 0,
//         };
//       } catch { return { id: 0, full_name: 'Foydalanuvchi', avatar: null, phone: '', email: '', points: 0 }; }
//     }, []);
  
//     // Notification WS
//     useEffect(() => {
//       if (Notification.permission === 'default') Notification.requestPermission();
//       const token = localStorage.getItem('access_token') || '';
//       const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
//       const ws    = new WebSocket(`${proto}://${WS_HOST}/ws/notifications/?token=${token}`);
//       notifWsRef.current = ws;
//       ws.onmessage = (e) => {
//         try {
//           const data = JSON.parse(e.data);
//           if (data.type === 'unread_count') setUnreadStreamCount(data.count);
//           if (data.type === 'stream_live') {
//             if (Notification.permission === 'granted') {
//               new Notification('🔴 Jonli efir boshlandi!', { body: `${data.teacher}: ${data.title}`, icon: '/favicon.ico' });
//             }
//             toast.custom((t) => (
//               <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm bg-slate-900 border-2 border-rose-600 p-4 rounded-2xl flex gap-3 shadow-2xl`}>
//                 <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center shrink-0">
//                   <Radio size={18} className="text-white" />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="font-black text-rose-400 text-xs">🔴 Jonli Efir!</p>
//                   <p className="font-bold text-white text-sm truncate">{data.title}</p>
//                   <p className="text-slate-400 text-xs">{data.teacher}</p>
//                   <button onClick={() => { setActiveTab('stream'); toast.dismiss(t.id); }}
//                     className="mt-2 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition">
//                     Ko'rish →
//                   </button>
//                 </div>
//                 <button onClick={() => toast.dismiss(t.id)} className="text-slate-500 hover:text-white"><X size={14} /></button>
//               </div>
//             ), { duration: 8000 });
//             setStreamNotifs(prev => [{ id: Date.now(), ...data, time: new Date().toISOString() }, ...prev.slice(0, 19)]);
//             setUnreadStreamCount(p => p + 1);
//           }
//         } catch {}
//       };
//       return () => ws.close();
//     }, []);
  
//     // Unread chat
//     useEffect(() => {
//       const load = () => api.get('/chat/unread/').then(r => setUnreadChatCount(r.data?.unread_count || 0)).catch(() => {});
//       load();
//       const iv = setInterval(load, 30000);
//       return () => clearInterval(iv);
//     }, []);
  
//     useEffect(() => { if (activeTab === 'chat')   setUnreadChatCount(0); },   [activeTab]);
//     useEffect(() => { if (activeTab === 'stream') setUnreadStreamCount(0); }, [activeTab]);
  
//     const fetchDashboardData = useCallback(async () => {
//       setLoading(true);
//       try {
//         const [dashRes, coursesRes, lbRes] = await Promise.allSettled([
//           api.get('/courses/dashboard/'),
//           api.get('/courses/'),
//           api.get('/users/leaderboard/'),
//         ]);
//         if (dashRes.status === 'fulfilled') {
//           const d = dashRes.value?.data || {};
//           if (d.stats) setDashboardStats({
//             total_courses:     d.stats.total_courses     || 0,
//             total_lessons:     d.stats.total_lessons     || 0,
//             completed_lessons: d.stats.completed_lessons || 0,
//             overall_progress:  d.stats.overall_progress  || 0,
//           });
//           if (d.recent_activity) setRecentActivity(d.recent_activity);
//           if (d.courses) setCourses(d.courses);
//         }
//         if (coursesRes.status === 'fulfilled') {
//           const d    = coursesRes.value?.data || {};
//           const list = Array.isArray(d) ? d : (d.results || []);
//           setCourses(prev => prev.length === 0 ? list : prev);
//           const allMods = [];
//           list.forEach(course => {
//             (course?.modules || []).forEach(mod => {
//               if (!mod) return;
//               const lessons = mod.lessons || [];
//               allMods.push({
//                 id: mod.id || Date.now() + Math.random(),
//                 title: mod.title || 'Modul',
//                 description: mod.description || '',
//                 order: mod.order || 0,
//                 course_id: course.id || 0,
//                 course_name: course.title || 'Kurs',
//                 course_thumbnail: course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
//                 lessons,
//                 lessons_count: lessons.length,
//                 duration_minutes: mod.duration_minutes || 0,
//                 is_completed: mod.is_completed || false,
//               });
//             });
//           });
//           setModules(allMods);
//         }
//         if (lbRes.status === 'fulfilled') setLeaderboard(lbRes.value?.data?.results || []);
//       } catch { toast.error("Ma'lumotlarni yuklashda xatolik"); }
//       finally { setTimeout(() => setLoading(false), 400); }
//     }, []);
  
//     useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);
  
//     // Typing timer
//     const finishTestRef = useRef(null);
  
//     const submitTypingResult = useCallback(async (wpmVal, accuracy, timeTaken, errCount) => {
//       if (!currentTest?.id) return;
//       try {
//         const r = await api.post('/typing/results/', {
//           test: currentTest.id, wpm: Math.round(wpmVal),
//           accuracy: Math.round(accuracy * 10) / 10,
//           time_taken: Math.round(timeTaken), errors: errCount,
//           is_arena: isArenaMode, session_id: arenaSession?.id || null,
//         });
//         setTypingResult(r.data || null);
//         toast.success(`✅ ${Math.round(wpmVal)} WPM — Saqlandi!`);
//       } catch { toast.error('Natijani saqlashda xatolik'); }
//     }, [currentTest, isArenaMode, arenaSession]);
  
//     const finishTest = useCallback(() => {
//       if (!startTime || !currentTest?.text || isTestFinished) return;
//       const timeTaken = (Date.now() - startTime) / 1000;
//       const wpmVal    = (currentTest.text.split(' ').length / timeTaken) * 60;
//       const accuracy  = Math.max(0, ((currentTest.text.length - errors) / currentTest.text.length) * 100);
//       setIsTestFinished(true);
//       submitTypingResult(wpmVal, accuracy, timeTaken, errors);
//     }, [startTime, currentTest, isTestFinished, errors, submitTypingResult]);
  
//     finishTestRef.current = finishTest;
  
//     useEffect(() => {
//       if (!startTime || isTestFinished || !isTypingMode) return;
//       const t = setInterval(() => {
//         const elapsed = (Date.now() - startTime) / 1000;
//         setElapsedTime(elapsed);
//         const words = userInput.trim().split(/\s+/).filter(Boolean).length;
//         setWpm(words > 0 ? (words / elapsed) * 60 : 0);
//         if (timeLimit && elapsed >= timeLimit) { clearInterval(t); finishTestRef.current?.(); }
//       }, 100);
//       return () => clearInterval(t);
//     }, [startTime, isTestFinished, isTypingMode, userInput, timeLimit]);
  
//     const fetchArenaLeaderboard   = useCallback(async () => { try { const r = await api.get('/typing/leaderboard/arena/');   setArenaLeaderboard(r.data?.results   || []); } catch { setArenaLeaderboard([]); } }, []);
//     const fetchGeneralLeaderboard = useCallback(async () => { try { const r = await api.get('/typing/leaderboard/general/'); setGeneralLeaderboard(r.data?.results || []); } catch { setGeneralLeaderboard([]); } }, []);
//     const fetchUserTypingStats    = useCallback(async () => { try { const r = await api.get('/typing/results/my_stats/');    setUserTypingStats(r.data?.stats || null); }    catch { setUserTypingStats(null); } }, []);
//     const fetchOnlineUsers        = useCallback(async () => { try { const r = await api.get('/typing/online-users/');        setOnlineUsers((r.data?.users || []).filter(u => u.id !== currentUser.id)); } catch { setOnlineUsers([]); } }, [currentUser.id]);
  
//     useEffect(() => {
//       if (activeTab === 'typing') { fetchArenaLeaderboard(); fetchGeneralLeaderboard(); fetchUserTypingStats(); }
//     }, [activeTab, fetchArenaLeaderboard, fetchGeneralLeaderboard, fetchUserTypingStats]);
  
//     useEffect(() => {
//       if (activeTab !== 'typing') return;
//       const iv = setInterval(async () => {
//         try { const r = await api.get('/typing/arena/incoming-requests/'); setIncomingRequests(r.data?.requests || []); } catch {}
//       }, 3000);
//       return () => clearInterval(iv);
//     }, [activeTab]);
  
//     const sendArenaRequest = async (opponentId) => {
//       try {
//         await api.post('/typing/arena/request/', { opponent_id: opponentId, duration: selectedTestDuration, language: selectedLanguage, difficulty: selectedDifficulty });
//         toast.success("So'rov yuborildi!");
//       } catch { toast.error("So'rov yuborishda xatolik!"); }
//     };
  
//     const respondToArenaRequest = async (requestId, accept) => {
//       try {
//         const r = await api.post(`/typing/arena/request/${requestId}/${accept ? 'accept' : 'reject'}/`);
//         if (accept && r.data?.session) { setArenaSession(r.data.session); startTypingTest(r.data.session.duration); }
//         setIncomingRequests(prev => prev.filter(x => x.id !== requestId));
//       } catch { toast.error('Javob berishda xatolik!'); }
//     };
  
//     const startTypingTest = useCallback((duration = selectedTestDuration) => {
//       const testObj = {
//         id:         Date.now(),
//         title:      `${selectedLanguage.toUpperCase()} Typing Test`,
//         text:       MOCK_TEXTS[selectedLanguage]?.[selectedDifficulty] || MOCK_TEXTS.en.medium,
//         language:   selectedLanguage,
//         difficulty: selectedDifficulty,
//       };
//       setCurrentTest(testObj); setUserInput(''); setCurrentWordIndex(0); setErrors(0);
//       setElapsedTime(0); setWpm(0); setIsTestFinished(false); setIsTypingMode(true);
//       setTypingResult(null); setTimeLimit(duration); setStartTime(Date.now());
//       setShowTestSettings(false); setIsArenaMode(false);
//       setTimeout(() => typingInputRef.current?.focus(), 100);
//     }, [selectedLanguage, selectedDifficulty, selectedTestDuration]);
  
//     const handleTypingInput = (e) => {
//       if (!currentTest || isTestFinished) return;
//       const typed = e.target.value || '';
//       setUserInput(typed);
//       if (!startTime) setStartTime(Date.now());
//       const testWords  = (currentTest.text || '').split(/\s+/).filter(Boolean);
//       const typedWords = typed.trim() ? typed.trim().split(/\s+/).filter(Boolean) : [];
//       setCurrentWordIndex(Math.max(0, typedWords.length - 1));
//       let errs = 0;
//       typedWords.forEach((word, idx) => {
//         const target = testWords[idx];
//         if (target) {
//           for (let i = 0; i < Math.min(word.length, target.length); i++) if (word[i] !== target[i]) errs++;
//           errs += Math.abs(word.length - target.length);
//         } else errs += word.length;
//       });
//       setErrors(errs);
//       if (typed.trim() === (currentTest.text || '').trim()) finishTestRef.current?.();
//     };
  
//     const resetTest = useCallback(() => {
//       setUserInput(''); setCurrentWordIndex(0); setErrors(0); setStartTime(null);
//       setElapsedTime(0); setWpm(0); setIsTestFinished(false); setTypingResult(null);
//       setTimeout(() => typingInputRef.current?.focus(), 100);
//     }, []);
  
//     const closeTyping = useCallback(() => {
//       setIsTypingMode(false); setCurrentTest(null); setArenaSession(null); resetTest();
//     }, [resetTest]);
  
//     const handleModuleClick = (mod) => {
//       if (!mod) return;
//       setSelectedModule(mod); setModuleSection(null);
//       const ls = mod.lessons || [];
//       setModuleLessons(ls.filter(l => ['video', 'article'].includes(l?.lesson_type?.toLowerCase())));
//       setModuleTests(ls.filter(l => l?.lesson_type?.toLowerCase() === 'quiz' || (l?.quiz && typeof l.quiz === 'object')));
//       setModuleAssignments(ls.filter(l => ['assignment', 'task'].includes(l?.lesson_type?.toLowerCase())));
//     };
  
//     const handleLessonComplete = async () => {
//       if (!selectedLesson || isCompletingLesson || !selectedLesson.id) return;
//       setIsCompletingLesson(true);
//       try {
//         let response = null;
//         for (const ep of [`/courses/lessons/${selectedLesson.id}/complete/`, `/lessons/${selectedLesson.id}/complete/`]) {
//           try { response = await api.post(ep, { time_spent: 300 }); break; }
//           catch (err) { if (err.response?.status !== 404) throw err; }
//         }
//         if (!response) throw new Error('No endpoint');
//         toast.success(`Dars tugatildi!${(response.data?.points_earned || 0) > 0 ? ` +${response.data.points_earned} ball!` : ''}`);
//         setSelectedLesson(null); fetchDashboardData();
//       } catch { toast.error('Darsni tugatishda xatolik!'); }
//       finally { setIsCompletingLesson(false); }
//     };
  
//     const handleQuizStart = (lesson) => {
//       if (!lesson?.quiz?.questions?.length) { toast.error("Test ma'lumotlari topilmadi!"); return; }
//       setSelectedQuiz({ id: lesson.quiz.id || Date.now(), title: lesson.quiz.title || lesson.title || 'Test', duration: lesson.quiz.time_limit_minutes || 30, passing_score: lesson.quiz.passing_score || 70, questions: lesson.quiz.questions, lesson_id: lesson.id });
//       setQuizAnswers({});
//     };
  
//     const handleQuizSubmit = async () => {
//       if (!selectedQuiz || isSubmittingQuiz) return;
//       if (Object.keys(quizAnswers).length < selectedQuiz.questions.length) { toast.error('Barcha savollarga javob bering!'); return; }
//       setIsSubmittingQuiz(true);
//       try {
//         let response = null;
//         for (const ep of [`/courses/quizzes/${selectedQuiz.id}/submit/`, `/quizzes/${selectedQuiz.id}/submit/`]) {
//           try { response = await api.post(ep, { answers: quizAnswers, quiz_id: selectedQuiz.id }); break; }
//           catch (err) { if (err.response?.status !== 404) throw err; }
//         }
//         if (!response) throw new Error('No endpoint');
//         const { score = 0, is_passed = false } = response.data || {};
//         toast.success(`${score.toFixed(1)}% | ${is_passed ? "✅ O'tdingiz!" : "❌ O'tmadingiz"}`, { duration: 5000 });
//         setSelectedQuiz(null); setQuizAnswers({}); setModuleSection(null); fetchDashboardData();
//       } catch { toast.error('Testni topshirishda xatolik!'); }
//       finally { setIsSubmittingQuiz(false); }
//     };
  
//     const handleTaskSubmit = async () => {
//       if (!selectedTask || !taskFile || isSubmittingTask) return;
//       setIsSubmittingTask(true);
//       try {
//         const fd = new FormData();
//         fd.append('file', taskFile); fd.append('lesson_id', selectedTask.id);
//         let response = null;
//         for (const ep of [`/courses/lessons/${selectedTask.id}/submit-assignment/`, `/lessons/${selectedTask.id}/submit-assignment/`]) {
//           try { response = await api.post(ep, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); break; }
//           catch (err) { if (err.response?.status !== 404) throw err; }
//         }
//         if (!response) throw new Error('No endpoint');
//         toast.success('Vazifa topshirildi!');
//         setSelectedTask(null); setTaskFile(null); setModuleSection(null); fetchDashboardData();
//       } catch { toast.error('Vazifani topshirishda xatolik!'); }
//       finally { setIsSubmittingTask(false); }
//     };
  
//     const renderTypingText = () => {
//       if (!currentTest?.text) return null;
//       const words      = currentTest.text.split(/\s+/).filter(Boolean);
//       const typedWords = userInput.trim() ? userInput.trim().split(/\s+/).filter(Boolean) : [];
//       return (
//         <div className="text-2xl font-mono leading-relaxed flex flex-wrap gap-x-3 gap-y-2">
//           {words.map((word, idx) => {
//             const isPast    = idx < typedWords.length && idx < currentWordIndex;
//             const isCurrent = idx === currentWordIndex;
//             const isCorrect = typedWords[idx] === word;
//             return (
//               <span key={idx} className={`transition-all duration-100 ${
//                 isPast ? (isCorrect ? 'text-emerald-400' : 'text-rose-400 line-through opacity-70')
//                 : isCurrent ? 'text-indigo-300 underline decoration-2 underline-offset-4 font-extrabold scale-105'
//                 : 'text-slate-500'
//               }`}>
//                 {word}
//               </span>
//             );
//           })}
//         </div>
//       );
//     };
  
//     const safeModules   = modules     || [];
//     const safeCourses   = courses     || [];
//     const safeLeaderboard = leaderboard || [];
  
//     // Filtered courses
//     const filteredCourses = useMemo(() => safeCourses.filter(c => {
//       const matchSearch = !courseSearch || c.title?.toLowerCase().includes(courseSearch.toLowerCase());
//       const matchFilter = courseFilter === 'all' ? true
//         : courseFilter === 'completed' ? c.progress >= 100
//         : c.progress > 0 && c.progress < 100;
//       return matchSearch && matchFilter;
//     }), [safeCourses, courseSearch, courseFilter]);
  
//     const filteredModules = useMemo(() => safeModules.filter(m =>
//       !moduleSearch || m.title?.toLowerCase().includes(moduleSearch.toLowerCase()) || m.course_name?.toLowerCase().includes(moduleSearch.toLowerCase())
//     ), [safeModules, moduleSearch]);
  
//     if (loading) return <PremiumLoader />;
  
//     return (
//       <div className="flex h-screen bg-slate-950 overflow-hidden font-sans transition-all">
//         <Toaster
//           position="top-right"
//           toastOptions={{
//             duration: 3000,
//             style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #1e293b', borderRadius: '16px' }
//           }}
//         />
  
//         {/* Arena incoming requests */}
//         {incomingRequests.length > 0 && (
//           <div className="fixed top-24 right-6 z-[80] space-y-3 max-w-sm">
//             {incomingRequests.map(req => (
//               <div key={req.id} className="bg-slate-900 border-2 border-rose-500 rounded-2xl p-4 shadow-2xl">
//                 <div className="flex items-center gap-3 mb-3">
//                   <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center">
//                     <Flame size={20} className="text-white" />
//                   </div>
//                   <div>
//                     <h4 className="font-black text-white text-sm">Arena Challenge!</h4>
//                     <p className="text-xs text-slate-400">{req.sender_name} chaqirdi</p>
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   <button onClick={() => respondToArenaRequest(req.id, true)}
//                     className="flex-1 bg-emerald-600 text-white py-2 rounded-xl font-bold hover:bg-emerald-700 transition text-sm flex items-center justify-center gap-1">
//                     <Check size={14} /> Qabul
//                   </button>
//                   <button onClick={() => respondToArenaRequest(req.id, false)}
//                     className="flex-1 bg-rose-600 text-white py-2 rounded-xl font-bold hover:bg-rose-700 transition text-sm flex items-center justify-center gap-1">
//                     <XCircle size={14} /> Rad
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
  
//         {/* ── SIDEBAR ─────────────────────────────────────── */}
//         <aside className={`${isSidebarOpen ? 'w-64' : 'w-[72px]'} bg-slate-950 border-r border-slate-800 transition-all duration-300 flex flex-col z-50 shrink-0`}>
//           <div className="h-20 flex items-center px-5 shrink-0">
//             <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
//               <Zap size={18} className="text-white fill-current" />
//             </div>
//             {isSidebarOpen && (
//               <h1 className="ml-3 font-black text-lg text-white tracking-tight">
//                 Elite<span className="text-indigo-400">LMS</span>
//               </h1>
//             )}
//           </div>
  
//           <nav className="flex-1 px-3 space-y-1 overflow-y-auto pb-4">
//             {[
//               [<LayoutDashboard size={18} />, 'Dashboard',   'overview'],
//               [<BookOpen size={18} />,        'Kurslarim',   'courses'],
//               [<Layers size={18} />,          'Modullar',    'modules'],
//               [<Award size={18} />,           'Reyting',     'leaderboard'],
//               [<Keyboard size={18} />,        'Typing Test', 'typing'],
//               [<MessageCircle size={18} />,   'Chat',        'chat',   unreadChatCount],
//               [<Radio size={18} />,           'Jonli Efir',  'stream', unreadStreamCount],
//             ].map(([icon, label, tab, badge]) => (
//               <SidebarItem
//                 key={tab}
//                 icon={icon}
//                 label={label}
//                 active={activeTab === tab}
//                 onClick={() => setActiveTab(tab)}
//                 open={isSidebarOpen}
//                 badge={badge}
//               />
//             ))}
//             <div className="h-px bg-slate-800 my-3 mx-2" />
//             <SidebarItem icon={<Settings size={18} />} label="Sozlamalar" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} open={isSidebarOpen} />
//           </nav>
  
//           <div className="p-3 shrink-0 border-t border-slate-800">
//             {isSidebarOpen ? (
//               <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-800 transition cursor-pointer" onClick={() => setActiveTab('settings')}>
//                 <Avatar src={getAvatarSrc(currentUser.avatar, currentUser.full_name)} name={currentUser.full_name} size="sm" />
//                 <div className="flex-1 min-w-0">
//                   <p className="text-xs font-bold text-white truncate">{currentUser.full_name}</p>
//                   <p className="text-[10px] text-indigo-400">{currentUser.points} ball</p>
//                 </div>
//               </div>
//             ) : (
//               <div className="flex justify-center py-2">
//                 <Avatar src={getAvatarSrc(currentUser.avatar, currentUser.full_name)} name={currentUser.full_name} size="sm" />
//               </div>
//             )}
//             <button
//               onClick={() => { localStorage.clear(); navigate('/login'); }}
//               className="w-full flex items-center gap-3 px-3 py-2.5 text-rose-400 hover:bg-rose-500/10 rounded-xl transition text-sm font-semibold mt-1"
//             >
//               <LogOut size={16} />
//               {isSidebarOpen && 'Chiqish'}
//             </button>
//           </div>
//         </aside>
  
//         {/* ── MAIN ────────────────────────────────────────── */}
//         <main className="flex-1 flex flex-col overflow-hidden min-w-0">
//           {/* Header */}
//           <header className="h-20 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 px-6 flex items-center justify-between shrink-0 z-40">
//             <button
//               onClick={() => setSidebarOpen(p => !p)}
//               className="p-2.5 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white"
//             >
//               <div className="flex flex-col gap-1.5 w-5">
//                 <div className={`h-0.5 bg-current transition-all ${isSidebarOpen ? 'w-5' : 'w-4'}`} />
//                 <div className="h-0.5 bg-current w-5" />
//                 <div className={`h-0.5 bg-current transition-all ${isSidebarOpen ? 'w-5' : 'w-3'}`} />
//               </div>
//             </button>
  
//             {/* Breadcrumb */}
//             <div className="flex items-center gap-2 text-sm">
//               <span className="text-slate-500">EliteLMS</span>
//               <span className="text-slate-700">/</span>
//               <span className="text-white font-semibold capitalize">
//                 {activeTab === 'overview' ? 'Dashboard' : activeTab}
//               </span>
//             </div>
  
//             <div className="flex items-center gap-2.5">
//               {/* Points */}
//               <div className="hidden md:flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 rounded-xl">
//                 <Trophy size={15} className="text-amber-400" />
//                 <span className="font-black text-amber-400 text-sm">{currentUser.points}</span>
//               </div>
  
//               <NotificationBell
//                 streamNotifs={streamNotifs}
//                 unreadCount={unreadStreamCount}
//                 onClear={() => setStreamNotifs([])}
//                 onNavigate={() => setActiveTab('stream')}
//               />
  
//               <Tooltip text={isDarkMode ? 'Yorug\' rejim' : 'Qorong\'u rejim'}>
//                 <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 transition text-slate-400 hover:text-white">
//                   {isDarkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-indigo-400" />}
//                 </button>
//               </Tooltip>
  
//               <button onClick={() => setActiveTab('settings')} className="flex items-center gap-2.5 pl-3 border-l border-slate-800 hover:opacity-80 transition">
//                 <div className="text-right hidden sm:block">
//                   <p className="text-xs font-bold text-white leading-tight">{currentUser.full_name}</p>
//                   <p className="text-[10px] text-indigo-400">#{currentUser.id}</p>
//                 </div>
//                 <Avatar src={getAvatarSrc(currentUser.avatar, currentUser.full_name)} name={currentUser.full_name} size="sm" />
//               </button>
//             </div>
//           </header>
  
//           {/* Page content */}
//           <div className="flex-1 overflow-y-auto p-6 lg:p-8">
//             <div className="max-w-7xl mx-auto space-y-8">
  
//               {/* ── OVERVIEW ─────────────────────────────── */}
//               {activeTab === 'overview' && (
//                 <div className="space-y-6">
//                   {/* Hero */}
//                   <div className="relative bg-gradient-to-br from-indigo-900 via-violet-900/80 to-slate-900 p-10 rounded-3xl text-white overflow-hidden border border-indigo-500/10">
//                     <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 80% 50%, rgba(139,92,246,0.15) 0%, transparent 60%)' }} />
//                     <Trophy className="absolute -right-12 -bottom-12 w-72 h-72 text-white/5" />
//                     <div className="relative z-10 max-w-lg">
//                       <Badge variant="purple" className="mb-4">⚡ Premium Dashboard</Badge>
//                       <h1 className="text-5xl font-black leading-none mb-4">
//                         Salom, <span className="text-indigo-300">{currentUser.full_name.split(' ')[0]}</span>!
//                       </h1>
//                       <p className="text-white/60 text-lg mb-6">Bugun qanday yangilik o'rganasiz?</p>
//                       <button onClick={() => setActiveTab('courses')}
//                         className="flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-2xl font-black hover:bg-white/90 transition text-sm shadow-xl">
//                         <PlayCircle size={18} /> Dars boshlash <ChevronRight size={16} />
//                       </button>
//                     </div>
//                   </div>
  
//                   {/* Stats */}
//                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//                     <StatCard icon={<BookOpen size={20} />}    label="Kurslarim"  value={dashboardStats.total_courses}     gradient="from-indigo-600 to-indigo-800" />
//                     <StatCard icon={<Layers size={20} />}       label="Darslar"    value={dashboardStats.total_lessons}     gradient="from-violet-600 to-violet-800" />
//                     <StatCard icon={<CheckCircle2 size={20} />} label="Tugatilgan" value={dashboardStats.completed_lessons} gradient="from-emerald-600 to-emerald-800" />
//                     <StatCard icon={<Target size={20} />}       label="Progress"   value={`${dashboardStats.overall_progress}%`} gradient="from-amber-500 to-orange-600" />
//                   </div>
  
//                   {/* Quick actions */}
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                     {[
//                       [<BookOpen size={20} />,    'Kurslar',    'courses',     'from-indigo-600 to-indigo-700'],
//                       [<Keyboard size={20} />,    'Typing',     'typing',      'from-violet-600 to-violet-700'],
//                       [<MessageCircle size={20} />,'Chat',      'chat',        'from-blue-600 to-blue-700'],
//                       [<Radio size={20} />,        'Efir',       'stream',      'from-rose-600 to-rose-700'],
//                     ].map(([icon, label, tab, grad]) => (
//                       <button key={tab} onClick={() => setActiveTab(tab)}
//                         className={`flex items-center gap-3 p-4 bg-gradient-to-br ${grad} rounded-2xl text-white font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg`}>
//                         {icon} {label}
//                       </button>
//                     ))}
//                   </div>
  
//                   {/* Recent activity */}
//                   {recentActivity.length > 0 && (
//                     <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
//                       <h3 className="font-black text-white mb-4 flex items-center gap-2"><Activity size={18} className="text-indigo-400" /> So'nggi faollik</h3>
//                       <div className="space-y-3">
//                         {recentActivity.slice(0, 5).map((a, i) => (
//                           <div key={i} className="flex items-center gap-3 text-sm">
//                             <div className="w-8 h-8 bg-indigo-500/20 rounded-xl flex items-center justify-center shrink-0">
//                               <CheckCircle2 size={14} className="text-indigo-400" />
//                             </div>
//                             <span className="text-slate-300 flex-1 truncate">{a.title || a.description}</span>
//                             <span className="text-slate-500 text-xs shrink-0">{a.date}</span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
  
//               {/* ── COURSES ──────────────────────────────── */}
//               {activeTab === 'courses' && (
//                 <div className="space-y-5">
//                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                     <div>
//                       <h2 className="text-3xl font-black text-white">Mening Kurslarim</h2>
//                       <p className="text-slate-400 text-sm mt-0.5">{filteredCourses.length} ta kurs</p>
//                     </div>
//                     <button onClick={fetchDashboardData} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition text-sm">
//                       <RotateCcw size={15} /> Yangilash
//                     </button>
//                   </div>
  
//                   {/* Search & filter */}
//                   <div className="flex flex-col sm:flex-row gap-3">
//                     <div className="relative flex-1">
//                       <BookOpen size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
//                       <input
//                         type="text"
//                         placeholder="Kurs qidirish..."
//                         value={courseSearch}
//                         onChange={e => setCourseSearch(e.target.value)}
//                         className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
//                       />
//                     </div>
//                     <div className="flex bg-slate-800 border border-slate-700 p-1 rounded-xl gap-1">
//                       {[['all','Barchasi'],['inprogress','Jarayonda'],['completed','Tugatilgan']].map(([v, l]) => (
//                         <button key={v} onClick={() => setCourseFilter(v)}
//                           className={`px-3 py-2 rounded-lg text-xs font-bold transition ${courseFilter === v ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
//                           {l}
//                         </button>
//                       ))}
//                     </div>
//                   </div>
  
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//                     {filteredCourses.length > 0 ? filteredCourses.map(course => (
//                       <div key={course.id}
//                         className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden group hover:border-indigo-500/40 transition-all hover:shadow-xl hover:shadow-indigo-500/5">
//                         {course.thumbnail && (
//                           <div className="relative h-40 overflow-hidden">
//                             <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                               onError={e => e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'} />
//                             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
//                             {course.progress >= 100 && (
//                               <div className="absolute top-3 right-3">
//                                 <Badge variant="green">✓ Tugatilgan</Badge>
//                               </div>
//                             )}
//                           </div>
//                         )}
//                         <div className="p-5">
//                           <h3 className="font-black text-white text-lg mb-1 line-clamp-1">{course.title || 'Nomsiz'}</h3>
//                           <p className="text-xs text-slate-400 mb-4">{course.total_lessons || 0} ta dars</p>
//                           <ProgressBar value={course.progress || 0} />
//                           <button
//                             onClick={() => setActiveTab('modules')}
//                             className="mt-4 w-full py-2.5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 hover:border-indigo-500 text-indigo-300 hover:text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
//                           >
//                             <PlayCircle size={15} /> Davom etish
//                           </button>
//                         </div>
//                       </div>
//                     )) : <div className="col-span-full"><EmptyState message="Kurs topilmadi" /></div>}
//                   </div>
//                 </div>
//               )}
  
//               {/* ── MODULES ──────────────────────────────── */}
//               {activeTab === 'modules' && (
//                 <div className="space-y-5">
//                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                     <div>
//                       <h2 className="text-3xl font-black text-white">Modullar</h2>
//                       <p className="text-slate-400 text-sm mt-0.5">{filteredModules.length} ta modul</p>
//                     </div>
//                   </div>
//                   <div className="relative">
//                     <BookOpen size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
//                     <input
//                       type="text"
//                       placeholder="Modul qidirish..."
//                       value={moduleSearch}
//                       onChange={e => setModuleSearch(e.target.value)}
//                       className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
//                     />
//                   </div>
//                   {filteredModules.length > 0 ? (
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//                       {filteredModules.map(mod => (
//                         <div key={mod.id}
//                           className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden group hover:border-indigo-500/40 transition-all hover:shadow-lg">
//                           <div className="relative h-44 overflow-hidden">
//                             <img src={mod.course_thumbnail} alt={mod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                               onError={e => e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'} />
//                             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
//                             <div className="absolute bottom-3 left-4">
//                               <Badge variant="blue">{mod.course_name}</Badge>
//                             </div>
//                             {mod.is_completed && (
//                               <div className="absolute top-3 right-3">
//                                 <Badge variant="green">✓</Badge>
//                               </div>
//                             )}
//                           </div>
//                           <div className="p-5">
//                             <h3 className="font-black text-white text-lg mb-1.5 line-clamp-1">{mod.title}</h3>
//                             <p className="text-sm text-slate-400 mb-3 line-clamp-2">{mod.description || 'Modul tavsifi'}</p>
//                             <div className="flex gap-2 mb-4 flex-wrap">
//                               <Badge variant="blue">📚 {mod.lessons_count} dars</Badge>
//                               {mod.duration_minutes > 0 && <Badge variant="purple">⏱ {mod.duration_minutes} min</Badge>}
//                             </div>
//                             <button onClick={() => handleModuleClick(mod)}
//                               className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2">
//                               Kirish <ChevronRight size={15} />
//                             </button>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   ) : <EmptyState message="Modullar topilmadi. Avval kursga yoziling!" />}
//                 </div>
//               )}
  
//               {/* ── LEADERBOARD ──────────────────────────── */}
//               {activeTab === 'leaderboard' && (
//                 <div className="space-y-5">
//                   <div className="relative bg-gradient-to-br from-amber-900/50 via-orange-900/50 to-red-900/50 p-10 rounded-3xl text-white overflow-hidden border border-amber-500/10">
//                     <Crown className="absolute -right-10 -top-10 w-48 h-48 text-amber-500/10" />
//                     <div className="relative z-10">
//                       <Badge variant="orange" className="mb-3">🏆 Top Talabalar</Badge>
//                       <h2 className="text-4xl font-black mb-2">Reyting Jadvali</h2>
//                       <p className="text-white/50">Ko'proq dars tugatib yuqoriga chiqing</p>
//                     </div>
//                   </div>
//                   {safeLeaderboard.length > 0 ? (
//                     <div className="space-y-3">
//                       {safeLeaderboard.map((s, i) => (
//                         <div key={s.id || i}
//                           className={`bg-slate-900 p-5 rounded-2xl border transition ${
//                             i === 0 ? 'border-amber-500/40 bg-gradient-to-r from-amber-500/5 to-transparent'
//                             : i === 1 ? 'border-slate-400/30'
//                             : i === 2 ? 'border-orange-500/30'
//                             : 'border-slate-800'
//                           } ${s.id === currentUser.id ? 'ring-1 ring-indigo-500' : ''}`}>
//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-4">
//                               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
//                                 i === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/25'
//                                 : i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white'
//                                 : i === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white'
//                                 : 'bg-slate-800 text-slate-400 text-lg'
//                               }`}>
//                                 {i === 0 ? <Crown size={22} /> : i === 1 ? <Medal size={22} /> : i === 2 ? <Star size={22} /> : i + 1}
//                               </div>
//                               <Avatar src={getAvatarSrc(s.avatar, s.full_name)} name={s.full_name} size="md" />
//                               <div>
//                                 <h4 className="font-black text-white">
//                                   {s.full_name || "Noma'lum"}
//                                   {s.id === currentUser.id && <span className="ml-2 text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">Siz</span>}
//                                 </h4>
//                                 <div className="flex gap-3 text-xs text-slate-400 mt-0.5">
//                                   <span>✅ {s.completed_lessons || 0} dars</span>
//                                   <span>📝 {s.completed_tests || 0} test</span>
//                                 </div>
//                               </div>
//                             </div>
//                             <div className="text-right">
//                               <div className="flex items-center gap-2 justify-end">
//                                 <Trophy size={16} className="text-amber-400" />
//                                 <span className="text-2xl font-black text-white">{s.points || 0}</span>
//                               </div>
//                               <p className="text-xs text-slate-500">ball</p>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   ) : <EmptyState message="Reyting ma'lumotlari topilmadi" />}
//                 </div>
//               )}
  
//               {/* ── TYPING ───────────────────────────────── */}
//               {activeTab === 'typing' && (
//                 <TypingPage
//                   currentUser={currentUser}
//                   arenaLeaderboard={arenaLeaderboard}
//                   generalLeaderboard={generalLeaderboard}
//                   activeLeaderboardTab={activeLeaderboardTab}
//                   setActiveLeaderboardTab={setActiveLeaderboardTab}
//                   userTypingStats={userTypingStats}
//                   incomingRequests={incomingRequests}
//                   respondToArenaRequest={respondToArenaRequest}
//                   onlineUsers={onlineUsers}
//                   selectedOpponent={selectedOpponent}
//                   setSelectedOpponent={setSelectedOpponent}
//                   sendArenaRequest={sendArenaRequest}
//                   selectedTestDuration={selectedTestDuration}
//                   setSelectedTestDuration={setSelectedTestDuration}
//                   selectedLanguage={selectedLanguage}
//                   setSelectedLanguage={setSelectedLanguage}
//                   selectedDifficulty={selectedDifficulty}
//                   setSelectedDifficulty={setSelectedDifficulty}
//                   startTypingTest={startTypingTest}
//                   showTestSettings={showTestSettings}
//                   setShowTestSettings={setShowTestSettings}
//                   showArenaSetup={showArenaSetup}
//                   setShowArenaSetup={setShowArenaSetup}
//                   fetchOnlineUsers={fetchOnlineUsers}
//                   isTypingMode={isTypingMode}
//                 />
//               )}
  
//               {activeTab === 'chat'     && <ChatPanel currentUser={currentUser} />}
//               {activeTab === 'stream'   && <StreamViewerPanel currentUser={currentUser} />}
//               {activeTab === 'settings' && (
//                 <SettingsPage
//                   currentUser={currentUser}
//                   isDarkMode={isDarkMode}
//                   toggleTheme={toggleTheme}
//                   accentColor={accentColor}
//                   setAccentColor={setAccentColor}
//                   fontSize={fontSize}
//                   setFontSize={setFontSize}
//                 />
//               )}
  
//             </div>
//           </div>
//         </main>
  
//         {/* ── MODALS ───────────────────────────────────────── */}
  
//         {/* Test Settings Modal */}
//         {showTestSettings && (
//           <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-6">
//             <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden">
//               <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-indigo-900/50 to-violet-900/50 flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
//                     <Keyboard size={20} className="text-white" />
//                   </div>
//                   <div>
//                     <h3 className="font-black text-white">Test Sozlamalari</h3>
//                     <p className="text-xs text-slate-400">Til, qiyinlik va vaqt</p>
//                   </div>
//                 </div>
//                 <button onClick={() => setShowTestSettings(false)} className="p-2 hover:bg-slate-700 rounded-xl text-slate-400"><X size={18} /></button>
//               </div>
//               <div className="p-5 space-y-5">
//                 <div>
//                   <p className="text-xs font-bold text-slate-400 uppercase mb-2">Til</p>
//                   <div className="grid grid-cols-3 gap-2">
//                     {[['uz','🇺🇿 O\'zbek'],['en','🇬🇧 English'],['ru','🇷🇺 Рус']].map(([v,l]) => (
//                       <button key={v} onClick={() => setSelectedLanguage(v)}
//                         className={`py-2.5 rounded-xl text-xs font-bold transition ${selectedLanguage === v ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{l}</button>
//                     ))}
//                   </div>
//                 </div>
//                 <div>
//                   <p className="text-xs font-bold text-slate-400 uppercase mb-2">Qiyinlik</p>
//                   <div className="grid grid-cols-3 gap-2">
//                     {[['easy','🟢 Oson'],['medium','🟡 O\'rta'],['hard','🔴 Qiyin']].map(([v,l]) => (
//                       <button key={v} onClick={() => setSelectedDifficulty(v)}
//                         className={`py-2.5 rounded-xl text-xs font-bold transition ${selectedDifficulty === v ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{l}</button>
//                     ))}
//                   </div>
//                 </div>
//                 <div>
//                   <p className="text-xs font-bold text-slate-400 uppercase mb-2">Vaqt</p>
//                   <div className="grid grid-cols-3 gap-2">
//                     {[30, 60, 120].map(t => (
//                       <button key={t} onClick={() => setSelectedTestDuration(t)}
//                         className={`py-2.5 rounded-xl text-xs font-bold transition ${selectedTestDuration === t ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{t}s</button>
//                     ))}
//                   </div>
//                 </div>
//                 <button onClick={() => startTypingTest(selectedTestDuration)}
//                   className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-black transition flex items-center justify-center gap-2">
//                   <PlayCircle size={18} /> Boshlash
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
  
//         {/* Arena Setup Modal */}
//         {showArenaSetup && (
//           <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-6">
//             <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden">
//               <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-rose-900/50 to-orange-900/50 flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center">
//                     <Flame size={20} className="text-white" />
//                   </div>
//                   <div>
//                     <h3 className="font-black text-white">Arena 1v1</h3>
//                     <p className="text-xs text-slate-400">Raqib tanlang</p>
//                   </div>
//                 </div>
//                 <button onClick={() => setShowArenaSetup(false)} className="p-2 hover:bg-slate-700 rounded-xl text-slate-400"><X size={18} /></button>
//               </div>
//               <div className="p-5">
//                 <div className="grid grid-cols-2 gap-4 mb-5">
//                   <div>
//                     <p className="text-xs font-bold text-slate-400 uppercase mb-2">Vaqt</p>
//                     <div className="flex gap-2">
//                       {[30, 60, 120].map(t => (
//                         <button key={t} onClick={() => setSelectedTestDuration(t)}
//                           className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${selectedTestDuration === t ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{t}s</button>
//                       ))}
//                     </div>
//                   </div>
//                   <div>
//                     <p className="text-xs font-bold text-slate-400 uppercase mb-2">Til</p>
//                     <div className="flex gap-2">
//                       {['uz','en','ru'].map(v => (
//                         <button key={v} onClick={() => setSelectedLanguage(v)}
//                           className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${selectedLanguage === v ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{v.toUpperCase()}</button>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2 mb-3">
//                   <Users size={16} className="text-emerald-400" />
//                   <h4 className="font-bold text-white text-sm">Online ({onlineUsers.length})</h4>
//                 </div>
//                 <div className="space-y-2 max-h-56 overflow-y-auto mb-4">
//                   {onlineUsers.length > 0 ? onlineUsers.map(u => (
//                     <div key={u.id} onClick={() => setSelectedOpponent(u)}
//                       className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition ${
//                         selectedOpponent?.id === u.id ? 'border-rose-500 bg-rose-500/10' : 'border-slate-700 hover:border-slate-600'
//                       }`}>
//                       <Avatar src={getAvatarSrc(u.avatar, u.full_name)} name={u.full_name} size="sm" online />
//                       <div className="flex-1">
//                         <p className="font-semibold text-white text-sm">{u.full_name}</p>
//                         <p className="text-xs text-slate-400">⚡ {u.best_wpm || 0} WPM</p>
//                       </div>
//                       {selectedOpponent?.id === u.id && <Check size={16} className="text-rose-400" />}
//                     </div>
//                   )) : (
//                     <div className="text-center py-8 text-slate-500">
//                       <Users size={32} className="mx-auto mb-2 opacity-30" />
//                       <p className="text-sm">Online foydalanuvchi yo'q</p>
//                     </div>
//                   )}
//                 </div>
//                 {selectedOpponent && (
//                   <button onClick={() => { sendArenaRequest(selectedOpponent.id); setShowArenaSetup(false); }}
//                     className="w-full bg-gradient-to-r from-rose-600 to-orange-600 text-white py-3.5 rounded-xl font-black transition flex items-center justify-center gap-2 hover:from-rose-700 hover:to-orange-700">
//                     <Send size={16} /> Challenge Yuborish
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
  
//         {/* Typing test modal */}
//         {isTypingMode && currentTest && (
//           <div className="fixed inset-0 bg-black/95 z-[70] flex items-center justify-center p-6">
//             <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden">
//               <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   {isArenaMode && <Badge variant="red">🔥 ARENA</Badge>}
//                   <div>
//                     <h3 className="font-black text-white">{currentTest.title}</h3>
//                     <p className="text-xs text-slate-400">{selectedLanguage.toUpperCase()} · {selectedDifficulty}</p>
//                   </div>
//                 </div>
//                 <button onClick={closeTyping} className="p-2 hover:bg-slate-700 rounded-xl text-slate-400"><X size={18} /></button>
//               </div>
  
//               {/* Stats bar */}
//               <div className="grid grid-cols-4 gap-px bg-slate-800">
//                 {[
//                   ['WPM',     Math.round(wpm),  'text-indigo-400'],
//                   ['Aniqlik', currentTest.text ? `${Math.round(((currentTest.text.length - errors) / currentTest.text.length) * 100)}%` : '0%', 'text-emerald-400'],
//                   ['Xatolar', errors,           'text-rose-400'],
//                   ['Vaqt',    timeLimit ? `${Math.floor(elapsedTime)}/${timeLimit}s` : `${Math.floor(elapsedTime)}s`, 'text-amber-400'],
//                 ].map(([l, v, c]) => (
//                   <div key={l} className="bg-slate-900 py-4 text-center">
//                     <p className="text-xs text-slate-500 uppercase mb-1">{l}</p>
//                     <p className={`text-3xl font-black ${c}`}>{v}</p>
//                   </div>
//                 ))}
//               </div>
  
//               {/* Timer bar */}
//               {timeLimit && (
//                 <div className="h-1 bg-slate-800">
//                   <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-100"
//                     style={{ width: `${Math.min(100, (elapsedTime / timeLimit) * 100)}%` }} />
//                 </div>
//               )}
  
//               <div className="p-8">
//                 {!isTestFinished ? (
//                   <>
//                     <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl mb-5 min-h-[140px] select-none">
//                       {renderTypingText()}
//                     </div>
//                     <textarea
//                       ref={typingInputRef}
//                       value={userInput}
//                       onChange={handleTypingInput}
//                       className="w-full p-4 bg-slate-800 border-2 border-indigo-600 rounded-2xl font-mono text-base text-white focus:outline-none resize-none"
//                       placeholder="Boshlash uchun yozishni boshlang..."
//                       rows={3}
//                       autoFocus
//                       onKeyDown={e => e.key === 'Tab' && e.preventDefault()}
//                     />
//                     <p className="text-center text-xs text-slate-500 mt-3">Matn to'liq yozilganda avtomatik tugaydi</p>
//                   </>
//                 ) : (
//                   <div className="text-center py-8">
//                     <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
//                       <CheckCircle2 size={40} className="text-emerald-400" />
//                     </div>
//                     {typingResult && (
//                       <>
//                         <h2 className="text-4xl font-black text-white mb-6">Test Tugadi!</h2>
//                         <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-8">
//                           {[
//                             ['WPM',    'text-indigo-400',  typingResult.wpm || 0,                         'bg-indigo-500/10 border-indigo-500/20'],
//                             ['Aniqlik','text-emerald-400', `${(typingResult.accuracy || 0).toFixed(1)}%`, 'bg-emerald-500/10 border-emerald-500/20'],
//                             ['Vaqt',   'text-amber-400',   `${typingResult.time_taken || 0}s`,            'bg-amber-500/10 border-amber-500/20'],
//                           ].map(([l, c, v, bg]) => (
//                             <div key={l} className={`${bg} border p-5 rounded-2xl`}>
//                               <p className={`text-xs ${c} mb-1 font-semibold`}>{l}</p>
//                               <p className="text-4xl font-black text-white">{v}</p>
//                             </div>
//                           ))}
//                         </div>
//                         <div className="flex gap-3 justify-center">
//                           <button onClick={() => startTypingTest(selectedTestDuration)}
//                             className="px-7 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex items-center gap-2 text-sm">
//                             <RotateCcw size={16} /> Qayta
//                           </button>
//                           <button onClick={closeTyping}
//                             className="px-7 py-3 bg-slate-700 text-slate-200 rounded-xl font-bold hover:bg-slate-600 transition text-sm">
//                             Yopish
//                           </button>
//                         </div>
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
  
//         {/* Module section modal */}
//         {selectedModule && !moduleSection && (
//           <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
//             <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
//               <div className="p-6 border-b border-slate-800 flex items-center justify-between">
//                 <div>
//                   <h2 className="text-2xl font-black text-white">{selectedModule.title}</h2>
//                   <p className="text-sm text-slate-400 mt-0.5">{selectedModule.course_name}</p>
//                 </div>
//                 <button onClick={() => setSelectedModule(null)} className="p-2 hover:bg-slate-700 rounded-xl text-slate-400"><X size={20} /></button>
//               </div>
//               <div className="p-6">
//                 {selectedModule.description && (
//                   <p className="text-slate-400 text-sm mb-6 bg-slate-800/50 p-4 rounded-2xl border border-slate-700">{selectedModule.description}</p>
//                 )}
//                 <div className="grid grid-cols-3 gap-4">
//                   {[
//                     ['videos',      'from-indigo-600 to-indigo-700',  <Video size={28} />,    'Video Darsliklar',  moduleLessons.length],
//                     ['assignments', 'from-emerald-600 to-emerald-700', <FileText size={28} />, 'Topshiriqlar',      moduleAssignments.length],
//                     ['tests',       'from-amber-500 to-orange-600',    <Trophy size={28} />,   'Testlar',           moduleTests.length],
//                   ].map(([sec, grad, icon, title, count]) => (
//                     <button key={sec} onClick={() => setModuleSection(sec)}
//                       className={`bg-gradient-to-br ${grad} p-7 rounded-3xl text-white text-left hover:scale-[1.03] active:scale-95 transition-all shadow-lg group`}>
//                       <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-white/30 transition">{icon}</div>
//                       <h4 className="text-xl font-black mb-1">{title}</h4>
//                       <div className="flex items-center justify-between">
//                         <span className="text-4xl font-black opacity-90">{count}</span>
//                         <ChevronRight size={20} className="group-hover:translate-x-1 transition" />
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
  
//         {/* Lesson list modals */}
//         {selectedModule && ['videos', 'assignments', 'tests'].includes(moduleSection) && (() => {
//           const cfg = {
//             videos:      { title: 'Video Darsliklar', items: moduleLessons,     color: 'border-indigo-500', btnColor: 'bg-indigo-600 hover:bg-indigo-700', btnText: 'Ko\'rish', onAction: (l) => setSelectedLesson(l) },
//             assignments: { title: 'Topshiriqlar',     items: moduleAssignments, color: 'border-emerald-500', btnColor: 'bg-emerald-600 hover:bg-emerald-700', btnText: 'Topshirish', onAction: (l) => { setSelectedTask(l); setTaskFile(null); } },
//             tests:       { title: 'Testlar',          items: moduleTests,       color: 'border-amber-500', btnColor: 'bg-amber-600 hover:bg-amber-700', btnText: 'Boshlash', onAction: handleQuizStart },
//           };
//           const c = cfg[moduleSection];
//           return (
//             <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
//               <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
//                 <div className="p-5 border-b border-slate-800 flex items-center gap-3">
//                   <button onClick={() => setModuleSection(null)} className="p-2 hover:bg-slate-700 rounded-xl text-slate-400"><ArrowLeft size={18} /></button>
//                   <div className="flex-1">
//                     <h2 className="font-black text-white text-xl">{c.title}</h2>
//                     <p className="text-xs text-slate-400">{selectedModule.title}</p>
//                   </div>
//                   <button onClick={() => setSelectedModule(null)} className="p-2 hover:bg-slate-700 rounded-xl text-slate-400"><X size={18} /></button>
//                 </div>
//                 <div className="p-5 overflow-y-auto max-h-[65vh] space-y-3">
//                   {c.items.length > 0 ? c.items.map((item, i) => (
//                     <div key={item.id || i}
//                       className={`p-4 rounded-2xl border border-slate-800 hover:${c.color} hover:bg-slate-800/30 transition`}>
//                       <div className="flex items-center justify-between gap-3">
//                         <div className="flex items-center gap-3 flex-1 min-w-0">
//                           <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center font-black text-slate-400 text-sm shrink-0">{i + 1}</div>
//                           <div className="flex-1 min-w-0">
//                             <h4 className="font-bold text-white truncate">{item.title}</h4>
//                             <div className="flex gap-2 mt-0.5">
//                               {item.is_completed && <Badge variant="green">✓ Tugatilgan</Badge>}
//                               {item.lesson_type && <Badge variant="default">{item.lesson_type}</Badge>}
//                             </div>
//                           </div>
//                         </div>
//                         <button
//                           onClick={() => c.onAction(item)}
//                           disabled={moduleSection === 'assignments' && item.is_completed}
//                           className={`px-5 py-2.5 ${c.btnColor} text-white rounded-xl font-bold text-sm transition shrink-0 disabled:opacity-40`}
//                         >
//                           {moduleSection === 'assignments' && item.is_completed ? 'Topshirilgan' : c.btnText}
//                         </button>
//                       </div>
//                     </div>
//                   )) : (
//                     <EmptyState message={`${c.title} yo'q`} />
//                   )}
//                 </div>
//               </div>
//             </div>
//           );
//         })()}
  
//         {/* Lesson viewer */}
//         {selectedLesson && (() => {
//           const embedUrl = (() => {
//             const url = selectedLesson.video_url;
//             if (!url) return null;
//             let vid = null;
//             if (url.includes('youtube.com/watch?v=')) vid = url.split('watch?v=')[1]?.split('&')[0];
//             else if (url.includes('youtu.be/')) vid = url.split('youtu.be/')[1]?.split('?')[0];
//             else if (url.includes('youtube.com/embed/')) return url;
//             return vid ? `https://www.youtube.com/embed/${vid}?autoplay=0&rel=0&modestbranding=1` : url;
//           })();
//           return (
//             <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-6">
//               <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
//                 <div className="p-5 border-b border-slate-800 flex items-center justify-between">
//                   <h2 className="font-black text-white text-lg">{selectedLesson.title}</h2>
//                   <button onClick={() => setSelectedLesson(null)} className="p-2 hover:bg-slate-700 rounded-xl text-slate-400"><X size={18} /></button>
//                 </div>
//                 <div className="p-6 overflow-y-auto max-h-[80vh]">
//                   {selectedLesson.lesson_type === 'video' && selectedLesson.video_url ? (
//                     <div className="aspect-video bg-black rounded-2xl overflow-hidden mb-5">
//                       {selectedLesson.video_url.includes('youtube')
//                         ? <iframe className="w-full h-full" src={embedUrl || ''} title={selectedLesson.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
//                         : <video controls className="w-full h-full" src={selectedLesson.video_url} />}
//                     </div>
//                   ) : (
//                     <div className="prose prose-invert max-w-none mb-5 p-5 bg-slate-800/50 rounded-2xl border border-slate-700"
//                       dangerouslySetInnerHTML={{ __html: selectedLesson.content || "<p>Kontent yo'q</p>" }} />
//                   )}
//                   {selectedLesson.description && (
//                     <div className="bg-indigo-500/5 border border-indigo-500/20 p-5 rounded-2xl mb-5">
//                       <p className="text-xs font-bold text-indigo-400 uppercase mb-2">Dars haqida</p>
//                       <p className="text-slate-300 text-sm">{selectedLesson.description}</p>
//                     </div>
//                   )}
//                   <div className="flex justify-end gap-3">
//                     <button onClick={() => setSelectedLesson(null)} className="px-6 py-2.5 border border-slate-700 text-slate-300 rounded-xl font-semibold hover:bg-slate-800 transition text-sm">Yopish</button>
//                     {!selectedLesson.is_completed && (
//                       <button onClick={handleLessonComplete} disabled={isCompletingLesson}
//                         className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center gap-2 text-sm disabled:opacity-50">
//                         {isCompletingLesson ? <><Spinner size={16} /> Yuklanmoqda...</> : <><CheckCircle2 size={16} /> Darsni Tugatish</>}
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           );
//         })()}
  
//         {/* Quiz modal */}
//         {selectedQuiz && (
//           <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-6 overflow-y-auto">
//             <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full my-6 shadow-2xl">
//               <div className="p-6 border-b border-slate-800 flex items-center justify-between">
//                 <div>
//                   <h2 className="text-2xl font-black text-white">{selectedQuiz.title}</h2>
//                   <div className="flex gap-3 mt-1.5 text-xs text-slate-400">
//                     <span>⏱ {selectedQuiz.duration} min</span>
//                     <span>✅ O'tish: {selectedQuiz.passing_score}%</span>
//                     <span>📝 {selectedQuiz.questions?.length} savol</span>
//                   </div>
//                 </div>
//                 <button onClick={() => { setSelectedQuiz(null); setQuizAnswers({}); }} className="p-2 hover:bg-slate-700 rounded-xl text-slate-400"><X size={18} /></button>
//               </div>
//               <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
//                 {selectedQuiz.questions?.map((q, qi) => (
//                   <div key={q.id || qi} className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl">
//                     <div className="flex items-start gap-3 mb-4">
//                       <div className="w-9 h-9 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-black text-sm shrink-0">{qi + 1}</div>
//                       <h4 className="font-bold text-white">{q.text}</h4>
//                     </div>
//                     <div className="space-y-2 pl-12">
//                       {q.options?.map(opt => (
//                         <button key={opt.id} onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: [opt.id] }))}
//                           className={`w-full text-left p-3.5 rounded-xl border text-sm font-medium transition ${
//                             quizAnswers[q.id]?.[0] === opt.id
//                               ? 'bg-amber-600 border-amber-500 text-white'
//                               : 'border-slate-600 text-slate-300 hover:border-amber-500/50 hover:bg-slate-700'
//                           }`}>
//                           {opt.text}
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               <div className="p-5 border-t border-slate-800 flex items-center justify-between bg-slate-900">
//                 <span className="text-xs text-slate-400">{Object.keys(quizAnswers).length}/{selectedQuiz.questions?.length || 0} javob</span>
//                 <div className="flex gap-3">
//                   <button onClick={() => { setSelectedQuiz(null); setQuizAnswers({}); }}
//                     className="px-6 py-2.5 border border-slate-700 text-slate-300 rounded-xl font-semibold hover:bg-slate-800 transition text-sm">Bekor</button>
//                   <button onClick={handleQuizSubmit}
//                     disabled={isSubmittingQuiz || Object.keys(quizAnswers).length < (selectedQuiz.questions?.length || 0)}
//                     className="px-8 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black text-sm transition flex items-center gap-2 disabled:opacity-40">
//                     {isSubmittingQuiz ? <><Spinner size={15} /> Tekshirilmoqda...</> : <><Trophy size={15} /> Yakunlash</>}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
  
//         {/* Task submit modal */}
//         {selectedTask && (
//           <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
//             <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
//               <div className="p-5 border-b border-slate-800 flex items-center justify-between">
//                 <h2 className="font-black text-white text-xl">Vazifa topshirish</h2>
//                 <button onClick={() => { setSelectedTask(null); setTaskFile(null); }} className="p-2 hover:bg-slate-700 rounded-xl text-slate-400"><X size={18} /></button>
//               </div>
//               <div className="p-6 space-y-5">
//                 <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl">
//                   <h4 className="font-bold text-white mb-2">{selectedTask.title}</h4>
//                   <p className="text-sm text-slate-400">{selectedTask.description || "Vazifa tavsifi mavjud emas"}</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-white text-sm mb-3">Fayl yuklash</p>
//                   <label htmlFor="taskFile" className="block border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer transition group">
//                     <input type="file" id="taskFile" className="hidden" onChange={e => {
//                       const f = e.target.files?.[0];
//                       if (f && f.size <= 10 * 1024 * 1024) { setTaskFile(f); toast.success(`Fayl: ${f.name}`); }
//                       else if (f) toast.error('10MB dan oshmasin!');
//                     }} />
//                     <Upload size={36} className="text-slate-600 group-hover:text-emerald-500 mx-auto mb-3 transition" />
//                     <p className="font-semibold text-slate-400 group-hover:text-slate-300 text-sm transition">Faylni tanlang (maks 10MB)</p>
//                   </label>
//                   {taskFile && (
//                     <div className="mt-3 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
//                       <div className="flex items-center gap-2.5">
//                         <FileText size={16} className="text-emerald-400" />
//                         <span className="font-semibold text-white text-sm truncate max-w-[180px]">{taskFile.name}</span>
//                       </div>
//                       <span className="text-xs text-slate-400">{(taskFile.size / 1024 / 1024).toFixed(2)} MB</span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//               <div className="p-5 border-t border-slate-800 flex justify-end gap-3 bg-slate-900">
//                 <button onClick={() => { setSelectedTask(null); setTaskFile(null); }}
//                   className="px-6 py-2.5 border border-slate-700 text-slate-300 rounded-xl font-semibold hover:bg-slate-800 transition text-sm">Bekor</button>
//                 <button onClick={handleTaskSubmit} disabled={!taskFile || isSubmittingTask}
//                   className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-sm transition flex items-center gap-2 disabled:opacity-40">
//                   {isSubmittingTask ? <><Spinner size={15} /> Yuborilmoqda...</> : <><Upload size={15} /> Topshirish</>}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   }