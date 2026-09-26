"use client";

import { useActionState } from "react";
import { updateAccount, type ActionResult } from "./actions";

const initialState: ActionResult = {};

export function AccountForm({ name }: { name: string }) {
  const [state, formAction, pending] = useActionState(
    updateAccount,
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
          defaultValue={name}
          className="input"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-neutral-700 dark:text-neutral-200">
          Nuevo PIN (opcional)
        </span>
        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          name="new_pin"
          placeholder="Dejalo vacio para no cambiarlo"
          maxLength={6}
          className="input"
        />
      </label>

      {state.error ? (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          Datos actualizados.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        {pending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
