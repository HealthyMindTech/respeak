import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from 'firebase/app';

const app = getApp();
const functions = getFunctions(app, "europe-west3");
const postThoughtCallable = httpsCallable(functions, 'addThought');

const postThought = async (thought) => {
  const res = await postThoughtCallable({content: thought});
  console.log(res);
  
}

export {
  postThought
};
  
