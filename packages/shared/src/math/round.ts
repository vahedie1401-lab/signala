export function round(
  value: number,

  precision = 2,
) {
  const p = Math.pow(10, precision);

  return Math.round(value * p) / p;
}
