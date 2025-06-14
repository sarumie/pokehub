"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logoSimple from "#/logo-simple.png";
import { PublicRoute } from "@/components/AuthGuard";

function RegisterPageContent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear server error when user makes changes
    if (serverError) setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Registration failed");
        }

        // Registration successful
        router.push("/login");
      } catch (err) {
        setServerError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex justify-center items-center bg-white/85 rounded-3xl p-12 my-8 mx-auto w-11/12 max-w-3xl gap-10">
      <div className="flex-1 text-center">
        <div className="flex justify-center mb-4">
          <Image
            src={logoSimple}
            width={150}
            height={150}
            alt="Pokehub Logo"
            className="rounded-full"
          />
        </div>
        <h1 className="text-4xl my-5">
          Poke<span className="text-orange-500">Hub</span>
        </h1>
        <p className="font-bold text-lg">
          A place to collect your favorite Pokemons Cards
        </p>
      </div>
      <div className="flex-1">
        <h2 className="text-2xl mb-5">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-4 rounded-full bg-black text-white font-bold placeholder-white"
              disabled={isLoading}
            />
            {errors.username && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.username}
              </span>
            )}
          </div>
          <div className="mb-4">
            <input
              type="email"
              name="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-4 rounded-full bg-black text-white font-bold placeholder-white"
              disabled={isLoading}
            />
            {errors.email && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.email}
              </span>
            )}
          </div>
          <div className="mb-4">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-4 rounded-full bg-black text-white font-bold placeholder-white"
              disabled={isLoading}
            />
            {errors.password && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.password}
              </span>
            )}
          </div>
          <div className="mb-4">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-4 rounded-full bg-black text-white font-bold placeholder-white"
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.confirmPassword}
              </span>
            )}
          </div>
          {serverError && (
            <div className="mb-4 text-red-500 text-sm text-center">
              {serverError}
            </div>
          )}
          <button
            type="submit"
            className="w-full py-3 px-7 rounded-full bg-indigo-500 text-white font-bold text-base cursor-pointer mt-2.5 hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <PublicRoute>
      <RegisterPageContent />
    </PublicRoute>
  );
}
