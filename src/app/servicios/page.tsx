import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { toggleServiceActive } from "./actions";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  await requireAdmin();

  const supabase = getSupabaseClient();
  const { data: services, error } = await supabase
    .from("services")
    .select("id, name, price, active")
    .order("active", { ascending: false })
    .order("name");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Servicios</h1>
        <Link
          href="/servicios/nuevo"
          className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          + Agregar servicio
        </Link>
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          No se pudieron cargar los servicios: {error.message}
        </p>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          {!services || services.length === 0 ? (
            <p className="p-4 text-sm text-neutral-500">
              Todavia no agregaste servicios.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        s.active ? "bg-green-500" : "bg-neutral-300"
                      }`}
                    />
                    <span
                      className={s.active ? "" : "text-neutral-400 line-through"}
                    >
                      {s.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">
                      {formatMoney(Number(s.price))}
                    </span>
                    <Link
                      href={`/servicios/${s.id}/editar`}
                      className="text-xs font-medium text-neutral-500 hover:underline"
                    >
                      Editar
                    </Link>
                    <form action={toggleServiceActive}>
                      <input type="hidden" name="id" value={s.id} />
                      <input
                        type="hidden"
                        name="active"
                        value={String(s.active)}
                      />
                      <button
                        type="submit"
                        className="text-xs font-medium text-neutral-500 hover:underline"
                      >
                        {s.active ? "Desactivar" : "Activar"}
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
