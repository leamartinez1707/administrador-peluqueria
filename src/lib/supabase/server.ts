import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

// MVP sin autenticacion: se usa la anon key directamente en el servidor.
// Las tablas tienen RLS con politicas publicas (ver migracion init_schema).
export function getSupabaseClient() {
  return createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    auth: { persistSession: false },
  });
}
