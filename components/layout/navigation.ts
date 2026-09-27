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
    title: "Overview",
    items: [
      { href: ROUTES.dashboard, label: "Dashboard", icon: DashboardIcon },
      { href: ROUTES.products, label: "Product Lookup", icon: SearchIcon },
      { href: ROUTES.explorer, label: "Blockchain Explorer", icon: BlocksIcon },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: ROUTES.registerProduct, label: "Register Product", icon: PackageIcon },
      { href: ROUTES.registerSale, label: "Register Sale", icon: TagIcon },
      { href: ROUTES.registerMaintenance, label: "Register Maintenance", icon: WrenchIcon },
    ],
  },
  {
    title: "Administration",
    items: [{ href: ROUTES.roles, label: "Participants", icon: KeyIcon }],
  },
];
