import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThirdwebProvider } from '@thirdweb-dev/react';

import { StateContextProvider } from './context';
import App from './App';
import './index.css';


const clientId = "1f494b2229f1dc21fb2e28c93231b72c";  
const activeChain = "sepolia"; 

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <ThirdwebProvider clientId={clientId} activeChain={activeChain}> 
    <Router>
      <StateContextProvider>
        <App />
      </StateContextProvider>
    </Router>
  </ThirdwebProvider> 
);
