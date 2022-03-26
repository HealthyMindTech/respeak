import { getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";
import { getAuth, signInAnonymously, connectAuthEmulator } from "firebase/auth";

const THOUGHT_COLLECTION = "thought";

const app = getApp();
const functions = getFunctions(app, "europe-west3");
const auth = getAuth(app);
const firestore = getFirestore(app);

if (process.env.REACT_APP_USE_EMULATOR) {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFunctionsEmulator(functions, "localhost", 5001);
  connectFirestoreEmulator(firestore, "localhost", 8080);
}

const addThoughtCallable = httpsCallable(functions, 'addThought');
const addRespeakCallable = httpsCallable(functions, 'addRespeak');

const addThought = async (thought) => {
  await addThoughtCallable({content: thought});
}

const addRespeak = async (thoughtId, respeak, perspective) => {
  await addRespeakCallable({
    content: respeak,
    thoughtId,
    perspective
  });
}

const signIn = async () => {
  return signInAnonymously(auth)
}

export {
  addThought,
  addRespeak,
  signIn,
  THOUGHT_COLLECTION,
  firestore,
  auth
};
  
