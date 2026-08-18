"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type AdminAccommodationsErrorProps = {
  error: Error;
  reset: () => void;
};

export default function AdminAccommodationsError({
  error,
  reset,
}: AdminAccommodationsErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-destructive/30 bg-destructive/10 p-6">
      <h1 className="text-xl font-semibold">Não foi possível carregar as acomodações.</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tente novamente. Se o problema continuar, revise a sessão atual e o
        tenant selecionado.
      </p>
      <Button type="button" onClick={reset} className="mt-4">
        Tentar novamente
      </Button>
    </div>
  );
}
