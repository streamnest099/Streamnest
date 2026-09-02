import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCvdGAqQafHB3WW1dQ-D4IMf5Mf90nWcZM",
  authDomain: "streamnest-dd011.firebaseapp.com",
  projectId: "streamnest-dd011",
  storageBucket: "streamnest-dd011.firebasestorage.app",
  messagingSenderId: "1044156428651",
  appId: "1:1044156428651:web:1790764bf0ec5e9cccdc2e",
  measurementId: "G-0B2LVGW80D"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.streamNestFirebase = {
  app,
  auth,
  db,
  onAuthStateChanged
};