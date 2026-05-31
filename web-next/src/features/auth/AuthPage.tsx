import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, Loader } from "lucide-react";
import svgPaths from "@/shared/imports/svg-nnzqmx1xjq";
import { authService, RegisterRequest, LoginRequest } from "@/shared/api/services";
import { useAuth } from "@/shared/context/AuthContext";
import { useSEO } from "@/shared/hooks/useSEO";
import { toast } from "sonner";

export function AuthPage() {
  useSEO({
    title: "Sign in or create an account | Book United Hotels",
    description: "Access your bookings, saved hotels, and group requests with Book United Hotels.",
    canonical: "/auth",
    robots: "noindex,follow",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();

  // Determine where to go after auth: use returnUrl query param, state, or sessionStorage
  const getReturnUrl = () => {
    const params = new URLSearchParams(location.search);
    const fromQuery = params.get("returnUrl");
    const fromState = (location.state as any)?.returnUrl;
    const fromStorage = sessionStorage.getItem("authReturnUrl");
    return fromQuery || fromState || fromStorage || "/booking/step2";
  };

  const doRedirect = () => {
    const url = getReturnUrl();
    sessionStorage.removeItem("authReturnUrl");
    navigate(url);
  };

  const [activeTab, setActiveTab] = useState<"login" | "register" | "guest">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: ""
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.email.includes("@")) newErrors.email = "Invalid email format";

    if (activeTab === "login") {
      if (!formData.password) newErrors.password = "Password is required";
    } else if (activeTab === "register") {
      if (!formData.name) newErrors.name = "Name is required";
      if (!formData.password) newErrors.password = "Password is required";
      if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords don't match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const credentials: LoginRequest = {
        email: formData.email,
        password: formData.password,
      };

      // Going through AuthContext.login keeps the in-memory user state in
      // sync with the freshly-fetched /me response — so the rest of the app
      // (Navigation, BookingStep2 prefill, RequireAdmin) sees us logged in
      // immediately, without waiting for a remount or a localStorage read.
      await authLogin(credentials);

      toast.success("Login successful!");
      doRedirect();
    } catch (error: any) {
      // Backend returns `{ error: '...' }` (key: error, not message). Pull
      // that first so the user sees the helpful message instead of the
      // generic "HTTP 401: Unauthorized" wrapper text.
      const errorMessage =
        error?.data?.error ||
        error?.data?.message ||
        error?.message ||
        "Login failed. Please try again.";
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const registerData: RegisterRequest = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber ? parseInt(formData.phoneNumber) : undefined,
      };

      const response = (await authService.register(registerData)) as
        | { resent?: boolean; message?: string }
        | undefined;

      if (response?.resent) {
        // Backend recognized an unverified duplicate and resent the welcome
        // email instead of creating a new account — keep the user in place
        // and tell them to check their inbox.
        toast.success(
          response.message ||
            "We've resent the verification email — please check your inbox."
        );
      } else {
        toast.success("Registration successful! Please verify your email, then sign in.");
        setFormData({ name: "", email: "", password: "", confirmPassword: "", phoneNumber: "" });
        setActiveTab("login");
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.error ||
        error?.data?.message ||
        error?.message ||
        "Registration failed. Please try again.";
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestContinue = () => {
    doRedirect();
  };

  return (
    <div className="h-screen bg-[#fafafa] flex overflow-hidden">
      {/* Left Side - Form. overflow-y-auto so the longer Register form
          can scroll *within* the column instead of pushing the whole page. */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
        <div className="w-full max-w-[440px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="h-[24px] w-[26px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 26">
                <mask fill="white" id="path-1-inside-1_20_512">
                  <path d={svgPaths.p32095b00} />
                </mask>
                <path d={svgPaths.p32095b00} fill="#2F80ED" mask="url(#path-1-inside-1_20_512)" stroke="#2F80ED" strokeWidth="0.4" />
              </svg>
            </div>
            <span className="font-['Poppins:SemiBold',sans-serif] text-[18px] text-[#2F80ED]">
              United Hotels
            </span>
          </Link>

          {/* Header */}
          <div className="mb-5">
            <h1 className="font-['Poppins:Bold',sans-serif] text-[24px] md:text-[28px] leading-tight text-[#3b3b3b] mb-1.5">
              Complete Your Booking
            </h1>
            <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#6b7280]">
              Sign in to continue or create a new account
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-5 bg-white p-1 rounded-xl border border-[#eaeaea]">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-2 rounded-lg font-['Inter:SemiBold',sans-serif] text-[13.5px] transition-all ${
                activeTab === "login"
                  ? "bg-[#2F80ED] text-white"
                  : "text-[#6b7280] hover:text-[#3b3b3b]"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-2 rounded-lg font-['Inter:SemiBold',sans-serif] text-[13.5px] transition-all ${
                activeTab === "register"
                  ? "bg-[#2F80ED] text-white"
                  : "text-[#6b7280] hover:text-[#3b3b3b]"
              }`}
            >
              Register
            </button>
            <button
              onClick={() => setActiveTab("guest")}
              className={`flex-1 py-2 rounded-lg font-['Inter:SemiBold',sans-serif] text-[13.5px] transition-all ${
                activeTab === "guest"
                  ? "bg-[#2F80ED] text-white"
                  : "text-[#6b7280] hover:text-[#3b3b3b]"
              }`}
            >
              Guest
            </button>
          </div>

          {/* Login Form */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              {/* Error Alert */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="font-['Inter:Regular',sans-serif] text-[14px] text-red-700">{errors.submit}</p>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-[13px] text-[#3b3b3b] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c8c8c]" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    className={`w-full pl-11 pr-4 py-2.5 border rounded-xl font-['Inter:Regular',sans-serif] text-[14px] focus:outline-none focus:ring-2 transition-all ${
                      errors.email
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-[#eaeaea] focus:border-[#2F80ED] focus:ring-[#2F80ED]/20"
                    }`}
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1 font-['Inter:Regular',sans-serif]">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-[13px] text-[#3b3b3b] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c8c8c]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (errors.password) setErrors({ ...errors, password: "" });
                    }}
                    className={`w-full pl-11 pr-11 py-2.5 border rounded-xl font-['Inter:Regular',sans-serif] text-[14px] focus:outline-none focus:ring-2 transition-all ${
                      errors.password
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-[#eaeaea] focus:border-[#2F80ED] focus:ring-[#2F80ED]/20"
                    }`}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8c8c8c] hover:text-[#3b3b3b]"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1 font-['Inter:Regular',sans-serif]">{errors.password}</p>}
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link
                  to="/auth/forgot"
                  className="font-['Inter:Medium',sans-serif] text-[14px] text-[#2F80ED] hover:text-[#1E5FBC] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2F80ED] text-white py-2.5 rounded-xl hover:bg-[#1E5FBC] transition-colors font-['Inter:SemiBold',sans-serif] text-[14.5px] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Continue to Booking
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Register Form */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-3">
              {/* Error Alert */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="font-['Inter:Regular',sans-serif] text-[14px] text-red-700">{errors.submit}</p>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-[13px] text-[#3b3b3b] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c8c8c]" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: "" });
                    }}
                    className={`w-full pl-11 pr-4 py-2.5 border rounded-xl font-['Inter:Regular',sans-serif] text-[14px] focus:outline-none focus:ring-2 transition-all ${
                      errors.name
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-[#eaeaea] focus:border-[#2F80ED] focus:ring-[#2F80ED]/20"
                    }`}
                    placeholder="John Doe"
                    disabled={loading}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-1 font-['Inter:Regular',sans-serif]">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-[13px] text-[#3b3b3b] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c8c8c]" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    className={`w-full pl-11 pr-4 py-2.5 border rounded-xl font-['Inter:Regular',sans-serif] text-[14px] focus:outline-none focus:ring-2 transition-all ${
                      errors.email
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-[#eaeaea] focus:border-[#2F80ED] focus:ring-[#2F80ED]/20"
                    }`}
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1 font-['Inter:Regular',sans-serif]">{errors.email}</p>}
              </div>

              {/* Phone (optional) */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-[13px] text-[#3b3b3b] mb-1.5">
                  Phone Number (optional)
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#eaeaea] rounded-xl font-['Inter:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/20 transition-all"
                  placeholder="+1 (555) 123-4567"
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-[13px] text-[#3b3b3b] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c8c8c]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (errors.password) setErrors({ ...errors, password: "" });
                    }}
                    className={`w-full pl-11 pr-11 py-2.5 border rounded-xl font-['Inter:Regular',sans-serif] text-[14px] focus:outline-none focus:ring-2 transition-all ${
                      errors.password
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-[#eaeaea] focus:border-[#2F80ED] focus:ring-[#2F80ED]/20"
                    }`}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8c8c8c] hover:text-[#3b3b3b]"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1 font-['Inter:Regular',sans-serif]">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-[13px] text-[#3b3b3b] mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c8c8c]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value });
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                    }}
                    className={`w-full pl-11 pr-11 py-2.5 border rounded-xl font-['Inter:Regular',sans-serif] text-[14px] focus:outline-none focus:ring-2 transition-all ${
                      errors.confirmPassword
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-[#eaeaea] focus:border-[#2F80ED] focus:ring-[#2F80ED]/20"
                    }`}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1 font-['Inter:Regular',sans-serif]">{errors.confirmPassword}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2F80ED] text-white py-2.5 rounded-xl hover:bg-[#1E5FBC] transition-colors font-['Inter:SemiBold',sans-serif] text-[14.5px] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account & Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Terms */}
              <p className="text-center font-['Inter:Regular',sans-serif] text-[13px] text-[#6b7280]">
                By creating an account, you agree to our{" "}
                <a href="#" className="text-[#2F80ED] hover:underline">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-[#2F80ED] hover:underline">Privacy Policy</a>
              </p>
            </form>
          )}

          {/* Guest Checkout */}
          {activeTab === "guest" && (
            <div className="space-y-4">
              <div className="bg-[#f0fdf4] border border-[#2F80ED]/20 rounded-xl p-4">
                <h3 className="font-['Poppins:SemiBold',sans-serif] text-[16px] text-[#3b3b3b] mb-1.5">
                  Continue as Guest
                </h3>
                <p className="font-['Inter:Regular',sans-serif] text-[13px] text-[#6b7280] leading-snug mb-3">
                  Complete your booking without creating an account — we'll just need your email for confirmation.
                </p>
                <ul className="space-y-1 mb-1">
                  <li className="flex items-start gap-2 font-['Inter:Regular',sans-serif] text-[12.5px] text-[#6b7280]">
                    <span className="text-[#ef4444] text-[14px] leading-tight">•</span>
                    <span>No saved booking history</span>
                  </li>
                  <li className="flex items-start gap-2 font-['Inter:Regular',sans-serif] text-[12.5px] text-[#6b7280]">
                    <span className="text-[#ef4444] text-[14px] leading-tight">•</span>
                    <span>Cannot manage bookings online</span>
                  </li>
                  <li className="flex items-start gap-2 font-['Inter:Regular',sans-serif] text-[12.5px] text-[#6b7280]">
                    <span className="text-[#ef4444] text-[14px] leading-tight">•</span>
                    <span>Must contact support for changes</span>
                  </li>
                </ul>
              </div>

              {/* Email for guest */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-[13px] text-[#3b3b3b] mb-1.5">
                  Email Address (for confirmation)
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c8c8c]" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-2.5 border border-[#eaeaea] rounded-xl font-['Inter:Regular',sans-serif] text-[14px] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/20 transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                onClick={handleGuestContinue}
                className="w-full bg-[#2F80ED] text-white py-2.5 rounded-xl hover:bg-[#1E5FBC] transition-colors font-['Inter:SemiBold',sans-serif] text-[14.5px] flex items-center justify-center gap-2"
              >
                Continue as Guest
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Recommendation */}
              <div className="text-center">
                <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#6b7280]">
                  We recommend creating an account for easier booking management
                </p>
              </div>
            </div>
          )}

          {/* Back to Booking + Staff Portal — single compact row to save vertical space */}
          <div className="mt-5 pt-4 border-t border-[#eaeaea] flex items-center justify-between gap-3">
            <Link
              to="/booking/step1"
              className="font-['Inter:Medium',sans-serif] text-[12.5px] text-[#6b7280] hover:text-[#2F80ED] transition-colors"
            >
              ← Back to Booking
            </Link>
            <span className="font-['Inter:Regular',sans-serif] text-[12px] text-[#8c8c8c]">
              Hotel partner?{' '}
              <Link
                to="/admin/login"
                className="font-['Inter:Medium',sans-serif] text-[#2F80ED] hover:text-[#1E5FBC] transition-colors"
              >
                Staff Portal
              </Link>
            </span>
          </div>
        </div>
      </div>

      {/* Right Side - Benefits. Pinned to viewport via h-screen on root +
          overflow-hidden on this column. Density tuned so the headline,
          benefit list and testimonial all fit a 720px-tall viewport. */}
      <div className="hidden lg:flex flex-1 bg-linear-to-br from-[#2F80ED] to-[#1E5FBC] p-10 xl:p-12 items-center justify-center overflow-hidden">
        <div className="max-w-[460px] w-full">
          <h2 className="font-['Poppins:Bold',sans-serif] text-[28px] xl:text-[32px] leading-[1.15] text-white mb-5">
            Why Create an Account?
          </h2>

          <div className="space-y-3.5">
            {[
              {
                title: "Manage All Bookings",
                description: "View, modify, or cancel reservations from one place"
              },
              {
                title: "Faster Checkout",
                description: "Save details for quick bookings next time"
              },
              {
                title: "Exclusive Deals",
                description: "Member-only rates and special offers"
              },
              {
                title: "Booking History",
                description: "Track all your past and upcoming stays"
              },
              {
                title: "Easy Support",
                description: "Contact support with your booking details ready"
              }
            ].map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-['Poppins:SemiBold',sans-serif] text-[15px] text-white mb-0.5">
                    {benefit.title}
                  </h3>
                  <p className="font-['Inter:Regular',sans-serif] text-[12.5px] text-white/85 leading-snug">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-white/20">
            <p className="font-['Inter:Regular',sans-serif] text-[13.5px] text-white/90 italic leading-snug">
              "Creating an account made managing my Turkey bookings so much easier."
            </p>
            <p className="font-['Inter:SemiBold',sans-serif] text-[12.5px] text-white mt-2">
              — Sarah M., Verified Guest
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;