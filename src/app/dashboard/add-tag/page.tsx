import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, KeyRound, PackageCheck, QrCode, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { createClient } from "@/lib/supabase/server";
import { addTag } from "./actions";

export default async function AddTag({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=%2Fdashboard%2Fadd-tag");

  return (
    <main className="min-h-screen bg-[#f2f4f7] text-[#121826]">
      <nav className="flex items-center justify-between border-b border-white/10 bg-[#0f1726] px-6 py-4 lg:px-10">
        <Brand inverse />
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
        >
          <ArrowLeft size={15} /> Dashboard
        </Link>
      </nav>

      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-14">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#2463eb]">
            Your NamTek collection
          </p>
          <h1 className="display mt-3 text-4xl font-extrabold sm:text-5xl">
            Add another luggage tag
          </h1>
          <p className="mt-4 leading-7 text-black/55">
            Every tag stays in this same dashboard. Add as many as you need for
            suitcases, carry-ons, family members, or future trips.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-[28px] bg-gradient-to-br from-[#111b2e] to-[#183654] p-7 text-white shadow-xl sm:p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1dc8ee]/15 text-[#7bdef4]">
              <QrCode size={25} />
            </span>
            <h2 className="display mt-6 text-2xl font-extrabold">
              Scan the private QR
            </h2>
            <p className="mt-3 leading-7 text-white/60">
              Open your phone camera and scan the registration QR included
              inside the new tag package. It will open the secure confirmation
              screen automatically.
            </p>
            <div className="mt-8 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/65">
              <ShieldCheck className="shrink-0 text-[#7bdef4]" size={20} />
              Use the private registration QR, not the public QR printed on the
              luggage tag.
            </div>
          </section>

          <section className="rounded-[28px] border border-[#dfe4eb] bg-white p-7 shadow-sm sm:p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0e9] text-[#ff5a36]">
              <KeyRound size={24} />
            </span>
            <h2 className="display mt-6 text-2xl font-extrabold">
              Enter the code instead
            </h2>
            <p className="mt-2 text-sm leading-6 text-black/50">
              Type the private activation code from the package, or paste the
              complete activation link.
            </p>

            {error && (
              <p className="mt-5 rounded-xl bg-red-100 p-3 text-sm text-red-800">
                {error}
              </p>
            )}

            <form action={addTag} className="mt-6">
              <label className="text-sm font-bold" htmlFor="token">
                Private activation code
              </label>
              <input
                id="token"
                name="token"
                required
                autoCapitalize="characters"
                autoComplete="off"
                placeholder="Enter code"
                className="mt-2 w-full rounded-2xl border border-[#d8dee8] bg-[#fbfcfe] px-4 py-3.5 text-[#111827] outline-none transition focus:border-[#2463eb] focus:bg-white focus:ring-4 focus:ring-[#2463eb]/10"
              />
              <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#ff5a36] px-6 py-4 font-bold text-white shadow-lg shadow-[#ff5a36]/15 transition hover:-translate-y-0.5 hover:bg-[#ed4827]">
                <PackageCheck size={18} /> Synchronize this tag
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
