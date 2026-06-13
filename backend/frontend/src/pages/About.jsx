import React from 'react';
import { Users, Target, Award, TrendingUp } from 'lucide-react';

const values = [
  {
    icon: <Target className="w-12 h-12" />,
    title: "Maqsadimiz",
    description: "Har bir kishiga sifatli ta'limni yetkazish va kasbiy o'sishga yordam berish",
  },
  {
    icon: <Award className="w-12 h-12" />,
    title: "Sifat",
    description: "Yuqori sifatli kurslar va professional o'qituvchilar bilan ishlash",
  },
  {
    icon: <Users className="w-12 h-12" />,
    title: "Jamoa",
    description: "Tajribali va sodiq jamoa a'zolari bilan hamkorlik",
  },
  {
    icon: <TrendingUp className="w-12 h-12" />,
    title: "Rivojlanish",
    description: "Doimiy yangilanish va zamonaviy texnologiyalarni qo'llash",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Biz haqimizda</h1>
          <p className="text-xl max-w-3xl mx-auto">
            EduPlatform - O'zbekistondagi eng yirik onlayn ta'lim platformalaridan biri.
            2020-yildan buyon minglab talabalarning hayotini o'zgartirdik.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 -mt-12">
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { label: "Talabalar", value: "5000+" },
            { label: "Kurslar", value: "150+" },
            { label: "O'qituvchilar", value: "300+" },
            { label: "Tugallangan", value: "10,000+" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Bizning qadriyatlarimiz</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="text-blue-600 flex justify-center mb-4">{value.icon}</div>
              <h3 className="text-xl font-bold mb-2">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Bizning jamoa</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                  {i}
                </div>
                <h3 className="font-bold text-lg">Jamoa a'zosi {i}</h3>
                <p className="text-gray-600">Lavozim</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}