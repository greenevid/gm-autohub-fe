"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Menu, UserCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { USER_ROLE_LABELS } from "@/lib/types";

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <header className="flex h-[73px] items-center justify-between gap-4 border-b border-zinc-200 bg-white px-4 sm:px-8 print:hidden">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Buka menu"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex flex-1 items-center justify-end gap-3 sm:gap-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full bg-green-600 py-1.5 pl-2 pr-2 text-white hover:bg-green-700 sm:pr-3"
          >
            <UserCircle className="h-6 w-6 shrink-0" />
            <span className="hidden max-w-[10rem] truncate text-sm font-medium sm:inline">
              {user?.nama ?? "..."}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-52 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
                <div className="border-b border-zinc-100 px-3 py-2">
                  <p className="truncate text-sm font-semibold text-zinc-900">{user?.nama}</p>
                  <p className="truncate text-xs text-zinc-400">{user?.email}</p>
                  <p className="mt-0.5 text-xs font-medium text-green-600">
                    {user ? USER_ROLE_LABELS[user.role] : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
