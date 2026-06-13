import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';  // Bu yerda quyida ko'rsatilgan funksiyalar bo'lishi kerak
import toast from 'react-hot-toast';
import { Phone, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student'); // default: talaba
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      let response;

      if (role === 'student') {
        // Talaba: phone + password
        response = await authAPI.studentLogin({
          phone: data.identifier,
          password: data.password
        });
      } else {
        // O'qituvchi: username (yoki email) + password
        response = await authAPI.teacherLogin({
          username: data.identifier,
          password: data.password
        });
      }

      const { access, refresh } = response.data;

      // Profilni olish (access token bilan)
      const profileResponse = await authAPI.getProfile(access);
      setAuth(profileResponse.data, access, refresh);

      toast.success('Xush kelibsiz!');
      navigate('/dashboard');
    } catch (error) {
      const msg = 
        error.response?.data?.detail || 
        error.response?.data?.non_field_errors?.[0] || 
        'Kirishda xatolik yuz berdi';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Kirish</h2>
            <p className="text-gray-600">Platformaga xush kelibsiz</p>
          </div>

          {/* Rol tanlash */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 p-1 rounded-lg flex w-full max-w-sm">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex-1 px-6 py-2 rounded-md font-medium transition ${
                  role === 'student'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Talaba
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`flex-1 px-6 py-2 rounded-md font-medium transition ${
                  role === 'teacher'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                O'qituvchi
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Dinamik maydon: Telefon yoki Username/Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {role === 'student' ? 'Telefon raqam' : 'Username yoki Email'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register('identifier', {
                    required: 'Bu maydon majburiy',
                    pattern: role === 'student' ? {
                      value: /^\+998[0-9]{9}$/,
                      message: 'Format: +998991234567'
                    } : undefined
                  })}
                  className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={
                    role === 'student' 
                      ? '+998991234567' 
                      : 'ibrohim yoki email@example.com'
                  }
                />
                {role === 'student' ? (
                  <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                ) : (
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                )}
              </div>
              {errors.identifier && (
                <p className="text-red-500 text-sm mt-1">{errors.identifier.message}</p>
              )}
            </div>

            {/* Parol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Parol</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Parol kiriting' })}
                  className="w-full px-4 py-3 pl-11 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                Parolni unutdingizmi?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Kirish...' : 'Kirish'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Akkauntingiz yo'qmi?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                Ro'yxatdan o'tish
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}