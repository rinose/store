"use client";

import React from 'react';

const CheckoutPage = () => {
  const handleCheckout = async () => {
    try {
      console.log('Initiating checkout...'); // Debugging log
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            { price: 'price_1Hh1Y2EEnylL9Zf3X9', quantity: 1 }, // Replace with your price ID
          ],
          successUrl: 'https://your-site.com/success',
          cancelUrl: 'https://your-site.com/cancel',
        }),
      });

      console.log('API response received:', response); // Debugging log
      const { url } = await response.json();
      console.log('Stripe Checkout URL:', url); // Debugging log

      if (url) {
        window.location.href = url; // Redirect to Stripe Checkout
      } else {
        console.error('Failed to retrieve Stripe Checkout URL');
      }
    } catch (error) {
      console.error('Error redirecting to Stripe Checkout:', error);
    }
  };

  return (
    <div className="checkout-page max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <button
        onClick={handleCheckout}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Pay Now
      </button>
    </div>
  );
};

export default CheckoutPage;