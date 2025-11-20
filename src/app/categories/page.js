"use client";

import React, { useState, useEffect } from 'react';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);

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
        extractCategories(data.products);
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

  const handleCategoryClick = (categoryName) => {
    if (selectedCategory === categoryName) {
      // If clicking the same category, deselect it
      setSelectedCategory(null);
      setFilteredProducts([]);
    } else {
      // Filter products by selected category
      setSelectedCategory(categoryName);
      const filtered = products.filter(product => {
        const productCategory = product.category || 'Senza Categoria';
        return productCategory === categoryName;
      });
      setFilteredProducts(filtered);
    }
  };

  const clearSelection = () => {
    setSelectedCategory(null);
    setFilteredProducts([]);
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
              <p className="text-gray-500">Nessun prodotto trovato in questa categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  
                  {product.description && (
                    <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                  )}
                  
                  <div className="space-y-2 mb-3">
                    {product.price && (
                      <p className="text-lg font-bold text-green-600">€{product.price.toFixed(2)}</p>
                    )}
                  </div>

                  {/* Product Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Tags:</p>
                      <div className="flex flex-wrap gap-1">
                        {product.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded"
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
        </div>
      )}

      {/* Summary */}
      <div className="mt-8 text-center">
        <p className="text-gray-500">
          Totale categorie: {categories.length} | Totale prodotti: {products.length}
        </p>
      </div>
    </div>
  );
};

export default CategoriesPage;