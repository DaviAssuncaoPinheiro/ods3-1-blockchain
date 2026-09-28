"use client";

import Link from "next/link";

import { LOCAL_NETWORK_NAME } from "@/constants/network";
import { describeRoles, Role } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { useWallet } from "@/components/providers/WalletProvider";
import { Button } from "@/components/ui/Button";
import { DetailList } from "@/components/ui/DetailList";
import { ParticipantValue } from "@/components/participants/ParticipantValue";
import { Panel } from "@/components/ui/Panel";
import { ArrowRightIcon } from "@/components/ui/icons";

const ROLE_OPERATIONS = [
  { role: Role.Manufacturer, href: ROUTES.registerProduct, label: "Registrar um produto" },
  { role: Role.Retailer, href: ROUTES.registerSale, label: "Registrar uma venda" },
  { role: Role.ServiceCenter, href: ROUTES.registerMaintenance, label: "Registrar manutenção" },
  { role: Role.Admin, href: ROUTES.roles, label: "Autorizar participantes" },
];

export function AccountPanel() {
  const wallet = useWallet();

  if (wallet.status !== "connected" || !wallet.account) {
    return (
      <Panel title="Sua conta">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-lg text-sm text-ink-muted">
            Nenhuma carteira conectada. Consumidores podem consultar qualquer produto sem carteira;
            participantes conectam a MetaMask para registrar operações.
          </p>
          {wallet.status !== "unavailable" && (
            <Button onClick={wallet.connect} isLoading={wallet.status === "connecting"}>
              Conectar carteira
            </Button>
          )}
        </div>
      </Panel>
    );
  }

  const operations = ROLE_OPERATIONS.filter((operation) => wallet.hasRole(operation.role));

  return (
    <Panel title="Sua conta">
      <DetailList
        items={[
          { label: "Carteira conectada", value: <ParticipantValue address={wallet.account} /> },
          { label: "Papel atual", value: describeRoles(wallet.roles) },
          {
            label: "Rede da carteira",
            value: wallet.isOnExpectedNetwork
              ? `${LOCAL_NETWORK_NAME} (chain ${wallet.chainId})`
              : `Rede errada (chain ${wallet.chainId})`,
          },
          {
            label: "Operações disponíveis",
            value:
              operations.length === 0 ? (
                <Link href={ROUTES.products} className="text-accent hover:text-accent-strong">
                  Consultar produtos
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
