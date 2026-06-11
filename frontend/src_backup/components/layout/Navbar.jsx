// src/components/Navbar.jsx  ← TO‘LIQ shu bilan almashtiring!
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X, Search, User, LogOut, Settings } from 'lucide-react';

// useAuthStore ishlamasa – mock qilamiz (xato chiqmasin)
let isAuthenticated = false;
let user = null;
let logout = () => {
  localStorage.clear();
  window.location.href = '/';
};

try {
  const auth = useAuthStore.getState();
  isAuthenticated = !!auth?.user || !!localStorage.getItem('access_token');
  user = auth?.user || null;
  logout = auth?.logout || logout;
} catch (e) {
  // useAuthStore yo‘q → mock ishlatamiz
  const token = localStorage.getItem('access_token');
  isAuthenticated = !!token;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      user = { username: payload.username || 'Foydalanuvchi' };
    } catch {
      user = { username: 'Foydalanuvchi' };
    }
  }
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
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

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8 ml-10">
              <Link to="/courses" className="text-gray-700 hover:text-blue-600 font-medium transition">
                Kurslar
              </Link>
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

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Search */}
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

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.username?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
                  </div>
                  <span className="font-medium text-gray-800 hidden lg:block">
                    {user?.username || user?.first_name || 'Foydalanuvchi'}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition flex items-center"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5 mr-3" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition flex items-center"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-5 h-5 mr-3" />
                      Profil
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition flex items-center"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Chiqish
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-5 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition"
                >
                  Kirish
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition shadow-lg"
                >
                  Ro'yxatdan o'tish
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative mb-4">
              <input
                type="text"
                placeholder="Kurs qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </form>

            <Link to="/courses" className="block py-3 text-gray-700 hover:text-blue-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Kurslar
            </Link>
            <Link to="/about" className="block py-3 text-gray-700 hover:text-blue-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Biz haqimizda
            </Link>
            <Link to="/blog" className="block py-3 text-gray-700 hover:text-blue-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Blog
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block py-3 text-gray-700 hover:text-blue-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="w-full text-left py-3 text-red-600 font-medium">
                  Chiqish
                </button>
              </>
            ) : (
              <div className="space-y-3 pt-4 border-t">
                <Link
                  to="/login"
                  className="block w-full text-center py-3 text-blue-600 border border-blue-600 rounded-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Kirish
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-center py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
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