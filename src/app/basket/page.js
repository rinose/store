"use client";

import React, { useState, useRef, useCallback } from 'react';
import { useBasket } from '../../contexts/BasketContext';
import { useRouter } from 'next/navigation';
import { db, auth } from '../../firebase';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { signInAnonymously, signOut } from 'firebase/auth';

// CRITICAL: Global lock variable - checked synchronously before any async operations
let isCheckoutProcessing = false;

const BasketPage = () => {
  const {
    basketItems,
    removeFromBasket,
    updateQuantity,
    clearBasket,
    getBasketTotal,
    getBasketItemsCount
  } = useBasket();

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerSurname, setCustomerSurname] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Use ref for immediate synchronous check - survives re-renders
  const checkoutLockRef = useRef(false);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      if (window.confirm('Rimuovere questo prodotto dal carrello?')) {
        removeFromBasket(productId);
      }
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId, productName) => {
    if (window.confirm(`Rimuovere "${productName}" dal carrello?`)) {
      removeFromBasket(productId);
    }
  };

  const handleClearBasket = () => {
    if (window.confirm('Svuotare completamente il carrello?')) {
      clearBasket();
    }
  };

  const handleContinueShopping = () => {
    router.push('/products');
  };

  const handleCheckout = useCallback(async () => {
    const callTimestamp = new Date().toISOString();
    console.log('═══════════════════════════════════════════════════════');
    console.log(`🔵 handleCheckout CALLED at ${callTimestamp}`);
    console.log(`📊 Current lock status: isCheckoutProcessing=${isCheckoutProcessing}, loading=${loading}`);
    console.log(`🔍 Stack trace:`, new Error().stack);
    console.log('═══════════════════════════════════════════════════════');
    
    // CRITICAL: Check the SYNCHRONOUS lock FIRST before anything else
    // This is checked BEFORE setState which is async
    if (isCheckoutProcessing) {
      console.log('🚫 🚫 🚫 HARD BLOCKED BY SYNCHRONOUS LOCK 🚫 🚫 🚫');
      console.log('Another checkout is already processing. Ignoring this call completely.');
      return;
    }
    
    if (loading) {
      console.log('⚠️  BLOCKED: loading state is true');
      return;
    }

    if (basketItems.length === 0) {
      console.log('⚠️  BLOCKED: Basket is empty');
      alert('Il carrello è vuoto');
      return;
    }

    // Validate customer information
    if (!customerName.trim()) {
      console.log('⚠️  BLOCKED: Name is empty');
      alert('Inserisci il tuo nome');
      return;
    }
    
    if (!customerSurname.trim()) {
      console.log('⚠️  BLOCKED: Surname is empty');
      alert('Inserisci il tuo cognome');
      return;
    }
    
    if (!customerEmail.trim()) {
      console.log('⚠️  BLOCKED: Email is empty');
      alert('Inserisci la tua email');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      console.log('⚠️  BLOCKED: Invalid email format');
      alert('Inserisci un indirizzo email valido');
      return;
    }

    // Set the SYNCHRONOUS lock IMMEDIATELY - this is checked instantly
    console.log('� SETTING SYNCHRONOUS LOCK: isCheckoutProcessing = true');
    isCheckoutProcessing = true;
    
    // Then set the async state
    console.log('🔒 Setting loading=true');
    setLoading(true);
    setError(null);
    
    let unsubscribe = null;
    let timeoutId = null;

    try {
      console.log('🚀 Starting Stripe Checkout Session creation process...');
      
      // CRITICAL: Always sign out and create a NEW anonymous user
      // This prevents idempotency key conflicts from reusing the same user
      if (auth.currentUser) {
        console.log(`🔓 Signing out existing user: ${auth.currentUser.uid}`);
        await signOut(auth);
        console.log('✅ Signed out successfully');
      }
      
      // Create a brand new anonymous user for this checkout session
      console.log('👤 Creating new anonymous user...');
      const userCredential = await signInAnonymously(auth);
      const userId = userCredential.user.uid;
      console.log(`✅ New anonymous user created: ${userId}`);
      
      // Create line items for Stripe
      const line_items = basketItems.map(item => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            description: item.description || '',
            images: item.imageUrls && item.imageUrls.length > 0 ? [item.imageUrls[0]] : []
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity
      }));
      
      console.log(`📦 Created ${line_items.length} line items for Stripe`);
      
      // Generate a unique reference for this checkout attempt
      // Use microseconds + random to ensure absolute uniqueness
      const uniqueReference = `order_${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${performance.now().toString().replace('.', '')}`;
      console.log(`🔑 Generated unique reference: ${uniqueReference}`);
      
      // Create checkout session data
      // Store customer information in metadata
      // Each addDoc creates a UNIQUE Firestore document ID automatically
      const sessionData = {
        mode: 'payment',
        line_items: line_items,
        success_url: window.location.origin + '/products?checkout=success',
        cancel_url: window.location.origin + '/basket',
        client_reference_id: uniqueReference, // Unique ID to prevent Stripe idempotency conflicts
        customer_email: customerEmail, // Stripe will prefill this
        automatic_tax: {
          enabled: false
        },
        metadata: {
          order_reference: uniqueReference,
          timestamp: callTimestamp,
          customer_name: customerName.trim(),
          customer_surname: customerSurname.trim(),
          customer_email: customerEmail.trim(),
          customer_phone: customerPhone.trim()
        }
      };

      console.log('📝 Session data prepared:', {
        mode: sessionData.mode,
        client_reference_id: sessionData.client_reference_id,
        line_items_count: line_items.length
      });

      // Create a SINGLE checkout session in Firestore
      // This will only be written ONCE per handleCheckout call
      console.log('💾 WRITING TO FIRESTORE: customers/' + userId + '/checkout_sessions');
      const checkoutSessionRef = await addDoc(
        collection(db, 'customers', userId, 'checkout_sessions'),
        sessionData
      );

      console.log('✅ ✅ ✅ FIRESTORE WRITE COMPLETE ✅ ✅ ✅');
      console.log(`📄 Document ID: ${checkoutSessionRef.id}`);
      console.log(`📍 Full path: customers/${userId}/checkout_sessions/${checkoutSessionRef.id}`);

      // Set a timeout in case the Stripe Extension doesn't respond
      console.log('⏰ Setting 30-second timeout for Stripe response');
      timeoutId = setTimeout(() => {
        console.error('❌ TIMEOUT: No response from Stripe after 30 seconds');
        setError('Timeout: impossibile creare la sessione di pagamento. Ricarica la pagina e riprova.');
        setLoading(false);
        isCheckoutProcessing = false; // Release synchronous lock
        console.log('🔓 Released synchronous lock (timeout)');
        if (unsubscribe) unsubscribe();
      }, 30000); // 30 seconds

      // Listen for the session document to be updated with Stripe URL
      // The Firebase Stripe Extension will add the 'url' field when ready
      console.log('👂 Starting to listen for Stripe URL updates...');
      unsubscribe = onSnapshot(checkoutSessionRef, (snap) => {
        const data = snap.data();
        
        console.log('🔔 Snapshot update received:', {
          hasUrl: !!data?.url,
          hasError: !!data?.error,
          sessionId: data?.sessionId
        });
        
        // Handle errors from Stripe Extension
        if (data?.error) {
          console.error('❌ Stripe Extension returned error:', data.error);
          setError(`Errore Stripe: ${data.error.message}. Ricarica la pagina e riprova.`);
          setLoading(false);
          isCheckoutProcessing = false; // Release synchronous lock
          console.log('🔓 Released synchronous lock (Stripe error)');
          clearTimeout(timeoutId);
          unsubscribe();
          return;
        }
        
        // When Stripe URL is ready, redirect immediately
        if (data?.url) {
          console.log('✅ Stripe checkout URL received!');
          console.log('🌐 Redirecting to:', data.url);
          clearTimeout(timeoutId);
          clearBasket();
          console.log('🧹 Basket cleared');
          // Note: We DON'T release the lock here because we're redirecting away
          // The page will reload/navigate, so the lock will be reset naturally
          console.log('🚀 Initiating redirect...');
          window.location.assign(data.url);
          unsubscribe();
        }
      }, (error) => {
        // Handle onSnapshot errors
        console.error('❌ onSnapshot error:', error);
        setError(`Errore di connessione: ${error.message}. Ricarica la pagina e riprova.`);
        setLoading(false);
        isCheckoutProcessing = false; // Release synchronous lock
        console.log('🔓 Released synchronous lock (onSnapshot error)');
        clearTimeout(timeoutId);
      });

    } catch (err) {
      console.error('❌ EXCEPTION in handleCheckout:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        stack: err.stack
      });
      setError(`Errore: ${err.message}. Ricarica la pagina e riprova.`);
      setLoading(false);
      isCheckoutProcessing = false; // Release synchronous lock
      console.log('🔓 Released synchronous lock (exception)');
      if (timeoutId) clearTimeout(timeoutId);
      if (unsubscribe) unsubscribe();
    }
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔵 handleCheckout COMPLETED');
    console.log('═══════════════════════════════════════════════════════');
  }, [basketItems, loading, clearBasket, customerName, customerSurname, customerEmail, customerPhone]); // Dependencies for useCallback


  if (basketItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Carrello</h1>
        
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold mb-2 text-gray-600">Il tuo carrello è vuoto</h2>
          <p className="text-gray-500 mb-6">Aggiungi alcuni prodotti per iniziare lo shopping!</p>
          
          <button
            onClick={handleContinueShopping}
            className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors"
          >
            Continua lo Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Carrello ({getBasketItemsCount()} {getBasketItemsCount() === 1 ? 'articolo' : 'articoli'})</h1>
        
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={handleContinueShopping}
            className="flex-1 sm:flex-none bg-gray-500 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-gray-600 transition-colors text-sm sm:text-base"
          >
            <span className="hidden sm:inline">Continua lo Shopping</span>
            <span className="sm:hidden">Continua</span>
          </button>
          
          <button
            onClick={handleClearBasket}
            className="flex-1 sm:flex-none bg-red-500 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-sm sm:text-base"
          >
            <span className="hidden sm:inline">Svuota Carrello</span>
            <span className="sm:hidden">Svuota</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Prodotti nel carrello</h2>
              
              <div className="space-y-4">
                {basketItems.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1 w-full">
                      <h3 className="font-semibold text-base sm:text-lg">{item.name}</h3>
                      
                      {item.description && (
                        <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                      )}
                      
                      {item.category && (
                        <p className="text-gray-500 text-sm">Categoria: {item.category}</p>
                      )}
                      
                      {item.tags && item.tags.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <label htmlFor={`quantity-${item.id}`} className="text-sm text-gray-600 whitespace-nowrap">
                          Quantità:
                        </label>
                        <div className="flex items-center">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="bg-gray-200 text-gray-700 px-3 py-2 rounded-l hover:bg-gray-300"
                          >
                            -
                          </button>
                          <input
                            id={`quantity-${item.id}`}
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                            className="w-16 px-2 py-2 text-center border-t border-b border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                          />
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="bg-gray-200 text-gray-700 px-3 py-2 rounded-r hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="flex justify-between items-center w-full sm:w-auto gap-4">
                        <div className="text-left sm:text-right">
                          <p className="text-sm text-gray-600">
                            €{item.price ? item.price.toFixed(2) : '0.00'} cad.
                          </p>
                          <p className="font-bold text-green-600 text-base sm:text-lg">
                            €{item.price ? (item.price * item.quantity).toFixed(2) : '0.00'}
                          </p>
                        </div>
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.id, item.name)}
                          className="text-red-500 hover:text-red-700 transition-colors text-2xl p-1 flex-shrink-0"
                          title="Rimuovi dal carrello"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-lg font-semibold mb-4">Informazioni Cliente</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}
            
            {/* Customer Information Form */}
            <div className="space-y-3 mb-6">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  id="customerName"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Mario"
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <label htmlFor="customerSurname" className="block text-sm font-medium text-gray-700 mb-1">
                  Cognome <span className="text-red-500">*</span>
                </label>
                <input
                  id="customerSurname"
                  type="text"
                  value={customerSurname}
                  onChange={(e) => setCustomerSurname(e.target.value)}
                  placeholder="Rossi"
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="mario.rossi@email.com"
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefono <span className="text-gray-400 text-xs">(opzionale)</span>
                </label>
                <input
                  id="customerPhone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+39 333 123 4567"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>
            
            <hr className="my-4" />
            
            <h2 className="text-lg font-semibold mb-4">Riepilogo Ordine</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Articoli ({getBasketItemsCount()}):</span>
                <span>€{getBasketTotal().toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Spedizione:</span>
                <span className="text-green-600">Gratuita</span>
              </div>
              
              <hr className="my-3" />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Totale:</span>
                <span className="text-green-600">€{getBasketTotal().toFixed(2)}</span>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={basketItems.length === 0 || loading}
              className={`w-full py-3 rounded-md mt-6 font-medium transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : basketItems.length === 0
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {loading ? 'Reindirizzamento a Stripe...' : 'Procedi al Pagamento'}
            </button>
            
            {!loading && (
              <p className="text-center text-xs text-gray-500 mt-3">
                Pagamento sicuro tramite Stripe
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasketPage;