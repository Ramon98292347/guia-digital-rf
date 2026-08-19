"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ExternalLink, Globe2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { publishGuideAction, type AIDesignState } from "../actions";

export function GuidePublicationActions({ tenantSlug, isPublished }: { tenantSlug: string; isPublished: boolean }) {
  const [state, action, pending] = useActionState<AIDesignState, FormData>(
    async () => publishGuideAction(tenantSlug),
    {},
  );
  return <div className="flex flex-wrap items-center gap-2"><Link href={`/guia/${tenantSlug}${isPublished ? "" : "?preview=1"}`} target="_blank" className={cn(buttonVariants({ variant: "outline" }))}><ExternalLink className="size-4" />Visualizar Guia</Link><form action={action}><Button type="submit" disabled={pending}>{pending ? "Publicando..." : "Publicar Guia"}<Globe2 className="size-4" /></Button></form>{state.error ? <p className="basis-full text-sm text-destructive">{state.error}</p> : null}{state.approved ? <p className="basis-full text-sm text-emerald-700">Guia publicado com sucesso.</p> : null}</div>;
}
