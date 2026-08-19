import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TenantForm } from "@/features/super-admin/components/tenant-form";

export default function NewTenantPage() {
  return <div className="mx-auto max-w-2xl space-y-6"><Link href="/super-admin" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 text-[var(--rf-primary)]")}><ArrowLeft className="size-4" />Voltar</Link><div><p className="text-sm font-medium text-[var(--rf-primary)]">Estabelecimentos</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--rf-text)]">Novo estabelecimento</h1><p className="mt-2 text-sm text-[var(--rf-muted)]">Cadastre uma nova operação na plataforma RF Tecnologia.</p></div><Card className="border-[var(--rf-border)] shadow-[0_12px_34px_rgba(7,26,58,.06)]"><CardHeader className="border-b border-[var(--rf-border)]"><CardTitle className="text-[var(--rf-text)]">Dados do estabelecimento</CardTitle></CardHeader><CardContent className="pt-6"><TenantForm /></CardContent></Card></div>;
}
