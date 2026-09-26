"use client";

import { useActionState, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createCut, type ActionResult } from "./actions";

type Barber = { id: string; name: string };
type Service = { id: string; name: string; price: number };

const initialState: ActionResult = {};

export function CutForm({
  barbers,
  services,
  todayISO,
}: {
  barbers: Barber[];
  services: Service[];
  todayISO: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (prevState: ActionResult, formData: FormData) => {
      const result = await createCut(prevState, formData);
      if (!result.error) {
        router.push("/cortes");
        router.refresh();
      }
      return result;
    },
    initialState
  );

  const [serviceId, setServiceId] = useState("");
  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId]
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Barbero">
        <select
          name="barber_id"
          required
          className="input"
          defaultValue=""
        >
          <option value="" disabled>
            Elegi un barbero
          </option>
          {barbers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Servicio (opcional)">
        <select
          name="service_id"
          className="input"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
        >
          <option value="">Sin servicio / monto libre</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Monto">
        <input
          type="number"
          name="amount"
          step="0.01"
          min="0"
          required
          className="input"
          defaultValue={selectedService ? selectedService.price : undefined}
          key={selectedService?.id ?? "sin-servicio"}
          placeholder="0"
        />
      </Field>

      <Field label="Cliente (opcional)">
        <input
          type="text"
          name="client_name"
          className="input"
          placeholder="Nombre del cliente"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Fecha">
          <input
            type="date"
            name="cut_date"
            required
            defaultValue={todayISO}
            className="input"
          />
        </Field>

        <Field label="Pago">
          <select name="payment_method" className="input" defaultValue="efectivo">
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
            <option value="otro">Otro</option>
          </select>
        </Field>
      </div>

      <Field label="Notas (opcional)">
        <textarea name="notes" className="input" rows={2} />
      </Field>

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
        {pending ? "Guardando..." : "Guardar corte"}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-neutral-700 dark:text-neutral-200">
        {label}
      </span>
      {children}
    </label>
  );
}
