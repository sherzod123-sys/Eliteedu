// src/pages/teacher/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  PlusCircle, 
  FileText, 
  X, 
  Edit3, 
  Eye, 
  Loader2,
  Image as ImageIcon,
  DollarSign,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosConfig';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseData, setCourseData] = useState({
    title: '',
    short_description: '',
    price: '',
    level: 'beginner',
    thumbnail: null,
  });
  const [courseLoading, setCourseLoading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const [showBlogForm, setShowBlogForm] = useState(false);
  const [blogData, setBlogData] = useState({
    title: '',
    content: '',
    featured_image: null,
  });
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogImagePreview, setBlogImagePreview] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');

    if (!savedUser || !token) {
      toast.error('Iltimos, avval login qiling');
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(savedUser);
    setUser(parsedUser);

    if (parsedUser.role !== 'teacher' && parsedUser.role !== 'admin') {
      toast.error('Bu sahifa faqat o\'qituvchilar uchun');
      navigate('/login');
      return;
    }

    fetchCourses();
  }, [navigate]);

  const fetchCourses = async () => {
    try {
      const res = await axiosInstance.get('/api/teacher/courses/');
      
      let coursesList = [];
      if (res.data) {
        if (Array.isArray(res.data)) {
          coursesList = res.data;
        } else if (res.data.results && Array.isArray(res.data.results)) {
          coursesList = res.data.results;
        }
      }
      setCourses(coursesList);
    } catch (err) {
      console.error('Kurslarni yuklashda xatolik:', err);
      toast.error('Kurslarni yuklashda xatolik');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async () => {
    if (!courseData.title.trim() || !courseData.short_description.trim() || !courseData.price) {
      toast.error('Barcha majburiy maydonlarni to\'ldiring');
      return;
    }

    setCourseLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', courseData.title);
      formData.append('short_description', courseData.short_description);
      formData.append('price', courseData.price);
      formData.append('level', courseData.level);
      if (courseData.thumbnail) {
        formData.append('thumbnail', courseData.thumbnail);
      }

      await axiosInstance.post('/api/teacher/courses/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Kurs muvaffaqiyatli qo\'shildi! 🎉');
      setShowCourseForm(false);
      setCourseData({ title: '', short_description: '', price: '', level: 'beginner', thumbnail: null });
      setThumbnailPreview(null);
      fetchCourses();
    } catch (err) {
      console.error(err);
      toast.error('Kurs qo\'shishda xatolik yuz berdi');
    } finally {
      setCourseLoading(false);
    }
  };

  const handleAddBlog = async () => {
    if (!blogData.title.trim() || !blogData.content.trim()) {
      toast.error('Sarlavha va matnni to\'ldiring');
      return;
    }

    setBlogLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', blogData.title);
      formData.append('content', blogData.content);
      if (blogData.featured_image) {
        formData.append('featured_image', blogData.featured_image);
      }

      const response = await axiosInstance.post('/api/blog/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Blog post muvaffaqiyatli chop etildi! 📝');
      setShowBlogForm(false);
      setBlogData({ title: '', content: '', featured_image: null });
      setBlogImagePreview(null);
    } catch (err) {
      console.error('Blog xatosi:', err.response?.data || err);
      toast.error('Post chop etishda xatolik yuz berdi');
    } finally {
      setBlogLoading(false);
    }
  };

  const handleCourseThumbnailChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setCourseData({ ...courseData, thumbnail: file });
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleBlogImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setBlogData({ ...blogData, featured_image: file });
      setBlogImagePreview(URL.createObjectURL(file));
    }
  };

  const removeThumbnail = () => {
    setCourseData({ ...courseData, thumbnail: null });
    setThumbnailPreview(null);
  };

  const removeBlogImage = () => {
    setBlogData({ ...blogData, featured_image: null });
    setBlogImagePreview(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700 font-medium">Dashboard yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Xush kelibsiz, {user?.full_name || user?.username || 'O\'qituvchi'}! 👋
              </h1>
              <p className="text-gray-600">Sizning o'quv platformangizni boshqaring</p>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-lg">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-900">
                  {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistika Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="w-12 h-12 opacity-80" />
              <span className="text-4xl font-bold">{courses.length}</span>
            </div>
            <p className="text-blue-100 font-medium">Jami kurslar</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-12 h-12 opacity-80" />
              <span className="text-4xl font-bold">0</span>
            </div>
            <p className="text-green-100 font-medium">Talabalar soni</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-12 h-12 opacity-80" />
              <span className="text-4xl font-bold">0</span>
            </div>
            <p className="text-purple-100 font-medium">Daromad (so'm)</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => setShowCourseForm(!showCourseForm)}
            className="bg-white hover:bg-gray-50 border-2 border-indigo-200 rounded-xl p-6 flex items-center justify-between group transition-all shadow-md hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 p-3 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <PlusCircle className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900">Yangi kurs</h3>
                <p className="text-sm text-gray-600">Yangi kurs yaratish</p>
              </div>
            </div>
            <span className="text-2xl">{showCourseForm ? '−' : '+'}</span>
          </button>

          <button
            onClick={() => setShowBlogForm(!showBlogForm)}
            className="bg-white hover:bg-gray-50 border-2 border-purple-200 rounded-xl p-6 flex items-center justify-between group transition-all shadow-md hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900">Yangi blog</h3>
                <p className="text-sm text-gray-600">Blog post yozish</p>
              </div>
            </div>
            <span className="text-2xl">{showBlogForm ? '−' : '+'}</span>
          </button>
        </div>

        {/* Kurs qo'shish Form */}
        {showCourseForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-2 border-indigo-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Yangi kurs yaratish</h2>
              <button onClick={() => setShowCourseForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kurs sarlavhasi *</label>
                <input
                  type="text"
                  placeholder="Masalan: Python dasturlash asoslari"
                  value={courseData.title}
                  onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Narxi (so'm) *</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={courseData.price}
                    onChange={(e) => setCourseData({ ...courseData, price: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Daraja</label>
                  <select
                    value={courseData.level}
                    onChange={(e) => setCourseData({ ...courseData, level: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  >
                    <option value="beginner">Boshlang'ich</option>
                    <option value="intermediate">O'rta</option>
                    <option value="advanced">Ilg'or</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qisqa tavsif *</label>
                <textarea
                  placeholder="Kurs haqida qisqacha ma'lumot..."
                  value={courseData.short_description}
                  onChange={(e) => setCourseData({ ...courseData, short_description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kurs rasmi</label>
                {thumbnailPreview ? (
                  <div className="relative inline-block">
                    <img src={thumbnailPreview} alt="Preview" className="w-48 h-32 object-cover rounded-lg" />
                    <button
                      onClick={removeThumbnail}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCourseThumbnailChange}
                      className="hidden"
                      id="course-thumbnail"
                    />
                    <label htmlFor="course-thumbnail" className="cursor-pointer">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">Rasm yuklash uchun bosing</p>
                    </label>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => setShowCourseForm(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleAddCourse}
                  disabled={courseLoading}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {courseLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saqlanmoqda...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      Kurs qo'shish
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Blog post qo'shish Form */}
        {showBlogForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Yangi blog post</h2>
              <button onClick={() => setShowBlogForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sarlavha *</label>
                <input
                  type="text"
                  placeholder="Blog post sarlavhasi"
                  value={blogData.title}
                  onChange={(e) => setBlogData({ ...blogData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Matn *</label>
                <textarea
                  placeholder="Blog post matni..."
                  value={blogData.content}
                  onChange={(e) => setBlogData({ ...blogData, content: e.target.value })}
                  rows="10"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rasm</label>
                {blogImagePreview ? (
                  <div className="relative inline-block">
                    <img src={blogImagePreview} alt="Preview" className="w-48 h-32 object-cover rounded-lg" />
                    <button
                      onClick={removeBlogImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBlogImageChange}
                      className="hidden"
                      id="blog-image"
                    />
                    <label htmlFor="blog-image" className="cursor-pointer">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">Rasm yuklash uchun bosing</p>
                    </label>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => setShowBlogForm(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleAddBlog}
                  disabled={blogLoading}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {blogLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Chop etilmoqda...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Chop etish
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Kurslar ro'yxati */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Mening kurslarim</h2>
          
          {courses.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-600 mb-6">Hozircha kurs yaratmagansiz</p>
              <button
                onClick={() => setShowCourseForm(true)}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition inline-flex items-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                Birinchi kursni yaratish
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all group">
                  <div className="relative h-48 overflow-hidden bg-gray-200">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        course.status === 'published' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-yellow-500 text-white'
                      }`}>
                        {course.status === 'published' ? 'Nashr etilgan' : 'Qoralama'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.short_description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-indigo-600">{course.price || 0} so'm</span>
                      <span className="text-xs text-gray-500 px-2 py-1 bg-gray-200 rounded">
                        {course.level === 'beginner' ? 'Boshlang\'ich' : course.level === 'intermediate' ? 'O\'rta' : 'Ilg\'or'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button className="bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm">
                        <Edit3 className="w-4 h-4" />
                        Tahrirlash
                      </button>
                      <button className="bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm">
                        <Eye className="w-4 h-4" />
                        Ko'rish
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}