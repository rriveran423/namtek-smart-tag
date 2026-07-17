import { Brand } from "@/components/brand";
import { FinderThread } from "@/components/finder-thread";

export default async function RecoveryThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { token } = await params;
  const query = await searchParams;
  return (
    <main className="grid-bg min-h-screen px-4 py-7 sm:px-6">
      <div className="mx-auto max-w-[620px]">
        <div className="mb-6 px-2">
          <Brand />
        </div>
        <FinderThread token={token} created={query.created === "1"} />
        <p className="mt-6 text-center text-xs text-black/40">
          Keep this private link. It is the key to your recovery conversation.
        </p>
      </div>
    </main>
  );
}
