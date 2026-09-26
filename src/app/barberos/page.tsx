import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { toggleBarberActive } from "./actions";

export const dynamic = "force-dynamic";

export default async function BarbersPage() {
  await requireAdmin();

  const supabase = getSupabaseClient();
  const { data: barbers, error } = await supabase
    .from("barbers")
    .select("id, name, phone, active")
    .order("active", { ascending: false })
    .order("name");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Barberos</h1>
        <Link
          href="/barberos/nuevo"
          className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          + Agregar barbero
        </Link>
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          No se pudieron cargar los barberos: {error.message}
        </p>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          {!barbers || barbers.length === 0 ? (
            <p className="p-4 text-sm text-neutral-500">
              Todavia no agregaste barberos.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
              {barbers.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        b.active ? "bg-green-500" : "bg-neutral-300"
                      }`}
                    />
                    <div>
                      <p
                        className={
                          b.active ? "" : "text-neutral-400 line-through"
                        }
                      >
                        {b.name}
                      </p>
                      {b.phone ? (
                        <p className="text-xs text-neutral-500">{b.phone}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/barberos/${b.id}/editar`}
                      className="text-xs font-medium text-neutral-500 hover:underline"
                    >
                      Editar
                    </Link>
                    <form action={toggleBarberActive}>
                      <input type="hidden" name="id" value={b.id} />
                      <input
                        type="hidden"
                        name="active"
                        value={String(b.active)}
                      />
                      <button
                        type="submit"
                        className="text-xs font-medium text-neutral-500 hover:underline"
                      >
                        {b.active ? "Desactivar" : "Activar"}
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
