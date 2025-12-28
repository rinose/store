import { db } from '../../../firebase'; // Ensure Firebase is initialized
import { doc, getDoc } from 'firebase/firestore';
import Stripe from 'stripe';

export async function POST(req) {
  try {
    // Fetch the Stripe secret key from Firebase
    const docRef = doc(db, 'demo/data');
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return new Response(JSON.stringify({ error: 'Stripe secret key not found in Firebase' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stripeSecretKey = docSnap.data().stripe_login.STRIPE_SECRET_KEY;

    // Initialize Stripe with the secret key
    const stripe = new Stripe(stripeSecretKey);

    // Parse the request body
    const { amount, currency, customerEmail } = await req.json();

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      receipt_email: customerEmail,
    });

    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}