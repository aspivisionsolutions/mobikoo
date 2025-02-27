const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const inspectionRoutes = require("./routes/inspectionRoutes");
const inspectionReportRoutes = require("./routes/inspectionReportRoutes");
require("dotenv").config();
const cors = require("cors");
const Inspection = require("./models/inspection");
const { protect, roleMiddleware } = require("./middlewares/authMiddleware");

// Initialize Express
const app = express();
app.use(express.json());
app.use(cors());

// Connect to Database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/inspection", inspectionRoutes);
app.use("/api/inspection-report", inspectionReportRoutes);

// get all inspections for a phone checker
app.get("/getInspections", protect , roleMiddleware(["phone_checker"]) , async (req, res)=>{
    try {
        console.log("2. User object:", req.user);
      // Debug logs

      // Try the actual query
      const inspections = await Inspection.find({ phoneCheckerId: req.user.userId })
        .populate("shopOwnerId", "firstName lastName email")
        .sort({ requestedAt: -1 });
      
      res.json(inspections);
    } catch (error) {
      res.status(500).json({ 
        message:"Server chya aaichi gand", 
        error: {
          name: error.name,
          // message: error.message,
          user: req.user
        }
      });
    }
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
