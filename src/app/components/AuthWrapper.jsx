// src/app/components/AuthWrapper.jsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { storage } from '../config/environment';
import { Loader2 } from 'lucide-react';

export default function AuthWrapper({ children }) {
  const [token, setToken] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const savedToken = storage.getToken();
    setToken(savedToken);
    setIsChecking(false);
  }, []);

  if (isChecking) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  // Jika tidak ada token, redirect ke login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Jika ada token, render halaman yang dilindungi
  return children;
}