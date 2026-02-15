"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    if (error) { setError(error); setLoading(false); }
    else router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center font-black text-white text-xl mx-auto mb-4">S</div>
          <h1 className="text-2xl font-bold text-white">Iniciar Sesion</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg py-2">{error}</p>}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 outline-none focus:border-red-500/50 transition-colors" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contrasena" required
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 outline-none focus:border-red-500/50 transition-colors" />
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white font-semibold rounded-lg transition-colors">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <p className="text-zinc-500 text-sm text-center mt-6">
          No tienes cuenta? <Link href="/register" className="text-red-400 hover:text-red-300">Registrate</Link>
        </p>
      </div>
    </div>
  );
}
