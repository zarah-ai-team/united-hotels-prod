const imgImageSultanahmetFatih = "/figma-assets/87fe0e3882960f57017f9db63227776eab6248b5.png";
const imgImageTaksimBeyoglu = "/figma-assets/2d09c265965430947a0286c570bc0fa5fbd6debe.png";
const imgImageKadikoyAsianSide = "/figma-assets/250023f532e568305b14dfb57c614f51c1fba582.png";

function Heading() {
  return (
    <div className="absolute h-[57px] left-0 top-[-1px] w-[1224px]" data-name="Heading 2">
      <p className="-translate-x-1/2 absolute font-['Poppins:Bold',sans-serif] h-[68px] leading-[72px] left-[612px] not-italic text-[#3b3b3b] text-[48px] text-center top-[-12px] w-[696px]">Best Areas for Budget Hotels</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="absolute h-[30px] left-[292px] top-[64.49px] w-[640px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[30px] left-[319.5px] not-italic text-[#6b7280] text-[20px] text-center top-[-0.27px] whitespace-nowrap">Choose the perfect neighborhood for your Turkey adventure</p>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute h-[94px] left-[348px] top-[80px] w-[1224px]" data-name="Container">
      <Heading />
      <Paragraph />
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

function Container3() {
  return <div className="absolute bg-gradient-to-t from-[rgba(0,0,0,0.7)] h-[320px] left-0 to-[rgba(0,0,0,0)] top-0 via-1/2 via-[rgba(0,0,0,0.3)] w-[446px]" data-name="Container" />;
}

function Heading1() {
  return (
    <div className="h-[36.009px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Poppins:Bold',sans-serif] leading-[36px] left-0 not-italic text-[24px] text-white top-[0.91px] whitespace-nowrap">{`Sultanahmet & Fatih`}</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[22.5px] left-0 not-italic text-[15px] text-[rgba(255,255,255,0.9)] top-[-1.18px] whitespace-nowrap">Historic heart with iconic landmarks</p>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[7.997px] h-[165px] items-start left-0 pt-[27.997px] px-[27.997px] top-[155px] w-[389.332px]" data-name="Container">
      <Heading1 />
      <Paragraph1 />
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute h-[320px] left-0 overflow-clip rounded-[16px] top-0 w-[446px]" data-name="Container">
      <ImageSultanahmetFatih />
      <Container3 />
      <Container4 />
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

function Container6() {
  return <div className="absolute bg-gradient-to-t from-[rgba(0,0,0,0.7)] h-[320px] left-0 to-[rgba(0,0,0,0)] top-0 via-1/2 via-[rgba(0,0,0,0.3)] w-[446px]" data-name="Container" />;
}

function Heading2() {
  return (
    <div className="h-[36.009px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Poppins:Bold',sans-serif] leading-[36px] left-0 not-italic text-[24px] text-white top-[0.91px] whitespace-nowrap">{`Taksim & Beyoğlu`}</p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[22.5px] left-0 not-italic text-[15px] text-[rgba(255,255,255,0.9)] top-[-1.18px] whitespace-nowrap">{`Vibrant modern district & nightlife`}</p>
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[7.997px] h-[165px] items-start left-0 pt-[27.997px] px-[27.997px] top-[155px] w-[389.332px]" data-name="Container">
      <Heading2 />
      <Paragraph2 />
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute h-[320px] left-[485px] overflow-clip rounded-[16px] top-0 w-[446px]" data-name="Container">
      <ImageTaksimBeyoglu />
      <Container6 />
      <Container7 />
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

function Container9() {
  return <div className="absolute bg-gradient-to-t from-[rgba(0,0,0,0.7)] h-[320px] left-0 to-[rgba(0,0,0,0)] top-0 via-1/2 via-[rgba(0,0,0,0.3)] w-[446px]" data-name="Container" />;
}

function Heading3() {
  return (
    <div className="h-[36.009px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Poppins:Bold',sans-serif] leading-[36px] left-0 not-italic text-[24px] text-white top-[0.91px] whitespace-nowrap">Kadıköy (Asian Side)</p>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[22.5px] left-0 not-italic text-[15px] text-[rgba(255,255,255,0.9)] top-[-1.18px] whitespace-nowrap">Authentic local experience</p>
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[7.997px] h-[165px] items-start left-0 pt-[27.997px] px-[27.997px] top-[155px] w-[389.347px]" data-name="Container">
      <Heading3 />
      <Paragraph3 />
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute h-[320px] left-[969px] overflow-clip rounded-[16px] top-0 w-[446px]" data-name="Container">
      <ImageKadikoyAsianSide />
      <Container9 />
      <Container10 />
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute content-stretch flex gap-[10px] h-[320px] items-start left-[252px] p-[10px] top-[254px] w-[1415px]" data-name="Container">
      <Container2 />
      <Container5 />
      <Container8 />
    </div>
  );
}

export default function Section() {
  return (
    <div className="bg-[#fafafa] relative size-full" data-name="Section">
      <Container />
      <Container1 />
    </div>
  );
}