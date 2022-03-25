import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initializeApp } from 'firebase/app';


const firebaseConfig = {
  apiKey: "AIzaSyCoz1WdryRt-XN7YcrdZLH4DA6GEoUFIys",
  authDomain: "respeak-92478.firebaseapp.com",
  projectId: "respeak-92478",
  storageBucket: "respeak-92478.appspot.com",
  messagingSenderId: "89806658497",
  appId: "1:89806658497:web:a6149b9bafcf198ffd6d40"
};

const app = initializeApp(firebaseConfig);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
