const MILLISECONDS_PER_SECOND = 1_000;

export function fromUnixSeconds(seconds: bigint | number): Date {
  return new Date(Number(seconds) * MILLISECONDS_PER_SECOND);
}

export function fromOptionalUnixSeconds(seconds: bigint): Date | null {
  return seconds === 0n ? null : fromUnixSeconds(seconds);
}
