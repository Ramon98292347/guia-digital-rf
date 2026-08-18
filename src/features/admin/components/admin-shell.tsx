import type { ReactNode } from "react";
import { LogOut, Menu, UserRound } from "lucide-react";
import { logoutAction } from "@/features/auth/actions";
import {
  formatAdminRole,
  type AdminTenantContext,
} from "@/features/auth/server/admin-access";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AdminNav } from "./admin-nav";
import { TenantSwitcher } from "./tenant-switcher";

type AdminShellProps = {
  context: AdminTenantContext;
  children: ReactNode;
};

export function AdminShell({ context, children }: AdminShellProps) {
  const userLabel =
    context.user.user_metadata.full_name ??
    context.user.email ??
    "Usuário";

  return (
    <div className="min-h-dvh bg-muted text-foreground">
      <div className="flex min-h-dvh">
        <aside className="hidden w-72 shrink-0 border-r border-border bg-background lg:block">
          <div className="p-5">
            <p className="text-sm font-semibold">RF Tecnologia</p>
            <p className="text-xs text-muted-foreground">Guia Digital</p>
          </div>
          <Separator />
          <nav className="space-y-1 p-3">
            <AdminNav tenantSlug={context.tenant.slug} />
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <details className="lg:hidden">
                <summary className="flex size-9 cursor-pointer list-none items-center justify-center rounded-md border border-border">
                  <Menu className="size-4" aria-hidden="true" />
                </summary>
                <nav className="absolute left-4 right-4 top-14 z-20 rounded-lg border border-border bg-background p-2 shadow-lg">
                  <AdminNav tenantSlug={context.tenant.slug} mobile />
                </nav>
              </details>

              <TenantSwitcher
                currentSlug={context.tenant.slug}
                tenants={context.tenants}
              />

              <div className="flex min-w-0 items-center gap-3">
                <div className="hidden min-w-0 text-right sm:block">
                  <p className="truncate text-sm font-medium">{userLabel}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatAdminRole(context.role)}
                  </p>
                </div>
                <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                  <UserRound className="size-4" aria-hidden="true" />
                </div>
                <form action={logoutAction}>
                  <Button type="submit" variant="ghost" size="icon" aria-label="Sair">
                    <LogOut className="size-4" aria-hidden="true" />
                  </Button>
                </form>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
