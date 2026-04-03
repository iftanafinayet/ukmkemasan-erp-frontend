// src/app/components/AuthWrapper.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { storage } from '../config/environment';

export default function AuthWrapper({ children }) {
  const token = storage.getToken();

  // Jika tidak ada token, redirect ke login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Jika ada token, render halaman yang dilindungi
  return children;
}
