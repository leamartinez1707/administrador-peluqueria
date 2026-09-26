import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/server";
import { formatMoney, formatDateLabel } from "@/lib/format";
import { deleteCut } from "./actions";

type SearchParams = Promise<{
  barbero?: string;
  desde?: string;
  hasta?: string;
}>;

export default async function CutsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = getSupabaseClient();

  const { data: barbers } = await supabase
    .from("barbers")
    .select("id, name")
    .order("name");

  let query = supabase
    .from("cuts")
    .select(
      "id, amount, cut_date, client_name, payment_method, barbers(name), services(name)"
    )
    .order("cut_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);

  if (params.barbero) query = query.eq("barber_id", params.barbero);
  if (params.desde) query = query.gte("cut_date", params.desde);
  if (params.hasta) query = query.lte("cut_date", params.hasta);

  const { data: cuts, error } = await query;

  const total = (cuts ?? []).reduce((sum, c) => sum + Number(c.amount), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Cortes</h1>
        <Link
          href="/cortes/nuevo"
          className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          + Registrar corte
        </Link>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Barbero</span>
          <select
            name="barbero"
            defaultValue={params.barbero ?? ""}
            className="input"
          >
            <option value="">Todos</option>
            {(barbers ?? []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Desde</span>
          <input
            type="date"
            name="desde"
            defaultValue={params.desde ?? ""}
            className="input"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Hasta</span>
          <input
            type="date"
            name="hasta"
            defaultValue={params.hasta ?? ""}
            className="input"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          Filtrar
        </button>
        {(params.barbero || params.desde || params.hasta) && (
          <Link
            href="/cortes"
            className="text-sm text-neutral-500 hover:underline"
          >
            Limpiar filtros
          </Link>
        )}
      </form>

      {error ? (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          No se pudieron cargar los cortes: {error.message}
        </p>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
            <span className="text-sm text-neutral-500">
              {(cuts ?? []).length} corte{(cuts ?? []).length === 1 ? "" : "s"}
            </span>
            <span className="font-semibold">Total: {formatMoney(total)}</span>
          </div>
          {!cuts || cuts.length === 0 ? (
            <p className="p-4 text-sm text-neutral-500">
              No hay cortes para estos filtros.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
              {cuts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {c.barbers?.name ?? "Sin asignar"}
                      {c.services?.name ? ` · ${c.services.name}` : ""}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {formatDateLabel(c.cut_date)}
                      {c.client_name ? ` · ${c.client_name}` : ""} ·{" "}
                      {c.payment_method}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold">
                      {formatMoney(Number(c.amount))}
                    </p>
                    <form action={deleteCut}>
                      <input type="hidden" name="id" value={c.id} />
                      <button
                        type="submit"
                        className="text-xs text-neutral-400 hover:text-red-600"
                        title="Eliminar corte"
                      >
                        Eliminar
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
