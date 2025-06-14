"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FaEdit } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import { ProtectedRoute } from "@/components/AuthGuard";

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

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsUpdating(true);

    // Validate password confirmation
    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      setError("Passwords do not match");
      setIsUpdating(false);
      return;
    }

    try {
      const userId = sessionStorage.getItem("userId");
      const updateData = {
        userId,
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
      };

      // Only include password if it's provided
      if (formData.newPassword) {
        updateData.newPassword = formData.newPassword;
      }

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
        newPassword: "",
        confirmPassword: "",
      }));

      alert("Profile updated successfully!");
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
        <div className="max-w-6xl mx-auto py-10 px-4 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800 mx-auto mb-4"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto py-10 px-4 flex flex-col md:flex-row gap-12">
        {/* Left: Edit Form */}
        <form className="flex-1 flex flex-col gap-8" onSubmit={handleSubmit}>
          <div>
            <h1 className="text-4xl font-bold mb-2">Pengaturan</h1>
            <div className="text-xs text-gray-500 mb-6">Profil</div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <label className="block font-semibold mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-full bg-white border border-gray-300 text-gray-800 mb-4"
              placeholder="Username"
              required
            />
            <label className="block font-semibold mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-full bg-white border border-gray-300 text-gray-800 mb-4"
              placeholder="Full Name"
            />
            <label className="block font-semibold mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-full bg-white border border-gray-300 text-gray-800 mb-4"
              placeholder="Email"
              required
            />
          </div>
          <hr className="border-gray-300 my-4" />
          <div>
            <div className="text-xs text-gray-500 mb-6">Password</div>
            <label className="block font-semibold mb-1">Password baru</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-full bg-white border border-gray-300 text-gray-800 mb-4"
              placeholder="Leave blank to keep current password"
            />
            <label className="block font-semibold mb-1">
              Konfirmasi password baru
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-full bg-white border border-gray-300 text-gray-800 mb-4"
              placeholder="Confirm new password"
            />
          </div>
          <button
            type="submit"
            disabled={isUpdating}
            className="mt-8 w-full flex items-center justify-center gap-2 bg-gray-800 text-white rounded-xl py-4 font-semibold text-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? "Updating..." : "Update Profile"}
          </button>
        </form>

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
            {isUploading ? "Uploading..." : "Edit foto"}
          </button>
          {isUploading && (
            <div className="text-xs text-gray-500 mt-2">Uploading...</div>
          )}
        </div>
      </div>
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
