const express = require('express');
const router = express.Router();
const DirectWarrantyPlan = require('../models/directWarrantyPlans');

// Route to fetch all direct warranty plans
router.get('/', async (req, res) => {
  try {
    const plans = await DirectWarrantyPlan.find();
    res.status(200).json(plans);
  } catch (error) {
    console.error('Error fetching warranty plans:', error);
    res.status(500).json({ message: 'Failed to fetch warranty plans' });
  }
});

// Route to add a new direct warranty plan
router.post('/', async (req, res) => {
  try {
    const { range, extendedWarranty1Year, extendedWarranty2Year, screenProtection1Year } = req.body;

    const newPlan = new DirectWarrantyPlan({
      range,
      extendedWarranty1Year,
      extendedWarranty2Year,
      screenProtection1Year,
    });

    const savedPlan = await newPlan.save();
    res.status(201).json(savedPlan);
  } catch (error) {
    console.error('Error adding warranty plan:', error);
    res.status(500).json({ message: 'Failed to add warranty plan' });
  }
});

// Route to edit an existing direct warranty plan
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { range, extendedWarranty1Year, extendedWarranty2Year, screenProtection1Year } = req.body;

    const updatedPlan = await DirectWarrantyPlan.findByIdAndUpdate(
      id,
      { range, extendedWarranty1Year, extendedWarranty2Year, screenProtection1Year },
      { new: true }
    );

    if (!updatedPlan) {
      return res.status(404).json({ message: 'Warranty plan not found' });
    }

    res.status(200).json(updatedPlan);
  } catch (error) {
    console.error('Error updating warranty plan:', error);
    res.status(500).json({ message: 'Failed to update warranty plan' });
  }
});

// Route to delete a direct warranty plan
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPlan = await DirectWarrantyPlan.findByIdAndDelete(id);

    if (!deletedPlan) {
      return res.status(404).json({ message: 'Warranty plan not found' });
    }

    res.status(200).json({ message: 'Warranty plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting warranty plan:', error);
    res.status(500).json({ message: 'Failed to delete warranty plan' });
  }
});

module.exports = router;