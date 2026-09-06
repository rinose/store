import { initializeApp, getApps } from "firebase/app";
import { addDoc, collection, getDocs, getFirestore, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD2_g2V6PkhmuXz0yh1byPliyYMGe0ZGgA",
  authDomain: "store-41d09.firebaseapp.com",
  projectId: "store-41d09",
  storageBucket: "store-41d09.firebasestorage.app",
  messagingSenderId: "21802581957",
  appId: "1:21802581957:web:fdd712534687d6093bd5ac",
  measurementId: "G-LQRQ9TJ0P5",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

const seedReviews = [
  {
    name: "Maria Rossi",
    text: "I cantuccini senza glutine sono una meraviglia. Croccanti al punto giusto e con un profumo di mandorla che ricorda quelli della nonna. Li ho già riordinati due volte.",
    rating: 5,
    status: "approved",
    daysAgo: 18,
  },
  {
    name: "Luca Bianchi",
    text: "Ho preso una torta per il compleanno di mia moglie: presentazione curata e gusto equilibrato. Tutti gli ospiti hanno chiesto il contatto del pasticcere.",
    rating: 5,
    status: "approved",
    daysAgo: 12,
  },
  {
    name: "Giulia Conti",
    text: "Dolci freschi, ingredienti di qualità e consegna puntuale. Le chiacchiere fritte erano leggere e non unte. Consigliatissimo.",
    rating: 4,
    status: "approved",
    daysAgo: 8,
  },
  {
    name: "Andrea Greco",
    text: "Ottima pasticceria artigianale. Ho assaggiato la Dubai Chocolate e non mi ha deluso: cremosa, ricca e con un contrasto di texture davvero riuscito.",
    rating: 5,
    status: "approved",
    daysAgo: 5,
  },
  {
    name: "Elena Marino",
    text: "Servizio gentile e prodotti che si sentono fatti a mano. Unico appunto: avrei voluto qualche opzione in più senza lattosio. Nel complesso sono soddisfatta.",
    rating: 4,
    status: "approved",
    daysAgo: 3,
  },
  {
    name: "Marco Esposito",
    text: "Ho ordinato i cantuccini per un regalo e sono arrivati ben confezionati. Aspetto di assaggiarli nel weekend, ma l'odore è già promettente!",
    rating: 5,
    status: "pending",
    daysAgo: 1,
  },
];

async function seed() {
  const recensioniRef = collection(db, "demo", "data", "recensioni");
  const existing = await getDocs(recensioniRef);

  if (!existing.empty) {
    console.log(`Collection recensioni already has ${existing.size} documents. Skipping seed.`);
    return;
  }

  for (const review of seedReviews) {
    const createdAt = Timestamp.fromDate(new Date(Date.now() - review.daysAgo * 24 * 60 * 60 * 1000));
    await addDoc(recensioniRef, {
      name: review.name,
      text: review.text,
      rating: review.rating,
      status: review.status,
      createdAt,
    });
    console.log(`Added review from ${review.name} (${review.status})`);
  }

  console.log("Seed completed.");
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
