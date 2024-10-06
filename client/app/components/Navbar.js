import Link from "next/link";

const Navbar = () => {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] flex flex-row gap-4 px-8 tracking-wide rounded-full top-[24px] right-[86px] text-[rgba(255,255,255,0.5)] py-3 absolute">
      <Link className="hover:text-white duration-300 transition-all" href="/">
        Interact
      </Link>
      <Link
        className="hover:text-white duration-300 transition-all"
        href="/featured"
      >
        Featured
      </Link>
      <Link
        className="hover:text-white duration-300 transition-all"
        href="/about"
      >
        About
      </Link>
      <Link
        className="hover:text-white duration-300 transition-all"
        href="/calculation"
      >
        Calculation
      </Link>
    </div>
  );
};

export default Navbar;
