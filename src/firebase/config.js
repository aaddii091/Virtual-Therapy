// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAfeLqSLn9gRUB7OIS2vGD7Xd4j5GW2cyI",
  authDomain: "virtual-therapy-1fbea.firebaseapp.com",
  projectId: "virtual-therapy-1fbea",
  storageBucket: "virtual-therapy-1fbea.appspot.com",
  messagingSenderId: "450365624845",
  appId: "1:450365624845:web:d4521a5d73d11eb26dbb44",
  measurementId: "G-8B320YVQ39"
};

// Initialize Firebase
initializeApp(firebaseConfig);

// Initialize Services
const firestoreDB = getFirestore();
const firebaseAuth = getAuth();

export { firestoreDB, firebaseAuth };
