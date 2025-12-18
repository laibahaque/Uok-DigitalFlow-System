const app = require("./app");

// 1) IMPORT THE FUNCTION
const { autoCompleteOldRequests } = require("./models/Requests");

// 2) START THE AUTO CHECKER (runs every 10 seconds)
setInterval(async () => {
  try {
    await autoCompleteOldRequests();
  } catch (err) {
    console.error("Auto complete error:", err.message);
  }
}, 10000); // 10 seconds interval

// 3) START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
