"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const BasketContext = createContext();

export const useBasket = () => {
  const context = useContext(BasketContext);
  if (!context) {
    throw new Error('useBasket must be used within a BasketProvider');
  }
  return context;
};

export const BasketProvider = ({ children }) => {
  const [basketItems, setBasketItems] = useState([]);

  // Load basket from localStorage on mount
  useEffect(() => {
    try {
      const savedBasket = localStorage.getItem('shopping-basket');
      if (savedBasket) {
        setBasketItems(JSON.parse(savedBasket));
      }
    } catch (error) {
      console.error('Error loading basket from localStorage:', error);
    }
  }, []);

  // Save basket to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('shopping-basket', JSON.stringify(basketItems));
    } catch (error) {
      console.error('Error saving basket to localStorage:', error);
    }
  }, [basketItems]);

  const addToBasket = (product, quantity = 1) => {
    setBasketItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item to basket
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  const removeFromBasket = (productId) => {
    setBasketItems(prevItems => 
      prevItems.filter(item => item.id !== productId)
    );
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromBasket(productId);
      return;
    }
    
    setBasketItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearBasket = () => {
    setBasketItems([]);
  };

  const getBasketTotal = () => {
    return basketItems.reduce((total, item) => {
      return total + (item.price || 0) * item.quantity;
    }, 0);
  };

  const getBasketItemsCount = () => {
    return basketItems.reduce((count, item) => count + item.quantity, 0);
  };

  const getBasketItemQuantity = (productId) => {
    const item = basketItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const value = {
    basketItems,
    addToBasket,
    removeFromBasket,
    updateQuantity,
    clearBasket,
    getBasketTotal,
    getBasketItemsCount,
    getBasketItemQuantity
  };

  return (
    <BasketContext.Provider value={value}>
      {children}
    </BasketContext.Provider>
  );
};