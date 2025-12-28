const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Stripe = require('stripe');

admin.initializeApp();
const db = admin.firestore();
const stripe = new Stripe(functions.config().stripe.secret);

exports.syncProductToStripe = functions.firestore
  .document('demo/data/products/{productId}')
  .onCreate(async (snap, context) => {
    const productData = snap.data();

    try {
      // Create product in Stripe
      const product = await stripe.products.create({
        name: productData.name,
        description: productData.description,
      });

      // Create price in Stripe
      const price = await stripe.prices.create({
        unit_amount: Math.round(productData.price * 100), // Convert to cents
        currency: 'eur', // Use EUR as the currency
        product: product.id,
      });

      // Update Firebase with Stripe IDs
      await snap.ref.update({
        stripeProductId: product.id,
        stripePriceId: price.id,
      });

      console.log(`Synced product ${productData.name} to Stripe.`);
    } catch (error) {
      console.error('Error syncing product to Stripe:', error);
    }
  });