"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { hashPin, isValidPin } from "@/lib/pin";

export type ActionResult = { error?: string };

function parseCompensation(formData: FormData) {
  const compensationType = String(
    formData.get("compensation_type") || "percentage"
  );

  if (compensationType === "fixed_daily") {
    const dailyFeeRaw = String(formData.get("daily_fee") || "").replace(
      ",",
      "."
    );
    const dailyFee = Number(dailyFeeRaw);
    if (!dailyFeeRaw || Number.isNaN(dailyFee) || dailyFee < 0) {
      return { error: "Ingresa un monto de silla valido." } as const;
    }
    return {
      values: {
        compensation_type: "fixed_daily" as const,
        daily_fee: dailyFee,
        commission_percentage: 0,
      },
    } as const;
  }

  const pctRaw = String(formData.get("commission_percentage") || "");
  const pct = Number(pctRaw);
  if (!pctRaw || Number.isNaN(pct) || pct < 0 || pct > 100) {
    return { error: "El porcentaje debe estar entre 0 y 100." } as const;
  }
  return {
    values: {
      compensation_type: "percentage" as const,
      commission_percentage: pct,
      daily_fee: 0,
    },
  } as const;
}

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

  const compensation = parseCompensation(formData);
  if ("error" in compensation) return { error: compensation.error };

  const supabase = getSupabaseClient();
  const { error } = await supabase.from("barbers").insert({
    name,
    phone: phone || null,
    pin_hash: await hashPin(pin),
    ...compensation.values,
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

  const compensation = parseCompensation(formData);
  if ("error" in compensation) return { error: compensation.error };

  const update: {
    name: string;
    phone: string | null;
    pin_hash?: string;
    compensation_type: string;
    commission_percentage: number;
    daily_fee: number;
  } = {
    name,
    phone: phone || null,
    ...compensation.values,
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
