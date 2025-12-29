import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
//import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyD2_g2V6PkhmuXz0yh1byPliyYMGe0ZGgA",
  authDomain: "store-41d09.firebaseapp.com",
  projectId: "store-41d09",
  storageBucket: "store-41d09.firebasestorage.app",
  messagingSenderId: "21802581957",
  appId: "1:21802581957:web:fdd712534687d6093bd5ac",
  measurementId: "G-LQRQ9TJ0P5"
};

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

export const db = getFirestore(app);
export const storage = getStorage(app);