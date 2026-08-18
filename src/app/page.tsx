import { platformConfig } from "@/config/platform";

export default function Home() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6 py-12 text-foreground">
      <section className="w-full max-w-xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {platformConfig.companyName}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl">
          {platformConfig.platformName}
        </h1>
        <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg">
          Fundação da plataforma configurada.
        </p>
      </section>
    </main>
  );
}
