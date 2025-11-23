"use client";

import React, { useState, useEffect } from 'react';
import { useBasket } from '../../contexts/BasketContext';
import { useRouter } from 'next/navigation';

const CheckoutPage = () => {
  const {
    basketItems,
    getBasketTotal,
    getBasketItemsCount,
    clearBasket
  } = useBasket();

  const router = useRouter();

  // Form states
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Italia',
    notes: ''
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if basket is empty
  useEffect(() => {
    if (basketItems.length === 0) {
      router.push('/basket');
    }
  }, [basketItems, router]);

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePaymentInfoChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number (add spaces every 4 digits)
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return; // Max 16 digits + 3 spaces
    }

    // Format expiry date (MM/YY)
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (formattedValue.length > 5) return; // Max MM/YY
    }

    // Format CVV (numbers only, max 4 digits)
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 4) return;
    }

    setPaymentInfo(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Customer info validation
    if (!customerInfo.firstName.trim()) newErrors.firstName = 'Nome è richiesto';
    if (!customerInfo.lastName.trim()) newErrors.lastName = 'Cognome è richiesto';
    if (!customerInfo.email.trim()) {
      newErrors.email = 'Email è richiesta';
    } else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
      newErrors.email = 'Email non valida';
    }
    if (!customerInfo.address.trim()) newErrors.address = 'Indirizzo è richiesto';
    if (!customerInfo.city.trim()) newErrors.city = 'Città è richiesta';
    if (!customerInfo.postalCode.trim()) newErrors.postalCode = 'CAP è richiesto';

    // Payment info validation
    if (!paymentInfo.cardNumber.replace(/\s/g, '')) {
      newErrors.cardNumber = 'Numero carta è richiesto';
    } else if (paymentInfo.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Numero carta deve avere 16 cifre';
    }

    if (!paymentInfo.expiryDate) {
      newErrors.expiryDate = 'Data scadenza è richiesta';
    } else if (!/^\d{2}\/\d{2}$/.test(paymentInfo.expiryDate)) {
      newErrors.expiryDate = 'Formato data non valido (MM/YY)';
    }

    if (!paymentInfo.cvv) {
      newErrors.cvv = 'CVV è richiesto';
    } else if (paymentInfo.cvv.length < 3) {
      newErrors.cvv = 'CVV deve avere almeno 3 cifre';
    }

    if (!paymentInfo.cardholderName.trim()) {
      newErrors.cardholderName = 'Nome su carta è richiesto';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create order in the database
      const orderData = {
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        items: basketItems.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          productId: item.id
        })),
        total: getBasketTotal(),
        shippingAddress: {
          address: customerInfo.address,
          city: customerInfo.city,
          postalCode: customerInfo.postalCode,
          country: customerInfo.country
        },
        notes: customerInfo.notes || ''
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        // Clear the basket
        clearBasket();
        
        // Show success message with order ID
        alert(`Pagamento completato con successo! Il tuo ordine #${result.orderId?.slice(-8)} è stato creato. Grazie!`);
        router.push('/orders');
      } else {
        throw new Error(result.error || 'Failed to create order');
      }
      
    } catch (error) {
      console.error('Order creation error:', error);
      alert('Errore durante la creazione dell\'ordine. Riprova più tardi.');
      setProcessing(false);
    }
  };

  const handleBackToBasket = () => {
    router.push('/basket');
  };

  if (basketItems.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Informazioni Cliente</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={customerInfo.firstName}
                    onChange={handleCustomerInfoChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Inserisci il tuo nome"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Cognome *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={customerInfo.lastName}
                    onChange={handleCustomerInfoChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Inserisci il tuo cognome"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleCustomerInfoChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="esempio@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleCustomerInfoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+39 123 456 7890"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Indirizzo *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={customerInfo.address}
                  onChange={handleCustomerInfoChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Via Roma, 123"
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    Città *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={customerInfo.city}
                    onChange={handleCustomerInfoChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Milano"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                    CAP *
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={customerInfo.postalCode}
                    onChange={handleCustomerInfoChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.postalCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="20121"
                  />
                  {errors.postalCode && (
                    <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Paese
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={customerInfo.country}
                    onChange={handleCustomerInfoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Italia">Italia</option>
                    <option value="Francia">Francia</option>
                    <option value="Germania">Germania</option>
                    <option value="Spagna">Spagna</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">💳 Informazioni Pagamento</h2>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Numero Carta *
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={paymentInfo.cardNumber}
                    onChange={handlePaymentInfoChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                  />
                  {errors.cardNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome sulla Carta *
                  </label>
                  <input
                    type="text"
                    id="cardholderName"
                    name="cardholderName"
                    value={paymentInfo.cardholderName}
                    onChange={handlePaymentInfoChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.cardholderName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Mario Rossi"
                  />
                  {errors.cardholderName && (
                    <p className="text-red-500 text-xs mt-1">{errors.cardholderName}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Data Scadenza *
                    </label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={paymentInfo.expiryDate}
                      onChange={handlePaymentInfoChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="MM/YY"
                      maxLength="5"
                    />
                    {errors.expiryDate && (
                      <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                      CVV *
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={paymentInfo.cvv}
                      onChange={handlePaymentInfoChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.cvv ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="123"
                      maxLength="4"
                    />
                    {errors.cvv && (
                      <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-between">
              <button
                type="button"
                onClick={handleBackToBasket}
                className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 transition-colors"
              >
                ← Torna al Carrello
              </button>
              
              <button
                type="submit"
                disabled={processing || basketItems.length === 0}
                className="bg-green-500 text-white px-8 py-3 rounded-md hover:bg-green-600 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Elaborando...
                  </>
                ) : (
                  <>
                    🔒 Completa Pagamento €{getBasketTotal().toFixed(2)}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-lg font-semibold mb-4">Riepilogo Ordine</h2>
            
            <div className="space-y-3 mb-4">
              {basketItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-gray-500">Qtà: {item.quantity}</p>
                  </div>
                  <p className="font-medium">
                    €{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            
            <hr className="my-4" />
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotale:</span>
                <span>€{getBasketTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Spedizione:</span>
                <span className="text-green-600">Gratuita</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>IVA (22%):</span>
                <span>€{(getBasketTotal() * 0.22).toFixed(2)}</span>
              </div>
            </div>
            
            <hr className="my-4" />
            
            <div className="flex justify-between text-lg font-bold">
              <span>Totale:</span>
              <span className="text-green-600">€{(getBasketTotal() * 1.22).toFixed(2)}</span>
            </div>
            
            <p className="text-xs text-gray-500 mt-4 text-center">
              🔒 Pagamento sicuro e protetto
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;