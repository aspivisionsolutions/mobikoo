const express = require('express');
const router = express.Router();
const { 
  issueFine, 
  getPhoneCheckerFines, 
  getShopOwnerFines,
  payFine 
} = require('../controllers/fineController');
const { protect, roleMiddleware } = require('../middlewares/authMiddleware');

router.post('/issue', protect,  roleMiddleware(["phone_checker"]), issueFine);
router.get('/phoneChecker/fines', protect,  roleMiddleware(["phone_checker"]), getPhoneCheckerFines);
router.get('/shopOwner/fines', protect,  roleMiddleware(["shop_owner"]), getShopOwnerFines);
router.patch('/pay/:fineId', protect,  roleMiddleware(["shop_owner"]), payFine);

module.exports = router;
