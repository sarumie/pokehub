"use client";
import { FaEnvelope, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { useState } from "react";
import { useRouter } from "next/navigation";
import logoSimple from "#/logo-simple.png";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      // Successful request
      setIsSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push("/login");
  };

  if (isSuccess) {
    return (
      <div className="flex justify-center items-center bg-white/95 rounded-3xl p-12 my-8 mx-auto w-11/12 max-w-3xl gap-10">
        <div className="flex-1 text-center flex flex-col items-center">
          <Image src={logoSimple} width={150} height={150} alt="Pokehub Logo" />
          <h1 className="text-4xl my-5 font-bold">
            Poke<span className="text-orange-500">Hub</span>
          </h1>
          <p className="font-bold text-lg">Check Your Email</p>
        </div>
        <div className="flex-1 flex flex-col items-center font-semibold space-y-6 text-center">
          <FaCheckCircle className="text-green-500 text-6xl mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Email Sent Successfully!
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            We've sent a password reset link to <strong>{email}</strong>. Please
            check your inbox and follow the instructions to reset your password.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Didn't receive the email? Check your spam folder or try again in a
            few minutes.
          </p>
          <button
            onClick={handleBackToLogin}
            className="w-full py-3 px-7 rounded-full bg-indigo-500 text-white font-bold text-base cursor-pointer hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
          >
            <FaArrowLeft />
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center bg-white/95 rounded-3xl p-12 my-8 mx-auto w-11/12 max-w-3xl gap-10">
      <div className="flex-1 text-center flex flex-col items-center">
        <Image src={logoSimple} width={150} height={150} alt="Pokehub Logo" />
        <h1 className="text-4xl my-5 font-bold">
          Poke<span className="text-orange-500">Hub</span>
        </h1>
        <p className="font-bold text-lg">Forgot Password?</p>
        <p className="text-gray-600 mt-2 text-sm">
          No worries! Enter your email and we'll send you a reset link.
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col items-center font-semibold space-y-4"
      >
        <div className="w-full relative">
          <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white" />
          <input
            type="email"
            placeholder="Enter your email address"
            className="w-full p-4 pl-12 rounded-full bg-black text-white placeholder-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        {error && (
          <div className="w-full">
            <p className="text-red-500 text-sm text-center">{error}</p>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 px-7 rounded-full bg-indigo-500 text-white font-bold text-base cursor-pointer mt-2.5 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-600 transition-colors"
          disabled={isLoading || !email.trim()}
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </button>

        <div className="w-full">
          <hr className="border-t-2 border-gray-300" />
        </div>

        <div className="flex flex-col items-center w-full space-y-4">
          <p className="text-gray-600">Remember your password?</p>
          <button
            type="button"
            onClick={handleBackToLogin}
            className="w-full py-3 px-7 rounded-full border-2 border-indigo-500 text-indigo-500 font-bold text-base cursor-pointer hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
          >
            <FaArrowLeft />
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
}
