// src/components/ProtectedRoute.jsx – 100% ISHLAYDIGAN VERSIYA

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // localStorage dan token borligini tekshiramiz
  const token = localStorage.getItem('access_token');

  // Agar token yo‘q bo‘lsa → login sahifasiga yuboramiz
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Agar token bo‘lsa → ichki sahifalarni ko‘rsatamiz
  return <Outlet />;
};

export default ProtectedRoute;