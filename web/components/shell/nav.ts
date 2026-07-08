import {
  LayoutDashboard,
  LineChart,
  Users,
  Store,
  ShieldCheck,
  ClipboardCheck,
  ScrollText,
  KeyRound,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Marks admin-only sections (rendered behind the admin claim). */
  admin?: boolean;
};

/** Primary sidebar nav — the four PH-1 modules + admin. */
export const primaryNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Market Data", href: "/market", icon: LineChart },
  { label: "Membership", href: "/membership", icon: Users },
  { label: "Marketplace", href: "/marketplace", icon: Store },
];

export const adminNav: NavItem[] = [
  { label: "Members", href: "/admin/members", icon: ShieldCheck, admin: true },
  { label: "Verification", href: "/admin/verification", icon: ClipboardCheck, admin: true },
  { label: "Audit log", href: "/admin/audit", icon: ScrollText, admin: true },
  { label: "Roles (RBAC)", href: "/admin/roles", icon: KeyRound, admin: true },
];
