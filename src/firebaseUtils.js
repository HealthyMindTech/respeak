import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";
import { getApp } from 'firebase/app';

const app = getApp();
const functions = getFunctions(app, "europe-west3");

if (process.env.REACT_APP_USE_EMULATOR) {
  connectFunctionsEmulator(functions, "localhost", 5001);
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
  

export {
  addThought,
  addRespeak
};
  
