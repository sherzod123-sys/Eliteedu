// src/pages/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BookOpen, Clock, Award, User, ChevronRight, Star, Users } from 'lucide-react';

// localStorage dan user ni olish
const getUser = () => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedLessons: 0,
    totalHours: 0,
    certificates: 0
  });

  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUserCourses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await axios.get('http://127.0.0.1:8000/api/courses/my_courses/', { headers });
        const myCourses = res.data.results || res.data || [];

        setCourses(myCourses);

        const totalCourses = myCourses.length;
        const completedLessons = myCourses.reduce((acc, course) => 
          acc + (course.completed_lessons || 0), 0
        );

        setStats({
          totalCourses,
          completedLessons,
          totalHours: Math.floor(completedLessons * 0.5),
          certificates: Math.floor(totalCourses * 0.3)
        });
      } catch (error) {
        console.error('Dashboard maʼlumotlari xatosi:', error);
        toast.error('Maʼlumotlarni yuklashda xatolik');
      } finally {
        setLoading(false);
      }
    };

    fetchUserCourses();
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Tizimdan chiqildi');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Tizimga kirish kerak</h2>
          <Link to="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Tizimga kirish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Xush kelibsiz, {user?.full_name || user?.first_name || user?.username || 'Foydalanuvchi'}!
          </h1>
          <p className="text-gray-600">
            Bugun nima o'rganmoqchisiz?
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Jami Kurslar</p>
                <p className="text-3xl font-bold mt-2">{stats.totalCourses}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Bajarilgan Darslar</p>
                <p className="text-3xl font-bold mt-2">{stats.completedLessons}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {stats.totalHours} soat o'qilgan
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Sertifikatlar</p>
                <p className="text-3xl font-bold mt-2">{stats.certificates}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Reyting</p>
                <div className="flex items-center mt-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current mr-1" />
                  <span className="text-3xl font-bold">4.8</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Kurslar va profil */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Mening Kurslarim</h2>
                <Link to="/courses" className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
                  Barchasi <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Hali kursga yozilmagansiz</h3>
                  <Link to="/courses" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
                    Kurslarni ko‘rish
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                            {course.title?.[0] || 'K'}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{course.title}</h3>
                            <p className="text-gray-600 text-sm">
                              {course.category_name || course.category?.name || 'Umumiy'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div>
                            <span className="text-2xl font-bold">
                              {course.progress || 0}%
                            </span>
                            <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                              <div 
                                className={`h-2 rounded-full ${(course.progress || 0) >= 80 ? 'bg-green-500' : (course.progress || 0) >= 50 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                                style={{ width: `${course.progress || 0}%` }}
                              ></div>
                            </div>
                          </div>
                          <Link 
                            to={`/course/${course.id}`}
                            className="inline-block mt-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium"
                          >
                            Davom etish
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Profil va tavsiyalar */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {user?.full_name?.[0]?.toUpperCase() || user?.first_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-xl">
                    {user?.full_name || user?.first_name || user?.username}
                  </h3>
                  <p className="text-gray-600">{user?.email || user?.phone}</p>
                  <p className="text-blue-600 text-sm font-medium">
                    {user?.role === 'teacher' ? 'O\'qituvchi' : 'Talaba'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/profile')}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700"
              >
                <User className="w-5 h-5 mr-2" />
                Profilni tahrirlash
              </button>

              <button
                onClick={() => {
                  localStorage.clear();
                  toast.success('Tizimdan chiqildi');
                  navigate('/login');
                }}
                className="w-full flex items-center justify-center px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium mt-3"
              >
                Tizimdan chiqish
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-4">Tavsiya etiladi</h3>
              <p className="mb-6">
                Sizning o'qish uslubingizga mos 3 ta yangi kursni taklif qilamiz.
              </p>
              <Link 
                to="/courses"
                className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Ko'rish
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
