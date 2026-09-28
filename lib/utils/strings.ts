export function trimValues<Values extends Record<string, string>>(values: Values): Values {
  const entries = Object.entries(values).map(([key, value]) => [key, value.trim()]);
  return Object.fromEntries(entries) as Values;
}

const utf8Encoder = new TextEncoder();

/** Size of the text in UTF-8 bytes, the unit the contract uses for its limits. */
export function byteLength(value: string): number {
  return utf8Encoder.encode(value).length;
}
