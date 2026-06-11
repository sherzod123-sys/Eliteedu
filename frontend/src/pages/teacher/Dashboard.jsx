import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BookOpen, Users, PlusCircle, FileText, X, Edit3, Trash2, 
  Loader2, Image as ImageIcon, DollarSign, Wallet, Zap, Save, 
  Camera, CheckCircle, TrendingUp, Search, ChevronRight, 
  Calendar, Eye, BarChart3, LogOut, Settings, LayoutDashboard,
  Layers, Filter, ArrowUpRight, ArrowDownRight, MoreVertical,
  ChevronLeft, Award, Clock
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosConfig';

/**
 * ============================================================
 * ULTIMATE TEACHER DASHBOARD - ENTERPRISE EDITION
 * ============================================================
 * Muallif: Gemini AI Collaborator
 * Xususiyatlar: 
 * - Full CRUD for Courses & Blogs
 * - Real-time Finance Calculation (70/30)
 * - Student Enrollment Tracking
 * - Advanced UI with Tailwind CSS
 * - Image Upload support via FormData
 */

export default function TeacherDashboard() {
  // --- 1. STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data States
  const [courses, setCourses] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    total_courses: 0,
    total_students: 0,
    total_income: 0,
    published_courses: 0,
    total_views: 0
  });

  // Modal States
  const [modalType, setModalType] = useState(null); // 'course' | 'blog'
  const [editingItem, setEditingItem] = useState(null);

  // Form States
  const [courseForm, setCourseForm] = useState({
    title: '', category: '', price: '', discount_price: '',
    level: 'beginner', short_description: '', description: '', thumbnail: null
  });

  const [blogForm, setBlogForm] = useState({
    title: '', content: '', featured_image: null, status: 'published'
  });

  // --- 2. DATA FETCHING (Parallel Requests) ---
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

      // Statlarni formatlash
      setStats({
        ...statsRes.data,
        total_income: Number(statsRes.data.total_income || 0),
        total_views: Number(statsRes.data.total_views || 0)
      });

      // Ma'lumotlarni natijalar (results) bo'yicha set qilish
      setCourses(coursesRes.data.results || coursesRes.data || []);
      setEnrollments(enrollRes.data.results || enrollRes.data || []);
      setCategories(catRes.data.results || catRes.data || []);
      setBlogs(blogRes.data.results || blogRes.data || []);

    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
    } finally {
      setTimeout(() => setLoading(false), 500); // Silliq o'tish uchun
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // --- 3. COURSE OPERATIONS ---
  const handleCourseAction = async (e) => {
    e.preventDefault();
    if (!courseForm.category) return toast.error("Kategoriyani tanlang!");
    
    setIsSubmitting(true);
    const formData = new FormData();
    Object.keys(courseForm).forEach(key => {
      if (key === 'thumbnail') {
        if (courseForm[key] instanceof File) formData.append('thumbnail', courseForm[key]);
      } else if (courseForm[key] !== null) {
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
        await axiosInstance.post(`/api/teacher/courses/${res.data.id}/publish/`);
        toast.success("Kurs yaratildi va nashr etildi!");
      }
      setModalType(null);
      fetchDashboardData();
    } catch (err) {
      toast.error("Kursni saqlashda xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeCourse = async (id) => {
    if (!window.confirm("Kursni butunlay o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi!")) return;
    try {
      await axiosInstance.delete(`/api/teacher/courses/${id}/`);
      toast.success("Kurs muvaffaqiyatli o'chirildi");
      fetchDashboardData();
    } catch (err) {
      toast.error("O'chirishda xatolik yuz berdi");
    }
  };

  // --- 4. BLOG OPERATIONS ---
  const handleBlogAction = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', blogForm.title);
    formData.append('content', blogForm.content);
    formData.append('status', 'published');
    
    if (blogForm.featured_image instanceof File) {
      formData.append('featured_image', blogForm.featured_image);
    }

    try {
      if (editingItem) {
        await axiosInstance.patch(`/api/blog/teacher/${editingItem.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("Maqola yangilandi");
      } else {
        await axiosInstance.post('/api/blog/teacher/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("Yangi maqola chop etildi");
      }
      setModalType(null);
      fetchDashboardData();
    } catch (err) {
      toast.error("Blog saqlashda xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeBlog = async (id) => {
    if (!window.confirm("Maqolani o'chirishga aminmisiz?")) return;
    try {
      await axiosInstance.delete(`/api/blog/teacher/${id}/`);
      toast.success("Maqola o'chirildi");
      fetchDashboardData();
    } catch (err) {
      toast.error("Maqolani o'chirishda xatolik");
    }
  };

  // --- 5. CALCULATIONS & FILTERING ---
  const finance = useMemo(() => {
    const gross = stats.total_income || 0;
    return {
      total: gross,
      teacher: gross * 0.7,
      platform: gross * 0.3,
      formatted: new Intl.NumberFormat('uz-UZ').format(gross)
    };
  }, [stats.total_income]);

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- 6. UI COMPONENTS ---
  const SidebarLink = ({ active, onClick, icon, label }) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black italic uppercase text-xs tracking-widest transition-all duration-300 ${
        active 
          ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 translate-x-2' 
          : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
      }`}
    >
      {icon} <span>{label}</span>
    </button>
  );

  const StatusBadge = ({ type }) => {
    const config = {
      published: "bg-emerald-100 text-emerald-700",
      draft: "bg-amber-100 text-amber-700",
      beginner: "bg-blue-100 text-blue-700",
      intermediate: "bg-indigo-100 text-indigo-700",
      advanced: "bg-purple-100 text-purple-700"
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${config[type] || config.draft}`}>
        {type}
      </span>
    );
  };

  // --- 7. RENDER LOGIC ---
  if (loading && activeTab === 'overview') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
        <p className="font-black italic uppercase tracking-[0.3em] text-slate-300 animate-pulse">Sinxronizatsiya...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <Toaster position="top-right" />
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-80 bg-white border-r border-slate-100 flex flex-col sticky top-0 h-screen z-50">
        <div className="p-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl">
              <Zap className="text-indigo-400 fill-current" size={24} />
            </div>
            <span className="text-2xl font-black italic tracking-tighter uppercase">EDU<span className="text-indigo-600">PRO</span></span>
          </div>
        </div>

        <nav className="flex-1 px-8 space-y-3">
          <SidebarLink active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<BarChart3 size={18}/>} label="Dashboard" />
          <SidebarLink active={activeTab === 'courses'} onClick={() => setActiveTab('courses')} icon={<BookOpen size={18}/>} label="Mening Kurslarim" />
          <SidebarLink active={activeTab === 'blogs'} onClick={() => setActiveTab('blogs')} icon={<FileText size={18}/>} label="Maqolalar" />
          <SidebarLink active={activeTab === 'students'} onClick={() => setActiveTab('students')} icon={<Users size={18}/>} label="Talabalar" />
          <SidebarLink active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={<Wallet size={18}/>} label="Moliya" />
          <SidebarLink active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={18}/>} label="Sozlamalar" />
        </nav>

        <div className="p-10 border-t border-slate-50">
          <button className="w-full flex items-center gap-4 p-4 text-slate-400 font-black italic uppercase text-xs hover:text-red-500 transition-colors">
            <LogOut size={18}/> <span>Tizimdan Chiqish</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-12 lg:p-20 overflow-x-hidden">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-20">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-12 h-1.5 bg-indigo-600 rounded-full"></span>
              <p className="text-indigo-600 font-black uppercase italic tracking-[0.3em] text-[10px]">O'qituvchi Kabineti</p>
            </div>
            <h2 className="text-7xl font-black italic tracking-tighter uppercase leading-tight text-slate-900">
              {activeTab === 'overview' ? 'Xush Kelibsiz' : activeTab}
            </h2>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                type="text" 
                placeholder="Qidirish..." 
                className="bg-white border-2 border-slate-50 py-5 pl-14 pr-8 rounded-[2rem] outline-none focus:border-indigo-500/20 focus:ring-8 focus:ring-indigo-500/5 font-bold transition-all w-full lg:w-80 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => {
                setEditingItem(null);
                setModalType(activeTab === 'blogs' ? 'blog' : 'course');
              }}
              className="bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black italic uppercase tracking-wider shadow-2xl shadow-indigo-200 hover:bg-slate-900 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 whitespace-nowrap"
            >
              <PlusCircle size={22} /> Yangi Qo'shish
            </button>
          </div>
        </header>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Users size={28}/>
                </div>
                <p className="text-slate-400 font-black uppercase italic text-[10px] tracking-widest mb-2">Talabalar</p>
                <h3 className="text-5xl font-black italic tracking-tighter">{stats.total_students}</h3>
              </div>
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <BookOpen size={28}/>
                </div>
                <p className="text-slate-400 font-black uppercase italic text-[10px] tracking-widest mb-2">Kurslar</p>
                <h3 className="text-5xl font-black italic tracking-tighter">{stats.total_courses}</h3>
              </div>
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Eye size={28}/>
                </div>
                <p className="text-slate-400 font-black uppercase italic text-[10px] tracking-widest mb-2">Ko'rishlar</p>
                <h3 className="text-5xl font-black italic tracking-tighter">{stats.total_views}</h3>
              </div>
              <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-8">
                    <DollarSign size={28}/>
                  </div>
                  <p className="text-slate-500 font-black uppercase italic text-[10px] tracking-widest mb-2">Sizning Ulushingiz</p>
                  <h3 className="text-4xl font-black italic tracking-tighter text-indigo-400">
                    {new Intl.NumberFormat('uz-UZ').format(finance.teacher)} <span className="text-xs">UZS</span>
                  </h3>
                </div>
                <TrendingUp className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 -rotate-12" />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
              {/* RECENT ENROLLMENTS TABLE */}
              <div className="xl:col-span-2 bg-white rounded-[4rem] border border-slate-100 p-12 shadow-sm">
                <div className="flex justify-between items-center mb-12">
                  <h4 className="text-2xl font-black italic uppercase tracking-tighter">Yaqinda yozilganlar</h4>
                  <button onClick={() => setActiveTab('students')} className="bg-slate-50 text-slate-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase italic hover:bg-indigo-600 hover:text-white transition-all">Barchasi</button>
                </div>
                <div className="space-y-6">
                  {enrollments.slice(0, 5).map((en, i) => (
                    <div key={i} className="flex items-center justify-between p-6 hover:bg-slate-50 rounded-[2rem] transition-all group">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center font-black text-indigo-400 italic text-xl shadow-lg shadow-slate-200">
                          {en.student_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black italic uppercase text-lg text-slate-900">{en.student_name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{en.course_title}</p>
                        </div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-slate-900 italic mb-2 tracking-tighter">{new Date(en.enrolled_at).toLocaleDateString()}</p>
                        <StatusBadge type="published" />
                      </div>
                    </div>
                  ))}
                  {enrollments.length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center">
                      <Layers className="text-slate-100 mb-4" size={64} />
                      <p className="font-black italic text-slate-300 uppercase tracking-widest text-xs">Hali hech kim yozilmagan</p>
                    </div>
                  )}
                </div>
              </div>

              {/* FINANCE PIE CHART CARD */}
              <div className="bg-white rounded-[4rem] border border-slate-100 p-12 shadow-sm flex flex-col">
                <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-12 text-center">Moliya Taqsimoti</h4>
                <div className="flex-1 flex flex-col items-center justify-center relative mb-12">
                  <div className="w-56 h-56 rounded-full border-[16px] border-slate-50 flex items-center justify-center relative">
                    <div className="text-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-1">Umumiy Savdo</p>
                       <p className="font-black italic text-slate-900 text-xl">{finance.formatted}</p>
                    </div>
                    {/* Visual Segment Decoration */}
                    <div className="absolute inset-0 rounded-full border-[16px] border-indigo-600 border-t-transparent border-r-transparent rotate-45"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <span className="font-black italic uppercase text-[10px] text-indigo-600">Sizning Ulushingiz (70%)</span>
                    <span className="font-black italic text-indigo-900">{new Intl.NumberFormat('uz-UZ').format(finance.teacher)}</span>
                  </div>
                  <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="font-black italic uppercase text-[10px] text-slate-400">Platforma (30%)</span>
                    <span className="font-black italic text-slate-900">{new Intl.NumberFormat('uz-UZ').format(finance.platform)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COURSES */}
        {activeTab === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {filteredCourses.map(course => (
              <div key={course.id} className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col border-b-8 border-b-slate-50 hover:border-b-indigo-500">
                <div className="h-72 bg-slate-100 relative overflow-hidden">
                  <img 
                    src={course.thumbnail || "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800"} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    alt={course.title} 
                  />
                  <div className="absolute top-8 left-8 flex flex-col gap-2">
                    <StatusBadge type={course.status} />
                    <StatusBadge type={course.level} />
                  </div>
                  <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm">
                    <button 
                      onClick={() => {
                        setEditingItem(course);
                        setCourseForm({
                          title: course.title, category: course.category,
                          price: course.price, discount_price: course.discount_price || '',
                          level: course.level, short_description: course.short_description,
                          description: course.description, thumbnail: null
                        });
                        setModalType('course');
                      }}
                      className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-2xl hover:scale-110"
                    >
                      <Edit3 size={28}/>
                    </button>
                    <button 
                      onClick={() => removeCourse(course.id)}
                      className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-2xl hover:scale-110"
                    >
                      <Trash2 size={28}/>
                    </button>
                  </div>
                </div>
                <div className="p-12 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 italic">
                      {course.category_name || "Dasturlash"}
                    </p>
                  </div>
                  <h4 className="text-3xl font-black italic uppercase tracking-tighter mb-6 line-clamp-1 text-slate-900">{course.title}</h4>
                  <p className="text-slate-400 text-sm font-medium line-clamp-2 mb-10 leading-relaxed italic">{course.short_description}</p>
                  
                  <div className="mt-auto pt-10 border-t border-slate-50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-300 uppercase italic mb-1 tracking-widest">Kurs Narxi</p>
                      <p className="font-black italic text-slate-900 text-xl tracking-tighter">
                        {new Intl.NumberFormat('uz-UZ').format(course.price)} <span className="text-[10px] font-bold">UZS</span>
                      </p>
                    </div>
                    <div className="flex items-center -space-x-3">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center font-black text-[10px] italic">
                          {i}
                        </div>
                      ))}
                      <div className="w-10 h-10 rounded-full border-4 border-white bg-indigo-600 text-white flex items-center justify-center font-black text-[10px] italic">
                        +{course.total_students || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {courses.length === 0 && (
              <div className="col-span-full py-60 text-center flex flex-col items-center">
                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-8 border border-slate-100">
                  <LayoutDashboard className="text-slate-200" size={48} />
                </div>
                <h3 className="text-4xl font-black italic uppercase text-slate-200 tracking-tighter mb-4">Kurslaringiz Yo'q</h3>
                <p className="text-slate-400 font-bold italic text-sm">Ilk kursingizni yaratish uchun "Yangi Qo'shish" tugmasini bosing</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BLOGS */}
        {activeTab === 'blogs' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
             {filteredBlogs.map(blog => (
               <div key={blog.id} className="bg-white p-10 rounded-[4rem] border border-slate-100 flex flex-col md:flex-row gap-10 group hover:border-indigo-100 transition-all shadow-sm relative overflow-hidden">
                  <div className="w-full md:w-56 h-56 rounded-[3rem] overflow-hidden flex-shrink-0 bg-slate-50 relative">
                    <img 
                      src={blog.featured_image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800"} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" 
                      alt={blog.title} 
                    />
                    <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  </div>
                  <div className="flex-1 flex flex-col py-2">
                    <div className="flex justify-between items-start mb-6">
                       <StatusBadge type={blog.status} />
                       <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-500">
                         <button 
                          onClick={() => { 
                            setEditingItem(blog); 
                            setBlogForm({ ...blog, featured_image: null }); 
                            setModalType('blog'); 
                          }} 
                          className="p-3 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-2xl transition-all hover:bg-white hover:shadow-xl"
                         >
                            <Edit3 size={20}/>
                         </button>
                         <button 
                          onClick={() => removeBlog(blog.id)}
                          className="p-3 text-slate-400 hover:text-red-600 bg-slate-50 rounded-2xl transition-all hover:bg-white hover:shadow-xl"
                         >
                            <Trash2 size={20}/>
                         </button>
                       </div>
                    </div>
                    <h4 className="text-3xl font-black italic uppercase tracking-tighter mb-4 leading-tight line-clamp-2 text-slate-900">{blog.title}</h4>
                    <p className="text-slate-400 text-sm font-medium line-clamp-2 mb-8 leading-relaxed italic">{blog.content}</p>
                    
                    <div className="mt-auto flex justify-between items-center text-[10px] font-black uppercase text-slate-300 italic tracking-[0.2em]">
                      <span className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100/50">
                        <Calendar size={14}/> {new Date(blog.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-2 bg-indigo-50 text-indigo-400 px-4 py-2 rounded-full border border-indigo-100/50">
                        <Eye size={14}/> {blog.views_count || 0}
                      </span>
                    </div>
                  </div>
               </div>
             ))}
             {blogs.length === 0 && (
               <div className="col-span-full py-40 text-center flex flex-col items-center opacity-30">
                 <FileText className="text-slate-300 mb-6" size={80} />
                 <h3 className="text-3xl font-black italic uppercase tracking-widest italic">Hali maqola yo'q</h3>
               </div>
             )}
          </div>
        )}

        {/* TAB 4: STUDENTS */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse min-w-[800px]">
                 <thead>
                   <tr className="bg-slate-50/50">
                     <th className="p-12 font-black uppercase italic tracking-widest text-[10px] text-slate-400"># Index</th>
                     <th className="p-12 font-black uppercase italic tracking-widest text-[10px] text-slate-400">Talaba Profili</th>
                     <th className="p-12 font-black uppercase italic tracking-widest text-[10px] text-slate-400">Tanlangan Kurs</th>
                     <th className="p-12 font-black uppercase italic tracking-widest text-[10px] text-slate-400">Holat</th>
                     <th className="p-12 font-black uppercase italic tracking-widest text-[10px] text-slate-400 text-right">Ro'yxat Sana</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {enrollments.map((en, i) => (
                     <tr key={i} className="hover:bg-slate-50/30 transition-all group">
                       <td className="p-12 font-black italic text-slate-200 text-3xl">{(i + 1).toString().padStart(2, '0')}</td>
                       <td className="p-12">
                         <div className="flex items-center gap-6">
                           <div className="w-16 h-16 bg-indigo-600 rounded-[1.8rem] flex items-center justify-center font-black text-white italic text-xl shadow-2xl shadow-indigo-100 group-hover:rotate-12 transition-transform duration-500">
                             {en.student_name?.charAt(0)}
                           </div>
                           <div>
                             <span className="font-black italic uppercase text-lg block text-slate-900">{en.student_name}</span>
                             <span className="text-[10px] text-slate-400 font-bold italic tracking-tighter lowercase">{en.student_email || 'example@edu.uz'}</span>
                           </div>
                         </div>
                       </td>
                       <td className="p-12">
                         <span className="font-black text-indigo-600 text-xs italic uppercase tracking-widest bg-indigo-50 px-5 py-2 rounded-full border border-indigo-100">
                            {en.course_title}
                         </span>
                       </td>
                       <td className="p-12">
                         <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-200"></div>
                            <span className="text-[10px] font-black uppercase italic text-emerald-600 tracking-widest">Aktiv</span>
                         </div>
                       </td>
                       <td className="p-12 text-right font-black italic text-slate-400 text-sm tracking-tighter">
                         {new Date(en.enrolled_at).toLocaleDateString()}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
               {enrollments.length === 0 && <div className="p-40 text-center text-slate-200 font-black uppercase tracking-widest italic">Hali talabalar yo'q</div>}
             </div>
          </div>
        )}

        {/* TAB 5: FINANCE */}
        {activeTab === 'finance' && (
           <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                 <div className="xl:col-span-2 bg-white p-16 lg:p-24 rounded-[5rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-16 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10 text-center md:text-left">
                      <p className="text-slate-400 font-black uppercase italic text-xs mb-8 tracking-[0.4em]">Yechib olish mumkin bo'lgan mablag'</p>
                      <h3 className="text-[6rem] lg:text-[10rem] font-black italic tracking-tighter text-slate-900 leading-none mb-12 flex items-baseline gap-4 justify-center md:justify-start">
                        {new Intl.NumberFormat('uz-UZ').format(finance.teacher)} <span className="text-xl font-black uppercase text-indigo-600 italic tracking-normal">UZS</span>
                      </h3>
                      <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        <button className="bg-slate-900 text-white px-14 py-7 rounded-[2.5rem] font-black italic uppercase tracking-widest text-xs flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all">
                          <Wallet size={22}/> <span>Balansni Yechish</span>
                        </button>
                        <button className="bg-white border-2 border-slate-100 text-slate-900 px-14 py-7 rounded-[2.5rem] font-black italic uppercase tracking-widest text-xs hover:border-indigo-600 transition-all">
                          Tarixni Ko'rish
                        </button>
                      </div>
                    </div>
                    <div className="w-80 h-80 bg-indigo-50 rounded-[5rem] flex items-center justify-center relative group-hover:rotate-6 transition-transform duration-700">
                       <DollarSign className="text-indigo-600 scale-150 animate-bounce" size={120}/>
                       <div className="absolute inset-0 border-8 border-indigo-100 rounded-[5rem] animate-ping opacity-20"></div>
                       <TrendingUp className="absolute top-10 right-10 text-indigo-200" size={48} />
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-8">
                    <div className="bg-slate-900 p-12 rounded-[4rem] text-white flex flex-col justify-center shadow-2xl relative overflow-hidden group">
                       <p className="text-slate-500 font-black uppercase italic text-[10px] mb-6 tracking-[0.3em]">Platforma komissiyasi (30%)</p>
                       <h4 className="text-4xl font-black italic text-red-400 group-hover:scale-110 transition-transform duration-500 tracking-tighter">
                          -{new Intl.NumberFormat('uz-UZ').format(finance.platform)} <span className="text-xs italic text-slate-600">UZS</span>
                       </h4>
                       <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                    </div>
                    <div className="bg-white p-12 rounded-[4rem] border-2 border-indigo-50 flex flex-col justify-center shadow-sm group">
                       <p className="text-indigo-300 font-black uppercase italic text-[10px] mb-6 tracking-[0.3em]">Muvaffaqiyatli Bitimlar</p>
                       <h4 className="text-5xl font-black italic text-slate-900 group-hover:translate-x-4 transition-transform duration-500">
                          {stats.total_students} <span className="text-xs font-black text-slate-200 italic">Sotuvlar soni</span>
                       </h4>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </main>

      {/* --- REUSABLE FULLSCREEN MODAL SYSTEM --- */}
      {modalType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12 bg-slate-900/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-[5rem] p-16 lg:p-24 relative shadow-[0_50px_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-700 no-scrollbar">
             
             {/* Close Button */}
             <button 
              onClick={() => setModalType(null)}
              className="absolute top-12 right-12 p-6 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-full transition-all group"
             >
               <X size={32} className="group-hover:rotate-90 transition-transform duration-500"/>
             </button>

             {/* Modal Header */}
             <div className="mb-20">
               <div className="flex items-center gap-3 mb-4">
                 <span className="w-10 h-1 bg-indigo-600 rounded-full"></span>
                 <p className="text-indigo-600 font-black uppercase italic tracking-[0.4em] text-[10px]">Tizimga Kiritish</p>
               </div>
               <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-none text-slate-900">
                 {editingItem ? 'Tahrirlash' : 'Yaratish'} <br/>
                 <span className="text-slate-200">/ {modalType === 'blog' ? 'Blog Post' : 'Video Kurs'}</span>
               </h2>
             </div>

             {/* FORM SECTIONS */}
             {modalType === 'course' ? (
               <form onSubmit={handleCourseAction} className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                  <div className="space-y-10">
                    <div className="group">
                      <label className="text-[10px] font-black uppercase italic text-slate-400 ml-6 mb-4 block tracking-widest group-focus-within:text-indigo-600 transition-colors">Kurs Sarlavhasi</label>
                      <input 
                        type="text" 
                        value={courseForm.title} 
                        onChange={e => setCourseForm({...courseForm, title: e.target.value})} 
                        className="w-full p-8 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-[2.5rem] outline-none font-black italic uppercase text-lg transition-all" 
                        placeholder="Masalan: Python Masterclass" 
                        required 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8">
                       <div className="group">
                         <label className="text-[10px] font-black uppercase italic text-slate-400 ml-6 mb-4 block tracking-widest">Kategoriya</label>
                         <select 
                          required
                          value={courseForm.category}
                          onChange={e => setCourseForm({...courseForm, category: e.target.value})}
                          className="w-full p-8 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-[2.5rem] outline-none font-black italic uppercase text-xs appearance-none transition-all"
                         >
                            <option value="">Tanlang</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                         </select>
                       </div>
                       <div className="group">
                         <label className="text-[10px] font-black uppercase italic text-slate-400 ml-6 mb-4 block tracking-widest">Daraja</label>
                         <select 
                          value={courseForm.level}
                          onChange={e => setCourseForm({...courseForm, level: e.target.value})}
                          className="w-full p-8 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-[2.5rem] outline-none font-black italic uppercase text-xs appearance-none transition-all"
                         >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                         </select>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                       <div className="group">
                         <label className="text-[10px] font-black uppercase italic text-slate-400 ml-6 mb-4 block tracking-widest">Narx (UZS)</label>
                         <input type="number" value={courseForm.price} onChange={e => setCourseForm({...courseForm, price: e.target.value})} className="w-full p-8 bg-slate-50 rounded-[2.5rem] outline-none font-black italic text-lg" required />
                       </div>
                       <div className="group">
                         <label className="text-[10px] font-black uppercase italic text-slate-400 ml-6 mb-4 block tracking-widest">Chegirma Narxi</label>
                         <input type="number" value={courseForm.discount_price} onChange={e => setCourseForm({...courseForm, discount_price: e.target.value})} className="w-full p-8 bg-slate-50 rounded-[2.5rem] outline-none font-black italic text-lg" />
                       </div>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="group">
                      <label className="text-[10px] font-black uppercase italic text-slate-400 ml-6 mb-4 block tracking-widest">Qisqa Ta'rif</label>
                      <textarea 
                        rows="3" 
                        value={courseForm.short_description} 
                        onChange={e => setCourseForm({...courseForm, short_description: e.target.value})} 
                        className="w-full p-8 bg-slate-50 rounded-[2.5rem] outline-none font-bold italic text-sm transition-all" 
                        required 
                      />
                    </div>

                    <div className="group">
                       <label className="text-[10px] font-black uppercase italic text-slate-400 ml-6 mb-4 block tracking-widest">Muqova Rasmi</label>
                       <div className="relative h-64 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center group-hover:border-indigo-200 transition-all overflow-hidden">
                          {courseForm.thumbnail ? (
                            <img src={courseForm.thumbnail instanceof File ? URL.createObjectURL(courseForm.thumbnail) : courseForm.thumbnail} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <>
                              <ImageIcon className="text-slate-200 mb-4" size={48} />
                              <p className="text-[10px] font-black uppercase italic text-slate-300">Rasm yuklash (PNG, JPG)</p>
                            </>
                          )}
                          <input 
                            type="file" 
                            onChange={e => setCourseForm({...courseForm, thumbnail: e.target.files[0]})} 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                          />
                       </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-slate-900 text-white p-10 rounded-[3rem] font-black italic uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:bg-indigo-600 transition-all shadow-2xl disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin"/> : <CheckCircle/>} 
                      <span>{editingItem ? 'O\'zgarishlarni Saqlash' : 'Kursni Nashr Etish'}</span>
                    </button>
                  </div>
               </form>
             ) : (
               /* BLOG FORM */
               <form onSubmit={handleBlogAction} className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                  <div className="space-y-10">
                    <div className="group">
                      <label className="text-[10px] font-black uppercase italic text-slate-400 ml-6 mb-4 block tracking-widest">Maqola Sarlavhasi</label>
                      <input 
                        type="text" 
                        value={blogForm.title} 
                        onChange={e => setBlogForm({...blogForm, title: e.target.value})} 
                        className="w-full p-8 bg-slate-50 rounded-[2.5rem] outline-none font-black italic uppercase text-xl" 
                        placeholder="Yangilik sarlavhasi..." 
                        required 
                      />
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-black uppercase italic text-slate-400 ml-6 mb-4 block tracking-widest">Maqola Matni</label>
                      <textarea 
                        rows="12" 
                        value={blogForm.content} 
                        onChange={e => setBlogForm({...blogForm, content: e.target.value})} 
                        className="w-full p-8 bg-slate-50 rounded-[3rem] outline-none font-bold italic text-sm leading-relaxed" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-10">
                    <div className="group">
                      <label className="text-[10px] font-black uppercase italic text-slate-400 ml-6 mb-4 block tracking-widest">Asosiy Rasm</label>
                      <div className="relative h-80 bg-slate-50 rounded-[3.5rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center group-hover:border-indigo-200 transition-all overflow-hidden">
                          {blogForm.featured_image ? (
                            <img src={blogForm.featured_image instanceof File ? URL.createObjectURL(blogForm.featured_image) : blogForm.featured_image} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <>
                              <Camera className="text-slate-200 mb-4" size={56} />
                              <p className="text-[10px] font-black uppercase italic text-slate-300">Rasm tanlang</p>
                            </>
                          )}
                          <input type="file" onChange={e => setBlogForm({...blogForm, featured_image: e.target.files[0]})} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-slate-900 text-white p-10 rounded-[3rem] font-black italic uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:bg-indigo-600 transition-all shadow-2xl"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin"/> : <Save/>} 
                      <span>{editingItem ? 'Maqolani Yangilash' : 'Blogni Chop Etish'}</span>
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