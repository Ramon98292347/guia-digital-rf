import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function AdminTenantNotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-border bg-background p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Painel não encontrado</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          O estabelecimento não existe ou sua conta não possui permissão para
          acessá-lo.
        </p>
        <Link href="/admin" className={buttonVariants({ className: "mt-6" })}>
          Voltar ao painel
        </Link>
      </section>
    </main>
  );
}
