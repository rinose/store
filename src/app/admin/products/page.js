"use client";

import React, { useState, useEffect } from 'react';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editingTags, setEditingTags] = useState({}); // Track which product tags are being edited
  const [editingPrice, setEditingPrice] = useState({}); // Track which product prices are being edited
  const [editingCategory, setEditingCategory] = useState({}); // Track which product categories are being edited
  const [editingIngredients, setEditingIngredients] = useState({}); // Track which product ingredients are being edited
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    tags: '',
    ingredients: ''
  });

  // Fetch products on component mount
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
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch products');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Il nome del prodotto è obbligatorio');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          price: formData.price ? parseFloat(formData.price) : undefined,
          category: formData.category || undefined,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
          ingredients: formData.ingredients || undefined
        })
      });

      const result = await response.json();

      if (result.success) {
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          tags: '',
          ingredients: ''
        });
        
        // Refresh products list
        await fetchProducts();
        
        // Show success message
        alert('Prodotto creato con successo!');
      } else {
        setError(result.error || 'Errore durante la creazione del prodotto');
      }
    } catch (err) {
      setError('Errore di rete: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (productId, productName) => {
    // Show confirmation dialog
    const isConfirmed = window.confirm(
      `Sei sicuro di voler eliminare il prodotto "${productName}"?\n\nQuesta azione non può essere annullata.`
    );

    if (!isConfirmed) {
      return; // User cancelled
    }

    try {
      setError(null);

      const response = await fetch(`/api/products?id=${productId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Refresh products list
        await fetchProducts();
        
        // Show success message
        alert(`Prodotto "${productName}" eliminato con successo!`);
      } else {
        setError(result.error || 'Errore durante l\'eliminazione del prodotto');
      }
    } catch (err) {
      setError('Errore di rete: ' + err.message);
    }
  };

  const handleEditTags = (productId, currentTags) => {
    setEditingTags({
      ...editingTags,
      [productId]: currentTags ? currentTags.join(', ') : ''
    });
  };

  const handleCancelEditTags = (productId) => {
    const newEditingTags = { ...editingTags };
    delete newEditingTags[productId];
    setEditingTags(newEditingTags);
  };

  const handleSaveTags = async (productId, productName) => {
    try {
      setError(null);
      const tagString = editingTags[productId] || '';
      const tags = tagString.split(',').map(tag => tag.trim()).filter(tag => tag);

      const response = await fetch(`/api/products?id=${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags })
      });

      const result = await response.json();

      if (result.success) {
        // Remove from editing state
        handleCancelEditTags(productId);
        
        // Refresh products list
        await fetchProducts();
        
        // Show success message
        alert(`Tags per "${productName}" aggiornati con successo!`);
      } else {
        setError(result.error || 'Errore durante l\'aggiornamento dei tags');
      }
    } catch (err) {
      setError('Errore di rete: ' + err.message);
    }
  };

  const handleTagInputChange = (productId, value) => {
    setEditingTags({
      ...editingTags,
      [productId]: value
    });
  };

  // Price editing functions
  const handleEditPrice = (productId, currentPrice) => {
    setEditingPrice({
      ...editingPrice,
      [productId]: currentPrice ? currentPrice.toString() : ''
    });
  };

  const handleCancelEditPrice = (productId) => {
    const newEditingPrice = { ...editingPrice };
    delete newEditingPrice[productId];
    setEditingPrice(newEditingPrice);
  };

  const handleSavePrice = async (productId, productName) => {
    try {
      setError(null);
      const priceString = editingPrice[productId] || '';
      const price = priceString.trim() ? parseFloat(priceString) : null;

      if (priceString.trim() && (isNaN(price) || price < 0)) {
        setError('Il prezzo deve essere un numero valido maggiore o uguale a 0');
        return;
      }

      const response = await fetch(`/api/products?id=${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ price })
      });

      const result = await response.json();

      if (result.success) {
        // Remove from editing state
        handleCancelEditPrice(productId);
        
        // Refresh products list
        await fetchProducts();
        
        // Show success message
        alert(`Prezzo per "${productName}" aggiornato con successo!`);
      } else {
        setError(result.error || 'Errore durante l\'aggiornamento del prezzo');
      }
    } catch (err) {
      setError('Errore di rete: ' + err.message);
    }
  };

  const handlePriceInputChange = (productId, value) => {
    setEditingPrice({
      ...editingPrice,
      [productId]: value
    });
  };

  // Category editing functions
  const handleEditCategory = (productId, currentCategory) => {
    setEditingCategory({
      ...editingCategory,
      [productId]: currentCategory || ''
    });
  };

  const handleCancelEditCategory = (productId) => {
    const newEditingCategory = { ...editingCategory };
    delete newEditingCategory[productId];
    setEditingCategory(newEditingCategory);
  };

  const handleSaveCategory = async (productId, productName) => {
    try {
      setError(null);
      const category = editingCategory[productId] || '';

      const response = await fetch(`/api/products?id=${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: category.trim() })
      });

      const result = await response.json();

      if (result.success) {
        // Remove from editing state
        handleCancelEditCategory(productId);
        
        // Refresh products list
        await fetchProducts();
        
        // Show success message
        alert(`Categoria per "${productName}" aggiornata con successo!`);
      } else {
        setError(result.error || 'Errore durante l\'aggiornamento della categoria');
      }
    } catch (err) {
      setError('Errore di rete: ' + err.message);
    }
  };

  const handleCategoryInputChange = (productId, value) => {
    setEditingCategory({
      ...editingCategory,
      [productId]: value
    });
  };

  // Ingredients editing functions
  const handleEditIngredients = (productId, currentIngredients) => {
    setEditingIngredients({
      ...editingIngredients,
      [productId]: currentIngredients || ''
    });
  };

  const handleCancelEditIngredients = (productId) => {
    const newEditingIngredients = { ...editingIngredients };
    delete newEditingIngredients[productId];
    setEditingIngredients(newEditingIngredients);
  };

  const handleSaveIngredients = async (productId, productName) => {
    try {
      setError(null);
      const ingredients = editingIngredients[productId] || '';

      const response = await fetch(`/api/products?id=${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients: ingredients.trim() })
      });

      const result = await response.json();

      if (result.success) {
        // Remove from editing state
        handleCancelEditIngredients(productId);
        
        // Refresh products list
        await fetchProducts();
        
        // Show success message
        alert(`Ingredienti per "${productName}" aggiornati con successo!`);
      } else {
        setError(result.error || 'Errore durante l\'aggiornamento degli ingredienti');
      }
    } catch (err) {
      setError('Errore di rete: ' + err.message);
    }
  };

  const handleIngredientsInputChange = (productId, value) => {
    setEditingIngredients({
      ...editingIngredients,
      [productId]: value
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-8">Gestione Prodotti - Admin</h1>

      {/* Form for adding new product */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Aggiungi Nuovo Prodotto</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Errore:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome Prodotto *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Inserisci il nome del prodotto"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrizione
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descrizione del prodotto (opzionale)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Prezzo (€)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Categoria del prodotto"
              />
            </div>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Inserisci tags separati da virgola (es: dolce, pistacchio, siciliano)"
            />
            <p className="text-xs text-gray-500 mt-1">Separa i tags con virgole</p>
          </div>

          <div>
            <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-1">
              Ingredienti
            </label>
            <textarea
              id="ingredients"
              name="ingredients"
              value={formData.ingredients}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Inserisci gli ingredienti, uno per riga o separati da virgola"
            />
            <p className="text-xs text-gray-500 mt-1">Elenca tutti gli ingredienti del prodotto</p>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {creating ? 'Creazione in corso...' : 'Aggiungi Prodotto'}
          </button>
        </form>
      </div>

      {/* Products list */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Lista Prodotti</h2>
          <button
            onClick={fetchProducts}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Aggiorna
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-lg">Caricamento prodotti...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nessun prodotto trovato.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-sm">{/* Added text-sm for better fit */}
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Nome</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Descrizione</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Prezzo</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Categoria</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Tags</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Ingredienti</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 font-medium">{product.name}</td>
                    <td className="px-4 py-2 text-gray-600">
                      {product.description || '-'}
                    </td>
                    <td className="px-4 py-2">
                      {editingPrice[product.id] !== undefined ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editingPrice[product.id]}
                            onChange={(e) => handlePriceInputChange(product.id, e.target.value)}
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                          <button
                            onClick={() => handleSavePrice(product.id, product.name)}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                            title="Salva prezzo"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleCancelEditPrice(product.id)}
                            className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                            title="Annulla"
                          >
                            ✗
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <div className="flex-1">
                            {product.price ? `€${product.price.toFixed(2)}` : (
                              <span className="text-gray-400 text-xs">Nessun prezzo</span>
                            )}
                          </div>
                          <button
                            onClick={() => handleEditPrice(product.id, product.price)}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                            title="Modifica prezzo"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editingCategory[product.id] !== undefined ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={editingCategory[product.id]}
                            onChange={(e) => handleCategoryInputChange(product.id, e.target.value)}
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Inserisci categoria"
                          />
                          <button
                            onClick={() => handleSaveCategory(product.id, product.name)}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                            title="Salva categoria"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleCancelEditCategory(product.id)}
                            className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                            title="Annulla"
                          >
                            ✗
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <div className="flex-1">
                            {product.category || (
                              <span className="text-gray-400 text-xs">Nessuna categoria</span>
                            )}
                          </div>
                          <button
                            onClick={() => handleEditCategory(product.id, product.category)}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                            title="Modifica categoria"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editingTags[product.id] !== undefined ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={editingTags[product.id]}
                            onChange={(e) => handleTagInputChange(product.id, e.target.value)}
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="tags separati da virgola"
                          />
                          <button
                            onClick={() => handleSaveTags(product.id, product.name)}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                            title="Salva tags"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleCancelEditTags(product.id)}
                            className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                            title="Annulla"
                          >
                            ✗
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <div className="flex-1">
                            {product.tags && product.tags.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {product.tags.map((tag, tagIndex) => (
                                  <span
                                    key={tagIndex}
                                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">Nessun tag</span>
                            )}
                          </div>
                          <button
                            onClick={() => handleEditTags(product.id, product.tags)}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                            title="Modifica tags"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editingIngredients[product.id] !== undefined ? (
                        <div className="flex gap-2 items-center">
                          <textarea
                            value={editingIngredients[product.id]}
                            onChange={(e) => handleIngredientsInputChange(product.id, e.target.value)}
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Ingredienti del prodotto"
                            rows={2}
                          />
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleSaveIngredients(product.id, product.name)}
                              className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                              title="Salva ingredienti"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => handleCancelEditIngredients(product.id)}
                              className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                              title="Annulla"
                            >
                              ✗
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <div className="flex-1">
                            {product.ingredients ? (
                              <div className="text-xs text-gray-700 max-w-xs overflow-hidden">
                                <div className="truncate" title={product.ingredients}>
                                  {product.ingredients.length > 100 
                                    ? product.ingredients.substring(0, 100) + '...'
                                    : product.ingredients
                                  }
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">Nessun ingrediente</span>
                            )}
                          </div>
                          <button
                            onClick={() => handleEditIngredients(product.id, product.ingredients)}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                            title="Modifica ingredienti"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                        title={`Elimina ${product.name}`}
                      >
                        🗑️ Elimina
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-center">
          <p className="text-gray-500">
            Totale prodotti: {products.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminProductsPage;