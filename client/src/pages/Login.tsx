import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        window.location.href = "/admin";
      } else {
        setError("Invalid password. Try again.");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-cyber flex items-center justify-center">
      <div className="cyber-card w-full max-w-md">
        <h1 className="text-3xl font-black text-pink-500 text-glow mb-2">ADMIN LOGIN</h1>
        <p className="text-cyan-400 text-sm mb-8">Enter your admin password to continue</p>
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 text-black font-bold"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </div>
      </div>
    </div>
  );
}