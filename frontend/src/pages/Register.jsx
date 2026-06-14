import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  BookOpen, Users, Award, TrendingUp, Zap, Shield, BarChart, 
  Moon, Sun, Play, Star, ArrowRight, ChevronLeft, ChevronRight,
  CheckCircle, Clock, Globe, Heart, Award as Trophy 
} from 'lucide-react';

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auto Slider
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 4);
    }, 4800);
    return () => clearInterval(interval);
  }, []);

  // Scroll Top Button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Kurslarni yuklash
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        const res = await axios.get("/api/courses/", config);
        
        let coursesList = res.data.results || 
                         (Array.isArray(res.data) ? res.data : []) || 
                         res.data.data || [];
        setCourses(coursesList);
      } catch (err) {
        console.error("Kurslarni olishda xatolik:", err.response?.data || err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const slides = [
    { 
      title: "EduPlatform", 
      subtitle: "O'quv markazingizni raqamlashtiring", 
      desc: "Zamonaviy platforma bilan talabalar, kurslar va to'lovlarni oson boshqaring",
      bg: "from-blue-600 via-indigo-600 to-violet-600" 
    },
    { 
      title: "Cheksiz Imkoniyatlar", 
      subtitle: "Bir platformada barcha o'quv markazlaringizni boshqaring", 
      desc: "Multi-tenant tizim — biznesingizni yangi bosqichga olib chiqing",
      bg: "from-purple-600 via-pink-600 to-rose-600" 
    },
    { 
      title: "Professional Ta'lim Tizimi", 
      subtitle: "HD video darslar, interaktiv testlar va avtomatik sertifikatlar", 
      desc: "Eng yuqori sifatli o'quv tajribasi",
      bg: "from-rose-600 via-orange-600 to-amber-600" 
    },
    { 
      title: "Real-time Analitika", 
      subtitle: "Har bir talaba va kurs haqida to'liq nazorat", 
      desc: "Ma'lumotlar asosida tez qaror qabul qiling",
      bg: "from-indigo-600 via-cyan-600 to-teal-600" 
    },
  ];

  const features = [
    { icon: <Zap className="w-14 h-14" />, title: "Tez Ishga Tushirish", description: "15 daqiqada to'liq ishlaydigan o'quv markazi", color: "text-amber-500" },
    { icon: <Shield className="w-14 h-14" />, title: "Xavfsiz To'lovlar", description: "Payme, Click, UzCard, Visa, Mastercard", color: "text-emerald-500" },
    { icon: <BarChart className="w-14 h-14" />, title: "Kuchli Analitika", description: "Real-time dashboard va chuqur hisobotlar", color: "text-blue-500" },
    { icon: <Users className="w-14 h-14" />, title: "Multi-tenant Tizim", description: "Cheksiz o'quv markazlarini bir platformada", color: "text-violet-500" },
    { icon: <Globe className="w-14 h-14" />, title: "24/7 Qo'llab-quvvatlash", description: "Tez va professional yordam xizmati", color: "text-rose-500" },
    { icon: <Clock className="w-14 h-14" />, title: "To'liq Avtomatlashtirish", description: "To'lov, sertifikat va xabarlar avtomatik", color: "text-cyan-500" },
  ];

  const stats = [
    { value: "5200+", label: "Faol Talabalar", icon: <Users className="w-12 h-12" /> },
    { value: "280+", label: "Premium Kurslar", icon: <BookOpen className="w-12 h-12" /> },
    { value: "450+", label: "Malakali O'qituvchilar", icon: <Award className="w-12 h-12" /> },
    { value: "65+", label: "Faol Markazlar", icon: <TrendingUp className="w-12 h-12" /> },
  ];

  const testimonials = [
    {
      name: "Aziza Karimova",
      role: "EduStar Academy Rahbari",
      text: "EduPlatform bizning markazimizni butunlay o'zgartirdi. Talabalar soni 4 baravar oshdi va barcha jarayonlar juda qulay.",
      avatar: "https://i.pravatar.cc/150?u=aziza"
    },
    {
      name: "Rustam Alimov",
      role: "IT Academy asoschisi",
      text: "Eng zamonaviy va chiroyli platforma. Analitika va hisobotlar ajoyib ishlaydi. Barchaga tavsiya qilaman!",
      avatar: "https://i.pravatar.cc/150?u=rustam"
    },
    {
      name: "Dilnoza Shermatova",
      role: "Language Center",
      text: "To'lovlar, sertifikatlar va talabalar bilan ishlash endi juda oson. Platforma haqiqatan ham professional.",
      avatar: "https://i.pravatar.cc/150?u=dilnoza"
    },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-inner">EP</div>
            <div>
              <div className="font-bold text-3xl tracking-tighter text-indigo-700 dark:text-white">EduPlatform</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 -mt-1">PROFESSIONAL EDUCATION</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-10 text-lg font-medium">
            <Link to="/courses" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Kurslar</Link>
            <Link to="/centers" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Markazlar</Link>
            <Link to="/pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Narxlar</Link>
            <Link to="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Biz haqimizda</Link>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className="p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link to="/login" className="px-7 py-3 rounded-2xl border border-gray-300 dark:border-slate-600 hover:border-indigo-300 transition font-medium">Kirish</Link>
            <Link to="/register" className="px-7 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold transition shadow-lg">Bepul boshlash</Link>
          </div>
        </div>
      </nav>

      {/* HERO SLIDER */}
      <div className="relative h-screen pt-20 overflow-hidden">
        {slides.map((slide, index) => (
          <div 
            key={index} 
            className={`absolute inset-0 transition-all duration-1000 ${index === activeSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className={`h-full bg-gradient-to-br ${slide.bg} flex items-center justify-center text-white relative`}>
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="max-w-5xl mx-auto text-center px-6 relative z-10">
                <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-6 leading-none">{slide.title}</h1>
                <p className="text-4xl md:text-5xl mb-8 text-white/90">{slide.subtitle}</p>
                <p className="text-2xl max-w-3xl mx-auto mb-12 text-white/80">{slide.desc}</p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link 
                    to="/courses" 
                    className="group px-12 py-6 bg-white text-indigo-700 rounded-3xl font-semibold text-2xl flex items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl"
                  >
                    Kurslarni ko'rish
                    <Play className="w-7 h-7 group-hover:translate-x-1 transition" />
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-12 py-6 border-2 border-white/80 hover:border-white rounded-3xl font-semibold text-2xl hover:bg-white/10 transition-all"
                  >
                    Bepul sinov
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slider Dots */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              className={`h-3 rounded-full transition-all duration-300 ${i === activeSlide ? 'w-14 bg-white' : 'w-8 bg-white/60 hover:bg-white/80'}`}
            />
          ))}
        </div>
      </div>

      {/* STATS SECTION */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-10 text-center border border-gray-100 dark:border-slate-700 hover:-translate-y-3 transition-all">
              <div className="flex justify-center mb-6 text-indigo-600 dark:text-indigo-400">{stat.icon}</div>
              <div className="text-5xl font-bold text-gray-900 dark:text-white mb-3">{stat.value}</div>
              <div className="text-xl text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MASHHUR KURSLAR - KICHIK KARTALAR */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-5xl font-bold tracking-tight">Mashhur Kurslar</h2>
            <p className="text-2xl text-gray-600 dark:text-gray-400 mt-3">Eng ko'p talabalar tanlagan darslar</p>
          </div>
          <Link to="/courses" className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 text-xl font-medium">
            Barchasini ko'rish <ArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-32">
            <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : courses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.slice(0, 8).map((course) => (
              <Link
                key={course.id}
                to={`/course/${course.id}`}
                className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 dark:border-slate-700 hover:-translate-y-2 transition-all duration-500"
              >
                <div className="relative">
                  <img
                    src={course.thumbnail || 'https://via.placeholder.com/400x250?text=EduPlatform'}
                    alt={course.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900 px-3 py-1 rounded-full flex items-center gap-1 text-sm shadow">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" /> 4.9
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-semibold text-xl line-clamp-2 mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-6">
                    {course.short_description || "Yuqori sifatli o'quv kursi"}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {course.price > 0 ? `${Number(course.price).toLocaleString()} so'm` : 'Bepul'}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">👥 {course.total_students || 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white dark:bg-slate-800 rounded-3xl text-2xl text-gray-500">
            Hozircha mashhur kurslar mavjud emas
          </div>
        )}
      </div>

      {/* FEATURES SECTION */}
      <div className={`py-24 ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6">Nima uchun EduPlatform?</h2>
            <p className="text-2xl text-gray-600 dark:text-gray-400">Eng yaxshi o'quv markazlari bizni tanlaydi</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group p-10 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-500 hover:shadow-2xl hover:-translate-y-3 transition-all"
              >
                <div className={`${feature.color} mb-8 group-hover:scale-110 transition-transform duration-300`}>{feature.icon}</div>
                <h3 className="text-3xl font-bold mb-5">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xl leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="py-24 bg-gradient-to-br from-gray-100 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-16">Mijozlarimiz nima deydi?</h2>
          
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-16 shadow-xl">
            <img 
              src={testimonials[currentTestimonial].avatar} 
              alt="" 
              className="w-28 h-28 rounded-full mx-auto mb-10 border-4 border-indigo-200"
            />
            <p className="text-3xl italic leading-relaxed text-gray-700 dark:text-gray-300 mb-12">
              “{testimonials[currentTestimonial].text}”
            </p>
            <div className="text-2xl font-semibold">{testimonials[currentTestimonial].name}</div>
            <div className="text-indigo-600 dark:text-indigo-400 mt-2">{testimonials[currentTestimonial].role}</div>
          </div>

          <div className="flex justify-center gap-6 mt-12">
            <button 
              onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow hover:bg-gray-100 transition"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
            <button 
              onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
              className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow hover:bg-gray-100 transition"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>

      {/* FINAL CTA */}
      <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 py-32 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-6xl font-bold mb-8 tracking-tight">O'quv markazingizni hozir boshlang</h2>
          <p className="text-3xl mb-12 text-white/90">14 kunlik bepul sinov • Hech qanday to'lov talab qilinmaydi</p>
          <Link 
            to="/register"
            className="inline-block px-20 py-8 bg-white text-indigo-700 rounded-3xl text-3xl font-bold hover:scale-105 transition-all shadow-2xl"
          >
            BEPUL BOSHLASH
          </Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex justify-center items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl">EP</div>
            <span className="text-4xl font-bold text-gray-900 dark:text-white">EduPlatform</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400">© 2026 EduPlatform. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-4 bg-indigo-600 text-white rounded-2xl shadow-2xl hover:bg-indigo-700 transition-all z-50"
        >
          ↑
        </button>
      )}
    </div>
  );
}