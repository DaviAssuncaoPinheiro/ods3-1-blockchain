import { UserFacingError } from "@/lib/blockchain/errors";

import { byteLength } from "./strings";

/**
 * Mirrors the contract text rules (required, at most `maxBytes` UTF-8 bytes) so invalid input
 * is rejected before the wallet asks for a signature. Values must already be trimmed.
 */
export function requireValidText(value: string, label: string, maxBytes: number): void {
  if (value.length === 0) throw new UserFacingError(`O campo "${label}" é obrigatório.`);
  if (byteLength(value) > maxBytes) {
    throw new UserFacingError(
      `O campo "${label}" deve ter no máximo ${maxBytes} bytes (letras acentuadas contam como 2).`,
    );
  }
}
