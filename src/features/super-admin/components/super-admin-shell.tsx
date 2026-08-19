import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { Building2, LayoutDashboard, LogOut, Menu, UserRound, X } from "lucide-react";
import { logoutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

export function SuperAdminShell({ children, user }: { children: ReactNode; user: User }) {
  const userLabel = String(user.user_metadata.full_name ?? user.email ?? "Super Admin");
  const initials = userLabel.split(" ").slice(0, 2).map((part: string) => part[0]).join("").toUpperCase();
  return <div className="min-h-dvh rf-platform-page"><div className="flex min-h-dvh">
    <aside className="hidden w-72 shrink-0 flex-col bg-[var(--rf-navy)] text-white lg:flex">
      <div className="border-b border-white/10 px-6 py-5"><Image src="/brand/rf-logo-transparent.png" alt="RF Tecnologia" width={192} height={56} className="h-14 w-48 object-contain object-center" /><p className="mt-2 text-xs text-blue-100/70">Administração da Plataforma</p></div>
      <nav className="flex-1 space-y-1 px-4 py-6"><Link href="/super-admin" className="flex h-11 items-center gap-3 rounded-xl bg-[var(--rf-electric)] px-4 text-sm font-semibold shadow-lg shadow-blue-950/20"><LayoutDashboard className="size-4" />Visão Geral</Link><Link href="/super-admin/estabelecimentos" className="flex h-11 items-center gap-3 rounded-xl px-4 text-sm text-blue-100/80 transition hover:bg-white/10 hover:text-white"><Building2 className="size-4" />Estabelecimentos</Link></nav>
      <form action={logoutAction} className="border-t border-white/10 p-4"><Button type="submit" variant="ghost" className="w-full justify-start gap-3 text-blue-100 hover:bg-white/10 hover:text-white"><LogOut className="size-4" />Sair</Button></form>
    </aside>
    <div className="flex min-w-0 flex-1 flex-col"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--rf-border)] bg-white/95 px-4 backdrop-blur sm:px-6"><div className="flex items-center gap-3"><details className="group lg:hidden"><summary className="flex size-9 cursor-pointer list-none items-center justify-center rounded-lg border border-[var(--rf-border)] text-[var(--rf-navy)]"><Menu className="size-4 group-open:hidden" /><X className="hidden size-4 group-open:block" /></summary><div className="absolute left-4 right-4 top-14 rounded-xl border border-[var(--rf-border)] bg-[var(--rf-navy)] p-3 text-white shadow-xl"><Link href="/super-admin" className="flex h-11 items-center gap-3 rounded-lg bg-[var(--rf-electric)] px-3 text-sm font-medium"><LayoutDashboard className="size-4" />Visão Geral</Link><Link href="/super-admin/estabelecimentos" className="mt-1 flex h-11 items-center gap-3 rounded-lg px-3 text-sm text-blue-100"><Building2 className="size-4" />Estabelecimentos</Link></div></details><div><p className="text-sm font-semibold text-[var(--rf-text)]">Administração da Plataforma</p><p className="hidden text-xs text-[var(--rf-muted)] sm:block">RF Tecnologia</p></div></div><div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-medium text-[var(--rf-text)]">{userLabel}</p><p className="text-xs text-[var(--rf-muted)]">Super Admin</p></div><div className="flex size-9 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[var(--rf-primary)] ring-1 ring-blue-100">{initials || <UserRound className="size-4" />}</div></div></header><main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main></div>
  </div></div>;
}
