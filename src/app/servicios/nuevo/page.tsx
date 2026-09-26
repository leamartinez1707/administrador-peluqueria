import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { ServiceForm } from "../ServiceForm";

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
  await requireAdmin();

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div>
        <Link
          href="/servicios"
          className="text-sm text-neutral-500 hover:underline"
        >
          ← Volver a servicios
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Agregar servicio</h1>
      </div>
      <ServiceForm mode="create" />
    </div>
  );
}
