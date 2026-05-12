import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCcfxcr5X8-_NVtjapk11SlpUQwLCHafag",
  authDomain: "coding-platform-39a6e.firebaseapp.com",
  projectId: "coding-platform-39a6e",
  storageBucket: "coding-platform-39a6e.firebasestorage.app",
  messagingSenderId: "1042775912446",
  appId: "1:1042775912446:web:3dcddd477f239a147f9aaf",
  measurementId: "G-3XWDP4HF7C",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
};
