import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBLNN0iuWU9XZ-YQq8CSvu5Vyo-Pv6UhMs",
  authDomain: "recipe-sharing-app-abf8e.firebaseapp.com",
  projectId: "recipe-sharing-app-abf8e",
  storageBucket: "recipe-sharing-app-abf8e.appspot.com",
  messagingSenderId: "658582866838",
  appId: "1:658582866838:web:abefb74413f04917be6bb7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Verify services are initialized
console.log('Firebase services initialized:', {
  auth: !!auth,
  db: !!db,
  storage: !!storage
});

export { auth, db, storage }; 