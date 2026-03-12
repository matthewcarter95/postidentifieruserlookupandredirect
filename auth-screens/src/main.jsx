import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx';
import './styles/main.css';

// Add the root element to the DOM
const rootElement = document.createElement("div");
rootElement.id = "root";
document.body.appendChild(rootElement);

// Bootstrap the React App
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
