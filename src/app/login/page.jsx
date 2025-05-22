"use client";
import { FaGoogle, FaApple, FaTwitter, FaLock, FaUser } from "react-icons/fa";
import { useState } from "react";
import { useRouter } from "next/navigation";
import logoSimple from "#/logo-simple.png";
import Image from "next/image";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === "a" && password === "b") {
      router.push("/home");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="flex justify-center items-center bg-white/95 rounded-3xl p-12 my-8 mx-auto w-11/12 max-w-3xl gap-10">
      <div className="flex-1 text-center flex flex-col items-center">
        <Image src={logoSimple} width={150} height={150} alt="Pokehub Logo" />
        <h1 className="text-4xl my-5 font-bold">
          Poke<span className="text-orange-500">Hub</span>
        </h1>
        <p className="font-bold text-lg">Welcome Back</p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col items-center font-semibold space-y-4"
      >
        <div className="w-full relative">
          <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white" />
          <input
            type="text"
            placeholder="Username"
            className="w-full p-4 pl-12 rounded-full bg-black text-white placeholder-white"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-4 w-full relative">
          <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white" />
          <input
            type="password"
            placeholder="password"
            className="w-full p-4 pl-12 rounded-full bg-black text-white placeholder-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full py-3 px-7 rounded-full bg-indigo-500 text-white font-bold text-base cursor-pointer mt-2.5"
        >
          Login
        </button>
        <div className="w-full">
          <hr className="border-t-2 border-gray-300" />
        </div>
        <div className="flex space-x-4 w-full">
          {/* <button
            type="button"
            className="flex-1 p-4 rounded-full bg-black text-white flex items-center justify-center"
          >
            <FaGoogle className="mr-2" />
          </button>
          <button
            type="button"
            className="flex-1 p-4 rounded-full bg-black text-white flex items-center justify-center"
          >
            <FaApple className="mr-2" />
          </button>
          <button
            type="button"
            className="flex-1 p-4 rounded-full bg-black text-white flex items-center justify-center"
          >
            <FaTwitter className="mr-2" />
          </button> */}
        </div>
      </form>
    </div>
  );
}
