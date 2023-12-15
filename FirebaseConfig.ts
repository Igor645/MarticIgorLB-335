// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBObcxw4VVdDGBCkTyoSzy8pK9y_THcjrg",
  authDomain: "schulnoten-24ac0.firebaseapp.com",
  projectId: "schulnoten-24ac0",
  storageBucket: "schulnoten-24ac0.appspot.com",
  messagingSenderId: "676641582687",
  appId: "1:676641582687:web:3b2bf16240e652fc0535ea",
  measurementId: "G-6KYLB68L6S"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP)
