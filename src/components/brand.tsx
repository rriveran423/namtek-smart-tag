import Link from "next/link";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return <Link href="/" className={`display text-xl font-extrabold tracking-[-.08em] ${inverse ? "text-white" : "text-[#171713]"}`}>NAMTEK<span className="text-[#ff5a36]">.</span></Link>;
}
