"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";
import type { Session } from "@/lib/session";
import { ThemeToggle } from "./ThemeToggle";

export function NavBar({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (!session) {
    return (
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <span className="text-base font-semibold tracking-tight sm:text-lg">
            💈 Classic Barber Studio
          </span>
          <ThemeToggle />
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

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <span className="text-base font-semibold tracking-tight sm:text-lg">
          💈 Classic Barber Studio
        </span>

        {/* Desktop / tablet: todo en una fila */}
        <div className="hidden items-center gap-3 sm:flex">
          <nav className="flex flex-wrap gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
          <div className="flex items-center gap-2 text-sm">
            <span className="whitespace-nowrap text-neutral-500">
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

        {/* Mobile: boton de menu */}
        <div className="flex items-center gap-1 sm:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Cerrar menu" : "Abrir menu"}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <span className="text-xl leading-none">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile: panel desplegable */}
      {open ? (
        <div className="border-t border-neutral-200 px-4 py-3 dark:border-neutral-800 sm:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
            <span className="text-sm text-neutral-500">
              {session.name}
              <span className="text-neutral-400">
                {" "}
                · {session.role === "admin" ? "admin" : "barbero"}
              </span>
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="text-sm font-medium text-neutral-500 hover:underline"
              >
                Cerrar sesion
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </header>
  );
}
