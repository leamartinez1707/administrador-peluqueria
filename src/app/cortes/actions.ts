"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseClient } from "@/lib/supabase/server";

export type ActionResult = { error?: string };

export async function createCut(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const barberId = String(formData.get("barber_id") || "");
  const serviceId = String(formData.get("service_id") || "");
  const clientName = String(formData.get("client_name") || "").trim();
  const amountRaw = String(formData.get("amount") || "").replace(",", ".");
  const amount = Number(amountRaw);
  const paymentMethod = String(formData.get("payment_method") || "efectivo");
  const cutDate = String(formData.get("cut_date") || "");
  const notes = String(formData.get("notes") || "").trim();

  if (!barberId) {
    return { error: "Elegi el barbero que hizo el corte." };
  }
  if (!amountRaw || Number.isNaN(amount) || amount <= 0) {
    return { error: "Ingresa un monto valido." };
  }
  if (!cutDate) {
    return { error: "Elegi la fecha del corte." };
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.from("cuts").insert({
    barber_id: barberId,
    service_id: serviceId || null,
    client_name: clientName || null,
    amount,
    payment_method: paymentMethod,
    cut_date: cutDate,
    notes: notes || null,
  });

  if (error) {
    return { error: `No se pudo guardar el corte: ${error.message}` };
  }

  revalidatePath("/");
  revalidatePath("/cortes");
  return {};
}

export async function deleteCut(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = getSupabaseClient();
  await supabase.from("cuts").delete().eq("id", id);

  revalidatePath("/");
  revalidatePath("/cortes");
}
