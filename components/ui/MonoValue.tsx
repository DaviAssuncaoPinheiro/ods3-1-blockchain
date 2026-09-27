import { shortenAddress, shortenHash } from "@/lib/utils/format";

type MonoFormat = "full" | "address" | "hash";

interface MonoValueProps {
  value: string;
  format?: MonoFormat;
  className?: string;
}

const FORMATTERS: Record<MonoFormat, (value: string) => string> = {
  full: (value) => value,
  address: shortenAddress,
  hash: shortenHash,
};

export function MonoValue({ value, format = "full", className = "" }: MonoValueProps) {
  return (
    <span title={value} className={`font-mono text-[0.95em] break-all ${className}`}>
      {FORMATTERS[format](value)}
    </span>
  );
}
