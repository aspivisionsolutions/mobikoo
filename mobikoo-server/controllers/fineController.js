const Fine = require('../models/fine');

exports.issueFine = async (req, res) => {
  try {
    const { shopOwnerId, amount, reason } = req.body;
    
    const fine = new Fine({
      phoneCheckerId: req.user.userId, 
      shopOwnerId,
      amount,
      reason
    });

    await fine.save();

    res.status(201).json({
      success: true,
      data: fine
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.getPhoneCheckerFines = async (req, res) => {
  try {
    const fines = await Fine.find({ phoneCheckerId: req.user.userId })
      .populate('shopOwnerId', 'name email')
      .sort({ issuedAt: -1 });

    res.status(200).json({
      success: true,
      data: fines
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.getShopOwnerFines = async (req, res) => {
  try {
    const fines = await Fine.find({ shopOwnerId: req.user.userId })
      .populate('phoneCheckerId', 'name email')
      .sort({ issuedAt: -1 });

    res.status(200).json({
      success: true,
      data: fines
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.payFine = async (req, res) => {
  try {
    const { fineId } = req.params;

    const fine = await Fine.findById(fineId);

    if (!fine) {
      return res.status(404).json({
        success: false,
        error: 'Fine not found'
      });
    }

    if (fine.shopOwnerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to pay this fine'
      });
    }

    if (fine.status === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Fine has already been paid'
      });
    }

    fine.status = 'paid';
    await fine.save();

    res.status(200).json({
      success: true,
      data: fine
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}; 