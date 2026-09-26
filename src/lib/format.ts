const numberFormatter = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatMoney(amount: number): string {
  return `$${numberFormatter.format(amount)}`;
}

export function todayISO(): string {
  return new Date().toLocaleDateString("sv-SE");
}

export function formatDateLabel(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}
