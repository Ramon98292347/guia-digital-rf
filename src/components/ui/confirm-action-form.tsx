"use client";

import type { FormHTMLAttributes, ReactNode } from "react";

export function ConfirmActionForm({
  message,
  children,
  ...props
}: FormHTMLAttributes<HTMLFormElement> & { message: string; children: ReactNode }) {
  return (
    <form {...props} onSubmit={(event) => {
      if (!window.confirm(message)) event.preventDefault();
    }}>
      {children}
    </form>
  );
}
