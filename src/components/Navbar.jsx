import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LogoSimple from "#/logo-simple.png";

const Header = ({ toggleSidebar }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="flex items-center justify-between bg-white px-6 py-4 shadow-md w-full">
      <div className="flex items-center justify-between w-full max-w-[1440px] mx-auto">
        {/* Logo with PokeHub Text */}
        <Link
          href="/home"
          className="text-3xl font-bold text-red-500 flex items-center"
        >
          <Image
            src={LogoSimple}
            alt="PokeHub Logo"
            width={32}
            height={32}
            className="mr-2"
          />
          Poke<span className="text-black">Hub</span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative w-[400px]">
          <input
            type="text"
            placeholder="Search anything"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 pl-10 border border-black rounded-full text-black"
          />
          <button type="submit" className="absolute left-3 top-2 text-gray-500">
            🔍
          </button>
        </form>

        {/* Icons + Sidebar Toggle */}
        <div className="flex space-x-4 text-xl">
          <button
            onClick={() => console.log("Profile Clicked")}
            className="text-2xl"
          >
            👤
          </button>
          <Link href="/checkout" className="text-2xl">
            🛒
          </Link>
          {/* <button
            onClick={() => console.log("Messages Clicked")}
            className="text-2xl"
          >
            💬
          </button> */}
          <button onClick={toggleSidebar} className="text-2xl">
            ☰
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
