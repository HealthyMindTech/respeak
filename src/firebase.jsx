import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from "firebase/auth";
import { collection, getFirestore, onSnapshot } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
         
const firebaseConfig = {
  apiKey: "AIzaSyCoz1WdryRt-XN7YcrdZLH4DA6GEoUFIys",
  authDomain: "respeak-92478.firebaseapp.com",
  projectId: "respeak-92478",
  storageBucket: "respeak-92478.appspot.com",
  messagingSenderId: "89806658497",
  appId: "1:89806658497:web:a6149b9bafcf198ffd6d40"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const functions = getFunctions(app);

signInAnonymously(auth)
  .then(() => {
    onSnapshot(collection(firestore, "waitingThought"),
               (doc) => {
                 console.log(doc);
               });
  })
  .catch((error) => {
    console.log(error);
  });

export default app;
