/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import Image from "next/image";
import { Building2, LogOut, Menu, UserRound, X } from "lucide-react";
import { logoutAction } from "@/features/auth/actions";
import {
  formatAdminRole,
  type AdminTenantContext,
} from "@/features/auth/server/admin-access";
import { Button } from "@/components/ui/button";
import { AdminNav } from "./admin-nav";
import { TenantSwitcher } from "./tenant-switcher";

type AdminShellProps = {
  context: AdminTenantContext;
  tenantLogoPath: string | null;
  children: ReactNode;
};

export function AdminShell({ context, tenantLogoPath, children }: AdminShellProps) {
  const userLabel = String(context.user.user_metadata.full_name ?? context.user.email ?? "Usuário");
  const initials = userLabel.split(" ").slice(0, 2).map((part: string) => part[0]).join("").toUpperCase();
  const isSuperAdmin = context.membership === null;

  return <div className="min-h-dvh rf-platform-page"><div className="flex min-h-dvh">
        <aside className="hidden w-72 shrink-0 flex-col bg-[var(--rf-navy)] text-white lg:flex">
          <div className="border-b border-white/10 px-5 py-5"><Image src="/brand/rf-logo-transparent.png" alt="RF Tecnologia" width={192} height={56} className="h-12 w-48 object-contain object-left" /><p className="mt-1 text-xs text-blue-100/65">Guia Digital</p><div className="mt-5 flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-3">{tenantLogoPath ? <img src={tenantLogoPath} alt={context.tenant.name} className="size-10 rounded-lg bg-white object-contain p-1" /> : <span className="flex size-10 items-center justify-center rounded-lg bg-white/10"><Building2 className="size-5 text-blue-200" /></span>}<div className="min-w-0"><p className="truncate text-sm font-semibold">{context.tenant.name}</p><p className="mt-0.5 text-xs text-blue-100/65">{isSuperAdmin ? "Modo Super Admin" : "Administrador"}</p></div></div></div>
          <nav className="flex-1 space-y-1 px-4 py-6"><AdminNav tenantSlug={context.tenant.slug} /></nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-[var(--rf-border)] bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <details className="group lg:hidden">
                <summary className="flex size-9 cursor-pointer list-none items-center justify-center rounded-lg border border-[var(--rf-border)] text-[var(--rf-navy)]"><Menu className="size-4 group-open:hidden" aria-hidden="true" /><X className="hidden size-4 group-open:block" aria-hidden="true" />
                </summary>
                <nav className="absolute left-4 right-4 top-14 z-20 rounded-xl bg-[var(--rf-navy)] p-3 shadow-xl">
                  <AdminNav tenantSlug={context.tenant.slug} mobile />
                </nav>
              </details>

              <TenantSwitcher
                currentSlug={context.tenant.slug}
                tenants={context.tenants}
              />

              <div className="flex min-w-0 items-center gap-3">
                <div className="hidden min-w-0 text-right sm:block"><p className="truncate text-sm font-medium text-[var(--rf-text)]">{userLabel}</p><p className="text-xs text-[var(--rf-muted)]">
                    {formatAdminRole(context.role)}
                  </p>
                </div>
                <div className="flex size-9 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[var(--rf-primary)] ring-1 ring-blue-100">{initials || <UserRound className="size-4" aria-hidden="true" />}</div>
                <form action={logoutAction}>
                  <Button type="submit" variant="ghost" size="icon" aria-label="Sair">
                    <LogOut className="size-4" aria-hidden="true" />
                  </Button>
                </form>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>;
}
