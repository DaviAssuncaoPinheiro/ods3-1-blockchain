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

export async function fetchRoleGrants(): Promise<RoleGrant[]> {
  const contract = getReadContract();
  const events = await contract.queryFilter(contract.filters.RoleGranted(), DEPLOYMENT_BLOCK);

  return events
    .filter((event): event is EventLog => "args" in event)
    .map((event) => {
      const role = toRole(event.args.role);
      return {
        account: event.args.account,
        roleLabel: role === null ? "Unknown" : ROLE_LABELS[role],
        grantedBy: event.args.grantedBy,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
      };
    })
    .reverse();
}
