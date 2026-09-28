import { ROUTES } from "@/constants/routes";
import {
  BlocksIcon,
  DashboardIcon,
  KeyIcon,
  PackageIcon,
  SearchIcon,
  TagIcon,
  WrenchIcon,
} from "@/components/ui/icons";

interface NavigationItem {
  href: string;
  label: string;
  icon: typeof DashboardIcon;
}

interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

export const NAVIGATION: NavigationGroup[] = [
  {
    title: "Visão geral",
    items: [
      { href: ROUTES.dashboard, label: "Painel", icon: DashboardIcon },
      { href: ROUTES.products, label: "Consulta de produto", icon: SearchIcon },
      { href: ROUTES.explorer, label: "Explorador da blockchain", icon: BlocksIcon },
    ],
  },
  {
    title: "Operações",
    items: [
      { href: ROUTES.registerProduct, label: "Registrar produto", icon: PackageIcon },
      { href: ROUTES.registerSale, label: "Registrar venda", icon: TagIcon },
      { href: ROUTES.registerMaintenance, label: "Registrar manutenção", icon: WrenchIcon },
    ],
  },
  {
    title: "Administração",
    items: [{ href: ROUTES.roles, label: "Participantes", icon: KeyIcon }],
  },
];
