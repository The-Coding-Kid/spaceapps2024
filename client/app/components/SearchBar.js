import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Sample planet data
  const planets = [
    { name: "Earth", icon: "/icons/planet.svg" },
    { name: "Mars", icon: "/icons/planet.svg" },
    { name: "Jupiter", icon: "/icons/planet.svg" },
    { name: "Saturn", icon: "/icons/planet.svg" },
  ];

  return (
    <div className="absolute bottom-[38px] left-1/2 transform -translate-x-1/2 flex flex-col items-center">
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="glow bg-[rgba(255,255,255,0.1)] w-[720px] z-10 mb-[24px] border bgblur border-[rgba(255,255,255,0.5)] pb-[42px] tracking-wide rounded-[40px] text-[18px]"
          >
            <p className="text-[rgba(255, 255, 255, 0.80)] font-light ml-[25px] mt-[25px]">
              Search Results
            </p>
            <ul className="flex flex-col gap-0 text-[rgba(255,255,255,0.5)] mt-[12px] font-light tracking-wide leading-none text-[16px]">
              {planets.map((planet, index) => (
                <li
                  key={index}
                  className={`flex hover:bg-[rgba(255,255,255,0.1)] transition-all duration-300 items-center gap-[12px] cursor-pointer flex-row py-[20px] px-[20px] border border-[rgba(255,255,255,0.5)] border-x-0 ${
                    index !== 0 ? "border-t-0" : ""
                  }`}
                >
                  <Image
                    src={planet.icon}
                    alt={planet.name}
                    width={24}
                    height={24}
                  />
                  <p className="text-[rgba(255,255,255,0.5)]">{planet.name}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex search-bar bgblur transition-all duration-300 w-[720px] h-[64px] rounded-full px-[38px] py-[22px] gap-[12px] bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.5)] flex-row">
        <Image src="/icons/search.svg" alt="logo" width={24} height={24} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full h-full outline-none text-[rgba(255,255,255,0.8)] bg-transparent placeholder:text-[rgba(255,255,255,0.5)] text-[18px] font-light tracking-wide leading-none"
          placeholder="Search for a ExoPlanet"
        />
        <Image
          src="/icons/chevron_right.svg"
          alt="logo"
          width={24}
          height={24}
        />
      </div>
    </div>
  );
};

export default SearchBar;
