"use client";
import logo from "#/logo.png";
import backIcon from "#/assets/Vector.png";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { formatPrice } from "@/utils/priceFormat";
import { useRouter } from "next/navigation";

// QR Code Modal Component
const QRCodeModal = ({ isOpen, onClose, totalAmount }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">QRIS</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="text-center space-y-4">
          <div className="relative w-64 h-64 mx-auto">
            <Image
              src="https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=test-qris-payment"
              alt="QRIS Code"
              fill
              className="object-contain"
            />
          </div>

          <div className="space-y-2">
            <p className="text-gray-600">Total Pembayaran</p>
            <p className="text-2xl font-bold">{formatPrice(totalAmount)}</p>
          </div>

          <div className="text-sm text-gray-500 space-y-1">
            <p>1. Buka aplikasi e-wallet atau mobile banking Anda</p>
            <p>2. Scan QR code di atas</p>
            <p>3. Periksa detail pembayaran</p>
            <p>4. Konfirmasi pembayaran</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState("");
  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const shippingOptions = {
    standard: { price: 15000, days: "1-30" },
    regular: { price: 25000, days: "7" },
    instant: { price: 50000, days: "5 jam" },
  };

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const userId = sessionStorage.getItem("userId");
        if (!userId) {
          router.push("/login");
          return;
        }

        const response = await fetch(`/api/cart?userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch cart items");
        }

        const data = await response.json();
        setCartItems(data);
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [router]);

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shippingCost = shippingOptions[selectedShipping].price;
    const insurance = Math.ceil(subtotal * 0.01); // 1% insurance
    return subtotal + shippingCost + insurance;
  };

  const handlePayment = () => {
    if (!shippingAddress) return;
    setIsQRModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-bl from-[#000000] to-[#81BFDA] text-black font-sans">
        <Navbar />
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/20 rounded w-48"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="h-48 bg-white/20 rounded-2xl"></div>
                <div className="h-64 bg-white/20 rounded-2xl"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-white/20 rounded-2xl"></div>
                <div className="h-64 bg-white/20 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-bl from-[#000000] to-[#81BFDA] text-black font-sans">
      <Navbar />

      <div className="p-6 space-y-6">
        <h1 className="text-3xl text-white font-bold">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left space */}
          <div className="flex-1 space-y-6">
            {/* Product Info */}
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24">
                    <Image
                      src={"/listing_pict/" + item.listing.pictUrl}
                      alt={item.listing.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{item.listing.name}</p>
                    <p className="text-sm">{formatPrice(item.listing.price)}</p>
                    <p className="text-sm">
                      Jumlah:{" "}
                      <span className="text-red-600 font-bold">
                        {Math.ceil(item.totalPrice / item.listing.price)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Pengiriman */}
            <div className="bg-white rounded-2xl p-4 space-y-4">
              <h2 className="text-lg font-semibold">Pengiriman</h2>

              <div>
                <label className="block text-sm mb-1">Alamat Tujuan</label>
                <input
                  type="text"
                  placeholder="Masukkan Alamat..."
                  className="w-full px-3 py-2 rounded-md bg-black text-white placeholder-white"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">
                  Pilih Jenis Pengiriman
                </label>
                <div className="space-y-2">
                  {Object.entries(shippingOptions).map(([key, option]) => (
                    <div
                      key={key}
                      className={`border p-3 rounded-lg cursor-pointer ${
                        selectedShipping === key
                          ? "border-blue-500 bg-blue-50"
                          : ""
                      }`}
                      onClick={() => setSelectedShipping(key)}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)} (Rp
                      {formatPrice(option.price)}) - Estimasi tiba {option.days}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right space */}
          <div className="flex-1 space-y-6">
            {/* Metode Pembayaran */}
            <div className="bg-white rounded-2xl p-4 space-y-4">
              <h2 className="text-lg font-semibold">Metode Pembayaran</h2>

              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="relative w-16 h-16">
                  <Image
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/QRIS_logo.svg/1200px-QRIS_logo.svg.png"
                    alt="QRIS"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">QRIS</h3>
                  <p className="text-sm text-gray-600">
                    Bayar dengan berbagai e-wallet dan mobile banking
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>• Dukungan berbagai e-wallet populer</p>
                <p>• Proses pembayaran cepat dan aman</p>
                <p>• Tidak ada biaya tambahan</p>
              </div>
            </div>

            {/* Ringkasan */}
            <div className="bg-white rounded-2xl p-4 space-y-2">
              <h2 className="text-lg font-semibold">Ringkasan</h2>
              <div className="flex justify-between text-sm">
                <span>Total harga:</span>
                <span>{formatPrice(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total ongkos kirim:</span>
                <span>
                  {formatPrice(shippingOptions[selectedShipping].price)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total asuransi:</span>
                <span>
                  {formatPrice(Math.ceil(calculateSubtotal() * 0.01))}
                </span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total Tagihan:</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
              <button
                className="w-full bg-black text-white rounded-lg py-2 mt-2 hover:bg-gray-800 transition-colors"
                disabled={!shippingAddress}
                onClick={handlePayment}
              >
                Bayar dengan QRIS
              </button>
              <p className="text-xs text-gray-600 text-center">
                Pastikan pesanan dan metode pembayaran sudah sesuai
              </p>
            </div>
          </div>
        </div>

        {/* QR Code Modal */}
        <QRCodeModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          totalAmount={calculateTotal()}
        />
      </div>
    </div>
  );
}
