import { createContext, useContext, useState, useEffect } from "react";
import {
  getMe,
  login as apiLogin,
  logout as apiLogout,
  signup as apiSignup,
} from "../api";
import { toast } from "sonner";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const userData = await getMe();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(username, password) {
    await apiLogin(username, password);
    const userData = await getMe();
    setUser(userData);
    console.log("Showing login toast for:", userData.username);
    toast.success("Login successful!", {
      description: `Welcome back, ${userData.username}!`,
    });
  }

  async function signup(username, password) {
    await apiSignup(username, password);
    const userData = await getMe();
    setUser(userData);
    console.log("Showing signup toast for:", userData.username);
    toast.success("Signup successful!", {
      description: `Welcome to Pinkit, ${userData.username}!`,
    });
  }

  async function logout() {
    setUser(null);
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
