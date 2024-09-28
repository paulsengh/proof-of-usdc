export const Footer = () => {
  return (
    <div className="flex flex-col bottom-0 w-full mt-20">
      <div className=" bg-opacity-70 flex items-center justify-between px-10 ">
        <img src="/obl-logo-alt.svg" alt="obl-logo" width={220} height={25} />
        <div className="flex gap-20">
          <div className="flex gap-6 flex-row">
            <a
              href="https://3ygiwvzbzhs.typeform.com/openblockdemo"
              target="_blank"
              className="text-[16px] w-inline-block"
            >
              <div className="text-34">Request Demo</div>
            </a>
            <a
              href=""
              target="_blank"
              className="text-[16px] w-inline-block"
            >
              <div className="text-34">Privacy & cookie policy</div>
            </a>
          </div>

          <div className="flex gap-6 flex-row">
            <a
              href="https://www.linkedin.com/company/openblocklabs"
              target="_blank"
              className="w-inline-block"
            >
              <img
                src="/linkedIn.svg"
                loading="lazy"
                width="24"
                height="24"
                alt=""
                className="vectors-wrapper-32"
              />
            </a>
            <a
              href="https://x.com/openblocklabs"
              target="_blank"
              className="w-inline-block"
            >
              <img
                src="/x.svg"
                width="Auto"
                height="Auto"
                alt=""
                className="vectors-wrapper-33"
              />
            </a>
          </div>
        </div>
      </div>
      <div className="overflow-hidden max-h-[200px] flex justify-center items-start">
        <img src="gradient.png" width="100%" height="60px" className="clip" />
      </div>
    </div>
  );
};
