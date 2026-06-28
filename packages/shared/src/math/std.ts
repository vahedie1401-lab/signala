import { average } from "./average";

export function std(values: number[]) {
  if (values.length < 2) return 0;

  const avg = average(values);

  const variance = average(values.map((v) => (v - avg) ** 2));

  return Math.sqrt(variance);
}
