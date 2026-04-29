import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // 🔥 ESSA LINHA RESOLVE O LAYOUT

import axios from "axios";

// 🔗 Conexão com seu backend
axios.defaults.baseURL = "https://afiliashop-backend.onrender.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);