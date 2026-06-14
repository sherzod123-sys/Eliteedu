// src/pages/Profile.jsx

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Save, ArrowLeft, Camera } from 'lucide-react';

// localStorage dan user ni olish va saqlash funksiyalari
const getUserFromStorage = () => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const saveUserToStorage = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUserFromStorage() || {});
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm();

  // Komponent yuklanganda formani user ma'lumotlari bilan to'ldirish
  useEffect(() => {
    if (user) {
      const firstName = user.full_name?.split(' ')[0] || user.first_name || '';
      const lastName = user.full_name?.split(' ').slice(1).join(' ') || user.last_name || '';

      reset({
        first_name: firstName,
        last_name: lastName,
        email: user.email || '',
        phone: user.phone || user.phone_number || '',
        bio: user.bio || ''
      });

      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user, reset]);

  // Rasm yuklash funksiyasi
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setAvatarPreview(base64String);
        // Vaqtinchalik user ga qo'shamiz
        setUser(prev => ({ ...prev, avatar: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      // Backendga yuborish simulyatsiyasi (real loyihada authAPI ishlatiladi)
      const updatedUser = {
        ...user,
        full_name: `${data.first_name.trim()} ${data.last_name.trim()}`.trim(),
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        phone_number: data.phone, // agar backend phone_number ni talab qilsa
        bio: data.bio,
        avatar: avatarPreview // yangi rasm saqlanadi
      };

      // Real loyihada:
      // await authAPI.updateProfile(updatedUser);

      // Simulyatsiya — muvaffaqiyat
      setUser(updatedUser);
      saveUserToStorage(updatedUser);

      toast.success('Profil muvaffaqiyatli yangilandi! 🎉');
    } catch (error) {
      console.error('Profil yangilashda xato:', error);
      toast.error('Saqlashda xatolik yuz berdi. Qayta urinib ko‘ring.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Orqaga tugmasi */}
        <div className="mb-8">
          <Link 
            to={user?.role === 'teacher' ? '/teacher/dashboard' : '/dashboard'}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Orqaga
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mt-4">Profil sozlamalari</h1>
          <p className="text-gray-600 mt-2">Shaxsiy ma'lumotlaringizni tahrirlang va saqlang</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="md:flex">
            {/* Chap taraf — Avatar */}
            <div className="md:w-1/3 bg-gradient-to-br from-blue-50 to-purple-50 p-8 flex flex-col items-center justify-center text-center">
              <div className="relative mb-6">
                <div className="w-48 h-48 rounded-full overflow-hidden border-8 border-white shadow-2xl">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Profil rasmi" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-7xl font-bold">
                      {user?.full_name?.[0]?.toUpperCase() || user?.first_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>

                {/* Rasm yuklash tugmasi */}
                <label className="absolute bottom-0 right-0 bg-white p-4 rounded-full shadow-2xl cursor-pointer hover:bg-gray-50 transition">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleAvatarChange}
                  />
                  <Camera className="w-6 h-6 text-gray-700" />
                </label>
              </div>

              <h2 className="text-2xl font-bold text-gray-900">
                {user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Foydalanuvchi'}
              </h2>
              <p className="text-gray-600 mt-2">
                {user?.role === 'teacher' ? 'O‘qituvchi' : 'Talaba'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {user?.email || user?.phone || 'Maʼlumot yoʻq'}
              </p>
            </div>

            {/* O‘ng taraf — Forma */}
            <div className="md:w-2/3 p-8 lg:p-12">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                      <User className="w-5 h-5" />
                      Ism
                    </label>
                    <input
                      type="text"
                      {...register('first_name', {
                        required: 'Ismni kiriting',
                        minLength: { value: 2, message: 'Kamida 2 harf' }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Ismingiz"
                    />
                    {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                      <User className="w-5 h-5" />
                      Familiya
                    </label>
                    <input
                      type="text"
                      {...register('last_name', {
                        required: 'Familiyani kiriting',
                        minLength: { value: 2, message: 'Kamida 2 harf' }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Familiyangiz"
                    />
                    {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <Mail className="w-5 h-5" />
                    Email
                  </label>
                  <input
                    type="email"
                    {...register('email', {
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Noto‘g‘ri email format'
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="email@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <Phone className="w-5 h-5" />
                    Telefon raqam
                  </label>
                  <input
                    type="tel"
                    {...register('phone', {
                      required: 'Telefon raqamni kiriting',
                      pattern: {
                        value: /^\+998\d{9}$/,
                        message: '+998901234567 formatida bo‘lsin'
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="+998 90 123 45 67"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="text-gray-700 font-medium mb-2 block">
                    Bio (qisqacha tarjimai hol)
                  </label>
                  <textarea
                    {...register('bio')}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
                    placeholder="O‘zingiz haqingizda qisqacha yozing..."
                  />
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl transition disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        Saqlanmoqda...
                      </>
                    ) : (
                      <>
                        <Save className="w-6 h-6 mr-3" />
                        O‘zgarishlarni saqlash
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}