export type CompensationType = "percentage" | "fixed_daily";

export type BarberCompensation = {
  compensation_type: string;
  commission_percentage: number;
  daily_fee: number;
};

/**
 * Neto para el barbero en un periodo:
 * - "percentage": el barbero se queda con commission_percentage% de lo generado.
 * - "fixed_daily": el barbero paga daily_fee por cada dia que curto (dia con al
 *   menos un corte cargado) y se queda con el resto.
 */
export function calcBarberNet(
  comp: BarberCompensation,
  gross: number,
  daysWorked: number
): number {
  if (comp.compensation_type === "fixed_daily") {
    return gross - comp.daily_fee * daysWorked;
  }
  return gross * (comp.commission_percentage / 100);
}

export function compensationSummary(comp: BarberCompensation): string {
  if (comp.compensation_type === "fixed_daily") {
    return `Alquiler de silla: $${comp.daily_fee}/dia`;
  }
  return `Comision: ${comp.commission_percentage}% para el barbero`;
}
