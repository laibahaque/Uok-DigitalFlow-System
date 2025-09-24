import React, { useContext, useEffect, useState } from "react";
import { Bell, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";

const Header = ({ notificationCount = 0 }) => {
  const { user, logout } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/requests/notifications", {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch notifications");
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
  }, []);



  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        if (user.role === "student") {
          const res = await fetch(
            `http://localhost:5000/api/users/student/${user.id}`,
            {
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
              },
            }
          );

          const data = await res.json();

          if (res.ok && data.full_name) {
            setUserData({ name: data.full_name });
          } else {
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
    <div className="flex justify-between items-center shadow-md px-6 py-6 bg-green-600 mb-6 relative">
      <h2 className="text-xl font-semibold text-gray-100">
        {userData ? `Welcome, ${userData.name}` : "Welcome, User"}
      </h2>

      <div className="flex items-center gap-6 relative">
        {/* 🔔 Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setOpenNotifications(!openNotifications);
              setOpenProfile(false);
            }}
            className="relative"
          >
            <Bell className="w-6 h-6 text-white" />
            {notificationCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {notificationCount}
              </span>
            )}
          </button>

          {openNotifications && (
            <div className="absolute right-0 mt-3 w-72 bg-white shadow-lg rounded-lg max-h-60 overflow-y-auto z-20">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="px-4 py-3 border-b border-gray-100 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {n.message}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500 text-sm">
                  No new notifications
                </div>
              )}
            </div>
          )}
        </div>

        {/* 👤 Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setOpenProfile(!openProfile);
              setOpenNotifications(false);
            }}
          >
            <User className="w-7 h-7 text-white cursor-pointer" />
          </button>

          {openProfile && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg z-20">
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
