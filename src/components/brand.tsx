import Link from "next/link";
import Image from "next/image";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="NamTek Haus home"
      className="flex items-center gap-2.5"
    >
      <Image
        src="/namtek-haus-mark-transparent.png"
        alt=""
        width={52}
        height={52}
        priority
        className="h-11 w-11 object-contain drop-shadow-[0_0_8px_rgba(0,195,255,.24)] sm:h-12 sm:w-12"
      />
      <span
        className={`leading-none ${inverse ? "text-white" : "text-[#171713]"}`}
      >
        <span className="display block text-lg font-extrabold tracking-[.08em] sm:text-xl">
          NAMTEK
        </span>
        <span
          className={`mt-1 block text-[9px] font-bold tracking-[.42em] sm:text-[10px] ${inverse ? "text-white/60" : "text-black/45"}`}
        >
          HAUS
        </span>
      </span>
    </Link>
  );
}
