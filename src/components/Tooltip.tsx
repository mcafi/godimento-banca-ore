import type { ReactNode } from "react";

type TooltipProps = {
  label: string;
  children: ReactNode;
};

export function Tooltip({ label, children }: TooltipProps) {
  return (
    <div className="group relative">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 z-10 ml-3 -translate-y-1/2 whitespace-nowrap rounded bg-neutral-950 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
      >
        {label}
      </span>
    </div>
  );
}
