import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // localStorage dan user ni olamiz
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Agar user yo‘q bo‘lsa → login ga yuboramiz
  useEffect(() => {
    if (!user) {
      toast.error('Iltimos, avval tizimga kiring');
      navigate('/login');
    } else {
      setLoading(false);
    }
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Chiqish muvaffaqiyatli!');
    navigate('/login');
  };

  // Yuklanayotgacha spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-2xl text-gray-600">Yuklanmoqda...</div>
      </div>
    );
  }

  // Agar user bo‘lmasa (qayta tekshirish)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navbar */}
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">EduPlatform</h1>
          <div className="flex items-center gap-6">
            <span className="text-gray-700">Salom, <strong>{user.full_name || user.username}</strong></span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Chiqish
            </button>
          </div>
        </div>
      </nav>

      {/* Asosiy kontent */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Xush kelibsiz, {user.full_name || user.username}!
        </h1>
        <p className="text-xl text-gray-600 mb-10">
          Bugun qanday bilim olishni xohlaysiz?
        </p>

        {/* Statistikalar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
            <div className="text-5xl font-bold text-blue-600 mb-2">12</div>
            <p className="text-gray-600 text-lg">Jami kurslar</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
            <div className="text-5xl font-bold text-green-600 mb-2">48</div>
            <p className="text-gray-600 text-lg">Bajarilgan darslar</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
            <div className="text-5xl font-bold text-purple-600 mb-2">5</div>
            <p className="text-gray-600 text-lg">Sertifikatlar</p>
          </div>
        </div>

        {/* Kurslar bo‘limi */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6">Mening kurslarim</h2>
          <div className="text-center py-16 text-gray-500">
            <p className="text-xl mb-6">Hozircha hech qanday kursga yozilmagansiz</p>
            <button
              onClick={() => navigate('/courses')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transition"
            >
              Kurslarni ko‘rish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}