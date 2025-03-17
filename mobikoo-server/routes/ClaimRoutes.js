const express = require('express');
const router = express.Router();
const claimsController = require('../controllers/claimController');
const { protect } = require('../middlewares/authMiddleware');

// Route to submit a new claim request
router.post('/submit', claimsController.createClaim);

// Route to fetch all claim requests
router.get('/all', claimsController.getAllClaims);


router.get('/shop-owner',protect, claimsController.getClaimsByShopOwner);




// Below Routes are not working yet

router.get('/customer', claimsController.getClaimsByCustomerPhoneNumber);
router.get('/device/:deviceId', claimsController.getClaimsByDevice);

module.exports = router;
