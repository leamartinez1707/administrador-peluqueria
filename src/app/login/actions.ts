"use server";

import { redirect } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/server";
import { verifyPin } from "@/lib/pin";
import { setSession, clearSession } from "@/lib/auth";

export type ActionResult = { error?: string };

export async function login(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const personType = String(formData.get("personType") || "");
  const personId = String(formData.get("personId") || "");
  const pin = String(formData.get("pin") || "");

  if (!personType || !personId) {
    return { error: "Elegi quien sos para iniciar sesion." };
  }
  if (!pin) {
    return { error: "Ingresa tu PIN." };
  }

  const supabase = getSupabaseClient();

  if (personType === "admin") {
    const { data } = await supabase
      .from("admins")
      .select("id, name, pin_hash, active")
      .eq("id", personId)
      .single();

    if (!data || !data.active || !(await verifyPin(pin, data.pin_hash))) {
      return { error: "PIN incorrecto." };
    }

    await setSession({ role: "admin", id: data.id, name: data.name });
  } else {
    const { data } = await supabase
      .from("barbers")
      .select("id, name, pin_hash, active")
      .eq("id", personId)
      .single();

    if (
      !data ||
      !data.active ||
      !data.pin_hash ||
      !(await verifyPin(pin, data.pin_hash))
    ) {
      return { error: "PIN incorrecto." };
    }

    await setSession({ role: "barbero", id: data.id, name: data.name });
  }

  redirect("/");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
