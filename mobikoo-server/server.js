const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const inspectionRoutes = require("./routes/inspectionRoutes");
const inspectionReportRoutes = require("./routes/inspectionReportRoutes");
const fineRoutes = require("./routes/fineRoutes");
const warrantyRoutes = require("./routes/warrantyRoutes");
const devicesRoutes = require("./routes/devicesRoutes");
const IssuedWarranty = require("./models/issuedWarranties");
const bulkWarrantyPurchaseRoutes = require("./routes/bulkWarrantyPurchaseRoutes");
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
app.use("/api/fine", fineRoutes);
app.use("/api/warranty", warrantyRoutes);
app.use("/api/devices", devicesRoutes);
app.use(bulkWarrantyPurchaseRoutes);

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

app.get('/customers-with-warranties', protect, roleMiddleware(['admin', 'shop_owner']), async (req, res) => {
  try {
      console.log("Authenticated User ID:", req.user.userId); // Debugging line

      // Fetch issued warranties where shopOwnerId matches the authenticated user's ID
      const issuedWarranties = await IssuedWarranty.find({ shopOwnerId: req.user.userId }).populate('customerId', 'name email phone').populate('planId', 'name price coverageDetails duration');

      res.json(issuedWarranties);
  } catch (error) {
      console.error("Error fetching warranty details:", error); // Log the error for debugging
      res.status(500).json({ message: "Error fetching warranty details", error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
