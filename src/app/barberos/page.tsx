import { getSupabaseClient } from "@/lib/supabase/server";
import { createBarber, toggleBarberActive } from "./actions";
import { NewItemForm } from "@/components/NewItemForm";

export const dynamic = "force-dynamic";

export default async function BarbersPage() {
  const supabase = getSupabaseClient();
  const { data: barbers, error } = await supabase
    .from("barbers")
    .select("id, name, active")
    .order("active", { ascending: false })
    .order("name");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Barberos</h1>

      <NewItemForm
        action={createBarber}
        fieldName="name"
        placeholder="Nombre del barbero"
        submitLabel="Agregar barbero"
      />

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
                    <span
                      className={b.active ? "" : "text-neutral-400 line-through"}
                    >
                      {b.name}
                    </span>
                  </div>
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
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
