import Link from "next/link";
import { Building2, ChevronDown } from "lucide-react";
import type { AdminTenantSummary } from "@/features/auth/server/admin-access";
import { cn } from "@/lib/utils";

type TenantSwitcherProps = {
  currentSlug: string;
  tenants: AdminTenantSummary[];
};

export function TenantSwitcher({ currentSlug, tenants }: TenantSwitcherProps) {
  const current = tenants.find((tenant) => tenant.slug === currentSlug);

  if (tenants.length <= 1) {
    return (
      <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-[var(--rf-text)]">
        <Building2 className="size-4 shrink-0 text-[var(--rf-primary)]" aria-hidden="true" />
        <span className="truncate">{current?.name ?? "Estabelecimento"}</span>
      </div>
    );
  }

  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-[var(--rf-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--rf-text)] shadow-sm">
        <Building2 className="size-4 shrink-0 text-[var(--rf-primary)]" aria-hidden="true" />
        <span className="max-w-[180px] truncate">
          {current?.name ?? "Selecionar estabelecimento"}
        </span>
        <ChevronDown
          className="size-4 shrink-0 transition group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-[var(--rf-border)] bg-white p-1 shadow-xl">
        {tenants.map((tenant) => (
          <Link
            key={tenant.id}
            href={`/admin/${tenant.slug}`}
            className={cn(
              "block rounded-lg px-3 py-2 text-sm text-[var(--rf-text)] hover:bg-blue-50",
              tenant.slug === currentSlug && "bg-blue-50 font-medium text-[var(--rf-primary)]",
            )}
          >
            {tenant.name}
          </Link>
        ))}
      </div>
    </details>
  );
}
