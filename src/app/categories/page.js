"use client";

import React, { useState, useEffect } from 'react';
import { useBasket } from '../../contexts/BasketContext';

const CategoriesPage = () => {
  const { addToBasket, getBasketItemQuantity } = useBasket();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  // Tags filtering state
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  
  // Modal state for ingredients
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);
  const [selectedProductForIngredients, setSelectedProductForIngredients] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      applyFilters();
    }
  }, [selectedTags]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
        extractCategories(data.products);
        extractTags(data.products);
      } else {
        setError(data.error || 'Failed to fetch products');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const extractCategories = (products) => {
    const categoryCount = {};
    products.forEach(product => {
      const category = product.category || 'Senza Categoria';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    const categoriesArray = Object.entries(categoryCount).map(([name, count]) => ({
      name,
      count,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    }));
    
    setCategories(categoriesArray.sort((a, b) => a.name.localeCompare(b.name)));
  };

  const extractTags = (products) => {
    const allTags = new Set();
    products.forEach(product => {
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach(tag => allTags.add(tag));
      }
    });
    setAvailableTags([...allTags].sort());
  };

  const applyFilters = (categoryName = selectedCategory) => {
    let filtered = products;

    // Filter by category
    if (categoryName) {
      filtered = filtered.filter(product => {
        const productCategory = product.category || 'Senza Categoria';
        return productCategory === categoryName;
      });
    }

    // Filter by tags
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

  const handleCategoryClick = (categoryName) => {
    if (selectedCategory === categoryName) {
      // If clicking the same category, deselect it
      setSelectedCategory(null);
      setFilteredProducts([]);
    } else {
      // Filter products by selected category and current tags
      setSelectedCategory(categoryName);
      applyFilters(categoryName);
    }
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedTags([]);
    setFilteredProducts([]);
  };

  const clearSelection = () => {
    clearAllFilters();
  };

  const handleAddToCart = (product) => {
    if (!product.price) {
      alert('Non è possibile aggiungere al carrello un prodotto senza prezzo');
      return;
    }
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.imageUrls && product.imageUrls.length > 0 
        ? product.imageUrls[0] 
        : (product.imageUrl || null)
    };
    addToBasket(cartItem);
  };

  const handleShowIngredients = (product) => {
    setSelectedProductForIngredients(product);
    setShowIngredientsModal(true);
  };

  const closeIngredientsModal = () => {
    setShowIngredientsModal(false);
    setSelectedProductForIngredients(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Categorie</h1>
        <div className="flex justify-center items-center h-32">
          <div className="text-lg">Caricamento categorie...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Categorie</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Errore:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Categorie Prodotti</h1>
      
      {/* Tags Filter Bar */}
      {availableTags.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-medium text-gray-700">Filtra per tags:</h3>
              {selectedTags.length > 0 && (
                <span className="text-xs text-blue-600">
                  ({selectedTags.length} {selectedTags.length === 1 ? 'tag selezionato' : 'tags selezionati'})
                </span>
              )}
            </div>
            {(selectedTags.length > 0 || selectedCategory) && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
              >
                Pulisci tutto
              </button>
            )}
          </div>
          
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

          {/* Active Filters Display */}
          {(selectedCategory || selectedTags.length > 0) && (
            <div className="border-t pt-3 mt-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Filtri attivi:</span>
                {selectedCategory && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    Categoria: "{selectedCategory}"
                  </span>
                )}
                {selectedTags.map(tag => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center gap-1"
                  >
                    Tag: {tag}
                    <button
                      onClick={() => handleTagToggle(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Categories Grid */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Seleziona una Categoria</h2>
        
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nessuna categoria trovata.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((category) => (
              <button
                key={category.slug}
                onClick={() => handleCategoryClick(category.name)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
                  selectedCategory === category.name
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-lg mb-2 text-gray-800">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {category.count} {category.count === 1 ? 'prodotto' : 'prodotti'}
                </p>
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedCategory === category.name
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    Clicca per visualizzare
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Category Products */}
      {selectedCategory && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              Prodotti in "{selectedCategory}" ({filteredProducts.length})
            </h2>
            <button
              onClick={clearSelection}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Mostra tutte le categorie
            </button>
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {selectedTags.length > 0 
                  ? 'Nessun prodotto trovato con i filtri selezionati. Prova a rimuovere alcuni filtri.'
                  : 'Nessun prodotto trovato in questa categoria.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const basketQuantity = getBasketItemQuantity(product.id);
                
                return (
                  <div key={product.id} className="bg-white shadow-md rounded-lg border hover:shadow-lg transition-shadow overflow-hidden flex flex-col h-full">
                    {/* Product Image - Fixed height */}
                    <div className="h-48 overflow-hidden relative bg-gray-100">
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
                        
                        return (
                          <div className="relative w-full h-full">
                            <img
                              src={images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="hidden w-full h-full items-center justify-center text-gray-400">
                              <span className="text-sm">Errore caricamento</span>
                            </div>
                            {images.length > 1 && (
                              <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                                +{images.length - 1} foto
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    
                    {/* Product Content - Flexible grow */}
                    <div className="p-6 flex flex-col flex-1">
                      {/* Product Name - Always present */}
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2 min-h-[3.5rem]">{product.name}</h3>
                      
                      {/* Description - Fixed height space */}
                      <div className="mb-3 min-h-[2.5rem]">
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {product.description || "Nessuna descrizione disponibile"}
                        </p>
                      </div>
                      
                      {/* Price and Category - Fixed height space */}
                      <div className="space-y-2 mb-4 min-h-[4rem]">
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-green-600">
                            {product.price ? `€${parseFloat(product.price).toFixed(2)}` : (
                              <span className="text-gray-400 text-base">Prezzo non disponibile</span>
                            )}
                          </span>
                          {basketQuantity > 0 && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                              Nel carrello: {basketQuantity}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            {product.category || 'Nessuna categoria'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Tags Section - Fixed height space */}
                      <div className="mb-4 min-h-[2rem]">
                        {product.tags && product.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {product.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                            {product.tags.length > 3 && (
                              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                +{product.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Ingredients Button */}
                      {product.ingredients && (
                        <div className="mb-3">
                          <button
                            onClick={() => handleShowIngredients(product)}
                            className="text-blue-600 hover:text-blue-800 text-sm underline"
                          >
                            Visualizza ingredienti
                          </button>
                        </div>
                      )}
                      
                      {/* Add to Cart Button - Always at bottom */}
                      <div className="mt-auto">
                        {product.price && parseFloat(product.price) > 0 ? (
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors font-medium"
                          >
                            Aggiungi al carrello
                          </button>
                        ) : (
                          <div className="w-full bg-gray-100 text-gray-400 py-2 px-4 rounded text-center">
                            Non disponibile per l'acquisto
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="mt-8 text-center">
        <p className="text-gray-500">
          Totale categorie: {categories.length} | Totale prodotti: {products.length}
        </p>
      </div>

      {/* Ingredients Modal */}
      {showIngredientsModal && selectedProductForIngredients && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Ingredienti</h2>
                <button
                  onClick={closeIngredientsModal}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                  ×
                </button>
              </div>
              <h3 className="font-semibold mb-2 text-lg">{selectedProductForIngredients.name}</h3>
              <div className="text-sm text-gray-700 leading-relaxed">
                {selectedProductForIngredients.ingredients}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;