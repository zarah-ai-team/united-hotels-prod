import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import svgPaths from "../../imports/svg-nnzqmx1xjq";

export function AuthPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"login" | "register" | "guest">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    alert("Login successful!");
    navigate("/booking/step2");
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    // Simulate registration
    alert("Registration successful!");
    navigate("/booking/step2");
  };

  const handleGuestContinue = () => {
    navigate("/booking/step2");
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="w-full max-w-[480px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-10">
            <div className="h-[26px] w-[28px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 26">
                <mask fill="white" id="path-1-inside-1_20_512">
                  <path d={svgPaths.p32095b00} />
                </mask>
                <path d={svgPaths.p32095b00} fill="#1ABC9C" mask="url(#path-1-inside-1_20_512)" stroke="#1ABC9C" strokeWidth="0.4" />
              </svg>
            </div>
            <span className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-[#1abc9c]">
              United Hotels
            </span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-['Poppins:Bold',sans-serif] text-[36px] leading-[44px] text-[#3b3b3b] mb-3">
              Complete Your Booking
            </h1>
            <p className="font-['Inter:Regular',sans-serif] text-[16px] text-[#6b7280]">
              Sign in to continue or create a new account
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-xl border border-[#eaeaea]">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-3 rounded-lg font-['Inter:SemiBold',sans-serif] text-[15px] transition-all ${
                activeTab === "login"
                  ? "bg-[#1abc9c] text-white"
                  : "text-[#6b7280] hover:text-[#3b3b3b]"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-3 rounded-lg font-['Inter:SemiBold',sans-serif] text-[15px] transition-all ${
                activeTab === "register"
                  ? "bg-[#1abc9c] text-white"
                  : "text-[#6b7280] hover:text-[#3b3b3b]"
              }`}
            >
              Register
            </button>
            <button
              onClick={() => setActiveTab("guest")}
              className={`flex-1 py-3 rounded-lg font-['Inter:SemiBold',sans-serif] text-[15px] transition-all ${
                activeTab === "guest"
                  ? "bg-[#1abc9c] text-white"
                  : "text-[#6b7280] hover:text-[#3b3b3b]"
              }`}
            >
              Guest
            </button>
          </div>

          {/* Login Form */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-[15px] text-[#3b3b3b] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c8c8c]" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 border border-[#eaeaea] rounded-xl font-['Inter:Regular',sans-serif] text-[16px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/20 transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-[15px] text-[#3b3b3b] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c8c8c]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-3.5 border border-[#eaeaea] rounded-xl font-['Inter:Regular',sans-serif] text-[16px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/20 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8c8c8c] hover:text-[#3b3b3b]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <button
                  type="button"
                  className="font-['Inter:Medium',sans-serif] text-[14px] text-[#1abc9c] hover:text-[#16a085] transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#1abc9c] text-white py-4 rounded-xl hover:bg-[#16a085] transition-colors font-['Inter:SemiBold',sans-serif] text-[16px] flex items-center justify-center gap-2"
              >
                Continue to Booking
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {/* Register Form */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-[15px] text-[#3b3b3b] mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c8c8c]" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 border border-[#eaeaea] rounded-xl font-['Inter:Regular',sans-serif] text-[16px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/20 transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-[15px] text-[#3b3b3b] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c8c8c]" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 border border-[#eaeaea] rounded-xl font-['Inter:Regular',sans-serif] text-[16px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/20 transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-[15px] text-[#3b3b3b] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c8c8c]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-3.5 border border-[#eaeaea] rounded-xl font-['Inter:Regular',sans-serif] text-[16px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/20 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8c8c8c] hover:text-[#3b3b3b]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-[15px] text-[#3b3b3b] mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c8c8c]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-12 py-3.5 border border-[#eaeaea] rounded-xl font-['Inter:Regular',sans-serif] text-[16px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/20 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#1abc9c] text-white py-4 rounded-xl hover:bg-[#16a085] transition-colors font-['Inter:SemiBold',sans-serif] text-[16px] flex items-center justify-center gap-2"
              >
                Create Account & Continue
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Terms */}
              <p className="text-center font-['Inter:Regular',sans-serif] text-[13px] text-[#6b7280]">
                By creating an account, you agree to our{" "}
                <a href="#" className="text-[#1abc9c] hover:underline">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-[#1abc9c] hover:underline">Privacy Policy</a>
              </p>
            </form>
          )}

          {/* Guest Checkout */}
          {activeTab === "guest" && (
            <div className="space-y-6">
              <div className="bg-[#f0fdf4] border border-[#1abc9c]/20 rounded-xl p-6">
                <h3 className="font-['Poppins:SemiBold',sans-serif] text-[18px] text-[#3b3b3b] mb-3">
                  Continue as Guest
                </h3>
                <p className="font-['Inter:Regular',sans-serif] text-[15px] text-[#6b7280] leading-[24px] mb-4">
                  You can complete your booking without creating an account. However, you'll need to provide your email to receive booking confirmation.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 font-['Inter:Regular',sans-serif] text-[14px] text-[#6b7280]">
                    <span className="text-[#ef4444] text-[16px]">•</span>
                    <span>No saved booking history</span>
                  </li>
                  <li className="flex items-start gap-2 font-['Inter:Regular',sans-serif] text-[14px] text-[#6b7280]">
                    <span className="text-[#ef4444] text-[16px]">•</span>
                    <span>Cannot manage bookings online</span>
                  </li>
                  <li className="flex items-start gap-2 font-['Inter:Regular',sans-serif] text-[14px] text-[#6b7280]">
                    <span className="text-[#ef4444] text-[16px]">•</span>
                    <span>Must contact support for changes</span>
                  </li>
                </ul>
              </div>

              {/* Email for guest */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-[15px] text-[#3b3b3b] mb-2">
                  Email Address (for confirmation)
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c8c8c]" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 border border-[#eaeaea] rounded-xl font-['Inter:Regular',sans-serif] text-[16px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/20 transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                onClick={handleGuestContinue}
                className="w-full bg-[#1abc9c] text-white py-4 rounded-xl hover:bg-[#16a085] transition-colors font-['Inter:SemiBold',sans-serif] text-[16px] flex items-center justify-center gap-2"
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

          {/* Back to Booking */}
          <div className="mt-8 text-center">
            <Link
              to="/booking/step1"
              className="font-['Inter:Medium',sans-serif] text-[14px] text-[#6b7280] hover:text-[#1abc9c] transition-colors"
            >
              ← Back to Booking
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Benefits */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#1abc9c] to-[#16a085] p-16 items-center justify-center">
        <div className="max-w-[480px]">
          <h2 className="font-['Poppins:Bold',sans-serif] text-[40px] leading-[52px] text-white mb-6">
            Why Create an Account?
          </h2>
          
          <div className="space-y-6">
            {[
              {
                title: "Manage All Bookings",
                description: "View, modify, or cancel your reservations anytime from one place"
              },
              {
                title: "Faster Checkout",
                description: "Save your details for quick bookings on your next visit"
              },
              {
                title: "Exclusive Deals",
                description: "Get access to member-only rates and special offers"
              },
              {
                title: "Booking History",
                description: "Keep track of all your past and upcoming hotel stays"
              },
              {
                title: "Easy Support",
                description: "Contact support instantly with your booking details readily available"
              }
            ].map((benefit, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-['Poppins:SemiBold',sans-serif] text-[18px] text-white mb-1">
                    {benefit.title}
                  </h3>
                  <p className="font-['Inter:Regular',sans-serif] text-[15px] text-white/90">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="font-['Inter:Regular',sans-serif] text-[16px] text-white/90 italic">
              "Creating an account made managing my Istanbul bookings so much easier. Highly recommend!"
            </p>
            <p className="font-['Inter:SemiBold',sans-serif] text-[15px] text-white mt-3">
              — Sarah M., Verified Guest
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;