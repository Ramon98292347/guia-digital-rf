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

export function AdminNav({ tenantSlug, mobile = false }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <>
      {adminNavigation.map((item) => {
        const Icon = item.icon;
        const href = resolveItemHref(tenantSlug, item.href);
        const isActive =
          pathname === href || (item.href !== "" && pathname.startsWith(`${href}/`));

        const baseClassName = mobile
          ? "flex h-9 items-center gap-2 rounded-md px-3 text-sm"
          : "flex h-9 items-center gap-2 rounded-md px-3 text-sm";

        if (!item.enabled) {
          return (
            <span
              key={item.label}
              className={cn(baseClassName, "text-muted-foreground opacity-60")}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span>{item.label}</span>
            </span>
          );
        }

        return (
          <Link
            key={item.label}
            href={href}
            className={cn(
              baseClassName,
              isActive
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}
