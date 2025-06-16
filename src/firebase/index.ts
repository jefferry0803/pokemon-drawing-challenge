import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyC-mWBQB9BMbFZsR5DG0fxiNnLIq2e5fYM',
  authDomain: 'pokemon-drawing-challenge.firebaseapp.com',
  databaseURL: 'https://pokemon-drawing-challenge-default-rtdb.firebaseio.com',
  projectId: 'pokemon-drawing-challenge',
  storageBucket: 'pokemon-drawing-challenge.appspot.com',
  messagingSenderId: '368963671977',
  appId: '1:368963671977:web:9907d80898cca8702b56b8',
  measurementId: 'G-WHCSBQJD5Y',
};

const app = initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth();

export { db, auth };
