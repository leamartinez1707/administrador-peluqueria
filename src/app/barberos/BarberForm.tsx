"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { createBarber, updateBarber, type ActionResult } from "./actions";

const initialState: ActionResult = {};

type Initial = {
  name: string;
  phone: string | null;
  compensation_type: string;
  commission_percentage: number;
  daily_fee: number;
};

export function BarberForm({
  mode,
  barberId,
  initial,
}: {
  mode: "create" | "edit";
  barberId?: string;
  initial?: Initial;
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

  const [compensationType, setCompensationType] = useState(
    initial?.compensation_type ?? "percentage"
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

      <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
        <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">
          Como le paga la barberia
        </p>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-neutral-600 dark:text-neutral-300">
              Modalidad
            </span>
            <select
              name="compensation_type"
              className="input"
              value={compensationType}
              onChange={(e) => setCompensationType(e.target.value)}
            >
              <option value="percentage">Comision (% para el barbero)</option>
              <option value="fixed_daily">
                Alquiler de silla (monto fijo por dia)
              </option>
            </select>
          </label>

          {compensationType === "percentage" ? (
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-neutral-600 dark:text-neutral-300">
                % que se queda el barbero
              </span>
              <input
                type="number"
                name="commission_percentage"
                min="0"
                max="100"
                step="1"
                required
                defaultValue={initial?.commission_percentage ?? 50}
                className="input"
              />
              <span className="text-xs text-neutral-400">
                Ej: 50 = 50/50 con la barberia. 60 = el barbero se queda 60%.
              </span>
            </label>
          ) : (
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-neutral-600 dark:text-neutral-300">
                Monto fijo por dia trabajado ($)
              </span>
              <input
                type="number"
                name="daily_fee"
                min="0"
                step="1"
                required
                defaultValue={initial?.daily_fee ?? 0}
                className="input"
              />
              <span className="text-xs text-neutral-400">
                Se descuenta por cada dia en que el barbero cargo al menos un
                corte.
              </span>
            </label>
          )}
        </div>
      </div>

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
