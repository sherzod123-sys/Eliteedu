// src/components/CourseCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const CourseCard = ({ course }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-transform duration-300 hover:-translate-y-2">
      <div className="h-48 overflow-hidden">
        <img
          src={course.thumbnail || 'https://via.placeholder.com/400x300?text=Kurs+Rasmi'}
          alt={course.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
          {course.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {course.description || 'Kurs haqida qisqacha maʼlumot yoʻq.'}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center">
              👥 {course.total_students || 0} talaba
            </span>
            <span className="flex items-center">
              ⭐ {course.rating || '0.0'}
            </span>
          </div>
          <span className="text-lg font-bold text-blue-600">
            {course.price ? `${course.price} so'm` : 'Bepul'}
          </span>
        </div>

        <Link
          to={`/course/${course.id}`}
          className="block w-full text-center py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition"
        >
          Batafsil ko‘rish
        </Link>
      </div>
    </div>
  );
};

CourseCard.propTypes = {
  course: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    thumbnail: PropTypes.string,
    total_students: PropTypes.number,
    rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
};

export default CourseCard;