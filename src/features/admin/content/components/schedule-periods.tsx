"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const days = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export function SchedulePeriods({
  schedules,
  periods,
  saveAction,
  deleteAction,
}: {
  schedules: Record<string, unknown>[];
  periods: Record<string, unknown>[];
  saveAction: (formData: FormData) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
}) {
  const [isClosed, setIsClosed] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Períodos dos horários</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={saveAction} className="grid gap-3 rounded-lg border border-[var(--rf-border)] p-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm">
            <span className="mb-1 block font-medium">Horário</span>
            <select name="schedule_id" required className="h-10 w-full rounded-lg border border-[var(--rf-border)] bg-white px-3">
              {schedules.length === 0 ? (
                <option value="">Cadastre um horário primeiro</option>
              ) : (
                schedules.map((schedule) => (
                  <option key={String(schedule.id)} value={String(schedule.id)}>
                    {String(schedule.name)}
                  </option>
                ))
              )}
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium">Dia</span>
            <select name="day_of_week" className="h-10 w-full rounded-lg border border-[var(--rf-border)] bg-white px-3">
              {days.map((day, index) => (
                <option key={day} value={index}>{day}</option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium">Abertura</span>
            <input
              name="opens_at"
              type="time"
              required={!isClosed}
              disabled={isClosed}
              className="h-10 w-full rounded-lg border border-[var(--rf-border)] bg-white px-3 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium">Fechamento</span>
            <input
              name="closes_at"
              type="time"
              required={!isClosed}
              disabled={isClosed}
              className="h-10 w-full rounded-lg border border-[var(--rf-border)] bg-white px-3 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              name="is_closed"
              type="checkbox"
              checked={isClosed}
              onChange={(event) => setIsClosed(event.target.checked)}
              className="size-4 accent-[var(--rf-primary)]"
            />
            Fechado neste dia
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium">Observação</span>
            <input name="label" className="h-10 w-full rounded-lg border border-[var(--rf-border)] bg-white px-3" />
          </label>

          <Button type="submit" className="self-end bg-[var(--rf-primary)] text-white hover:bg-[var(--rf-navy)]">
            Adicionar período
          </Button>
        </form>

        {periods.length === 0 ? (
          <p className="text-sm text-[var(--rf-muted)]">Nenhum período cadastrado ainda.</p>
        ) : (
          <div className="space-y-2">
            {periods.map((period) => (
              <div
                key={String(period.id)}
                className="flex flex-col gap-3 rounded-lg border border-[var(--rf-border)] p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{days[Number(period.day_of_week)] ?? "Dia"}</p>
                  <p className="text-[var(--rf-muted)]">
                    {period.is_closed
                      ? "Fechado"
                      : `${String(period.opens_at ?? "")} às ${String(period.closes_at ?? "")}`}
                    {period.label ? ` · ${String(period.label)}` : ""}
                  </p>
                </div>
                <form action={deleteAction.bind(null, String(period.id))}>
                  <Button type="submit" variant="ghost" size="sm" className="w-fit text-red-600">
                    <Trash2 className="size-4" />
                    Excluir período
                  </Button>
                </form>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

