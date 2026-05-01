import svgPaths from "./svg-trlij3bcwl";

function Heading() {
  return (
    <div className="h-[60px] relative shrink-0 w-full" data-name="Heading 1">
      <p className="absolute font-['Poppins:Bold',sans-serif] leading-[60px] left-0 not-italic text-[#3b3b3b] text-[40px] top-[1.82px]">Components</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[27.983px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-0 not-italic text-[#8c8c8c] text-[18px] top-[-0.27px]">Reusable UI components with consistent styling.</p>
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
      <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[48px] left-0 not-italic text-[#3b3b3b] text-[32px] top-[0.91px]">Buttons</p>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute h-[23.991px] left-0 top-0 w-[444.474px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#3b3b3b] text-[16px] top-[-1.18px]">Primary Button</p>
    </div>
  );
}

function Button() {
  return (
    <div className="absolute bg-[#1abc9c] h-[47.969px] left-0 rounded-[12px] top-[35.98px] w-[125.81px]" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[62.99px] not-italic text-[16px] text-center text-white top-[10.81px]">Book Now</p>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute h-[87.585px] left-0 top-0 w-[444.474px]" data-name="Container">
      <Container4 />
      <Button />
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute h-[23.991px] left-0 top-0 w-[444.489px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#3b3b3b] text-[16px] top-[-1.18px]">Secondary Button</p>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute border-[#1abc9c] border-[1.818px] border-solid h-[51.605px] left-0 rounded-[12px] top-[35.98px] w-[145.895px]" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[71.49px] not-italic text-[#1abc9c] text-[16px] text-center top-[10.81px]">View Details</p>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute h-[87.585px] left-[468.47px] top-0 w-[444.489px]" data-name="Container">
      <Container6 />
      <Button1 />
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute h-[23.991px] left-0 top-0 w-[444.474px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#3b3b3b] text-[16px] top-[-1.18px]">Ghost Button</p>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute h-[47.969px] left-0 rounded-[12px] top-[35.98px] w-[135.511px]" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[68.49px] not-italic text-[#1abc9c] text-[16px] text-center top-[10.81px]">Learn More</p>
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute h-[83.949px] left-0 top-[111.58px] w-[444.474px]" data-name="Container">
      <Container8 />
      <Button2 />
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute h-[23.991px] left-0 top-0 w-[444.489px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#3b3b3b] text-[16px] top-[-1.18px]">Disabled Button</p>
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute bg-[#1abc9c] h-[47.969px] left-0 opacity-40 rounded-[12px] top-[35.98px] w-[136.946px]" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[68.49px] not-italic text-[16px] text-center text-white top-[10.81px]">Unavailable</p>
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute h-[83.949px] left-[468.47px] top-[111.58px] w-[444.489px]" data-name="Container">
      <Container10 />
      <Button3 />
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[195.526px] relative shrink-0 w-full" data-name="Container">
      <Container3 />
      <Container5 />
      <Container7 />
      <Container9 />
    </div>
  );
}

function Container1() {
  return (
    <div className="bg-white h-[261.321px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-[0.909px] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col items-start pb-[0.909px] pt-[32.898px] px-[32.898px] relative size-full">
        <Container2 />
      </div>
    </div>
  );
}

function Section() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[23.991px] h-[333.31px] items-start left-[319.99px] top-[199.97px] w-[978.75px]" data-name="Section">
      <Heading1 />
      <Container1 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="h-[47.997px] relative shrink-0 w-full" data-name="Heading 2">
      <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[48px] left-0 not-italic text-[#3b3b3b] text-[32px] top-[0.91px]">Input Fields</p>
    </div>
  );
}

function Label() {
  return (
    <div className="absolute h-[23.991px] left-0 top-0 w-[447.997px]" data-name="Label">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#3b3b3b] text-[16px] top-[-1.18px]">Email Address</p>
    </div>
  );
}

function EmailInput() {
  return (
    <div className="absolute h-[49.787px] left-0 rounded-[12px] top-[31.99px] w-[447.997px]" data-name="Email Input">
      <div className="content-stretch flex items-center overflow-clip px-[16px] py-[12px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[16px] text-[rgba(59,59,59,0.5)]">Enter your email</p>
      </div>
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-[0.909px] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute h-[20px] left-0 top-[85.77px] w-[447.997px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#8c8c8c] text-[14px] top-[-0.09px]">{`We'll never share your email`}</p>
    </div>
  );
}

function Container13() {
  return (
    <div className="h-[105.767px] relative shrink-0 w-full" data-name="Container">
      <Label />
      <EmailInput />
      <Container14 />
    </div>
  );
}

function Label1() {
  return (
    <div className="h-[23.991px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#3b3b3b] text-[16px] top-[-1.18px]">Check-in Date</p>
    </div>
  );
}

function DatePicker() {
  return (
    <div className="h-[49.787px] relative rounded-[12px] shrink-0 w-full" data-name="Date Picker">
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-[0.909px] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col gap-[7.997px] h-[81.776px] items-start relative shrink-0 w-full" data-name="Container">
      <Label1 />
      <DatePicker />
    </div>
  );
}

function Label2() {
  return (
    <div className="h-[23.991px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#3b3b3b] text-[16px] top-[-1.18px]">Special Requests</p>
    </div>
  );
}

function TextArea() {
  return (
    <div className="h-[121.761px] relative rounded-[12px] shrink-0 w-full" data-name="Text Area">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start px-[16px] py-[12px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[16px] text-[rgba(59,59,59,0.5)]">Any special requests?</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-[0.909px] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col gap-[7.997px] h-[160.469px] items-start relative shrink-0 w-full" data-name="Container">
      <Label2 />
      <TextArea />
    </div>
  );
}

function Label3() {
  return (
    <div className="absolute h-[23.991px] left-0 top-0 w-[447.997px]" data-name="Label">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#ef4444] text-[16px] top-[-1.18px]">Email Address (Error State)</p>
    </div>
  );
}

function EmailInput1() {
  return (
    <div className="absolute h-[51.605px] left-0 rounded-[12px] top-[31.99px] w-[447.997px]" data-name="Email Input">
      <div className="content-stretch flex items-center overflow-clip px-[16px] py-[12px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[16px] text-[rgba(59,59,59,0.5)]">Enter your email</p>
      </div>
      <div aria-hidden="true" className="absolute border-[#ef4444] border-[1.818px] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute left-0 size-[13.991px] top-[3px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9915 13.9915">
        <g clipPath="url(#clip0_1_4507)" id="Icon">
          <path d={svgPaths.p1c3e22c0} id="Vector" stroke="var(--stroke-0, #EF4444)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16596" />
          <path d="M6.99574 4.66383V6.99574" id="Vector_2" stroke="var(--stroke-0, #EF4444)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16596" />
          <path d="M6.99574 9.32765H7.00157" id="Vector_3" stroke="var(--stroke-0, #EF4444)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16596" />
        </g>
        <defs>
          <clipPath id="clip0_1_4507">
            <rect fill="white" height="13.9915" width="13.9915" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container18() {
  return (
    <div className="absolute h-[20px] left-0 top-[87.59px] w-[447.997px]" data-name="Container">
      <Icon />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[17.98px] not-italic text-[#ef4444] text-[14px] top-[-0.09px]">Please enter a valid email address</p>
    </div>
  );
}

function Container17() {
  return (
    <div className="h-[107.585px] relative shrink-0 w-full" data-name="Container">
      <Label3 />
      <EmailInput1 />
      <Container18 />
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col gap-[23.991px] h-[527.571px] items-start relative shrink-0 w-full" data-name="Container">
      <Container13 />
      <Container15 />
      <Container16 />
      <Container17 />
    </div>
  );
}

function Container11() {
  return (
    <div className="bg-white h-[593.366px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-[0.909px] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col items-start pb-[0.909px] pl-[32.898px] pr-[497.855px] pt-[32.898px] relative size-full">
        <Container12 />
      </div>
    </div>
  );
}

function Section1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[23.991px] h-[665.355px] items-start left-[319.99px] top-[597.27px] w-[978.75px]" data-name="Section">
      <Heading2 />
      <Container11 />
    </div>
  );
}

function Heading3() {
  return (
    <div className="h-[47.997px] relative shrink-0 w-full" data-name="Heading 2">
      <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[48px] left-0 not-italic text-[#3b3b3b] text-[32px] top-[0.91px]">Cards</p>
    </div>
  );
}

function Container21() {
  return (
    <div className="absolute h-[30px] left-[23.99px] top-[23.99px] w-[427.571px]" data-name="Container">
      <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[30px] left-0 not-italic text-[#3b3b3b] text-[20px] top-[0.91px]">Standard Card</p>
    </div>
  );
}

function Container22() {
  return (
    <div className="absolute h-[23.991px] left-[23.99px] top-[61.99px] w-[427.571px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#8c8c8c] text-[16px] top-[-1.18px]">Clean white background with subtle border and shadow</p>
    </div>
  );
}

function Container23() {
  return (
    <div className="absolute h-[20px] left-[23.99px] top-[101.97px] w-[427.571px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#1abc9c] text-[14px] top-[-0.09px]">Learn more →</p>
    </div>
  );
}

function Container20() {
  return (
    <div className="absolute bg-white border-[#eaeaea] border-[0.909px] border-solid h-[147.784px] left-0 rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] top-0 w-[477.372px]" data-name="Container">
      <Container21 />
      <Container22 />
      <Container23 />
    </div>
  );
}

function Container25() {
  return (
    <div className="absolute h-[30px] left-[23.99px] top-[23.99px] w-[427.585px]" data-name="Container">
      <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[30px] left-0 not-italic text-[#3b3b3b] text-[20px] top-[0.91px]">Interactive Card</p>
    </div>
  );
}

function Container26() {
  return (
    <div className="absolute h-[23.991px] left-[23.99px] top-[61.99px] w-[427.585px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#8c8c8c] text-[16px] top-[-1.18px]">Hover to see the turquoise border highlight</p>
    </div>
  );
}

function Container27() {
  return (
    <div className="absolute h-[20px] left-[23.99px] top-[101.97px] w-[427.585px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#1abc9c] text-[14px] top-[-0.09px]">Select →</p>
    </div>
  );
}

function Container24() {
  return (
    <div className="absolute bg-white border-[#eaeaea] border-[0.909px] border-solid h-[147.784px] left-[501.36px] rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] top-0 w-[477.386px]" data-name="Container">
      <Container25 />
      <Container26 />
      <Container27 />
    </div>
  );
}

function Container19() {
  return (
    <div className="h-[147.784px] relative shrink-0 w-full" data-name="Container">
      <Container20 />
      <Container24 />
    </div>
  );
}

function Section2() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[23.991px] h-[219.773px] items-start left-[319.99px] top-[1326.62px] w-[978.75px]" data-name="Section">
      <Heading3 />
      <Container19 />
    </div>
  );
}

function Heading4() {
  return (
    <div className="h-[47.997px] relative shrink-0 w-full" data-name="Heading 2">
      <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[48px] left-0 not-italic text-[#3b3b3b] text-[32px] top-[0.91px]">Booking Progress Stepper</p>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_1_4498)" id="Icon">
          <path d={svgPaths.p14d24500} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p3e012060} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
        <defs>
          <clipPath id="clip0_1_4498">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container31() {
  return (
    <div className="bg-[#1abc9c] relative rounded-[30504000px] shrink-0 size-[40px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon1 />
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="h-[20px] relative shrink-0 w-[83.821px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#3b3b3b] text-[14px] top-[-0.09px]">Select Room</p>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[7.997px] h-[67.997px] items-center left-0 top-0 w-[147.188px]" data-name="Container">
      <Container31 />
      <Container32 />
    </div>
  );
}

function Container33() {
  return <div className="absolute bg-[#1abc9c] h-[3.991px] left-[131.19px] top-[20px] w-[147.202px]" data-name="Container" />;
}

function Container35() {
  return (
    <div className="bg-[#1abc9c] relative rounded-[30504000px] shrink-0 size-[40px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[16px] text-white">2</p>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="h-[20px] relative shrink-0 w-[80.256px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#3b3b3b] text-[14px] top-[-0.09px]">Your Details</p>
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[7.997px] h-[67.997px] items-center left-[262.4px] top-0 w-[147.188px]" data-name="Container">
      <Container35 />
      <Container36 />
    </div>
  );
}

function Container37() {
  return <div className="absolute bg-[#eaeaea] h-[3.991px] left-[393.59px] top-[20px] w-[147.202px]" data-name="Container" />;
}

function Container39() {
  return (
    <div className="bg-[#eaeaea] relative rounded-[30504000px] shrink-0 size-[40px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#8c8c8c] text-[16px]">3</p>
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="h-[20px] relative shrink-0 w-[54.062px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#8c8c8c] text-[14px] top-[-0.09px]">Confirm</p>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[7.997px] h-[67.997px] items-center left-[524.8px] top-0 w-[147.188px]" data-name="Container">
      <Container39 />
      <Container40 />
    </div>
  );
}

function Container29() {
  return (
    <div className="h-[67.997px] relative shrink-0 w-full" data-name="Container">
      <Container30 />
      <Container33 />
      <Container34 />
      <Container37 />
      <Container38 />
    </div>
  );
}

function Container28() {
  return (
    <div className="bg-white h-[133.793px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-[0.909px] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col items-start pb-[0.909px] pt-[32.898px] px-[153.381px] relative size-full">
        <Container29 />
      </div>
    </div>
  );
}

function Section3() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[23.991px] h-[205.781px] items-start left-[319.99px] top-[1610.38px] w-[978.75px]" data-name="Section">
      <Heading4 />
      <Container28 />
    </div>
  );
}

function Heading5() {
  return (
    <div className="h-[47.997px] relative shrink-0 w-full" data-name="Heading 2">
      <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[48px] left-0 not-italic text-[#3b3b3b] text-[32px] top-[0.91px]">Badges</p>
    </div>
  );
}

function Container43() {
  return (
    <div className="absolute bg-[rgba(34,197,94,0.1)] border-[0.909px] border-[rgba(34,197,94,0.2)] border-solid h-[37.813px] left-0 rounded-[12px] top-0 w-[101.889px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[15.99px] not-italic text-[#22c55e] text-[14px] top-[7.91px]">Save 20%</p>
    </div>
  );
}

function Container44() {
  return (
    <div className="absolute bg-[rgba(26,188,156,0.1)] border-[0.909px] border-[rgba(26,188,156,0.2)] border-solid h-[37.813px] left-[117.88px] rounded-[12px] top-0 w-[101.605px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[15.99px] not-italic text-[#1abc9c] text-[14px] top-[7.91px]">Best Price</p>
    </div>
  );
}

function Container45() {
  return (
    <div className="absolute bg-[rgba(245,158,11,0.1)] border-[0.909px] border-[rgba(245,158,11,0.2)] border-solid h-[37.813px] left-[235.48px] rounded-[12px] top-0 w-[106.449px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[15.99px] not-italic text-[#f59e0b] text-[14px] top-[7.91px]">Only 2 Left</p>
    </div>
  );
}

function Container46() {
  return (
    <div className="absolute bg-[rgba(59,130,246,0.1)] border-[0.909px] border-[rgba(59,130,246,0.2)] border-solid h-[37.813px] left-[357.93px] rounded-[12px] top-0 w-[150.142px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[15.99px] not-italic text-[#3b82f6] text-[14px] top-[7.91px]">Free Cancellation</p>
    </div>
  );
}

function Container42() {
  return (
    <div className="h-[37.813px] relative shrink-0 w-full" data-name="Container">
      <Container43 />
      <Container44 />
      <Container45 />
      <Container46 />
    </div>
  );
}

function Container41() {
  return (
    <div className="bg-white h-[103.608px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-[0.909px] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col items-start pb-[0.909px] pt-[32.898px] px-[32.898px] relative size-full">
        <Container42 />
      </div>
    </div>
  );
}

function Section4() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[23.991px] h-[175.597px] items-start left-[319.99px] top-[1880.16px] w-[978.75px]" data-name="Section">
      <Heading5 />
      <Container41 />
    </div>
  );
}

function Heading6() {
  return (
    <div className="h-[47.997px] relative shrink-0 w-full" data-name="Heading 2">
      <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[48px] left-0 not-italic text-[#3b3b3b] text-[32px] top-[0.91px]">Alerts</p>
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_1_4494)" id="Icon">
          <path d={svgPaths.p14d24500} id="Vector" stroke="var(--stroke-0, #22C55E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p3e012060} id="Vector_2" stroke="var(--stroke-0, #22C55E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
        <defs>
          <clipPath id="clip0_1_4494">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container50() {
  return (
    <div className="absolute h-[23.991px] left-0 top-0 w-[335.838px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#3b3b3b] text-[16px] top-[-1.18px]">Booking Confirmed</p>
    </div>
  );
}

function Container51() {
  return (
    <div className="absolute h-[20px] left-0 top-[23.99px] w-[335.838px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#8c8c8c] text-[14px] top-[-0.09px]">Your reservation has been successfully confirmed.</p>
    </div>
  );
}

function Container49() {
  return (
    <div className="h-[43.991px] relative shrink-0 w-[335.838px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container50 />
        <Container51 />
      </div>
    </div>
  );
}

function Container48() {
  return (
    <div className="bg-[rgba(34,197,94,0.1)] h-[77.798px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(34,197,94,0.2)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex gap-[11.989px] items-start pb-[0.909px] pl-[16.903px] pr-[0.909px] pt-[16.903px] relative size-full">
        <Icon2 />
        <Container49 />
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p377dab00} id="Vector" stroke="var(--stroke-0, #F59E0B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M10 7.5V10.8333" id="Vector_2" stroke="var(--stroke-0, #F59E0B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M10 14.1667H10.0083" id="Vector_3" stroke="var(--stroke-0, #F59E0B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Container54() {
  return (
    <div className="absolute h-[23.991px] left-0 top-0 w-[242.827px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#3b3b3b] text-[16px] top-[-1.18px]">Limited Availability</p>
    </div>
  );
}

function Container55() {
  return (
    <div className="absolute h-[20px] left-0 top-[23.99px] w-[242.827px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#8c8c8c] text-[14px] top-[-0.09px]">Only 2 rooms remaining at this price.</p>
    </div>
  );
}

function Container53() {
  return (
    <div className="h-[43.991px] relative shrink-0 w-[242.827px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container54 />
        <Container55 />
      </div>
    </div>
  );
}

function Container52() {
  return (
    <div className="bg-[rgba(245,158,11,0.1)] h-[77.798px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(245,158,11,0.2)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex gap-[11.989px] items-start pb-[0.909px] pl-[16.903px] pr-[0.909px] pt-[16.903px] relative size-full">
        <Icon3 />
        <Container53 />
      </div>
    </div>
  );
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_1_4489)" id="Icon">
          <path d={svgPaths.p14d24500} id="Vector" stroke="var(--stroke-0, #EF4444)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M10 6.66667V10" id="Vector_2" stroke="var(--stroke-0, #EF4444)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M10 13.3333H10.0083" id="Vector_3" stroke="var(--stroke-0, #EF4444)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
        <defs>
          <clipPath id="clip0_1_4489">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container58() {
  return (
    <div className="absolute h-[23.991px] left-0 top-0 w-[324.844px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#3b3b3b] text-[16px] top-[-1.18px]">Payment Failed</p>
    </div>
  );
}

function Container59() {
  return (
    <div className="absolute h-[20px] left-0 top-[23.99px] w-[324.844px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#8c8c8c] text-[14px] top-[-0.09px]">Please check your payment details and try again.</p>
    </div>
  );
}

function Container57() {
  return (
    <div className="h-[43.991px] relative shrink-0 w-[324.844px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container58 />
        <Container59 />
      </div>
    </div>
  );
}

function Container56() {
  return (
    <div className="bg-[rgba(239,68,68,0.1)] h-[77.798px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(239,68,68,0.2)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex gap-[11.989px] items-start pb-[0.909px] pl-[16.903px] pr-[0.909px] pt-[16.903px] relative size-full">
        <Icon4 />
        <Container57 />
      </div>
    </div>
  );
}

function Icon5() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_1_4484)" id="Icon">
          <path d={svgPaths.p14d24500} id="Vector" stroke="var(--stroke-0, #3B82F6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M10 13.3333V10" id="Vector_2" stroke="var(--stroke-0, #3B82F6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M10 6.66667H10.0083" id="Vector_3" stroke="var(--stroke-0, #3B82F6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
        <defs>
          <clipPath id="clip0_1_4484">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container62() {
  return (
    <div className="absolute h-[23.991px] left-0 top-0 w-[489.787px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#3b3b3b] text-[16px] top-[-1.18px]">Check-in Information</p>
    </div>
  );
}

function Container63() {
  return (
    <div className="absolute h-[20px] left-0 top-[23.99px] w-[489.787px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#8c8c8c] text-[14px] top-[-0.09px]">Check-in starts at 3:00 PM. Early check-in may be available upon request.</p>
    </div>
  );
}

function Container61() {
  return (
    <div className="h-[43.991px] relative shrink-0 w-[489.787px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container62 />
        <Container63 />
      </div>
    </div>
  );
}

function Container60() {
  return (
    <div className="bg-[rgba(59,130,246,0.1)] h-[77.798px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.909px] border-[rgba(59,130,246,0.2)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex gap-[11.989px] items-start pb-[0.909px] pl-[16.903px] pr-[0.909px] pt-[16.903px] relative size-full">
        <Icon5 />
        <Container61 />
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="content-stretch flex flex-col gap-[15.994px] h-[359.176px] items-start relative shrink-0 w-full" data-name="Container">
      <Container48 />
      <Container52 />
      <Container56 />
      <Container60 />
    </div>
  );
}

function Section5() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[23.991px] h-[431.165px] items-start left-[319.99px] top-[2119.74px] w-[978.75px]" data-name="Section">
      <Heading6 />
      <Container47 />
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
      <Section4 />
      <Section5 />
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
    <div className="h-[35.994px] relative rounded-[12px] shrink-0 w-full" data-name="Link">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[15.99px] not-italic text-[#3b3b3b] text-[14px] top-[7.91px]">UI Foundations</p>
    </div>
  );
}

function Link7() {
  return (
    <div className="bg-[#1abc9c] h-[35.994px] relative rounded-[12px] shrink-0 w-full" data-name="Link">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[15.99px] not-italic text-[14px] text-white top-[7.91px]">Components</p>
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