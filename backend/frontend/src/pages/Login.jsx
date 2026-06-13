// src/pages/Login.jsx — 100% TUZATILGAN VERSIYA (endpoint to'g'rilandi, debug qo'shildi, error handling yaxshilandi)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const saveAuthData = (data) => {
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh || '');
    const userInfo = data.user || data;
    localStorage.setItem('user', JSON.stringify(userInfo));
    console.log("TOKEN SAQLANDI:", data.access.substring(0, 20) + "...");  // Debug uchun qo'shildi
    return userInfo.role || 'student';
};

export default function Login() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('student');
  
  const [studentData, setStudentData] = useState({ 
    phone: '+998',
    password: '',
  });

  const [teacherData, setTeacherData] = useState({ 
    username: '',
    password: '',
  });
  
  const handleChange = (e) => {
      const { name, value } = e.target;
      if (userType === 'student') {
          setStudentData({ ...studentData, [name]: value });
      } else {
          setTeacherData({ ...teacherData, [name]: value });
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let dataToSubmit = {};
    let endpoint = '';

    if (userType === 'student') {
        if (!studentData.phone.startsWith('+998') || studentData.phone.length !== 13) {
            toast.error('Telefon raqam +998XXXXXXXXX formatida bo\'lishi kerak');
            return;
        }
        if (!studentData.password) {
            toast.error('Parolni kiriting');
            return;
        }

        dataToSubmit = { 
            phone: studentData.phone, 
            password: studentData.password 
        };
        endpoint = 'http://127.0.0.1:8000/api/users/student-login/';  // ← 100% TUZATILGAN: to'g'ri endpoint

    } else { // teacher
        if (!teacherData.username.trim()) {
            toast.error('Username ni kiriting');
            return;
        }
        if (!teacherData.password) {
            toast.error('Parolni kiriting');
            return;
        }

        dataToSubmit = { 
            username: teacherData.username, 
            password: teacherData.password 
        };
        endpoint = 'http://127.0.0.1:8000/api/users/auth/teacher-login/';
    }

    try {
      const res = await axios.post(endpoint, dataToSubmit);
      const role = saveAuthData(res.data);
      const fullName = res.data.user?.full_name || 
                       res.data.user?.username || 
                       'Foydalanuvchi';

      toast.success(`Xush kelibsiz, ${fullName}! 👋`);

      // Dashboardga yo‘naltirish
      if (role === 'teacher' || role === 'admin') {
          navigate('/teacher/dashboard');
      } else {
          navigate('/dashboard');
      }

      // MUHIM: Sahifani majburiy yangilash — dashboard to‘g‘ri ochilishi uchun
      window.location.reload();

    } catch (err) {
      console.error("Login xatosi:", err.response?.data);

      let errorMsg = 'Tizimga kirishda xato yuz berdi';
      
      if (err.response?.data) {
          if (err.response.data.detail) {
              errorMsg = err.response.data.detail;
          } else if (err.response.data.error) {
              errorMsg = err.response.data.error;
          } else if (err.response.data.non_field_errors) {
              errorMsg = err.response.data.non_field_errors[0];
          } else {
              errorMsg = userType === 'teacher' ? 'Noto\'g\'ri username yoki parol' : 'Noto\'g\'ri telefon yoki parol';
          }
      }

      toast.error(errorMsg);
    }
  };

  const renderLoginForm = () => {
    if (userType === 'student') {
        return (
            <>
                <div>
                    <label className="block text-lg font-medium mb-2">Telefon raqam</label>
                    <input
                        type="tel"
                        name="phone"
                        value={studentData.phone}
                        onChange={handleChange}
                        className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl text-lg focus:border-blue-500 focus:outline-none"
                        placeholder="+998901234567"
                        required
                    />
                </div>

                <div>
                    <label className="block text-lg font-medium mb-2">Parol</label>
                    <input
                        type="password"
                        name="password"
                        value={studentData.password}
                        onChange={handleChange}
                        className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl text-lg focus:border-blue-500 focus:outline-none"
                        placeholder="Parolingiz"
                        required
                    />
                </div>
            </>
        );
    } else {
        return (
            <>
                <div>
                    <label className="block text-lg font-medium mb-2">Username</label>
                    <input
                        type="text"
                        name="username"
                        value={teacherData.username}
                        onChange={handleChange}
                        className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl text-lg focus:border-blue-500 focus:outline-none"
                        placeholder="teacher123"
                        required
                    />
                    <p className="text-sm text-gray-500 mt-2">
                        Admin tomonidan berilgan username
                    </p>
                </div>

                <div>
                    <label className="block text-lg font-medium mb-2">Parol</label>
                    <input
                        type="password"
                        name="password"
                        value={teacherData.password}
                        onChange={handleChange}
                        className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl text-lg focus:border-blue-500 focus:outline-none"
                        placeholder="Parolingiz"
                        required
                    />
                </div>
            </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">Tizimga kirish</h1>
        <p className="text-center text-gray-600 mb-8">Rolingizni tanlang va kiring</p>
        
        <div className="flex justify-center mb-6 space-x-4">
            <button
                type="button"
                onClick={() => setUserType('student')}
                className={`px-8 py-3 rounded-xl font-bold transition-colors ${
                    userType === 'student' 
                        ? 'bg-green-600 text-white shadow-md' 
                        : 'bg-gray-200 text-gray-700'
                }`}
            >
                Talaba
            </button>
            <button
                type="button"
                onClick={() => setUserType('teacher')}
                className={`px-8 py-3 rounded-xl font-bold transition-colors ${
                    userType === 'teacher' 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'bg-gray-200 text-gray-700'
                }`}
            >
                O'qituvchi
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderLoginForm()}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
          >
            Kirish
          </button>
        </form>

        <p className="text-center mt-8 text-gray-600">
          Akkaunt yo'qmi?{' '}
          <span
            onClick={() => navigate('/register')}
            className="text-blue-600 font-bold cursor-pointer hover:underline"
          >
            Ro'yxatdan o'tish (Talabalar uchun)
          </span>
        </p>
      </div>
    </div>
  );
}