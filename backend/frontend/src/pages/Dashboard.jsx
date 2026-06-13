import React, { useEffect, useState, useMemo, useCallback, createContext, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import {
  BookOpen, Trophy, Moon, Sun, LogOut, LayoutDashboard, 
  Search, Settings, Zap, MessageSquare, MoreVertical, 
  Layers, GraduationCap, Send, User, Shield, Camera, 
  Mail, CheckCheck, Target, Award, PlayCircle, FileText, 
  CheckCircle2, AlertCircle
} from 'lucide-react';

// --- API KONFIGURATSIYASI ---
const API_BASE = 'http://127.0.0.1:8000/api'; 
const api = axios.create({ 
  baseURL: API_BASE, 
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - token qo'shish
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - xatolarni tutish
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      toast.error('Sessiya tugadi. Qayta kiring!');
      localStorage.clear();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme: () => setIsDarkMode(!isDarkMode) }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default function UltimateRealLMS() {
  return (
    <ThemeProvider>
      <RealLMSContent />
    </ThemeProvider>
  );
}

function RealLMSContent() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const scrollRef = useRef(null);

  // --- GLOBAL STATES ---
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  // Real Ma'lumotlar
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [tests, setTests] = useState([]);
  const [tasks, setTasks] = useState([]);

  // --- USER DATA ---
  const currentUser = useMemo(() => {
    const saved = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      id: saved.id || 0,
      full_name: saved.full_name || saved.username || "Foydalanuvchi",
      avatar: saved.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(saved.full_name || 'User')}&background=0D8ABC&color=fff`,
      phone: saved.phone || '',
      email: saved.email || ''
    };
  }, []);

  // --- CHAT STATES ---
  const [chatSearch, setChatSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // --- API DATA FETCHING (TO'G'IRLANDI) ---
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Ma\'lumotlar yuklanmoqda...');

      // Parallel ravishda barcha ma'lumotlarni olish
      const [coursesRes, modulesRes, testsRes, tasksRes] = await Promise.allSettled([
        api.get('/courses/'),          // Barcha kurslar
        api.get('/modules/'),           // Barcha modullar
        api.get('/tests/'),             // Barcha testlar
        api.get('/assignments/')        // Barcha vazifalar
      ]);

      // Har bir javobni tekshirish
      if (coursesRes.status === 'fulfilled') {
        const data = coursesRes.value.data;
        setCourses(Array.isArray(data) ? data : (data.results || []));
        console.log('✅ Kurslar:', coursesRes.value.data);
      } else {
        console.error('❌ Kurslar yuklanmadi:', coursesRes.reason);
      }

      if (modulesRes.status === 'fulfilled') {
        const data = modulesRes.value.data;
        setModules(Array.isArray(data) ? data : (data.results || []));
        console.log('✅ Modullar:', modulesRes.value.data);
      } else {
        console.error('❌ Modullar yuklanmadi:', modulesRes.reason);
      }

      if (testsRes.status === 'fulfilled') {
        const data = testsRes.value.data;
        setTests(Array.isArray(data) ? data : (data.results || []));
        console.log('✅ Testlar:', testsRes.value.data);
      } else {
        console.error('❌ Testlar yuklanmadi:', testsRes.reason);
      }

      if (tasksRes.status === 'fulfilled') {
        const data = tasksRes.value.data;
        setTasks(Array.isArray(data) ? data : (data.results || []));
        console.log('✅ Vazifalar:', tasksRes.value.data);
      } else {
        console.error('❌ Vazifalar yuklanmadi:', tasksRes.reason);
      }

      toast.success('Ma\'lumotlar yuklandi!');
    } catch (err) {
      console.error('❌ Dashboard ma\'lumotlari xatosi:', err);
      toast.error("Ma'lumotlarni yuklashda xatolik!");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }, []);

  useEffect(() => { 
    fetchDashboardData(); 
  }, [fetchDashboardData]);

  // --- USER QIDIRUV (TO'G'IRLANDI) ---
  const handleSearchUser = async () => {
    const searchValue = chatSearch.trim();
    
    if (!searchValue) {
      toast.error("ID kiriting!");
      return;
    }
  
    const searchToast = toast.loading("Qidirilmoqda...");
  
    try {
      console.log('🔍 User qidirilmoqda:', searchValue);
      
      // ID bo'yicha qidirish - Backend URL'ini moslashtiring
      const res = await api.get(`/users/${searchValue}/`);  // yoki /users/search/?id=123
      
      const foundUser = res.data;
      
      if (!foundUser || !foundUser.id) {
        toast.error("Foydalanuvchi topilmadi!", { id: searchToast });
        return;
      }

      console.log('✅ User topildi:', foundUser);

      // User ma'lumotlarini to'g'ri olish
      const userData = {
        id: foundUser.id,
        full_name: foundUser.full_name || foundUser.username || "Noma'lum",
        avatar: foundUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(foundUser.full_name || 'User')}&background=random`,
        status: foundUser.is_active ? "Online" : "Offline",
        phone: foundUser.phone || '',
        email: foundUser.email || ''
      };

      setSelectedUser(userData);
      toast.success(`${userData.full_name} topildi!`, { id: searchToast });

      // Xabarlar yuklanmoqda...
      await loadMessages(foundUser.id);

    } catch (err) {
      console.error("❌ User qidiruv xatosi:", err.response?.data || err);
      
      const errorMsg = err.response?.status === 404 
        ? "Foydalanuvchi topilmadi" 
        : err.response?.data?.detail || "Server xatosi";
      
      toast.error(errorMsg, { id: searchToast });
      setSelectedUser(null);
      setMessages([]);
    }
  };

  // --- XABARLARNI YUKLASH ---
  const loadMessages = async (userId) => {
    try {
      console.log('💬 Xabarlar yuklanmoqda:', userId);
      
      // Backend endpoint'ini moslashtiring
      const msgRes = await api.get(`/chat/messages/`, {
        params: { 
          receiver: userId,  // yoki with_user, opponent va h.k.
        }
      });

      const messagesData = Array.isArray(msgRes.data) 
        ? msgRes.data 
        : (msgRes.data.results || msgRes.data.messages || []);

      console.log('✅ Xabarlar yuklandi:', messagesData);

      // Xabarlarni formatlash
      const formattedMessages = messagesData.map(msg => ({
        id: msg.id,
        text: msg.content || msg.message || msg.text,
        sender: {
          id: msg.sender?.id || msg.sender_id || msg.from_user,
          full_name: msg.sender?.full_name || msg.sender?.username || 'User',
          avatar: msg.sender?.avatar || `https://ui-avatars.com/api/?name=User&background=random`,
        },
        time: new Date(msg.created_at || msg.timestamp).toLocaleTimeString('uz-UZ', {
          hour: '2-digit', 
          minute: '2-digit'
        })
      }));

      setMessages(formattedMessages);

    } catch (msgErr) {
      console.error("❌ Xabarlar yuklanmadi:", msgErr);
      setMessages([]);
      toast.error("Suhbat tarixi yuklanmadi");
    }
  };

  // --- XABAR YUBORISH (TO'G'IRLANDI) ---
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) {
      toast.error("Xabar kiriting!");
      return;
    }
  
    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      text: newMessage,
      sender: {
        id: currentUser.id,
        full_name: currentUser.full_name,
        avatar: currentUser.avatar
      },
      time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    };
  
    // Optimistik yangilash - darhol ko'rsatish
    setMessages(prev => [...prev, optimisticMsg]);
    const messageText = newMessage;
    setNewMessage("");
  
    try {
      console.log('📤 Xabar yuborilmoqda:', {
        receiver: selectedUser.id,
        content: messageText
      });

      // Backend endpoint'ini moslashtiring
      const payload = {
        receiver: selectedUser.id,     // yoki receiver_id, to_user
        content: messageText,           // yoki message, text
      };

      const res = await api.post('/chat/messages/', payload);  // yoki /chat/send/
      
      console.log('✅ Xabar yuborildi:', res.data);

      // Server javobini o'rnatish
      if (res.data) {
        setMessages(prev => 
          prev.map(m => 
            m.id === optimisticMsg.id 
              ? {
                  ...m,
                  id: res.data.id,
                  time: new Date(res.data.created_at || res.data.timestamp).toLocaleTimeString('uz-UZ', {
                    hour: '2-digit', minute: '2-digit'
                  })
                }
              : m
          )
        );
      }

      toast.success('Yuborildi!');
  
    } catch (err) {
      console.error("❌ Xabar yuborish xatosi:", err.response?.data || err);
      toast.error("Xabar yuborilmadi!");
      
      // Xatoli xabarni o'chirish
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setNewMessage(messageText); // Qaytarish
    }
  };

  // Auto-scroll yangi xabar kelganda
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (loading) return <PremiumLoader />;

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-[#020617] transition-all duration-500 overflow-hidden font-sans">
      <Toaster position="top-right" toastOptions={{
        duration: 3000,
        style: {
          background: isDarkMode ? '#1e293b' : '#fff',
          color: isDarkMode ? '#fff' : '#000',
        }
      }} />

      {/* --- SIDEBAR --- */}
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-24'} bg-white dark:bg-[#0f172a] border-r dark:border-slate-800 transition-all duration-300 flex flex-col z-50`}>
        <div className="h-24 flex items-center px-8 shrink-0">
          <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/40">
            <Zap className="text-white fill-current" size={24} />
          </div>
          {isSidebarOpen && (
            <h1 className="ml-4 font-black text-xl tracking-tighter uppercase italic">
              Elite<span className="text-blue-600">LMS</span>
            </h1>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto no-scrollbar">
          <SidebarItem icon={<LayoutDashboard />} label="Dashboard" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} open={isSidebarOpen} />
          <SidebarItem icon={<BookOpen />} label="Kurslarim" active={activeTab === 'courses'} onClick={() => setActiveTab('courses')} open={isSidebarOpen} />
          <SidebarItem icon={<Layers />} label="Modullar" active={activeTab === 'modules'} onClick={() => setActiveTab('modules')} open={isSidebarOpen} />
          <SidebarItem icon={<Trophy />} label="Testlar" active={activeTab === 'tests'} onClick={() => setActiveTab('tests')} open={isSidebarOpen} />
          <SidebarItem icon={<Target />} label="Vazifalar" active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} open={isSidebarOpen} />
          <SidebarItem icon={<MessageSquare />} label="Chat" active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} open={isSidebarOpen} />
          <div className="h-px bg-slate-100 dark:bg-slate-800 my-4 mx-2" />
          <SidebarItem icon={<Settings />} label="Sozlamalar" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} open={isSidebarOpen} />
        </nav>

        <div className="p-6">
          <button 
            onClick={() => {
              localStorage.clear(); 
              navigate('/login');
              toast.success('Tizimdan chiqdingiz');
            }} 
            className="w-full flex items-center gap-4 p-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all font-black text-sm"
          >
            <LogOut size={20} /> 
            {isSidebarOpen && "CHIQISH"}
          </button>
        </div>
      </aside>

      {/* --- MAIN --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-24 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border-b dark:border-slate-800 px-10 flex items-center justify-between z-40">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)} 
            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <MoreVertical className="rotate-90" />
          </button>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={toggleTheme} 
              className="p-3 rounded-2xl bg-white dark:bg-slate-800 border dark:border-slate-800 shadow-sm transition-all hover:scale-110"
            >
              {isDarkMode ? <Sun className="text-yellow-400" /> : <Moon className="text-blue-600" />}
            </button>
            
            <div className="flex items-center gap-4 border-l pl-6 dark:border-slate-800 font-black">
              <div className="text-right">
                <p className="text-sm">{currentUser.full_name}</p>
                <p className="text-[10px] text-blue-500 uppercase">ID: {currentUser.id}</p>
              </div>
              <img 
                src={currentUser.avatar} 
                className="w-12 h-12 rounded-2xl object-cover shadow-lg border-2 border-white dark:border-slate-700" 
                alt="profile" 
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-10">

            {/* DASHBOARD OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in duration-700">
                <div className="bg-gradient-to-br from-blue-700 via-indigo-800 to-purple-900 p-12 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
                  <div className="relative z-10 max-w-xl">
                    <h1 className="text-5xl font-black mb-4 leading-tight">
                      Salom, {currentUser.full_name.split(' ')[0]}!
                    </h1>
                    <p className="text-blue-100 text-lg opacity-80 mb-8 font-medium">
                      Platforma 100% Real API tizimiga muvaffaqiyatli ulandi.
                    </p>
                  </div>
                  <Trophy className="absolute -right-10 -bottom-10 w-96 h-96 text-white/10 rotate-12" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard icon={<BookOpen />} label="Kurslarim" value={courses.length} color="blue" />
                  <StatCard icon={<Layers />} label="Modullar" value={modules.length} color="purple" />
                  <StatCard icon={<Trophy />} label="Testlar" value={tests.length} color="orange" />
                  <StatCard icon={<CheckCircle2 />} label="Vazifalar" value={tasks.length} color="green" />
                </div>
              </div>
            )}

            {/* REAL COURSES FROM API */}
            {activeTab === 'courses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black">Kurslarim</h2>
                  <button 
                    onClick={fetchDashboardData}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                  >
                    Yangilash
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-bottom-10 duration-500">
                  {courses.length > 0 ? courses.map(course => (
                    <div 
                      key={course.id} 
                      className="bg-white dark:bg-[#0f172a] p-8 rounded-[2.5rem] border dark:border-slate-800 group hover:border-blue-600 transition-all shadow-sm hover:shadow-xl"
                    >
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition">
                        <PlayCircle size={32} />
                      </div>
                      <h3 className="text-xl font-black mb-2">{course.title || 'Kurs nomi'}</h3>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
                        Ustoz: {course.teacher?.full_name || course.instructor_name || 'Admin'}
                      </p>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs font-black">
                          <span>PROGRESS</span>
                          <span className="text-blue-600">{course.progress || 0}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 transition-all duration-500" 
                            style={{ width: `${course.progress || 0}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full">
                      <EmptyState message="Hech qanday kurs topilmadi" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* REAL MODULES FROM API */}
            {activeTab === 'modules' && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-black">Modullar</h2>
                  <button 
                    onClick={fetchDashboardData}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                  >
                    Yangilash
                  </button>
                </div>
                
                {modules.length > 0 ? modules.map(mod => (
                  <div 
                    key={mod.id} 
                    className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border dark:border-slate-800 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-black">
                        <GraduationCap size={20} />
                      </div>
                      <div>
                        <h4 className="font-black text-lg">{mod.title || mod.name || 'Modul'}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase">
                          Kurs: {mod.course?.title || mod.course_name || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-xl font-black text-[10px] hover:bg-blue-700 transition uppercase tracking-widest">
                      O'tish
                    </button>
                  </div>
                )) : (
                  <EmptyState message="Modullar topilmadi" />
                )}
              </div>
            )}

            {/* TESTS */}
            {activeTab === 'tests' && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-black">Testlar</h2>
                  <button 
                    onClick={fetchDashboardData}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                  >
                    Yangilash
                  </button>
                </div>
                
                {tests.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tests.map(test => (
                      <div 
                        key={test.id} 
                        className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border dark:border-slate-800 hover:border-orange-600 transition"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center">
                            <Trophy size={20} />
                          </div>
                          <span className="text-xs font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
                            {test.duration || '30'} min
                          </span>
                        </div>
                        <h4 className="font-black text-lg mb-2">{test.title || 'Test'}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                          {test.description || 'Test tavsifi'}
                        </p>
                        <button className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition">
                          Boshlash
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="Testlar topilmadi" />
                )}
              </div>
            )}

            {/* TASKS */}
            {activeTab === 'tasks' && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-black">Vazifalar</h2>
                  <button 
                    onClick={fetchDashboardData}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                  >
                    Yangilash
                  </button>
                </div>
                
                {tasks.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {tasks.map(task => (
                      <div 
                        key={task.id} 
                        className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border dark:border-slate-800 hover:border-green-600 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                              <FileText size={20} />
                            </div>
                            <div>
                              <h4 className="font-black text-lg">{task.title || 'Vazifa'}</h4>
                              <p className="text-xs text-slate-400">
                                Muddat: {task.deadline ? new Date(task.deadline).toLocaleDateString('uz-UZ') : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <button className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition">
                            Topshirish
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="Vazifalar topilmadi" />
                )}
              </div>
            )}

            {/* REAL CHAT ID SYSTEM */}
            {activeTab === 'chat' && (
              <div className="h-[650px] bg-white dark:bg-[#0f172a] rounded-[3.5rem] border dark:border-slate-800 flex overflow-hidden shadow-2xl animate-in fade-in duration-500">
                {/* LEFT SIDEBAR - SEARCH */}
                <div className="w-80 border-r dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-transparent">
                  <div className="p-8 border-b dark:border-slate-800">
                    <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-6 italic">
                      ID bo'yicha qidirish
                    </h3>
                    <div className="relative">
                      <input 
                        value={chatSearch} 
                        onChange={(e) => setChatSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                        placeholder="User ID kiriting..."
                        className="w-full bg-white dark:bg-slate-800 border-none rounded-2xl p-5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
                      />
                      <button 
                        onClick={handleSearchUser} 
                        className="absolute right-2 top-2 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
                      >
                        <Search size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-6 space-y-4 overflow-y-auto no-scrollbar">
                    {selectedUser ? (
                      <div className="p-5 bg-blue-600 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/30 flex items-center gap-4 border border-blue-400/20 animate-in slide-in-from-left-4">
                        <img 
                          src={selectedUser.avatar} 
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-white/20" 
                          alt={selectedUser.full_name} 
                        />
                        <div>
                          <p className="text-sm font-black">{selectedUser.full_name}</p>
                          <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">
                            ID: {selectedUser.id}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-20 opacity-30">
                        <User size={48} className="mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                          ID kiriting
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT - CHAT AREA */}
                <div className="flex-1 flex flex-col relative bg-white dark:bg-[#0f172a]">
                  {selectedUser ? (
                    <>
                      {/* HEADER */}
                      <div className="p-8 border-b dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img 
                            src={selectedUser.avatar} 
                            className="w-14 h-14 rounded-2xl shadow-md object-cover" 
                            alt={selectedUser.full_name} 
                          />
                          <div>
                            <h4 className="font-black text-lg">{selectedUser.full_name}</h4>
                            <p className="text-xs text-green-500 font-bold flex items-center gap-1.5 uppercase">
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> 
                              {selectedUser.status}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* MESSAGES */}
                      <div 
                        ref={scrollRef} 
                        className="flex-1 p-8 overflow-y-auto space-y-8 custom-scrollbar bg-slate-50/20 dark:bg-transparent"
                      >
                        {messages.length > 0 ? messages.map((m) => {
                          const isMe = m.sender.id === currentUser.id;
                          
                          return (
                            <div 
                              key={m.id} 
                              className={`flex gap-4 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                              <img 
                                src={m.sender.avatar} 
                                className="w-10 h-10 rounded-xl object-cover self-end shadow-sm" 
                                alt={m.sender.full_name} 
                              />
                              <div className="max-w-[70%] group">
                                <div className={`p-5 rounded-[2.2rem] text-sm font-medium shadow-sm ${
                                  isMe 
                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                    : 'bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-bl-none'
                                }`}>
                                  {m.text}
                                  <div className="flex items-center justify-end gap-1.5 mt-2 opacity-50">
                                    <span className="text-[9px] font-black">{m.time}</span>
                                    {isMe && <CheckCheck size={14} />}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }) : (
                          <p className="text-center text-xs text-slate-400 font-bold uppercase mt-10">
                            Suhbatni boshlang...
                          </p>
                        )}
                      </div>
                      
                      {/* INPUT */}
                      <div className="p-8 border-t dark:border-slate-800 flex gap-4">
                        <input 
                          value={newMessage} 
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="Xabarni yozing..." 
                          className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-8 py-5 font-bold focus:ring-2 focus:ring-blue-600 outline-none" 
                        />
                        <button 
                          onClick={sendMessage} 
                          className="p-5 bg-blue-600 text-white rounded-2xl hover:scale-105 transition shadow-lg shadow-blue-500/30"
                        >
                          <Send size={24} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                      <MessageSquare size={80} className="opacity-10 mb-6" />
                      <h3 className="text-xl font-black uppercase tracking-[0.4em]">Xabarlar</h3>
                      <p className="text-sm mt-2 opacity-50">ID kiriting va qidiring</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <h2 className="text-3xl font-black mb-6">Sozlamalar</h2>
                <div className="bg-white dark:bg-[#0f172a] p-8 rounded-3xl border dark:border-slate-800">
                  <h3 className="font-black text-lg mb-4">Profil ma'lumotlari</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b dark:border-slate-800">
                      <span className="font-bold text-slate-600 dark:text-slate-400">ID</span>
                      <span className="font-black">{currentUser.id}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b dark:border-slate-800">
                      <span className="font-bold text-slate-600 dark:text-slate-400">Ism</span>
                      <span className="font-black">{currentUser.full_name}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b dark:border-slate-800">
                      <span className="font-bold text-slate-600 dark:text-slate-400">Telefon</span>
                      <span className="font-black">{currentUser.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="font-bold text-slate-600 dark:text-slate-400">Email</span>
                      <span className="font-black">{currentUser.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}

// --- YORDAMCHI KOMPONENTLAR ---
const SidebarItem = ({ icon, label, active, onClick, open }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${
      active 
        ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' 
        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`}
  >
    <span className={active ? 'scale-110' : 'group-hover:scale-110 transition-all'}>{icon}</span>
    {open && <span className="font-black text-sm tracking-tight">{label}</span>}
  </button>
);

const StatCard = ({ icon, label, value, color }) => {
  const styles = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    purple: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
    orange: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
    green: "text-green-600 bg-green-50 dark:bg-green-900/20"
  };
  
  return (
    <div className="bg-white dark:bg-[#0f172a] p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-sm flex flex-col items-center text-center hover:shadow-xl transition">
      <div className={`${styles[color]} w-14 h-14 rounded-2xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="col-span-full py-20 bg-white dark:bg-[#0f172a] rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center">
    <AlertCircle size={48} className="text-slate-200 dark:text-slate-700 mb-4" />
    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{message}</p>
  </div>
);

const PremiumLoader = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-[#020617]">
    <div className="relative w-24 h-24 mb-10">
      <div className="absolute inset-0 border-[8px] border-blue-600/10 rounded-[2.5rem]" />
      <div className="absolute inset-0 border-[8px] border-blue-600 rounded-[2.5rem] animate-spin border-t-transparent shadow-2xl shadow-blue-600/20" />
      <Zap size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 animate-pulse" />
    </div>
    <h2 className="text-[10px] font-black tracking-[0.6em] text-slate-400 uppercase animate-pulse italic">
      Elite LMS Real-Time System
    </h2>
  </div>
);