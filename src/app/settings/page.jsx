"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FaEdit, FaPlus, FaTimes } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import { ProtectedRoute } from "@/components/AuthGuard";
import Loading from "@/components/Loading";

const defaultProfile = "/photo_profile/default.jpg";

function EditProfilePageContent() {
  const [user, setUser] = useState({
    username: "",
    fullName: "",
    email: "",
    profilePicture: defaultProfile,
  });
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [previewUrl, setPreviewUrl] = useState(defaultProfile);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  // Shipping address states
  const [shippingAddress, setShippingAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressFormData, setAddressFormData] = useState({
    namaAlamat: "",
    alamatLengkap: "",
    namaPenerima: "",
    kota: "",
    kodePos: "",
  });
  const [isAddressLoading, setIsAddressLoading] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = sessionStorage.getItem("userId");
        if (!userId) {
          setError("User not logged in");
          setIsLoading(false);
          return;
        }

        // Fetch user profile
        const response = await fetch(`/api/profile?userId=${userId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch user data");
        }

        setUser(data);
        setFormData({
          username: data.username || "",
          fullName: data.fullName || "",
          email: data.email || "",
          newPassword: "",
          confirmPassword: "",
        });
        setPreviewUrl(data.profilePicture || defaultProfile);

        // Fetch shipping address
        const addressResponse = await fetch(
          `/api/profile/address?userId=${userId}`
        );
        if (addressResponse.ok) {
          const addressData = await addressResponse.json();
          if (addressData.address) {
            setShippingAddress(addressData.address);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handle image selection and upload
  const handleEditPhoto = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create temporary preview URL
    const tempPreviewUrl = URL.createObjectURL(file);

    // Store current preview URL to revert to in case of failure
    const previousPreviewUrl = previewUrl;

    // Update preview immediately
    setPreviewUrl(tempPreviewUrl);
    setIsUploading(true);

    try {
      const userId = sessionStorage.getItem("userId");
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("userId", userId);

      const res = await fetch("/api/profile/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      if (data.url) {
        // Update user state and preview with new URL
        setUser((u) => ({ ...u, profilePicture: data.url }));
        setPreviewUrl(data.url);

        // Clean up temporary preview URL
        URL.revokeObjectURL(tempPreviewUrl);
      }
    } catch (err) {
      // Revert to previous preview on error
      setPreviewUrl(previousPreviewUrl);
      alert("Failed to upload image: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle address form changes
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle address modal open
  const handleOpenAddressModal = () => {
    if (shippingAddress) {
      // Populate form with existing data
      setAddressFormData({
        namaAlamat: shippingAddress.namaAlamat || "",
        alamatLengkap: shippingAddress.alamatLengkap || "",
        namaPenerima: shippingAddress.namaPenerima || "",
        kota: shippingAddress.kota || "",
        kodePos: shippingAddress.kodePos || "",
      });
    } else {
      // Clear form for new address
      setAddressFormData({
        namaAlamat: "",
        alamatLengkap: "",
        namaPenerima: "",
        kota: "",
        kodePos: "",
      });
    }
    setShowAddressModal(true);
  };

  // Handle address modal close
  const handleCloseAddressModal = () => {
    setShowAddressModal(false);
    setAddressFormData({
      namaAlamat: "",
      alamatLengkap: "",
      namaPenerima: "",
      kota: "",
      kodePos: "",
    });
  };

  // Handle address form submit
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setIsAddressLoading(true);

    try {
      const userId = sessionStorage.getItem("userId");
      const response = await fetch("/api/profile/address", {
        method: shippingAddress ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          ...addressFormData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save address");
      }

      setShippingAddress(data.address);
      setShowAddressModal(false);
      alert("Address saved successfully!");
    } catch (err) {
      alert("Failed to save address: " + err.message);
    } finally {
      setIsAddressLoading(false);
    }
  };

  // Handle profile form submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsUpdating(true);

    try {
      const userId = sessionStorage.getItem("userId");
      const updateData = {
        userId,
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
      };

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      // Update local state with new data
      setUser(data);
      setFormData((prev) => ({
        ...prev,
        username: data.username,
        fullName: data.fullName,
        email: data.email,
      }));

      alert("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle password form submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsUpdating(true);

    // Validate password confirmation
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsUpdating(false);
      return;
    }

    try {
      const userId = sessionStorage.getItem("userId");
      const updateData = {
        userId,
        newPassword: formData.newPassword,
      };

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        newPassword: "",
        confirmPassword: "",
      }));

      alert("Password updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <Loading fullScreen={false} message="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto py-10 px-4 flex flex-col md:flex-row gap-12">
        {/* Left: Forms Section */}
        <div className="flex-1 flex flex-col gap-8">
          <h1 className="text-4xl font-bold mb-2">Pengaturan</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-6">
            <div className="text-xs text-gray-500 mb-2">Profil</div>

            <div>
              <label className="block font-semibold mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-full bg-white border border-gray-300 text-gray-800"
                placeholder="Username"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-full bg-white border border-gray-300 text-gray-800"
                placeholder="Full Name"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-full bg-white border border-gray-300 text-gray-800"
                placeholder="Email"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-800 text-white rounded-xl py-4 font-semibold text-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? "Updating..." : "Update Profile"}
            </button>
          </form>

          <hr className="border-gray-300 my-4" />

          {/* Shipping Address Section */}
          <div>
            <div className="text-xs text-gray-500 mb-6">Alamat Pengiriman</div>
            {shippingAddress ? (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">
                    {shippingAddress.namaAlamat}
                  </h3>
                  <button
                    type="button"
                    onClick={handleOpenAddressModal}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Ubah
                  </button>
                </div>
                <p className="text-gray-700 mb-1">
                  {shippingAddress.namaPenerima}
                </p>
                <p className="text-gray-600 text-sm mb-1">
                  {shippingAddress.alamatLengkap}
                </p>
                <p className="text-gray-600 text-sm">
                  {shippingAddress.kota}, {shippingAddress.kodePos}
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-4 text-center">
                <p className="text-gray-600 mb-4">
                  Belum ada alamat pengiriman
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddressModal}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <FaPlus className="text-sm" />
                  Tambah Alamat
                </button>
              </div>
            )}
          </div>

          <hr className="border-gray-300 my-4" />

          {/* Password Form */}
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-6">
            <div className="text-xs text-gray-500 mb-2">Password</div>

            <div>
              <label className="block font-semibold mb-1">Password baru</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-full bg-white border border-gray-300 text-gray-800"
                placeholder="Leave blank to keep current password"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">
                Konfirmasi password baru
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-full bg-white border border-gray-300 text-gray-800"
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating || !formData.newPassword}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl py-4 font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Right: Profile Picture */}
        <div className="flex flex-col items-center gap-4 flex-shrink-0 w-full md:w-96">
          <div className="text-center text-lg font-semibold mb-2">
            Foto profil
          </div>
          <div className="w-48 h-48 rounded-full overflow-hidden bg-white border-4 border-gray-300 flex items-center justify-center">
            <Image
              src={previewUrl || defaultProfile}
              alt="Profile Picture"
              width={192}
              height={192}
              className="object-cover w-full h-full"
            />
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={handleEditPhoto}
            className="mt-2 px-6 py-2 bg-gray-800 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-700 disabled:opacity-50"
            disabled={isUploading}
          >
            <FaEdit className="text-xl" />{" "}
            {isUploading ? "Uploading..." : "Ganti Foto"}
          </button>
          {isUploading && (
            <div className="text-xs text-gray-500 mt-2">Uploading...</div>
          )}
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                {shippingAddress ? "Ubah Alamat" : "Tambah Alamat"}
              </h2>
              <button
                onClick={handleCloseAddressModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleAddressSubmit} className="p-6 space-y-4">
              <div>
                <label className="block font-semibold mb-1">Nama Alamat</label>
                <input
                  type="text"
                  name="namaAlamat"
                  value={addressFormData.namaAlamat}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-800"
                  placeholder="e.g., Rumah, Kantor"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Alamat Lengkap
                </label>
                <textarea
                  name="alamatLengkap"
                  value={addressFormData.alamatLengkap}
                  onChange={handleAddressChange}
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-800 resize-none"
                  placeholder="Alamat lengkap termasuk nama jalan, nomor rumah, dan patokan"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Nama Penerima
                </label>
                <input
                  type="text"
                  name="namaPenerima"
                  value={addressFormData.namaPenerima}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-800"
                  placeholder="Nama penerima paket"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Kota</label>
                <input
                  type="text"
                  name="kota"
                  value={addressFormData.kota}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-800"
                  placeholder="Nama kota"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Kode Pos</label>
                <input
                  type="text"
                  name="kodePos"
                  value={addressFormData.kodePos}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-800"
                  placeholder="Kode pos"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseAddressModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isAddressLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddressLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditProfilePage() {
  return (
    <ProtectedRoute>
      <EditProfilePageContent />
    </ProtectedRoute>
  );
}
