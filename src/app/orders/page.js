"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const OrdersPage = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserOrders(currentUser.uid);
      } else {
        // Redirect to login if not authenticated
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchUserOrders = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
      } else {
        setError(data.error || 'Errore nel caricamento degli ordini');
      }
    } catch (err) {
      setError('Errore di rete nel caricamento degli ordini');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data non disponibile';
    
    try {
      // Handle Firestore timestamp format
      if (dateString.seconds) {
        return new Date(dateString.seconds * 1000).toLocaleDateString('it-IT', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      return new Date(dateString).toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data non valida';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'in attesa':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
      case 'in lavorazione':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
      case 'completato':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'annullato':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'In attesa';
      case 'processing':
        return 'In lavorazione';
      case 'completed':
        return 'Completato';
      case 'cancelled':
        return 'Annullato';
      default:
        return status || 'Sconosciuto';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">I miei ordini</h1>
        <div className="flex justify-center items-center h-32">
          <div className="text-lg">Caricamento ordini...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">I miei ordini</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Errore:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">I miei ordini</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg mb-4">Non hai ancora effettuato ordini</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Inizia a fare shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white shadow-md rounded-lg p-6 border">
              {/* Order Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Ordine #{order.id.slice(-8)}</h3>
                  <p className="text-gray-600">{formatDate(order.createdAt)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              {/* Order Items */}
              <div className="mb-4">
                <h4 className="font-medium mb-2">Prodotti ordinati:</h4>
                <div className="space-y-2">
                  {order.items && order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1">
                        <span className="font-medium">{item.name || 'Prodotto sconosciuto'}</span>
                        <span className="text-gray-500 text-sm ml-2">x{item.quantity}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">€{(parseFloat(item.price || 0) * parseInt(item.quantity || 1)).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-lg font-semibold">Totale:</span>
                <span className="text-lg font-bold text-green-600">
                  €{parseFloat(order.total || 0).toFixed(2)}
                </span>
              </div>

              {/* Customer Info */}
              {order.customerInfo && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium mb-2">Informazioni di consegna:</h4>
                  <div className="text-sm text-gray-600">
                    <p><strong>Nome:</strong> {order.customerInfo.name}</p>
                    <p><strong>Email:</strong> {order.customerInfo.email}</p>
                    <p><strong>Telefono:</strong> {order.customerInfo.phone}</p>
                    {order.customerInfo.address && (
                      <p><strong>Indirizzo:</strong> {order.customerInfo.address}</p>
                    )}
                    {order.customerInfo.notes && (
                      <p><strong>Note:</strong> {order.customerInfo.notes}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;