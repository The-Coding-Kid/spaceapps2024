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
      <Link
        className="hover:text-white duration-300 transition-all"
        href="/featured">
        Surface View
      </Link>
      <Link className="hover:text-white duration-300 transition-all" href="https://www.figma.com/proto/IM8vlxQbN1oC2q29MvDUJi/Nasa-Space-Apps-2024?node-id=1-2&node-type=canvas&m=dev&scaling=contain&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A2">
        Website
      </Link>
    </div>
  );
};

export default Navbar;
