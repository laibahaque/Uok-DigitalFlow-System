import React, { useContext, useEffect, useState } from "react";
import { Bell, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";

const Header = ({ onNotificationClick }) => {
  const { user, logout } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  // ✅ Fetch Notifications
  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/notifications", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json();
        if (res.ok) setNotifications(data.notifications);
      } catch (error) {
        console.error("❌ Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, [user]);

  // ✅ Fetch User Info
  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      try {
        let url =
          user.role === "student"
            ? "http://localhost:5000/api/users/student/me"
            : "http://localhost:5000/api/users/admin/me";

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json();
        setUserData({
          name: data.full_name || data.name || data.role_name || "User",
        });
      } catch (err) {
        setUserData({ name: "User" });
      }
    };
    fetchUserData();
  }, [user]);

  // ✅ Mark as Read + Auto-close + Redirect
  const handleReadNotification = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${user.token}` },
      });

      // ✅ Close dropdown immediately
      setOpenNotifications(false);

      // ✅ Trigger callback if provided (tab switch in dashboard)
      if (typeof onNotificationClick === "function") {
        onNotificationClick();
        return;
      }

      // ✅ Otherwise fallback navigation
      if (user.role === "university-admin") {
        navigate("/university-dashboard");
      } else if (user.role === "faculty-admin") {
        navigate("/faculty-dashboard");
      } else if (user.role === "student") {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    } catch (err) {
      console.error("❌ Error marking notification as read:", err);
    }
  };

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
            {notifications.filter((n) => n.is_read === 0).length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {notifications.filter((n) => n.is_read === 0).length}
              </span>
            )}
          </button>

          {openNotifications && (
            <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg z-20 max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleReadNotification(n.id)}
                    className={`px-4 py-3 border-b text-sm cursor-pointer ${
                      n.is_read === 0
                        ? "bg-gray-100 font-semibold"
                        : "text-gray-700"
                    }`}
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
