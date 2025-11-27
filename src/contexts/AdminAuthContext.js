"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  // Initialize authentication state from localStorage synchronously
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_authenticated') === 'true';
    }
    return false;
  });
  const [isLoading, setIsLoading] = useState(true); // Start with loading true

  // Check localStorage on mount and set loading to false
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const adminAuth = localStorage.getItem('admin_authenticated') === 'true';
      setIsAuthenticated(adminAuth);
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Get admin credentials from Firebase
      const adminDoc = await getDoc(doc(db, 'demo/data'));
      
      if (!adminDoc.exists()) {
        throw new Error('Credenziali admin non trovate');
      }

      const adminData = adminDoc.data();
      const adminLogin = adminData.admin_login;

      if (!adminLogin) {
        throw new Error('Configurazione admin non trovata');
      }

      // Check credentials
      if (adminLogin.email === email && adminLogin.psw === password) {
        setIsAuthenticated(true);
        localStorage.setItem('admin_authenticated', 'true');
        return { success: true };
      } else {
        throw new Error('Email o password non corretti');
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};