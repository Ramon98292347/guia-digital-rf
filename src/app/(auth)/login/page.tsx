import { redirect } from "next/navigation";
import { platformConfig } from "@/config/platform";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminTenants } from "@/features/auth/server/admin-access";
import { LoginForm } from "./login-form";
import Image from "next/image";

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const tenants = await getAdminTenants(supabase);

    if (tenants.length === 1) {
      redirect(`/admin/${tenants[0].slug}`);
    }

    if (tenants.length > 1) {
      redirect("/admin/select");
    }
  }

  return <main className="grid min-h-dvh rf-platform-page lg:grid-cols-[minmax(360px,42%)_1fr]"><section className="relative hidden overflow-hidden bg-[var(--rf-navy)] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between"><div className="absolute -right-24 top-20 size-72 rounded-full border border-blue-400/10" /><div className="absolute -bottom-32 -left-16 size-80 rounded-full border border-blue-400/10" /><div className="relative"><Image src="/brand/rf-logo-transparent.png" alt="RF Tecnologia" width={230} height={72} className="h-16 w-56 object-contain object-left" /><p className="mt-10 text-sm font-medium uppercase tracking-[.22em] text-blue-200">Guia Digital</p><h2 className="mt-4 max-w-sm text-3xl font-semibold leading-tight">Gerencie toda a experiência dos seus hóspedes em um só lugar.</h2></div><p className="relative text-sm text-blue-100/65">{platformConfig.companyName}</p></section><section className="flex items-center justify-center px-5 py-10 sm:px-8"><div className="w-full max-w-[430px]"><div className="mb-8 lg:hidden"><Image src="/brand/rf-logo-transparent.png" alt="RF Tecnologia" width={220} height={72} className="h-16 w-52 object-contain object-left" /><p className="mt-2 text-sm font-medium tracking-wide text-[var(--rf-primary)]">Guia Digital</p></div><div className="rounded-2xl border border-[var(--rf-border)] bg-white p-6 shadow-[0_18px_50px_rgba(7,26,58,.08)] sm:p-8"><div className="mb-7"><p className="text-sm font-medium text-[var(--rf-primary)]">Área administrativa</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--rf-text)]">Acesse sua conta</h1><p className="mt-2 text-sm leading-6 text-[var(--rf-muted)]">Entre para administrar seu estabelecimento.</p></div><LoginForm /></div></div></section></main>;
}
