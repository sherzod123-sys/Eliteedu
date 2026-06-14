// src/pages/Register.jsx — TO‘G‘RI VA ISHLAYDIGAN VERSIYA

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Register() {
  const [phone, setPhone] = useState('+998');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== password2) {
      toast.error('Parollar mos emas');
      return;
    }

    if (!phone.startsWith('+998') || phone.length !== 13 || !/^\+998\d{9}$/.test(phone)) {
      toast.error('Telefon +998XXXXXXXXX formatida, 13 belgili bo‘lishi kerak');
      return;
    }

    if (fullName.trim().length < 3) {
      toast.error('Ism-familiya kamida 3 belgidan iborat bo‘lishi kerak');
      return;
    }

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/register/', {
        phone: phone,
        full_name: fullName,
        password: password,
        password2: password2,
        // role: 'student' — backendda avtomatik student qilinadi, shuning uchun ixtiyoriy
      });

      console.log('Muvaffaqiyat:', res.data);

      // Token va user ni localStorage ga saqlash
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      toast.success('Roʻyxatdan muvaffaqiyatli oʻtdingiz!');
      navigate('/login');  // yoki '/dashboard' ga
    } catch (err) {
      console.error('XATO:', err.response?.data);

      let errorMessage = 'Ro‘yxatdan o‘tishda xatolik yuz berdi';

      if (err.response?.data?.phone) {
        errorMessage = err.response.data.phone[0] || 'Telefon raqami allaqachon ishlatilgan';
      } else if (err.response?.data?.password) {
        errorMessage = err.response.data.password[0] || 'Parol talablarga javob bermaydi';
      } else if (err.response?.data?.non_field_errors) {
        errorMessage = err.response.data.non_field_errors[0];
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }

      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Ro'yxatdan o'tish
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To'liq ism-familiya
            </label>
            <input
              type="text"
              placeholder="Masalan: Ali Valiyev"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon raqami
            </label>
            <input
              type="tel"
              placeholder="+998901234567"
              value={phone}
              onChange={(e) => {
                let value = e.target.value;
                if (!value.startsWith('+998')) {
                  value = '+998';
                }
                if (value.length > 13) {
                  value = value.slice(0, 13);
                }
                setPhone(value.replace(/[^\d+]/g, ''));
              }}
              className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">+998 bilan boshlanishi kerak</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parol
            </label>
            <input
              type="password"
              placeholder="Kamida 8 belgi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parolni tasdiqlang
            </label>
            <input
              type="password"
              placeholder="Parolni yana kiriting"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-bold text-xl hover:shadow-lg transition transform hover:scale-105"
          >
            Ro'yxatdan o'tish
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Allaqaon ro'yxatdan o'tganmisiz?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-800 font-semibold underline"
            >
              Tizimga kirish
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}