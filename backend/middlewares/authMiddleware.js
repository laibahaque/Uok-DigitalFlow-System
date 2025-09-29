const jwt = require("jsonwebtoken");

// ✅ Token verification
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role, // "student" | "faculty-admin" | "university-admin"
    };
    next();
  } catch (err) {
    console.error("❌ Invalid/Expired token:", err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// ✅ Role-based authorization
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Unauthorized role" });
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRoles };
