// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDRsrxYnqcIhW9RiDs7uwi_93Lc65opsFM",
  authDomain: "create-gasboost.firebaseapp.com",
  projectId: "create-gasboost",
  storageBucket: "create-gasboost.firebasestorage.app",
  messagingSenderId: "43492329517",
  appId: "1:43492329517:web:ed7c5f3b941b03353450a4",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
export const firebaseDatabase = getDatabase(firebaseApp);
export const firebaseAuth = getAuth(firebaseApp);
