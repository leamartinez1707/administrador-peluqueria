"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { hashPin, isValidPin } from "@/lib/pin";

export type ActionResult = { error?: string };

export async function createBarber(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const pin = String(formData.get("pin") || "").trim();

  if (!name) {
    return { error: "Ingresa el nombre del barbero." };
  }
  if (!isValidPin(pin)) {
    return { error: "El PIN debe tener entre 4 y 6 numeros." };
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.from("barbers").insert({
    name,
    phone: phone || null,
    pin_hash: await hashPin(pin),
  });

  if (error) {
    return { error: `No se pudo crear el barbero: ${error.message}` };
  }

  revalidatePath("/barberos");
  revalidatePath("/cortes");
  revalidatePath("/");
  return {};
}

export async function updateBarber(
  id: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const newPin = String(formData.get("new_pin") || "").trim();

  if (!name) {
    return { error: "Ingresa el nombre del barbero." };
  }
  if (newPin && !isValidPin(newPin)) {
    return { error: "El PIN debe tener entre 4 y 6 numeros." };
  }

  const update: { name: string; phone: string | null; pin_hash?: string } = {
    name,
    phone: phone || null,
  };
  if (newPin) {
    update.pin_hash = await hashPin(newPin);
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.from("barbers").update(update).eq("id", id);

  if (error) {
    return { error: `No se pudo actualizar el barbero: ${error.message}` };
  }

  revalidatePath("/barberos");
  revalidatePath("/cortes");
  revalidatePath("/");
  return {};
}

export async function toggleBarberActive(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const active = formData.get("active") === "true";
  if (!id) return;

  const supabase = getSupabaseClient();
  await supabase.from("barbers").update({ active: !active }).eq("id", id);

  revalidatePath("/barberos");
  revalidatePath("/cortes");
}
