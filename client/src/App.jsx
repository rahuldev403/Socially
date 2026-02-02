import { useEffect, useState } from "react";
import { login, getMe, logout } from "./api";
import Feed from "./components/Feed";


function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getMe().then(setUser);
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      await login(username, password);
      const me = await getMe();
      setUser(me);
    } catch {
      setError("Invalid credentials");
    }
  }

  async function handleLogout() {
    await logout();
    setUser(null);
  }

  if (user) {
    return <Feed user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <h2 className="text-xl font-bold mb-4 ">Login</h2>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <input
          className="border w-full p-2 mb-3"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="border w-full p-2 mb-4"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}

export default App;
