import { redirect } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");

  const supabase = getSupabaseClient();
  const [{ data: admins }, { data: barbers }] = await Promise.all([
    supabase.from("admins").select("id, name").eq("active", true).order("name"),
    supabase
      .from("barbers")
      .select("id, name")
      .eq("active", true)
      .order("name"),
  ]);

  const people = [
    ...(admins ?? []).map((a) => ({ ...a, type: "admin" as const })),
    ...(barbers ?? []).map((b) => ({ ...b, type: "barbero" as const })),
  ];

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 pt-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold">💈 Classic Barber Studio</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Elegi tu usuario para ingresar
        </p>
      </div>
      <LoginForm people={people} />
    </div>
  );
}
