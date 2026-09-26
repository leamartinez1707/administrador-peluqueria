"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export type ActionResult = { error?: string };

export async function createService(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const priceRaw = String(formData.get("price") || "").replace(",", ".");
  const price = Number(priceRaw);

  if (!name) {
    return { error: "Ingresa el nombre del servicio." };
  }
  if (!priceRaw || Number.isNaN(price) || price < 0) {
    return { error: "Ingresa un precio valido." };
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.from("services").insert({ name, price });

  if (error) {
    return { error: `No se pudo crear el servicio: ${error.message}` };
  }

  revalidatePath("/servicios");
  revalidatePath("/cortes");
  return {};
}

export async function updateService(
  id: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const priceRaw = String(formData.get("price") || "").replace(",", ".");
  const price = Number(priceRaw);

  if (!name) {
    return { error: "Ingresa el nombre del servicio." };
  }
  if (!priceRaw || Number.isNaN(price) || price < 0) {
    return { error: "Ingresa un precio valido." };
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("services")
    .update({ name, price })
    .eq("id", id);

  if (error) {
    return { error: `No se pudo actualizar el servicio: ${error.message}` };
  }

  revalidatePath("/servicios");
  revalidatePath("/cortes");
  return {};
}

export async function toggleServiceActive(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const active = formData.get("active") === "true";
  if (!id) return;

  const supabase = getSupabaseClient();
  await supabase.from("services").update({ active: !active }).eq("id", id);

  revalidatePath("/servicios");
  revalidatePath("/cortes");
}
