import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";
import { CutForm } from "../../CutForm";

export const dynamic = "force-dynamic";

export default async function EditCutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const supabase = getSupabaseClient();
  const { data: cut } = await supabase
    .from("cuts")
    .select(
      "id, barber_id, service_id, client_name, amount, payment_method, cut_date, notes, barbers(name)"
    )
    .eq("id", id)
    .single();

  if (!cut) notFound();

  const canEdit =
    session.role === "admin" ||
    (session.role === "barbero" && cut.barber_id === session.id);
  if (!canEdit) notFound();

  const { data: services } = await supabase
    .from("services")
    .select("id, name, price")
    .eq("active", true)
    .order("name");

  let barbers: { id: string; name: string }[] = [];
  if (session.role === "admin") {
    const { data } = await supabase
      .from("barbers")
      .select("id, name")
      .eq("active", true)
      .order("name");
    barbers = data ?? [];
    if (!barbers.some((b) => b.id === cut.barber_id) && cut.barbers?.name) {
      barbers = [...barbers, { id: cut.barber_id, name: cut.barbers.name }];
    }
  }

  const initial = {
    barber_id: cut.barber_id,
    service_id: cut.service_id,
    client_name: cut.client_name,
    amount: Number(cut.amount),
    payment_method: cut.payment_method,
    cut_date: cut.cut_date,
    notes: cut.notes,
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div>
        <Link
          href="/cortes"
          className="text-sm text-neutral-500 hover:underline"
        >
          ← Volver a cortes
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Editar corte</h1>
      </div>

      {session.role === "barbero" ? (
        <CutForm
          mode="edit"
          cutId={cut.id}
          fixedBarber={{ id: session.id, name: session.name }}
          barbers={[]}
          services={services ?? []}
          todayISO={cut.cut_date}
          initial={initial}
        />
      ) : (
        <CutForm
          mode="edit"
          cutId={cut.id}
          barbers={barbers}
          services={services ?? []}
          todayISO={cut.cut_date}
          initial={initial}
        />
      )}
    </div>
  );
}
