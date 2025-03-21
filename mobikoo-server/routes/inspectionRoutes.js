const express = require("express");
const { protect, roleMiddleware } = require("../middlewares/authMiddleware");
const { createInspectionRequest, getInspectionRequestsForPhoneChecker, getInspectionRequestsByShopOwner, submitInspectionReport, updateInspectionStatus, getInspectionReportsForPhoneChecker, downloadInspectionReport, getInspectionReportsForShopOwner, addFine, updateFineStatus } = require("../controllers/inspectionController");
const { getAllInspectionReports } = require('../controllers/inspectionController');
const InspectionReport = require("../models/inspectionReport");
const upload = require('../multer');
const Fine = require("../models/fine");


const router = express.Router();

// Create a new inspection request
router.post(
  "/create",
  protect,
  roleMiddleware(["shop-owner"]),
  createInspectionRequest // Use the controller function here
);

// Route to get all inspection requests for a phone checker
router.get(
  "/phoneChecker",
  protect,
  roleMiddleware(["phone-checker"]),
  getInspectionRequestsForPhoneChecker
);

// Route to get all inspection requests submitted by a shop owner
router.get(
  "/shopOwner",
  protect,
  roleMiddleware(["shop-owner"]),
  getInspectionRequestsByShopOwner
);
router.get(
  "/admin/reports",
  protect,
  roleMiddleware(["admin"]),
  getAllInspectionReports // Controller function for admin reports
);


// Route to submit an inspection report by a phone checker
router.post(
  "/submitReport",
  protect,
  roleMiddleware(["phone-checker"]),
  upload.array('photos', 10),
  submitInspectionReport // Use the controller function here
);

// New route to update the status of an inspection request
router.patch(
  "/:id",
  protect,
  roleMiddleware(["phone-checker"]),
  updateInspectionStatus // Use the new controller function here
);

router.get("/phoneChecker/reports", protect, roleMiddleware(["phone-checker"]), getInspectionReportsForPhoneChecker);

router.get("/shopOwner/reports", protect, roleMiddleware(["shop-owner"]), getInspectionReportsForShopOwner);

router.get('/admin/reports', protect, roleMiddleware(["admin"]),getAllInspectionReports);
router.get("/reports/:id/download", protect, roleMiddleware(["phone-checker", "shop-owner","admin"]), downloadInspectionReport);
router.get("/report/:id", protect, async ()=>{
  try{
    const { id }= req.params();
    const report = await InspectionReport.findById(id)
    res.json(report)
  }catch(error){
    res.status(500).send({message: "Error in fetching report..!"})
  }
})

router.post("/fine",protect,roleMiddleware(["admin"]),addFine)
router.patch("/fine/:reportId",protect,roleMiddleware(["admin"],updateFineStatus))

router.get("/admin/fines", protect, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const fines = await Fine.find({})
    .populate({ path: 'inspectorId', model: 'User', select: 'firstName' }) // Get Phone Checker Name
      .populate({ path: 'inspectionId', select: 'deviceModel' }); // Get Phone Model
      console.log("Fetched fines from DB:", fines); 
    const formattedFines = fines.map(fine => ({
      
      phoneChecker: fine.inspectorId ? fine.inspectorId.firstName : "Unknown",
      model: fine.inspectionId ? fine.inspectionId.deviceModel : "Unknown",
      amount: fine.fineAmount,
      isPaid: fine.status === "Paid",
      status: fine.status,
     comment: fine.comment || "No comment"
    }));
    console.log("Formatted Fines:", formattedFines); 
    res.status(200).json({ fines: formattedFines });
  } catch (error) {
    console.error("Error fetching fine details:", error);
    res.status(500).json({ message: "Error fetching fine details", error });
  }
});

module.exports = router;
