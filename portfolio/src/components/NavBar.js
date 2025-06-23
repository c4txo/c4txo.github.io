// src/components/NavBar.js
import Link from "next/link";
import Image from "next/image";

export default function NavBar() {
  return (
    <span
      className="flex flex-wrap gap-2 sm:gap-4 font-semibold text-xs sm:text-base mb-4 fixed top-0 left-0 w-full z-50 py-2 sm:py-3 px-2 sm:px-8 shadow-sm backdrop-blur border-b border-pink-100 overflow-x-auto whitespace-nowrap"
      style={{ backgroundColor: '#ff6cb1', color: '#fff' }}
    >
      <Link href="/" className="hover:underline flex items-center">
        <Image src="/home-icon.svg" alt="Home" width={20} height={20} className="mr-1 invert brightness-0" />
      </Link>
      <span>|</span>
      <Link href="/coming-soon" className="hover:underline">Brand Collaborations</Link>
      <span>/</span>
      <Link href="/coming-soon" className="hover:underline">Cosplays</Link>
      <span>/</span>
      <Link href="/coming-soon" className="hover:underline">Event Appearances</Link>
      <span>/</span>
      <Link href="/coming-soon" className="hover:underline">Fashion</Link>
      <span>/</span>
      <Link href="/coming-soon" className="hover:underline">Maid Cafe</Link>
    </span>
  );
}
