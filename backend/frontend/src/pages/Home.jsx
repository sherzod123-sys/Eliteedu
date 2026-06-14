// src/pages/Dashboard.jsx  (file was named Home — keep export name as Home)
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BookOpen, Play, Star, ArrowRight, ChevronLeft, ChevronRight, CheckCircle,
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

// ─── Static data hoisted outside component ────────────────────────────────────
const SLIDES = [
  {
    title: 'EduPlatform',
    subtitle: "O'quv markazingizni raqamlashtiring",
    desc: "Zamonaviy platforma bilan talabalar, kurslar va to'lovlarni oson boshqaring",
    bg: 'from-blue-700 via-indigo-700 to-violet-700',
  },
  {
    title: 'Cheksiz Imkoniyatlar',
    subtitle: "Bir platformada barcha o'quv markazlaringizni boshqaring",
    desc: "Multi-tenant tizim — biznesingizni yangi bosqichga olib chiqing",
    bg: 'from-purple-700 via-pink-700 to-rose-700',
  },
  {
    title: "Professional Ta'lim",
    subtitle: 'HD video darslar, interaktiv testlar va avtomatik sertifikatlar',
    desc: "Eng yuqori sifatli o'quv tajribasi",
    bg: 'from-rose-700 via-orange-600 to-amber-600',
  },
  {
    title: 'Real-time Analitika',
    subtitle: "Har bir talaba va kurs haqida to'liq nazorat",
    desc: "Ma'lumotlar asosida tez qaror qabul qiling",
    bg: 'from-teal-700 via-cyan-700 to-indigo-700',
  },
];
// ──────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Auto slider — SLIDES.length is stable (module-level constant)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Scroll-to-top button visibility
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};
        const res = await axios.get(`${API_BASE}/api/courses/`, config);
        const list =
          res.data.results ||
          (Array.isArray(res.data) ? res.data : []) ||
          res.data.data ||
          [];
        setCourses(list);
      } catch (err) {
        console.error('Kurslarni olishda xatolik:', err.response?.data || err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* ───── HERO SLIDER ───── */}
      <div className="relative h-screen overflow-hidden">
        {SLIDES.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div
              className={`h-full bg-gradient-to-br ${slide.bg} flex items-center justify-center text-white relative`}
            >
              <div className="absolute top-20 right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-20 left-10 w-60 h-60 bg-white/5 rounded-full blur-2xl pointer-events-none" />

              <div className="max-w-5xl mx-auto text-center px-6 relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>O'zbekistondagi #1 ta'lim platformasi</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 leading-none">
                  {slide.title}
                </h1>
                <p className="text-2xl md:text-3xl mb-4 text-white/90 font-medium">
                  {slide.subtitle}
                </p>
                <p className="text-lg max-w-2xl mx-auto mb-10 text-white/75">
                  {slide.desc}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/courses')}
                    className="group px-10 py-4 bg-white text-indigo-700 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl cursor-pointer"
                  >
                    Kurslarni ko'rish
                    <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="px-10 py-4 border-2 border-white/70 hover:border-white rounded-2xl font-semibold text-lg hover:bg-white/15 transition-all cursor-pointer"
                  >
                    Bepul sinov
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Prev / Next */}
        <button
          onClick={() =>
            setActiveSlide((p) => (p - 1 + SLIDES.length) % SLIDES.length)
          }
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={() =>
            setActiveSlide((p) => (p + 1) % SLIDES.length)
          }
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeSlide
                  ? 'w-10 bg-white'
                  : 'w-5 bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ───── MASHHUR KURSLAR ───── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-indigo-600 text-sm font-semibold uppercase tracking-widest mb-2">
              TOP KURSLAR
            </p>
            <h2 className="text-4xl font-bold tracking-tight">
              Mashhur Kurslar
            </h2>
            <p className="text-gray-500 mt-2">
              Eng ko'p talabalar tanlagan darslar
            </p>
          </div>
          <Link
            to="/courses"
            className="hidden sm:flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors"
          >
            Barchasini ko'rish <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse"
              >
                <div className="h-44 bg-gray-200" />
                <div className="p-5">
                  <div className="h-4 bg-gray-200 rounded mb-3 w-3/4" />
                  <div className="h-3 bg-gray-100 rounded mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {courses.slice(0, 8).map((course) => (
              <Link
                key={course.id}
                to={`/course/${course.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:-translate-y-1 transition-all duration-300 block no-underline text-inherit"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={
                      course.thumbnail ||
                      `https://placehold.co/400x240/6366f1/ffffff?text=${encodeURIComponent(
                        course.title?.charAt(0) || 'E'
                      )}`
                    }
                    alt={course.title}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src =
                        'https://placehold.co/400x240/6366f1/ffffff?text=EP';
                    }}
                  />
                  {course.rating && (
                    <div className="absolute top-3 right-3 bg-white/95 px-2 py-1 rounded-lg flex items-center gap-1 text-xs shadow-md">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                      <span className="font-medium">{course.rating}</span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-base line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-gray-400 text-xs line-clamp-2 mb-4 leading-relaxed">
                    {course.short_description || "Yuqori sifatli o'quv kursi"}
                  </p>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="text-base font-bold text-emerald-600">
                      {course.price > 0
                        ? `${Number(course.price).toLocaleString('uz-UZ')} so'm`
                        : 'Bepul'}
                    </span>
                    {typeof course.total_students === 'number' && (
                      <span className="text-xs text-gray-400">
                        👥 {course.total_students.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-400 mb-4">
              Hozircha kurslar mavjud emas
            </p>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Birinchi kursni yarating
            </button>
          </div>
        )}

        <div className="flex justify-center mt-8 sm:hidden">
          <Link
            to="/courses"
            className="flex items-center gap-2 text-indigo-600 text-sm font-medium"
          >
            Barchasini ko'rish <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ───── HOW IT WORKS ───── */}
      <div className="py-20 bg-gradient-to-br from-indigo-50 to-violet-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-indigo-600 text-sm font-semibold uppercase tracking-widest mb-3">
            QANDAY ISHLAYDI
          </p>
          <h2 className="text-4xl font-bold mb-14">3 qadamda boshlang</h2>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-px bg-indigo-200 z-0" />
            {[
              {
                step: '01',
                title: "Ro'yxatdan o'ting",
                desc: '2 daqiqada bepul hisob yarating',
                icon: '👤',
              },
              {
                step: '02',
                title: 'Kursni tanlang',
                desc: "O'zingizga mos kursni toping va boshlang",
                icon: '🎯',
              },
              {
                step: '03',
                title: "O'rganib boring",
                desc: "Sertifikat oling va karyerangizni o'zgartiring",
                icon: '🏆',
              },
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-md flex items-center justify-center text-4xl mb-5 border border-gray-100">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-indigo-400 tracking-widest mb-1">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/register')}
            className="mt-12 px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold text-base transition-all shadow-lg hover:shadow-indigo-300 cursor-pointer"
          >
            Hoziroq boshlang →
          </button>
        </div>
      </div>

      {/* ───── FINAL CTA ───── */}
      <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 py-24 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="inline-block bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            🎉 14 kunlik bepul sinov
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight leading-tight">
            O'quv markazingizni <br className="hidden md:block" />
            bugun raqamlashtiring
          </h2>
          <p className="text-lg mb-10 text-white/80">
            Hech qanday kredit karta talab qilinmaydi • Istalgan vaqt bekor
            qilish mumkin
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-12 py-4 bg-white text-indigo-700 rounded-2xl text-lg font-bold hover:scale-105 active:scale-95 transition-all shadow-2xl cursor-pointer"
            >
              BEPUL BOSHLASH
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="px-12 py-4 border-2 border-white/60 hover:border-white rounded-2xl text-lg font-semibold hover:bg-white/10 transition-all cursor-pointer"
            >
              Demo so'rash
            </button>
          </div>
        </div>
      </div>

      {/* ───── FOOTER ───── */}
      <footer className="bg-slate-900 text-gray-400 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center text-white font-black text-sm">
                  EP
                </div>
                <span className="text-white font-bold text-lg">
                  EduPlatform
                </span>
              </div>
              <p className="text-sm leading-relaxed text-gray-500">
                O'zbekistondagi eng zamonaviy ta'lim boshqaruv platformasi.
              </p>
            </div>

            {/* Links */}
            {[
              {
                title: 'Platforma',
                links: [
                  { label: 'Kurslar', to: '/courses' },
                  { label: 'Markazlar', to: '/centers' },
                ],
              },
              {
                title: 'Kompaniya',
                links: [
                  { label: 'Biz haqimizda', to: '/about' },
                  { label: "Bog'lanish", to: '/contact' },
                ],
              },
              {
                title: 'Yordam',
                links: [
                  { label: 'FAQ', to: '/faq' },
                  { label: 'Maxfiylik siyosati', to: '/privacy' },
                ],
              },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-white font-semibold text-sm mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <Link
                        to={link.to}
                        className="text-sm text-gray-500 hover:text-gray-300 transition-colors no-underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-sm text-gray-600">
              © 2026 EduPlatform. Barcha huquqlar himoyalangan.
            </p>
            <p className="text-xs text-gray-700">
              Toshkent, O'zbekiston 🇺🇿
            </p>
          </div>
        </div>
      </footer>

      {/* ───── SCROLL TO TOP ───── */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 hover:-translate-y-1 transition-all z-50 cursor-pointer ${
          showScrollTop
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Tepaga"
      >
        ↑
      </button>
    </div>
  );
}