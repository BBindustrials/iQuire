import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// TEMP DEBUG — remove after testing
import { supabase } from './integrations/supabase/client';
supabase.auth.getSession().then(({ data }) => {
  console.log('[DEBUG] Session on boot:', data.session ? 'Active' : 'None');
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);