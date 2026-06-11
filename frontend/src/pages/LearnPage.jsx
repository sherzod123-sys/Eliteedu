// src/pages/LearnPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Play, CheckCircle, Lock, ChevronDown, ChevronUp } from 'lucide-react';

export default function LearnPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [curriculum, setCurriculum] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonData, setLessonData] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Kurs dasturini yuklash
    fetch(`http://127.0.0.1:8000/api/courses/${courseId}/curriculum/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          localStorage.clear();
          navigate('/login');
        }
        return res.json();
      })
      .then(data => {
        setCurriculum(data);
        setLoading(false);
        // Birinchi darsni avto tanlash
        if (data?.modules?.[0]?.lessons?.[0]) {
          setSelectedLesson(data.modules[0].lessons[0].id);
        }
      })
      .catch(err => {
        console.error(err);
        toast.error('Kurs yuklanmadi');
        setLoading(false);
      });
  }, [courseId, token, navigate]);

  useEffect(() => {
    if (selectedLesson) {
      fetch(`http://127.0.0.1:8000/api/lessons/${selectedLesson}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setLessonData(data))
        .catch(err => console.error(err));
    }
  }, [selectedLesson, token]);

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const completeLesson = () => {
    fetch(`http://127.0.0.1:8000/api/lessons/${selectedLesson}/complete/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ time_spent: 0 })
    })
      .then(() => toast.success('Dars yakunlandi!'))
      .catch(() => toast.error('Xato yuz berdi'));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Yuklanmoqda...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Video Player */}
      <div className="flex-1 flex flex-col">
        <div className="bg-black aspect-video relative">
          {lessonData?.video_url ? (
            <video
              src={lessonData.video_url}
              controls
              autoPlay
              className="w-full h-full"
              onEnded={completeLesson}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white text-2xl">
              <Play className="w-20 h-20 mr-4" />
              Darsni tanlang
            </div>
          )}
        </div>

        <div className="bg-gray-800 text-white p-8">
          <h1 className="text-3xl font-bold mb-3">
            {lessonData?.title || 'Darsni tanlang'}
          </h1>
          <p className="text-gray-300 mb-6">{lessonData?.description || ''}</p>

          {lessonData && (
            <div className="flex gap-4">
              <button
                onClick={completeLesson}
                className="px-8 py-3 bg-green-600 rounded-lg hover:bg-green-700 font-semibold"
              >
                Darsni yakunlash
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-96 bg-gray-800 text-white overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold">Kurs dasturi</h2>
        </div>

        <div className="p-4">
          {curriculum?.modules?.map(module => (
            <div key={module.id} className="mb-6">
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full flex justify-between items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600"
              >
                <span className="font-semibold text-lg">{module.title}</span>
                {expandedModules[module.id] ? <ChevronUp /> : <ChevronDown />}
              </button>

              {expandedModules[module.id] && (
                <div className="mt-3 space-y-2">
                  {module.lessons?.map(lesson => (
                    <button
                      key={lesson.id}
                      onClick={() => setSelectedLesson(lesson.id)}
                      className={`w-full text-left p-4 rounded-lg transition ${
                        selectedLesson === lesson.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {lesson.is_completed ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : lesson.is_locked ? (
                            <Lock className="w-5 h-5 text-gray-400" />
                          ) : (
                            <Play className="w-5 h-5" />
                          )}
                          <span>{lesson.title}</span>
                        </div>
                        <span className="text-sm text-gray-400">
                          {lesson.duration || '10 min'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}