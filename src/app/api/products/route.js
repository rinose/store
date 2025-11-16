import { db } from '../../../firebase.js';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

// Configure for dynamic route to allow POST operations
export const dynamic = 'force-dynamic';

// For testing: http://localhost:3000/api/products

export async function GET() {
  try {
    // Use the actual Firebase path structure: demo/data/products
    const productsRef = collection(db, 'demo', 'data', 'products');
    
    // Get all documents from the collection
    const querySnapshot = await getDocs(productsRef);
    
    // Extract the data from each document
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Return the products as JSON using native Response
    return new Response(JSON.stringify({
      success: true,
      products: products,
      count: products.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return new Response(JSON.stringify({
      success: false, 
      error: 'Failed to fetch products',
      message: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// IMPORTANT: This POST method MUST exist for adding products to work
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, price, category, tags, ingredients, imageUrls } = body;

    if (!name) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Product name is required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Use the actual Firebase path structure: demo/data/products
    const productsRef = collection(db, 'demo', 'data', 'products');
    const docRef = await addDoc(productsRef, {
      name,
      description: description || '',
      price: price || 0,
      category: category || '',
      tags: tags || [],
      ingredients: ingredients || '',
      imageUrls: imageUrls || [], // Store array of image URLs
      createdAt: serverTimestamp()
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Product added successfully',
      productId: docRef.id
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error adding product:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to add product',
      message: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// DELETE method for removing products
export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('id');

    if (!productId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Product ID is required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Delete product using the actual Firebase path structure
    const productDocRef = doc(db, 'demo', 'data', 'products', productId);
    await deleteDoc(productDocRef);

    return new Response(JSON.stringify({
      success: true,
      message: 'Product deleted successfully',
      productId: productId
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to delete product',
      message: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// PUT method for updating product fields
export async function PUT(request) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('id');
    const body = await request.json();

    if (!productId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Product ID is required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Prepare the update data
    const updateData = {
      updatedAt: serverTimestamp()
    };

    // Handle different types of updates
    if (body.hasOwnProperty('tags')) {
      if (!Array.isArray(body.tags)) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Tags must be an array'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      updateData.tags = body.tags;
    }

    if (body.hasOwnProperty('price')) {
      // Handle price updates (can be null)
      if (body.price !== null && (isNaN(body.price) || body.price < 0)) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Price must be a valid positive number or null'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      updateData.price = body.price;
    }

    if (body.hasOwnProperty('category')) {
      updateData.category = body.category || '';
    }

    if (body.hasOwnProperty('ingredients')) {
      updateData.ingredients = body.ingredients || '';
    }

    if (body.hasOwnProperty('imageUrl')) {
      updateData.imageUrl = body.imageUrl || '';
    }

    if (body.hasOwnProperty('imageUrls')) {
      updateData.imageUrls = body.imageUrls || [];
    }

    // Update product using the actual Firebase path structure
    const productDocRef = doc(db, 'demo', 'data', 'products', productId);
    await updateDoc(productDocRef, updateData);

    return new Response(JSON.stringify({
      success: true,
      message: 'Product updated successfully',
      productId: productId,
      updatedFields: Object.keys(updateData).filter(key => key !== 'updatedAt')
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update product',
      message: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}