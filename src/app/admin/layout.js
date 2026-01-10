"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth, AdminAuthProvider } from '../../contexts/AdminAuthContext';
import ProtectedAdminRoute from '../../components/ProtectedAdminRoute';

const AdminNavigation = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isAuthenticated, isLoading } = useAdminAuth();

  const navItems = [
    { href: '/admin/products', label: 'Gestione Prodotti' },
    { href: '/admin/orders', label: 'Gestione Ordini' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/'); // Redirect to landing page
  };

  // Show only login page for unauthenticated users or login route
  if (!isAuthenticated || pathname === '/admin') {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  // Show full admin interface for authenticated users
  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <div className="flex items-center space-x-4">
                <Link 
                  href="/" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  ← Torna al sito
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Admin Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex space-x-0">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    pathname === item.href
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Admin Content */}
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </ProtectedAdminRoute>
  );
};

const AdminLayout = ({ children }) => {
  return (
    <AdminAuthProvider>
      <AdminNavigation>{children}</AdminNavigation>
    </AdminAuthProvider>
  );
};

export default AdminLayout;