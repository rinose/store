"use client";

import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch orders directly from Firestore
      const ordersRef = collection(db, 'demo', 'data', 'orders');
      const querySnapshot = await getDocs(ordersRef);
      
      const ordersList = [];
      querySnapshot.forEach((doc) => {
        ordersList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setOrders(ordersList || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const markOrderCompleted = async (orderId) => {
    try {
      // Update order directly in Firestore
      const orderRef = doc(db, 'demo', 'data', 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'completed', completedAt: new Date().toISOString() }
          : order
      ));
      alert('Ordine marcato come completato!');
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Errore di rete: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      // Handle Firebase timestamp objects
      let date;
      if (typeof dateString === 'object' && dateString.seconds) {
        date = new Date(dateString.seconds * 1000);
      } else {
        date = new Date(dateString);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Data non valida';
      }
      
      return date.toLocaleDateString('it-IT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Errore data';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Gestione Ordini</h1>
        <div className="flex justify-center items-center h-32">
          <div className="text-lg">Caricamento ordini...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Gestione Ordini</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Errore:</strong> {error}
        </div>
        <button 
          onClick={fetchOrders}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestione Ordini</h1>
        <button 
          onClick={fetchOrders}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Aggiorna Lista
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-8 rounded text-center">
          <p className="text-lg">Nessun ordine trovato.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Ordine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prodotti
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Totale
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Ordine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id?.slice(-8) || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{order.customerName || 'N/A'}</div>
                      <div className="text-gray-500">{order.customerEmail || 'N/A'}</div>
                      <div className="text-gray-500">{order.customerPhone || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs">
                      {order.items?.map((item, index) => (
                        <div key={index} className="mb-1">
                          <span className="font-medium">{item.quantity}x</span> {item.name || item.productName}
                          {item.price && <span className="text-gray-500"> ({formatPrice(item.price)})</span>}
                        </div>
                      )) || 'Nessun prodotto'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.total ? formatPrice(order.total) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status === 'pending' ? 'In Attesa' :
                       order.status === 'completed' ? 'Completato' :
                       order.status === 'cancelled' ? 'Annullato' : order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => markOrderCompleted(order.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Segna Completato
                      </button>
                    )}
                    {order.status === 'completed' && (
                      <span className="text-green-600 text-sm">
                        ✓ Completato {order.completedAt && `il ${formatDate(order.completedAt)}`}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Orders Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Ordini Totali</h3>
          <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">In Attesa</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {orders.filter(order => order.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Completati</h3>
          <p className="text-2xl font-bold text-green-600">
            {orders.filter(order => order.status === 'completed').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersPage;