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
      
      // Fetch orders from Stripe checkout sessions in customers collection
      const customersRef = collection(db, 'customers');
      const customersSnapshot = await getDocs(customersRef);
      
      const ordersList = [];
      
      // Iterate through all customers
      for (const customerDoc of customersSnapshot.docs) {
        const customerId = customerDoc.id;
        
        // Get all checkout sessions for this customer
        const checkoutSessionsRef = collection(db, 'customers', customerId, 'checkout_sessions');
        const sessionsSnapshot = await getDocs(checkoutSessionsRef);
        
        sessionsSnapshot.forEach((sessionDoc) => {
          const sessionData = sessionDoc.data();
          
          // Parse line_items to extract products and calculate total
          let items = [];
          let total = 0;
          
          if (sessionData.line_items && Array.isArray(sessionData.line_items)) {
            items = sessionData.line_items.map(item => {
              const productData = item.price_data?.product_data || {};
              const unitAmount = item.price_data?.unit_amount || 0;
              const quantity = item.quantity || 1;
              
              total += (unitAmount * quantity);
              
              return {
                name: productData.name || 'Prodotto senza nome',
                description: productData.description || '',
                quantity: quantity,
                price: unitAmount / 100, // Convert cents to euros
                images: productData.images || []
              };
            });
          }
          
          // Convert total from cents to euros
          total = total / 100;
          
          // Only include sessions with valid data
          if (sessionData.sessionId || sessionData.created) {
            const metadata = sessionData.metadata || {};
            ordersList.push({
              id: sessionDoc.id,
              customerId: customerId,
              sessionId: sessionData.sessionId,
              items: items,
              total: total,
              createdAt: sessionData.created,
              metadata: metadata,
              customerName: metadata.customer_name || '',
              customerSurname: metadata.customer_surname || '',
              customerEmail: metadata.customer_email || '',
              customerPhone: metadata.customer_phone || '',
              status: sessionData.error ? 'error' : (sessionData.status || 'pending'),
              error: sessionData.error,
              url: sessionData.url
            });
          }
        });
      }
      
      // Sort by date (most recent first)
      ordersList.sort((a, b) => {
        const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(0);
        const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(0);
        return dateB - dateA;
      });
      
      setOrders(ordersList);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const markOrderCompleted = async (orderId, customerId) => {
    try {
      // Update checkout session directly in Firestore
      const sessionRef = doc(db, 'customers', customerId, 'checkout_sessions', orderId);
      await updateDoc(sessionRef, {
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
      case 'error': return 'bg-red-200 text-red-900';
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
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Ordine
                </th>
                <th className="w-48 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cognome
                </th>
                <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefono
                </th>
                <th className="w-64 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prodotti
                </th>
                <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Totale
                </th>
                <th className="w-40 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Ordine
                </th>
                <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stato
                </th>
                <th className="w-40 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    {order.customerEmail || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.customerName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.customerSurname || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.customerPhone || '-'}
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
                       order.status === 'cancelled' ? 'Annullato' :
                       order.status === 'error' ? 'Errore' : order.status}
                    </span>
                    {order.error && (
                      <div className="text-xs text-red-600 mt-1 max-w-xs">
                        {order.error.message}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => markOrderCompleted(order.id, order.customerId)}
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