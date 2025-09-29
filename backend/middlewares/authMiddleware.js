const jwt = require("jsonwebtoken");

// ✅ Token verification
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        console.error("❌ Token expired:", err);
        return res.status(401).json({ message: "Token expired" });
      }
      console.error("❌ Invalid token:", err);
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    };
    next();
  });
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
