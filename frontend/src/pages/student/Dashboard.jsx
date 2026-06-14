// src/pages/Dashboard.jsx - Kengaytirilgan Student Dashboard

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  BookOpen, Clock, Award, User, ChevronRight, Star, Users, 
  TrendingUp, Calendar, Target, Bell, MessageSquare, 
  Download, CheckCircle, XCircle, PlayCircle, FileText,
  Trophy, Flame, Zap, Gift
} from 'lucide-react';

// localStorage dan user ni olish
const getUser = () => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, courses, achievements
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedLessons: 0,
    totalHours: 0,
    certificates: 0,
    streak: 7,
    points: 1250,
    rank: 'Gold',
    nextMilestone: 2000
  });

  // Yangi state'lar
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'lesson', title: 'React Hooks', time: '2 soat oldin', status: 'completed' },
    { id: 2, type: 'quiz', title: 'JavaScript Test', time: '5 soat oldin', status: 'completed' },
    { id: 3, type: 'certificate', title: 'Web Development', time: '1 kun oldin', status: 'earned' }
  ]);

  const [upcomingDeadlines, setUpcomingDeadlines] = useState([
    { id: 1, course: 'Python Basics', task: 'Final Project', date: '2024-01-05', urgent: true },
    { id: 2, course: 'Data Science', task: 'Module Test', date: '2024-01-08', urgent: false }
  ]);

  const [achievements, setAchievements] = useState([
    { id: 1, name: 'Quick Learner', icon: '⚡', earned: true, description: '10 ta darsni 1 kunda tugatdingiz' },
    { id: 2, name: 'Streak Master', icon: '🔥', earned: true, description: '7 kun ketma-ket o\'qidingiz' },
    { id: 3, name: 'Perfect Score', icon: '💯', earned: true, description: 'Testda 100% natija' },
    { id: 4, name: 'Course Completer', icon: '🎓', earned: false, description: '5 ta kursni tugatish' }
  ]);

  const [learningStreak, setLearningStreak] = useState({
    current: 7,
    best: 15,
    days: ['D', 'S', 'Ch', 'P', 'J', 'Sh', 'Y']
  });

  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUserCourses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await axios.get('/api/courses/my_courses/', { headers });
        const myCourses = res.data.results || res.data || [];

        setCourses(myCourses);

        const totalCourses = myCourses.length;
        const completedLessons = myCourses.reduce((acc, course) => 
          acc + (course.completed_lessons || 0), 0
        );

        setStats(prev => ({
          ...prev,
          totalCourses,
          completedLessons,
          totalHours: Math.floor(completedLessons * 0.5),
          certificates: Math.floor(totalCourses * 0.3)
        }));
      } catch (error) {
        console.error('Dashboard maʼlumotlari xatosi:', error);
        toast.error('Maʼlumotlarni yuklashda xatolik');
      } finally {
        setLoading(false);
      }
    };

    fetchUserCourses();
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Tizimga kirish kerak</h2>
          <Link to="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Tizimga kirish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Welcome and Notifications */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Xush kelibsiz, {user?.full_name || user?.first_name || user?.username || 'Foydalanuvchi'}! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Bugun nima o'rganmoqchisiz?
            </p>
          </div>
          <button className="relative p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition">
            <Bell className="w-6 h-6 text-gray-700" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
        </div>

        {/* Learning Streak Banner */}
        <div className="mb-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-8 h-8" />
                <h3 className="text-2xl font-bold">{learningStreak.current} kunlik seriya! 🔥</h3>
              </div>
              <p className="text-white/90">Eng yaxshi natija: {learningStreak.best} kun</p>
            </div>
            <div className="flex gap-2">
              {learningStreak.days.map((day, idx) => (
                <div key={idx} className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <span className="text-sm font-bold">{day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 bg-white rounded-xl shadow-md p-2 flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'overview' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Umumiy
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'courses' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Kurslarim
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'achievements' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Yutuqlar
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-gray-500 text-sm">Kurslar</p>
            <p className="text-3xl font-bold">{stats.totalCourses}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <span className="text-sm text-green-600 font-semibold">+{stats.completedLessons}</span>
            </div>
            <p className="text-gray-500 text-sm">Darslar</p>
            <p className="text-3xl font-bold">{stats.completedLessons}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-purple-600" />
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
            </div>
            <p className="text-gray-500 text-sm">Ballar</p>
            <p className="text-3xl font-bold">{stats.points}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-yellow-600" />
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-bold">
                {stats.rank}
              </span>
            </div>
            <p className="text-gray-500 text-sm">Reyting</p>
            <p className="text-3xl font-bold">#{stats.certificates + 12}</p>
          </div>
        </div>

        {/* Main Content Based on Active Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Courses Progress */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress to Next Level */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Keyingi darajaga</h3>
                  <span className="text-sm text-blue-600 font-bold">{stats.points}/{stats.nextMilestone} ball</span>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${(stats.points / stats.nextMilestone) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Yana {stats.nextMilestone - stats.points} ball to'plang va Platinum darajasiga o'ting! 💎
                </p>
              </div>

              {/* Active Courses */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Faol Kurslarim</h2>
                  <Link to="/courses" className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
                    Barchasi <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : courses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Hali kursga yozilmagansiz</h3>
                    <Link to="/courses" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
                      Kurslarni ko'rish
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courses.slice(0, 3).map((course) => (
                      <div key={course.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                              {course.title?.[0] || 'K'}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{course.title}</h3>
                              <p className="text-gray-600 text-sm">
                                {course.category_name || 'Umumiy'}
                              </p>
                            </div>
                          </div>
                          <Link 
                            to={`/course/${course.id}`}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium"
                          >
                            <PlayCircle className="w-5 h-5" />
                            Davom
                          </Link>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-blue-600">
                            {course.progress || 0}%
                          </span>
                          <span className="text-sm text-gray-500">
                            {course.completed_lessons || 0}/{course.total_lessons || 0} dars
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 rounded-full mt-2">
                          <div 
                            className={`h-3 rounded-full transition-all ${
                              (course.progress || 0) >= 80 ? 'bg-green-500' : 
                              (course.progress || 0) >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${course.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-blue-600" />
                  So'nggi faoliyat
                </h3>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {activity.type === 'lesson' && <PlayCircle className="w-5 h-5 text-blue-500" />}
                        {activity.type === 'quiz' && <FileText className="w-5 h-5 text-purple-500" />}
                        {activity.type === 'certificate' && <Award className="w-5 h-5 text-yellow-500" />}
                        <div>
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {user?.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">
                      {user?.full_name || user?.first_name}
                    </h3>
                    <p className="text-gray-600">{user?.email || user?.phone}</p>
                    <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-full">
                      {stats.rank} Member
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/profile')}
                  className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700 font-medium"
                >
                  <User className="w-5 h-5 mr-2" />
                  Profilni tahrirlash
                </button>
              </div>

              {/* Upcoming Deadlines */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-red-500" />
                  Yaqin muddatlar
                </h3>
                <div className="space-y-3">
                  {upcomingDeadlines.map((deadline) => (
                    <div 
                      key={deadline.id} 
                      className={`p-3 rounded-lg ${
                        deadline.urgent ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-bold text-sm">{deadline.course}</p>
                        {deadline.urgent && (
                          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                            Shoshilinch
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{deadline.task}</p>
                      <p className="text-xs text-gray-500 mt-1">{deadline.date}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-xl font-bold mb-4">Tez harakatlar</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 p-3 bg-white/20 rounded-lg hover:bg-white/30 transition backdrop-blur-sm">
                    <Download className="w-5 h-5" />
                    <span>Sertifikatlar</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 bg-white/20 rounded-lg hover:bg-white/30 transition backdrop-blur-sm">
                    <MessageSquare className="w-5 h-5" />
                    <span>Savollar</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 bg-white/20 rounded-lg hover:bg-white/30 transition backdrop-blur-sm">
                    <Target className="w-5 h-5" />
                    <span>Maqsadlarim</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Barcha Kurslarim</h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <div key={course.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-xl transition">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                          {course.title?.[0]}
                        </div>
                        <div>
                          <h3 className="font-bold text-xl mb-1">{course.title}</h3>
                          <p className="text-gray-600 text-sm">{course.category_name || 'Umumiy'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span className="font-bold">{course.progress || 0}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full">
                        <div 
                          className="h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          style={{ width: `${course.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link 
                        to={`/course/${course.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        <PlayCircle className="w-5 h-5" />
                        Davom etish
                      </Link>
                      <button className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition">
                        <FileText className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              Yutuqlarim
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className={`p-6 rounded-xl border-2 transition ${
                    achievement.earned 
                      ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50' 
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="text-6xl mb-4 text-center">{achievement.icon}</div>
                  <h3 className="font-bold text-xl text-center mb-2">{achievement.name}</h3>
                  <p className="text-sm text-gray-600 text-center">{achievement.description}</p>
                  {achievement.earned && (
                    <div className="mt-4 text-center">
                      <span className="inline-block px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                        Qo'lga kiritildi ✓
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}