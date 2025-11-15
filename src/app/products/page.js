"use client";

import React, { useState, useEffect } from 'react';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
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
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Prodotti</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Cerca e Filtra Prodotti</h2>
        
        <div className="mb-4">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Cerca per nome, descrizione o categoria
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Inserisci termini di ricerca..."
          />
        </div>

        {availableTags.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtra per tags
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {(selectedTags.length > 0 || searchTerm.trim()) && (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Filtri attivi:</span>
              {searchTerm.trim() && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  Ricerca: "{searchTerm}"
                </span>
              )}
              {selectedTags.map(tag => (
                <span
                  key={tag}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => handleTagToggle(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <button
              onClick={clearFilters}
              className="bg-gray-500 text-white px-3 py-1 text-sm rounded hover:bg-gray-600"
            >
              Pulisci filtri
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">
          Mostrando {filteredProducts.length} di {products.length} prodotti
        </p>
      </div>
      
      {filteredProducts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {products.length === 0 
              ? "Nessun prodotto trovato." 
              : "Nessun prodotto corrisponde ai filtri selezionati."
            }
          </p>
          {(selectedTags.length > 0 || searchTerm.trim()) && (
            <button
              onClick={clearFilters}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Rimuovi filtri
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white shadow-md rounded-lg p-6 border hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
              
              {product.description && (
                <p className="text-gray-600 text-sm mb-3">{product.description}</p>
              )}
              
              <div className="space-y-2 mb-4">
                {product.price && (
                  <p className="text-lg font-bold text-green-600">€{product.price.toFixed(2)}</p>
                )}
                
                {product.category && (
                  <p className="text-sm text-gray-500">Categoria: {product.category}</p>
                )}
              </div>

              {product.tags && product.tags.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {product.tags.map((tag, tagIndex) => (
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
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-400">ID: {product.id}</p>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 text-center">
        <p className="text-gray-500">
          Totale prodotti: {products.length} | Visualizzati: {filteredProducts.length}
        </p>
      </div>
    </div>
  );
};

export default ProductPage;
