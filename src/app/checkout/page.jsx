"use client";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { formatPrice } from "@/utils/priceFormat";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/AuthGuard";

// Payment QR Modal Component
const PaymentQRModal = ({ isOpen, onClose, totalAmount, onCheckPayment }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
    >
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Pembayaran QRIS</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="text-center space-y-4">
          <div className="relative w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-gray-500 text-sm">
              QR Code akan muncul di sini
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-gray-600">Total Pembayaran</p>
            <p className="text-2xl font-bold text-green-600">
              {formatPrice(totalAmount)}
            </p>
          </div>

          <div className="text-sm text-gray-500 space-y-1 text-left">
            <p>1. Buka aplikasi e-wallet atau mobile banking</p>
            <p>2. Scan QR code di atas</p>
            <p>3. Periksa detail pembayaran</p>
            <p>4. Konfirmasi pembayaran</p>
          </div>

          <button
            onClick={onCheckPayment}
            className="w-full bg-black text-white rounded-lg py-3 mt-4 hover:bg-gray-800 transition-colors font-medium"
          >
            Cek Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
};

// Payment Success Modal Component
const PaymentSuccessModal = ({ isOpen, countdown }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
    >
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-green-600">
            Pembayaran Berhasil!
          </h2>

          <p className="text-gray-600">
            Terima kasih atas pembelian Anda. Pesanan sedang diproses.
          </p>

          <p className="text-sm text-gray-500">
            Dikembalikan ke halaman utama dalam {countdown} detik...
          </p>
        </div>
      </div>
    </div>
  );
};

function CheckoutPageContent() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(3);

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

  useEffect(() => {
    let timer;
    if (isSuccessModalOpen && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (isSuccessModalOpen && countdown === 0) {
      router.push("/home");
    }
    return () => clearTimeout(timer);
  }, [isSuccessModalOpen, countdown, router]);

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shippingCost = 0; // Free shipping as shown in image
    return subtotal + shippingCost;
  };

  const handlePayment = () => {
    setIsQRModalOpen(true);
  };

  const handleCheckPayment = () => {
    setIsQRModalOpen(false);
    setIsSuccessModalOpen(true);
    setCountdown(3);
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    // Find the item to check stock
    const currentItem = cartItems.find((item) => item.id === itemId);
    if (!currentItem) return;

    // Check if new quantity exceeds available stock
    if (newQuantity > currentItem.listing.stock) {
      alert(
        `Sorry, only ${currentItem.listing.stock} items available in stock.`
      );
      return;
    }

    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItemId: itemId,
          quantity: newQuantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      const updatedItem = await response.json();

      setCartItems(
        cartItems.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity: newQuantity,
                totalPrice: updatedItem.totalPrice,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      // Fallback to local update if API fails
      setCartItems(
        cartItems.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity: newQuantity,
                totalPrice: item.listing.price * newQuantity,
              }
            : item
        )
      );
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await fetch(`/api/cart?cartItemId=${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove item from cart");
      }

      setCartItems(cartItems.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-48 bg-gray-200 rounded-2xl"></div>
                <div className="h-64 bg-gray-200 rounded-2xl"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-gray-200 rounded-2xl"></div>
                <div className="h-64 bg-gray-200 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Keranjang</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Cart Items & Shipping */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg p-4 border">
              <h2 className="font-semibold mb-3">Shipping address</h2>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Default • Joko Minto</p>
                  <p className="text-sm">
                    Jl. Panjang No.2, RT.19/RW.4, Kedoya Sel., Kec. Kb. Jeruk,
                    Kota Jakarta Barat,
                    <br />
                    Daerah Khusus Ibukota Jakarta 11520
                  </p>
                </div>
                <button className="text-blue-600 text-sm hover:underline flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Change
                </button>
              </div>
            </div>

            {/* Cart Items */}
            {cartItems.length === 0 ? (
              <div className="bg-white rounded-lg p-8 border text-center">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l-2.5 5M17 17a2 2 0 11-4 0 2 2 0 014 0zm-8 0a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-500 mb-4">
                  Add some items to your cart to continue shopping.
                </p>
                <button
                  onClick={() => router.push("/discover")}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const quantity =
                  item.quantity ||
                  Math.ceil(item.totalPrice / item.listing.price);
                return (
                  <div key={item.id} className="bg-white rounded-lg p-4 border">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={item.listing.pictUrl}
                          alt={item.listing.name}
                          fill
                          className="object-contain rounded"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {item.listing.seller?.profilePicture ? (
                              <Image
                                src={item.listing.seller.profilePicture}
                                alt={item.listing.seller.username}
                                width={32}
                                height={32}
                                className="object-cover rounded-full"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-gray-500 text-xs font-bold">
                                  {item.listing.seller?.username
                                    ?.charAt(0)
                                    ?.toUpperCase() || "?"}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">
                              {item.listing.seller?.username ||
                                "Unknown Seller"}
                            </p>
                            <h3 className="font-medium">{item.listing.name}</h3>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-500 p-1"
                            title="Remove from cart"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>

                        {/* Stock Info */}
                        <div className="text-xs mb-2 flex items-center gap-1">
                          <span
                            className={`${
                              item.listing.stock <= 5
                                ? item.listing.stock <= 2
                                  ? "text-red-500"
                                  : "text-orange-500"
                                : "text-gray-500"
                            }`}
                          >
                            Stock: {item.listing.stock} available
                          </span>
                          {item.listing.stock <= 5 && (
                            <span className="text-xs text-red-500 font-medium">
                              {item.listing.stock <= 2
                                ? "• Almost gone!"
                                : "• Low stock"}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls and Price */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, quantity - 1)
                              }
                              disabled={quantity <= 1}
                              className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                                quantity <= 1
                                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                  : "border-gray-300 hover:bg-gray-50 text-gray-700"
                              }`}
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-medium">
                              {quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, quantity + 1)
                              }
                              disabled={quantity >= item.listing.stock}
                              className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                                quantity >= item.listing.stock
                                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                  : "border-gray-300 hover:bg-gray-50 text-gray-700"
                              }`}
                              title={
                                quantity >= item.listing.stock
                                  ? "Maximum stock reached"
                                  : "Increase quantity"
                              }
                            >
                              +
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Subtotal</p>
                            <p className="font-semibold">
                              {formatPrice(item.totalPrice)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column - Payment & Summary */}
          <div className="space-y-6">
            {/* Payment Method */}
            <div className="bg-white rounded-lg p-4 border">
              <h2 className="font-semibold mb-4">Payment</h2>
              <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 border-blue-200">
                <div className="flex items-center gap-3">
                  <Image
                    src="https://cdn-1.files.vc/files/inh/a2e63eb09668a78fe530b08d7e9e2b75.svg"
                    alt="QRIS"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                  <span className="font-medium">QRIS</span>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg p-4 border">
              <h2 className="font-semibold mb-4">Ringkasan keranjang</h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total harga:</span>
                  <span className="font-semibold">
                    {formatPrice(calculateSubtotal())}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Total ongkos kirim:</span>
                  <span className="font-semibold">Rp. 0</span>
                </div>

                <hr className="my-3" />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total tagihan:</span>
                  <span>{formatPrice(calculateTotal())}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                className="w-full bg-black text-white rounded-lg py-3 mt-6 hover:bg-gray-800 transition-colors font-medium"
              >
                🛒 Bayar sekarang
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Pastikan pesanan dan metode pembayaran sudah sesuai.
              </p>
            </div>
          </div>
        </div>

        {/* Payment QR Modal */}
        <PaymentQRModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          totalAmount={calculateTotal()}
          onCheckPayment={handleCheckPayment}
        />

        {/* Payment Success Modal */}
        <PaymentSuccessModal
          isOpen={isSuccessModalOpen}
          countdown={countdown}
        />
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutPageContent />
    </ProtectedRoute>
  );
}
