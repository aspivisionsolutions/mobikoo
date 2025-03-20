const Partner = require('../models/Partner');

// Get all partners
exports.getAllPartners = async (req, res) => {
    try {
        const partners = await Partner.find();
        res.status(200).json(partners);
    } catch (error) {
        res.status(500).json({ message: "Error fetching partners", error });
    }
};

// Get a single partner by ID
exports.getPartnerById = async (req, res) => {
    try {
        const partner = await Partner.findById(req.params.id);
        if (!partner) return res.status(404).json({ message: "Partner not found" });

        res.status(200).json(partner);
    } catch (error) {
        res.status(500).json({ message: "Error fetching partner", error });
    }
};

// Add a new partner
exports.addPartner = async (req, res) => {
    try {
        const { name, address, contactNumber, email, website } = req.body;

        const newPartner = new Partner({ name, address, contactNumber, email, website });
        await newPartner.save();

        res.status(201).json({ message: "Partner added successfully", partner: newPartner });
    } catch (error) {
        res.status(500).json({ message: "Error adding partner", error });
    }
};

// Update an existing partner
exports.updatePartner = async (req, res) => {
    try {
        const updatedPartner = await Partner.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPartner) return res.status(404).json({ message: "Partner not found" });

        res.status(200).json({ message: "Partner updated successfully", partner: updatedPartner });
    } catch (error) {
        res.status(500).json({ message: "Error updating partner", error });
    }
};

// Delete a partner
exports.deletePartner = async (req, res) => {
    try {
        const deletedPartner = await Partner.findByIdAndDelete(req.params.id);
        if (!deletedPartner) return res.status(404).json({ message: "Partner not found" });

        res.status(200).json({ message: "Partner deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting partner", error });
    }
};
