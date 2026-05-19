import { useState } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Login } from "./components/Login";
import { AuthContext, TOKEN_KEY } from "./AuthContext";

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));

  const handleLogin = (t: string) => {
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <AuthContext.Provider value={{ token, logout: handleLogout }}>
      <RouterProvider router={router} />
    </AuthContext.Provider>
  );
}

export default App;
