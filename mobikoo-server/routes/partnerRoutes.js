const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/PartnerController');

router.get('/', partnerController.getAllPartners);  // Get all partners
router.get('/:id', partnerController.getPartnerById);  // Get single partner by ID
router.post('/', partnerController.addPartner);  // Add new partner
router.put('/:id', partnerController.updatePartner);  // Update partner
router.delete('/:id', partnerController.deletePartner);  // Delete partner

module.exports = router;
