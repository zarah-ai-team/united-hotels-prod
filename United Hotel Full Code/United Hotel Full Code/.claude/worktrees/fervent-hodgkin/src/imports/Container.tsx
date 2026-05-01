import svgPaths from "./svg-f9tosqrz1g";

function Frame() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
      <div className="h-[26px] relative shrink-0 w-[28px]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 26">
          <g id="Vector">
            <mask fill="white" id="path-1-inside-1_20_512">
              <path d={svgPaths.p32095b00} />
            </mask>
            <path d={svgPaths.p32095b00} fill="var(--fill-0, #1ABC9C)" mask="url(#path-1-inside-1_20_512)" stroke="var(--stroke-4, #FAFAFA)" strokeWidth="0.4" />
          </g>
        </svg>
      </div>
      <p className="font-['Poppins:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#1abc9c] text-[24px] text-center whitespace-nowrap">{`United Hotel `}</p>
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center px-[8px] py-[3px] relative size-full" data-name="Container">
      <Frame />
    </div>
  );
}