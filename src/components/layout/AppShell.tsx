"use client";

import BottomNav from "./BottomNav";
import DesktopNav from "./DesktopNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DesktopNav />
      <main className="min-h-screen pb-20 md:pb-0">{children}</main>
      <BottomNav />
    </>
  );
}
