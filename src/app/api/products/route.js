import { NextResponse } from 'next/server';
import { db } from '../../../firebase.js';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

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

export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Product name is required' 
        },
        { status: 400 }
      );
    }

    // Prepare the product data
    const productData = {
      name: body.name.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Add any additional fields if provided
    if (body.description) {
      productData.description = body.description.trim();
    }
    if (body.price) {
      productData.price = parseFloat(body.price);
    }
    if (body.category) {
      productData.category = body.category.trim();
    }

    // Reference to the products collection
    const productsRef = collection(db, 'demo', '/data/products');
    
    // Add the new product to Firestore
    const docRef = await addDoc(productsRef, productData);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product: {
        id: docRef.id,
        ...productData
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create product',
        message: error.message 
      },
      { status: 500 }
    );
  }
}