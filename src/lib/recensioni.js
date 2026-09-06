import { addDoc, collection, doc, onSnapshot, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export const recensioniCollection = () => collection(db, "demo", "data", "recensioni");

const createdAtMillis = (value) => {
  if (!value) return 0;
  if (typeof value === "number") return value;
  if (value.seconds) return value.seconds * 1000;
  return 0;
};

const sortByDateDesc = (reviews) =>
  [...reviews].sort((a, b) => createdAtMillis(b.createdAt) - createdAtMillis(a.createdAt));

const SEED_REVIEWS = [
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
];

export const subscribeRecensioni = (onNext, onError) =>
  onSnapshot(
    recensioniCollection(),
    (snapshot) => {
      const reviews = sortByDateDesc(
        snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
      );
      onNext(reviews);
    },
    onError
  );

export async function seedRecensioniIfEmpty(reviews) {
  if (reviews.length > 0) return;
  if (typeof window !== "undefined" && sessionStorage.getItem("recensioni_seeded") === "1") return;

  for (const review of SEED_REVIEWS) {
    await addDoc(recensioniCollection(), {
      name: review.name,
      text: review.text,
      rating: review.rating,
      status: review.status,
      createdAt: Timestamp.fromMillis(Date.now() - review.daysAgo * 24 * 60 * 60 * 1000),
    });
  }

  if (typeof window !== "undefined") {
    sessionStorage.setItem("recensioni_seeded", "1");
  }
}

export async function addRecensione({ name, text, rating }) {
  const ref = await addDoc(recensioniCollection(), {
    name,
    text,
    rating,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function setRecensioneStatus(reviewId, status) {
  await updateDoc(doc(db, "demo", "data", "recensioni", reviewId), { status });
}
