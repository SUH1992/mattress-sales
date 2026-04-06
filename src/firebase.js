import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAYT55mjZgx9wWhmNPk2SMBReXQQAmvQYk",
  authDomain: "mattress-sales.vercel.app",
  projectId: "mattress-sales",
  storageBucket: "mattress-sales.firebasestorage.app",
  messagingSenderId: "84853049335",
  appId: "1:84853049335:web:1b2403636a7e34178490f2",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
