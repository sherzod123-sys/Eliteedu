import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Save, ArrowLeft, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await authAPI.updateProfile(data);
      updateUser(response.data);
      toast.success('Profil muvaffaqiyatli yangilandi!');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Profilni yangilashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Orqaga
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Profil sozlamalari</h1>
          <p className="text-gray-600 mt-2">Shaxsiy ma'lumotlaringizni tahrirlang</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Left Side - Avatar */}
            <div className="md:w-1/3 bg-gradient-to-b from-blue-50 to-purple-50 p-8 flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-6xl font-bold mb-4 overflow-hidden">
                  {avatar ? (
                    <img 
                      src={avatar} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
                <label className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition">
                  <input type="file" className="hidden" accept="image/*" />
                  <Camera className="w-5 h-5 text-gray-600" />
                </label>
              </div>
              <h2 className="text-xl font-bold mt-6">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-gray-600">@{user?.username}</p>
            </div>

            {/* Right Side - Form */}
            <div className="md:w-2/3 p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ism
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register('first_name', { 
                          required: 'Ism kiriting',
                          minLength: {
                            value: 2,
                            message: 'Kamida 2 ta harf'
                          }
                        })}
                        className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Ismingiz"
                      />
                      <User className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                    </div>
                    {errors.first_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Familiya
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register('last_name', { 
                          required: 'Familiya kiriting',
                          minLength: {
                            value: 2,
                            message: 'Kamida 2 ta harf'
                          }
                        })}
                        className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Familiyangiz"
                      />
                      <User className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                    </div>
                    {errors.last_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      {...register('email', { 
                        required: 'Email kiriting',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Email noto\'g\'ri formatda'
                        }
                      })}
                      className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="email@example.com"
                    />
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon raqam
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      {...register('phone')}
                      className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="+998 90 123 45 67"
                    />
                    <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio (qisqacha tarjimai hol)
                  </label>
                  <textarea
                    {...register('bio')}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="O'zingiz haqingizda qisqacha..."
                  ></textarea>
                </div>

                <div className="pt-6 border-t">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Saqlanmoqda...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        O'zgarishlarni saqlash
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