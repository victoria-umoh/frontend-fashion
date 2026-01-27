import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import App from './App';
import reportWebVitals from './reportWebVitals';


// axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
// axios.defaults.baseURL = 'http://localhost:5000';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
