"use client";

import React, { useState, useEffect } from 'react';
import { storage } from '../../../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editingTags, setEditingTags] = useState({}); // Track which product tags are being edited
  const [editingPrice, setEditingPrice] = useState({}); // Track which product prices are being edited
  const [editingCategory, setEditingCategory] = useState({}); // Track which product categories are being edited
  const [editingIngredients, setEditingIngredients] = useState({}); // Track which product ingredients are being edited
  const [editingImage, setEditingImage] = useState({}); // Track which product images are being edited
  const [editingImageFiles, setEditingImageFiles] = useState({}); // Track selected files for editing
  const [editingImagePreviews, setEditingImagePreviews] = useState({}); // Track previews for editing
  const [uploadingEditImages, setUploadingEditImages] = useState({}); // Track upload status for editing
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

  // Test Firebase Storage connectivity
  const testFirebaseStorage = async () => {
    try {
      console.log('🔥 Testing Firebase Storage connectivity...');
      console.log('🔧 Storage configuration:', {
        bucket: storage.app.options.storageBucket,
        projectId: storage.app.options.projectId
      });
      
      const testRef = ref(storage, 'test/connectivity_test.txt');
      const testData = new Blob(['test connection from admin panel'], { type: 'text/plain' });
      
      console.log('📤 Attempting test upload...');
      const snapshot = await uploadBytes(testRef, testData);
      console.log('✅ Firebase Storage test upload successful!', snapshot);
      
      const downloadURL = await getDownloadURL(testRef);
      console.log('🔗 Firebase Storage test download URL:', downloadURL);
      
      console.log('🎉 Firebase Storage is working correctly!');
      return true;
    } catch (error) {
      console.error('❌ Firebase Storage test failed:', error);
      console.error('📋 Error details:', {
        code: error.code,
        message: error.message,
        serverResponse: error.serverResponse,
        customData: error.customData
      });
      
      // Provide specific guidance based on error code
      if (error.code === 'storage/unauthorized') {
        console.error('🚫 UNAUTHORIZED: Firebase Storage rules are blocking uploads');
        console.error('💡 Solution: Update Firebase Storage rules to allow uploads');
      } else if (error.code === 'storage/unknown') {
        console.error('❓ UNKNOWN ERROR: Possible network or configuration issue');
      } else if (error.code === 'storage/retry-limit-exceeded') {
        console.error('⏰ TIMEOUT: Upload took too long');
      }
      
      return false;
    }
  };

  // Run connectivity test on component mount
  useEffect(() => {
    testFirebaseStorage();
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

  const compressImage = (file, maxSizeMB = 1) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 1200px width/height)
        const maxDim = 1200;
        let { width, height } = img;
        
        if (width > height && width > maxDim) {
          height = (height * maxDim) / width;
          width = maxDim;
        } else if (height > maxDim) {
          width = (width * maxDim) / height;
          height = maxDim;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          // Create a File object with proper name and type
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        }, 'image/jpeg', 0.8); // 80% quality
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate each file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB (before compression)
    
    const validFiles = [];
    const invalidFiles = [];
    
    files.forEach(file => {
      if (!validTypes.includes(file.type)) {
        invalidFiles.push(`${file.name}: formato non supportato`);
        return;
      }
      
      if (file.size > maxSize) {
        invalidFiles.push(`${file.name}: file troppo grande (max 10MB)`);
        return;
      }
      
      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      setError(`File non validi:\n${invalidFiles.join('\n')}`);
    }
    
    if (validFiles.length === 0) {
      return;
    }

    try {
      setUploadProgress('Elaborazione e compressione immagini...');
      
      // Compress images before storing
      const compressedFiles = await Promise.all(validFiles.map(file => compressImage(file)));
      setSelectedImages(compressedFiles);
      
      // Create previews for all compressed files
      const previews = [];
      compressedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          previews[index] = e.target.result;
          if (previews.filter(p => p).length === compressedFiles.length) {
            setImagePreviews([...previews]);
            setUploadProgress('');
          }
        };
        reader.readAsDataURL(file);
      });
    } catch (compressionError) {
      console.error('Error compressing images:', compressionError);
      setError('Errore durante la compressione delle immagini: ' + compressionError.message);
      setUploadProgress('');
    }
    
    // Clear any existing errors if we have valid files
    if (validFiles.length > 0) {
      setError(null);
    }
  };

  const uploadImagesToStorage = async (files, productName) => {
    console.log('🚀 Starting upload process...', { filesCount: files.length, productName });
    
    try {
      const uploadPromises = files.map(async (file, index) => {
        console.log(`📤 Uploading file ${index + 1}/${files.length}:`, {
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
          type: file.type
        });
        
        // Create a unique filename
        const timestamp = Date.now();
        const filename = `products/${productName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}_${index}.${file.name.split('.').pop()}`;
        
        console.log('📝 Generated filename:', filename);
        
        const storageRef = ref(storage, filename);
        console.log('📍 Storage reference created:', storageRef.toString());
        
        // Upload file
        console.log('⏳ Uploading to Firebase Storage...');
        const snapshot = await uploadBytes(storageRef, file);
        console.log('✅ Upload completed successfully!', {
          bytesTransferred: snapshot.metadata.size,
          fullPath: snapshot.metadata.fullPath
        });
        
        // Get download URL
        console.log('🔗 Getting download URL...');
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('✅ Download URL obtained:', downloadURL);
        
        return downloadURL;
      });
      
      console.log('⏳ Waiting for all uploads to complete...');
      const imageUrls = await Promise.all(uploadPromises);
      console.log('🎉 All uploads completed successfully!', {
        count: imageUrls.length,
        urls: imageUrls
      });
      
      return imageUrls;
    } catch (error) {
      console.error('💥 Error uploading images:', error);
      console.error('📋 Detailed error information:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
        serverResponse: error.serverResponse
      });
      
      // Provide specific error messages
      let userMessage = 'Errore durante il caricamento delle immagini: ';
      if (error.code === 'storage/unauthorized') {
        userMessage += 'Permessi insufficienti. Contatta l\'amministratore.';
      } else if (error.code === 'storage/quota-exceeded') {
        userMessage += 'Spazio di archiviazione esaurito.';
      } else if (error.code === 'storage/retry-limit-exceeded') {
        userMessage += 'Timeout di caricamento. Riprova con immagini più piccole.';
      } else {
        userMessage += error.message;
      }
      
      throw new Error(userMessage);
    }
  };

  const clearImageSelection = () => {
    setSelectedImages([]);
    setImagePreviews([]);
    setUploadingImages(false);
    setUploadProgress('');
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

      let imageUrls = [];
      
      // Upload images if selected
      if (selectedImages.length > 0) {
        console.log('Starting image upload process...', selectedImages);
        setUploadingImages(true);
        setUploadProgress('Caricamento immagini in corso...');
        
        try {
          imageUrls = await Promise.race([
            uploadImagesToStorage(selectedImages, formData.name),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout: Upload took too long')), 60000)
            )
          ]);
          console.log('Image upload completed successfully:', imageUrls);
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

      console.log('Sending product data to API...', {
        name: formData.name,
        imageUrls: imageUrls
      });

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
          ingredients: formData.ingredients || undefined,
          imageUrls: imageUrls
        })
      });

      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        console.error('API response not ok:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('API Response:', result);

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
        
        // Clear image selection
        clearImageSelection();
        setUploadProgress('');
        
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
      setUploadingImages(false);
      setUploadProgress('');
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

  // Image editing functions
  const handleEditImage = (productId, currentImageUrl) => {
    setEditingImage({
      ...editingImage,
      [productId]: true // Just track that we're editing this product's image
    });
    // Clear any existing files and previews for this product
    const newEditingFiles = { ...editingImageFiles };
    const newEditingPreviews = { ...editingImagePreviews };
    delete newEditingFiles[productId];
    delete newEditingPreviews[productId];
    setEditingImageFiles(newEditingFiles);
    setEditingImagePreviews(newEditingPreviews);
  };

  const handleCancelEditImage = (productId) => {
    const newEditingImage = { ...editingImage };
    const newEditingFiles = { ...editingImageFiles };
    const newEditingPreviews = { ...editingImagePreviews };
    const newUploadingEdit = { ...uploadingEditImages };
    
    delete newEditingImage[productId];
    delete newEditingFiles[productId];
    delete newEditingPreviews[productId];
    delete newUploadingEdit[productId];
    
    setEditingImage(newEditingImage);
    setEditingImageFiles(newEditingFiles);
    setEditingImagePreviews(newEditingPreviews);
    setUploadingEditImages(newUploadingEdit);
  };

  const handleEditImageFileChange = async (productId, event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Validate each file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const validFiles = [];
    const invalidFiles = [];
    
    files.forEach(file => {
      if (!validTypes.includes(file.type)) {
        invalidFiles.push(`${file.name}: formato non supportato`);
        return;
      }
      
      if (file.size > maxSize) {
        invalidFiles.push(`${file.name}: file troppo grande (max 10MB)`);
        return;
      }
      
      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      setError(`File non validi:\n${invalidFiles.join('\n')}`);
    }
    
    if (validFiles.length === 0) {
      return;
    }

    try {
      // Compress images before storing
      const compressedFiles = await Promise.all(validFiles.map(file => compressImage(file)));

      // Store files for this product
      setEditingImageFiles({
        ...editingImageFiles,
        [productId]: compressedFiles
      });
      
      // Create previews for all valid files
      const previews = [];
      compressedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          previews[index] = e.target.result;
          if (previews.filter(p => p).length === compressedFiles.length) {
            setEditingImagePreviews({
              ...editingImagePreviews,
              [productId]: [...previews]
            });
          }
        };
        reader.readAsDataURL(file);
      });
    } catch (compressionError) {
      console.error('Error compressing images:', compressionError);
      setError('Errore durante la compressione delle immagini: ' + compressionError.message);
    }
    
    // Clear any existing errors if we have valid files
    if (validFiles.length > 0) {
      setError(null);
    }
  };

  const handleSaveImage = async (productId, productName) => {
    try {
      setError(null);
      
      // Check if files were selected for upload
      const selectedFiles = editingImageFiles[productId];
      
      if (!selectedFiles || selectedFiles.length === 0) {
        setError('Seleziona almeno un\'immagine da caricare');
        return;
      }

      // Set uploading state
      setUploadingEditImages({
        ...uploadingEditImages,
        [productId]: true
      });

      // Upload images to Firebase Storage
      let imageUrls = [];
      try {
        imageUrls = await uploadImagesToStorage(selectedFiles, productName);
      } catch (uploadError) {
        setError(uploadError.message);
        setUploadingEditImages({
          ...uploadingEditImages,
          [productId]: false
        });
        return;
      }

      // Update product with new image URLs
      const response = await fetch(`/api/products?id=${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrls: imageUrls })
      });

      const result = await response.json();

      if (result.success) {
        // Remove from editing state
        handleCancelEditImage(productId);
        
        // Refresh products list
        await fetchProducts();
        
        // Show success message
        alert(`Immagini per "${productName}" aggiornate con successo!`);
      } else {
        setError(result.error || 'Errore durante l\'aggiornamento delle immagini');
      }
    } catch (err) {
      setError('Errore di rete: ' + err.message);
    } finally {
      setUploadingEditImages({
        ...uploadingEditImages,
        [productId]: false
      });
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

          <div>
            <label htmlFor="productImage" className="block text-sm font-medium text-gray-700 mb-1">
              Immagini Prodotto
            </label>
            <input
              type="file"
              id="productImage"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Formati supportati: JPG, PNG, GIF, WebP (max 10MB per file). 
              Puoi selezionare più immagini. Le immagini saranno automaticamente compresse e ottimizzate.
            </p>
            
            {imagePreviews.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700 mb-2">Anteprima immagini ({imagePreviews.length})</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Anteprima ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md border"
                      />
                      <div className="mt-1">
                        <p className="text-xs text-gray-600 truncate">{selectedImages[index]?.name}</p>
                        <p className="text-xs text-gray-400">
                          {selectedImages[index] && (selectedImages[index].size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={clearImageSelection}
                  className="mt-2 text-xs text-red-600 hover:text-red-800"
                >
                  Rimuovi tutte le immagini
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={creating || uploadingImages}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploadingImages ? uploadProgress || 'Caricamento immagini...' : creating ? 'Creazione in corso...' : 'Aggiungi Prodotto'}
          </button>
          
          {/* Progress indicator */}
          {uploadProgress && (
            <div className="mt-2 text-sm text-blue-600 text-center">
              {uploadProgress}
            </div>
          )}
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
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Immagine</th>
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
                      {editingImage[product.id] ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2 items-center">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleEditImageFileChange(product.id, e)}
                              className="flex-1 text-xs border border-gray-300 rounded px-2 py-1 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700"
                            />
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleSaveImage(product.id, product.name)}
                                disabled={!editingImageFiles[product.id] || uploadingEditImages[product.id]}
                                className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 disabled:bg-gray-400"
                                title="Carica e salva immagini"
                              >
                                {uploadingEditImages[product.id] ? '⏳' : '✓'}
                              </button>
                              <button
                                onClick={() => handleCancelEditImage(product.id)}
                                className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                                title="Annulla"
                              >
                                ✗
                              </button>
                            </div>
                          </div>
                          
                          {/* Image previews */}
                          {editingImagePreviews[product.id] && editingImagePreviews[product.id].length > 0 && (
                            <div className="grid grid-cols-3 gap-2">
                              {editingImagePreviews[product.id].map((preview, index) => (
                                <div key={index} className="relative">
                                  <img
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    className="w-16 h-16 object-cover rounded border"
                                  />
                                  <div className="text-xs text-gray-600 mt-1 truncate">
                                    {editingImageFiles[product.id]?.[index]?.name}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <div className="flex-1">
                            {(() => {
                              // Support both new imageUrls array and legacy imageUrl
                              const images = product.imageUrls && product.imageUrls.length > 0 
                                ? product.imageUrls 
                                : (product.imageUrl ? [product.imageUrl] : []);
                              
                              if (images.length === 0) {
                                return <span className="text-gray-400 text-xs">Nessuna immagine</span>;
                              }
                              
                              if (images.length === 1) {
                                return (
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={images[0]}
                                      alt={product.name}
                                      className="w-12 h-12 object-cover rounded border"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                      }}
                                    />
                                    <span className="text-xs text-red-500 hidden">Errore caricamento</span>
                                  </div>
                                );
                              }
                              
                              // Multiple images - show count and first image
                              return (
                                <div className="flex items-center gap-2">
                                  <div className="relative">
                                    <img
                                      src={images[0]}
                                      alt={product.name}
                                      className="w-12 h-12 object-cover rounded border"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                      }}
                                    />
                                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                      {images.length}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-600">{images.length} immagini</span>
                                  <span className="text-xs text-red-500 hidden">Errore caricamento</span>
                                </div>
                              );
                            })()}
                          </div>
                          <button
                            onClick={() => handleEditImage(product.id, product.imageUrl || (product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : ''))}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                            title="Modifica immagine"
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