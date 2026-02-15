"use client";
import { useAuth } from "@/context/AuthContext";
import { User } from "lucide-react";

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth();
  return (
    <div className="pt-20 md:pt-24 px-5 md:px-12 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Perfil</h1>
      <div className="bg-zinc-900 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold">{profile?.display_name || "Usuario"}</p>
            <p className="text-zinc-500 text-sm">{user?.email || "No autenticado"}</p>
          </div>
        </div>
        {user && (
          <button onClick={signOut} className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-red-400 rounded-lg text-sm font-medium transition-colors">
            Cerrar Sesion
          </button>
        )}
      </div>
    </div>
  );
}
