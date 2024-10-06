import Image from "next/image";

export default function QuickActions() {
  return (
    <div className="absolute top-[24px] flex flex-col right-[24px] flex items-center gap-2">
      <div className="w-[50px] bgblur h-[50px] rounded-full glowbtn flex items-center justify-center hover:scale-110 cursor-pointer transition-all duration-300 bg-[rgba(255,255,255,0.1)]">
        <Image
          src="/icons/zoom_in.svg"
          alt="Quick Actions"
          width={24}
          height={24}
        />
      </div>
      <div className="w-[50px] bgblur h-[50px] rounded-full glowbtn flex items-center justify-center hover:scale-110 cursor-pointer transition-all duration-300 bg-[rgba(255,255,255,0.1)]">
        <Image
          src="/icons/zoom_out.svg"
          alt="Quick Actions"
          width={24}
          height={24}
        />
      </div>
      <div className="w-[50px] bgblur h-[50px] rounded-full glowbtn flex items-center justify-center hover:scale-110 cursor-pointer transition-all duration-300 bg-[rgba(255,255,255,0.1)]">
        <Image
          src="/icons/question.svg"
          alt="Quick Actions"
          width={24}
          height={24}
        />
      </div>
      <div className="w-[50px] bgblur h-[50px] rounded-full glowbtn flex items-center justify-center hover:scale-110 cursor-pointer transition-all duration-300 bg-[rgba(255,255,255,0.1)]">
        <Image
          src="/icons/pop_out.svg"
          alt="Quick Actions"
          width={24}
          height={24}
        />
      </div>
    </div>
  );
}
