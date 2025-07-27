// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCgbNGOmuWuuiK1PIaeGJRXskhx0pmZzE4",
  authDomain: "odoo-skill-swap.firebaseapp.com",
  projectId: "odoo-skill-swap",
  storageBucket: "odoo-skill-swap.firebasestorage.app",
  messagingSenderId: "173297950277",
  appId: "1:173297950277:web:b65ce8e9b0a3c30d39cd2c",
  measurementId: "G-XTG1X02MPH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;