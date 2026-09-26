import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { BarberForm } from "../BarberForm";

export const dynamic = "force-dynamic";

export default async function NewBarberPage() {
  await requireAdmin();

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div>
        <Link
          href="/barberos"
          className="text-sm text-neutral-500 hover:underline"
        >
          ← Volver a barberos
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Agregar barbero</h1>
      </div>
      <BarberForm mode="create" />
    </div>
  );
}
