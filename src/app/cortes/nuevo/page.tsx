import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";
import { CutForm } from "../CutForm";

export const dynamic = "force-dynamic";

function todayISO(): string {
  return new Date().toLocaleDateString("sv-SE");
}

export default async function NewCutPage() {
  const session = await requireSession();
  const supabase = getSupabaseClient();

  const { data: services } = await supabase
    .from("services")
    .select("id, name, price")
    .eq("active", true)
    .order("name");

  if (session.role === "barbero") {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <div>
          <Link
            href="/cortes"
            className="text-sm text-neutral-500 hover:underline"
          >
            ← Volver a cortes
          </Link>
          <h1 className="mt-1 text-2xl font-bold">Registrar corte</h1>
        </div>
        <CutForm
          fixedBarber={{ id: session.id, name: session.name }}
          barbers={[]}
          services={services ?? []}
          todayISO={todayISO()}
        />
      </div>
    );
  }

  const { data: barbers } = await supabase
    .from("barbers")
    .select("id, name")
    .eq("active", true)
    .order("name");

  const hasBarbers = (barbers?.length ?? 0) > 0;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div>
        <Link
          href="/cortes"
          className="text-sm text-neutral-500 hover:underline"
        >
          ← Volver a cortes
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Registrar corte</h1>
      </div>

      {!hasBarbers ? (
        <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          Todavia no cargaste barberos.{" "}
          <Link href="/barberos" className="font-semibold underline">
            Agrega uno primero
          </Link>
          .
        </p>
      ) : (
        <CutForm
          barbers={barbers ?? []}
          services={services ?? []}
          todayISO={todayISO()}
        />
      )}
    </div>
  );
}
