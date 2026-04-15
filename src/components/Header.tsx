"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
          LexSmart
        </Link>

        {user && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">{user.email}</span>
            <button
              onClick={logout}
              className="rounded border border-gray-300 px-3 py-1 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Выйти
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
