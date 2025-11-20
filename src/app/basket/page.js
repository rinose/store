"use client";

import React from 'react';
import { useBasket } from '../../contexts/BasketContext';
import { useRouter } from 'next/navigation';

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

  const handleCheckout = () => {
    router.push('/checkout');
  };

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Carrello ({getBasketItemsCount()} {getBasketItemsCount() === 1 ? 'articolo' : 'articoli'})</h1>
        
        <div className="flex gap-3">
          <button
            onClick={handleContinueShopping}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            Continua lo Shopping
          </button>
          
          <button
            onClick={handleClearBasket}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
          >
            Svuota Carrello
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
                  <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      
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
                    
                    <div className="flex items-center gap-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <label htmlFor={`quantity-${item.id}`} className="text-sm text-gray-600">
                          Quantità:
                        </label>
                        <div className="flex items-center">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="bg-gray-200 text-gray-700 px-2 py-1 rounded-l hover:bg-gray-300"
                          >
                            -
                          </button>
                          <input
                            id={`quantity-${item.id}`}
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                            className="w-16 px-2 py-1 text-center border-t border-b border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="bg-gray-200 text-gray-700 px-2 py-1 rounded-r hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right min-w-[80px]">
                        <p className="text-sm text-gray-600">
                          €{item.price ? item.price.toFixed(2) : '0.00'} cad.
                        </p>
                        <p className="font-bold text-green-600">
                          €{item.price ? (item.price * item.quantity).toFixed(2) : '0.00'}
                        </p>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id, item.name)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                        title="Rimuovi dal carrello"
                      >
                        🗑️
                      </button>
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
              disabled={basketItems.length === 0}
              className="w-full bg-green-500 text-white py-3 rounded-md mt-6 hover:bg-green-600 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Procedi al Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasketPage;