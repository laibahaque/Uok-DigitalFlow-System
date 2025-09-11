import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const savedUser = sessionStorage.getItem("user");
  const [user, setUser] = useState(savedUser ? JSON.parse(savedUser) : null);

  let idleTimer; // idle timeout reference

  const startIdleTimer = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      logout();
      alert("You have been logged out due to inactivity (15 mins).");
    }, 15 * 60 * 1000); // 15 min
  };

  const resetIdleTimer = () => {
    if (user) startIdleTimer();
  };

  useEffect(() => {
    if (user) {
      // attach listeners only when logged in
      window.addEventListener("mousemove", resetIdleTimer);
      window.addEventListener("keydown", resetIdleTimer);
      window.addEventListener("click", resetIdleTimer);

      startIdleTimer(); // start timer on login
    }

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("keydown", resetIdleTimer);
      window.removeEventListener("click", resetIdleTimer);
    };
  }, [user]);

  const login = (userData, role) => {
    let finalRole = role;

    if (role === "admin") {
      if (userData.title === "University") {
        finalRole = "uni_admin";
      } else if (userData.title === "Faculty") {
        finalRole = "dept_admin";
      }
    }

    const userObj = { ...userData, role: finalRole };
    setUser(userObj);

    // Save user + token
    sessionStorage.setItem("user", JSON.stringify(userObj));
    if (userData.token) {
      sessionStorage.setItem("token", userData.token);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    clearTimeout(idleTimer);
  };

  const isStudent = user?.role === "student";
  const isUniAdmin = user?.role === "uni_admin";
  const isDeptAdmin = user?.role === "dept_admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isStudent,
        isUniAdmin,
        isDeptAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
