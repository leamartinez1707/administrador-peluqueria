"use client";

import { useActionState, useRef } from "react";

type ActionResult = { error?: string };

export function NewItemForm({
  action,
  fieldName,
  placeholder,
  submitLabel,
}: {
  action: (prevState: ActionResult, formData: FormData) => Promise<ActionResult>;
  fieldName: string;
  placeholder: string;
  submitLabel: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (prevState: ActionResult, formData: FormData) => {
      const result = await action(prevState, formData);
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
      className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row sm:items-center"
    >
      <input
        type="text"
        name={fieldName}
        placeholder={placeholder}
        required
        className="input flex-1"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        {pending ? "Agregando..." : submitLabel}
      </button>
      {state.error ? (
        <p className="text-sm text-red-700 sm:basis-full">{state.error}</p>
      ) : null}
    </form>
  );
}
