import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/supabase/server";
import { ServiceForm } from "../../ServiceForm";

export const dynamic = "force-dynamic";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const supabase = getSupabaseClient();
  const { data: service } = await supabase
    .from("services")
    .select("id, name, price")
    .eq("id", id)
    .single();

  if (!service) notFound();

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div>
        <Link
          href="/servicios"
          className="text-sm text-neutral-500 hover:underline"
        >
          ← Volver a servicios
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Editar servicio</h1>
      </div>
      <ServiceForm
        mode="edit"
        serviceId={service.id}
        initial={{ name: service.name, price: Number(service.price) }}
      />
    </div>
  );
}
