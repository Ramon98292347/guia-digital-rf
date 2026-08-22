"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Eraser, FlaskConical, Save, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Row = Record<string, unknown>;
type TestResult = { text: string; actions: { label: string; kind: string }[] };

type Props = {
  tenantSlug: string;
  settings: Row | null;
  knowledge: Row | null;
  media: Row[];
  contacts: Row[];
  status: string | null;
  saveSettings: (formData: FormData) => Promise<void>;
  saveKnowledge: (formData: FormData) => Promise<void>;
  clearKnowledge: () => Promise<void>;
  testConcierge: (question: string) => Promise<TestResult>;
};

const example = {
  sobre: { descricao: "" },
  perguntas_frequentes: [],
  orientacoes_extras: [],
};

function stringValue(row: Row | null, key: string, fallback = "") {
  return typeof row?.[key] === "string" ? String(row[key]) : fallback;
}

export function ConciergeAdminPage({ tenantSlug, settings, knowledge, media, contacts, status, saveSettings, saveKnowledge, clearKnowledge, testConcierge }: Props) {
  const initialJson = knowledge?.knowledge_json && typeof knowledge.knowledge_json === "object" ? JSON.stringify(knowledge.knowledge_json, null, 2) : JSON.stringify(example, null, 2);
  const [json, setJson] = useState(initialJson);
  const [jsonMessage, setJsonMessage] = useState<string | null>(null);
  const [testQuestion, setTestQuestion] = useState("");
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTesting, startTesting] = useTransition();

  function validateJson() {
    try {
      const parsed: unknown = JSON.parse(json);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("O JSON deve começar com um objeto.");
      const keys = Object.keys(parsed).length;
      setJsonMessage(`Base complementar válida. ${keys} chave(s) principal(is).`);
      return true;
    } catch (error) {
      setJsonMessage(error instanceof Error ? error.message : "JSON inválido.");
      return false;
    }
  }

  function formatJson() {
    try {
      setJson(JSON.stringify(JSON.parse(json), null, 2));
      setJsonMessage("JSON formatado.");
    } catch {
      setJsonMessage("Não foi possível formatar: corrija o JSON antes.");
    }
  }

  function runTest() {
    if (!testQuestion.trim()) return;
    startTesting(async () => setTestResult(await testConcierge(testQuestion.trim())));
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <p className="text-sm font-medium text-[var(--rf-primary)]">CONCIERGE</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--rf-text)] sm:text-3xl">Concierge Virtual</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--rf-muted)]">Um único Concierge para a plataforma, configurado com os dados reais deste estabelecimento.</p>
      </header>
      {status ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{status === "base-salva" ? "Base complementar válida e salva." : status === "base-limpa" ? "Base complementar limpa." : "Configurações salvas com sucesso."}</div> : null}

      <Card>
        <CardHeader><CardTitle>Configuração do Concierge</CardTitle></CardHeader>
        <CardContent>
          <form action={saveSettings} className="grid gap-4 sm:grid-cols-2">
            <label className="flex min-h-11 items-center gap-3 rounded-lg border border-[var(--rf-border)] px-3 text-sm font-medium sm:col-span-2"><input type="checkbox" name="is_enabled" defaultChecked={settings?.is_enabled === true} className="size-4 accent-[var(--rf-primary)]" />Ativar Concierge</label>
            <label><span className="mb-1.5 block text-sm font-medium">Nome do assistente</span><input name="assistant_name" defaultValue={stringValue(settings, "assistant_name", "Anfitrião Virtual")} className="h-10 w-full rounded-lg border px-3 text-sm" /></label>
            <label><span className="mb-1.5 block text-sm font-medium">Avatar da Biblioteca</span><select name="avatar_media_id" defaultValue={stringValue(settings, "avatar_media_id")} className="h-10 w-full rounded-lg border bg-white px-3 text-sm"><option value="">Usar ícone padrão</option>{media.map((item) => <option key={String(item.id)} value={String(item.id)}>{String(item.original_filename ?? "Mídia")} ({String(item.media_type)})</option>)}</select></label>
            <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-medium">Mensagem inicial</span><textarea name="welcome_message" defaultValue={stringValue(settings, "welcome_message")} rows={2} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Olá! Como posso ajudar?" /></label>
            <label><span className="mb-1.5 block text-sm font-medium">Mensagem sem resposta</span><textarea name="fallback_message" defaultValue={stringValue(settings, "fallback_message")} rows={3} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Não encontrei essa informação no Guia..." /></label>
            <label><span className="mb-1.5 block text-sm font-medium">Contato da hospedagem</span><select name="fallback_contact_id" defaultValue={stringValue(settings, "fallback_contact_id")} className="h-10 w-full rounded-lg border bg-white px-3 text-sm"><option value="">Não oferecer contato</option>{contacts.map((item) => <option key={String(item.id)} value={String(item.id)}>{String(item.label)} - {String(item.value)}</option>)}</select></label>
            <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-medium">Observações de comportamento</span><textarea name="behavior_notes" defaultValue={stringValue(settings, "behavior_notes")} rows={2} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Tom breve e acolhedor." /></label>
            <Button type="submit" className="w-fit bg-[var(--rf-primary)] text-white hover:bg-[var(--rf-navy)]"><Save className="size-4" />Salvar configuração</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Base complementar</CardTitle><p className="text-sm text-[var(--rf-muted)]">Use somente informações que ainda não possuem estrutura própria no Guia.</p></CardHeader>
        <CardContent>
          <form action={saveKnowledge} onSubmit={(event) => { if (!validateJson()) event.preventDefault(); }} className="space-y-4">
            <textarea name="knowledge_json" value={json} onChange={(event) => { setJson(event.target.value); setJsonMessage(null); }} spellCheck={false} className="min-h-[280px] w-full rounded-lg border bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100 outline-none focus:ring-2 focus:ring-[var(--rf-primary)]" />
            <p className="text-xs leading-5 text-amber-700">Não utilize esta área para senhas ou credenciais. Wi-Fi continua vindo da estrutura segura existente.</p>
            {jsonMessage ? <p className="flex items-center gap-2 text-sm text-[var(--rf-muted)]"><CheckCircle2 className="size-4 text-emerald-600" />{jsonMessage}</p> : null}
            <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={validateJson}><WandSparkles className="size-4" />Validar JSON</Button><Button type="button" variant="outline" onClick={formatJson}>Formatar</Button><Button type="submit" className="bg-[var(--rf-primary)] text-white hover:bg-[var(--rf-navy)]"><Save className="size-4" />Salvar</Button></div>
          </form>
          <div className="mt-4 flex flex-wrap gap-2"><form action={clearKnowledge} onSubmit={(event) => { if (!window.confirm("Limpar a base complementar deste tenant?")) event.preventDefault(); }}><Button type="submit" variant="ghost" className="text-red-700"><Eraser className="size-4" />Limpar</Button></form><p className="self-center text-xs text-[var(--rf-muted)]">Exemplo: sobre, perguntas_frequentes e orientacoes_extras.</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Testar Concierge</CardTitle><p className="text-sm text-[var(--rf-muted)]">A prévia usa exatamente os dados publicados deste tenant.</p></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row"><input value={testQuestion} onChange={(event) => setTestQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); runTest(); } }} placeholder="Ex.: Como chegar?" className="h-10 min-w-0 flex-1 rounded-lg border px-3 text-sm" /><Button type="button" onClick={runTest} disabled={isTesting}><FlaskConical className="size-4" />{isTesting ? "Consultando..." : "Testar"}</Button></div>
          {testResult ? <div className="rounded-xl border bg-slate-50 p-4 text-sm"><p>{testResult.text}</p>{testResult.actions.length ? <div className="mt-3 flex flex-wrap gap-2">{testResult.actions.map((action) => <span key={`${action.kind}-${action.label}`} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[var(--rf-primary)]">{action.label}</span>)}</div> : null}</div> : null}
        </CardContent>
      </Card>
      <p className="text-xs text-[var(--rf-muted)]">Tenant atual: {tenantSlug}. O Concierge não armazena histórico permanente de hóspedes.</p>
    </div>
  );
}
