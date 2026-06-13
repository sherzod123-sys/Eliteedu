import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, Layers, Bell,
  PlusCircle, Search, X, Edit3, Trash2, Loader2, ChevronRight,
  Settings, LogOut, Zap, BarChart3, UserCheck, UserX, CheckCircle,
  Eye, TrendingUp, DollarSign, Wallet, Sun, Moon, Monitor, Shield,
  AlertCircle, Info, CheckSquare, Send, MessageSquare, Filter,
  ToggleLeft, ToggleRight, Tag, FileText, Video, Clock, Star,
  ArrowUpRight, RefreshCw, MoreVertical, ChevronDown, ChevronUp,
  Package, Radio
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosConfig';

// ─────────────────────────────────────────────────────────────────────────────
// THEMES — same palette logic as TeacherDashboard
// ─────────────────────────────────────────────────────────────────────────────
const THEMES = {
  light: {
    name: "Yorug'", icon: Sun,
    bg: 'bg-[#F8FAFC]', sidebar: 'bg-white border-slate-100',
    card: 'bg-white border-slate-100', cardHover: 'hover:shadow-2xl hover:shadow-indigo-500/10',
    text: 'text-slate-900', textMuted: 'text-slate-400',
    input: 'bg-slate-50 border-transparent focus:border-indigo-100 focus:bg-white',
    tableHead: 'bg-slate-50/50', tableRow: 'hover:bg-slate-50/30',
    accent: 'bg-indigo-600', accentText: 'text-indigo-600',
    divider: 'border-slate-100',
    sidebarActive: 'bg-slate-900 text-white shadow-xl shadow-slate-200',
    sidebarInactive: 'text-slate-400 hover:bg-slate-50 hover:text-slate-600',
    badge: 'bg-red-500',
  },
  dark: {
    name: "Qorong'u", icon: Moon,
    bg: 'bg-[#0F1117]', sidebar: 'bg-[#1A1D27] border-slate-800',
    card: 'bg-[#1A1D27] border-slate-800', cardHover: 'hover:shadow-2xl hover:shadow-indigo-500/20',
    text: 'text-slate-100', textMuted: 'text-slate-500',
    input: 'bg-[#252836] border-transparent focus:border-indigo-500/30 text-slate-100',
    tableHead: 'bg-[#252836]', tableRow: 'hover:bg-[#252836]/50',
    accent: 'bg-indigo-600', accentText: 'text-indigo-400',
    divider: 'border-slate-800',
    sidebarActive: 'bg-indigo-600 text-white shadow-xl shadow-indigo-900',
    sidebarInactive: 'text-slate-500 hover:bg-slate-800 hover:text-slate-300',
    badge: 'bg-red-500',
  },
  purple: {
    name: 'Binafsha', icon: Monitor,
    bg: 'bg-[#F5F3FF]', sidebar: 'bg-white border-purple-100',
    card: 'bg-white border-purple-100', cardHover: 'hover:shadow-2xl hover:shadow-purple-500/10',
    text: 'text-slate-900', textMuted: 'text-slate-400',
    input: 'bg-purple-50 border-transparent focus:border-purple-200 focus:bg-white',
    tableHead: 'bg-purple-50/50', tableRow: 'hover:bg-purple-50/30',
    accent: 'bg-purple-600', accentText: 'text-purple-600',
    divider: 'border-purple-50',
    sidebarActive: 'bg-purple-700 text-white shadow-xl shadow-purple-200',
    sidebarInactive: 'text-slate-400 hover:bg-purple-50 hover:text-purple-600',
    badge: 'bg-red-500',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const avatarLetter = (name) => (name || '?').charAt(0).toUpperCase();
const fmtNumber = (n) => new Intl.NumberFormat('uz-UZ').format(n || 0);
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('uz-UZ') : '—';

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [theme, setTheme] = useState('light');
  const T = THEMES[theme];

  // ── DATA STATES ──────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recentActivity, setRecentActivity] = useState({ recent_enrollments: [], new_users: [] });

  // ── UI STATES ────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [modalType, setModalType] = useState(null); // 'student' | 'teacher' | 'course' | 'module' | 'notify' | 'category'
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCourseForModules, setSelectedCourseForModules] = useState(null);
  const [enrollFilter, setEnrollFilter] = useState('all');
  const [expandedRows, setExpandedRows] = useState({});

  // ── FORM STATES ──────────────────────────────────────────────
  const emptyUser = { username: '', email: '', first_name: '', last_name: '', phone: '', bio: '', password: '', password_confirm: '', is_active: true };
  const emptyCourse = { title: '', teacher: '', category: '', price: '', discount_price: '', level: 'beginner', short_description: '', description: '', status: 'published' };
  const emptyModule = { course: '', title: '', description: '', order: 0, duration: 0, is_free: false, video_url: '' };
  const emptyNotify = { recipient: '', recipient_role: '', title: '', message: '', notification_type: 'info' };
  const emptyCategory = { name: '', slug: '' };

  const [userForm, setUserForm] = useState(emptyUser);
  const [courseForm, setCourseForm] = useState(emptyCourse);
  const [moduleForm, setModuleForm] = useState(emptyModule);
  const [notifyForm, setNotifyForm] = useState(emptyNotify);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);

  // ── FETCH ALL DATA ───────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsR, studR, teachR, courseR, enrollR, catR, notifR, actR] = await Promise.all([
        axiosInstance.get('/api/admin/stats/').catch(() => ({ data: {} })),
        axiosInstance.get('/api/admin/students/').catch(() => ({ data: { results: [] } })),
        axiosInstance.get('/api/admin/teachers/').catch(() => ({ data: { results: [] } })),
        axiosInstance.get('/api/admin/courses/').catch(() => ({ data: { results: [] } })),
        axiosInstance.get('/api/admin/enrollments/').catch(() => ({ data: { results: [] } })),
        axiosInstance.get('/api/admin/categories/').catch(() => ({ data: [] })),
        axiosInstance.get('/api/admin/notifications/').catch(() => ({ data: { results: [] } })),
        axiosInstance.get('/api/admin/activity/').catch(() => ({ data: { recent_enrollments: [], new_users: [] } })),
      ]);
      setStats(statsR.data);
      setStudents(studR.data.results ?? studR.data ?? []);
      setTeachers(teachR.data.results ?? teachR.data ?? []);
      setCourses(courseR.data.results ?? courseR.data ?? []);
      setEnrollments(enrollR.data.results ?? enrollR.data ?? []);
      setCategories(catR.data.results ?? catR.data ?? []);
      setNotifications(notifR.data.results ?? notifR.data ?? []);
      setRecentActivity(actR.data);
    } catch (err) {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Fetch modules when courses change or module tab opens
  const fetchModules = useCallback(async (courseId = '') => {
    try {
      const url = courseId ? `/api/admin/modules/?course_id=${courseId}` : '/api/admin/modules/';
      const res = await axiosInstance.get(url);
      setModules(res.data.results ?? res.data ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    if (activeTab === 'modules') fetchModules(selectedCourseForModules || '');
  }, [activeTab, selectedCourseForModules]);

  // ── OPEN MODAL HELPER ────────────────────────────────────────
  const openModal = (type, item = null) => {
    setEditingItem(item);
    setModalType(type);
    if (type === 'student' || type === 'teacher') {
      setUserForm(item ? { ...item, password: '', password_confirm: '' } : emptyUser);
    } else if (type === 'course') {
      setCourseForm(item ? { title: item.title, teacher: item.teacher, category: item.category, price: item.price, discount_price: item.discount_price || '', level: item.level, short_description: item.short_description, description: item.description, status: item.status } : emptyCourse);
    } else if (type === 'module') {
      setModuleForm(item ? { course: item.course, title: item.title, description: item.description, order: item.order, duration: item.duration, is_free: item.is_free, video_url: item.video_url || '' } : { ...emptyModule, course: selectedCourseForModules || '' });
    } else if (type === 'notify') {
      setNotifyForm(emptyNotify);
    } else if (type === 'category') {
      setCategoryForm(item ? { name: item.name, slug: item.slug } : emptyCategory);
    }
  };

  const closeModal = () => { setModalType(null); setEditingItem(null); };

  // ─────────────────────────────────────────────────────────────
  // CRUD ACTIONS
  // ─────────────────────────────────────────────────────────────

  // ── 1. STUDENT / TEACHER SAVE ────────────────────────────────
  const saveUser = async (e, role) => {
    e.preventDefault();
    if (!editingItem && userForm.password !== userForm.password_confirm) {
      return toast.error("Parollar mos kelmadi!");
    }
    setIsSubmitting(true);
    try {
      const endpoint = role === 'student' ? '/api/admin/students/' : '/api/admin/teachers/';
      if (editingItem) {
        const payload = { ...userForm };
        if (!payload.password) delete payload.password;
        delete payload.password_confirm;
        await axiosInstance.patch(`${endpoint}${editingItem.id}/`, payload);
        toast.success(`${role === 'student' ? 'Talaba' : "O'qituvchi"} yangilandi`);
      } else {
        await axiosInstance.post(endpoint, userForm);
        toast.success(`${role === 'student' ? 'Yangi talaba' : "Yangi o'qituvchi"} qo'shildi! ✓`);
      }
      closeModal();
      fetchAll();
    } catch (err) {
      const errData = err.response?.data;
      const msg = errData?.username?.[0] || errData?.email?.[0] || errData?.detail || "Xatolik yuz berdi";
      toast.error(msg);
    } finally { setIsSubmitting(false); }
  };

  // ── 2. DELETE USER ───────────────────────────────────────────
  const deleteUser = async (id, role) => {
    if (!window.confirm("O'chirishga aminmisiz?")) return;
    const endpoint = role === 'student' ? `/api/admin/students/${id}/` : `/api/admin/teachers/${id}/`;
    try {
      await axiosInstance.delete(endpoint);
      toast.success("O'chirildi");
      if (role === 'student') setStudents(p => p.filter(u => u.id !== id));
      else setTeachers(p => p.filter(u => u.id !== id));
    } catch { toast.error("O'chirishda xatolik"); }
  };

  // ── 3. TOGGLE USER ACTIVE ────────────────────────────────────
  const toggleActive = async (id, role) => {
    if (actionLoadingId === id) return;
    setActionLoadingId(id);
    try {
      const res = await axiosInstance.post(`/api/admin/${role === 'student' ? 'students' : 'teachers'}/${id}/toggle/`);
      const msg = res.data.message || (res.data.is_active ? 'Faollashtirildi' : 'Bloklandi');
      toast.success(msg);
      if (role === 'student') setStudents(p => p.map(u => u.id === id ? { ...u, is_active: res.data.is_active } : u));
      else setTeachers(p => p.map(u => u.id === id ? { ...u, is_active: res.data.is_active } : u));
    } catch { toast.error("Xatolik"); }
    finally { setActionLoadingId(null); }
  };

  // ── 4. SAVE COURSE ───────────────────────────────────────────
  const saveCourse = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await axiosInstance.patch(`/api/admin/courses/${editingItem.id}/`, courseForm);
        toast.success("Kurs yangilandi");
      } else {
        await axiosInstance.post('/api/admin/courses/', courseForm);
        toast.success("Kurs qo'shildi ✓");
      }
      closeModal(); fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Kursni saqlashda xatolik");
    } finally { setIsSubmitting(false); }
  };

  // ── 5. DELETE COURSE ─────────────────────────────────────────
  const deleteCourse = async (id) => {
    if (!window.confirm("Kursni o'chirishga aminmisiz?")) return;
    try {
      await axiosInstance.delete(`/api/admin/courses/${id}/`);
      toast.success("Kurs o'chirildi");
      setCourses(p => p.filter(c => c.id !== id));
    } catch { toast.error("O'chirishda xatolik"); }
  };

  // ── 6. SAVE MODULE ───────────────────────────────────────────
  const saveModule = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await axiosInstance.patch(`/api/admin/modules/${editingItem.id}/`, moduleForm);
        toast.success("Modul yangilandi");
      } else {
        await axiosInstance.post('/api/admin/modules/', moduleForm);
        toast.success("Modul qo'shildi ✓");
      }
      closeModal(); fetchModules(selectedCourseForModules || '');
    } catch (err) {
      toast.error(err.response?.data?.detail || "Modulni saqlashda xatolik");
    } finally { setIsSubmitting(false); }
  };

  // ── 7. DELETE MODULE ─────────────────────────────────────────
  const deleteModule = async (id) => {
    if (!window.confirm("Modulni o'chirishga aminmisiz?")) return;
    try {
      await axiosInstance.delete(`/api/admin/modules/${id}/`);
      toast.success("Modul o'chirildi");
      setModules(p => p.filter(m => m.id !== id));
    } catch { toast.error("O'chirishda xatolik"); }
  };

  // ── 8. SEND NOTIFICATION ─────────────────────────────────────
  const sendNotification = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...notifyForm };
      if (!payload.recipient) delete payload.recipient;
      if (!payload.recipient_role) delete payload.recipient_role;
      const res = await axiosInstance.post('/api/admin/notifications/send/', payload);
      toast.success(`${res.data.sent_count} ta xabar yuborildi ✓`);
      closeModal(); fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || "Xabar yuborishda xatolik");
    } finally { setIsSubmitting(false); }
  };

  // ── 9. SAVE CATEGORY ─────────────────────────────────────────
  const saveCategory = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await axiosInstance.patch(`/api/admin/categories/${editingItem.id}/`, categoryForm);
        toast.success("Kategoriya yangilandi");
      } else {
        await axiosInstance.post('/api/admin/categories/', categoryForm);
        toast.success("Kategoriya qo'shildi ✓");
      }
      closeModal(); fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Xatolik yuz berdi");
    } finally { setIsSubmitting(false); }
  };

  // ── 10. DELETE CATEGORY ──────────────────────────────────────
  const deleteCategory = async (id) => {
    if (!window.confirm("Kategoriyani o'chirishga aminmisiz?")) return;
    try {
      await axiosInstance.delete(`/api/admin/categories/${id}/`);
      toast.success("Kategoriya o'chirildi");
      setCategories(p => p.filter(c => c.id !== id));
    } catch { toast.error("O'chirishda xatolik"); }
  };

  // ─────────────────────────────────────────────────────────────
  // FILTERED LISTS
  // ─────────────────────────────────────────────────────────────
  const q = searchQuery.toLowerCase();
  const filteredStudents = students.filter(s =>
    s.username?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) ||
    (s.first_name + ' ' + s.last_name).toLowerCase().includes(q)
  );
  const filteredTeachers = teachers.filter(t =>
    t.username?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q) ||
    (t.first_name + ' ' + t.last_name).toLowerCase().includes(q)
  );
  const filteredCourses = courses.filter(c =>
    c.title?.toLowerCase().includes(q) || c.teacher_name?.toLowerCase().includes(q)
  );
  const filteredEnrollments = enrollments.filter(en =>
    (enrollFilter === 'all' || en.status === enrollFilter)
  );

  // ─────────────────────────────────────────────────────────────
  // UI COMPONENTS
  // ─────────────────────────────────────────────────────────────

  const SidebarLink = ({ id, icon: Icon, label, badge }) => (
    <button onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black italic uppercase text-xs tracking-widest transition-all duration-300 relative
        ${activeTab === id ? T.sidebarActive + ' translate-x-2' : T.sidebarInactive}`}>
      <Icon size={18} /> <span>{label}</span>
      {badge > 0 && (
        <span className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${T.badge} text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse`}>
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );

  const StatCard = ({ icon: Icon, label, value, color, sub }) => (
    <div className={`${T.card} border p-10 rounded-[3rem] shadow-sm ${T.cardHover} transition-all group`}>
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
        <Icon size={26} className="text-white" />
      </div>
      <p className={`font-black uppercase italic text-[10px] tracking-widest mb-2 ${T.textMuted}`}>{label}</p>
      <h3 className={`text-5xl font-black italic tracking-tighter ${T.text}`}>{value}</h3>
      {sub && <p className={`text-[10px] font-bold mt-2 ${T.textMuted}`}>{sub}</p>}
    </div>
  );

  const StatusBadge = ({ type }) => {
    const map = {
      accepted: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700',
      pending: 'bg-amber-100 text-amber-700', published: 'bg-blue-100 text-blue-700',
      draft: 'bg-slate-100 text-slate-500', beginner: 'bg-blue-50 text-blue-600',
      intermediate: 'bg-indigo-100 text-indigo-600', advanced: 'bg-purple-100 text-purple-700',
      info: 'bg-blue-100 text-blue-700', success: 'bg-emerald-100 text-emerald-700',
      warning: 'bg-amber-100 text-amber-700', error: 'bg-red-100 text-red-700',
    };
    const labels = {
      accepted: 'Qabul', rejected: 'Rad', pending: 'Kutmoqda', published: 'Nashr',
      draft: 'Qoralama', beginner: 'Boshlang\'ich', intermediate: 'O\'rta', advanced: 'Yuqori',
      info: 'Ma\'lumot', success: 'Muvaffaqiyat', warning: 'Ogohlantirish', error: 'Xato',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight ${map[type] || 'bg-slate-100 text-slate-500'}`}>
        {labels[type] || type}
      </span>
    );
  };

  const TableHeader = ({ cols }) => (
    <thead>
      <tr className={T.tableHead}>
        {cols.map(c => (
          <th key={c} className={`p-6 font-black uppercase italic tracking-widest text-[10px] ${T.textMuted} text-left`}>{c}</th>
        ))}
      </tr>
    </thead>
  );

  const ActionBtn = ({ onClick, icon: Icon, color = 'indigo', label }) => (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase italic tracking-wide transition-all hover:scale-105 active:scale-95
        ${color === 'red' ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' :
          color === 'emerald' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white' :
          color === 'amber' ? 'bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white' :
          'bg-indigo-50 text-indigo-600 hover:bg-indigo-500 hover:text-white'}`}>
      <Icon size={12} /> {label}
    </button>
  );

  // ─────────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={`h-screen flex flex-col items-center justify-center ${T.bg}`}>
        <Loader2 className={`animate-spin mb-4 ${T.accentText}`} size={48} />
        <p className={`font-black italic uppercase tracking-[0.3em] animate-pulse ${T.textMuted}`}>
          Admin paneli yuklanmoqda...
        </p>
      </div>
    );
  }

  const pendingEnrollCount = enrollments.filter(e => e.status === 'pending').length;

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen ${T.bg} flex font-sans`}>
      <Toaster position="top-right" />

      {/* ─── SIDEBAR ──────────────────────────────────────────── */}
      <aside className={`w-80 ${T.sidebar} border-r flex flex-col sticky top-0 h-screen z-50`}>
        <div className="p-12">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${T.accent} rounded-2xl flex items-center justify-center shadow-2xl`}>
              <Shield className="text-white" size={24} />
            </div>
            <span className={`text-2xl font-black italic tracking-tighter uppercase ${T.text}`}>
              ADMIN<span className={T.accentText}>PRO</span>
            </span>
          </div>
          <div className={`mt-4 px-3 py-2 rounded-xl text-[10px] font-black uppercase italic tracking-widest ${T.accent} text-white opacity-80`}>
            Super Admin Panel
          </div>
        </div>

        <nav className="flex-1 px-8 space-y-2 overflow-y-auto">
          <SidebarLink id="overview"      icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink id="students"      icon={GraduationCap}   label="Talabalar" />
          <SidebarLink id="teachers"      icon={Users}           label="O'qituvchilar" />
          <SidebarLink id="courses"       icon={BookOpen}        label="Kurslar" />
          <SidebarLink id="modules"       icon={Layers}          label="Modullar" />
          <SidebarLink id="enrollments"   icon={UserCheck}       label="Yozilishlar" badge={pendingEnrollCount} />
          <SidebarLink id="categories"    icon={Tag}             label="Kategoriyalar" />
          <SidebarLink id="notifications" icon={Bell}            label="Xabarlar" />
          <SidebarLink id="settings"      icon={Settings}        label="Sozlamalar" />
        </nav>

        <div className={`p-8 border-t ${T.divider}`}>
          {/* Theme quick switcher */}
          <div className="flex gap-2 mb-4">
            {Object.entries(THEMES).map(([key, t]) => {
              const Icon = t.icon;
              return (
                <button key={key} onClick={() => setTheme(key)}
                  className={`flex-1 p-2 rounded-xl transition-all ${theme === key ? `${T.accent} text-white` : `${T.sidebarInactive} rounded-xl`}`}>
                  <Icon size={16} className="mx-auto" />
                </button>
              );
            })}
          </div>
          <button className={`w-full flex items-center gap-4 p-3 font-black italic uppercase text-xs hover:text-red-500 transition-colors ${T.textMuted}`}>
            <LogOut size={18} /> <span>Tizimdan Chiqish</span>
          </button>
        </div>
      </aside>

      {/* ─── MAIN ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-x-hidden p-10 lg:p-16">

        {/* ── HEADER ── */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-14">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className={`w-10 h-1.5 ${T.accent} rounded-full`}></span>
              <p className={`font-black uppercase italic tracking-[0.3em] text-[10px] ${T.accentText}`}>Admin Boshqaruv Paneli</p>
            </div>
            <h1 className={`text-6xl font-black italic tracking-tighter uppercase leading-tight ${T.text}`}>
              {activeTab === 'overview' ? 'Statistika' :
               activeTab === 'students' ? 'Talabalar' :
               activeTab === 'teachers' ? "O'qituvchilar" :
               activeTab === 'courses' ? 'Kurslar' :
               activeTab === 'modules' ? 'Modullar' :
               activeTab === 'enrollments' ? 'Yozilishlar' :
               activeTab === 'categories' ? 'Kategoriyalar' :
               activeTab === 'notifications' ? 'Xabarlar' : 'Sozlamalar'}
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            {['students','teachers','courses'].includes(activeTab) && (
              <div className="relative flex-1 lg:w-72">
                <Search className={`absolute left-5 top-1/2 -translate-y-1/2 ${T.textMuted}`} size={18} />
                <input type="text" placeholder="Qidirish..."
                  className={`w-full border-2 py-4 pl-13 pr-6 rounded-3xl outline-none font-bold transition-all ${T.input} ${T.text}`}
                  style={{ paddingLeft: '3rem' }}
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
            )}

            {/* Add Button */}
            {activeTab === 'students' && (
              <button onClick={() => openModal('student')}
                className={`${T.accent} text-white px-8 py-4 rounded-3xl font-black italic uppercase tracking-wider shadow-xl hover:opacity-90 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap`}>
                <PlusCircle size={20} /> Talaba Qo'shish
              </button>
            )}
            {activeTab === 'teachers' && (
              <button onClick={() => openModal('teacher')}
                className={`${T.accent} text-white px-8 py-4 rounded-3xl font-black italic uppercase tracking-wider shadow-xl hover:opacity-90 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap`}>
                <PlusCircle size={20} /> O'qituvchi Qo'shish
              </button>
            )}
            {activeTab === 'courses' && (
              <button onClick={() => openModal('course')}
                className={`${T.accent} text-white px-8 py-4 rounded-3xl font-black italic uppercase tracking-wider shadow-xl hover:opacity-90 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap`}>
                <PlusCircle size={20} /> Kurs Qo'shish
              </button>
            )}
            {activeTab === 'modules' && (
              <button onClick={() => openModal('module')}
                className={`${T.accent} text-white px-8 py-4 rounded-3xl font-black italic uppercase tracking-wider shadow-xl hover:opacity-90 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap`}>
                <PlusCircle size={20} /> Modul Qo'shish
              </button>
            )}
            {activeTab === 'categories' && (
              <button onClick={() => openModal('category')}
                className={`${T.accent} text-white px-8 py-4 rounded-3xl font-black italic uppercase tracking-wider shadow-xl hover:opacity-90 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap`}>
                <PlusCircle size={20} /> Kategoriya
              </button>
            )}
            {activeTab === 'notifications' && (
              <button onClick={() => openModal('notify')}
                className={`${T.accent} text-white px-8 py-4 rounded-3xl font-black italic uppercase tracking-wider shadow-xl hover:opacity-90 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap`}>
                <Send size={20} /> Xabar Yuborish
              </button>
            )}

            {/* Refresh */}
            <button onClick={fetchAll}
              className={`p-4 rounded-3xl border-2 ${T.card} ${T.text} hover:border-indigo-400 transition-all`}>
              <RefreshCw size={20} />
            </button>
          </div>
        </header>

        {/* ════════════════════════════════════════════════════════
            TAB: OVERVIEW
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-14 animate-in fade-in slide-in-from-bottom-8 duration-700">

            {/* Stat Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
              <StatCard icon={GraduationCap} label="Jami Talabalar"    value={fmtNumber(stats.total_students)}   color="bg-blue-500"    sub={`+${stats.new_students_this_month || 0} bu oy`} />
              <StatCard icon={Users}         label="O'qituvchilar"     value={fmtNumber(stats.total_teachers)}   color="bg-violet-500"  sub={`+${stats.new_teachers_this_month || 0} bu oy`} />
              <StatCard icon={BookOpen}      label="Jami Kurslar"      value={fmtNumber(stats.total_courses)}    color="bg-indigo-600"  sub={`${stats.published_courses || 0} ta nashr`} />
              <StatCard icon={Layers}        label="Modullar"          value={fmtNumber(stats.total_modules)}    color="bg-cyan-500" />
              <StatCard icon={UserCheck}     label="Yozilishlar"       value={fmtNumber(stats.total_enrollments)} color="bg-emerald-500" sub={`${stats.pending_enrollments || 0} ta kutmoqda`} />
              <StatCard icon={DollarSign}    label="Umumiy Daromad"    value={`${fmtNumber(stats.total_revenue)} UZS`} color="bg-amber-500" />
              <StatCard icon={Tag}           label="Kategoriyalar"     value={fmtNumber(categories.length)}      color="bg-rose-500" />
              <StatCard icon={Bell}          label="Yuborilgan Xabarlar" value={fmtNumber(notifications.length)} color="bg-slate-700" />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              {/* Recent Enrollments */}
              <div className={`${T.card} border rounded-[3rem] p-10 shadow-sm`}>
                <div className="flex justify-between items-center mb-8">
                  <h4 className={`text-2xl font-black italic uppercase tracking-tighter ${T.text}`}>So'nggi Yozilishlar</h4>
                  <button onClick={() => setActiveTab('enrollments')} className={`text-[10px] font-black uppercase italic ${T.accentText} flex items-center gap-1 hover:underline`}>
                    Barchasi <ChevronRight size={14} />
                  </button>
                </div>
                <div className="space-y-4">
                  {(recentActivity.recent_enrollments || []).slice(0, 6).map((en, i) => (
                    <div key={en.id || i} className={`flex items-center justify-between p-5 ${T.tableRow} rounded-2xl transition-all`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${T.accent} rounded-xl flex items-center justify-center font-black text-white italic text-lg shadow-md`}>
                          {avatarLetter(en.student_name)}
                        </div>
                        <div>
                          <p className={`font-black italic uppercase text-sm ${T.text}`}>{en.student_name}</p>
                          <p className={`text-[10px] font-bold uppercase tracking-widest ${T.textMuted}`}>{en.course_title?.slice(0, 28)}</p>
                        </div>
                      </div>
                      <StatusBadge type={en.status || 'pending'} />
                    </div>
                  ))}
                  {!recentActivity.recent_enrollments?.length && (
                    <p className={`text-center py-8 text-sm italic ${T.textMuted}`}>Ma'lumot yo'q</p>
                  )}
                </div>
              </div>

              {/* New Users */}
              <div className={`${T.card} border rounded-[3rem] p-10 shadow-sm`}>
                <div className="flex justify-between items-center mb-8">
                  <h4 className={`text-2xl font-black italic uppercase tracking-tighter ${T.text}`}>Yangi Foydalanuvchilar</h4>
                  <button onClick={() => setActiveTab('students')} className={`text-[10px] font-black uppercase italic ${T.accentText} flex items-center gap-1 hover:underline`}>
                    Barchasi <ChevronRight size={14} />
                  </button>
                </div>
                <div className="space-y-4">
                  {(recentActivity.new_users || []).map((u, i) => (
                    <div key={u.id || i} className={`flex items-center justify-between p-5 ${T.tableRow} rounded-2xl transition-all`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${u.role === 'teacher' ? 'bg-violet-500' : 'bg-blue-500'} rounded-xl flex items-center justify-center font-black text-white italic text-lg shadow-md`}>
                          {avatarLetter(u.full_name || u.username)}
                        </div>
                        <div>
                          <p className={`font-black italic uppercase text-sm ${T.text}`}>{u.full_name || u.username}</p>
                          <p className={`text-[10px] font-bold ${T.textMuted}`}>{u.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${u.role === 'teacher' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>
                          {u.role === 'teacher' ? "O'qituvchi" : 'Talaba'}
                        </span>
                        <p className={`text-[10px] mt-1 ${T.textMuted}`}>{fmtDate(u.created_at)}</p>
                      </div>
                    </div>
                  ))}
                  {!recentActivity.new_users?.length && (
                    <p className={`text-center py-8 text-sm italic ${T.textMuted}`}>Ma'lumot yo'q</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            TAB: STUDENTS
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'students' && (
          <div className={`${T.card} border rounded-[3rem] shadow-sm overflow-hidden animate-in fade-in duration-500`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <TableHeader cols={['#', 'Talaba', 'Email', 'Yozilishlar', 'Holat', 'Qo\'shilgan', 'Amallar']} />
                <tbody className={`divide-y ${T.divider}`}>
                  {filteredStudents.map((s, i) => (
                    <tr key={s.id} className={`${T.tableRow} transition-all group`}>
                      <td className={`p-6 font-black italic text-xl ${T.textMuted}`}>{String(i+1).padStart(2,'0')}</td>
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center font-black text-white text-lg group-hover:rotate-12 transition-transform duration-500`}>
                            {avatarLetter(s.full_name || s.username)}
                          </div>
                          <div>
                            <p className={`font-black italic uppercase text-sm ${T.text}`}>{s.full_name || s.username}</p>
                            <p className={`text-[10px] ${T.textMuted}`}>@{s.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className={`p-6 text-sm italic ${T.textMuted}`}>{s.email}</td>
                      <td className="p-6">
                        <span className={`px-4 py-2 rounded-xl text-xs font-black italic ${T.accentText} ${theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                          {s.enrollments_count || 0} ta kurs
                        </span>
                      </td>
                      <td className="p-6">
                        <span className={`flex items-center gap-2 text-[10px] font-black uppercase italic px-3 py-1.5 rounded-full w-fit ${s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          {s.is_active ? 'Faol' : 'Bloklangan'}
                        </span>
                      </td>
                      <td className={`p-6 text-sm italic ${T.textMuted}`}>{fmtDate(s.created_at)}</td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ActionBtn onClick={() => openModal('student', s)} icon={Edit3} label="Tahrir" />
                          <ActionBtn onClick={() => toggleActive(s.id, 'student')} icon={s.is_active ? ToggleRight : ToggleLeft} color={s.is_active ? 'amber' : 'emerald'} label={s.is_active ? 'Blok' : 'Faol'} />
                          <ActionBtn onClick={() => deleteUser(s.id, 'student')} icon={Trash2} color="red" label="O'chir" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filteredStudents.length && (
                <div className={`py-24 text-center ${T.textMuted}`}>
                  <GraduationCap size={56} className="mx-auto mb-4 opacity-20" />
                  <p className="font-black italic uppercase tracking-widest text-xs">Talabalar topilmadi</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            TAB: TEACHERS
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'teachers' && (
          <div className={`${T.card} border rounded-[3rem] shadow-sm overflow-hidden animate-in fade-in duration-500`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <TableHeader cols={['#', "O'qituvchi", 'Email', 'Kurslar', 'Holat', 'Qo\'shilgan', 'Amallar']} />
                <tbody className={`divide-y ${T.divider}`}>
                  {filteredTeachers.map((t, i) => (
                    <tr key={t.id} className={`${T.tableRow} transition-all group`}>
                      <td className={`p-6 font-black italic text-xl ${T.textMuted}`}>{String(i+1).padStart(2,'0')}</td>
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 bg-violet-500 rounded-xl flex items-center justify-center font-black text-white text-lg group-hover:rotate-12 transition-transform duration-500`}>
                            {avatarLetter(t.full_name || t.username)}
                          </div>
                          <div>
                            <p className={`font-black italic uppercase text-sm ${T.text}`}>{t.full_name || t.username}</p>
                            <p className={`text-[10px] ${T.textMuted}`}>@{t.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className={`p-6 text-sm italic ${T.textMuted}`}>{t.email}</td>
                      <td className="p-6">
                        <span className={`px-4 py-2 rounded-xl text-xs font-black italic ${T.accentText} ${theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                          {t.courses_count || 0} ta kurs
                        </span>
                      </td>
                      <td className="p-6">
                        <span className={`flex items-center gap-2 text-[10px] font-black uppercase italic px-3 py-1.5 rounded-full w-fit ${t.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${t.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          {t.is_active ? 'Faol' : 'Bloklangan'}
                        </span>
                      </td>
                      <td className={`p-6 text-sm italic ${T.textMuted}`}>{fmtDate(t.created_at)}</td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ActionBtn onClick={() => openModal('teacher', t)} icon={Edit3} label="Tahrir" />
                          <ActionBtn onClick={() => toggleActive(t.id, 'teacher')} icon={t.is_active ? ToggleRight : ToggleLeft} color={t.is_active ? 'amber' : 'emerald'} label={t.is_active ? 'Blok' : 'Faol'} />
                          <ActionBtn onClick={() => deleteUser(t.id, 'teacher')} icon={Trash2} color="red" label="O'chir" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filteredTeachers.length && (
                <div className={`py-24 text-center ${T.textMuted}`}>
                  <Users size={56} className="mx-auto mb-4 opacity-20" />
                  <p className="font-black italic uppercase tracking-widest text-xs">O'qituvchilar topilmadi</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            TAB: COURSES
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'courses' && (
          <div className={`${T.card} border rounded-[3rem] shadow-sm overflow-hidden animate-in fade-in duration-500`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <TableHeader cols={['#', 'Kurs', "O'qituvchi", 'Narx', 'Daraja', 'Holat', 'Amallar']} />
                <tbody className={`divide-y ${T.divider}`}>
                  {filteredCourses.map((c, i) => (
                    <tr key={c.id} className={`${T.tableRow} transition-all group`}>
                      <td className={`p-6 font-black italic text-xl ${T.textMuted}`}>{String(i+1).padStart(2,'0')}</td>
                      <td className="p-6 max-w-[220px]">
                        <p className={`font-black italic uppercase text-sm truncate ${T.text}`}>{c.title}</p>
                        <p className={`text-[10px] ${T.textMuted}`}>{c.modules_count || 0} modul</p>
                      </td>
                      <td className="p-6">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl w-fit ${theme === 'dark' ? 'bg-violet-900/30 text-violet-300' : 'bg-violet-50 text-violet-700'}`}>
                          <Users size={12} />
                          <span className="text-xs font-black italic">{c.teacher_name}</span>
                        </div>
                      </td>
                      <td className={`p-6 font-black italic text-sm ${T.text}`}>{fmtNumber(c.price)} UZS</td>
                      <td className="p-6"><StatusBadge type={c.level} /></td>
                      <td className="p-6"><StatusBadge type={c.status} /></td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <ActionBtn onClick={() => { setSelectedCourseForModules(c.id); setActiveTab('modules'); }} icon={Layers} label="Modullar" color="indigo" />
                          <ActionBtn onClick={() => openModal('course', c)} icon={Edit3} label="Tahrir" />
                          <ActionBtn onClick={() => deleteCourse(c.id)} icon={Trash2} color="red" label="O'chir" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filteredCourses.length && (
                <div className={`py-24 text-center ${T.textMuted}`}>
                  <BookOpen size={56} className="mx-auto mb-4 opacity-20" />
                  <p className="font-black italic uppercase tracking-widest text-xs">Kurslar topilmadi</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            TAB: MODULES
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'modules' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Course filter */}
            <div className={`${T.card} border rounded-2xl p-6 flex items-center gap-4 flex-wrap shadow-sm`}>
              <span className={`text-[10px] font-black uppercase italic tracking-widest ${T.textMuted}`}>Kurs:</span>
              <button onClick={() => { setSelectedCourseForModules(null); fetchModules(''); }}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase italic transition-all ${!selectedCourseForModules ? `${T.accent} text-white shadow` : `${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}`}>
                Barcha modullar
              </button>
              {courses.slice(0, 8).map(c => (
                <button key={c.id} onClick={() => { setSelectedCourseForModules(c.id); fetchModules(c.id); }}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase italic transition-all ${selectedCourseForModules === c.id ? `${T.accent} text-white shadow` : `${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}`}>
                  {c.title?.length > 22 ? c.title.slice(0, 22) + '...' : c.title}
                </button>
              ))}
            </div>

            <div className={`${T.card} border rounded-[3rem] shadow-sm overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <TableHeader cols={['#', 'Modul', 'Kurs', 'Davomiylik', 'Tartib', 'Holat', 'Amallar']} />
                  <tbody className={`divide-y ${T.divider}`}>
                    {modules.map((m, i) => (
                      <tr key={m.id} className={`${T.tableRow} transition-all group`}>
                        <td className={`p-6 font-black italic text-xl ${T.textMuted}`}>{String(i+1).padStart(2,'0')}</td>
                        <td className="p-6">
                          <p className={`font-black italic uppercase text-sm ${T.text}`}>{m.title}</p>
                          <p className={`text-[10px] italic ${T.textMuted}`}>{m.description?.slice(0, 40)}</p>
                        </td>
                        <td className={`p-6 text-xs italic ${T.textMuted}`}>
                          {courses.find(c => c.id === m.course)?.title?.slice(0, 24) || m.course}
                        </td>
                        <td className="p-6">
                          <span className={`flex items-center gap-1 text-xs font-bold italic ${T.textMuted}`}>
                            <Clock size={12} /> {m.duration} daqiqa
                          </span>
                        </td>
                        <td className={`p-6 font-black italic text-lg ${T.text}`}>{m.order}</td>
                        <td className="p-6">
                          <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase ${m.is_free ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {m.is_free ? 'Bepul' : 'Pullik'}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <ActionBtn onClick={() => openModal('module', m)} icon={Edit3} label="Tahrir" />
                            <ActionBtn onClick={() => deleteModule(m.id)} icon={Trash2} color="red" label="O'chir" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!modules.length && (
                  <div className={`py-24 text-center ${T.textMuted}`}>
                    <Layers size={56} className="mx-auto mb-4 opacity-20" />
                    <p className="font-black italic uppercase tracking-widest text-xs">Modullar topilmadi</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            TAB: ENROLLMENTS
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'enrollments' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Filter */}
            <div className={`${T.card} border rounded-2xl p-5 flex items-center gap-3 shadow-sm flex-wrap`}>
              {['all','pending','accepted','rejected'].map(s => (
                <button key={s} onClick={() => setEnrollFilter(s)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase italic tracking-wider transition-all
                    ${enrollFilter === s
                      ? s === 'accepted' ? 'bg-emerald-500 text-white shadow' : s === 'rejected' ? 'bg-red-500 text-white shadow' : s === 'pending' ? 'bg-amber-500 text-white shadow' : `${T.accent} text-white shadow`
                      : `${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-400'}`
                    }`}>
                  {s === 'all' ? 'Barchasi' : s === 'pending' ? 'Kutmoqda' : s === 'accepted' ? 'Qabul' : 'Rad'}
                </button>
              ))}
              <span className={`ml-auto text-xs font-bold italic ${T.textMuted}`}>{filteredEnrollments.length} ta natija</span>
            </div>

            <div className={`${T.card} border rounded-[3rem] shadow-sm overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <TableHeader cols={['#', 'Talaba', 'Kurs', "O'qituvchi", 'Holat', 'Sana']} />
                  <tbody className={`divide-y ${T.divider}`}>
                    {filteredEnrollments.map((en, i) => (
                      <tr key={en.id} className={`${T.tableRow} transition-all`}>
                        <td className={`p-6 font-black italic text-xl ${T.textMuted}`}>{String(i+1).padStart(2,'0')}</td>
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${T.accent} rounded-xl flex items-center justify-center font-black text-white text-sm`}>
                              {avatarLetter(en.student_name)}
                            </div>
                            <div>
                              <p className={`font-black italic uppercase text-sm ${T.text}`}>{en.student_name}</p>
                              <p className={`text-[10px] ${T.textMuted}`}>{en.student_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className={`p-6 text-sm italic ${T.text} max-w-[180px]`}>
                          <p className="truncate">{en.course_title}</p>
                        </td>
                        <td className={`p-6 text-sm italic ${T.textMuted}`}>{en.teacher_name}</td>
                        <td className="p-6"><StatusBadge type={en.status || 'pending'} /></td>
                        <td className={`p-6 text-sm italic ${T.textMuted}`}>{fmtDate(en.enrolled_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!filteredEnrollments.length && (
                  <div className={`py-24 text-center ${T.textMuted}`}>
                    <UserCheck size={56} className="mx-auto mb-4 opacity-20" />
                    <p className="font-black italic uppercase tracking-widest text-xs">Yozilishlar topilmadi</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            TAB: CATEGORIES
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {categories.map((cat, i) => (
              <div key={cat.id} className={`${T.card} border p-8 rounded-[2.5rem] shadow-sm ${T.cardHover} transition-all group`}>
                <div className={`w-14 h-14 ${T.accent} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500`}>
                  <Tag className="text-white" size={24} />
                </div>
                <h4 className={`text-2xl font-black italic uppercase tracking-tighter mb-2 ${T.text}`}>{cat.name}</h4>
                <p className={`text-xs italic mb-4 ${T.textMuted}`}>/{cat.slug}</p>
                <div className="flex items-center justify-between">
                  <span className={`px-4 py-2 rounded-xl text-xs font-black italic ${theme === 'dark' ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                    {cat.courses_count || 0} ta kurs
                  </span>
                  <div className="flex gap-2">
                    <ActionBtn onClick={() => openModal('category', cat)} icon={Edit3} label="" />
                    <ActionBtn onClick={() => deleteCategory(cat.id)} icon={Trash2} color="red" label="" />
                  </div>
                </div>
              </div>
            ))}
            {!categories.length && (
              <div className={`col-span-full py-24 text-center ${T.textMuted}`}>
                <Tag size={56} className="mx-auto mb-4 opacity-20" />
                <p className="font-black italic uppercase tracking-widest text-xs">Kategoriyalar topilmadi</p>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            TAB: NOTIFICATIONS
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'notifications' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            {notifications.map((n) => {
              const iconMap = { info: Info, success: CheckCircle, warning: AlertCircle, error: AlertCircle };
              const Icon = iconMap[n.notification_type] || Info;
              return (
                <div key={n.id} className={`${T.card} border p-6 rounded-2xl shadow-sm flex items-start gap-5 ${T.cardHover} transition-all`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                    ${n.notification_type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                      n.notification_type === 'warning' ? 'bg-amber-100 text-amber-600' :
                      n.notification_type === 'error' ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-blue-600'}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className={`font-black italic uppercase text-sm ${T.text}`}>{n.title}</h4>
                      <span className={`text-[10px] italic flex-shrink-0 ${T.textMuted}`}>{fmtDate(n.created_at)}</span>
                    </div>
                    <p className={`text-sm mt-1 italic ${T.textMuted}`}>{n.message}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <StatusBadge type={n.notification_type} />
                      <span className={`text-[10px] font-bold italic ${T.textMuted}`}>
                        → {n.recipient_name || 'Hamma'}
                      </span>
                      <span className={`text-[10px] italic ${T.textMuted}`}>Yuboruvchi: {n.sender_name}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {!notifications.length && (
              <div className={`py-24 text-center ${T.textMuted}`}>
                <Bell size={56} className="mx-auto mb-4 opacity-20" />
                <p className="font-black italic uppercase tracking-widest text-xs">Hali xabar yuborilmagan</p>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            TAB: SETTINGS
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-8 animate-in fade-in duration-500">
            <div className={`${T.card} border rounded-[3rem] p-12 shadow-sm`}>
              <h4 className={`text-2xl font-black italic uppercase tracking-tighter mb-8 ${T.text}`}>Interfeys Temasi</h4>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(THEMES).map(([key, t]) => {
                  const Icon = t.icon;
                  const isActive = theme === key;
                  return (
                    <button key={key} onClick={() => setTheme(key)}
                      className={`p-6 rounded-2xl border-2 transition-all text-center ${isActive ? `border-indigo-500 ${theme === 'dark' ? 'bg-indigo-900/20' : 'bg-indigo-50'}` : `${T.card} ${T.divider} hover:scale-105`}`}>
                      <Icon className={`mx-auto mb-2 ${isActive ? T.accentText : T.textMuted}`} size={24} />
                      <p className={`text-xs font-black italic uppercase ${isActive ? T.text : T.textMuted}`}>{t.name}</p>
                      {isActive && <div className={`w-4 h-4 ${T.accent} rounded-full mx-auto mt-2 flex items-center justify-center`}><CheckCircle size={10} className="text-white" /></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ═══════════════════════════════════════════════════════════
          MODAL SYSTEM
      ═══════════════════════════════════════════════════════════ */}
      {modalType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className={`${T.card} border w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-12 relative shadow-2xl animate-in zoom-in-95 duration-500`}
            style={{ scrollbarWidth: 'none' }}>
            <button onClick={closeModal}
              className={`absolute top-8 right-8 p-4 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all group ${T.textMuted}`}>
              <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* ── Modal Header ── */}
            <div className="mb-10">
              <p className={`font-black uppercase italic tracking-[0.3em] text-[10px] mb-2 ${T.accentText}`}>
                {editingItem ? 'Tahrirlash' : 'Yangi Qo\'shish'}
              </p>
              <h2 className={`text-4xl font-black italic uppercase tracking-tighter ${T.text}`}>
                {modalType === 'student' ? 'Talaba' :
                 modalType === 'teacher' ? "O'qituvchi" :
                 modalType === 'course' ? 'Kurs' :
                 modalType === 'module' ? 'Modul' :
                 modalType === 'notify' ? 'Xabar Yuborish' : 'Kategoriya'}
              </h2>
            </div>

            {/* ─── STUDENT / TEACHER FORM ─── */}
            {(modalType === 'student' || modalType === 'teacher') && (
              <form onSubmit={(e) => saveUser(e, modalType)} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-[10px] font-black uppercase italic ml-4 mb-2 block tracking-widest ${T.textMuted}`}>Ism</label>
                    <input type="text" value={userForm.first_name} onChange={e => setUserForm({...userForm, first_name: e.target.value})}
                      className={`w-full p-5 border-2 rounded-2xl outline-none font-bold transition-all ${T.input} ${T.text}`} placeholder="Ism" />
                  </div>
                  <div>
                    <label className={`text-[10px] font-black uppercase italic ml-4 mb-2 block tracking-widest ${T.textMuted}`}>Familiya</label>
                    <input type="text" value={userForm.last_name} onChange={e => setUserForm({...userForm, last_name: e.target.value})}
                      className={`w-full p-5 border-2 rounded-2xl outline-none font-bold transition-all ${T.input} ${T.text}`} placeholder="Familiya" />
                  </div>
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase italic ml-4 mb-2 block tracking-widest ${T.textMuted}`}>Username *</label>
                  <input type="text" required value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})}
                    className={`w-full p-5 border-2 rounded-2xl outline-none font-bold transition-all ${T.input} ${T.text}`} placeholder="username123" />
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase italic ml-4 mb-2 block tracking-widest ${T.textMuted}`}>Email *</label>
                  <input type="email" required value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})}
                    className={`w-full p-5 border-2 rounded-2xl outline-none font-bold transition-all ${T.input} ${T.text}`} placeholder="email@example.com" />
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase italic ml-4 mb-2 block tracking-widest ${T.textMuted}`}>Telefon</label>
                  <input type="tel" value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})}
                    className={`w-full p-5 border-2 rounded-2xl outline-none font-bold transition-all ${T.input} ${T.text}`} placeholder="+998 90 123 45 67" />
                </div>
                {!editingItem && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`text-[10px] font-black uppercase italic ml-4 mb-2 block tracking-widest ${T.textMuted}`}>Parol *</label>
                      <input type="password" required value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})}
                        className={`w-full p-5 border-2 rounded-2xl outline-none font-bold transition-all ${T.input} ${T.text}`} placeholder="••••••" />
                    </div>
                    <div>
                      <label className={`text-[10px] font-black uppercase italic ml-4 mb-2 block tracking-widest ${T.textMuted}`}>Parol takror *</label>
                      <input type="password" required value={userForm.password_confirm} onChange={e => setUserForm({...userForm, password_confirm: e.target.value})}
                        className={`w-full p-5 border-2 rounded-2xl outline-none font-bold transition-all ${T.input} ${T.text}`} placeholder="••••••" />
                    </div>
                  </div>
                )}
                <button type="submit" disabled={isSubmitting}
                  className={`w-full ${T.accent} text-white p-6 rounded-2xl font-black italic uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl disabled:opacity-50`}>
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                  {editingItem ? 'Yangilash' : `${modalType === 'student' ? 'Talaba' : "O'qituvchi"} Qo'shish`}
                </button>
              </form>
            )}

            {/* ─── COURSE FORM ─── */}
            {modalType === 'course' && (
              <form onSubmit={saveCourse} className="space-y-5">
                <div>
                  <label className={`text-[10px] font-black uppercase italic ml-4 mb-2 block tracking-widest ${T.textMuted}`}>Kurs Nomi *</label>
                  <input type="text" required value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})}
                    className={`w-full p-5 border-2 rounded-2xl outline-none font-black italic uppercase transition-all ${T.input} ${T.text}`} placeholder="Kurs nomi..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-[10px] font-black uppercase italic ml-4 mb-2 block tracking-widest ${T.textMuted}`}>O'qituvchi *</label>
                    <select required value={courseForm.teacher} onChange={e => setCourseForm({...courseForm, teacher: e.target.value})}
                      className={`w-full p-5 border-2 rounded-2xl outline-none font-bold transition-all appearance-none ${T.input} ${T.text}`}>
                      <option value="">Tanlang</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name || t.username}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`text-[10px] font-black uppercase italic ml-4 mb-2 block tracking-widest ${T.textMuted}`}>Kategoriya</label>
                    <select value={courseForm.category} onChange={e => setCourseForm({...courseForm, category: e.target.value})}
                      className={`w-full p-5 border-2 rounded-2xl outline-none font-bold transition-all appearance-none ${T.input} ${T.text}`}>
                      <option value="">Tanlang</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`text-[10px] font-black uppercase italic ml-4 mb-2 block tracking-widest ${T.textMuted}`}>Narx (UZS)</label>
                    <input type="number" value={courseForm.price} onChange={e => setCourseForm({...courseForm, price: e.target.value})}
                      className={`w-full p-5 border-2 rounded-2xl outline-none font-bold transition-all ${T.input} ${T.text}`} placeholder="0" />
                  </div>
                  <div>
                    <label className={`text-[10px] font-black uppercase italic ml-4 mb-2 block tracking-widest ${T.textMuted}`}>Chegirma Narx</label>
                    <input type="number" value={courseForm.discount_price} onChange={e => setCourseForm({...courseForm, discount_price: e.target.value})}
                      className={`w-full p-5 border-2 rounded-2xl outline-none font-bold transition-all ${T.input} ${T.text}`} placeholder="0" />
                  </div>
                  <div>
                    <label className={`text-[10px] font-black uppercase italic ml-4 mb-2 block tracking-widest ${T.textMuted}`}>Daraja</label>
                    <select value={courseForm.level} onChange={e => setCourseForm({...courseForm, level: e.target.value})}
                      className={`w-full p-5 border-2 rounded-2xl outline-none font-bold transition-all appearance-none ${T.input} ${T.text}`}>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase italic ml-4 mb-2 block tracking-widest ${T.textMuted}`}>Qisqa Ta'rif</label>
                  <textarea rows={3} value={courseForm.short_description} onChange={e => setCourseForm({...courseForm, short_description: e.target.value})}
                    className={`w-full p-5 border-2 rounded-2xl outline-none font-bold italic text-sm transition-all resize-none ${T.input} ${T.text}`} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-[10px] font-black uppercase italic ml-4 mb-2 block tracking-widest ${T.textMuted}`}>Holat</label>
                    <select value={courseForm.status} onChange={e => setCourseForm({...courseForm, status: e.target.value})}
                      className={`w-full p-5 border-2 rounded-2xl outline-none font-bold transition-all appearance-none ${T.input} ${T.text}`}>
                      <option value="published">Nashr etilgan</option>
                      <option value="draft">Qoralama</option>
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={isSubmitting}
                  className={`w-full ${T.accent} text-white p-6 rounded-2xl font-black italic uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl disabled:opacity-50`}>
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <BookOpen size={20} />}
                  {editingItem ? 'Kursni Yangilash' : "Kurs Qo'shish"}
                </button>
              </form>
            )}

            {/* ─── MODULE FORM ─── */}
            {modalType === 'module' && (
              <form onSubmit={saveModule} className="space-y-5">
                <div>
                  <label className={`text-[10px] font-black uppercase italic ml-4 mb-2 block tracking-widest ${T.textMuted}`}>Kurs *</label>
                  <select required value={moduleForm.course} onChange={e => setModuleForm({...moduleForm, course: e.target.value})}
                    className={`w-full p-5 border-2 rounded-2xl outline-none font-bold transition-all appearance-none ${T.input} ${T.text}`}>
                    <option value="">Tanlang</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase italic ml-4 mb-2 block tracking-widest ${T.textMuted}`}>Modul Nomi *</label>
                  <input type="text" required value={moduleForm.title} onChange={e => setModuleForm({...moduleForm, title: e.target.value})}
                    className={`w-full p-5 border-2 rounded-2xl outline-none font-black italic uppercase transition-all ${T.input} ${T.text}`} placeholder="Modul nomi..." />
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase italic ml-4 mb-2 block tracking-widest ${T.textMuted}`}>Tavsif</label>
                  <textarea rows={3} value={moduleForm.description} onChange={e => setModuleForm({...moduleForm, description: e.target.value})}
                    className={`w-full p-5 border-2 rounded-2xl outline-none font-bold italic text-sm transition-all resize-none ${T.input} ${T.text}`} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-[10px] font-black uppercase italic ml-4 mb-2 block tracking-widest ${T.textMuted}`}>Tartib raqami</label>
                    <input type="number" value={moduleForm.order} onChange={e => setModuleForm({...moduleForm, order: parseInt(e.target.value) || 0})}
                      className={`w-full p-5 border-2 rounded-2xl outline-none font-bold transition-all ${T.input} ${T.text}`} min="0" />
                  </div>
                  <div>
                    <label className={`text-[10px] font-black uppercase italic ml-4 mb-2 block tracking-widest ${T.textMuted}`}>Davomiylik (daqiqa)</label>
                    <input type="number" value={moduleForm.duration} onChange={e => setModuleForm({...moduleForm, duration: parseInt(e.target.value) || 0})}
                      className={`w-full p-5 border-2 rounded-2xl outline-none font-bold transition-all ${T.input} ${T.text}`} min="0" />
                  </div>
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase italic ml-4 mb-2 block tracking-widest ${T.textMuted}`}>Video URL</label>
                  <input type="url" value={moduleForm.video_url} onChange={e => setModuleForm({...moduleForm, video_url: e.target.value})}
                    className={`w-full p-5 border-2 rounded-2xl outline-none font-bold transition-all ${T.input} ${T.text}`} placeholder="https://..." />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setModuleForm({...moduleForm, is_free: !moduleForm.is_free})}
                    className={`w-14 h-7 rounded-full transition-colors relative ${moduleForm.is_free ? 'bg-emerald-500' : theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${moduleForm.is_free ? 'translate-x-7' : 'translate-x-0.5'}`}></div>
                  </div>
                  <span className={`text-sm font-black italic uppercase ${T.text}`}>Bepul kirish</span>
                </label>
                <button type="submit" disabled={isSubmitting}
                  className={`w-full ${T.accent} text-white p-6 rounded-2xl font-black italic uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl disabled:opacity-50`}>
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Layers size={20} />}
                  {editingItem ? 'Modulni Yangilash' : "Modul Qo'shish"}
                </button>
              </form>
            )}

            {/* ─── SEND NOTIFICATION FORM ─── */}
            {modalType === 'notify' && (
              <form onSubmit={sendNotification} className="space-y-5">
                {/* Recipient type */}
                <div>
                  <label className={`text-[10px] font-black uppercase italic ml-4 mb-3 block tracking-widest ${T.textMuted}`}>Kimga Yuborish?</label>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { val: '', roleVal: 'all', label: 'Hamma', color: 'bg-indigo-600' },
                      { val: '', roleVal: 'student', label: 'Talabalar', color: 'bg-blue-500' },
                      { val: '', roleVal: 'teacher', label: "O'qituvchilar", color: 'bg-violet-500' },
                      { val: 'specific', roleVal: '', label: 'Bitta shaxs', color: 'bg-slate-600' },
                    ].map(opt => (
                      <button key={opt.label} type="button"
                        onClick={() => setNotifyForm({...notifyForm, recipient_role: opt.roleVal, recipient: opt.val === 'specific' ? '' : ''})}
                        className={`p-4 rounded-2xl text-[10px] font-black uppercase italic tracking-wide transition-all text-center
                          ${(opt.roleVal && notifyForm.recipient_role === opt.roleVal && !notifyForm.recipient) ||
                            (opt.val === 'specific' && !notifyForm.recipient_role && notifyForm.recipient !== undefined)
                            ? `${opt.color} text-white shadow-lg` : `${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'} hover:opacity-80`}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specific recipient */}
                {!notifyForm.recipient_role && (
                  <div>
                    <label className={`text-[10px] font-black uppercase italic ml-4 mb-2 block tracking-widest ${T.textMuted}`}>Foydalanuvchi tanlash</label>
                    <select value={notifyForm.recipient} onChange={e => setNotifyForm({...notifyForm, recipient: e.target.value})}
                      className={`w-full p-5 border-2 rounded-2xl outline-none font-bold transition-all appearance-none ${T.input} ${T.text}`}>
                      <option value="">Tanlang...</option>
                      <optgroup label="Talabalar">
                        {students.map(s => <option key={s.id} value={s.id}>{s.full_name || s.username} ({s.email})</option>)}
                      </optgroup>
                      <optgroup label="O'qituvchilar">
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name || t.username} ({t.email})</option>)}
                      </optgroup>
                    </select>
                  </div>
                )}

                <div>
                  <label className={`text-[10px] font-black uppercase italic ml-4 mb-2 block tracking-widest ${T.textMuted}`}>Xabar turi</label>
                  <div className="flex gap-3">
                    {['info','success','warning','error'].map(t => (
                      <button key={t} type="button" onClick={() => setNotifyForm({...notifyForm, notification_type: t})}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase italic tracking-wide transition-all
                          ${notifyForm.notification_type === t
                            ? t === 'success' ? 'bg-emerald-500 text-white' : t === 'warning' ? 'bg-amber-500 text-white' : t === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                            : `${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}`}>
                        {t === 'info' ? "Ma'lumot" : t === 'success' ? 'Muvaffaqiyat' : t === 'warning' ? 'Ogohlantirish' : 'Xato'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`text-[10px] font-black uppercase italic ml-4 mb-2 block tracking-widest ${T.textMuted}`}>Sarlavha *</label>
                  <input type="text" required value={notifyForm.title} onChange={e => setNotifyForm({...notifyForm, title: e.target.value})}
                    className={`w-full p-5 border-2 rounded-2xl outline-none font-black italic uppercase transition-all ${T.input} ${T.text}`} placeholder="Xabar sarlavhasi..." />
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase italic ml-4 mb-2 block tracking-widest ${T.textMuted}`}>Xabar matni *</label>
                  <textarea rows={5} required value={notifyForm.message} onChange={e => setNotifyForm({...notifyForm, message: e.target.value})}
                    className={`w-full p-5 border-2 rounded-2xl outline-none font-bold italic text-sm transition-all resize-none ${T.input} ${T.text}`} placeholder="Xabar mazmuni..." />
                </div>
                <button type="submit" disabled={isSubmitting}
                  className={`w-full ${T.accent} text-white p-6 rounded-2xl font-black italic uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl disabled:opacity-50`}>
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  Xabar Yuborish
                </button>
              </form>
            )}

            {/* ─── CATEGORY FORM ─── */}
            {modalType === 'category' && (
              <form onSubmit={saveCategory} className="space-y-5">
                <div>
                  <label className={`text-[10px] font-black uppercase italic ml-4 mb-2 block tracking-widest ${T.textMuted}`}>Kategoriya nomi *</label>
                  <input type="text" required value={categoryForm.name}
                    onChange={e => setCategoryForm({...categoryForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')})}
                    className={`w-full p-5 border-2 rounded-2xl outline-none font-black italic uppercase transition-all ${T.input} ${T.text}`} placeholder="Masalan: Dasturlash" />
                </div>
                <div>
                  <label className={`text-[10px] font-black uppercase italic ml-4 mb-2 block tracking-widest ${T.textMuted}`}>Slug (URL)</label>
                  <input type="text" required value={categoryForm.slug} onChange={e => setCategoryForm({...categoryForm, slug: e.target.value})}
                    className={`w-full p-5 border-2 rounded-2xl outline-none font-bold transition-all ${T.input} ${T.textMuted}`} placeholder="dasturlash" />
                </div>
                <button type="submit" disabled={isSubmitting}
                  className={`w-full ${T.accent} text-white p-6 rounded-2xl font-black italic uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl disabled:opacity-50`}>
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Tag size={20} />}
                  {editingItem ? 'Yangilash' : "Qo'shish"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}