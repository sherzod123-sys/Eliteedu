// src/pages/Courses.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Search, Filter, Users, ArrowLeft } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Stable fetch — wrapped in useCallback so useEffect deps are satisfied
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('access_token');

      if (!token) {
        setError("Kurslarni ko'rish uchun tizimga kirishingiz kerak");
        setCourses([]);
        return;
      }

      const url = new URL(`${API_BASE}/api/courses/`);
      if (searchQuery) url.searchParams.append('search', searchQuery);
      if (selectedCategory) url.searchParams.append('category', selectedCategory);

      const res = await axios.get(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      let coursesList = [];
      if (res.data.results && Array.isArray(res.data.results)) {
        coursesList = res.data.results;
      } else if (Array.isArray(res.data)) {
        coursesList = res.data;
      } else if (res.data.data) {
        coursesList = res.data.data;
      }

      setCourses(coursesList);
    } catch (err) {
      console.error('Kurslarni yuklashda xatolik:', err);
      if (err.response?.status === 401) {
        setError('Sessiya tugagan. Qayta kirishingiz kerak.');
        localStorage.removeItem('access_token');
      } else {
        setError('Kurslarni yuklashda xatolik yuz berdi');
      }
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory]); // re-create only when filters change

  // Stable fetch — categories never depend on filters
  const fetchCategories = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_BASE}/api/courses/categories/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cats = res.data.results || res.data || [];
      setCategories(cats);
    } catch (err) {
      console.error('Kategoriyalar yuklanmadi:', err);
      setCategories([]);
    }
  }, []); // no deps — never needs to re-create

  // Initial load
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Debounced re-fetch when search query or category changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchCourses();
    }, 600);
    return () => clearTimeout(timeout);
  }, [fetchCourses]); // fetchCourses identity changes when searchQuery/selectedCategory change

  if (loading && courses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600"></div>
          <p className="mt-6 text-gray-600">Kurslar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" /> Orqaga
            </button>
            <h1 className="text-4xl font-bold text-gray-900">Barcha Kurslar</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-4 text-gray-400" />
            <input
              type="text"
              placeholder="Kurs nomini yoki mavzusini qidiring..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
            />
          </div>

          <div className="flex gap-3">
            <button className="px-6 py-4 border border-gray-300 rounded-2xl flex items-center gap-2 hover:bg-gray-50">
              <Filter className="w-5 h-5" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Kategoriyalar */}
        {categories.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xl font-semibold mb-4">Kategoriyalar</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-6 py-3 rounded-2xl font-medium transition-all ${
                  !selectedCategory
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-white border hover:bg-gray-50'
                }`}
              >
                Barchasi
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id || cat.slug)}
                  className={`px-6 py-3 rounded-2xl font-medium transition-all ${
                    selectedCategory === (cat.id || cat.slug)
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-white border hover:bg-gray-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl text-center mb-10">
            {error}
            <br />
            <Link to="/login" className="underline mt-2 inline-block">
              Tizimga kirish
            </Link>
          </div>
        )}

        {/* Kurslar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => navigate(`/course/${course.id}`)}
              className="bg-white rounded-3xl overflow-hidden shadow hover:shadow-2xl transition-all cursor-pointer group"
            >
              <div className="relative">
                <img
                  src={
                    course.thumbnail ||
                    'https://via.placeholder.com/400x250?text=Kurs+Rasmi'
                  }
                  alt={course.title}
                  className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {course.price === 0 && (
                  <div className="absolute top-4 left-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                    BEPUL
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="font-semibold text-xl line-clamp-2 mb-3 group-hover:text-indigo-600 transition-colors">
                  {course.title}
                </h3>

                <p className="text-gray-600 text-sm line-clamp-3 mb-6">
                  {course.short_description ||
                    "Bu kurs haqida qo'shimcha ma'lumot yo'q"}
                </p>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="font-bold text-2xl text-emerald-600">
                    {course.price > 0
                      ? `${Number(course.price).toLocaleString()} so'm`
                      : 'Bepul'}
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Users className="w-4 h-4" />
                    {course.total_students || 0}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {courses.length === 0 && !loading && !error && (
          <div className="text-center py-24">
            <BookOpen className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-gray-500 mb-3">
              Kurs topilmadi
            </h3>
            <p className="text-gray-400">
              Boshqa kalit so'z bilan qidirib ko'ring
            </p>
          </div>
        )}
      </div>
    </div>
  );
}