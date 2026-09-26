"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";
import type { Session } from "@/lib/session";

export function NavBar({ session }: { session: Session | null }) {
  const pathname = usePathname();

  if (!session) {
    return (
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
        <div className="mx-auto flex max-w-4xl items-center px-4 py-3">
          <span className="text-lg font-semibold tracking-tight">
            💈 Classic Barber Studio
          </span>
        </div>
      </header>
    );
  }

  const links = [
    { href: "/", label: "Inicio" },
    { href: "/cortes", label: "Cortes" },
    ...(session.role === "admin"
      ? [
          { href: "/barberos", label: "Barberos" },
          { href: "/servicios", label: "Servicios" },
        ]
      : []),
    { href: "/cuenta", label: "Mi cuenta" },
  ];

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="mx-auto flex max-w-4xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-lg font-semibold tracking-tight">
          💈 Classic Barber Studio
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <nav className="flex flex-wrap gap-1">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-500">
              {session.name}
              <span className="text-neutral-400">
                {" "}
                · {session.role === "admin" ? "admin" : "barbero"}
              </span>
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="text-xs font-medium text-neutral-500 hover:underline"
              >
                Cerrar sesion
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
