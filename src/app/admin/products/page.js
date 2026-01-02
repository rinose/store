"use client";

import React, { useState, useEffect } from 'react';
import { storage, db } from '../../../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  
  // Editing states
  const [editingField, setEditingField] = useState({}); // Track which field is being edited: {productId: {field: 'name', value: '...'}}
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    tags: '',
    ingredients: ''
  });

  // Image upload states
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsRef = collection(db, 'demo', 'data', 'products');
      const querySnapshot = await getDocs(productsRef);
      
      const productsList = [];
      querySnapshot.forEach((doc) => {
        productsList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setProducts(productsList);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Errore nel caricamento dei prodotti: ' + err.message);
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

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setSelectedImages(files);
    
    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const clearImageSelection = () => {
    selectedImages.forEach(file => URL.revokeObjectURL(URL.createObjectURL(file)));
    setSelectedImages([]);
    setImagePreviews([]);
  };

  const uploadImagesToStorage = async (images, productName) => {
    const imageUrls = [];
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const timestamp = Date.now();
      const sanitizedName = productName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const imageName = `${sanitizedName}_${timestamp}_${i}.jpg`;
      const storageRef = ref(storage, `products/${imageName}`);
      
      await uploadBytes(storageRef, image);
      const downloadURL = await getDownloadURL(storageRef);
      imageUrls.push(downloadURL);
      
      setUploadProgress(`Caricamento immagine ${i + 1} di ${images.length}...`);
    }
    
    return imageUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      setError('Il nome del prodotto è obbligatorio');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      setUploadingImages(true);
      
      let imageUrls = [];
      
      if (selectedImages.length > 0) {
        setUploadProgress('Caricamento immagini...');
        try {
          imageUrls = await uploadImagesToStorage(selectedImages, formData.name);
          setUploadProgress('Immagini caricate, salvando prodotto...');
        } catch (imageError) {
          console.error('Image upload failed:', imageError);
          setError(imageError.message);
          setCreating(false);
          setUploadingImages(false);
          setUploadProgress('');
          return;
        }
      }

      const productsRef = collection(db, 'demo', 'data', 'products');
      await addDoc(productsRef, {
        name: formData.name,
        description: formData.description || '',
        price: formData.price ? parseFloat(formData.price) : 0,
        category: formData.category || '',
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        ingredients: formData.ingredients || '',
        imageUrls: imageUrls,
        available: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        tags: '',
        ingredients: ''
      });
      
      clearImageSelection();
      setUploadProgress('');
      await fetchProducts();
      alert('Prodotto creato con successo!');
    } catch (err) {
      console.error('Error creating product:', err);
      setError('Errore nella creazione del prodotto: ' + err.message);
    } finally {
      setCreating(false);
      setUploadingImages(false);
      setUploadProgress('');
    }
  };

  const handleDelete = async (productId, productName) => {
    const isConfirmed = window.confirm(
      `Sei sicuro di voler eliminare il prodotto "${productName}"?`
    );

    if (!isConfirmed) return;

    try {
      setError(null);
      const productRef = doc(db, 'demo', 'data', 'products', productId);
      await deleteDoc(productRef);
      await fetchProducts();
      alert(`Prodotto "${productName}" eliminato con successo!`);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Errore nell\'eliminazione: ' + err.message);
    }
  };

  const handleToggleAvailability = async (productId, currentAvailability) => {
    try {
      setError(null);
      const productRef = doc(db, 'demo', 'data', 'products', productId);
      const newAvailability = !currentAvailability;
      
      await updateDoc(productRef, { 
        available: newAvailability,
        updatedAt: serverTimestamp()
      });

      setProducts(products.map(p => 
        p.id === productId ? { ...p, available: newAvailability } : p
      ));
    } catch (err) {
      console.error('Error toggling availability:', err);
      setError('Errore nell\'aggiornamento: ' + err.message);
    }
  };

  const startEdit = (productId, field, currentValue) => {
    setEditingField({
      ...editingField,
      [productId]: { field, value: currentValue || '' }
    });
  };

  const cancelEdit = (productId) => {
    const newEditingField = { ...editingField };
    delete newEditingField[productId];
    setEditingField(newEditingField);
  };

  const handleEditChange = (productId, value) => {
    setEditingField({
      ...editingField,
      [productId]: { ...editingField[productId], value }
    });
  };

  const saveEdit = async (productId, field, productName) => {
    try {
      setError(null);
      const value = editingField[productId]?.value;
      
      if (value === undefined) return;

      const productRef = doc(db, 'demo', 'data', 'products', productId);
      let updateData = { updatedAt: serverTimestamp() };

      // Handle different field types
      if (field === 'price') {
        updateData[field] = parseFloat(value) || 0;
      } else if (field === 'tags') {
        updateData[field] = value.split(',').map(tag => tag.trim()).filter(tag => tag);
      } else {
        updateData[field] = value;
      }

      await updateDoc(productRef, updateData);
      
      cancelEdit(productId);
      await fetchProducts();
      alert(`${field} aggiornato con successo per "${productName}"!`);
    } catch (err) {
      console.error('Error updating field:', err);
      setError('Errore nell\'aggiornamento: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Gestione Prodotti</h1>
        <div className="text-center py-8">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Gestione Prodotti</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Create Product Form */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Crea Nuovo Prodotto</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrizione</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Prezzo (€)</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Categoria</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags (separati da virgola)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              placeholder="es: dolce, senza glutine, vegano"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ingredienti</label>
            <textarea
              name="ingredients"
              value={formData.ingredients}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              rows="2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Immagini</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="w-full"
            />
            {imagePreviews.length > 0 && (
              <div className="flex gap-2 mt-2">
                {imagePreviews.map((preview, idx) => (
                  <img key={idx} src={preview} alt={`Preview ${idx}`} className="h-20 w-20 object-cover rounded" />
                ))}
              </div>
            )}
          </div>

          {uploadProgress && (
            <div className="text-blue-600 text-sm">{uploadProgress}</div>
          )}

          <button
            type="submit"
            disabled={creating || uploadingImages}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {creating ? 'Creazione in corso...' : 'Crea Prodotto'}
          </button>
        </form>
      </div>

      {/* Products List */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Prodotti Esistenti ({products.length})</h2>
        
        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nessun prodotto disponibile</p>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    {/* Name */}
                    {editingField[product.id]?.field === 'name' ? (
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={editingField[product.id].value}
                          onChange={(e) => handleEditChange(product.id, e.target.value)}
                          className="flex-1 border rounded px-2 py-1"
                        />
                        <button
                          onClick={() => saveEdit(product.id, 'name', product.name)}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Salva
                        </button>
                        <button
                          onClick={() => cancelEdit(product.id)}
                          className="bg-gray-400 text-white px-3 py-1 rounded text-sm"
                        >
                          Annulla
                        </button>
                      </div>
                    ) : (
                      <h3 
                        className="text-lg font-semibold cursor-pointer hover:text-blue-600"
                        onClick={() => startEdit(product.id, 'name', product.name)}
                      >
                        {product.name || 'Senza nome'}
                      </h3>
                    )}

                    {/* Description */}
                    {editingField[product.id]?.field === 'description' ? (
                      <div className="flex gap-2 mb-2">
                        <textarea
                          value={editingField[product.id].value}
                          onChange={(e) => handleEditChange(product.id, e.target.value)}
                          className="flex-1 border rounded px-2 py-1"
                          rows="2"
                        />
                        <button
                          onClick={() => saveEdit(product.id, 'description', product.name)}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Salva
                        </button>
                        <button
                          onClick={() => cancelEdit(product.id)}
                          className="bg-gray-400 text-white px-3 py-1 rounded text-sm"
                        >
                          Annulla
                        </button>
                      </div>
                    ) : (
                      <p 
                        className="text-gray-600 text-sm mb-2 cursor-pointer hover:bg-gray-50"
                        onClick={() => startEdit(product.id, 'description', product.description)}
                      >
                        {product.description || 'Nessuna descrizione'}
                      </p>
                    )}

                    {/* Price */}
                    <div className="text-sm mb-2">
                      <span className="font-medium">Prezzo: </span>
                      {editingField[product.id]?.field === 'price' ? (
                        <div className="inline-flex gap-2">
                          <input
                            type="number"
                            step="0.01"
                            value={editingField[product.id].value}
                            onChange={(e) => handleEditChange(product.id, e.target.value)}
                            className="w-24 border rounded px-2 py-1"
                          />
                          <button
                            onClick={() => saveEdit(product.id, 'price', product.name)}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                          >
                            Salva
                          </button>
                          <button
                            onClick={() => cancelEdit(product.id)}
                            className="bg-gray-400 text-white px-2 py-1 rounded text-xs"
                          >
                            Annulla
                          </button>
                        </div>
                      ) : (
                        <span 
                          className="cursor-pointer hover:text-blue-600"
                          onClick={() => startEdit(product.id, 'price', product.price)}
                        >
                          €{product.price ? product.price.toFixed(2) : '0.00'}
                        </span>
                      )}
                    </div>

                    {/* Category */}
                    <div className="text-sm mb-2">
                      <span className="font-medium">Categoria: </span>
                      {editingField[product.id]?.field === 'category' ? (
                        <div className="inline-flex gap-2">
                          <input
                            type="text"
                            value={editingField[product.id].value}
                            onChange={(e) => handleEditChange(product.id, e.target.value)}
                            className="border rounded px-2 py-1"
                          />
                          <button
                            onClick={() => saveEdit(product.id, 'category', product.name)}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                          >
                            Salva
                          </button>
                          <button
                            onClick={() => cancelEdit(product.id)}
                            className="bg-gray-400 text-white px-2 py-1 rounded text-xs"
                          >
                            Annulla
                          </button>
                        </div>
                      ) : (
                        <span 
                          className="cursor-pointer hover:text-blue-600"
                          onClick={() => startEdit(product.id, 'category', product.category)}
                        >
                          {product.category || 'Nessuna'}
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="text-sm mb-2">
                      <span className="font-medium">Tags: </span>
                      {editingField[product.id]?.field === 'tags' ? (
                        <div className="inline-flex gap-2">
                          <input
                            type="text"
                            value={editingField[product.id].value}
                            onChange={(e) => handleEditChange(product.id, e.target.value)}
                            className="border rounded px-2 py-1"
                            placeholder="separati da virgola"
                          />
                          <button
                            onClick={() => saveEdit(product.id, 'tags', product.name)}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                          >
                            Salva
                          </button>
                          <button
                            onClick={() => cancelEdit(product.id)}
                            className="bg-gray-400 text-white px-2 py-1 rounded text-xs"
                          >
                            Annulla
                          </button>
                        </div>
                      ) : (
                        <span 
                          className="cursor-pointer hover:text-blue-600"
                          onClick={() => startEdit(product.id, 'tags', product.tags?.join(', '))}
                        >
                          {product.tags && product.tags.length > 0 ? product.tags.join(', ') : 'Nessun tag'}
                        </span>
                      )}
                    </div>

                    {/* Ingredients */}
                    <div className="text-sm mb-2">
                      <span className="font-medium">Ingredienti: </span>
                      {editingField[product.id]?.field === 'ingredients' ? (
                        <div className="flex gap-2 mt-1">
                          <textarea
                            value={editingField[product.id].value}
                            onChange={(e) => handleEditChange(product.id, e.target.value)}
                            className="flex-1 border rounded px-2 py-1"
                            rows="2"
                          />
                          <button
                            onClick={() => saveEdit(product.id, 'ingredients', product.name)}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                          >
                            Salva
                          </button>
                          <button
                            onClick={() => cancelEdit(product.id)}
                            className="bg-gray-400 text-white px-2 py-1 rounded text-xs"
                          >
                            Annulla
                          </button>
                        </div>
                      ) : (
                        <span 
                          className="cursor-pointer hover:text-blue-600"
                          onClick={() => startEdit(product.id, 'ingredients', product.ingredients)}
                        >
                          {product.ingredients || 'Nessuno'}
                        </span>
                      )}
                    </div>

                    {/* Images */}
                    {product.imageUrls && product.imageUrls.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {product.imageUrls.map((url, idx) => (
                          <img key={idx} src={url} alt={product.name} className="h-16 w-16 object-cover rounded" />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleToggleAvailability(product.id, product.available)}
                      className={`px-4 py-2 rounded text-sm ${
                        product.available 
                          ? 'bg-green-500 text-white hover:bg-green-600' 
                          : 'bg-gray-400 text-white hover:bg-gray-500'
                      }`}
                    >
                      {product.available ? 'Disponibile' : 'Non Disponibile'}
                    </button>

                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600"
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductsPage;
