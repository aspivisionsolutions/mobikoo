const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const warrantyRoutes = require("./routes/warrantyRoutes");
const inspectionRoutes = require("./routes/inspectionRoutes")
const userRoutes = require("./routes/userRoutes")
const paymentRoutes = require("./routes/paymentRoutes")
const activityLogRoutes = require('./routes/ActivityRoute');
const adminRoutes = require("./routes/AdminRoute"); // Import admin routes
const claimRoutes = require("./routes/ClaimRoutes");
const statsRoutes = require("./routes/statsRoutes");
const partnerRoutes = require('./routes/partnerRoutes');
const {protect,roleMiddleware} = require('./middlewares/authMiddleware');
const {updateFineStatus} = require('./controllers/inspectionController');

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
app.use("/api/payment", paymentRoutes)
app.use("/api/claim", claimRoutes)

app.use("/api/admin", adminRoutes); // Mount admin routes
app.use("/api/stats", statsRoutes)

app.use('/api/partners', partnerRoutes);


app.use("/api/activity-log", activityLogRoutes);

app.post("/fine/:reportId",protect,roleMiddleware(["admin"]), updateFineStatus);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
