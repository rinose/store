import { NextResponse } from 'next/server';
import { db } from '../../../firebase.js';
import { collection, getDocs } from 'firebase/firestore';

// For testing: http://localohst:3000/api/products

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

    // Return the products as JSON
    return NextResponse.json({
      success: true,
      products: products,
      count: products.length
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products',
        message: error.message 
      },
      { status: 500 }
    );
  }
}