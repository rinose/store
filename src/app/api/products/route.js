import { db } from '../../../firebase.js';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = false;

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

// Note: POST methods don't work with static export
// You'll need to remove this or handle it differently
export async function POST(request) {
  // POST operations cannot be statically exported
  return new Response(JSON.stringify({
    success: false,
    error: 'POST operations are not available in static export mode'
  }), {
    status: 405,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}