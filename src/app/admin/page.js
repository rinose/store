"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AdminPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to products page by default
    router.replace('/admin/products');
  }, [router]);

  return (
    <div className="flex justify-center items-center h-32">
      <div className="text-lg text-gray-600">Reindirizzamento...</div>
    </div>
  );
};

export default AdminPage;