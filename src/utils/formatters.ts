import { platformConfig } from "@/config/platform";

export function formatDate(value: Date | string | number): string {
  return new Intl.DateTimeFormat(platformConfig.defaultLocale).format(
    new Date(value),
  );
}

export function formatTime(value: Date | string | number): string {
  return new Intl.DateTimeFormat(platformConfig.defaultLocale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(platformConfig.defaultLocale, {
    style: "currency",
    currency: platformConfig.defaultCurrency,
  }).format(value);
}
