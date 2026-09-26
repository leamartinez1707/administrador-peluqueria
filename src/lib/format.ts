const numberFormatter = new Intl.NumberFormat("es-UY", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatMoney(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  return `${sign}$${numberFormatter.format(Math.abs(amount))}`;
}

export function todayISO(): string {
  return new Date().toLocaleDateString("sv-SE");
}

export function formatDateLabel(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}
