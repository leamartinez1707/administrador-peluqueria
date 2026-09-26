"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseClient } from "@/lib/supabase/server";
import { getSession, setSession } from "@/lib/auth";
import { hashPin, isValidPin } from "@/lib/pin";

export type ActionResult = { error?: string; success?: boolean };

export async function updateAccount(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "Tu sesion expiro, volve a ingresar." };

  const name = String(formData.get("name") || "").trim();
  const newPin = String(formData.get("new_pin") || "").trim();

  if (!name) {
    return { error: "Ingresa tu nombre." };
  }
  if (newPin && !isValidPin(newPin)) {
    return { error: "El PIN debe tener entre 4 y 6 numeros." };
  }

  const table = session.role === "admin" ? "admins" : "barbers";
  const supabase = getSupabaseClient();

  const update: { name: string; pin_hash?: string } = { name };
  if (newPin) {
    update.pin_hash = await hashPin(newPin);
  }

  const { error } = await supabase
    .from(table)
    .update(update)
    .eq("id", session.id);

  if (error) {
    return { error: `No se pudo actualizar: ${error.message}` };
  }

  await setSession({ ...session, name });

  revalidatePath("/cuenta");
  revalidatePath("/");
  return { success: true };
}
