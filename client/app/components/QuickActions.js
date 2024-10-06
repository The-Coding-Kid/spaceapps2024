import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

const QuickActionItem = ({ src, alt, description }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
        transition={{ duration: 0.3 }}
        className="ml-2 bgblur bg-[rgba(255,255,255,0.1)] rounded-md px-2 cursor-pointer py-1 z-40 text-[rbga(255,255,255,0.5)] text-sm"
      >
        {description}
      </motion.div>
      <div className="w-[50px] bgblur h-[50px] rounded-full glowbtn flex items-center justify-center hover:scale-110 cursor-pointer transition-all duration-300 bg-[rgba(255,255,255,0.1)]">
        <Image src={src} alt={alt} width={24} height={24} />
      </div>
    </div>
  );
};

export default function QuickActions() {
  const actions = [
    { src: "/icons/zoom_in.svg", alt: "Zoom In", description: "Zoom In" },
    { src: "/icons/zoom_out.svg", alt: "Zoom Out", description: "Zoom Out" },
    { src: "/icons/question.svg", alt: "Help", description: "Help" },
    {
      src: "/icons/pop_out.svg",
      alt: "Pop Out",
      description: "View in new window (Recommended)",
    },
  ];

  return (
    <div className="absolute top-[24px] flex flex-col right-[24px] items-end gap-2">
      {actions.map((action, index) => (
        <QuickActionItem key={index} {...action} />
      ))}
    </div>
  );
}
