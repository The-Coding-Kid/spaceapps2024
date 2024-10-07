import Link from "next/link";

const Navbar = ({
  setLockOnPlanet,
  lockOnPlanet
}) => {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] bgblur flex z-10 flex-row gap-4 px-8 tracking-wide rounded-full top-[24px] right-[86px] text-[rgba(255,255,255,0.5)] py-3 absolute">
      <button
        onClick={
          () => setLockOnPlanet(!lockOnPlanet)
        }
        className="hover:text-white duration-300 transition-all" >
        Lock on planet
      </button>
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
