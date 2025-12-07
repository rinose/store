"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../contexts/AdminAuthContext';

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Verifica autenticazione...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Reindirizzamento al login...</div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;