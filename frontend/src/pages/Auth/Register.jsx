
import React, { useState, useContext, useEffect } from "react";

import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Lightbulb,
  Pencil,
  Microscope,
  BookOpen,
  FlaskConical,
  Globe,
  Laptop,
  Smartphone,
  FileText,
  MapPin,
} from "lucide-react";

import logo from "../../assets/logo.png";
const Register = () => {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "UOK-DFS - Register";
  }, []);
  const departments = [
    "Computer Science",
    "Applied Physics",
    "Zoology",
  ];

  const [formData, setFormData] = useState({
    seatNumber: "",
    email: "",
    department: "",
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
const handleSubmit = async (e) => {
  e.preventDefault();

  console.log("Sending data to backend:", {
    seatNumber: formData.seatNumber,
    email: formData.email,
    department: formData.department,
    password: formData.password,
  });

  try {
    // Sending POST request to backend
    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",  // Ensuring that data is in JSON format
      },
      body: JSON.stringify({
        seatNumber: formData.seatNumber,
        email: formData.email,
        department: formData.department,
        password: formData.password,
      }),
    });

    const data = await response.json();  // Parse the response JSON

    // If registration was successful
    if (response.ok) {
      alert("✅ Registered Successfully!");
      navigate("/login");  // Redirect to login page
    } else {
      // Display error message from backend
      alert("❌ " + data.message || "Registration failed");
    }
  } catch (error) {
    // Handle network or other unexpected errors
    console.error("❌ Registration Error:", error);
    alert("❌ Failed to register. Please try again.");
  }
};


  return (
    <div className="relative flex flex-col md:flex-row h-screen w-screen overflow-hidden font-sans">
      {/* Left Section with Animated Icons */}
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
          <h1
            className="text-xl lg:text-2xl font-semibold mb-3 animate-fade-in tracking-[0.17em] uppercase"
          >
            Break the Manual Limits
          </h1>

          <p
            className="text-base lg:text-lg leading-relaxed text-green-100 animate-fade-in delay-500 underline decoration-2 underline-offset-7"
          >
            Register Now and Enter the Digital Revolution
          </p>

        </div>
      </div>

      {/* Right Section (Form) */}
      <div className="relative w-full md:w-1/2 flex justify-center items-center px-4 sm:px-6 bg-white overflow-hidden">
        <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-6 sm:p-8 border border-gray-100 animate-fade-in-up z-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">
            Create Your Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Seat Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seat Number
              </label>
              <input
                type="text"
                name="seatNumber"
                placeholder="Enter Your Seat Number"
                value={formData.seatNumber}
                onChange={handleChange}
                required
                pattern="^[A-Z]{1}[0-9]{2}[0-9]{9}$"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition hover:shadow-md text-sm sm:text-base"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter Your Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition hover:shadow-md text-sm sm:text-base"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition hover:shadow-md text-sm sm:text-base"
              >
                <option value="">Select Department</option>
                {departments.map((dept, i) => (
                  <option key={i} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type={formData.showPassword ? "text" : "password"}
                name="password"
                placeholder="Password (5–9 characters)"
                value={formData.password}
                onChange={handleChange}
                minLength={5}
                maxLength={9}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition hover:shadow-md text-sm sm:text-base"
              />
            </div>

            {/* Show Password */}
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

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 sm:py-2.5 rounded-lg transition transform hover:scale-105 shadow-md text-sm sm:text-base"
            >
              Register
            </button>

            {/* Redirect */}
            <p className="text-xs sm:text-sm text-center mt-4">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-green-600 hover:underline font-medium"
              >
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
