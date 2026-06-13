// src/pages/Blog.jsx — HAQIQIY MAQOLALAR KO‘RINADI

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye, ArrowRight, Search, TrendingUp } from 'lucide-react';
import axios from 'axios';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Barchasi');

  const categories = ["Barchasi", "Web Development", "CSS", "Programming", "Backend", "Design", "Boshqa"];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://localhost:8000/api/blog/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPosts(response.data);
      } catch (err) {
        console.error("Xato:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Barchasi' || post.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = filteredPosts[0];
  const regularPosts = searchQuery || selectedCategory !== 'Barchasi' ? filteredPosts : filteredPosts.slice(1);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-2xl">Yuklanmoqda...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Blog & Yangiliklar</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Dasturlash va texnologiya dunyosidan eng so'nggi maqolalar
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search & Filter */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-12">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Maqola qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-lg font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Post */}
        {selectedCategory === 'Barchasi' && !searchQuery && featuredPost && (
          <div className="mb-16">
            <div className="flex items-center mb-6">
              <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold">Eng mashhur maqola</h2>
            </div>
            <FeaturedPostCard post={featuredPost} />
          </div>
        )}

        {/* Posts */}
        <h2 className="text-2xl font-bold mb-6">
          {searchQuery ? 'Qidiruv natijalari' : 'Barcha maqolalar'}
        </h2>

        {filteredPosts.length === 0 ? (
          <p className="text-center text-gray-500 py-16 text-lg">Hozircha maqolalar yo‘q</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map(post => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FeaturedPostCard({ post }) {
  return (
    <Link to={`/blog/${post.slug}`} className="block bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition group">
      <div className="grid lg:grid-cols-2">
        <div className="h-80 lg:h-auto overflow-hidden">
          <img
            src={post.image || "https://via.placeholder.com/800x400"}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-110 transition"
          />
        </div>
        <div className="p-12 flex flex-col justify-center">
          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold inline-block mb-4">
            {post.category?.name || "Umumiy"}
          </span>
          <h3 className="text-3xl font-bold mb-4 group-hover:text-blue-600 transition">{post.title}</h3>
          <p className="text-gray-600 mb-6 text-lg line-clamp-3">{post.excerpt || post.content?.substring(0, 200) + "..."}</p>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{new Date(post.created_at).toLocaleDateString('uz-UZ')}</span>
            <Eye className="w-4 h-4 ml-4 mr-1" />
            <span>{post.views || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function BlogCard({ post }) {
  return (
    <Link to={`/blog/${post.slug}`} className="block bg-white rounded-xl shadow-md hover:shadow-xl transition group overflow-hidden">
      <div className="h-48 overflow-hidden">
        <img
          src={post.image || "https://via.placeholder.com/600x400"}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-110 transition"
        />
      </div>
      <div className="p-6">
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <Calendar className="w-4 h-4 mr-1" />
          <span>{new Date(post.created_at).toLocaleDateString('uz-UZ')}</span>
        </div>
        <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.excerpt || post.content?.substring(0, 150) + "..."}
        </p>
        <span className="text-blue-600 font-semibold flex items-center">
          Batafsil o'qish
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
        </span>
      </div>
    </Link>
  );
}