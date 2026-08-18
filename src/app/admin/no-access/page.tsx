import Link from "next/link";
import { logoutAction } from "@/features/auth/actions";
import { Button, buttonVariants } from "@/components/ui/button";

export default function NoAccessPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-border bg-background p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Acesso não autorizado</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Sua conta não possui vínculo ativo com um estabelecimento. Entre em
          contato com a RF Tecnologia para solicitar acesso.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/login" className={buttonVariants({ variant: "outline" })}>
            Voltar ao login
          </Link>
          <form action={logoutAction}>
            <Button type="submit">Sair</Button>
          </form>
        </div>
      </section>
    </main>
  );
}
