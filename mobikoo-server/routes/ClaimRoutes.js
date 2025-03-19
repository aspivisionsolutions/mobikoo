const express = require('express');
const router = express.Router();
const claimsController = require('../controllers/claimController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../multer');

// Route to submit a new claim request
router.post('/submit',upload.array('photos', 10), claimsController.createClaim);

// Route to fetch all claim requests
router.get('/all', claimsController.getAllClaims);


router.get('/shop-owner',protect, claimsController.getClaimsByShopOwner);

router.patch("/approve/:claimId", claimsController.approveClaim);
router.patch("/reject/:claimId", claimsController.rejectClaim);


// Below Routes are not working yet

router.get('/customer', claimsController.getClaimsByCustomerPhoneNumber);
router.get('/device/:deviceId', claimsController.getClaimsByDevice);

module.exports = router;
