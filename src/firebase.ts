import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQyAlS0bcMP6SEpLboM_MRaEk2aVDPWVY",
  authDomain: "hackhub-2e122.firebaseapp.com",
  projectId: "hackhub-2e122",
  storageBucket: "hackhub-2e122.appspot.com",
  messagingSenderId: "209164890955",
  appId: "1:209164890955:web:3ee42ed31ea3d7acaceece"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app); 