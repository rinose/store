import { db } from '../../../firebase.js';
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy, where } from 'firebase/firestore';

// Configure for dynamic route to allow POST operations
export const dynamic = 'force-dynamic';

// GET - Fetch all orders or orders for a specific user
export async function GET(request) {
  try {
    // Get the URL to check for userId parameter
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Use the actual Firebase path structure: demo/data/orders
    const ordersRef = collection(db, 'demo', 'data', 'orders');
    
    let ordersQuery;
    if (userId) {
      // Filter orders by userId if provided
      ordersQuery = query(
        ordersRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    } else {
      // Get all orders if no userId filter
      ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'));
    }
    
    // Get all documents from the collection
    const querySnapshot = await getDocs(ordersQuery);
    
    // Extract the data from each document
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Return the orders as JSON
    return new Response(JSON.stringify({
      success: true,
      orders: orders,
      count: orders.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return new Response(JSON.stringify({
      success: false, 
      error: 'Failed to fetch orders',
      message: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// POST - Create a new order
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Items are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!body.customerName || !body.customerEmail) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Customer name and email are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Calculate total
    const total = body.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create order object with current date/time
    const now = new Date();
    const orderData = {
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone || '',
      items: body.items,
      total: total,
      status: 'pending',
      createdAt: now.toISOString(),
      orderDate: now.toISOString(), // Duplicate for clarity
      notes: body.notes || ''
    };

    // Add to Firestore
    const ordersRef = collection(db, 'demo', 'data', 'orders');
    const docRef = await addDoc(ordersRef, orderData);

    return new Response(JSON.stringify({
      success: true,
      orderId: docRef.id,
      message: 'Order created successfully'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create order',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// PUT - Update an order (e.g., mark as completed)
export async function PUT(request) {
  try {
    const body = await request.json();
    
    if (!body.orderId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Order ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const orderRef = doc(db, 'demo', 'data', 'orders', body.orderId);
    
    const updateData = {};
    
    if (body.status) {
      updateData.status = body.status;
      if (body.status === 'completed') {
        updateData.completedAt = new Date().toISOString();
      }
    }

    if (Object.keys(updateData).length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No valid fields to update'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await updateDoc(orderRef, updateData);

    return new Response(JSON.stringify({
      success: true,
      message: 'Order updated successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update order',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}