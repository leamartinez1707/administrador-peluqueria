"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseClient } from "@/lib/supabase/server";

export type ActionResult = { error?: string };

export async function createBarber(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const name = String(formData.get("name") || "").trim();
  if (!name) {
    return { error: "Ingresa el nombre del barbero." };
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.from("barbers").insert({ name });

  if (error) {
    return { error: `No se pudo crear el barbero: ${error.message}` };
  }

  revalidatePath("/barberos");
  revalidatePath("/cortes");
  revalidatePath("/");
  return {};
}

export async function toggleBarberActive(formData: FormData) {
  const id = String(formData.get("id") || "");
  const active = formData.get("active") === "true";
  if (!id) return;

  const supabase = getSupabaseClient();
  await supabase.from("barbers").update({ active: !active }).eq("id", id);

  revalidatePath("/barberos");
  revalidatePath("/cortes");
}
