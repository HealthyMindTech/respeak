import { getApp } from 'firebase/app';
import { getFirestore, collection, connectFirestoreEmulator, getDocs } from "firebase/firestore";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";
import { getAuth, signInAnonymously, connectAuthEmulator } from "firebase/auth";

const THOUGHT_COLLECTION = "thought";
const RESPEAK_COLLECTION = "respeak";

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
const noteSeenRespeaksCallable = httpsCallable(functions, 'noteSeenRespeaks');

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

const getRespeaks = async (thoughtId) => {
  const respeaks = collection(firestore, THOUGHT_COLLECTION, thoughtId, RESPEAK_COLLECTION);
  const querySnapshot = await getDocs(respeaks);
  return querySnapshot.docs.map((doc) => Object.assign({}, doc.data(), { id: doc.id }));
}

const noteSeenRespeaks = async (thoughtId, seenRespeaks) => {
  await noteSeenRespeaksCallable({ thoughtId, seenRespeaks });
};

const signIn = async () => {
  return signInAnonymously(auth)
}

export {
  addThought,
  addRespeak,
  signIn,
  THOUGHT_COLLECTION,
  firestore,
  auth,
  getRespeaks,
  noteSeenRespeaks
};
  
