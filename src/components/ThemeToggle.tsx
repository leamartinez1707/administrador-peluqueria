"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Recien despues de montar sabemos el tema resuelto por next-themes
    // (evita un mismatch de hidratacion entre servidor y cliente).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-8 w-8 shrink-0" aria-hidden />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Cambiar a claro" : "Cambiar a oscuro"}
      aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
