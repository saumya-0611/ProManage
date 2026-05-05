const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MONGODB CONNECTION
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/myAppDB";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ Error:", err));

// Routes
app.use("/api", require("./routes"));

// Server
app.listen(8000, () => console.log("🚀 Server running on 8000"));