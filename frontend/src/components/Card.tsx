import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl2 border border-surface-200 bg-white p-4 shadow-sm", className)}>
      {children}
    </div>
  );
}
