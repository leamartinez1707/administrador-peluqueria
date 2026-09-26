import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/supabase/server";
import { BarberForm } from "../../BarberForm";

export const dynamic = "force-dynamic";

export default async function EditBarberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const supabase = getSupabaseClient();
  const { data: barber } = await supabase
    .from("barbers")
    .select(
      "id, name, phone, compensation_type, commission_percentage, daily_fee"
    )
    .eq("id", id)
    .single();

  if (!barber) notFound();

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div>
        <Link
          href="/barberos"
          className="text-sm text-neutral-500 hover:underline"
        >
          ← Volver a barberos
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Editar barbero</h1>
      </div>
      <BarberForm
        mode="edit"
        barberId={barber.id}
        initial={{
          name: barber.name,
          phone: barber.phone,
          compensation_type: barber.compensation_type,
          commission_percentage: Number(barber.commission_percentage),
          daily_fee: Number(barber.daily_fee),
        }}
      />
    </div>
  );
}
