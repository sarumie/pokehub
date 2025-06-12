"use client";
import Image from "next/image";
import { FaLock } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
export default function ProfilePage() {
  const router = useRouter();
  // Placeholder data
  const user = {
    profilePicture: "https://i.imgur.com/1Q9Z1Zm.png", // Cat in suit
    username: "KevinCanteng",
    fullName: "Kevin Susanti",
    email: "kevin09@gmail.com",
    phone: "08********",
    address:
      "Jl. Raya Kb. Jeruk No.27, RT.1/RW.9, Kemanggisan, Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11530",
  };

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Header */}
      <Navbar />

      <div className="max-w-4xl mx-auto mt-8 p-4">
        {/* Profile Card & Info */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Card */}
          <div className="flex-1 bg-white rounded-2xl p-8 flex flex-col items-center border shadow-sm">
            <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-black mb-4">
              <Image
                src={user.profilePicture}
                alt="Profile"
                width={160}
                height={160}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">{user.fullName}</div>
              <div className="text-lg text-gray-700 mb-2">{user.email}</div>
              <button className="text-sm text-gray-600 underline hover:text-black">
                Edit Profile
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 flex flex-col gap-4 justify-center">
            <div>
              <label className="block font-semibold mb-1">Username</label>
              <div className="flex items-center bg-gray-400/70 rounded-lg px-4 py-2">
                <input
                  type="text"
                  value={user.username}
                  disabled
                  className="bg-transparent flex-1 text-gray-800 font-semibold outline-none cursor-not-allowed"
                />
                <FaLock className="ml-2 text-gray-700" />
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1">Full name</label>
              <div className="flex items-center bg-gray-400/70 rounded-lg px-4 py-2">
                <input
                  type="text"
                  value={user.fullName}
                  disabled
                  className="bg-transparent flex-1 text-gray-800 font-semibold outline-none cursor-not-allowed"
                />
                <FaLock className="ml-2 text-gray-700" />
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1">Email</label>
              <div className="flex items-center bg-gray-400/70 rounded-lg px-4 py-2">
                <input
                  type="text"
                  value={user.email}
                  disabled
                  className="bg-transparent flex-1 text-gray-800 font-semibold outline-none cursor-not-allowed"
                />
                <FaLock className="ml-2 text-gray-700" />
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1">Password</label>
              <div className="flex items-center bg-gray-400/70 rounded-lg px-4 py-2">
                <input
                  type="password"
                  value={"********************"}
                  disabled
                  className="bg-transparent flex-1 text-gray-800 font-semibold outline-none cursor-not-allowed"
                />
                <FaLock className="ml-2 text-gray-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-2xl mt-8 p-6 flex flex-col md:flex-row md:items-center md:justify-between shadow-sm">
          <div>
            <div className="font-bold mb-1">Alamat Pengiriman</div>
            <div>{user.fullName}</div>
            <div>{user.phone}</div>
            <div className="text-gray-700 text-sm mt-1">{user.address}</div>
          </div>
          <button className="mt-4 md:mt-0 px-6 py-2 bg-gray-200 rounded-full font-semibold text-gray-800 hover:bg-gray-300 transition-colors">
            Ubah Alamat
          </button>
        </div>

        {/* Purchase History & Payment Method */}
        <div className="flex flex-col md:flex-row gap-6 mt-8">
          {/* Purchase History */}
          <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm">
            <div className="font-semibold mb-4">Purchase History</div>
            <div className="h-16 bg-gray-300/70 rounded-lg mb-3" />
            <div className="h-6 bg-gray-300/70 rounded-lg w-2/3" />
          </div>
          {/* Payment Method */}
          <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm">
            <div className="font-semibold mb-4">Payment Method</div>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="payment" className="accent-black" />
                <span className="font-semibold">VISA</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="payment" className="accent-black" />
                <span className="font-semibold">QRIS</span>
              </label>
              <button className="mt-2 flex items-center gap-2 px-4 py-2 border-2 border-gray-400 rounded-full text-gray-700 font-semibold hover:bg-gray-100 transition-colors">
                <span className="text-xl leading-none">+</span> Add payment
                method
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
