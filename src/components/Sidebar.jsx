import Image from "next/image";
import prismatic from "#/assets/prismatic.png";
import sparks from "#/assets/sparks.png";
import stellar from "#/assets/stellar.png";
import temporal from "#/assets/temporal.png";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div
      className={`fixed top-0 right-0 w-[350px] h-full bg-gray-200 shadow-lg transition-transform transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } p-5 z-[50]`}
    >
      <button
        className="text-2xl float-right text-purple-600"
        onClick={toggleSidebar}
      >
        ✖
      </button>
      <h2 className="text-center text-xl font-bold text-black">Category</h2>
      <ul className="text-center mt-5 space-y-17">
        <li>
          <div className="relative w-full h-32">
            <Image
              src={prismatic}
              alt="Prismatic Evolutions"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 350px"
            />
          </div>
        </li>
        <li>
          <div className="relative w-full h-32">
            <Image
              src={sparks}
              alt="Surging Sparks"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 350px"
            />
          </div>
        </li>
        <li>
          <div className="relative w-full h-32">
            <Image
              src={stellar}
              alt="Stellar Crown"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 350px"
            />
          </div>
        </li>
        <li>
          <div className="relative w-full h-32">
            <Image
              src={temporal}
              alt="Temporal Forces"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 350px"
            />
          </div>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
