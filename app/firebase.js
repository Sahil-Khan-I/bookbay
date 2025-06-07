import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyD09-KAipIae6Blv3gwmEQrQmd3vMT8Z7U",
  authDomain: "bookbay-2f986.firebaseapp.com",
  projectId: "bookbay-2f986",
  storageBucket: "bookbay-2f986.appspot.com",
  messagingSenderId: "583396340596",
  appId: "1:583396340596:web:11a30426d8660feef1f221",
  measurementId: "G-8BY1HYYX04"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics only on the client side
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics }; 