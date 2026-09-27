const ADDRESS_VISIBLE_CHARS = 4;
const HASH_VISIBLE_CHARS = 6;

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export function formatDateTime(date: Date): string {
  return dateTimeFormatter.format(date);
}

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

export function shortenAddress(address: string): string {
  return shorten(address, ADDRESS_VISIBLE_CHARS);
}

export function shortenHash(hash: string): string {
  return shorten(hash, HASH_VISIBLE_CHARS);
}

function shorten(value: string, visibleChars: number): string {
  const prefixLength = visibleChars + 2;
  if (value.length <= prefixLength + visibleChars) return value;
  return `${value.slice(0, prefixLength)}…${value.slice(-visibleChars)}`;
}
