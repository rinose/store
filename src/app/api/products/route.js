import { db } from '../../../firebase.js';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

// Configure for dynamic route to allow POST operations
export const dynamic = 'force-dynamic';

// For testing: http://localhost:3000/api/products

export async function GET() {
  try {
    // Most likely structure: products as a top-level collection
    const productsRef = collection(db, 'demo', '/data/products');
    
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
    const { name, description, price, category } = body;

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

    // IMPORTANT: Use same 'products' collection as GET method
    const productsRef = collection(db, 'demo', '/data/products');
    const docRef = await addDoc(productsRef, {
      name,
      description: description || '',
      price: price || 0,
      category: category || '',
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