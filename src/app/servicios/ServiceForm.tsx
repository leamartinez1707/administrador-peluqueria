"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createService, updateService, type ActionResult } from "./actions";

const initialState: ActionResult = {};

export function ServiceForm({
  mode,
  serviceId,
  initial,
}: {
  mode: "create" | "edit";
  serviceId?: string;
  initial?: { name: string; price: number };
}) {
  const router = useRouter();
  const boundAction =
    mode === "edit" && serviceId
      ? updateService.bind(null, serviceId)
      : createService;

  const [state, formAction, pending] = useActionState(
    async (prevState: ActionResult, formData: FormData) => {
      const result = await boundAction(prevState, formData);
      if (!result.error) {
        router.push("/servicios");
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
          Servicio
        </span>
        <input
          type="text"
          name="name"
          required
          defaultValue={initial?.name}
          placeholder="Ej: Corte clasico"
          className="input"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-neutral-700 dark:text-neutral-200">
          Precio
        </span>
        <input
          type="number"
          name="price"
          step="0.01"
          min="0"
          required
          defaultValue={initial?.price}
          placeholder="0"
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
            ? "Agregar servicio"
            : "Guardar cambios"}
      </button>
    </form>
  );
}
