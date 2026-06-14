// src/components/Navbar.jsx — Yangilangan versiya: Kurslar dropdown bilan!

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X, Search, User, LogOut, Settings, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
  
  // Kurslar uchun state
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const navigate = useNavigate();

  // localStorage dan user ni olamiz
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAuthenticated = !!user;

  // Kurslarni API'dan yuklash
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const res = await fetch('http://127.0.0.1:8000/api/courses/');
        if (!res.ok) throw new Error('Kurslar yuklanmadi');
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Kurslarni navbar uchun yuklashda xato:', error);
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EduPlatform
              </span>
            </Link>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-8 ml-10">
              {/* Kurslar Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setCoursesDropdownOpen(true)}
                onMouseLeave={() => setCoursesDropdownOpen(false)}
              >
                <button className="flex items-center text-gray-700 hover:text-blue-600 font-medium transition">
                  Kurslar
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${coursesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {coursesDropdownOpen && (
                  <div className="absolute left-0 mt-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="py-3">
                      {loadingCourses ? (
                        <div className="px-6 py-8 text-center text-gray-500">Yuklanmoqda...</div>
                      ) : courses.length === 0 ? (
                        <div className="px-6 py-8 text-center text-gray-500">Hozircha kurs yo‘q</div>
                      ) : (
                        courses.slice(0, 8).map((course) => (  // Faqat 8 tani ko‘rsatamiz
                          <Link
                            key={course.id}
                            to={`/course/${course.id}`}
                            className="block px-6 py-3 hover:bg-gray-50 transition flex items-center justify-between"
                            onClick={() => setCoursesDropdownOpen(false)}
                          >
                            <span className="font-medium text-gray-800">{course.title}</span>
                            <span className="text-sm text-blue-600">→</span>
                          </Link>
                        ))
                      )}
                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <Link
                          to="/courses"
                          className="block px-6 py-3 text-center font-semibold text-blue-600 hover:bg-blue-50 transition"
                          onClick={() => setCoursesDropdownOpen(false)}
                        >
                          Barcha kurslarni ko‘rish
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link to="/about" className="text-gray-700 hover:text-blue-600 font-medium transition">
                Biz haqimizda
              </Link>
              <Link to="/blog" className="text-gray-700 hover:text-blue-600 font-medium transition">
                Blog
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition">
                Aloqa
              </Link>
            </div>
          </div>

          {/* Right side — qolgan qismi o‘zgarmadi */}
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="hidden md:block relative">
              <input
                type="text"
                placeholder="Kurs qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </form>

            {/* User menu — o‘zgarmadi */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.full_name?.[0]?.toUpperCase() || user?.phone?.slice(-2) || 'U'}
                  </div>
                  <span className="font-medium hidden lg:block">
                    {user?.full_name || user?.phone}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2">
                    <Link to="/dashboard" className="block px-6 py-3 text-gray-700 hover:bg-gray-50 transition flex items-center gap-3" onClick={() => setUserMenuOpen(false)}>
                      <Settings className="w-5 h-5" /> Dashboard
                    </Link>
                    <Link to="/profile" className="block px-6 py-3 text-gray-700 hover:bg-gray-50 transition flex items-center gap-3" onClick={() => setUserMenuOpen(false)}>
                      <User className="w-5 h-5" /> Profil
                    </Link>
                    <hr className="my-2" />
                    <button onClick={handleLogout} className="w-full text-left px-6 py-3 text-red-600 hover:bg-red-50 transition flex items-center gap-3">
                      <LogOut className="w-5 h-5" /> Chiqish
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link to="/login" className="px-6 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition">
                  Kirish
                </Link>
                <Link to="/register" className="px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition">
                  Ro'yxatdan o'tish
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu — oddiy holatda qoldirdim, agar mobil uchun ham dropdown kerak bo‘lsa aytasiz */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Kurs qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </form>

            <Link to="/courses" className="block py-3 text-gray-700 hover:text-blue-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Barcha Kurslar
            </Link>
            <Link to="/about" className="block py-3 text-gray-700 hover:text-blue-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Biz haqimizda
            </Link>
            {/* Mobil uchun ham kurslar ro‘yxatini qo‘shish mumkin, agar kerak bo‘lsa aytasiz */}

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block py-3 text-gray-700 hover:text-blue-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/profile" className="block py-3 text-gray-700 hover:text-blue-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Profil
                </Link>
                <button onClick={handleLogout} className="w-full text-left py-3 text-red-600 font-medium">
                  Chiqish
                </button>
              </>
            ) : (
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <Link to="/login" className="block w-full text-center py-3 text-blue-600 border border-blue-600 rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Kirish
                </Link>
                <Link to="/register" className="block w-full text-center py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold" onClick={() => setMobileMenuOpen(false)}>
                  Ro'yxatdan o'tish
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}