"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useBasket } from '../../contexts/BasketContext';
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

const ProductPage = () => {
  const { addToBasket, getBasketItemQuantity } = useBasket();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal state for ingredients
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);
  const [selectedProductForIngredients, setSelectedProductForIngredients] = useState(null);
  
  // Notification state
  const [notification, setNotification] = useState({ show: false, message: '' });
  
  // Image carousel state - track current image index for each product
  const [currentImageIndex, setCurrentImageIndex] = useState({});

  // Lightbox state
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0, productName: '' });

  const openLightbox = (images, index, productName, e) => {
    e.stopPropagation();
    setLightbox({ open: true, images, index, productName });
  };

  const closeLightbox = () => setLightbox(lb => ({ ...lb, open: false }));

  const lightboxNext = () => setLightbox(lb => ({ ...lb, index: (lb.index + 1) % lb.images.length }));
  const lightboxPrev = () => setLightbox(lb => ({ ...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length }));

  useEffect(() => {
    if (!lightbox.open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') lightboxNext();
      if (e.key === 'ArrowLeft') lightboxPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox.open]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const productsRef = collection(db, "demo", "data", "products");
        const querySnapshot = await getDocs(productsRef);

        const productsList = [];
        querySnapshot.forEach((doc) => {
          productsList.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setProducts(productsList);
        setFilteredProducts(productsList);
        extractTags(productsList);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Si è verificato un errore nel caricamento dei prodotti.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const extractTags = (products) => {
    const allTags = new Set();
    products.forEach(product => {
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach(tag => allTags.add(tag));
      }
    });
    setAvailableTags([...allTags].sort());
  };

  useEffect(() => {
    filterProducts();
  }, [products, selectedTags, searchTerm]);

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower)
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.tags || !Array.isArray(product.tags)) {
          return false;
        }
        return selectedTags.every(tag => product.tags.includes(tag));
      });
    }

    setFilteredProducts(filtered);
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSearchTerm('');
  };

  const handleAddToCart = (product) => {
    if (!product.price) {
      return;
    }
    
    addToBasket(product, 1);
    
    // Show animated notification
    const productName = product.name || 'Prodotto';
    setNotification({ show: true, message: `${productName} aggiunto!` });
    
    // Hide notification after animation
    setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 2000);
  };

  const handleShowIngredients = (product) => {
    setSelectedProductForIngredients(product);
    setShowIngredientsModal(true);
  };

  const handleCloseIngredientsModal = () => {
    setShowIngredientsModal(false);
    setSelectedProductForIngredients(null);
  };

  // Navigate to next image in carousel
  const handleNextImage = (productId, totalImages, e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % totalImages
    }));
  };

  // Navigate to previous image in carousel
  const handlePrevImage = (productId, totalImages, e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  // Touch swipe support
  const touchStartX = useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (productId, totalImages, e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    touchStartX.current = null;
    if (Math.abs(diff) < 40) return; // too short — ignore
    if (diff > 0) {
      // swiped left → next
      setCurrentImageIndex(prev => ({ ...prev, [productId]: ((prev[productId] || 0) + 1) % totalImages }));
    } else {
      // swiped right → prev
      setCurrentImageIndex(prev => ({ ...prev, [productId]: ((prev[productId] || 0) - 1 + totalImages) % totalImages }));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Prodotti</h1>
        <div className="flex justify-center items-center h-32">
          <div className="text-lg">Caricamento prodotti...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Prodotti</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Errore:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 py-4">
      <div className="bg-white shadow-md rounded-lg p-3 mb-6">
        {/* Search Bar */}
        <div className="flex gap-4 items-center mb-4">
          <div className="flex-1">
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Cerca prodotti per nome, descrizione o categoria..."
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-[#aa8510] text-white rounded-md hover:bg-[#8a6a00] transition-colors text-sm flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
            </svg>

          </button>
        </div>

        {/* Tags Filter Bar - Conditional */}
        {showFilters && availableTags.length > 0 && (
          <div className="pt-2">
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                  title={`Clicca per ${selectedTags.includes(tag) ? 'rimuovere' : 'aggiungere'} il filtro "${tag}"`}
                >
                  {tag}
                  {selectedTags.includes(tag) && (
                    <span className="ml-1 text-xs">✕</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
        {
          ( filteredProducts.length < products.length ) && (
          <div className="flex justify-between py-2 items-center">
            <p className="text-gray-600">
              {filteredProducts.length} di {products.length} prodotti trovati
            </p>
          </div>
          )
        }
      </div>
      {filteredProducts.length === 0 ? (
        <div className="text-center py-2">
          <p className="text-gray-500">
            {products.length === 0 
              ? "Nessun prodotto trovato." 
              : "Nessun prodotto corrisponde ai filtri selezionati."
            }
          </p>
          {(selectedTags.length > 0 || searchTerm.trim()) && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="mt-2 bg-[#aa8510] text-white px-4 py-2 rounded hover:bg-[#8a6a00] flex items-center gap-2 mx-auto"
            >
              {showFilters ? '▲ Nascondi filtri' : '▼ Mostra filtri'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white shadow-md rounded-lg border hover:shadow-lg transition-shadow overflow-hidden flex flex-col h-full relative">
              
              {/* Light grey overlay for unavailable products - preserves colors */}
              {product.available === false && (
                <div className="absolute inset-0 bg-gray-100/40 z-10 pointer-events-none rounded-lg"></div>
              )}

              {/* "ESAURITO" Banner - Overlapping style */}
              {product.available === false && (
                <div className="absolute top-4 left-4 z-20 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-bold shadow-lg transform -rotate-3">
                  ESAURITO
                </div>
              )}

              {/* Product Image - Aspect ratio container with blurred backdrop */}
              <div className="aspect-[4/3] overflow-hidden relative bg-gray-100 group">
                {(() => {
                  // Support both new imageUrls array and legacy imageUrl
                  const images = product.imageUrls && product.imageUrls.length > 0
                    ? product.imageUrls
                    : (product.imageUrl ? [product.imageUrl] : []);

                  if (images.length === 0) {
                    return (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-sm">Nessuna immagine</span>
                      </div>
                    );
                  }

                  const currentIndex = currentImageIndex[product.id] || 0;

                  return (
                    <div
                      className="relative w-full h-full"
                      onTouchStart={handleTouchStart}
                      onTouchEnd={(e) => handleTouchEnd(product.id, images.length, e)}
                    >
                      {/* All images are rendered and preloaded at mount time.
                          Only the active one is visible — switching is pure CSS, no network wait. */}
                      {images.map((src, idx) => (
                        <div
                          key={idx}
                          className="absolute inset-0 transition-opacity duration-300 cursor-zoom-in"
                          style={{ opacity: idx === currentIndex ? 1 : 0, pointerEvents: idx === currentIndex ? 'auto' : 'none' }}
                          onClick={(e) => openLightbox(images, idx, product.name, e)}
                        >
                          {/* Blurred backdrop fills dead space with the image's own colours */}
                          <div
                            className="absolute inset-0 scale-110 blur-xl"
                            style={{
                              backgroundImage: `url(${src})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                          />
                          <div className="absolute inset-0 bg-white/25" />
                          <img
                            src={src}
                            alt={`${product.name} - ${idx + 1}`}
                            className="relative w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                      
                      {/* Image counter badge */}
                      {images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                          {currentIndex + 1}/{images.length}
                        </div>
                      )}
                      
                      {/* Navigation arrows — always visible on mobile, hover-only on desktop */}
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => handlePrevImage(product.id, images.length, e)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-all md:opacity-0 md:group-hover:opacity-100 shadow-lg"
                            aria-label="Immagine precedente"
                          >
                            ‹
                          </button>
                          <button
                            onClick={(e) => handleNextImage(product.id, images.length, e)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-all md:opacity-0 md:group-hover:opacity-100 shadow-lg"
                            aria-label="Immagine successiva"
                          >
                            ›
                          </button>
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>
              
              {/* Product Content - Flexible grow */}
              <div className="p-6 flex flex-col flex-1">
                {/* Product Name - Always present */}
                <h3 className="text-lg text-brand-black font-semibold mb-2 line-clamp-2 min-h-[3.5rem]">{product.name}</h3>
                
                {/* Description - Fixed height space */}
                <div className="mb-3 min-h-[2.5rem]">
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {product.description || "Nessuna descrizione disponibile"}
                  </p>
                </div>
                
                {/* Price - Fixed height space */}
                <div className="mb-4 min-h-[1.75rem]">
                  {product.price ? (
                    <p className="text-lg font-bold text-green-600">€{product.price.toFixed(2)}</p>
                  ) : (
                    <p className="text-lg font-bold text-gray-400">Prezzo non disponibile</p>
                  )}
                </div>

                {/* Tags - Fixed height space */}
                <div className="mb-2 min-h-[3rem]">
                  <p className="text-xs text-gray-500 mb-1">Tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {product.tags && product.tags.length > 0 ? (
                      product.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className={`text-xs px-2 py-1 rounded cursor-pointer transition-colors ${
                            selectedTags.includes(tag)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          onClick={() => handleTagToggle(tag)}
                          title={`Clicca per ${selectedTags.includes(tag) ? 'rimuovere' : 'aggiungere'} filtro`}
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs px-2 py-1 bg-gray-50 text-gray-400 rounded">
                        Nessun tag
                      </span>
                    )}
                  </div>
                </div>

                {/* Allergens */}
                {product.allergens && (
                  <div className="mb-4">
                    <p className="text-xs text-red-600 font-medium mb-1">⚠️ ALLERGENI:</p>
                    <p className="text-xs text-gray-900 uppercase">{product.allergens}</p>
                  </div>
                )}

                {/* Buttons - Always at bottom */}
                <div className="mt-auto">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.price || product.available === false}
                      className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        product.price && product.available !== false
                          ? 'bg-brand-gold text-brand-black hover:bg-brand-black hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      title={
                        product.available === false 
                          ? 'Prodotto esaurito' 
                          : product.price 
                            ? 'Aggiungi al carrello' 
                            : 'Prezzo non disponibile'
                      }
                    >
                      {product.available === false 
                        ? 'Esaurito' 
                        : product.price 
                          ? 'Aggiungi al carrello' 
                          : 'Non disponibile'
                      }
                    </button>
                    
                    <button
                      onClick={() => handleShowIngredients(product)}
                      className="bg-white text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors"
                      title="Vedi ingredienti"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                      </svg>

                    </button>
                  </div>
                  
                  {/* Basket quantity - Fixed height space */}
                  <div className="mt-2 min-h-[1.5rem] text-center">
                    {getBasketItemQuantity(product.id) > 0 && (
                      <div className="text-sm text-green-600 font-medium">
                        Nel carrello: {getBasketItemQuantity(product.id)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ingredients Modal */}
      {showIngredientsModal && selectedProductForIngredients && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedProductForIngredients.name}
                  </h2>
                  <p className="text-sm text-gray-500">Ingredienti</p>
                </div>
                <button
                  onClick={handleCloseIngredientsModal}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                  title="Chiudi"
                >
                  ×
                </button>
              </div>

              {selectedProductForIngredients.description && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Descrizione:</h3>
                  <p className="text-gray-600 text-sm">{selectedProductForIngredients.description}</p>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Ingredienti:</h3>
                {selectedProductForIngredients.ingredients ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-line">
                      {selectedProductForIngredients.ingredients}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-500 italic">
                      Nessun ingrediente disponibile per questo prodotto.
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-red-600 mb-2">⚠️ ALLERGENI:</h3>
                {selectedProductForIngredients.allergens ? (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <p className="text-gray-800 text-base uppercase">
                      {selectedProductForIngredients.allergens}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                    <p className="text-gray-500">
                      Nessuno
                    </p>
                  </div>
                )}
              </div>

              {selectedProductForIngredients.tags && selectedProductForIngredients.tags.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Tags:</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedProductForIngredients.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedProductForIngredients.price && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Prezzo:</h3>
                  <p className="text-lg font-bold text-green-600">
                    €{selectedProductForIngredients.price.toFixed(2)}
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCloseIngredientsModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Chiudi
                </button>
                {selectedProductForIngredients.price && selectedProductForIngredients.available !== false && (
                  <button
                    onClick={() => {
                      handleAddToCart(selectedProductForIngredients);
                      handleCloseIngredientsModal();
                    }}
                    className="bg-brand-gold text-brand-black px-4 py-2 rounded-md hover:bg-brand-black hover:text-white transition-colors font-medium"
                  >
                    Aggiungi al carrello
                  </button>
                )}
                {selectedProductForIngredients.available === false && (
                  <button
                    disabled
                    className="bg-gray-300 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed font-medium"
                  >
                    Esaurito
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Lightbox */}
      {lightbox.open && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          {/* Top bar: product name + close */}
          <div className="w-full flex items-center justify-between px-4 py-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <span className="text-white font-semibold text-base truncate pr-4">{lightbox.productName}</span>
            <button
              onClick={closeLightbox}
              className="text-white bg-white/10 hover:bg-white/20 rounded-full w-9 h-9 flex items-center justify-center text-lg transition-colors flex-shrink-0"
              aria-label="Chiudi"
            >
              ✕
            </button>
          </div>

          {/* Main image with prev/next arrows inside */}
          <div
            className="relative flex-1 w-full flex items-center justify-center px-4 min-h-0"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const diff = touchStartX.current - e.changedTouches[0].clientX;
              touchStartX.current = null;
              if (Math.abs(diff) < 40) return;
              diff > 0 ? lightboxNext() : lightboxPrev();
            }}
          >
            <img
              src={lightbox.images[lightbox.index]}
              alt={`${lightbox.productName} - ${lightbox.index + 1}`}
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
            />

            {lightbox.images.length > 1 && (
              <>
                <button
                  onClick={lightboxPrev}
                  className="absolute left-6 bg-black/50 hover:bg-black/75 text-white w-11 h-11 rounded-full flex items-center justify-center text-3xl transition-colors shadow-lg"
                  aria-label="Precedente"
                >
                  ‹
                </button>
                <button
                  onClick={lightboxNext}
                  className="absolute right-6 bg-black/50 hover:bg-black/75 text-white w-11 h-11 rounded-full flex items-center justify-center text-3xl transition-colors shadow-lg"
                  aria-label="Successiva"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip — makes it immediately obvious there are more images */}
          {lightbox.images.length > 1 && (
            <div
              className="flex-shrink-0 w-full px-4 py-3 flex gap-2 justify-center overflow-x-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {lightbox.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setLightbox(lb => ({ ...lb, index: i }))}
                  className={`flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition-all ${
                    i === lightbox.index ? 'border-white scale-110' : 'border-white/20 opacity-50 hover:opacity-80'
                  }`}
                  aria-label={`Immagine ${i + 1}`}
                >
                  <img src={src} alt={`${lightbox.productName} - ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating Notification */}
      {notification.show && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
          <div className="bg-brand-gold text-brand-black px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-out">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
