"use client";

import React, { useState } from 'react';
import { db } from '../../../firebase';
import { collection, getDocs } from 'firebase/firestore';

const DebugOrdersPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAndInspect = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Starting to fetch customers...');
      const customersRef = collection(db, 'customers');
      const customersSnapshot = await getDocs(customersRef);
      
      const allData = [];
      
      console.log(`📊 Found ${customersSnapshot.size} customers`);
      
      for (const customerDoc of customersSnapshot.docs) {
        const customerId = customerDoc.id;
        console.log(`\n👤 Customer ID: ${customerId}`);
        
        const checkoutSessionsRef = collection(db, 'customers', customerId, 'checkout_sessions');
        const sessionsSnapshot = await getDocs(checkoutSessionsRef);
        
        console.log(`  📦 Found ${sessionsSnapshot.size} checkout sessions`);
        
        sessionsSnapshot.forEach((sessionDoc) => {
          const sessionData = sessionDoc.data();
          console.log(`\n  🎫 Session ID: ${sessionDoc.id}`);
          console.log('  📋 Session Data:', sessionData);
          console.log('  🔑 Keys:', Object.keys(sessionData));
          
          allData.push({
            customerId: customerId,
            sessionId: sessionDoc.id,
            data: sessionData,
            keys: Object.keys(sessionData)
          });
        });
      }
      
      setData(allData);
      console.log('\n✅ Complete data:', allData);
      
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">🐛 Debug Orders - Inspect Firestore Data</h1>
      
      <button
        onClick={fetchAndInspect}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 mb-6"
      >
        {loading ? 'Loading...' : 'Fetch & Inspect Data'}
      </button>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {data && (
        <div className="space-y-6">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong>Found {data.length} checkout sessions total</strong>
          </div>
          
          {data.map((item, index) => (
            <div key={index} className="bg-white shadow-lg rounded-lg p-6 border">
              <h2 className="text-xl font-bold mb-2">Session #{index + 1}</h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">Customer ID:</p>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">{item.customerId}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">Session ID:</p>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">{item.sessionId}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Available Fields:</p>
                <div className="flex flex-wrap gap-2">
                  {item.keys.map(key => (
                    <span key={key} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                      {key}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-2">Full Data (JSON):</p>
                <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-xs font-mono max-h-96 overflow-y-auto">
                  {JSON.stringify(item.data, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-bold text-yellow-800 mb-2">📝 Instructions:</h3>
        <ol className="list-decimal list-inside text-sm text-yellow-800 space-y-1">
          <li>Click "Fetch & Inspect Data" button</li>
          <li>Open browser console (F12) to see detailed logs</li>
          <li>Check the "Available Fields" to see what data exists</li>
          <li>Review the JSON to understand the structure</li>
          <li>Use this info to update the orders page correctly</li>
        </ol>
      </div>
    </div>
  );
};

export default DebugOrdersPage;
