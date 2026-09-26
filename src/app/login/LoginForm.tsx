"use client";

import { useActionState, useState } from "react";
import { login, type ActionResult } from "./actions";

type Person = { id: string; name: string; type: "admin" | "barbero" };

const initialState: ActionResult = {};

export function LoginForm({ people }: { people: Person[] }) {
  const [selected, setSelected] = useState<Person | null>(null);
  const [state, formAction, pending] = useActionState(login, initialState);

  if (!selected) {
    return (
      <div className="flex flex-col gap-2">
        {people.map((person) => (
          <button
            key={`${person.type}-${person.id}`}
            type="button"
            onClick={() => setSelected(person)}
            className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 text-left text-sm font-medium hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            <span>{person.name}</span>
            <span className="text-xs font-normal text-neutral-400">
              {person.type === "admin" ? "Administrador" : "Barbero"}
            </span>
          </button>
        ))}
        {people.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Todavia no hay usuarios cargados.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="personType" value={selected.type} />
      <input type="hidden" name="personId" value={selected.id} />

      <div className="flex items-center justify-between">
        <p className="text-sm">
          Hola, <span className="font-semibold">{selected.name}</span>
        </p>
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="text-xs text-neutral-500 hover:underline"
        >
          No soy yo
        </button>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-neutral-700 dark:text-neutral-200">
          PIN
        </span>
        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          name="pin"
          autoFocus
          required
          className="input text-center text-lg tracking-[0.5em]"
          maxLength={6}
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
        {pending ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
