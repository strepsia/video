"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Search, BookmarkPlus, User } from "lucide-react";

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/search", label: "Buscar", icon: Search },
  { href: "/my-list", label: "Mi Lista", icon: BookmarkPlus },
  { href: "/profile", label: "Perfil", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/watch/")) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-zinc-800/50" />
      <div className="relative flex items-center justify-around h-16 px-2 pb-safe">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[60px] py-1.5 rounded-lg transition-all duration-200 ${isActive ? "text-red-500" : "text-zinc-500 hover:text-zinc-300 active:text-zinc-300"}`}>
              <Icon className={`w-5 h-5 transition-all duration-200 ${isActive ? "scale-110" : ""}`} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className={`text-[10px] font-medium transition-all ${isActive ? "text-red-500" : ""}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
