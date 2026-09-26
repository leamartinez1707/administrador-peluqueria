"use client";

import { useActionState, useRef } from "react";
import { createService, type ActionResult } from "./actions";

export function NewServiceForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (prevState: ActionResult, formData: FormData) => {
      const result = await createService(prevState, formData);
      if (!result.error) {
        formRef.current?.reset();
      }
      return result;
    },
    {}
  );

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row sm:items-end"
    >
      <label className="flex flex-1 flex-col gap-1 text-sm">
        <span className="font-medium">Servicio</span>
        <input
          type="text"
          name="name"
          placeholder="Ej: Corte clasico"
          required
          className="input"
        />
      </label>
      <label className="flex w-full flex-col gap-1 text-sm sm:w-32">
        <span className="font-medium">Precio</span>
        <input
          type="number"
          name="price"
          step="0.01"
          min="0"
          placeholder="0"
          required
          className="input"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        {pending ? "Agregando..." : "Agregar servicio"}
      </button>
      {state.error ? (
        <p className="text-sm text-red-700 sm:basis-full">{state.error}</p>
      ) : null}
    </form>
  );
}
