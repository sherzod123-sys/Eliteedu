// src/pages/BlogDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Eye, ArrowLeft, Share2, ThumbsUp, ThumbsDown, MessageCircle, Send } from 'lucide-react';
import axios from 'axios';

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);

  const token = localStorage.getItem('access_token');
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`/api/blog/${slug}/`, { headers });
        
        setPost(response.data);
        setLikesCount(response.data.likes_count || 0);
        setDislikesCount(response.data.dislikes_count || 0);
        setComments(response.data.comments || []);
      } catch (err) {
        console.error("Maqola yuklashda xato:", err);
        setError("Maqola topilmadi yoki yuklashda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, token]);

  const handleReaction = async (type) => {
    if (!token) {
      alert("Reaktsiya qo‘yish uchun tizimga kirishingiz kerak");
      return;
    }

    try {
      await axios.post(
        `/api/blog/${slug}/reaction/`,
        { reaction: type },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (type === 'like') {
        if (liked) {
          setLikesCount(prev => prev - 1);
          setLiked(false);
        } else {
          setLikesCount(prev => prev + 1);
          setLiked(true);
          if (disliked) {
            setDislikesCount(prev => prev - 1);
            setDisliked(false);
          }
        }
      } else {
        if (disliked) {
          setDislikesCount(prev => prev - 1);
          setDisliked(false);
        } else {
          setDislikesCount(prev => prev + 1);
          setDisliked(true);
          if (liked) {
            setLikesCount(prev => prev - 1);
            setLiked(false);
          }
        }
      }
    } catch (err) {
      console.error("Reaktsiya xatosi:", err);
      alert("Reaktsiya qo‘yishda xatolik yuz berdi");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!token) {
      alert("Izoh yozish uchun tizimga kirishingiz kerak");
      return;
    }

    try {
      const response = await axios.post(
        `/api/blog/${slug}/comments/`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Yangi kommentariyani ro‘yxatga qo‘shish
      const newComm = {
        ...response.data,
        author_name: currentUser?.full_name || currentUser?.username || 'Foydalanuvchi',
        author_full_name: currentUser?.full_name || currentUser?.username,
      };

      setComments([newComm, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error("Izoh yozishda xato:", err);
      alert("Izoh yuborishda xatolik yuz berdi");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || "Maqola topilmadi"}</h2>
          <Link to="/blog" className="text-blue-600 hover:underline font-semibold">
            Blogga qaytish
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = post.featured_image 
    ? (post.featured_image.startsWith('http') ? post.featured_image : `${post.featured_image}`)
    : 'https://via.placeholder.com/1200x600?text=No+Image';

  const authorFullName = post.author_full_name || post.author?.username || 'Noma\'lum muallif';
  const authorInitial = authorFullName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 font-semibold transition">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Blogga qaytish
        </Link>

        <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="relative h-96 overflow-hidden bg-gray-200">
            <img 
              src={imageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => e.target.src = 'https://via.placeholder.com/1200x600?text=No+Image'}
            />
          </div>

          <div className="p-8 md:p-12">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
                Umumiy
              </span>
              <div className="flex items-center text-gray-500 text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{new Date(post.created_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <Eye className="w-4 h-4 mr-2" />
                <span>{post.views_count || 0} ko‘rish</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Muallif */}
            <div className="flex items-center mb-8 pb-8 border-b border-gray-200">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {authorInitial}
              </div>
              <div className="ml-4">
                <p className="font-semibold text-gray-900 text-lg">{authorFullName}</p>
                <p className="text-sm text-gray-500">Muallif</p>
              </div>
            </div>

            {/* Matn */}
            <div className="prose prose-lg max-w-none mb-8 text-gray-700 leading-relaxed">
              {post.content?.split('\n\n').map((p, i) => p.trim() && <p key={i} className="mb-6">{p}</p>)}
            </div>

            {/* Reaktsiyalar */}
            <div className="flex items-center gap-4 py-8 border-y border-gray-200">
              <button
                onClick={() => handleReaction('like')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                  liked ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ThumbsUp className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                <span>{likesCount}</span>
              </button>

              <button
                onClick={() => handleReaction('dislike')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                  disliked ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ThumbsDown className={`w-5 h-5 ${disliked ? 'fill-current' : ''}`} />
                <span>{dislikesCount}</span>
              </button>

              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Havola nusxalandi!');
                }}
                className="ml-auto flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition font-semibold"
              >
                <Share2 className="w-5 h-5" />
                Ulashish
              </button>
            </div>

            {/* Izohlar bo‘limi */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <MessageCircle className="w-6 h-6 mr-2 text-blue-600" />
                Izohlar ({comments.length})
              </h3>

              {/* Yangi izoh formasi */}
              <form onSubmit={handleCommentSubmit} className="mb-8">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Izohingizni yozing..."
                    rows="4"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                      Yuborish
                    </button>
                  </div>
                </div>
              </form>

              {/* Izohlar ro‘yxati */}
              <div className="space-y-6">
                {comments.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Hozircha izoh yo‘q. Birinchilardan bo‘ling!
                  </p>
                ) : (
                  comments.map((comment) => {
                    const commAuthorName = comment.author_full_name || comment.author_name || 'Foydalanuvchi';
                    const commInitial = commAuthorName.charAt(0).toUpperCase();

                    return (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {commInitial}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="font-semibold text-gray-900">{commAuthorName}</p>
                              <span className="text-sm text-gray-500">
                                {new Date(comment.created_at).toLocaleDateString('uz-UZ')}
                              </span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}