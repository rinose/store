"use client";

import React, { useState, useEffect } from 'react';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: ''
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
          category: formData.category || undefined
        })
      });

      const result = await response.json();

      if (result.success) {
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '',
          category: ''
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
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Nome</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Descrizione</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Prezzo</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Categoria</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">ID</th>
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
                      {product.price ? `€${product.price.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-4 py-2">{product.category || '-'}</td>
                    <td className="px-4 py-2 text-xs text-gray-500 font-mono">
                      {product.id}
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