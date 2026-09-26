import { requireSession } from "@/lib/auth";
import { AccountForm } from "./AccountForm";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await requireSession();

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Mi cuenta</h1>
        <p className="text-sm text-neutral-500">
          {session.role === "admin" ? "Administrador" : "Barbero"}
        </p>
      </div>
      <AccountForm name={session.name} />
    </div>
  );
}
