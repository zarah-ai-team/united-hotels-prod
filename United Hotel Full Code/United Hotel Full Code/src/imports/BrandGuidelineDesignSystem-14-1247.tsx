function Heading() {
  return (
    <div className="h-[60px] relative shrink-0 w-full" data-name="Heading 1">
      <p className="absolute font-['Poppins:Bold',sans-serif] leading-[60px] left-0 not-italic text-[#3b3b3b] text-[40px] top-[1.82px]">UI Foundations</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[27.983px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-0 not-italic text-[#8c8c8c] text-[18px] top-[-0.27px]">Core visual elements that define our interface design.</p>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[15.994px] h-[103.977px] items-start left-[319.99px] top-[48px] w-[978.75px]" data-name="Container">
      <Heading />
      <Paragraph />
    </div>
  );
}

function Heading1() {
  return (
    <div className="h-[47.997px] relative shrink-0 w-full" data-name="Heading 2">
      <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[48px] left-0 not-italic text-[#3b3b3b] text-[32px] top-[0.91px]">Border Radius</p>
    </div>
  );
}

function Container3() {
  return <div className="absolute bg-[#1abc9c] left-[106.22px] rounded-[8px] size-[95.994px] top-[31.99px]" data-name="Container" />;
}

function Container4() {
  return (
    <div className="absolute h-[23.991px] left-[31.99px] top-[143.98px] w-[244.46px]" data-name="Container">
      <p className="-translate-x-1/2 absolute font-['Poppins:SemiBold',sans-serif] leading-[24px] left-[122.33px] not-italic text-[#3b3b3b] text-[16px] text-center top-[0.91px]">8px</p>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute h-[20px] left-[31.99px] top-[171.96px] w-[244.46px]" data-name="Container">
      <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[121.96px] not-italic text-[#8c8c8c] text-[14px] text-center top-[-0.09px]">Buttons</p>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute bg-white border-[#eaeaea] border-[0.909px] border-solid h-[225.767px] left-0 rounded-[16px] top-0 w-[310.256px]" data-name="Container">
      <Container3 />
      <Container4 />
      <Container5 />
    </div>
  );
}

function Container7() {
  return <div className="absolute bg-[#1abc9c] left-[106.22px] rounded-[12px] size-[95.994px] top-[31.99px]" data-name="Container" />;
}

function Container8() {
  return (
    <div className="absolute h-[23.991px] left-[31.99px] top-[143.98px] w-[244.46px]" data-name="Container">
      <p className="-translate-x-1/2 absolute font-['Poppins:SemiBold',sans-serif] leading-[24px] left-[122.49px] not-italic text-[#3b3b3b] text-[16px] text-center top-[0.91px]">12px</p>
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute h-[20px] left-[31.99px] top-[171.96px] w-[244.46px]" data-name="Container">
      <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[122.34px] not-italic text-[#8c8c8c] text-[14px] text-center top-[-0.09px]">Cards, Inputs</p>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute bg-white border-[#eaeaea] border-[0.909px] border-solid h-[225.767px] left-[334.25px] rounded-[16px] top-0 w-[310.256px]" data-name="Container">
      <Container7 />
      <Container8 />
      <Container9 />
    </div>
  );
}

function Container11() {
  return <div className="absolute bg-[#1abc9c] left-[106.22px] rounded-[16px] size-[95.994px] top-[31.99px]" data-name="Container" />;
}

function Container12() {
  return (
    <div className="absolute h-[23.991px] left-[31.99px] top-[143.98px] w-[244.46px]" data-name="Container">
      <p className="-translate-x-1/2 absolute font-['Poppins:SemiBold',sans-serif] leading-[24px] left-[122.46px] not-italic text-[#3b3b3b] text-[16px] text-center top-[0.91px]">16px</p>
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute h-[20px] left-[31.99px] top-[171.96px] w-[244.46px]" data-name="Container">
      <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[123.05px] not-italic text-[#8c8c8c] text-[14px] text-center top-[-0.09px]">Modals, Dialogs</p>
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute bg-white border-[#eaeaea] border-[0.909px] border-solid h-[225.767px] left-[668.49px] rounded-[16px] top-0 w-[310.256px]" data-name="Container">
      <Container11 />
      <Container12 />
      <Container13 />
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[225.767px] relative shrink-0 w-full" data-name="Container">
      <Container2 />
      <Container6 />
      <Container10 />
    </div>
  );
}

function Text() {
  return (
    <div className="h-[15.994px] relative shrink-0 w-[9.815px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Inter:Bold',sans-serif] font-bold leading-[16px] not-italic relative shrink-0 text-[12px] text-white">✗</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="absolute bg-[#ef4444] content-stretch flex items-center justify-center left-0 rounded-[30504000px] size-[23.991px] top-[3.99px]" data-name="Container">
      <Text />
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="absolute h-[23.991px] left-[35.98px] top-0 w-[866.96px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[0] left-0 not-italic text-[#3b3b3b] text-[0px] text-[16px] top-[-1.18px]">
        <span className="leading-[24px]">No pill-shaped UI:</span>
        <span className="font-['Inter:Regular',sans-serif] font-normal leading-[24px]">{` Avoid fully rounded corners (border-radius: 50% or 999px). Keep corners subtle and measured.`}</span>
      </p>
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[27.983px] relative shrink-0 w-full" data-name="Container">
      <Container16 />
      <Paragraph1 />
    </div>
  );
}

function Container14() {
  return (
    <div className="bg-white h-[77.784px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-[0.909px] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col items-start pb-[0.909px] pt-[24.901px] px-[24.901px] relative size-full">
        <Container15 />
      </div>
    </div>
  );
}

function Section() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[23.991px] h-[399.531px] items-start left-[319.99px] top-[199.97px] w-[978.75px]" data-name="Section">
      <Heading1 />
      <Container1 />
      <Container14 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="h-[47.997px] relative shrink-0 w-full" data-name="Heading 2">
      <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[48px] left-0 not-italic text-[#3b3b3b] text-[32px] top-[0.91px]">Elevation System</p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[23.991px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#8c8c8c] text-[16px] top-[-1.18px]">Use subtle shadows to create depth. Avoid heavy or dramatic drop shadows.</p>
    </div>
  );
}

function Container21() {
  return (
    <div className="h-[23.991px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#3b3b3b] text-[16px] top-[-1.18px]">Card</p>
    </div>
  );
}

function Container22() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#8c8c8c] text-[14px] top-[-0.09px]">Subtle elevation for content cards</p>
    </div>
  );
}

function Container20() {
  return (
    <div className="bg-white h-[101.79px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-[0.909px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]" />
      <div className="content-stretch flex flex-col gap-[7.997px] items-start pb-[0.909px] pt-[24.901px] px-[24.901px] relative size-full">
        <Container21 />
        <Container22 />
      </div>
    </div>
  );
}

function Code() {
  return (
    <div className="content-stretch flex h-[14.545px] items-start relative shrink-0 w-full" data-name="Code">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#3b3b3b] text-[12px]">0 1px 3px rgba(0,0,0,0.1)</p>
    </div>
  );
}

function Container23() {
  return (
    <div className="bg-[#fafafa] h-[47.969px] relative rounded-[12px] shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start pl-[11.989px] pr-[133.281px] pt-[17.443px] relative size-full">
        <Code />
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[15.994px] h-[165.753px] items-start left-0 top-0 w-[282.983px]" data-name="Container">
      <Container20 />
      <Container23 />
    </div>
  );
}

function Container26() {
  return (
    <div className="h-[23.991px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#3b3b3b] text-[16px] top-[-1.18px]">Dropdown</p>
    </div>
  );
}

function Container27() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#8c8c8c] text-[14px] top-[-0.09px]">Floating menus and dropdowns</p>
    </div>
  );
}

function Container25() {
  return (
    <div className="bg-white h-[99.972px] relative rounded-[16px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.1)] shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[7.997px] items-start pl-[23.991px] pr-[23.992px] pt-[23.992px] relative size-full">
        <Container26 />
        <Container27 />
      </div>
    </div>
  );
}

function Code1() {
  return (
    <div className="content-stretch flex h-[14.545px] items-start relative shrink-0 w-full" data-name="Code">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#3b3b3b] text-[12px]">0 4px 6px rgba(0,0,0,0.1)</p>
    </div>
  );
}

function Container28() {
  return (
    <div className="bg-[#fafafa] h-[47.969px] relative rounded-[12px] shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start pl-[11.989px] pr-[130.398px] pt-[17.443px] relative size-full">
        <Code1 />
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[15.994px] h-[165.753px] items-start left-[314.97px] top-0 w-[282.997px]" data-name="Container">
      <Container25 />
      <Container28 />
    </div>
  );
}

function Container31() {
  return (
    <div className="h-[23.991px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#3b3b3b] text-[16px] top-[-1.18px]">Modal</p>
    </div>
  );
}

function Container32() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#8c8c8c] text-[14px] top-[-0.09px]">Dialogs and overlays</p>
    </div>
  );
}

function Container30() {
  return (
    <div className="bg-white h-[99.972px] relative rounded-[16px] shadow-[0px_10px_25px_0px_rgba(0,0,0,0.15)] shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[7.997px] items-start pl-[23.991px] pr-[23.992px] pt-[23.992px] relative size-full">
        <Container31 />
        <Container32 />
      </div>
    </div>
  );
}

function Code2() {
  return (
    <div className="content-stretch flex h-[14.545px] items-start relative shrink-0 w-full" data-name="Code">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#3b3b3b] text-[12px]">0 10px 25px rgba(0,0,0,0.15)</p>
    </div>
  );
}

function Container33() {
  return (
    <div className="bg-[#fafafa] h-[47.969px] relative rounded-[12px] shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start pl-[11.989px] pr-[111.577px] pt-[17.443px] relative size-full">
        <Code2 />
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[15.994px] h-[165.753px] items-start left-[629.96px] top-0 w-[282.983px]" data-name="Container">
      <Container30 />
      <Container33 />
    </div>
  );
}

function Container18() {
  return (
    <div className="h-[165.753px] relative shrink-0 w-full" data-name="Container">
      <Container19 />
      <Container24 />
      <Container29 />
    </div>
  );
}

function Container17() {
  return (
    <div className="bg-white h-[287.528px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-[0.909px] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col gap-[31.989px] items-start pb-[0.909px] pt-[32.898px] px-[32.898px] relative size-full">
        <Paragraph2 />
        <Container18 />
      </div>
    </div>
  );
}

function Section1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[23.991px] h-[359.517px] items-start left-[319.99px] top-[663.49px] w-[978.75px]" data-name="Section">
      <Heading2 />
      <Container17 />
    </div>
  );
}

function Heading3() {
  return (
    <div className="h-[47.997px] relative shrink-0 w-full" data-name="Heading 2">
      <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[48px] left-0 not-italic text-[#3b3b3b] text-[32px] top-[0.91px]">Focus States</p>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[23.991px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#8c8c8c] text-[16px] top-[-1.18px]">All interactive elements must have clear, visible focus states for keyboard navigation.</p>
    </div>
  );
}

function Container37() {
  return (
    <div className="absolute h-[23.991px] left-0 top-0 w-[912.955px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#3b3b3b] text-[16px] top-[-1.18px]">Button Focus</p>
    </div>
  );
}

function Button() {
  return (
    <div className="absolute bg-[#1abc9c] h-[47.969px] left-0 rounded-[12px] top-[35.98px] w-[167.642px]" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[84.49px] not-italic text-[16px] text-center text-white top-[10.81px]">Focused Button</p>
    </div>
  );
}

function Container38() {
  return (
    <div className="absolute h-[20px] left-0 top-[91.95px] w-[912.955px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#8c8c8c] text-[14px] top-[-0.09px]">3px turquoise outline with 2px offset</p>
    </div>
  );
}

function Container36() {
  return (
    <div className="h-[111.946px] relative shrink-0 w-full" data-name="Container">
      <Container37 />
      <Button />
      <Container38 />
    </div>
  );
}

function Container40() {
  return (
    <div className="absolute h-[23.991px] left-0 top-0 w-[912.955px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#3b3b3b] text-[16px] top-[-1.18px]">Input Focus</p>
    </div>
  );
}

function TextInput() {
  return (
    <div className="absolute h-[51.605px] left-0 rounded-[12px] top-[35.98px] w-[912.955px]" data-name="Text Input">
      <div className="content-stretch flex items-center overflow-clip px-[16px] py-[12px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[16px] text-[rgba(59,59,59,0.5)]">Email address</p>
      </div>
      <div aria-hidden="true" className="absolute border-[#1abc9c] border-[1.818px] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}

function Container41() {
  return (
    <div className="absolute h-[20px] left-0 top-[95.58px] w-[912.955px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#8c8c8c] text-[14px] top-[-0.09px]">Border changes to turquoise with subtle outline</p>
    </div>
  );
}

function Container39() {
  return (
    <div className="h-[115.582px] relative shrink-0 w-full" data-name="Container">
      <Container40 />
      <TextInput />
      <Container41 />
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex flex-col gap-[23.991px] h-[251.52px] items-start relative shrink-0 w-full" data-name="Container">
      <Container36 />
      <Container39 />
    </div>
  );
}

function Container34() {
  return (
    <div className="bg-white h-[365.298px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-[0.909px] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col gap-[23.991px] items-start pb-[0.909px] pt-[32.898px] px-[32.898px] relative size-full">
        <Paragraph3 />
        <Container35 />
      </div>
    </div>
  );
}

function Section2() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[23.992px] h-[437.287px] items-start left-[319.99px] top-[1087px] w-[978.75px]" data-name="Section">
      <Heading3 />
      <Container34 />
    </div>
  );
}

function Heading4() {
  return (
    <div className="h-[47.997px] relative shrink-0 w-full" data-name="Heading 2">
      <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[48px] left-0 not-italic text-[#3b3b3b] text-[32px] top-[0.91px]">Interactive States</p>
    </div>
  );
}

function Heading5() {
  return (
    <div className="content-stretch flex h-[26.989px] items-start relative shrink-0 w-full" data-name="Heading 3">
      <p className="flex-[1_0_0] font-['Poppins:SemiBold',sans-serif] leading-[27px] min-h-px min-w-px not-italic relative text-[#3b3b3b] text-[18px] whitespace-pre-wrap">Primary Button States</p>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#1abc9c] h-[47.969px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[220.66px] not-italic text-[16px] text-center text-white top-[10.81px]">Default</p>
    </div>
  );
}

function Container47() {
  return (
    <div className="content-stretch flex h-[15.994px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[16px] min-h-px min-w-px not-italic relative text-[#8c8c8c] text-[12px] whitespace-pre-wrap">Normal state</p>
    </div>
  );
}

function Container46() {
  return (
    <div className="content-stretch flex flex-col gap-[3.991px] h-[67.955px] items-start relative shrink-0 w-full" data-name="Container">
      <Button1 />
      <Container47 />
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#16a085] h-[47.969px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[220.36px] not-italic text-[16px] text-center text-white top-[10.81px]">Hover</p>
    </div>
  );
}

function Container49() {
  return (
    <div className="content-stretch flex h-[15.994px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[16px] min-h-px min-w-px not-italic relative text-[#8c8c8c] text-[12px] whitespace-pre-wrap">Mouse hover</p>
    </div>
  );
}

function Container48() {
  return (
    <div className="content-stretch flex flex-col gap-[3.991px] h-[67.955px] items-start relative shrink-0 w-full" data-name="Container">
      <Button2 />
      <Container49 />
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-[#138d75] h-[47.969px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[220.62px] not-italic text-[16px] text-center text-white top-[10.81px]">Active</p>
    </div>
  );
}

function Container51() {
  return (
    <div className="content-stretch flex h-[15.994px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[16px] min-h-px min-w-px not-italic relative text-[#8c8c8c] text-[12px] whitespace-pre-wrap">Click/press state</p>
    </div>
  );
}

function Container50() {
  return (
    <div className="content-stretch flex flex-col gap-[3.991px] h-[67.955px] items-start relative shrink-0 w-full" data-name="Container">
      <Button3 />
      <Container51 />
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-[#1abc9c] h-[47.969px] opacity-40 relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[220.49px] not-italic text-[16px] text-center text-white top-[10.81px]">Disabled</p>
    </div>
  );
}

function Container53() {
  return (
    <div className="content-stretch flex h-[15.994px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[16px] min-h-px min-w-px not-italic relative text-[#8c8c8c] text-[12px] whitespace-pre-wrap">40% opacity</p>
    </div>
  );
}

function Container52() {
  return (
    <div className="content-stretch flex flex-col gap-[3.991px] h-[67.955px] items-start relative shrink-0 w-full" data-name="Container">
      <Button4 />
      <Container53 />
    </div>
  );
}

function Container45() {
  return (
    <div className="content-stretch flex flex-col gap-[15.994px] h-[319.801px] items-start relative shrink-0 w-full" data-name="Container">
      <Container46 />
      <Container48 />
      <Container50 />
      <Container52 />
    </div>
  );
}

function Container44() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[15.994px] h-[377.33px] items-start left-0 top-0 w-[440.483px]" data-name="Container">
      <Heading5 />
      <Container45 />
    </div>
  );
}

function Heading6() {
  return (
    <div className="content-stretch flex h-[26.989px] items-start relative shrink-0 w-full" data-name="Heading 3">
      <p className="flex-[1_0_0] font-['Poppins:SemiBold',sans-serif] leading-[27px] min-h-px min-w-px not-italic relative text-[#3b3b3b] text-[18px] whitespace-pre-wrap">Secondary Button States</p>
    </div>
  );
}

function Button5() {
  return (
    <div className="h-[51.605px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#1abc9c] border-[1.818px] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[220.66px] not-italic text-[#1abc9c] text-[16px] text-center top-[12.63px]">Default</p>
    </div>
  );
}

function Container57() {
  return (
    <div className="content-stretch flex h-[15.994px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[16px] min-h-px min-w-px not-italic relative text-[#8c8c8c] text-[12px] whitespace-pre-wrap">Normal state</p>
    </div>
  );
}

function Container56() {
  return (
    <div className="content-stretch flex flex-col gap-[3.991px] h-[71.591px] items-start relative shrink-0 w-full" data-name="Container">
      <Button5 />
      <Container57 />
    </div>
  );
}

function Button6() {
  return (
    <div className="bg-[rgba(26,188,156,0.05)] h-[51.605px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#1abc9c] border-[1.818px] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[220.36px] not-italic text-[#1abc9c] text-[16px] text-center top-[12.63px]">Hover</p>
    </div>
  );
}

function Container59() {
  return (
    <div className="content-stretch flex h-[15.994px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[16px] min-h-px min-w-px not-italic relative text-[#8c8c8c] text-[12px] whitespace-pre-wrap">5% background tint</p>
    </div>
  );
}

function Container58() {
  return (
    <div className="content-stretch flex flex-col gap-[3.991px] h-[71.591px] items-start relative shrink-0 w-full" data-name="Container">
      <Button6 />
      <Container59 />
    </div>
  );
}

function Button7() {
  return (
    <div className="bg-[rgba(26,188,156,0.1)] h-[51.605px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#1abc9c] border-[1.818px] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[220.62px] not-italic text-[#1abc9c] text-[16px] text-center top-[12.63px]">Active</p>
    </div>
  );
}

function Container61() {
  return (
    <div className="content-stretch flex h-[15.994px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[16px] min-h-px min-w-px not-italic relative text-[#8c8c8c] text-[12px] whitespace-pre-wrap">10% background tint</p>
    </div>
  );
}

function Container60() {
  return (
    <div className="content-stretch flex flex-col gap-[3.991px] h-[71.591px] items-start relative shrink-0 w-full" data-name="Container">
      <Button7 />
      <Container61 />
    </div>
  );
}

function Button8() {
  return (
    <div className="h-[51.605px] opacity-40 relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#1abc9c] border-[1.818px] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[220.49px] not-italic text-[#1abc9c] text-[16px] text-center top-[12.63px]">Disabled</p>
    </div>
  );
}

function Container63() {
  return (
    <div className="content-stretch flex h-[15.994px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[16px] min-h-px min-w-px not-italic relative text-[#8c8c8c] text-[12px] whitespace-pre-wrap">40% opacity</p>
    </div>
  );
}

function Container62() {
  return (
    <div className="content-stretch flex flex-col gap-[3.991px] h-[71.591px] items-start relative shrink-0 w-full" data-name="Container">
      <Button8 />
      <Container63 />
    </div>
  );
}

function Container55() {
  return (
    <div className="content-stretch flex flex-col gap-[15.994px] h-[334.347px] items-start relative shrink-0 w-full" data-name="Container">
      <Container56 />
      <Container58 />
      <Container60 />
      <Container62 />
    </div>
  );
}

function Container54() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[15.994px] h-[377.33px] items-start left-[472.47px] top-0 w-[440.483px]" data-name="Container">
      <Heading6 />
      <Container55 />
    </div>
  );
}

function Container43() {
  return (
    <div className="h-[377.33px] relative shrink-0 w-full" data-name="Container">
      <Container44 />
      <Container54 />
    </div>
  );
}

function Container42() {
  return (
    <div className="bg-white h-[443.125px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-[0.909px] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col items-start pb-[0.909px] pt-[32.898px] px-[32.898px] relative size-full">
        <Container43 />
      </div>
    </div>
  );
}

function Section3() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[23.991px] h-[515.114px] items-start left-[319.99px] top-[1588.28px] w-[978.75px]" data-name="Section">
      <Heading4 />
      <Container42 />
    </div>
  );
}

function Tq() {
  return (
    <div className="absolute bg-[#fafafa] h-[779.091px] left-0 top-0 w-[1362.727px]" data-name="TQ">
      <Container />
      <Section />
      <Section1 />
      <Section2 />
      <Section3 />
    </div>
  );
}

function Container65() {
  return (
    <div className="h-[30px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Poppins:Bold',sans-serif] leading-[30px] left-0 not-italic text-[#1abc9c] text-[20px] top-[0.91px]">United Hotels</p>
    </div>
  );
}

function Container66() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#8c8c8c] text-[14px] top-[-0.09px]">Brand Guidelines</p>
    </div>
  );
}

function Container64() {
  return (
    <div className="h-[117.969px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[3.991px] items-start pt-[31.989px] px-[23.991px] relative size-full">
        <Container65 />
        <Container66 />
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="h-[35.994px] relative rounded-[12px] shrink-0 w-full" data-name="Link">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[15.99px] not-italic text-[#3b3b3b] text-[14px] top-[7.91px]">Cover</p>
    </div>
  );
}

function Link1() {
  return (
    <div className="h-[35.994px] relative rounded-[12px] shrink-0 w-full" data-name="Link">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[15.99px] not-italic text-[#3b3b3b] text-[14px] top-[7.91px]">Brand Essence</p>
    </div>
  );
}

function Link2() {
  return (
    <div className="h-[35.994px] relative rounded-[12px] shrink-0 w-full" data-name="Link">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[15.99px] not-italic text-[#3b3b3b] text-[14px] top-[7.91px]">Logo System</p>
    </div>
  );
}

function Link3() {
  return (
    <div className="h-[35.994px] relative rounded-[12px] shrink-0 w-full" data-name="Link">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[15.99px] not-italic text-[#3b3b3b] text-[14px] top-[7.91px]">Color System</p>
    </div>
  );
}

function Link4() {
  return (
    <div className="h-[35.994px] relative rounded-[12px] shrink-0 w-full" data-name="Link">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[15.99px] not-italic text-[#3b3b3b] text-[14px] top-[7.91px]">Typography</p>
    </div>
  );
}

function Link5() {
  return (
    <div className="h-[35.994px] relative rounded-[12px] shrink-0 w-full" data-name="Link">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[15.99px] not-italic text-[#3b3b3b] text-[14px] top-[7.91px]">{`Spacing & Grid`}</p>
    </div>
  );
}

function Link6() {
  return (
    <div className="bg-[#1abc9c] h-[35.994px] relative rounded-[12px] shrink-0 w-full" data-name="Link">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[15.99px] not-italic text-[14px] text-white top-[7.91px]">UI Foundations</p>
    </div>
  );
}

function Link7() {
  return (
    <div className="h-[35.994px] relative rounded-[12px] shrink-0 w-full" data-name="Link">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[15.99px] not-italic text-[#3b3b3b] text-[14px] top-[7.91px]">Components</p>
    </div>
  );
}

function Link8() {
  return (
    <div className="h-[35.994px] relative rounded-[12px] shrink-0 w-full" data-name="Link">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[15.99px] not-italic text-[#3b3b3b] text-[14px] top-[7.91px]">Iconography</p>
    </div>
  );
}

function Link9() {
  return (
    <div className="h-[35.994px] relative rounded-[12px] shrink-0 w-full" data-name="Link">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[15.99px] not-italic text-[#3b3b3b] text-[14px] top-[7.91px]">Photography</p>
    </div>
  );
}

function Link10() {
  return (
    <div className="h-[35.994px] relative rounded-[12px] shrink-0 w-full" data-name="Link">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[15.99px] not-italic text-[#3b3b3b] text-[14px] top-[7.91px]">Accessibility</p>
    </div>
  );
}

function Link11() {
  return (
    <div className="h-[35.994px] relative rounded-[12px] shrink-0 w-full" data-name="Link">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[15.99px] not-italic text-[#3b3b3b] text-[14px] top-[7.91px]">{`Voice & Messaging`}</p>
    </div>
  );
}

function Navigation() {
  return (
    <div className="h-[475.838px] relative shrink-0 w-full" data-name="Navigation">
      <div className="content-stretch flex flex-col gap-[3.991px] items-start px-[15.994px] relative size-full">
        <Link />
        <Link1 />
        <Link2 />
        <Link3 />
        <Link4 />
        <Link5 />
        <Link6 />
        <Link7 />
        <Link8 />
        <Link9 />
        <Link10 />
        <Link11 />
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <div className="absolute bg-white h-[779.091px] left-0 top-[90.91px] w-[255.085px]" data-name="Sidebar">
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <Container64 />
        <Navigation />
      </div>
      <div aria-hidden="true" className="absolute border-black border-r-[0.909px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

export default function BrandGuidelineDesignSystem() {
  return (
    <div className="bg-white relative size-full" data-name="Brand Guideline Design System">
      <Tq />
      <Sidebar />
    </div>
  );
}