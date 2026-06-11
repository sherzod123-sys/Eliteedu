// src/pages/CourseDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Clock, Users, Star, PlayCircle, BookOpen, Award, Calendar, 
  User, Mail, Phone, CreditCard, X 
} from 'lucide-react';
import axios from 'axios';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal forma holati
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    card_number: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const token = localStorage.getItem('access_token');
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const isAuthenticated = !!currentUser;

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`http://localhost:8000/api/courses/${id}/`, { headers });
        setCourse(response.data);

        // Kirgan bo‘lsa avto to‘ldirish
        if (currentUser) {
          setFormData({
            full_name: currentUser.full_name || '',
            phone: currentUser.phone || '',
            email: currentUser.email || '',
            card_number: '',
            notes: ''
          });
        }
      } catch (err) {
        console.error("Kurs yuklashda xato:", err);
        setError("Kurs topilmadi yoki yuklashda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCourse();
  }, [id, token, currentUser]);

  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      localStorage.setItem('redirect_after_login', window.location.pathname);
      navigate('/login');
      return;
    }
    setShowEnrollForm(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(
        `http://localhost:8000/api/courses/${id}/enroll/`,  // Backend endpoint
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSubmitted(true);
      setTimeout(() => {
        setShowEnrollForm(false);
        alert('Tabriklayman! Siz kursga muvaffaqiyatli yozildingiz 🎉');
        // navigate('/dashboard'); // agar kerak bo‘lsa yo‘naltirish
      }, 1500);
    } catch (err) {
      console.error("Yozilishda xato:", err);
      alert('Xatolik yuz berdi. Qayta urinib ko‘ring.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || "Kurs topilmadi"}</h2>
          <Link to="/courses" className="text-blue-600 hover:underline font-semibold">
            Kurslarga qaytish
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = course.thumbnail 
    ? (course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:8000${course.thumbnail}`)
    : 'https://via.placeholder.com/800x400?text=No+Image';

  const teacherName = course.teacher_name || course.teacher?.full_name || 'Noma\'lum o‘qituvchi';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Link to="/courses" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 font-semibold transition">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Barcha kurslarga qaytish
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Asosiy kontent */}
          <div className="lg:col-span-2 space-y-8">
            {/* Rasm — kichikroq va ramkali */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-8 border-white -mt-4">
              <img 
                src={imageUrl}
                alt={course.title}
                className="w-full h-64 md:h-80 object-cover"
                onError={(e) => e.target.src = 'https://via.placeholder.com/800x400?text=No+Image'}
              />
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {course.title}
              </h1>

              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                {course.short_description || 'Tavsif mavjud emas.'}
              </p>

              <div className="flex flex-wrap items-center gap-6 mb-8 text-gray-600">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5" />
                  <span className="font-medium">{teacherName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5" />
                  <span>{course.total_students || 0} talaba</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span>{course.rating || '5.0'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5" />
                  <span>{course.duration || '10 soat'}</span>
                </div>
              </div>

              <div className="prose prose-lg max-w-none text-gray-700">
                <h2 className="text-2xl font-bold mb-4">Kurs haqida</h2>
                <div dangerouslySetInnerHTML={{ __html: course.description || '<p>Tavsif qo‘shilmagan.</p>' }} />
              </div>
            </div>
          </div>

          {/* Yon panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-24">
              <div className="text-4xl font-bold text-gray-900 mb-4">
                {course.discount_price ? (
                  <>
                    <span className="text-2xl line-through text-gray-500 mr-3">{course.price} so‘m</span>
                    {course.discount_price} so‘m
                  </>
                ) : (
                  `${course.price || 'Bepul'} so‘m`
                )}
              </div>

              <button
                onClick={handleEnrollClick}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-lg hover:shadow-xl transition mb-6"
              >
                Kursga yozilish
              </button>

              <div className="space-y-4 text-gray-700">
                <div className="flex items-center gap-3">
                  <PlayCircle className="w-6 h-6 text-blue-600" />
                  <span>To‘liq video darslar</span>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-blue-600" />
                  <span>Sertifikat</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <span>Umrbod kirish</span>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  <span>Qo'shimcha materiallar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal forma — mobil uchun ham ishlaydi */}
      {showEnrollForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative my-8">
            <button
              onClick={() => setShowEnrollForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Kursga yozilish</h2>
            <p className="text-gray-600 mb-8 text-center">Ma’lumotlarni to‘ldiring va o‘qishni boshlang!</p>

            {submitted ? (
              <div className="text-center py-12">
                <div className="text-green-600 text-7xl mb-6">✓</div>
                <p className="text-2xl font-bold text-gray-900">Muvaffaqiyatli yozildingiz!</p>
                <p className="text-gray-600 mt-4">Tez orada kursni boshlashingiz mumkin</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitForm} className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <User className="w-5 h-5" />
                    To‘liq ismingiz
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    autoFocus
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    placeholder="Ismingiz Familiyangiz"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <Phone className="w-5 h-5" />
                    Telefon raqam
                  </label>
                  <input
                    type="tel"
                    required
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    placeholder="+998 90 123 45 67"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <Mail className="w-5 h-5" />
                    Email manzil
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    placeholder="email@misol.uz"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <CreditCard className="w-5 h-5" />
                    Karta raqami (masalan)
                  </label>
                  <input
                    type="text"
                    value={formData.card_number}
                    onChange={(e) => setFormData({...formData, card_number: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>

                <div>
                  <label className="text-gray-700 font-medium mb-2 block">
                    Qo‘shimcha izoh (ixtiyoriy)
                  </label>
                  <textarea
                    rows="3"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none transition"
                    placeholder="Savollaringiz bo‘lsa yozing..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-lg hover:shadow-xl transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Yuborilmoqda...' : 'Yozilishni yakunlash'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;