// src/pages/Courses.jsx — To‘g‘rilangan versiya: paginatsiyani hisobga oladi!

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, Filter, Star, Clock, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const url = new URL('http://127.0.0.1:8000/api/courses/');
      if (searchQuery) url.searchParams.append('q', searchQuery);
      if (selectedCategory) url.searchParams.append('category', selectedCategory);

      const res = await fetch(url);
      if (!res.ok) throw new Error('Kurslar yuklanmadi');

      const data = await res.json();

      // PAGINATSIYANI HISOBGA OLAMIZ: results ichida bo‘lsa undan olamiz
      let coursesList = [];
      if (data.results && Array.isArray(data.results)) {
        coursesList = data.results;
      } else if (Array.isArray(data)) {
        coursesList = data;
      }

      setCourses(coursesList);
    } catch (error) {
      console.error(error);
      toast.error('Kurslarni yuklashda xatolik');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/courses/categories/');
      if (!res.ok) throw new Error('Kategoriyalar yuklanmadi');
      const data = await res.json();

      let categoriesList = [];
      if (data.results && Array.isArray(data.results)) {
        categoriesList = data.results;
      } else if (Array.isArray(data)) {
        categoriesList = data;
      }

      setCategories(categoriesList);
    } catch (error) {
      console.error('Kategoriyalar yuklashda xatolik:', error);
      setCategories([]);
    }
  };

  // Qidiruv va kategoriya o‘zgarganda qayta yuklash
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCourses();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Kurslar</h1>
          <div className="flex items-center gap-4">
            <form onSubmit={(e) => e.preventDefault()} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3" />
                <input
                  type="text"
                  placeholder="Kurs nomini qidiring..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>
            <button className="px-4 py-3 border border-gray-300 rounded-xl">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Kategoriyalar */}
        {categories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Kategoriyalar</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-6 py-3 rounded-full font-medium transition ${
                  !selectedCategory ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Barchasi
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id || category.slug)}
                  className={`px-6 py-3 rounded-full font-medium transition ${
                    selectedCategory === (category.id || category.slug)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Kurslar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition cursor-pointer"
              onClick={() => navigate(`/course/${course.id}`)}
            >
              <img
                src={course.thumbnail || 'https://via.placeholder.com/300x200'}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="font-bold text-xl mb-3 line-clamp-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.short_description}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-600">
                    {course.price > 0 ? `${course.price} so'm` : 'Bepul'}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.total_students || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bo‘sh holat */}
        {courses.length === 0 && !loading && (
          <div className="text-center py-20">
            <BookOpen className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-600 mb-4">Hozircha kurs topilmadi</h3>
            <p className="text-gray-500">Yangi kurslar tez orada qo‘shiladi!</p>
          </div>
        )}
      </div>
    </div>
  );
}