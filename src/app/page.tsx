import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/server";
import { formatMoney, formatDateLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toLocaleDateString("sv-SE");
}

function monthStartISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export default async function DashboardPage() {
  const supabase = getSupabaseClient();
  const today = isoDaysAgo(0);
  const weekStart = isoDaysAgo(6);
  const monthStart = monthStartISO();

  const { data: monthCuts, error } = await supabase
    .from("cuts")
    .select("id, amount, cut_date, barber_id, barbers(name)")
    .gte("cut_date", monthStart)
    .order("cut_date", { ascending: false })
    .order("created_at", { ascending: false });

  const { data: recentCuts } = await supabase
    .from("cuts")
    .select("id, amount, cut_date, client_name, barbers(name), services(name)")
    .order("created_at", { ascending: false })
    .limit(8);

  const cuts = monthCuts ?? [];

  const totalToday = cuts
    .filter((c) => c.cut_date === today)
    .reduce((sum, c) => sum + Number(c.amount), 0);
  const cantidadHoy = cuts.filter((c) => c.cut_date === today).length;

  const totalSemana = cuts
    .filter((c) => c.cut_date >= weekStart)
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const totalMes = cuts.reduce((sum, c) => sum + Number(c.amount), 0);

  const porBarbero = new Map<
    string,
    { nombre: string; total: number; cantidad: number }
  >();
  for (const c of cuts) {
    const nombre = c.barbers?.name ?? "Sin asignar";
    const key = c.barber_id ?? nombre;
    const prev = porBarbero.get(key) ?? { nombre, total: 0, cantidad: 0 };
    prev.total += Number(c.amount);
    prev.cantidad += 1;
    porBarbero.set(key, prev);
  }
  const rankingBarberos = Array.from(porBarbero.values()).sort(
    (a, b) => b.total - a.total
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Panel general</h1>
          <p className="text-sm text-neutral-500">
            Resumen de la actividad de la peluqueria
          </p>
        </div>
        <Link
          href="/cortes/nuevo"
          className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          + Registrar corte
        </Link>
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          No se pudieron cargar los datos: {error.message}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Hoy"
              value={formatMoney(totalToday)}
              hint={`${cantidadHoy} corte${cantidadHoy === 1 ? "" : "s"}`}
            />
            <StatCard label="Ultimos 7 dias" value={formatMoney(totalSemana)} />
            <StatCard label="Este mes" value={formatMoney(totalMes)} />
          </div>

          <section className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-3 text-lg font-semibold">
              Ganancias por barbero (este mes)
            </h2>
            {rankingBarberos.length === 0 ? (
              <p className="text-sm text-neutral-500">
                Todavia no hay cortes registrados este mes.
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
                {rankingBarberos.map((b) => (
                  <div
                    key={b.nombre}
                    className="flex items-center justify-between py-2"
                  >
                    <div>
                      <p className="font-medium">{b.nombre}</p>
                      <p className="text-xs text-neutral-500">
                        {b.cantidad} corte{b.cantidad === 1 ? "" : "s"}
                      </p>
                    </div>
                    <p className="font-semibold">{formatMoney(b.total)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Ultimos cortes</h2>
              <Link
                href="/cortes"
                className="text-sm font-medium text-neutral-600 hover:underline dark:text-neutral-300"
              >
                Ver todos
              </Link>
            </div>
            {!recentCuts || recentCuts.length === 0 ? (
              <p className="text-sm text-neutral-500">
                Todavia no hay cortes registrados.
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
                {recentCuts.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {c.barbers?.name ?? "Sin asignar"}
                        {c.services?.name ? ` · ${c.services.name}` : ""}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {formatDateLabel(c.cut_date)}
                        {c.client_name ? ` · ${c.client_name}` : ""}
                      </p>
                    </div>
                    <p className="font-semibold">{formatMoney(Number(c.amount))}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}
