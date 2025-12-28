import { db } from '../../../firebase';
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
    const stripe = new Stripe(stripeSecretKey);

    // Parse the request body
    const { items, successUrl, cancelUrl } = await req.json();

    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}