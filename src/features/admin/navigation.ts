import { LayoutDashboard } from "lucide-react";
import { sidebarResourceItems } from "./content/resource-config";

export const adminNavigation = [
  { group: "VISÃO GERAL", label: "Visão Geral", href: "", icon: LayoutDashboard },
  ...sidebarResourceItems,
] as const;
