"use client";

import Link from "next/link";

import { LOCAL_NETWORK_NAME } from "@/constants/network";
import { describeRoles, Role } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { useWallet } from "@/components/providers/WalletProvider";
import { Button } from "@/components/ui/Button";
import { DetailList } from "@/components/ui/DetailList";
import { MonoValue } from "@/components/ui/MonoValue";
import { Panel } from "@/components/ui/Panel";
import { ArrowRightIcon } from "@/components/ui/icons";

const ROLE_OPERATIONS = [
  { role: Role.Manufacturer, href: ROUTES.registerProduct, label: "Register a product" },
  { role: Role.Retailer, href: ROUTES.registerSale, label: "Register a sale" },
  { role: Role.ServiceCenter, href: ROUTES.registerMaintenance, label: "Register maintenance" },
  { role: Role.Admin, href: ROUTES.roles, label: "Authorize participants" },
];

export function AccountPanel() {
  const wallet = useWallet();

  if (wallet.status !== "connected" || !wallet.account) {
    return (
      <Panel title="Your account">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-lg text-sm text-ink-muted">
            No wallet connected. Consumers can look up any product without a wallet; participants
            connect MetaMask to register operations.
          </p>
          {wallet.status !== "unavailable" && (
            <Button onClick={wallet.connect} isLoading={wallet.status === "connecting"}>
              Connect Wallet
            </Button>
          )}
        </div>
      </Panel>
    );
  }

  const operations = ROLE_OPERATIONS.filter((operation) => wallet.hasRole(operation.role));

  return (
    <Panel title="Your account">
      <DetailList
        items={[
          { label: "Connected wallet", value: <MonoValue value={wallet.account} /> },
          { label: "Current role", value: describeRoles(wallet.roles) },
          {
            label: "Wallet network",
            value: wallet.isOnExpectedNetwork
              ? `${LOCAL_NETWORK_NAME} (chain ${wallet.chainId})`
              : `Wrong network (chain ${wallet.chainId})`,
          },
          {
            label: "Available operations",
            value:
              operations.length === 0 ? (
                <Link href={ROUTES.products} className="text-accent hover:text-accent-strong">
                  Look up products
                </Link>
              ) : (
                <ul className="flex flex-col gap-1">
                  {operations.map((operation) => (
                    <li key={operation.href}>
                      <Link
                        href={operation.href}
                        className="inline-flex items-center gap-1.5 text-accent hover:text-accent-strong"
                      >
                        {operation.label}
                        <ArrowRightIcon width={16} height={16} />
                      </Link>
                    </li>
                  ))}
                </ul>
              ),
          },
        ]}
      />
    </Panel>
  );
}
