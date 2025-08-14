// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9MwlbQVDS0u7vXphttB52BsKr1FqTsfw",
  authDomain: "ahorcado-5428c.firebaseapp.com",
  projectId: "ahorcado-5428c",
  storageBucket: "ahorcado-5428c.firebasestorage.app",
  messagingSenderId: "457679783559",
  appId: "1:457679783559:web:55fb13ac2be9bb245dda22",
  measurementId: "G-S6GZMZWL2B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;