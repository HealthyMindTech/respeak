import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, connectAuthEmulator } from "firebase/auth";
import { collection, getFirestore, onSnapshot, connectFirestoreEmulator } from "firebase/firestore";
         
const firebaseConfig = {
  apiKey: "AIzaSyCoz1WdryRt-XN7YcrdZLH4DA6GEoUFIys",
  authDomain: "respeak-92478.firebaseapp.com",
  projectId: "respeak-92478",
  storageBucket: "respeak-92478.appspot.com",
  messagingSenderId: "89806658497",
  appId: "1:89806658497:web:a6149b9bafcf198ffd6d40"
};

console.log(process.env);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
if (process.env.REACT_APP_USE_EMULATOR) {
  connectAuthEmulator(auth, "http://localhost:9099");
}
const firestore = getFirestore(app);
if (process.env.REACT_APP_USE_EMULATOR) {
  connectFirestoreEmulator(firestore, "localhost", 8080);
}

signInAnonymously(auth)
  .then(() => {
    onSnapshot(collection(firestore, "waitingThought"),
               (doc) => {
               });
  })
  .catch((error) => {
    console.log(error);
  });

export default app;
