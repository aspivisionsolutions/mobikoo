const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const warrantyRoutes = require("./routes/warrantyRoutes");
const inspectionRoutes = require("./routes/inspectionRoutes")
const userRoutes = require("./routes/userRoutes")
require("dotenv").config();
const cors = require("cors");

// Initialize Express
const app = express();
app.use(express.json());
app.use(cors());

// Connect to Database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/warranty", warrantyRoutes);
app.use("/api/inspection", inspectionRoutes)
app.use("/api/user", userRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
