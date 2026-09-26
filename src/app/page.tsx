import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";
import { formatMoney, formatDateLabel } from "@/lib/format";
import { calcBarberNet, type BarberCompensation } from "@/lib/compensation";

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

type PeriodAcc = { gross: number; days: Set<string> };

function emptyPeriod(): PeriodAcc {
  return { gross: 0, days: new Set() };
}

export default async function DashboardPage() {
  const session = await requireSession();
  const isAdmin = session.role === "admin";
  const supabase = getSupabaseClient();
  const today = isoDaysAgo(0);
  const weekStart = isoDaysAgo(6);
  const monthStart = monthStartISO();

  let monthQuery = supabase
    .from("cuts")
    .select(
      "id, amount, cut_date, barber_id, barbers(name, compensation_type, commission_percentage, daily_fee)"
    )
    .gte("cut_date", monthStart)
    .order("cut_date", { ascending: false })
    .order("created_at", { ascending: false });

  let recentQuery = supabase
    .from("cuts")
    .select("id, amount, cut_date, client_name, barbers(name), services(name)")
    .order("created_at", { ascending: false })
    .limit(8);

  if (!isAdmin) {
    monthQuery = monthQuery.eq("barber_id", session.id);
    recentQuery = recentQuery.eq("barber_id", session.id);
  }

  const { data: monthCuts, error } = await monthQuery;
  const { data: recentCuts } = await recentQuery;

  const cuts = monthCuts ?? [];

  type BarberAgg = {
    nombre: string;
    compensation: BarberCompensation;
    today: PeriodAcc;
    week: PeriodAcc;
    month: PeriodAcc;
    cantidadMes: number;
  };
  const porBarbero = new Map<string, BarberAgg>();

  for (const c of cuts) {
    const nombre = c.barbers?.name ?? "Sin asignar";
    const key = c.barber_id ?? nombre;
    const amount = Number(c.amount);
    const prev =
      porBarbero.get(key) ??
      ({
        nombre,
        compensation: {
          compensation_type: c.barbers?.compensation_type ?? "percentage",
          commission_percentage: Number(c.barbers?.commission_percentage ?? 50),
          daily_fee: Number(c.barbers?.daily_fee ?? 0),
        },
        today: emptyPeriod(),
        week: emptyPeriod(),
        month: emptyPeriod(),
        cantidadMes: 0,
      } satisfies BarberAgg);

    prev.month.gross += amount;
    prev.month.days.add(c.cut_date);
    prev.cantidadMes += 1;
    if (c.cut_date >= weekStart) {
      prev.week.gross += amount;
      prev.week.days.add(c.cut_date);
    }
    if (c.cut_date === today) {
      prev.today.gross += amount;
      prev.today.days.add(c.cut_date);
    }

    porBarbero.set(key, prev);
  }

  const barberoRows = Array.from(porBarbero.values()).map((b) => ({
    nombre: b.nombre,
    cantidadMes: b.cantidadMes,
    grossHoy: b.today.gross,
    grossSemana: b.week.gross,
    grossMes: b.month.gross,
    netHoy: calcBarberNet(b.compensation, b.today.gross, b.today.days.size),
    netSemana: calcBarberNet(
      b.compensation,
      b.week.gross,
      b.week.days.size
    ),
    netMes: calcBarberNet(b.compensation, b.month.gross, b.month.days.size),
  }));
  barberoRows.sort((a, b) => b.grossMes - a.grossMes);

  const totalToday = barberoRows.reduce((sum, b) => sum + b.grossHoy, 0);
  const totalSemana = barberoRows.reduce((sum, b) => sum + b.grossSemana, 0);
  const totalMes = barberoRows.reduce((sum, b) => sum + b.grossMes, 0);
  const cantidadHoy = cuts.filter((c) => c.cut_date === today).length;

  const netShopHoy = barberoRows.reduce(
    (sum, b) => sum + (b.grossHoy - b.netHoy),
    0
  );
  const netShopSemana = barberoRows.reduce(
    (sum, b) => sum + (b.grossSemana - b.netSemana),
    0
  );
  const netShopMes = barberoRows.reduce(
    (sum, b) => sum + (b.grossMes - b.netMes),
    0
  );

  const miNetoHoy = barberoRows[0]?.netHoy ?? 0;
  const miNetoSemana = barberoRows[0]?.netSemana ?? 0;
  const miNetoMes = barberoRows[0]?.netMes ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isAdmin ? "Panel general" : `Hola, ${session.name}`}
          </h1>
          <p className="text-sm text-neutral-500">
            {isAdmin
              ? "Resumen de la actividad de Classic Barber Studio"
              : "Resumen de tus cortes"}
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
              value={formatMoney(isAdmin ? totalToday : miNetoHoy)}
              hint={
                isAdmin
                  ? `${cantidadHoy} corte${cantidadHoy === 1 ? "" : "s"} · neto local ${formatMoney(netShopHoy)}`
                  : `generaste ${formatMoney(totalToday)}`
              }
            />
            <StatCard
              label="Ultimos 7 dias"
              value={formatMoney(isAdmin ? totalSemana : miNetoSemana)}
              hint={
                isAdmin
                  ? `neto local ${formatMoney(netShopSemana)}`
                  : `generaste ${formatMoney(totalSemana)}`
              }
            />
            <StatCard
              label="Este mes"
              value={formatMoney(isAdmin ? totalMes : miNetoMes)}
              hint={
                isAdmin
                  ? `neto local ${formatMoney(netShopMes)}`
                  : `generaste ${formatMoney(totalMes)}`
              }
            />
          </div>
          {!isAdmin ? (
            <p className="-mt-4 text-xs text-neutral-400">
              El monto grande es lo que te queda neto (despues de tu comision
              o el alquiler de silla). &quot;Generaste&quot; es el total bruto
              de tus cortes.
            </p>
          ) : null}

          {isAdmin ? (
            <section className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="mb-3 text-lg font-semibold">
                Ganancias por barbero (este mes)
              </h2>
              {barberoRows.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  Todavia no hay cortes registrados este mes.
                </p>
              ) : (
                <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
                  {barberoRows.map((b) => (
                    <div
                      key={b.nombre}
                      className="flex items-center justify-between py-2"
                    >
                      <div>
                        <p className="font-medium">{b.nombre}</p>
                        <p className="text-xs text-neutral-500">
                          {b.cantidadMes} corte{b.cantidadMes === 1 ? "" : "s"}{" "}
                          · genero {formatMoney(b.grossMes)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatMoney(b.netMes)}
                        </p>
                        <p className="text-xs text-neutral-500">
                          le queda a el/ella
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : null}

          <section className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {isAdmin ? "Ultimos cortes" : "Tus ultimos cortes"}
              </h2>
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
