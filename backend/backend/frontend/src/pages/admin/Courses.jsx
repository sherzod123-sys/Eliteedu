// src/pages/Courses.jsx — YAKUNIY VA 100% ISHLAYDIGAN VERSIYA
import React, { useState, useEffect } from 'react';
import CourseCard from '../components/CourseCard';
import toast from 'react-hot-toast';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/courses/');
        
        if (!res.ok) {
          throw new Error(`HTTP xato: ${res.status}`);
        }

        const data = await res.json();

        let coursesList = [];

        if (Array.isArray(data)) {
          coursesList = data;
        } else if (data.results && Array.isArray(data.results)) {
          coursesList = data.results; // DRF pagination
        } else {
          console.warn('Kutilmagan format:', data);
          coursesList = [];
        }

        console.log('Yuklangan kurslar:', coursesList); // <--- Tekshirish uchun
        setCourses(coursesList);
      } catch (err) {
        console.error('Kurs yuklash xatosi:', err);
        toast.error('Kurslarni yuklashda xatolik');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Kurslar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Barcha Kurslar</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {courses.length} ta kurs mavjud — o‘zingizga mosini tanlang!
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <p className="text-3xl text-gray-600 mb-4">Hozircha kurs topilmadi</p>
            <p className="text-xl text-gray-500">Yangi kurslar tez orada qo‘shiladi!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}