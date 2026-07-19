import { ChevronDown } from "lucide-react";

export function DashboardPanel({
  id,
  title,
  subtitle,
  icon,
  children,
  defaultOpen = false,
}: {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      id={id}
      open={defaultOpen}
      className="group scroll-mt-28 overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm shadow-black/5"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 marker:hidden sm:px-7">
        <span className="flex min-w-0 items-center gap-3">
          <span className="shrink-0 rounded-2xl bg-[#eef4ff] p-3 text-[#2463eb]">
            {icon}
          </span>
          <span className="min-w-0">
            <span className="block text-lg font-extrabold sm:text-xl">
              {title}
            </span>
            <span className="mt-0.5 block text-xs text-black/45 sm:text-sm">
              {subtitle}
            </span>
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-[#f1eee5] p-2 transition-transform group-open:rotate-180">
          <ChevronDown size={17} />
        </span>
      </summary>
      <div className="border-t border-black/10 px-5 py-6 sm:px-7 sm:py-7">
        {children}
      </div>
    </details>
  );
}
