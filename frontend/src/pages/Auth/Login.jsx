// frontend/src/pages/Auth/Login.jsx
import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import {
  GraduationCap, Lightbulb, Pencil, Microscope, BookOpen,
  FlaskConical, Globe, Laptop, Smartphone, FileText, MapPin
} from "lucide-react";
import logo from "../../assets/logo.png";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    document.title = "UOK-DFS - Login";
  }, []);

  const [activeTab, setActiveTab] = useState("student");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    showPassword: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  // frontend/src/pages/Auth/Login.jsx// Login.jsx
  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("🚀 Login Form Submit:", formData, "Active Tab:", activeTab);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          userType: activeTab,
        }),
      });

      // console.log("📡 Login API Response:", response);
      const data = await response.json();
      // console.log("✅ Login Data:", data);

      if (!response.ok) {
        alert(data?.message || "Login failed");
        return;
      }

      login({
        token: data.token,
        roleSlug: data.roleSlug,  // ✅ correct key name
        roleName: data.roleName,  
        userId: data.userId,
        email: data.email,
      });


      // console.log("🔑 User logged in with role:", data.roleSlug);

      if (data.roleSlug === "student") {
        navigate("/dashboard", { replace: true });
      } else if (data.roleSlug === "faculty-admin") {
        navigate("/faculty-dashboard", { replace: true });
      } else if (data.roleSlug === "university-admin") {
        navigate("/university-dashboard", { replace: true });
      } else {
        alert("Unknown role");
      }
    } catch (error) {
      console.error("❌ Login Error:", error);
      alert("Login failed. Please try again later.");
    }
  };




  return (
    <div className="relative flex flex-col md:flex-row h-screen w-screen overflow-hidden font-sans">
      {/* Left Section (same as before) */}
      <div className="relative hidden md:flex w-1/2 flex-col justify-center items-center bg-gradient-to-br from-green-600 to-green-700 overflow-hidden">
        <div className="absolute inset-0 opacity-30 z-10">
          <GraduationCap className="absolute top-6 left-6 w-10 h-10 lg:w-14 lg:h-14 text-green-100 animate-float-slow" />
          <Lightbulb className="absolute top-10 right-10 w-10 h-10 lg:w-14 lg:h-14 text-yellow-200 animate-spin-slow" />
          <BookOpen className="absolute top-2/7 left-25 w-9 h-9 lg:w-12 lg:h-12 text-green-200 animate-float-fast" />
          <FileText className="absolute top-[60%] left-12 w-9 h-9 lg:w-12 lg:h-12 text-green-100 animate-rotate-slow" />
          <Globe className="absolute top-1/2 right-16 w-10 h-10 lg:w-14 lg:h-14 text-green-200 animate-swing" />
          <Laptop className="absolute top-1/2 left-1/3 w-10 h-10 lg:w-14 lg:h-14 text-green-100 animate-tilt" />
          <Pencil className="absolute bottom-20 left-8 w-9 h-9 lg:w-12 lg:h-12 text-green-100 animate-bounce-subtle" />
          <MapPin className="absolute bottom-8 left-60 w-9 h-9 lg:w-12 lg:h-12 text-emerald-300 animate-pulse-fast" />
          <FlaskConical className="absolute bottom-20 right-14 w-10 h-10 lg:w-14 lg:h-14 text-emerald-200 animate-float-slow" />
          <Microscope className="absolute bottom-10 right-1/3 w-12 h-12 lg:w-16 lg:h-16 text-green-100 animate-rotate-slow" />
          <Globe className="absolute top-5 left-2/5 transform translate-x-10 w-9 h-9 lg:w-12 lg:h-12 text-emerald-200 animate-float-fast" />
          <Smartphone className="absolute top-48 left-[60%] transform translate-x-14 w-9 h-9 lg:w-12 lg:h-12 text-green-200 animate-swing" />
        </div>

        <div className="text-center max-w-md lg:max-w-lg text-white px-6 lg:px-10 z-20 drop-shadow-lg">
          <div className="flex justify-center mb-6">
            <img
              src={logo}
              alt="UOK Logo"
              className="w-56 h-56 lg:w-72 lg:h-72 object-contain rounded-full drop-shadow-lg animate-fade-in"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>
          <h1 className="text-xl lg:text-2xl font-semibold mb-3 animate-fade-in tracking-[0.17em] uppercase">
            Break the Manual Limits
          </h1>
          <p className="text-base lg:text-lg leading-relaxed text-green-100 animate-fade-in delay-500 underline decoration-2 underline-offset-7">
            Login and Step Into Digital Freedom
          </p>
        </div>
      </div>

      {/* Right Section (with tabs for Student/Admin) */}
      <div className="relative w-full md:w-1/2 flex justify-center items-center px-4 sm:px-6 bg-white overflow-hidden">
        <div className="relative w-full max-w-md lg:max-w-lg bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-6 sm:p-10 border border-gray-100 animate-fade-in-up z-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">
            Login to Your Account
          </h2>

          {/* Tabs */}
          <div className="flex mb-6 border-b">
            <button
              type="button"
              onClick={() => setActiveTab("student")}
              className={`w-1/2 py-2 text-sm font-semibold ${activeTab === "student"
                ? "border-b-2 border-green-600 text-green-600"
                : "text-gray-500"
                }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("admin")}
              className={`w-1/2 py-2 text-sm font-semibold ${activeTab === "admin"
                ? "border-b-2 border-green-600 text-green-600"
                : "text-gray-500"
                }`}
            >
              Admin
            </button>
          </div>
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type={formData.showPassword ? "text" : "password"}
                name="password"
                placeholder="Your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="showPassword"
                checked={formData.showPassword}
                onChange={handleChange}
                className="mr-2 accent-green-600"
              />
              <label className="text-sm text-gray-700">Show Password</label>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
            >
              {activeTab === "student" ? "Login as Student" : "Login as Admin"}
            </button>

            {activeTab === "student" && (
              <p className="text-xs text-center mt-4">
                Don’t have an account?{" "}
                <Link to="/register" className="text-green-600 hover:underline">
                  Register now
                </Link>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;