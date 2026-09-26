"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createBarber, updateBarber, type ActionResult } from "./actions";

const initialState: ActionResult = {};

export function BarberForm({
  mode,
  barberId,
  initial,
}: {
  mode: "create" | "edit";
  barberId?: string;
  initial?: { name: string; phone: string | null };
}) {
  const router = useRouter();
  const boundAction =
    mode === "edit" && barberId
      ? updateBarber.bind(null, barberId)
      : createBarber;

  const [state, formAction, pending] = useActionState(
    async (prevState: ActionResult, formData: FormData) => {
      const result = await boundAction(prevState, formData);
      if (!result.error) {
        router.push("/barberos");
        router.refresh();
      }
      return result;
    },
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-neutral-700 dark:text-neutral-200">
          Nombre
        </span>
        <input
          type="text"
          name="name"
          required
          defaultValue={initial?.name}
          className="input"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-neutral-700 dark:text-neutral-200">
          Telefono (opcional)
        </span>
        <input
          type="tel"
          name="phone"
          defaultValue={initial?.phone ?? ""}
          placeholder="Ej: 11 5555 5555"
          className="input"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-neutral-700 dark:text-neutral-200">
          {mode === "create" ? "PIN de acceso" : "Nuevo PIN (opcional)"}
        </span>
        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          name={mode === "create" ? "pin" : "new_pin"}
          required={mode === "create"}
          placeholder={
            mode === "create" ? "4 numeros" : "Dejalo vacio para no cambiarlo"
          }
          maxLength={6}
          className="input"
        />
      </label>

      {state.error ? (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        {pending
          ? "Guardando..."
          : mode === "create"
            ? "Agregar barbero"
            : "Guardar cambios"}
      </button>
    </form>
  );
}
