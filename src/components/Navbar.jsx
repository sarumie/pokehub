"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import LogoSimple from "#/logo-simple.png";
import {
  FaUser,
  FaShoppingCart,
  FaSearch,
  FaCog,
  FaUserCircle,
  FaChevronDown,
} from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";

const Header = ({ toggleSidebar }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated, isLoading } = useAuth();
  const [userData, setUserData] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        const userId = sessionStorage.getItem("userId");
        try {
          const response = await fetch(`/api/profile?userId=${userId}`);
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleProfileClick = () => {
    if (isAuthenticated) {
      setShowDropdown(!showDropdown);
    } else {
      router.push("/login");
    }
  };

  const navigateToProfile = () => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      router.push(`/u/${userId}`);
      setShowDropdown(false);
    }
  };

  const navigateToSettings = () => {
    router.push("/settings");
    setShowDropdown(false);
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
            placeholder="Search listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 pl-10 border border-black rounded-full text-black"
          />
          <button
            type="submit"
            className="absolute left-3 top-2.5 text-gray-500"
          >
            <FaSearch size={18} />
          </button>
        </form>

        {/* Icons + Sidebar Toggle */}
        <div className="flex space-x-4 text-xl items-center">
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          ) : isAuthenticated && userData ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleProfileClick}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                  <Image
                    src={
                      userData.profilePicture || "https://i.vgy.me/PEwKi8.jpg"
                    }
                    alt="Profile"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {userData.username}
                </span>
                <FaChevronDown
                  size={12}
                  className={`text-gray-500 transition-transform duration-200 ${
                    showDropdown ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                  <button
                    onClick={navigateToProfile}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaUserCircle className="mr-3" />
                    Profile
                  </button>
                  <button
                    onClick={navigateToSettings}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaCog className="mr-3" />
                    Settings
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={handleProfileClick} className="text-2xl">
              <FaUser size={24} className="text-gray-700" />
            </button>
          )}
          <Link href="/checkout" className="text-2xl">
            <FaShoppingCart size={24} className="text-gray-700" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
