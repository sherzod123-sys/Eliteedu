import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, BookOpen, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const stats = {
    totalUsers: 5234,
    totalCourses: 156,
    totalRevenue: '125,000,000',
    activeUsers: 3421,
  };

  const revenueData = [
    { month: 'Yan', revenue: 15000000 },
    { month: 'Fev', revenue: 18000000 },
    { month: 'Mar', revenue: 22000000 },
    { month: 'Apr', revenue: 19000000 },
    { month: 'May', revenue: 25000000 },
    { month: 'Iyun', revenue: 28000000 },
  ];

  const enrollmentData = [
    { month: 'Yan', students: 450 },
    { month: 'Fev', students: 620 },
    { month: 'Mar', students: 780 },
    { month: 'Apr', students: 690 },
    { month: 'May', students: 890 },
    { month: 'Iyun', students: 1020 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-8 h-8" />}
            label="Jami foydalanuvchilar"
            value={stats.totalUsers.toLocaleString()}
            change="+12.5%"
            color="bg-blue-500"
          />
          <StatCard
            icon={<BookOpen className="w-8 h-8" />}
            label="Jami kurslar"
            value={stats.totalCourses}
            change="+8.2%"
            color="bg-green-500"
          />
          <StatCard
            icon={<DollarSign className="w-8 h-8" />}
            label="Umumiy daromad"
            value={`${stats.totalRevenue} so'm`}
            change="+23.1%"
            color="bg-purple-500"
          />
          <StatCard
            icon={<Activity className="w-8 h-8" />}
            label="Faol foydalanuvchilar"
            value={stats.activeUsers.toLocaleString()}
            change="+5.4%"
            color="bg-yellow-500"
          />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">Daromad dinamikasi</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${(value / 1000000).toFixed(1)}M so'm`} />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Enrollment Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">Talabalar o'sishi</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">So'nggi foydalanuvchilar</h2>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center">
                    <img src={`/avatar-${i}.jpg`} alt="" className="w-10 h-10 rounded-full mr-3" />
                    <div>
                      <div className="font-medium">User {i}</div>
                      <div className="text-sm text-gray-500">user{i}@example.com</div>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Faol</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Mashhur kurslar</h2>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center">
                    <BookOpen className="w-8 h-8 text-blue-500 mr-3" />
                    <div>
                      <div className="font-medium">Kurs nomi {i}</div>
                      <div className="text-sm text-gray-500">{150 + i * 10} talaba</div>
                    </div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, change, color }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div className={`${color} text-white w-12 h-12 rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-green-600 text-sm font-semibold">{change}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}