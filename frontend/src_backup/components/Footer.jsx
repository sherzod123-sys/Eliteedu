import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <span className="text-2xl font-bold">EduPlatform</span>
        </div>
        <p className="text-lg mb-6">
          © 2025 <span className="font-bold">EduPlatform</span>. Barcha huquqlar himoyalangan.
        </p>
        <div className="flex justify-center space-x-8 text-sm">
          <Link to="/privacy" className="text-gray-400 hover:text-white transition">
            Maxfiylik siyosati
          </Link>
          <Link to="/terms" className="text-gray-400 hover:text-white transition">
            Foydalanish shartlari
          </Link>
          <Link to="/contact" className="text-gray-400 hover:text-white transition">
            Aloqa
          </Link>
        </div>
      </div>
    </footer>
  );
}
