// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBICWk7DJweIp9y9jTkxvQnEwPbyzjp_FY",
  authDomain: "pizzaporcionesapp.firebaseapp.com",
  projectId: "pizzaporcionesapp",
  storageBucket: "pizzaporcionesapp.firebasestorage.app",
  messagingSenderId: "166027531065",
  appId: "1:166027531065:web:50c2025810767210fc8ee8",
  measurementId: "G-Z9CTMN8CKT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);