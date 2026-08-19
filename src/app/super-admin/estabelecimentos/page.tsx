import Link from "next/link";
import { ArrowUpRight, Building2, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getSuperAdminTenants } from "@/features/super-admin/server/service";

const labels: Record<string, string> = { draft: "Rascunho", active: "Ativo", suspended: "Suspenso", archived: "Arquivado" };

export default async function SuperAdminEstablishmentsPage() {
  const tenants = await getSuperAdminTenants();
  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-medium text-[var(--rf-primary)]">Super Admin</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--rf-text)]">Estabelecimentos</h1><p className="mt-2 text-sm text-[var(--rf-muted)]">Acesse e gerencie cada operação cadastrada na plataforma.</p></div>
        <Link href="/super-admin/estabelecimentos/novo" className={cn(buttonVariants(), "w-fit bg-[var(--rf-primary)] text-white hover:bg-[var(--rf-navy)]")}><Plus className="size-4" />Novo estabelecimento</Link>
      </header>
      {tenants.length === 0 ? <Card className="border-dashed"><CardContent className="p-10 text-center"><Building2 className="mx-auto size-8 text-[var(--rf-muted)]" /><p className="mt-3 font-semibold">Nenhum estabelecimento cadastrado.</p></CardContent></Card> : <div className="grid gap-3">{tenants.map((tenant) => <Card key={tenant.id}><CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold text-[var(--rf-text)]">{tenant.name}</h2><p className="mt-1 text-sm text-[var(--rf-muted)]">/{tenant.slug}</p></div><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">{labels[tenant.status] ?? tenant.status}</span><Link href={`/super-admin/estabelecimentos/${tenant.slug}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-[var(--rf-primary)]")}>Gerenciar<ArrowUpRight className="size-3.5" /></Link></div></CardContent></Card>)}</div>}
    </div>
  );
}
