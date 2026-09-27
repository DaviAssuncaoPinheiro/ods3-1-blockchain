export function trimValues<Values extends Record<string, string>>(values: Values): Values {
  const entries = Object.entries(values).map(([key, value]) => [key, value.trim()]);
  return Object.fromEntries(entries) as Values;
}
