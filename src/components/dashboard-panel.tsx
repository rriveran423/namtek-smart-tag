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
      className="group scroll-mt-28 overflow-hidden rounded-[26px] border border-[#dfe4eb] bg-white shadow-[0_8px_30px_rgba(17,24,39,.045)] transition hover:border-[#cfd6e2]"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 marker:hidden transition hover:bg-[#fafbfd] sm:px-7 sm:py-6">
        <span className="flex min-w-0 items-center gap-3">
          <span className="shrink-0 rounded-2xl bg-gradient-to-br from-[#edf5ff] to-[#e9f2fc] p-3 text-[#1e5fae] ring-1 ring-[#2463eb]/10">
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
        <span className="shrink-0 rounded-full border border-[#dfe4eb] bg-white p-2 text-black/55 shadow-sm transition-transform group-open:rotate-180">
          <ChevronDown size={17} />
        </span>
      </summary>
      <div className="border-t border-[#e5e9ef] px-5 py-6 sm:px-7 sm:py-8">
        {children}
      </div>
    </details>
  );
}
