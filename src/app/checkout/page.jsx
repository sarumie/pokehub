import logo from "#/logo.png";
import backIcon from "#/assets/Vector.png";
import gopayIcon from "#/assets/gopay-icon1.jpeg";
import bcaIcon from "#/assets/bca-icon.png";
import Image from "next/image";
import Navbar from "@/components/Navbar";
export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-bl from-[#000000] to-[#81BFDA] text-black font-sans">
      {/* Navbar */}
      <Navbar />

      {/* Checkout Section */}
      <div className="p-6 space-y-6">
        <h1 className="text-3xl text-white font-bold">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left space */}
          <div className="flex-1 space-y-6">
            {/* Product Info */}
            <div className="bg-white rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-black text-white flex items-center justify-center text-sm font-medium">
                  Foto Produk
                </div>
                <div>
                  <p className="text-lg font-semibold">Nama Produk:</p>
                  <p className="text-sm">Price: $$$</p>
                  <p className="text-sm">
                    Jumlah Pesanan:{" "}
                    <span className="text-red-600 font-bold">2</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Pengiriman */}
            <div className="bg-white rounded-2xl p-4 space-y-4">
              <h2 className="text-lg font-semibold">Pengiriman</h2>

              <div>
                <label className="block text-sm mb-1">Alamat Tujuan</label>
                <input
                  type="text"
                  placeholder="Masukkan Alamat..."
                  className="w-full px-3 py-2 rounded-md bg-black text-white placeholder-white"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">
                  Pilih Jenis Pengiriman
                </label>
                <div className="space-y-2">
                  <div className="border p-3 rounded-lg">
                    Standard (Rp.$$$) - Estimasi tiba 1-30 hari
                  </div>
                  <div className="border p-3 rounded-lg">
                    Reguler (Rp.$$$) - Estimasi tiba 7 hari
                  </div>
                  <div className="border p-3 rounded-lg">
                    Instant (Rp.$$$) - Estimasi tiba hari ini (Maks 5 Jam)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right space */}
          <div className="flex-1 space-y-6">
            {/* Metode Pembayaran */}
            <div className="bg-white rounded-2xl p-4 space-y-4">
              <h2 className="text-lg font-semibold">Metode Pembayaran</h2>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    className="mr-2"
                    defaultChecked
                  />
                  <Image
                    src={gopayIcon}
                    alt="Gopay"
                    width={24}
                    height={24}
                    className="mr-2"
                  />
                  Gopay
                </label>
                <label className="flex items-center">
                  <input type="radio" name="payment" className="mr-2" />
                  <Image
                    src={bcaIcon}
                    alt="BCA"
                    width={24}
                    height={24}
                    className="mr-2"
                  />
                  BCA (Virtual Account)
                </label>
              </div>

              <button className="text-blue-600">lihat semua →</button>
            </div>

            {/* Ringkasan */}
            <div className="bg-white rounded-2xl p-4 space-y-2">
              <h2 className="text-lg font-semibold">Ringkasan</h2>
              <div className="flex justify-between text-sm">
                <span>Total harga:</span>
                <span>RpXX.XXX</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total ongkos kirim:</span>
                <span>RpXX.XXX</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total asuransi:</span>
                <span>RpXX.XXX</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total Tagihan:</span>
                <span>RpXXX.XXX</span>
              </div>
              <button className="w-full bg-black text-white rounded-lg py-2 mt-2">
                Bayar Sekarang
              </button>
              <p className="text-xs text-gray-600 text-center">
                Pastikan pesanan dan metode pembayaran sudah sesuai
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
