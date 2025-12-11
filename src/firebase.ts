import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD--Ewjul155YNZ-QOqZw1ooj33giwi88U",
  authDomain: "lonq-1e382.firebaseapp.com",
  projectId: "lonq-1e382",
  storageBucket: "lonq-1e382.firebasestorage.app",
  messagingSenderId: "114373227759",
  appId: "1:114373227759:web:acd547b445213f1d0d171a",
  measurementId: "G-ZQL7FNK3GN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, db, storage };
