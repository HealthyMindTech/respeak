import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from "firebase/auth";

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

signInAnonymously(auth)
  .then(() => {
    console.log("User", auth.currentUser);
  })
  .catch((error) => {
    console.log(error);
  });

export default app;
