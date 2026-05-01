import svgPaths from "./svg-nkrjt6kvoj";
const imgRectangle10 = "/figma-assets/2e73560823491cb7aae2b44b94830399bada8384.png";
const imgImageHotelInspection = "/figma-assets/9783e6851bc031fabe001ad50fc466eb1ba42e2e.png";
const imgImageHotel = "/figma-assets/24b94370ae50cf05c8eda404c2045b52c5b68320.png";
const imgImageHotel1 = "/figma-assets/126d7e43c8c296ca95f6cc5a2e933adaced67080.png";
const imgImageHotel2 = "/figma-assets/2192c11a429594d69f4c28f4fc3ed22cdc4449b5.png";
const imgImageSultanahmetFatih = "/figma-assets/87fe0e3882960f57017f9db63227776eab6248b5.png";
const imgImageTaksimBeyoglu = "/figma-assets/2d09c265965430947a0286c570bc0fa5fbd6debe.png";
const imgImageKadikoyAsianSide = "/figma-assets/250023f532e568305b14dfb57c614f51c1fba582.png";

function Heading() {
  return (
    <div className="absolute h-[71.989px] left-0 top-0 w-[1224.006px]" data-name="Heading 2">
      <p className="-translate-x-1/2 absolute font-['Poppins:Bold',sans-serif] leading-[72px] left-[612.11px] not-italic text-[#3b3b3b] text-[48px] text-center top-[2.73px] whitespace-nowrap">Not Another OTA.</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="absolute h-[60px] left-[292px] top-[79.99px] w-[640px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[30px] left-[320.14px] not-italic text-[#6b7280] text-[20px] text-center top-[-0.27px] w-[611px]">{`We specialize exclusively in stays in Istanbul. Here's how we're different.`}</p>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[148px] relative shrink-0 w-[1224px]" data-name="Container">
      <Heading />
      <Paragraph />
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[28px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="Icon">
          <path d={svgPaths.p15ff1180} id="Vector" stroke="var(--stroke-0, #1ABC9C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
          <path d={svgPaths.p4cb2400} id="Vector_2" stroke="var(--stroke-0, #1ABC9C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container2() {
  return (
    <div className="bg-[rgba(26,188,156,0.1)] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[56px]" data-name="Container">
      <Icon />
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start not-italic relative shrink-0 w-full">
      <p className="font-['Poppins:SemiBold',sans-serif] leading-[24px] relative shrink-0 text-[#3b3b3b] text-[20px] w-full">Personally Selected</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[25.6px] relative shrink-0 text-[#8c8c8c] text-[16px] w-full">Each hotel is handpicked by our local team</p>
    </div>
  );
}

function Frame13() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] h-[154px] items-start left-[24px] top-[32px] w-[296px]">
      <Container2 />
      <Frame9 />
    </div>
  );
}

function Container1() {
  return (
    <div className="bg-white content-stretch flex h-[218px] items-center justify-center px-[24px] py-[32px] relative rounded-[12px] shrink-0 w-[344px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-[0.727px] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Frame13 />
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[28px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="Icon">
          <path d="M14 2.33333V25.6667" id="Vector" stroke="var(--stroke-0, #1ABC9C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
          <path d={svgPaths.p2a38c0} id="Vector_2" stroke="var(--stroke-0, #1ABC9C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container4() {
  return (
    <div className="bg-[rgba(26,188,156,0.1)] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[56px]" data-name="Container">
      <Icon1 />
    </div>
  );
}

function Frame15() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start not-italic relative shrink-0 w-full">
      <p className="font-['Poppins:SemiBold',sans-serif] leading-[24px] relative shrink-0 text-[#3b3b3b] text-[20px] w-full">Better Direct Rates</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[25.6px] relative shrink-0 text-[#8c8c8c] text-[16px] w-full">{`Negotiated prices you won't find elsewhere`}</p>
    </div>
  );
}

function Frame14() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] h-[154px] items-start left-[24px] top-[32px] w-[296px]">
      <Container4 />
      <Frame15 />
    </div>
  );
}

function Container3() {
  return (
    <div className="bg-white content-stretch flex h-[218px] items-center justify-center px-[24px] py-[32px] relative rounded-[12px] shrink-0 w-[344px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-[0.727px] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Frame14 />
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[28px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="Icon">
          <path d={svgPaths.p390c3680} id="Vector" stroke="var(--stroke-0, #1ABC9C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
          <path d={svgPaths.p3c16f780} id="Vector_2" stroke="var(--stroke-0, #1ABC9C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container6() {
  return (
    <div className="bg-[rgba(26,188,156,0.1)] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[56px]" data-name="Container">
      <Icon2 />
    </div>
  );
}

function Frame17() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start not-italic relative shrink-0 w-full">
      <p className="font-['Poppins:SemiBold',sans-serif] leading-[24px] relative shrink-0 text-[#3b3b3b] text-[20px] w-full">Total Price Upfront</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[21px] relative shrink-0 text-[#8c8c8c] text-[16px] w-full">No surprise fees at checkout</p>
    </div>
  );
}

function Frame16() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] h-[154px] items-start left-[24px] top-[32px] w-[296px]">
      <Container6 />
      <Frame17 />
    </div>
  );
}

function Container5() {
  return (
    <div className="bg-white content-stretch flex h-[218px] items-center justify-center px-[24px] py-[32px] relative rounded-[12px] shrink-0 w-[344px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-[0.727px] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Frame16 />
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[28px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="Icon">
          <path d={svgPaths.p65a0a80} id="Vector" stroke="var(--stroke-0, #1ABC9C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container8() {
  return (
    <div className="bg-[rgba(26,188,156,0.1)] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[56px]" data-name="Container">
      <Icon3 />
    </div>
  );
}

function Frame19() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start not-italic relative shrink-0 w-full">
      <p className="font-['Poppins:SemiBold',sans-serif] leading-[24px] relative shrink-0 text-[#3b3b3b] text-[20px] w-full">WhatsApp Support</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[21px] relative shrink-0 text-[#8c8c8c] text-[16px] w-full">Real people, instant responses</p>
    </div>
  );
}

function Frame18() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] h-[154px] items-start left-[24px] top-[32px] w-[296px]">
      <Container8 />
      <Frame19 />
    </div>
  );
}

function Container7() {
  return (
    <div className="bg-white content-stretch flex h-[218px] items-center justify-center px-[24px] py-[32px] relative rounded-[12px] shrink-0 w-[344px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-[0.727px] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Frame18 />
    </div>
  );
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[28px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="Icon">
          <path d={svgPaths.p2bb5a00} id="Vector" stroke="var(--stroke-0, #1ABC9C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container10() {
  return (
    <div className="bg-[rgba(26,188,156,0.1)] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[56px]" data-name="Container">
      <Icon4 />
    </div>
  );
}

function Frame21() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start not-italic relative shrink-0 w-full">
      <p className="font-['Poppins:SemiBold',sans-serif] leading-[24px] relative shrink-0 text-[#3b3b3b] text-[20px] w-full">Flexible Cancellation</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[21px] relative shrink-0 text-[#8c8c8c] text-[16px] w-full">Most hotels offer free cancellation</p>
    </div>
  );
}

function Frame20() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] h-[154px] items-start left-[24px] top-[32px] w-[296px]">
      <Container10 />
      <Frame21 />
    </div>
  );
}

function Container9() {
  return (
    <div className="bg-white content-stretch flex h-[218px] items-center justify-center px-[24px] py-[32px] relative rounded-[12px] shrink-0 w-[344px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-[0.727px] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Frame20 />
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex gap-[30px] items-center relative shrink-0 w-full">
      <Container1 />
      <Container3 />
      <Container5 />
      <Container7 />
      <Container9 />
    </div>
  );
}

function Frame12() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[64px] items-center left-[40px] top-[238px] w-[1840px]">
      <Container />
      <Frame11 />
    </div>
  );
}

function Section() {
  return (
    <div className="-translate-x-1/2 absolute bg-white h-[906px] left-1/2 top-[761px] w-[1920px]" data-name="Section">
      <Frame12 />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-[calc(16.67%+112px)] not-italic text-[#fafafa] text-center top-[259px]">
      <p className="-translate-x-1/2 absolute font-['Poppins:Bold',sans-serif] leading-[72px] left-[calc(16.67%+640.5px)] text-[64px] top-[259px] w-[1057px]">{` Hotels in Istanbul Direct Rates No Hidden Fees`}</p>
      <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[28.8px] left-[calc(25%+480.5px)] text-[20px] top-[411px] w-[737px]">Handpicked affordable hotels in the best neighborhoods of Istanbul. Verified. Transparent. Local support.</p>
    </div>
  );
}

function Label() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[21px] left-0 not-italic text-[#3b3b3b] text-[14px] top-[-0.55px] whitespace-nowrap">Destination</p>
    </div>
  );
}

function TextInput() {
  return (
    <div className="absolute bg-[#fafafa] h-[49px] left-0 rounded-[8px] top-0 w-[312px]" data-name="Text Input">
      <div className="content-stretch flex items-center overflow-clip pl-[40px] pr-[16px] py-[12px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[#0a0a0a] text-[16px] whitespace-nowrap">Istanbul, Turkey</p>
      </div>
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-[0.727px] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Icon5() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Icon">
          <path d={svgPaths.p625a980} id="Vector" stroke="var(--stroke-0, #8C8C8C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p18c84c80} id="Vector_2" stroke="var(--stroke-0, #8C8C8C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[10px] h-[49px] items-center px-[12px] py-[16px] relative shrink-0 w-[312px]">
      <TextInput />
      <Icon5 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] items-start left-0 top-0 w-[312px]">
      <Label />
      <Frame />
    </div>
  );
}

function Label1() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[21px] left-0 not-italic text-[#3b3b3b] text-[14px] top-[-0.54px] whitespace-nowrap">Check-in</p>
    </div>
  );
}

function TextInput1() {
  return (
    <div className="absolute h-[49px] left-0 rounded-[8px] top-0 w-[312px]" data-name="Text Input">
      <div className="content-stretch flex items-center overflow-clip pl-[40px] pr-[12px] py-[12px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[16px] text-[rgba(10,10,10,0.5)] whitespace-nowrap">Select date</p>
      </div>
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-[0.727px] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Icon6() {
  return (
    <div className="absolute left-[12px] size-[18px] top-[15.73px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Icon">
          <path d="M6 1.5V4.5" id="Vector" stroke="var(--stroke-0, #8C8C8C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M12 1.5V4.5" id="Vector_2" stroke="var(--stroke-0, #8C8C8C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p13693a10} id="Vector_3" stroke="var(--stroke-0, #8C8C8C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M2.25 7.5H15.75" id="Vector_4" stroke="var(--stroke-0, #8C8C8C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Container13() {
  return (
    <div className="h-[49.455px] relative shrink-0 w-full" data-name="Container">
      <TextInput1 />
      <Icon6 />
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] h-[78.455px] items-start left-0 top-0 w-[197.455px]" data-name="Container">
      <Label1 />
      <Container13 />
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute h-[78px] left-[360px] top-0 w-[312px]" data-name="Container">
      <Container12 />
    </div>
  );
}

function Label2() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[21px] left-0 not-italic text-[#3b3b3b] text-[14px] top-[-0.54px] whitespace-nowrap">Check-out</p>
    </div>
  );
}

function TextInput2() {
  return (
    <div className="absolute h-[49px] left-0 rounded-[8px] top-0 w-[312px]" data-name="Text Input">
      <div className="content-stretch flex items-center overflow-clip pl-[40px] pr-[12px] py-[12px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[16px] text-[rgba(10,10,10,0.5)] whitespace-nowrap">Select date</p>
      </div>
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-[0.727px] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Icon7() {
  return (
    <div className="absolute left-[12px] size-[18px] top-[15.73px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Icon">
          <path d="M6 1.5V4.5" id="Vector" stroke="var(--stroke-0, #8C8C8C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M12 1.5V4.5" id="Vector_2" stroke="var(--stroke-0, #8C8C8C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p13693a10} id="Vector_3" stroke="var(--stroke-0, #8C8C8C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M2.25 7.5H15.75" id="Vector_4" stroke="var(--stroke-0, #8C8C8C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[49px] relative shrink-0 w-[298px]" data-name="Container">
      <TextInput2 />
      <Icon7 />
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] h-[78px] items-start left-[720px] top-0 w-[312px]" data-name="Container">
      <Label2 />
      <Container15 />
    </div>
  );
}

function Label3() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[21px] left-0 not-italic text-[#3b3b3b] text-[14px] top-[-0.55px] whitespace-nowrap">Guests</p>
    </div>
  );
}

function Option() {
  return <div className="absolute left-[-56.73px] size-0 top-[4520.61px]" data-name="Option" />;
}

function Option1() {
  return <div className="absolute left-[-56.73px] size-0 top-[4520.61px]" data-name="Option" />;
}

function Option2() {
  return <div className="absolute left-[-56.73px] size-0 top-[4520.61px]" data-name="Option" />;
}

function Option3() {
  return <div className="absolute left-[-56.73px] size-0 top-[4520.61px]" data-name="Option" />;
}

function Dropdown() {
  return (
    <div className="absolute bg-white border-[#eaeaea] border-[0.727px] border-solid h-[50px] left-[0.09px] rounded-[8px] top-[-0.45px] w-[312px]" data-name="Dropdown">
      <Option />
      <Option1 />
      <Option2 />
      <Option3 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[41.68px] not-italic text-[16px] text-[rgba(10,10,10,0.5)] top-[14.73px] whitespace-nowrap">Number of guests</p>
    </div>
  );
}

function Icon8() {
  return (
    <div className="absolute left-[12px] size-[18px] top-[15.73px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Icon">
          <path d={svgPaths.pd2eb480} id="Vector" stroke="var(--stroke-0, #8C8C8C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p19685c00} id="Vector_2" stroke="var(--stroke-0, #8C8C8C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p226d9800} id="Vector_3" stroke="var(--stroke-0, #8C8C8C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p2a5062c0} id="Vector_4" stroke="var(--stroke-0, #8C8C8C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Container17() {
  return (
    <div className="h-[50px] relative shrink-0 w-full" data-name="Container">
      <Dropdown />
      <Icon8 />
    </div>
  );
}

function Container16() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] h-[78px] items-start left-[1080px] top-0 w-[312px]" data-name="Container">
      <Label3 />
      <Container17 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="h-[78px] relative shrink-0 w-[1392px]">
      <Frame1 />
      <Container11 />
      <Container14 />
      <Container16 />
    </div>
  );
}

function Icon9() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.pcddfd00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p22acb800} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex gap-[7px] items-center relative shrink-0 w-[119px]">
      <Icon9 />
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-pre">{`Find  Hotels`}</p>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#1abc9c] content-stretch flex flex-col items-center justify-center px-[32px] py-[13px] relative rounded-[8px] shrink-0 w-[239px]" data-name="Button">
      <Frame3 />
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex gap-[48px] items-end justify-end relative shrink-0">
      <Frame2 />
      <Button />
    </div>
  );
}

function Frame5() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[158px] items-center justify-center left-[40px] px-[80px] py-[40px] rounded-[12px] top-[749px] w-[1840px]">
      <div aria-hidden="true" className="absolute border border-[#1abc9c] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.1)]" />
      <Frame4 />
    </div>
  );
}

function Frame6() {
  return <div className="absolute h-[24px] left-[53px] top-[28px] w-[26px]" />;
}

function ImageHotelInspection() {
  return (
    <div className="h-[602px] relative shrink-0 w-full" data-name="Image (Hotel inspection)">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImageHotelInspection} />
    </div>
  );
}

function Container18() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[602px] items-start left-[257px] overflow-clip rounded-[20px] shadow-[0px_16px_48px_0px_rgba(0,0,0,0.08)] top-[135px] w-[728px]" data-name="Container">
      <ImageHotelInspection />
    </div>
  );
}

function Heading1() {
  return (
    <div className="absolute h-[143.977px] left-0 top-0 w-[580.014px]" data-name="Heading 2">
      <p className="absolute font-['Poppins:Bold',sans-serif] leading-[72px] left-0 not-italic text-[#3b3b3b] text-[48px] top-[2.73px] w-[576px]">We Visit Every Hotel We List</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="absolute h-[91.747px] left-0 top-[167.97px] w-[580.014px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[30.6px] left-0 not-italic text-[#6b7280] text-[18px] top-[-0.36px] w-[528px]">{`Unlike generic booking platforms, we personally inspect each property. No hotel appears on our platform without our team's approval.`}</p>
    </div>
  );
}

function Icon10() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p3a88fb00} id="Vector" stroke="var(--stroke-0, #1ABC9C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Container23() {
  return (
    <div className="bg-[rgba(26,188,156,0.1)] relative rounded-[8px] shrink-0 size-[40px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon10 />
      </div>
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex h-[25.497px] items-start relative shrink-0 w-full" data-name="Heading 3">
      <p className="flex-[1_0_0] font-['Poppins:SemiBold',sans-serif] leading-[25.5px] min-h-px min-w-px not-italic relative text-[#3b3b3b] text-[17px]">Personally Reviewed</p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[23.991px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#6b7280] text-[15px] top-[-0.27px] whitespace-nowrap">Our local team visits and photographs each property before listing</p>
    </div>
  );
}

function Container24() {
  return (
    <div className="h-[55.483px] relative shrink-0 w-[469.119px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[5.994px] items-start relative size-full">
        <Heading2 />
        <Paragraph2 />
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex gap-[15.994px] h-[55.483px] items-start relative shrink-0 w-full" data-name="Container">
      <Container23 />
      <Container24 />
    </div>
  );
}

function Container21() {
  return (
    <div className="bg-white h-[97.301px] relative rounded-[12px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.909px] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="content-stretch flex flex-col items-start pb-[0.909px] pt-[20.909px] px-[20.909px] relative size-full">
        <Container22 />
      </div>
    </div>
  );
}

function Icon11() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p3a88fb00} id="Vector" stroke="var(--stroke-0, #1ABC9C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Container27() {
  return (
    <div className="bg-[rgba(26,188,156,0.1)] relative rounded-[8px] shrink-0 size-[40px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon11 />
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex h-[25.497px] items-start relative shrink-0 w-full" data-name="Heading 3">
      <p className="flex-[1_0_0] font-['Poppins:SemiBold',sans-serif] leading-[25.5px] min-h-px min-w-px not-italic relative text-[#3b3b3b] text-[17px]">Verified Location Accuracy</p>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[23.991px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#6b7280] text-[15px] top-[-0.27px] whitespace-nowrap">Exact distances and neighborhood details confirmed on-site</p>
    </div>
  );
}

function Container28() {
  return (
    <div className="h-[55.483px] relative shrink-0 w-[427.429px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[5.994px] items-start relative size-full">
        <Heading3 />
        <Paragraph3 />
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex gap-[15.994px] h-[55.483px] items-start relative shrink-0 w-full" data-name="Container">
      <Container27 />
      <Container28 />
    </div>
  );
}

function Container25() {
  return (
    <div className="bg-white h-[97.301px] relative rounded-[12px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.909px] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="content-stretch flex flex-col items-start pb-[0.909px] pt-[20.909px] px-[20.909px] relative size-full">
        <Container26 />
      </div>
    </div>
  );
}

function Icon12() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p3a88fb00} id="Vector" stroke="var(--stroke-0, #1ABC9C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Container31() {
  return (
    <div className="bg-[rgba(26,188,156,0.1)] relative rounded-[8px] shrink-0 size-[40px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon12 />
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="content-stretch flex h-[25.497px] items-start relative shrink-0 w-full" data-name="Heading 3">
      <p className="flex-[1_0_0] font-['Poppins:SemiBold',sans-serif] leading-[25.5px] min-h-px min-w-px not-italic relative text-[#3b3b3b] text-[17px]">Cleanliness Standards Checked</p>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="h-[23.991px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#6b7280] text-[15px] top-[-0.27px] whitespace-nowrap">We verify hygiene, room quality, and maintenance levels</p>
    </div>
  );
}

function Container32() {
  return (
    <div className="h-[55.483px] relative shrink-0 w-[398.466px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[5.994px] items-start relative size-full">
        <Heading4 />
        <Paragraph4 />
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex gap-[15.994px] h-[55.483px] items-start relative shrink-0 w-full" data-name="Container">
      <Container31 />
      <Container32 />
    </div>
  );
}

function Container29() {
  return (
    <div className="bg-white h-[97.301px] relative rounded-[12px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.909px] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="content-stretch flex flex-col items-start pb-[0.909px] pt-[20.909px] px-[20.909px] relative size-full">
        <Container30 />
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[20px] h-[331.903px] items-start left-0 top-[299.72px] w-[580.014px]" data-name="Container">
      <Container21 />
      <Container25 />
      <Container29 />
    </div>
  );
}

function Container19() {
  return (
    <div className="absolute h-[631.619px] left-[1077px] top-[119px] w-[580.014px]" data-name="Container">
      <Heading1 />
      <Paragraph1 />
      <Container20 />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-[257px] top-[119px]">
      <Container18 />
      <Container19 />
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents left-[257px] top-[119px]">
      <Group1 />
    </div>
  );
}

function Section1() {
  return (
    <div className="-translate-x-1/2 absolute bg-[#fafafa] h-[872px] left-1/2 top-[1667px] w-[1920px]" data-name="Section">
      <Group2 />
    </div>
  );
}

function Heading5() {
  return (
    <div className="absolute h-[71.989px] left-0 top-0 w-[1224.006px]" data-name="Heading 2">
      <p className="-translate-x-1/2 absolute font-['Poppins:Bold',sans-serif] leading-[72px] left-[612.39px] not-italic text-[#3b3b3b] text-[48px] text-center top-[2.73px] whitespace-nowrap">Featured Budget Hotels</p>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="absolute h-[60px] left-[292px] top-[87.98px] w-[640px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[30px] left-[320.05px] not-italic text-[#6b7280] text-[20px] text-center top-[-0.27px] w-[584px]">{`Handpicked stays offering exceptional value in Istanbul's best neighborhoods`}</p>
    </div>
  );
}

function Container33() {
  return (
    <div className="h-[147.983px] relative shrink-0 w-full" data-name="Container">
      <Heading5 />
      <Paragraph5 />
    </div>
  );
}

function ImageHotel() {
  return (
    <div className="absolute h-[240px] left-[0.09px] top-[0.25px] w-[494px]" data-name="Image (Hotel)">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImageHotel} />
    </div>
  );
}

function Container37() {
  return (
    <div className="absolute bg-[#10b981] h-[31.477px] left-[398.09px] rounded-[8px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] top-[16.99px] w-[79.957px]" data-name="Container">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[19.5px] left-[11.99px] not-italic text-[13px] text-white top-[6.81px] whitespace-nowrap">Save $15</p>
    </div>
  );
}

function Container36() {
  return (
    <div className="h-[240px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <ImageHotel />
      <Container37 />
    </div>
  );
}

function Heading6() {
  return (
    <div className="absolute h-[30px] left-[23.99px] top-[23.99px] w-[339.531px]" data-name="Heading 3">
      <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[30px] left-0 not-italic text-[#3b3b3b] text-[20px] top-[0.91px] whitespace-nowrap">Sultanahmet Boutique Hotel</p>
    </div>
  );
}

function Icon13() {
  return (
    <div className="relative shrink-0 size-[13.991px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9915 13.9915">
        <g clipPath="url(#clip0_20_530)" id="Icon">
          <path d={svgPaths.p3ceb6d00} id="Vector" stroke="var(--stroke-0, #8C8C8C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16596" />
          <path d={svgPaths.p170a980} id="Vector_2" stroke="var(--stroke-0, #8C8C8C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16596" />
        </g>
        <defs>
          <clipPath id="clip0_20_530">
            <rect fill="white" height="13.9915" width="13.9915" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[21.009px] relative shrink-0 w-[143.707px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-0 not-italic text-[#6b7280] text-[14px] top-[-0.18px] whitespace-nowrap">Sultanahmet, Old City</p>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="absolute content-stretch flex gap-[5.994px] h-[21.009px] items-center left-[23.99px] top-[61.99px] w-[339.531px]" data-name="Container">
      <Icon13 />
      <Text />
    </div>
  );
}

function Icon14() {
  return (
    <div className="relative shrink-0 size-[13.991px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9915 13.9915">
        <g clipPath="url(#clip0_20_517)" id="Icon">
          <path d={svgPaths.p1b477ca0} fill="var(--fill-0, #FFA500)" id="Vector" stroke="var(--stroke-0, #FFA500)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16596" />
        </g>
        <defs>
          <clipPath id="clip0_20_517">
            <rect fill="white" height="13.9915" width="13.9915" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Icon15() {
  return (
    <div className="relative shrink-0 size-[13.991px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9915 13.9915">
        <g clipPath="url(#clip0_20_517)" id="Icon">
          <path d={svgPaths.p1b477ca0} fill="var(--fill-0, #FFA500)" id="Vector" stroke="var(--stroke-0, #FFA500)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16596" />
        </g>
        <defs>
          <clipPath id="clip0_20_517">
            <rect fill="white" height="13.9915" width="13.9915" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Icon16() {
  return (
    <div className="relative shrink-0 size-[13.991px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9915 13.9915">
        <g clipPath="url(#clip0_20_517)" id="Icon">
          <path d={svgPaths.p1b477ca0} fill="var(--fill-0, #FFA500)" id="Vector" stroke="var(--stroke-0, #FFA500)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16596" />
        </g>
        <defs>
          <clipPath id="clip0_20_517">
            <rect fill="white" height="13.9915" width="13.9915" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Icon17() {
  return (
    <div className="relative shrink-0 size-[13.991px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9915 13.9915">
        <g clipPath="url(#clip0_20_517)" id="Icon">
          <path d={svgPaths.p1b477ca0} fill="var(--fill-0, #FFA500)" id="Vector" stroke="var(--stroke-0, #FFA500)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16596" />
        </g>
        <defs>
          <clipPath id="clip0_20_517">
            <rect fill="white" height="13.9915" width="13.9915" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Icon18() {
  return (
    <div className="relative shrink-0 size-[13.991px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9915 13.9915">
        <g clipPath="url(#clip0_20_527)" id="Icon">
          <path d={svgPaths.p1b477ca0} id="Vector" stroke="var(--stroke-0, #E5E7EB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16596" />
        </g>
        <defs>
          <clipPath id="clip0_20_527">
            <rect fill="white" height="13.9915" width="13.9915" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container41() {
  return (
    <div className="h-[13.991px] relative shrink-0 w-[69.957px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Icon14 />
        <Icon15 />
        <Icon16 />
        <Icon17 />
        <Icon18 />
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[19.489px] relative shrink-0 w-[81.023px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] left-0 not-italic text-[#6b7280] text-[13px] top-[0.82px] whitespace-nowrap">(127 reviews)</p>
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="absolute content-stretch flex gap-[7.997px] h-[19.489px] items-center left-[23.99px] top-[98.99px] w-[339.531px]" data-name="Container">
      <Container41 />
      <Text1 />
    </div>
  );
}

function Text2() {
  return (
    <div className="h-[19.489px] relative shrink-0 w-[60.952px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] left-0 not-italic text-[#6b7280] text-[13px] top-[0.82px] whitespace-nowrap">OTA Price</p>
      </div>
    </div>
  );
}

function Text3() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[27.017px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[text-decoration-skip-ink:none] absolute decoration-solid font-['Inter:Regular',sans-serif] font-normal leading-[22.5px] left-0 line-through not-italic text-[#6b7280] text-[15px] top-[-1.18px] whitespace-nowrap">$57</p>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Text2 />
          <Text3 />
        </div>
      </div>
    </div>
  );
}

function Text4() {
  return (
    <div className="h-[19.489px] relative shrink-0 w-[73.082px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[19.5px] left-0 not-italic text-[#1abc9c] text-[13px] top-[0.82px] whitespace-nowrap">Direct Price</p>
      </div>
    </div>
  );
}

function Text5() {
  return (
    <div className="absolute h-[41.989px] left-0 top-0 w-[53.381px]" data-name="Text">
      <p className="absolute font-['Poppins:Bold',sans-serif] leading-[42px] left-0 not-italic text-[#1abc9c] text-[28px] top-[0.91px] whitespace-nowrap">$42</p>
    </div>
  );
}

function Text6() {
  return (
    <div className="absolute h-[21.009px] left-[59.38px] top-[14.55px] w-[38.153px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-0 not-italic text-[#6b7280] text-[14px] top-[-0.18px] whitespace-nowrap">/night</p>
    </div>
  );
}

function Container45() {
  return (
    <div className="h-[41.989px] relative shrink-0 w-[97.528px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Text5 />
        <Text6 />
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="h-[41.989px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Text4 />
          <Container45 />
        </div>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="absolute bg-[#fafafa] content-stretch flex flex-col gap-[7.997px] h-[105px] items-start left-[24.09px] pt-[15.994px] px-[15.994px] rounded-[10px] top-[134.25px] w-[446px]" data-name="Container">
      <Container43 />
      <Container44 />
    </div>
  );
}

function Text7() {
  return (
    <div className="h-[19.489px] relative shrink-0 w-[104.915px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] left-0 not-italic text-[#ef4444] text-[13px] top-[0.82px] whitespace-nowrap">Only 2 rooms left</p>
      </div>
    </div>
  );
}

function Container46() {
  return (
    <div className="absolute content-stretch flex h-[19.489px] items-center justify-between left-[23.99px] pr-[234.616px] top-[258.95px] w-[339.531px]" data-name="Container">
      <Text7 />
    </div>
  );
}

function Button1() {
  return (
    <div className="-translate-x-1/2 absolute bg-[#1abc9c] h-[51px] left-1/2 rounded-[10px] top-[294.25px] w-[446px]" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[22.5px] left-[223px] not-italic text-[15px] text-center text-white top-[13.81px] whitespace-nowrap">View Rooms</p>
    </div>
  );
}

function Container38() {
  return (
    <div className="h-[368.906px] relative shrink-0 w-full" data-name="Container">
      <Heading6 />
      <Container39 />
      <Container40 />
      <Container42 />
      <Container46 />
      <Button1 />
    </div>
  );
}

function Container35() {
  return (
    <div className="absolute bg-white h-[611px] left-[-167px] rounded-[16px] top-[-0.14px] w-[496px]" data-name="Container">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[0.909px] relative rounded-[inherit] size-full">
        <Container36 />
        <Container38 />
      </div>
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.909px] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

function ImageHotel1() {
  return (
    <div className="absolute h-[241px] left-[0.09px] top-[-0.75px] w-[495px]" data-name="Image (Hotel)">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[117.35%] left-0 max-w-none top-[-8.47%] w-[99.8%]" src={imgImageHotel1} />
      </div>
    </div>
  );
}

function Container49() {
  return (
    <div className="absolute bg-[#10b981] h-[31.477px] left-[398.09px] rounded-[8px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] top-[15.99px] w-[80.099px]" data-name="Container">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[19.5px] left-[11.99px] not-italic text-[13px] text-white top-[6.81px] whitespace-nowrap">Save $12</p>
    </div>
  );
}

function Container48() {
  return (
    <div className="h-[240px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <ImageHotel1 />
      <Container49 />
    </div>
  );
}

function Heading7() {
  return (
    <div className="absolute h-[30px] left-[23.99px] top-[23.99px] w-[339.531px]" data-name="Heading 3">
      <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[30px] left-0 not-italic text-[#3b3b3b] text-[20px] top-[0.91px] whitespace-nowrap">Taksim Central Stay</p>
    </div>
  );
}

function Icon19() {
  return (
    <div className="relative shrink-0 size-[13.991px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9915 13.9915">
        <g clipPath="url(#clip0_20_530)" id="Icon">
          <path d={svgPaths.p3ceb6d00} id="Vector" stroke="var(--stroke-0, #8C8C8C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16596" />
          <path d={svgPaths.p170a980} id="Vector_2" stroke="var(--stroke-0, #8C8C8C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16596" />
        </g>
        <defs>
          <clipPath id="clip0_20_530">
            <rect fill="white" height="13.9915" width="13.9915" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text8() {
  return (
    <div className="h-[21.009px] relative shrink-0 w-[107.869px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-0 not-italic text-[#6b7280] text-[14px] top-[-0.18px] whitespace-nowrap">Taksim, Beyoğlu</p>
      </div>
    </div>
  );
}

function Container51() {
  return (
    <div className="absolute content-stretch flex gap-[5.994px] h-[21.009px] items-center left-[23.99px] top-[61.99px] w-[339.531px]" data-name="Container">
      <Icon19 />
      <Text8 />
    </div>
  );
}

function Icon20() {
  return (
    <div className="absolute left-0 size-[13.991px] top-0" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9915 13.9915">
        <g clipPath="url(#clip0_20_544)" id="Icon">
          <path d={svgPaths.p1b477ca0} fill="var(--fill-0, #FFA500)" id="Vector" stroke="var(--stroke-0, #FFA500)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16596" />
        </g>
        <defs>
          <clipPath id="clip0_20_544">
            <rect fill="white" height="13.9915" width="13.9915" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Icon21() {
  return (
    <div className="absolute left-[13.99px] size-[13.991px] top-0" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9915 13.9915">
        <g clipPath="url(#clip0_20_544)" id="Icon">
          <path d={svgPaths.p1b477ca0} fill="var(--fill-0, #FFA500)" id="Vector" stroke="var(--stroke-0, #FFA500)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16596" />
        </g>
        <defs>
          <clipPath id="clip0_20_544">
            <rect fill="white" height="13.9915" width="13.9915" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Icon22() {
  return (
    <div className="absolute left-[27.98px] size-[13.991px] top-0" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9915 13.9915">
        <g clipPath="url(#clip0_20_544)" id="Icon">
          <path d={svgPaths.p1b477ca0} fill="var(--fill-0, #FFA500)" id="Vector" stroke="var(--stroke-0, #FFA500)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16596" />
        </g>
        <defs>
          <clipPath id="clip0_20_544">
            <rect fill="white" height="13.9915" width="13.9915" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Icon23() {
  return (
    <div className="absolute left-[41.97px] size-[13.991px] top-0" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9915 13.9915">
        <g clipPath="url(#clip0_20_544)" id="Icon">
          <path d={svgPaths.p1b477ca0} fill="var(--fill-0, #FFA500)" id="Vector" stroke="var(--stroke-0, #FFA500)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16596" />
        </g>
        <defs>
          <clipPath id="clip0_20_544">
            <rect fill="white" height="13.9915" width="13.9915" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Icon24() {
  return (
    <div className="absolute left-[55.97px] size-[13.991px] top-0" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9915 13.9915">
        <g clipPath="url(#clip0_20_524)" id="Icon">
          <path d={svgPaths.p1b477ca0} id="Vector" stroke="var(--stroke-0, #E5E7EB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16596" />
        </g>
        <defs>
          <clipPath id="clip0_20_524">
            <rect fill="white" height="13.9915" width="13.9915" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container53() {
  return (
    <div className="h-[13.991px] relative shrink-0 w-[69.957px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon20 />
        <Icon21 />
        <Icon22 />
        <Icon23 />
        <Icon24 />
      </div>
    </div>
  );
}

function Text9() {
  return (
    <div className="h-[19.489px] relative shrink-0 w-[76.548px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] left-0 not-italic text-[#6b7280] text-[13px] top-[0.82px] whitespace-nowrap">(89 reviews)</p>
      </div>
    </div>
  );
}

function Container52() {
  return (
    <div className="absolute content-stretch flex gap-[7.997px] h-[19.489px] items-center left-[23.99px] top-[98.99px] w-[339.531px]" data-name="Container">
      <Container53 />
      <Text9 />
    </div>
  );
}

function Text10() {
  return (
    <div className="h-[19.489px] relative shrink-0 w-[60.952px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] left-0 not-italic text-[#6b7280] text-[13px] top-[0.82px] whitespace-nowrap">OTA Price</p>
      </div>
    </div>
  );
}

function Text11() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[27.997px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[text-decoration-skip-ink:none] absolute decoration-solid font-['Inter:Regular',sans-serif] font-normal leading-[22.5px] left-0 line-through not-italic text-[#6b7280] text-[15px] top-[-1.18px] whitespace-nowrap">$50</p>
      </div>
    </div>
  );
}

function Container55() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Text10 />
          <Text11 />
        </div>
      </div>
    </div>
  );
}

function Text12() {
  return (
    <div className="h-[19.489px] relative shrink-0 w-[73.082px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[19.5px] left-0 not-italic text-[#1abc9c] text-[13px] top-[0.82px] whitespace-nowrap">Direct Price</p>
      </div>
    </div>
  );
}

function Text13() {
  return (
    <div className="absolute h-[41.989px] left-0 top-0 w-[53.509px]" data-name="Text">
      <p className="absolute font-['Poppins:Bold',sans-serif] leading-[42px] left-0 not-italic text-[#1abc9c] text-[28px] top-[0.91px] whitespace-nowrap">$38</p>
    </div>
  );
}

function Text14() {
  return (
    <div className="absolute h-[21.009px] left-[59.5px] top-[14.55px] w-[38.153px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-0 not-italic text-[#6b7280] text-[14px] top-[-0.18px] whitespace-nowrap">/night</p>
    </div>
  );
}

function Container57() {
  return (
    <div className="h-[41.989px] relative shrink-0 w-[97.656px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Text13 />
        <Text14 />
      </div>
    </div>
  );
}

function Container56() {
  return (
    <div className="content-stretch flex h-[41.989px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Text12 />
      <Container57 />
    </div>
  );
}

function Container54() {
  return (
    <div className="absolute bg-[#fafafa] content-stretch flex flex-col gap-[7.997px] h-[105px] items-start left-[24.09px] pt-[15.994px] px-[15.994px] rounded-[10px] top-[134.25px] w-[446px]" data-name="Container">
      <Container55 />
      <Container56 />
    </div>
  );
}

function Text15() {
  return (
    <div className="h-[19.489px] relative shrink-0 w-[162.202px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] left-0 not-italic text-[#6b7280] text-[13px] top-[0.82px] whitespace-nowrap">Booked 12 times this week</p>
      </div>
    </div>
  );
}

function Container58() {
  return (
    <div className="absolute content-stretch flex h-[19.489px] items-center justify-between left-[23.99px] pr-[177.33px] top-[258.95px] w-[339.531px]" data-name="Container">
      <Text15 />
    </div>
  );
}

function Button2() {
  return (
    <div className="-translate-x-1/2 absolute bg-[#1abc9c] h-[51px] left-1/2 rounded-[10px] top-[294.25px] w-[446px]" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[22.5px] left-[223px] not-italic text-[15px] text-center text-white top-[12.81px] whitespace-nowrap">View Rooms</p>
    </div>
  );
}

function Container50() {
  return (
    <div className="h-[368.906px] relative shrink-0 w-full" data-name="Container">
      <Heading7 />
      <Container51 />
      <Container52 />
      <Container54 />
      <Container58 />
      <Button2 />
    </div>
  );
}

function Container47() {
  return (
    <div className="absolute bg-white h-[611px] left-[364px] rounded-[16px] top-[-0.14px] w-[496px]" data-name="Container">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[0.909px] relative rounded-[inherit] size-full">
        <Container48 />
        <Container50 />
      </div>
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.909px] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

function ImageHotel2() {
  return (
    <div className="absolute h-[241px] left-[0.09px] top-[-0.75px] w-[495px]" data-name="Image (Hotel)">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImageHotel2} />
    </div>
  );
}

function Container61() {
  return (
    <div className="absolute bg-[#10b981] h-[31.477px] left-[397.09px] rounded-[8px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] top-[16.99px] w-[80.099px]" data-name="Container">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[19.5px] left-[11.99px] not-italic text-[13px] text-white top-[6.81px] whitespace-nowrap">Save $12</p>
    </div>
  );
}

function Container60() {
  return (
    <div className="h-[240px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <ImageHotel2 />
      <Container61 />
    </div>
  );
}

function Heading8() {
  return (
    <div className="absolute h-[30px] left-[23.99px] top-[23.99px] w-[339.545px]" data-name="Heading 3">
      <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[30px] left-0 not-italic text-[#3b3b3b] text-[20px] top-[0.91px] whitespace-nowrap">Kadıköy Harbor View</p>
    </div>
  );
}

function Icon25() {
  return (
    <div className="relative shrink-0 size-[13.991px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9915 13.9915">
        <g clipPath="url(#clip0_20_530)" id="Icon">
          <path d={svgPaths.p3ceb6d00} id="Vector" stroke="var(--stroke-0, #8C8C8C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16596" />
          <path d={svgPaths.p170a980} id="Vector_2" stroke="var(--stroke-0, #8C8C8C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16596" />
        </g>
        <defs>
          <clipPath id="clip0_20_530">
            <rect fill="white" height="13.9915" width="13.9915" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text16() {
  return (
    <div className="h-[21.009px] relative shrink-0 w-[129.574px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-0 not-italic text-[#6b7280] text-[14px] top-[-0.18px] whitespace-nowrap">Kadıköy, Asian Side</p>
      </div>
    </div>
  );
}

function Container63() {
  return (
    <div className="absolute content-stretch flex gap-[5.994px] h-[21.009px] items-center left-[23.99px] top-[61.99px] w-[339.545px]" data-name="Container">
      <Icon25 />
      <Text16 />
    </div>
  );
}

function Icon26() {
  return (
    <div className="relative shrink-0 size-[13.991px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9915 13.9915">
        <g clipPath="url(#clip0_20_517)" id="Icon">
          <path d={svgPaths.p1b477ca0} fill="var(--fill-0, #FFA500)" id="Vector" stroke="var(--stroke-0, #FFA500)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16596" />
        </g>
        <defs>
          <clipPath id="clip0_20_517">
            <rect fill="white" height="13.9915" width="13.9915" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Icon27() {
  return (
    <div className="relative shrink-0 size-[13.991px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9915 13.9915">
        <g clipPath="url(#clip0_20_517)" id="Icon">
          <path d={svgPaths.p1b477ca0} fill="var(--fill-0, #FFA500)" id="Vector" stroke="var(--stroke-0, #FFA500)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16596" />
        </g>
        <defs>
          <clipPath id="clip0_20_517">
            <rect fill="white" height="13.9915" width="13.9915" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Icon28() {
  return (
    <div className="relative shrink-0 size-[13.991px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9915 13.9915">
        <g clipPath="url(#clip0_20_517)" id="Icon">
          <path d={svgPaths.p1b477ca0} fill="var(--fill-0, #FFA500)" id="Vector" stroke="var(--stroke-0, #FFA500)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16596" />
        </g>
        <defs>
          <clipPath id="clip0_20_517">
            <rect fill="white" height="13.9915" width="13.9915" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Icon29() {
  return (
    <div className="relative shrink-0 size-[13.991px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9915 13.9915">
        <g clipPath="url(#clip0_20_517)" id="Icon">
          <path d={svgPaths.p1b477ca0} fill="var(--fill-0, #FFA500)" id="Vector" stroke="var(--stroke-0, #FFA500)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16596" />
        </g>
        <defs>
          <clipPath id="clip0_20_517">
            <rect fill="white" height="13.9915" width="13.9915" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Icon30() {
  return (
    <div className="relative shrink-0 size-[13.991px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9915 13.9915">
        <g clipPath="url(#clip0_20_517)" id="Icon">
          <path d={svgPaths.p1b477ca0} fill="var(--fill-0, #FFA500)" id="Vector" stroke="var(--stroke-0, #FFA500)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16596" />
        </g>
        <defs>
          <clipPath id="clip0_20_517">
            <rect fill="white" height="13.9915" width="13.9915" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container65() {
  return (
    <div className="h-[13.991px] relative shrink-0 w-[69.957px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Icon26 />
        <Icon27 />
        <Icon28 />
        <Icon29 />
        <Icon30 />
      </div>
    </div>
  );
}

function Text17() {
  return (
    <div className="h-[19.489px] relative shrink-0 w-[81.506px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] left-0 not-italic text-[#6b7280] text-[13px] top-[0.82px] whitespace-nowrap">(156 reviews)</p>
      </div>
    </div>
  );
}

function Container64() {
  return (
    <div className="absolute content-stretch flex gap-[7.997px] h-[19.489px] items-center left-[23.99px] top-[98.99px] w-[339.545px]" data-name="Container">
      <Container65 />
      <Text17 />
    </div>
  );
}

function Text18() {
  return (
    <div className="h-[19.489px] relative shrink-0 w-[60.952px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] left-0 not-italic text-[#6b7280] text-[13px] top-[0.82px] whitespace-nowrap">OTA Price</p>
      </div>
    </div>
  );
}

function Text19() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[27.017px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="[text-decoration-skip-ink:none] absolute decoration-solid font-['Inter:Regular',sans-serif] font-normal leading-[22.5px] left-0 line-through not-italic text-[#6b7280] text-[15px] top-[-1.18px] whitespace-nowrap">$57</p>
      </div>
    </div>
  );
}

function Container67() {
  return (
    <div className="content-stretch flex h-[22.5px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Text18 />
      <Text19 />
    </div>
  );
}

function Text20() {
  return (
    <div className="h-[19.489px] relative shrink-0 w-[73.082px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[19.5px] left-0 not-italic text-[#1abc9c] text-[13px] top-[0.82px] whitespace-nowrap">Direct Price</p>
      </div>
    </div>
  );
}

function Text21() {
  return (
    <div className="absolute h-[41.989px] left-0 top-0 w-[55.582px]" data-name="Text">
      <p className="absolute font-['Poppins:Bold',sans-serif] leading-[42px] left-0 not-italic text-[#1abc9c] text-[28px] top-[0.91px] whitespace-nowrap">$45</p>
    </div>
  );
}

function Text22() {
  return (
    <div className="absolute h-[21.009px] left-[61.58px] top-[14.55px] w-[38.153px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-0 not-italic text-[#6b7280] text-[14px] top-[-0.18px] whitespace-nowrap">/night</p>
    </div>
  );
}

function Container69() {
  return (
    <div className="h-[41.989px] relative shrink-0 w-[99.73px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Text21 />
        <Text22 />
      </div>
    </div>
  );
}

function Container68() {
  return (
    <div className="h-[41.989px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Text20 />
          <Container69 />
        </div>
      </div>
    </div>
  );
}

function Container66() {
  return (
    <div className="absolute bg-[#fafafa] content-stretch flex flex-col gap-[7.997px] h-[105px] items-start left-[24.09px] pt-[15.994px] px-[15.994px] rounded-[10px] top-[134.25px] w-[446px]" data-name="Container">
      <Container67 />
      <Container68 />
    </div>
  );
}

function Text23() {
  return (
    <div className="h-[19.489px] relative shrink-0 w-[118.196px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] left-0 not-italic text-[#10b981] text-[13px] top-[0.82px] whitespace-nowrap">✓ Free cancellation</p>
      </div>
    </div>
  );
}

function Container70() {
  return (
    <div className="absolute content-stretch flex h-[19.489px] items-center justify-between left-[23.99px] pr-[221.349px] top-[258.95px] w-[339.545px]" data-name="Container">
      <Text23 />
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute bg-[#1abc9c] h-[51px] left-[24.09px] rounded-[10px] top-[294.25px] w-[446px]" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[22.5px] left-[223px] not-italic text-[15px] text-center text-white top-[12.81px] whitespace-nowrap">View Rooms</p>
    </div>
  );
}

function Container62() {
  return (
    <div className="h-[368.906px] relative shrink-0 w-full" data-name="Container">
      <Heading8 />
      <Container63 />
      <Container64 />
      <Container66 />
      <Container70 />
      <Button3 />
    </div>
  );
}

function Container59() {
  return (
    <div className="absolute bg-white h-[611px] left-[895px] rounded-[16px] top-[-0.14px] w-[496px]" data-name="Container">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[0.909px] relative rounded-[inherit] size-full">
        <Container60 />
        <Container62 />
      </div>
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.909px] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

function Container34() {
  return (
    <div className="h-[610.724px] relative shrink-0 w-full" data-name="Container">
      <Container35 />
      <Container47 />
      <Container59 />
    </div>
  );
}

function Frame8() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex flex-col gap-[64px] items-start left-1/2 top-[60px] w-[1224.006px]">
      <Container33 />
      <Container34 />
    </div>
  );
}

function Icon31() {
  return (
    <div className="absolute left-[225.64px] size-[20px] top-[17.98px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d="M7.5 15L12.5 10L7.5 5" id="Vector" stroke="var(--stroke-0, #1ABC9C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="-translate-x-1/2 absolute bg-white border-[#1abc9c] border-[1.818px] border-solid h-[59px] left-[calc(50%-0.5px)] rounded-[10px] top-[963px] w-[289px]" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] left-[128.5px] not-italic text-[#1abc9c] text-[16px] text-center top-[14.81px] whitespace-nowrap">View All Budget Hotels</p>
      <Icon31 />
    </div>
  );
}

function Section2() {
  return (
    <div className="-translate-x-1/2 absolute bg-white h-[1102px] left-1/2 top-[2567px] w-[1920px]" data-name="Section">
      <Frame8 />
      <Button4 />
    </div>
  );
}

function Heading9() {
  return (
    <div className="absolute h-[57px] left-0 top-[-1px] w-[1224px]" data-name="Heading 2">
      <p className="-translate-x-1/2 absolute font-['Poppins:Bold',sans-serif] h-[68px] leading-[72px] left-[612px] not-italic text-[#3b3b3b] text-[48px] text-center top-[-12px] w-[696px]">Best Areas for Budget Hotels</p>
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="absolute h-[30px] left-[292px] top-[64.49px] w-[640px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[30px] left-[319.5px] not-italic text-[#6b7280] text-[20px] text-center top-[-0.27px] whitespace-nowrap">Choose the perfect neighborhood for your Istanbul adventure</p>
    </div>
  );
}

function Container71() {
  return (
    <div className="absolute h-[94px] left-[348px] top-[80px] w-[1224px]" data-name="Container">
      <Heading9 />
      <Paragraph6 />
    </div>
  );
}

function ImageSultanahmetFatih() {
  return (
    <div className="absolute h-[320px] left-0 top-0 w-[446px]" data-name="Image (Sultanahmet & Fatih)">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImageSultanahmetFatih} />
    </div>
  );
}

function Container74() {
  return <div className="absolute bg-gradient-to-t from-[rgba(0,0,0,0.7)] h-[320px] left-0 to-[rgba(0,0,0,0)] top-0 via-1/2 via-[rgba(0,0,0,0.3)] w-[446px]" data-name="Container" />;
}

function Heading10() {
  return (
    <div className="h-[36.009px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Poppins:Bold',sans-serif] leading-[36px] left-0 not-italic text-[24px] text-white top-[0.91px] whitespace-nowrap">{`Sultanahmet & Fatih`}</p>
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[22.5px] left-0 not-italic text-[15px] text-[rgba(255,255,255,0.9)] top-[-1.18px] whitespace-nowrap">Historic heart with iconic landmarks</p>
    </div>
  );
}

function Container75() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[7.997px] h-[165px] items-start left-0 pt-[27.997px] px-[27.997px] top-[155px] w-[389.332px]" data-name="Container">
      <Heading10 />
      <Paragraph7 />
    </div>
  );
}

function Container73() {
  return (
    <div className="absolute h-[320px] left-0 overflow-clip rounded-[16px] top-0 w-[446px]" data-name="Container">
      <ImageSultanahmetFatih />
      <Container74 />
      <Container75 />
    </div>
  );
}

function ImageTaksimBeyoglu() {
  return (
    <div className="absolute h-[320px] left-0 top-0 w-[446px]" data-name="Image (Taksim & Beyoğlu)">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImageTaksimBeyoglu} />
    </div>
  );
}

function Container77() {
  return <div className="absolute bg-gradient-to-t from-[rgba(0,0,0,0.7)] h-[320px] left-0 to-[rgba(0,0,0,0)] top-0 via-1/2 via-[rgba(0,0,0,0.3)] w-[446px]" data-name="Container" />;
}

function Heading11() {
  return (
    <div className="h-[36.009px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Poppins:Bold',sans-serif] leading-[36px] left-0 not-italic text-[24px] text-white top-[0.91px] whitespace-nowrap">{`Taksim & Beyoğlu`}</p>
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[22.5px] left-0 not-italic text-[15px] text-[rgba(255,255,255,0.9)] top-[-1.18px] whitespace-nowrap">{`Vibrant modern district & nightlife`}</p>
    </div>
  );
}

function Container78() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[7.997px] h-[165px] items-start left-0 pt-[27.997px] px-[27.997px] top-[155px] w-[389.332px]" data-name="Container">
      <Heading11 />
      <Paragraph8 />
    </div>
  );
}

function Container76() {
  return (
    <div className="absolute h-[320px] left-[485px] overflow-clip rounded-[16px] top-0 w-[446px]" data-name="Container">
      <ImageTaksimBeyoglu />
      <Container77 />
      <Container78 />
    </div>
  );
}

function ImageKadikoyAsianSide() {
  return (
    <div className="absolute h-[320px] left-0 top-0 w-[446px]" data-name="Image (Kadıköy (Asian Side))">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImageKadikoyAsianSide} />
    </div>
  );
}

function Container80() {
  return <div className="absolute bg-gradient-to-t from-[rgba(0,0,0,0.7)] h-[320px] left-0 to-[rgba(0,0,0,0)] top-0 via-1/2 via-[rgba(0,0,0,0.3)] w-[446px]" data-name="Container" />;
}

function Heading12() {
  return (
    <div className="h-[36.009px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Poppins:Bold',sans-serif] leading-[36px] left-0 not-italic text-[24px] text-white top-[0.91px] whitespace-nowrap">Kadıköy (Asian Side)</p>
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[22.5px] left-0 not-italic text-[15px] text-[rgba(255,255,255,0.9)] top-[-1.18px] whitespace-nowrap">Authentic local experience</p>
    </div>
  );
}

function Container81() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[7.997px] h-[165px] items-start left-0 pt-[27.997px] px-[27.997px] top-[155px] w-[389.347px]" data-name="Container">
      <Heading12 />
      <Paragraph9 />
    </div>
  );
}

function Container79() {
  return (
    <div className="absolute h-[320px] left-[969px] overflow-clip rounded-[16px] top-0 w-[446px]" data-name="Container">
      <ImageKadikoyAsianSide />
      <Container80 />
      <Container81 />
    </div>
  );
}

function Container72() {
  return (
    <div className="absolute content-stretch flex gap-[10px] h-[320px] items-start left-[252px] p-[10px] top-[254px] w-[1415px]" data-name="Container">
      <Container73 />
      <Container76 />
      <Container79 />
    </div>
  );
}

function Section3() {
  return (
    <div className="-translate-x-1/2 absolute bg-[#fafafa] h-[667px] left-1/2 top-[3672px] w-[1920px]" data-name="Section">
      <Container71 />
      <Container72 />
    </div>
  );
}

function Heading13() {
  return (
    <div className="h-[120px] relative shrink-0 w-full" data-name="Heading 2">
      <p className="absolute font-['Poppins:Bold',sans-serif] leading-[60px] left-0 not-italic text-[#3b3b3b] text-[40px] top-[1.82px] w-[727px]">Budget Hotels in Istanbul – Affordable Stays in Prime Locations</p>
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="absolute h-[91.79px] left-0 top-0 w-[744.006px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[0] left-0 not-italic text-[#4b5563] text-[17px] top-[0.54px] w-[727px]">
        <span className="leading-[30.6px]">{`Finding quality `}</span>
        <span className="[text-decoration-skip-ink:none] decoration-solid leading-[30.6px] text-[#1abc9c] underline">budget accommodation in Istanbul</span>
        <span className="leading-[30.6px]">{` doesn't mean compromising on comfort or location. At United Hotels, we've personally inspected and selected the best affordable hotels across Istanbul's most popular neighborhoods.`}</span>
      </p>
    </div>
  );
}

function Container83() {
  return <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0)] h-[0.994px] left-0 to-[rgba(0,0,0,0)] top-[123.78px] via-1/2 via-[#e5e7eb] w-[744.006px]" data-name="Container" />;
}

function Heading14() {
  return (
    <div className="absolute h-[36.009px] left-0 top-[164.77px] w-[744.006px]" data-name="Heading 3">
      <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[36px] left-0 not-italic text-[#3b3b3b] text-[24px] top-[0.91px] whitespace-nowrap">Why Choose United Hotels?</p>
    </div>
  );
}

function Text24() {
  return (
    <div className="absolute h-[30.597px] left-0 top-[5.99px] w-[9.574px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[30.6px] left-0 not-italic text-[#1abc9c] text-[17px] top-[0.55px] whitespace-nowrap">•</p>
    </div>
  );
}

function Text25() {
  return (
    <div className="absolute h-[30.597px] left-[21.56px] top-0 w-[595.142px]" data-name="Text">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[0] left-0 not-italic text-[#4b5563] text-[0px] text-[17px] top-[0.54px] whitespace-nowrap">
        <span className="leading-[30.6px]">Local Expertise:</span>
        <span className="font-['Inter:Regular',sans-serif] font-normal leading-[30.6px]">{` Our Istanbul-based team personally visits every property`}</span>
      </p>
    </div>
  );
}

function ListItem() {
  return (
    <div className="h-[36.591px] relative shrink-0 w-full" data-name="List Item">
      <Text24 />
      <Text25 />
    </div>
  );
}

function Text26() {
  return (
    <div className="absolute h-[30.597px] left-0 top-[5.99px] w-[9.574px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[30.6px] left-0 not-italic text-[#1abc9c] text-[17px] top-[0.55px] whitespace-nowrap">•</p>
    </div>
  );
}

function Text27() {
  return (
    <div className="absolute h-[30.597px] left-[21.56px] top-0 w-[510.682px]" data-name="Text">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[0] left-0 not-italic text-[#4b5563] text-[0px] text-[17px] top-[0.55px] whitespace-nowrap">
        <span className="leading-[30.6px]">Direct Rates:</span>
        <span className="font-['Inter:Regular',sans-serif] font-normal leading-[30.6px]">{` Better prices through exclusive hotel partnerships`}</span>
      </p>
    </div>
  );
}

function ListItem1() {
  return (
    <div className="h-[36.591px] relative shrink-0 w-full" data-name="List Item">
      <Text26 />
      <Text27 />
    </div>
  );
}

function Text28() {
  return (
    <div className="absolute h-[30.597px] left-0 top-[5.99px] w-[9.574px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[30.6px] left-0 not-italic text-[#1abc9c] text-[17px] top-[0.55px] whitespace-nowrap">•</p>
    </div>
  );
}

function Text29() {
  return (
    <div className="absolute h-[30.597px] left-[21.56px] top-0 w-[546.932px]" data-name="Text">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[0] left-0 not-italic text-[#4b5563] text-[0px] text-[17px] top-[0.54px] whitespace-nowrap">
        <span className="leading-[30.6px]">Total Transparency:</span>
        <span className="font-['Inter:Regular',sans-serif] font-normal leading-[30.6px]">{` What you see is what you pay—no hidden fees`}</span>
      </p>
    </div>
  );
}

function ListItem2() {
  return (
    <div className="h-[36.591px] relative shrink-0 w-full" data-name="List Item">
      <Text28 />
      <Text29 />
    </div>
  );
}

function Text30() {
  return (
    <div className="absolute h-[30.597px] left-0 top-[5.99px] w-[9.574px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[30.6px] left-0 not-italic text-[#1abc9c] text-[17px] top-[0.54px] whitespace-nowrap">•</p>
    </div>
  );
}

function Text31() {
  return (
    <div className="absolute h-[30.597px] left-[21.56px] top-0 w-[454.489px]" data-name="Text">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[0] left-0 not-italic text-[#4b5563] text-[0px] text-[17px] top-[0.54px] whitespace-nowrap">
        <span className="leading-[30.6px]">24/7 Support:</span>
        <span className="font-['Inter:Regular',sans-serif] font-normal leading-[30.6px]">{` WhatsApp assistance from our local team`}</span>
      </p>
    </div>
  );
}

function ListItem3() {
  return (
    <div className="h-[36.591px] relative shrink-0 w-full" data-name="List Item">
      <Text30 />
      <Text31 />
    </div>
  );
}

function List() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[15.994px] h-[194.347px] items-start left-[23.99px] top-[220.78px] w-[720.014px]" data-name="List">
      <ListItem />
      <ListItem1 />
      <ListItem2 />
      <ListItem3 />
    </div>
  );
}

function Container84() {
  return <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0)] h-[0.994px] left-0 to-[rgba(0,0,0,0)] top-[447.12px] via-1/2 via-[#e5e7eb] w-[744.006px]" data-name="Container" />;
}

function Paragraph11() {
  return (
    <div className="absolute h-[91.79px] left-0 top-[480.1px] w-[744.006px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[0] left-0 not-italic text-[#4b5563] text-[17px] top-[0.54px] w-[726px]">
        <span className="leading-[30.6px]">{`Whether you're planning a weekend getaway or extended cultural exploration, our curated selection puts you in Istanbul's best neighborhoods without breaking the bank. With `}</span>
        <span className="[text-decoration-skip-ink:none] decoration-solid leading-[30.6px] text-[#1abc9c] underline">free cancellation</span>
        <span className="leading-[30.6px]">{` on most bookings and local support, you can book with confidence.`}</span>
      </p>
    </div>
  );
}

function Container82() {
  return (
    <div className="h-[571.889px] relative shrink-0 w-full" data-name="Container">
      <Paragraph10 />
      <Container83 />
      <Heading14 />
      <List />
      <Container84 />
      <Paragraph11 />
    </div>
  );
}

function Section4() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[31.989px] h-[964px] items-start left-0 pt-[120px] px-[493.906px] top-[4339px] w-[1920px]" data-name="Section">
      <Heading13 />
      <Container82 />
    </div>
  );
}

function Heading15() {
  return (
    <div className="h-[71.989px] relative shrink-0 w-full" data-name="Heading 2">
      <p className="-translate-x-1/2 absolute font-['Poppins:Bold',sans-serif] leading-[72px] left-[372.28px] not-italic text-[#3b3b3b] text-[48px] text-center top-[2.73px] whitespace-nowrap">Frequently Asked Questions</p>
    </div>
  );
}

function Paragraph12() {
  return (
    <div className="h-[26.989px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[27px] left-[372.07px] not-italic text-[#6b7280] text-[18px] text-center top-[-0.18px] whitespace-nowrap">Everything you need to know about budget hotels in Istanbul</p>
    </div>
  );
}

function Container85() {
  return (
    <div className="content-stretch flex flex-col gap-[15.994px] h-[114.972px] items-start relative shrink-0 w-full" data-name="Container">
      <Heading15 />
      <Paragraph12 />
    </div>
  );
}

function Text32() {
  return (
    <div className="h-[23.991px] relative shrink-0 w-[464.915px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[24px] left-0 not-italic text-[#3b3b3b] text-[16px] top-[0.91px] whitespace-nowrap">What is the average price of a budget hotel in Istanbul?</p>
      </div>
    </div>
  );
}

function Icon32() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d="M5 7.5L10 12.5L15 7.5" id="Vector" stroke="var(--stroke-0, #1ABC9C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button5() {
  return (
    <div className="h-[60px] relative shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[15.994px] relative size-full">
          <Text32 />
          <Icon32 />
        </div>
      </div>
    </div>
  );
}

function Container87() {
  return (
    <div className="bg-white h-[61.818px] relative rounded-[12px] shrink-0 w-full" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start p-[0.909px] relative size-full">
          <Button5 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-[0.909px] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}

function Text33() {
  return (
    <div className="h-[23.991px] relative shrink-0 w-[297.33px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[24px] left-0 not-italic text-[#3b3b3b] text-[16px] top-[0.91px] whitespace-nowrap">Are budget hotels in Istanbul safe?</p>
      </div>
    </div>
  );
}

function Icon33() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d="M5 7.5L10 12.5L15 7.5" id="Vector" stroke="var(--stroke-0, #1ABC9C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button6() {
  return (
    <div className="h-[60px] relative shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[15.994px] relative size-full">
          <Text33 />
          <Icon33 />
        </div>
      </div>
    </div>
  );
}

function Container88() {
  return (
    <div className="bg-white h-[61.818px] relative rounded-[12px] shrink-0 w-full" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start p-[0.909px] relative size-full">
          <Button6 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-[0.909px] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}

function Text34() {
  return (
    <div className="h-[23.991px] relative shrink-0 w-[368.864px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[24px] left-0 not-italic text-[#3b3b3b] text-[16px] top-[0.91px] whitespace-nowrap">When is the cheapest time to visit Istanbul?</p>
      </div>
    </div>
  );
}

function Icon34() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d="M5 7.5L10 12.5L15 7.5" id="Vector" stroke="var(--stroke-0, #1ABC9C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button7() {
  return (
    <div className="h-[60px] relative shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[15.994px] relative size-full">
          <Text34 />
          <Icon34 />
        </div>
      </div>
    </div>
  );
}

function Container89() {
  return (
    <div className="bg-white h-[61.818px] relative rounded-[12px] shrink-0 w-full" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start p-[0.909px] relative size-full">
          <Button7 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-[0.909px] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}

function Container86() {
  return (
    <div className="content-stretch flex flex-col gap-[11.989px] h-[209.432px] items-start relative shrink-0 w-full" data-name="Container">
      <Container87 />
      <Container88 />
      <Container89 />
    </div>
  );
}

function Section5() {
  return (
    <div className="absolute bg-[#fafafa] content-stretch flex flex-col gap-[63.991px] h-[628px] items-start left-0 pt-[120px] px-[493.906px] top-[5303px] w-[1920px]" data-name="Section">
      <Container85 />
      <Container86 />
    </div>
  );
}

function Heading16() {
  return (
    <div className="h-[30px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Poppins:Bold',sans-serif] leading-[30px] left-0 not-italic text-[20px] text-white top-[0.91px] whitespace-nowrap">United Hotels</p>
    </div>
  );
}

function Paragraph13() {
  return (
    <div className="h-[76.491px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[25.5px] left-0 not-italic text-[15px] text-[rgba(255,255,255,0.7)] top-[-0.36px] w-[270px]">{`Istanbul's budget hotel experts. Direct rates, transparent pricing, local support.`}</p>
    </div>
  );
}

function Container91() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[20px] h-[153.082px] items-start left-0 top-0 w-[270px]" data-name="Container">
      <Heading16 />
      <Paragraph13 />
    </div>
  );
}

function Heading17() {
  return (
    <div className="content-stretch flex h-[25.497px] items-start relative shrink-0 w-full" data-name="Heading 4">
      <p className="flex-[1_0_0] font-['Poppins:SemiBold',sans-serif] leading-[25.5px] min-h-px min-w-px not-italic relative text-[17px] text-white">Quick Links</p>
    </div>
  );
}

function ListItem4() {
  return (
    <div className="h-[24.318px] relative shrink-0 w-full" data-name="List Item">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[22.5px] left-0 not-italic text-[15px] text-[rgba(255,255,255,0.7)] top-[0.64px] whitespace-nowrap">Home</p>
    </div>
  );
}

function ListItem5() {
  return (
    <div className="h-[24.318px] relative shrink-0 w-full" data-name="List Item">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[22.5px] left-0 not-italic text-[15px] text-[rgba(255,255,255,0.7)] top-[0.64px] whitespace-nowrap">Find Hotels</p>
    </div>
  );
}

function ListItem6() {
  return (
    <div className="h-[24.318px] relative shrink-0 w-full" data-name="List Item">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[22.5px] left-0 not-italic text-[15px] text-[rgba(255,255,255,0.7)] top-[0.64px] whitespace-nowrap">My Bookings</p>
    </div>
  );
}

function List1() {
  return (
    <div className="content-stretch flex flex-col gap-[11.988px] h-[96.932px] items-start relative shrink-0 w-full" data-name="List">
      <ListItem4 />
      <ListItem5 />
      <ListItem6 />
    </div>
  );
}

function Container92() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[20px] h-[153.082px] items-start left-[318px] top-0 w-[270px]" data-name="Container">
      <Heading17 />
      <List1 />
    </div>
  );
}

function Heading18() {
  return (
    <div className="content-stretch flex h-[25.497px] items-start relative shrink-0 w-full" data-name="Heading 4">
      <p className="flex-[1_0_0] font-['Poppins:SemiBold',sans-serif] leading-[25.5px] min-h-px min-w-px not-italic relative text-[17px] text-white">Neighborhoods</p>
    </div>
  );
}

function ListItem7() {
  return (
    <div className="h-[24.318px] relative shrink-0 w-full" data-name="List Item">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[22.5px] left-0 not-italic text-[15px] text-[rgba(255,255,255,0.7)] top-[0.64px] whitespace-nowrap">{`Sultanahmet & Fatih`}</p>
    </div>
  );
}

function ListItem8() {
  return (
    <div className="h-[24.318px] relative shrink-0 w-full" data-name="List Item">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[22.5px] left-0 not-italic text-[15px] text-[rgba(255,255,255,0.7)] top-[0.64px] whitespace-nowrap">{`Taksim & Beyoğlu`}</p>
    </div>
  );
}

function ListItem9() {
  return (
    <div className="h-[24.318px] relative shrink-0 w-full" data-name="List Item">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[22.5px] left-0 not-italic text-[15px] text-[rgba(255,255,255,0.7)] top-[0.64px] whitespace-nowrap">Kadıköy</p>
    </div>
  );
}

function List2() {
  return (
    <div className="content-stretch flex flex-col gap-[11.988px] h-[96.932px] items-start relative shrink-0 w-full" data-name="List">
      <ListItem7 />
      <ListItem8 />
      <ListItem9 />
    </div>
  );
}

function Container93() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[20px] h-[153.082px] items-start left-[635.99px] top-0 w-[270px]" data-name="Container">
      <Heading18 />
      <List2 />
    </div>
  );
}

function Heading19() {
  return (
    <div className="content-stretch flex h-[25.497px] items-start relative shrink-0 w-full" data-name="Heading 4">
      <p className="flex-[1_0_0] font-['Poppins:SemiBold',sans-serif] leading-[25.5px] min-h-px min-w-px not-italic relative text-[17px] text-white">Contact</p>
    </div>
  );
}

function Icon35() {
  return (
    <div className="relative shrink-0 size-[17.997px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.9972 17.9972">
        <g clipPath="url(#clip0_20_570)" id="Icon">
          <path d={svgPaths.p21ca77c0} id="Vector" stroke="var(--stroke-0, #1ABC9C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49976" />
        </g>
        <defs>
          <clipPath id="clip0_20_570">
            <rect fill="white" height="17.9972" width="17.9972" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container96() {
  return (
    <div className="absolute h-[19.489px] left-0 top-0 w-[128.949px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] left-0 not-italic text-[13px] text-[rgba(255,255,255,0.6)] top-[0.82px] whitespace-nowrap">WhatsApp</p>
    </div>
  );
}

function Container95() {
  return (
    <div className="h-[45.795px] relative shrink-0 w-[128.949px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container96 />
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[22.5px] left-0 not-italic text-[15px] text-[rgba(255,255,255,0.9)] top-[22.11px] whitespace-nowrap">+90 555 123 4567</p>
      </div>
    </div>
  );
}

function ListItem10() {
  return (
    <div className="content-stretch flex gap-[10px] h-[45.795px] items-start relative shrink-0 w-full" data-name="List Item">
      <Icon35 />
      <Container95 />
    </div>
  );
}

function Icon36() {
  return (
    <div className="relative shrink-0 size-[17.997px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.9972 17.9972">
        <g clipPath="url(#clip0_20_534)" id="Icon">
          <path d={svgPaths.p3aa5d600} id="Vector" stroke="var(--stroke-0, #1ABC9C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49976" />
          <path d={svgPaths.pc886900} id="Vector_2" stroke="var(--stroke-0, #1ABC9C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49976" />
        </g>
        <defs>
          <clipPath id="clip0_20_534">
            <rect fill="white" height="17.9972" width="17.9972" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container98() {
  return (
    <div className="absolute h-[19.489px] left-0 top-0 w-[170.369px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] left-0 not-italic text-[13px] text-[rgba(255,255,255,0.6)] top-[0.82px] whitespace-nowrap">Email</p>
    </div>
  );
}

function Container97() {
  return (
    <div className="h-[45.795px] relative shrink-0 w-[170.369px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container98 />
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[22.5px] left-0 not-italic text-[15px] text-[rgba(255,255,255,0.9)] top-[22.11px] whitespace-nowrap">hello@unitedhotels.com</p>
      </div>
    </div>
  );
}

function ListItem11() {
  return (
    <div className="content-stretch flex gap-[10px] h-[45.795px] items-start relative shrink-0 w-full" data-name="List Item">
      <Icon36 />
      <Container97 />
    </div>
  );
}

function List3() {
  return (
    <div className="content-stretch flex flex-col gap-[15.994px] h-[107.585px] items-start relative shrink-0 w-full" data-name="List">
      <ListItem10 />
      <ListItem11 />
    </div>
  );
}

function Container94() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[20px] h-[153.082px] items-start left-[953.99px] top-0 w-[270.014px]" data-name="Container">
      <Heading19 />
      <List3 />
    </div>
  );
}

function Container90() {
  return (
    <div className="h-[153.082px] relative shrink-0 w-full" data-name="Container">
      <Container91 />
      <Container92 />
      <Container93 />
      <Container94 />
    </div>
  );
}

function Paragraph14() {
  return (
    <div className="h-[21.009px] relative shrink-0 w-[276.662px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-0 not-italic text-[14px] text-[rgba(255,255,255,0.6)] top-[-0.18px] whitespace-nowrap">© 2025 United Hotels. All rights reserved.</p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="h-[21.009px] relative shrink-0 w-[112.756px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-0 not-italic text-[14px] text-[rgba(255,255,255,0.6)] top-[-0.18px] whitespace-nowrap">Terms of Service</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="h-[21.009px] relative shrink-0 w-[92.571px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-0 not-italic text-[14px] text-[rgba(255,255,255,0.6)] top-[-0.18px] whitespace-nowrap">Privacy Policy</p>
      </div>
    </div>
  );
}

function Link2() {
  return (
    <div className="h-[21.009px] relative shrink-0 w-[89.83px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-0 not-italic text-[14px] text-[rgba(255,255,255,0.6)] top-[-0.18px] whitespace-nowrap">Cookie Policy</p>
      </div>
    </div>
  );
}

function Container101() {
  return (
    <div className="h-[21.009px] relative shrink-0 w-[359.134px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[31.989px] items-start relative size-full">
        <Link />
        <Link1 />
        <Link2 />
      </div>
    </div>
  );
}

function Container100() {
  return (
    <div className="h-[21.009px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Paragraph14 />
          <Container101 />
        </div>
      </div>
    </div>
  );
}

function Container99() {
  return (
    <div className="content-stretch flex flex-col h-[53.906px] items-start pt-[32.897px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[rgba(255,255,255,0.1)] border-solid border-t-[0.909px] inset-0 pointer-events-none" />
      <Container100 />
    </div>
  );
}

function Footer() {
  return (
    <div className="absolute bg-[#3b3b3b] content-stretch flex flex-col gap-[55.994px] h-[407px] items-start left-0 pt-[71.989px] px-[253.906px] top-[6555px] w-[1920px]" data-name="Footer">
      <Container90 />
      <Container99 />
    </div>
  );
}

function Container103() {
  return <div className="absolute bg-white blur-[64px] left-[1331.82px] rounded-[30504000px] size-[400px] top-0" data-name="Container" />;
}

function Container104() {
  return <div className="absolute bg-white blur-[64px] left-0 rounded-[30504000px] size-[300px] top-[323.85px]" data-name="Container" />;
}

function Container102() {
  return (
    <div className="absolute h-[624px] left-0 opacity-10 top-0 w-[1920px]" data-name="Container">
      <Container103 />
      <Container104 />
    </div>
  );
}

function Heading20() {
  return (
    <div className="absolute h-[123.182px] left-[48px] top-0 w-[824.006px]" data-name="Heading 2">
      <p className="-translate-x-1/2 absolute font-['Poppins:Bold',sans-serif] leading-[61.6px] left-[calc(50%-0.41px)] not-italic text-[56px] text-center text-white top-[2.91px] w-[805px]">Ready to Book Your Istanbul Stay?</p>
    </div>
  );
}

function Paragraph15() {
  return (
    <div className="absolute h-[35.199px] left-[48px] top-[147.17px] w-[824.006px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[35.2px] left-[412.78px] not-italic text-[22px] text-[rgba(255,255,255,0.95)] text-center top-[-0.36px] whitespace-nowrap">Join thousands of travelers who chose direct booking and saved money</p>
    </div>
  );
}

function Icon37() {
  return (
    <div className="absolute left-[48px] size-[23.991px] top-[21.49px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.9915 23.9915">
        <g id="Icon">
          <path d={svgPaths.pcc77110} id="Vector" stroke="var(--stroke-0, #1ABC9C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99929" />
          <path d={svgPaths.p2aec1e00} id="Vector_2" stroke="var(--stroke-0, #1ABC9C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99929" />
        </g>
      </svg>
    </div>
  );
}

function Button8() {
  return (
    <div className="absolute bg-white h-[66.989px] left-[288.84px] rounded-[12px] top-[222.37px] w-[342.315px]" data-name="Button">
      <Icon37 />
      <p className="-translate-x-1/2 absolute font-['Inter:Bold',sans-serif] font-bold leading-[27px] left-[189.48px] not-italic text-[#1abc9c] text-[18px] text-center top-[19.82px] whitespace-nowrap">Find Budget Hotels Now</p>
    </div>
  );
}

function Icon38() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p3a88fb00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Text35() {
  return (
    <div className="flex-[1_0_0] h-[22.5px] min-h-px min-w-px relative" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[22.5px] left-[60.5px] not-italic text-[15px] text-center text-white top-[-1.18px] whitespace-nowrap">Free cancellation</p>
      </div>
    </div>
  );
}

function Container107() {
  return (
    <div className="absolute content-stretch flex gap-[10px] h-[22.5px] items-center left-[153.61px] top-0 w-[150.923px]" data-name="Container">
      <Icon38 />
      <Text35 />
    </div>
  );
}

function Icon39() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p3a88fb00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Text36() {
  return (
    <div className="flex-[1_0_0] h-[22.5px] min-h-px min-w-px relative" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[22.5px] left-[54px] not-italic text-[15px] text-center text-white top-[-1.18px] whitespace-nowrap">No hidden fees</p>
      </div>
    </div>
  );
}

function Container108() {
  return (
    <div className="absolute content-stretch flex gap-[10px] h-[22.5px] items-center left-[336.52px] top-0 w-[137.741px]" data-name="Container">
      <Icon39 />
      <Text36 />
    </div>
  );
}

function Icon40() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p3a88fb00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Text37() {
  return (
    <div className="flex-[1_0_0] h-[22.5px] min-h-px min-w-px relative" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[22.5px] left-[67px] not-italic text-[15px] text-center text-white top-[-1.18px] whitespace-nowrap">Local support 24/7</p>
      </div>
    </div>
  );
}

function Container109() {
  return (
    <div className="absolute content-stretch flex gap-[10px] h-[22.5px] items-center left-[506.25px] top-0 w-[164.134px]" data-name="Container">
      <Icon40 />
      <Text37 />
    </div>
  );
}

function Container106() {
  return (
    <div className="absolute h-[22.5px] left-[48px] top-[321.35px] w-[824.006px]" data-name="Container">
      <Container107 />
      <Container108 />
      <Container109 />
    </div>
  );
}

function Container105() {
  return (
    <div className="-translate-x-1/2 absolute h-[343.849px] left-1/2 top-[140px] w-[920px]" data-name="Container">
      <Heading20 />
      <Paragraph15 />
      <Button8 />
      <Container106 />
    </div>
  );
}

function Section6() {
  return (
    <div className="absolute bg-[#1abc9c] h-[624px] left-0 overflow-clip top-[5931px] w-[1920px]" data-name="Section">
      <Container102 />
      <Container105 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
      <div className="h-[26px] relative shrink-0 w-[28px]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 26">
          <g id="Vector">
            <mask fill="white" id="path-1-inside-1_35_2723">
              <path d={svgPaths.p32095b00} />
            </mask>
            <path d={svgPaths.p32095b00} fill="var(--fill-0, #1ABC9C)" mask="url(#path-1-inside-1_35_2723)" stroke="var(--stroke-4, #FAFAFA)" strokeWidth="0.4" />
          </g>
        </svg>
      </div>
      <p className="font-['Poppins:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#1abc9c] text-[24px] text-center whitespace-nowrap">{`United Hotel `}</p>
    </div>
  );
}

function Container111() {
  return (
    <div className="relative shrink-0 w-[201px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center px-[8px] py-[3px] relative w-full">
        <Frame7 />
      </div>
    </div>
  );
}

function Link3() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[45.199px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[22.5px] left-0 not-italic text-[#3b3b3b] text-[15px] top-[-1.18px] whitespace-nowrap">Hotels</p>
      </div>
    </div>
  );
}

function Link4() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[109.773px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[22.5px] left-0 not-italic text-[#3b3b3b] text-[15px] top-[-1.18px] whitespace-nowrap">Neighborhoods</p>
      </div>
    </div>
  );
}

function Link5() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[89.048px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[22.5px] left-0 not-italic text-[#3b3b3b] text-[15px] top-[-1.18px] whitespace-nowrap">Travel Guide</p>
      </div>
    </div>
  );
}

function Link6() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[91.932px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[22.5px] left-0 not-italic text-[#3b3b3b] text-[15px] top-[-1.18px] whitespace-nowrap">My Bookings</p>
      </div>
    </div>
  );
}

function Container112() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[455.952px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[40px] items-center relative size-full">
        <Link3 />
        <Link4 />
        <Link5 />
        <Link6 />
      </div>
    </div>
  );
}

function Container110() {
  return (
    <div className="content-stretch flex h-[72px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container111 />
      <Container112 />
    </div>
  );
}

function Navigation() {
  return (
    <div className="bg-[rgba(255,255,255,0.95)] content-stretch flex flex-col h-[73px] items-start pb-[0.909px] pointer-events-auto px-[40px] sticky top-0 w-[1920px]" data-name="Navigation">
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.08)] border-b-[0.909px] border-solid inset-0 pointer-events-none" />
      <Container110 />
    </div>
  );
}

export default function Frame10() {
  return (
    <div className="bg-[#fafafa] relative size-full">
      <Section />
      <div className="absolute h-[827px] left-0 top-0 w-[1920px]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 overflow-hidden">
            <img alt="" className="absolute h-[168.66%] left-[-0.01%] max-w-none top-[-38.03%] w-full" src={imgRectangle10} />
          </div>
          <div className="absolute bg-[rgba(0,0,0,0.16)] inset-0" />
        </div>
      </div>
      <Group />
      <Frame5 />
      <Frame6 />
      <Section1 />
      <Section2 />
      <Section3 />
      <Section4 />
      <Section5 />
      <Footer />
      <Section6 />
      <div className="absolute bottom-0 h-[6962px] left-0 pointer-events-none top-0">
        <Navigation />
      </div>
    </div>
  );
}