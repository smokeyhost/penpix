import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RecoilRoot } from 'recoil'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ConfirmModalProvider } from "./contexts/ConfirmContext.jsx";
import './index.css'
import axios from 'axios'

axios.defaults.baseURL = import.meta.env.VITE_APP_API_BASE_URL
axios.defaults.withCredentials = true;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RecoilRoot>
      <BrowserRouter>
        <ConfirmModalProvider>
          <App />
        </ConfirmModalProvider>,
      </BrowserRouter>
    </RecoilRoot>
  </StrictMode>,
)
