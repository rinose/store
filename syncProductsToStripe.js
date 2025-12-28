import { db } from './src/firebase.js'; // Corrected import path
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import Stripe from 'stripe';

const syncProductsToStripe = async () => {
  try {
    // Fetch the Stripe secret key from Firebase
    const docRef = doc(db, 'demo/data');
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error('Stripe secret key not found in Firebase');
      return;
    }

    const stripeSecretKey = docSnap.data().stripe_login.STRIPE_SECRET_KEY;
    const stripe = new Stripe(stripeSecretKey);

    // Fetch products from /demo/data/products/
    const productsRef = collection(db, 'demo/data/products'); // Updated path
    const productsSnapshot = await getDocs(productsRef);

    console.log(`Fetched ${productsSnapshot.size} products from Firebase.`); // Debugging log

    if (productsSnapshot.empty) {
      console.log('No products found in Firebase.');
      return;
    }

    for (const productDoc of productsSnapshot.docs) {
      const productData = productDoc.data();

      // Create product in Stripe
      const product = await stripe.products.create({
        name: productData.name,
        description: productData.description,
      });

      // Create price in Stripe
      await stripe.prices.create({
        unit_amount: Math.round(productData.price * 100), // Convert to cents and round to nearest integer
        currency: 'eur', // Changed to EUR
        product: product.id,
      });

      console.log(`Synced product: ${productData.name}`);
    }
  } catch (error) {
    console.error('Error syncing products to Stripe:', error);
  }
};

syncProductsToStripe();