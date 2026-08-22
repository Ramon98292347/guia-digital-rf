import { headers } from "next/headers";
import Link from "next/link";
import { ArrowUpRight, Download, QrCode } from "lucide-react";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { requireTenantAccess } from "@/features/auth/server/admin-access";
import { cn } from "@/lib/utils";

export default async function AdminQrCodePage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const context = await requireTenantAccess(tenantSlug);

  if (!context) {
    notFound();
  }

  const headerList = await headers();
  const forwardedProto = headerList.get("x-forwarded-proto") ?? "http";
  const forwardedHost =
    headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const origin = `${forwardedProto}://${forwardedHost}`;
  const publicGuideUrl = `${origin}/guia/${context.tenant.slug}${context.tenant.status === "active" ? "" : "?preview=1"}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(publicGuideUrl)}&size=700x700&charset-source=UTF-8&charset-target=UTF-8&ecc=M&color=0-0-0&bgcolor=255-255-255`;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Acesso rápido</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">QR Code do Guia</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Este QR Code aponta para o link público do guia do estabelecimento e é gerado automaticamente com o tenant atual.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-[var(--rf-border)] bg-white p-5 shadow-[0_12px_30px_rgba(7,26,58,0.05)]">
          <div className="rounded-2xl border border-[var(--rf-border)] bg-slate-50 p-4">
            <img
              src={qrCodeUrl}
              alt={`QR Code do guia de ${context.tenant.name}`}
              className="mx-auto block h-auto w-full max-w-[440px] rounded-2xl bg-white p-3 shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-[var(--rf-border)] bg-[var(--rf-surface)] p-5 shadow-[0_12px_30px_rgba(7,26,58,0.04)]">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--rf-primary)]/10 text-[var(--rf-primary)]">
              <QrCode className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-[var(--rf-muted)]">Estabelecimento</p>
              <h2 className="text-xl font-semibold text-[var(--rf-text)]">{context.tenant.name}</h2>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--rf-border)] bg-white p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-[var(--rf-muted)]">Link público</p>
            <p className="break-all text-sm text-[var(--rf-text)]">{publicGuideUrl}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={publicGuideUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ size: "sm" }), "bg-[var(--rf-primary)] text-white hover:bg-[var(--rf-navy)]")}
            >
              <ArrowUpRight className="size-4" />
              Abrir guia
            </Link>

            <a
              href={qrCodeUrl}
              download={`qr-${context.tenant.slug}.png`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-[var(--rf-border)] text-[var(--rf-text)]")}
            >
              <Download className="size-4" />
              Baixar QR
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
