"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavigation } from "@/features/admin/navigation";
import { cn } from "@/lib/utils";

type AdminNavProps = {
  tenantSlug: string;
  mobile?: boolean;
};

function resolveItemHref(tenantSlug: string, href: string) {
  return href ? `/admin/${tenantSlug}/${href}` : `/admin/${tenantSlug}`;
}

export function AdminNav({ tenantSlug }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <>
      {adminNavigation.map((item, index) => {
        const Icon = item.icon;
        const href = resolveItemHref(tenantSlug, item.href);
        const isActive =
          pathname === href || (item.href !== "" && pathname.startsWith(`${href}/`));

        const previous = adminNavigation[index - 1];
        const groupLabel = previous?.group !== item.group ? <p className={cn("px-3 pb-2 text-[10px] font-semibold tracking-[.16em] text-blue-200/60", index === 0 ? "pt-0" : "pt-5")}>{item.group}</p> : null;
        const baseClassName = "flex h-10 items-center gap-3 rounded-lg px-3 text-sm";

        return (
          <div key={item.label}>{groupLabel}<Link href={href} className={cn(baseClassName, isActive ? "bg-[var(--rf-electric)] font-semibold text-white shadow-lg shadow-blue-950/20" : "text-blue-100/80 hover:bg-white/10 hover:text-white")}><Icon className="size-4" aria-hidden="true" /><span>{item.label}</span></Link></div>
        );
      })}
    </>
  );
}
