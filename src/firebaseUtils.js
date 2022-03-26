import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";
import { getApp } from 'firebase/app';

const app = getApp();
const functions = getFunctions(app, "europe-west3");

if (process.env.REACT_APP_USE_EMULATOR) {
  connectFunctionsEmulator(functions, "localhost", 5001);
}

const postThoughtCallable = httpsCallable(functions, 'addThought');

const postThought = async (thought) => {
  const res = await postThoughtCallable({content: thought});
  console.log(res);
  
}

export {
  postThought
};
  
