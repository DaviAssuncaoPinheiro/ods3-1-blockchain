import type { EventLog } from "ethers";

import { ALL_ROLES, ROLE_LABELS, toRole, type Role } from "@/constants/roles";
import { DEPLOYMENT_BLOCK } from "@/lib/contracts/productPass";
import type { RoleGrant } from "@/types/blockchain";

import { getReadContract } from "./readProvider";

export async function fetchAccountRoles(account: string): Promise<Role[]> {
  const contract = getReadContract();
  const grants: boolean[] = await Promise.all(
    ALL_ROLES.map((role) => contract.hasRole(account, role)),
  );
  return ALL_ROLES.filter((_, index) => grants[index]);
}

/** Every role grant, newest first. */
export async function fetchRoleGrants(): Promise<RoleGrant[]> {
  const contract = getReadContract();
  const events = await contract.queryFilter(contract.filters.RoleGranted(), DEPLOYMENT_BLOCK);

  return events
    .filter((event): event is EventLog => "args" in event)
    .map((event) => {
      const role = toRole(event.args.role);
      return {
        account: event.args.account,
        participantName: event.args.participantName,
        roleLabel: role === null ? "Desconhecido" : ROLE_LABELS[role],
        grantedBy: event.args.grantedBy,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
      };
    })
    .reverse();
}

/**
 * Maps lowercase addresses to participant names. The contract keeps the name from the latest
 * grant, so the newest grant of each account wins.
 */
export function toParticipantNames(grantsNewestFirst: readonly RoleGrant[]): Map<string, string> {
  const names = new Map<string, string>();
  for (const grant of grantsNewestFirst) {
    const key = grant.account.toLowerCase();
    if (!names.has(key)) names.set(key, grant.participantName);
  }
  return names;
}
