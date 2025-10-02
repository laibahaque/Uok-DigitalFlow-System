const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const attendanceRoutes = require("./routes/attendanceRoute");
const resultsRoutes = require("./routes/resultsRoutes");
const semesterPaymentsRoutes = require("./routes/semesterPaymentsRoute");
const requestRoutes = require("./routes/requestRoutes");
const coursesRoutes = require("./routes/coursesRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/results", resultsRoutes);
app.use("/api/semester_payments", semesterPaymentsRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/notifications", notificationRoutes);
app.get("/", (req, res) => res.send("✅ Backend is running..."));

module.exports = app;
