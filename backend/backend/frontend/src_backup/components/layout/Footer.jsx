// src/components/Footer.jsx  ← TO‘LIQ shu bilan almashtiring!
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Facebook, Instagram, Telegram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold">EduPlatform</span>
            </div>
            <p className="text-gray-400 mb-4">
              Professional ta'lim platformasi - bilim olishning eng oson yo'li
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                 className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                 className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://t.me/eduplatform" target="_blank" rel="noopener noreferrer"
                 className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-500 transition">
                <Telegram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                 className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Tez havolalar</h3>
            <ul className="space-y-2">
              <li><Link to="/courses" className="text-gray-400 hover:text-white transition">Kurslar</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition">Biz haqimizda</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-white transition">Blog</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition">Aloqa</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kategoriyalar</h3>
            <ul className="space-y-2">
              <li><Link to="/courses?category=web" className="text-gray-400 hover:text-white transition">Web Development</Link></li>
              <li><Link to="/courses?category=mobile" className="text-gray-400 hover:text-white transition">Mobile Development</Link></li>
              <li><Link to="/courses?category=design" className="text-gray-400 hover:text-white transition">Design</Link></li>
              <li><Link to="/courses?category=business" className="text-gray-400 hover:text-white transition">Business</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Bog'lanish</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-2 mt-1 flex-shrink-0 text-gray-400" />
                <span className="text-gray-400">Toshkent sh., Chilonzor tumani</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-2 flex-shrink-0 text-gray-400" />
                <span className="text-gray-400">+998 90 123 45 67</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-2 flex-shrink-0 text-gray-400" />
                <span className="text-gray-400">info@eduplatform.uz</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="text-gray-400 mb-4 md:mb-0">
              © 2025 EduPlatform. Barcha huquqlar himoyalangan.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition">Maxfiylik siyosati</Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition">Foydalanish shartlari</Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white transition">Cookie siyosati</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}