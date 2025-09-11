// frontend/components/Header.jsx
import React, { useContext, useEffect, useState } from "react";
import { Bell, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";

const Header = ({ notificationCount = 0 }) => {
  const { user, logout } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    console.log("🟢 AuthContext user:", user); // Debug

    const fetchUserData = async () => {
      try {
        if (user.role === "student") {
          // 🎓 API call to get student details
          const res = await fetch(
            `http://localhost:5000/api/users/student/${user.id}`,
            {
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
              },
            }
          );

          const data = await res.json();

          if (res.ok && data.name) {
            setUserData({ name: data.name });
          } else {
            console.error("⚠️ Error fetching student info:", data.message);
            setUserData({ name: "Student" });
          }
        } else if (user.role === "uni_admin") {
          setUserData({ name: "UoK Admin" });
        } else if (user.role === "dept_admin") {
          setUserData({ name: "Faculty Admin" });
        } else {
          setUserData({ name: "Admin" });
        }
      } catch (err) {
        console.error("❌ Error fetching user info:", err);
        setUserData({ name: "User" });
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex justify-between items-center shadow-md px-6 py-4 bg-green-600 mb-6">
      <h2 className="text-xl font-semibold text-gray-100">
        {userData ? `Welcome, ${userData.name}` : "Welcome, User"}
      </h2>

      <div className="flex items-center gap-6 relative">
        {/* 🔔 Notifications */}
        <button className="relative">
          <Bell className="w-6 h-6 text-white" />
          {notificationCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {notificationCount}
            </span>
          )}
        </button>

        {/* 👤 Profile */}
        <div>
          <button onClick={() => setOpen(!open)}>
            <User className="w-7 h-7 text-white cursor-pointer " />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
