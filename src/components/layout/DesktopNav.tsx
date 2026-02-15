"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function DesktopNav() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const { user, profile } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname.startsWith("/watch/")) return null;

  const handleSignOut = () => {
    document.cookie.split(";").forEach((c) => {
      const name = c.trim().split("=")[0];
      if (name.includes("supabase") || name.includes("sb-")) {
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }
    });
    window.location.href = "/";
  };

  const links = [
    { href: "/", label: "Inicio" },
    { href: "/search", label: "Explorar" },
    { href: "/my-list", label: "Mi Lista" },
  ];

  return (
    <header className={`fixed top-0 inset-x-0 z-50 hidden md:block transition-all duration-500 ${scrolled ? "bg-[#0a0a0a]/95 backdrop-blur-xl shadow-2xl shadow-black/20" : "bg-gradient-to-b from-black/80 to-transparent"}`}>
      <div className="flex items-center justify-between h-16 px-8 lg:px-12">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center font-black text-white text-sm group-hover:bg-red-500 transition-colors">S</div>
            <span className="text-white font-bold text-lg tracking-tight hidden lg:block">StreamVault</span>
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link key={link.href} href={link.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${isActive ? "text-white bg-white/10" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}>
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button type="button" onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer">
              <Search className="w-5 h-5" />
            </button>
            {searchOpen && (
              <div className="absolute right-0 top-full mt-2 w-72">
                <input type="search" placeholder="Buscar titulos, generos..." autoFocus
                  className="w-full bg-zinc-900/90 backdrop-blur-lg border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
                  onBlur={() => setTimeout(() => setSearchOpen(false), 200)} />
              </div>
            )}
          </div>
          <button type="button" className="p-2 text-zinc-400 hover:text-white transition-colors relative cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          {user ? (
            <div className="relative group/profile">
              <button type="button" className="flex items-center gap-2 p-1 rounded-md hover:bg-white/5 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                  {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : (profile?.display_name || user.email)?.[0]?.toUpperCase() || "U"}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 transition-transform group-hover/profile:rotate-180" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 py-1 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-lg shadow-2xl opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all">
                <div className="px-3 py-2 border-b border-zinc-800">
                  <p className="text-sm font-medium text-white truncate">{profile?.display_name || "Usuario"}</p>
                  <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                </div>
                <Link href="/profile" className="block px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5">Mi Perfil</Link>
                <button type="button" onClick={handleSignOut} className="w-full text-left px-3 py-2 text-sm text-zinc-400 hover:text-red-400 hover:bg-white/5 cursor-pointer">
                  Cerrar Sesion
                </button>
              </div>
            </div>
          ) : (
            <Link href="/login" className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-md transition-colors">Ingresar</Link>
          )}
        </div>
      </div>
    </header>
  );
}
