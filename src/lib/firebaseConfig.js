import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider} from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDK4Q3BHWw7euBCA0TfbOVEfQZ0O6sps-k",
  authDomain: "jerseys-colombia-31c9f.firebaseapp.com",
  projectId: "jerseys-colombia-31c9f",
  storageBucket: "jerseys-colombia-31c9f.firebasestorage.app",
  messagingSenderId: "806324211210",
  appId: "1:806324211210:web:af031f3f1a4bd368ee59f3",
  measurementId: "G-EGNWNK7B21"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { app, auth, provider, storage };
