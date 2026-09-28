"use client";

import { useParticipants } from "@/components/providers/ParticipantsProvider";
import { MonoValue } from "@/components/ui/MonoValue";

interface ParticipantValueProps {
  address: string;
  /** Shortens the address, for tables. */
  isCompact?: boolean;
  className?: string;
}

/** Shows the participant's registered name with its address, so consumers can tell who acted. */
export function ParticipantValue({ address, isCompact = false, className = "" }: ParticipantValueProps) {
  const { nameOf } = useParticipants();
  const name = nameOf(address);
  const addressFormat = isCompact ? "address" : "full";

  if (!name) return <MonoValue value={address} format={addressFormat} className={className} />;

  return (
    <span className={`inline-flex min-w-0 flex-col ${className}`}>
      <span className="font-medium">{name}</span>
      <MonoValue value={address} format={addressFormat} className="text-xs text-ink-muted" />
    </span>
  );
}
