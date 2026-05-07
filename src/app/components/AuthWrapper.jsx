// src/app/components/AuthWrapper.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { storage } from '../config/environment';

export default function AuthWrapper({ children, adminOnly = false }) {
  const token = storage.getToken();
  const user = storage.getUser();

  // Jika tidak ada token, redirect ke login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Jika rute ini khusus admin tapi user bukan admin, redirect ke portal
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/portal" replace />;
  }

  // Jika ada token dan memenuhi syarat role, render halaman yang dilindungi
  return children;
}
