import Image from "next/image";
import LogoSimple from "#/logo-simple.png";

const Footer = () => {
  return (
    <footer className="bg-white text-center py-5 shadow-md mt-10">
      <div className="flex items-center justify-between w-full max-w-[1440px] mx-auto px-6">
        {/* Logo with PokeHub Text */}
        <div className="text-2xl font-bold text-red-500 flex items-center">
          <Image
            src={LogoSimple}
            alt="PokeHub Logo"
            width={28}
            height={28}
            className="mr-2"
          />
          Poke<span className="text-black">Hub</span>
        </div>

        {/* Footer Links */}
        <div className="flex space-x-10">
          <a
            href="#"
            className="text-black hover:text-red-500 transition-colors"
          >
            About Us
          </a>
          <a
            href="#"
            className="text-black hover:text-red-500 transition-colors"
          >
            Contact Us
          </a>
          <a
            href="#"
            className="text-black hover:text-red-500 transition-colors"
          >
            Terms & Conditions
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
