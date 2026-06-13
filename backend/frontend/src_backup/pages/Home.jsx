// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Users, Award, TrendingUp, Zap, Shield, BarChart } from 'lucide-react';

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://127.0.0.1:8000/api/courses/");
        
        let coursesList = [];
        if (res.data.results && Array.isArray(res.data.results)) {
          coursesList = res.data.results;
        } else if (Array.isArray(res.data)) {
          coursesList = res.data;
        }
        
        setCourses(coursesList);
      } catch (err) {
        console.error("Kurslarni olishda xatolik:", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const slides = [
    { title: "O'quv markazingizni raqamlashtiring", subtitle: "Zamonaviy platforma bilan talabalar, kurslar va to'lovlarni oson boshqaring", bg: "from-blue-600 to-purple-600" },
    { title: "Cheksiz imkoniyatlar", subtitle: "Bir platformada barcha o'quv markazlaringizni boshqaring", bg: "from-purple-600 to-pink-600" },
    { title: "Professional ta'lim tizimi", subtitle: "Video darslar, testlar, sertifikatlar - barchasi bir joyda", bg: "from-pink-600 to-orange-600" },
  ];

  const features = [
    { icon: <Zap className="w-8 h-8" />, title: "Tez ishga tushirish", description: "15 daqiqada o'z o'quv markazingizni onlayn olib chiqing", color: "text-yellow-500" },
    { icon: <Shield className="w-8 h-8" />, title: "Xavfsiz to'lovlar", description: "Barcha to'lovlar xavfsiz va shaffof tarzda amalga oshiriladi", color: "text-green-500" },
    { icon: <BarChart className="w-8 h-8" />, title: "Analytics va hisobotlar", description: "Real-time statistika va tahlillar bilan to'liq nazorat", color: "text-blue-500" },
    { icon: <Users className="w-8 h-8" />, title: "Multi-tenant tizim", description: "Cheksiz o'quv markazlarni bir platformada boshqaring", color: "text-purple-500" },
  ];

  const stats = [
    { label: "Talabalar", value: "5000+", icon: <Users className="w-8 h-8" /> },
    { label: "Kurslar", value: "150+", icon: <BookOpen className="w-8 h-8" /> },
    { label: "O'qituvchilar", value: "300+", icon: <Award className="w-8 h-8" /> },
    { label: "O'quv markazlari", value: "25+", icon: <TrendingUp className="w-8 h-8" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Slider — o‘zgarmadi */}
      <div className="relative h-[600px] overflow-hidden">
        {slides.map((slide, index) => (
          <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === activeSlide ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`h-full bg-gradient-to-r ${slide.bg} flex items-center justify-center text-white`}>
              <div className="max-w-4xl mx-auto text-center px-4">
                <h1 className="text-5xl md:text-6xl font-bold mb-6">{slide.title}</h1>
                <p className="text-xl md:text-2xl mb-8">{slide.subtitle}</p>
                <div className="flex justify-center space-x-4 flex-wrap gap-4">
                  <Link to="/courses" className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition">
                    Kurslarni ko'rish
                  </Link>
                  <Link to="/register" className="px-8 py-4 bg-transparent border-2 border-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition">
                    Bepul boshlash
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button key={index} onClick={() => setActiveSlide(index)} className={`w-3 h-3 rounded-full transition ${index === activeSlide ? 'bg-white' : 'bg-white/50'}`} />
          ))}
        </div>
      </div>

      {/* Mashhur kurslar */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Mashhur kurslar</h2>
        
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto"></div>
          </div>
        ) : courses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.slice(0, 8).map((course) => (
              <Link
                key={course.id}
                to={`/course/${course.id}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <img
                  src={course.thumbnail || 'https://via.placeholder.com/300x200'}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.short_description}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-600">
                      {course.price > 0 ? `${course.price} so'm` : 'Bepul'}
                    </span>
                    <span className="text-sm text-gray-500">{course.total_students || 0} talaba</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">Hozircha mashhur kurslar mavjud emas</p>
        )}
      </div>

      {/* Stats, Features, CTA — o‘zgarmadi */}
      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="flex justify-center text-blue-600 mb-3">{stat.icon}</div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Nima uchun biz?</h2>
          <p className="text-xl text-gray-600">Zamonaviy va ishonchli o'quv platformasi</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
              <div className={`${feature.color} mb-4`}>{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            O'quv markazingizni bugun boshlang!
          </h2>
          <p className="text-xl text-white/90 mb-8">
            14 kunlik bepul sinov davri. Kredit karta talab qilinmaydi.
          </p>
          <Link to="/register" className="inline-block px-10 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition">
            Bepul boshlash
          </Link>
        </div>
      </div>
    </div>
  );
}