import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBLSHoc34KXqY7tZ_mOs1XscswL7dr3RFg",
  authDomain: "panchamitram-571a5.firebaseapp.com",
  projectId: "panchamitram-571a5",
  storageBucket: "panchamitram-571a5.firebasestorage.app",
  messagingSenderId: "211137784480",
  appId: "1:211137784480:web:6dd19b3f571b4ce01877c5",
  measurementId: "G-1YM53NQ57W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth }; 