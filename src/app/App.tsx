import { useState } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Login } from './components/Login';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('sentinel_token'));

  if (!token) {
    // Passamos a função setToken para o componente de Login
    return <Login onLogin={setToken} />;
  }

  return <RouterProvider router={router} />;
}

export default App;