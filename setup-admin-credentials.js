// Script per creare le credenziali admin in Firebase
import { db } from './src/firebase.js';
import { doc, setDoc } from 'firebase/firestore';

async function setupAdminCredentials() {
  try {
    const adminCredentials = {
      email: "admin@cristofaropastrychef.com",
      psw: "CristofaroAdmin2024!"
    };

    await setDoc(doc(db, 'demo/data'), {
      admin_login: adminCredentials
    });

    console.log('Admin credentials created successfully!');
    console.log('Email:', adminCredentials.email);
    console.log('Password:', adminCredentials.psw);
  } catch (error) {
    console.error('Error creating admin credentials:', error);
  }
}

setupAdminCredentials();