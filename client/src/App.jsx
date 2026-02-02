import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import Feed from "./components/Feed";
import Landing from "./components/Landing";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/Card";
import Input from "./components/ui/Input";
import Button from "./components/ui/Button";
import { motion } from "framer-motion";
import { LogIn, AlertCircle, Loader2, UserPlus } from "lucide-react";

export default function App() {
  const { user, loading: authLoading, login, signup, logout } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        await signup(username, password);
      } else {
        await login(username, password);
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return (
      <Feed
        user={user}
        onLogout={() => {
          logout();
          setShowLanding(true);
        }}
      />
    );
  }

  // Show landing page first
  if (showLanding) {
    return <Landing onGetStarted={() => setShowLanding(false)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isSignup ? (
                <>
                  <UserPlus className="w-6 h-6" />
                  Sign Up
                </>
              ) : (
                <>
                  <LogIn className="w-6 h-6" />
                  Login
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Username
                </label>
                <Input
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isSignup ? "Signing up..." : "Logging in..."}
                  </>
                ) : isSignup ? (
                  "Sign Up"
                ) : (
                  "Login"
                )}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setError("");
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  {isSignup
                    ? "Already have an account? Login"
                    : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
