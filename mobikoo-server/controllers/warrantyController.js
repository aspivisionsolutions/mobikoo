const WarrantyPlan = require('../models/warranties');
const InspectionReport = require('../models/inspectionReport');
const Customer = require('../models/customer');
const IssuedWarranties = require('../models/issuedWarranties');
const { populate } = require('../models/inspectionRequest');
const pdf = require('pdfkit'); // Assuming you are using pdfkit for PDF generation
const fs = require('fs');

// Get all warranty plans
exports.getAllWarrantyPlans = async (req, res) => {
    try {
        const plans = await WarrantyPlan.find();
        res.status(200).json({
            success: true,
            data: plans
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching warranty plans',
            error: error.message
        });
    }
};

// Function to activate warranty
const ActivityLog = require('../models/activityLog');
const ShopOwner = require('../models/shopOwner');

exports.activateWarranty = async (req, res) => {
    const { 
        customerName, 
        customerPhoneNumber, 
        customerAdhaarNumber, 
        customerEmailId,
        inspectionReportId,
        deviceModel,
        imeiNumber,
        grade,
        phoneCheckerId  
    } = req.body;

    try {
        const report = await InspectionReport.findById(inspectionReportId).populate('inspectorId').populate({
            path: 'warrantyDetails',
            populate: { path: 'warrantyPlanId' }
        });;
        if (!report) return res.status(404).json({ error: 'Inspection report not found' });
        report.warrantyStatus = 'processing';
        await report.save();

        const customerData = new Customer(
            {
                customerName,
                customerPhoneNumber,
                customerAdhaarNumber,
                deviceDetails: inspectionReportId,
                warrantyDetails: report.warrantyDetails,
                deviceModel,
                imeiNumber,
                grade,
                shopOwner: req.user.userId,
                purchaseDate: new Date()
            }
        );
        if (customerEmailId) {
            customerData.customerEmailId = customerEmailId;
        }
        await customerData.save();

        await ActivityLog.create({
            actionType: 'Warranty Activated',
            shopOwner: req.user.userId,
            phoneChecker: report.inspectorId._id,
            customer: customerData._id,
            phoneDetails: { model: deviceModel, imeiNumber },
            warrantyDetails: {
                duration: report.warrantyDetails.warrantyPlanId.warranty_months,
                price: report.warrantyDetails.warrantyPlanId.price
            }
        });

        res.status(200).json({ message: 'Warranty activated successfully', customerData });
    } catch (error) {
        console.error('Error activating warranty:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllIssuedWarrantiesForShopOwner = async (req, res) => {
    try {

        const shopOwner = await ShopOwner.findOne({ userId: req.user.userId });
        if (!shopOwner) {
            return res.status(404).json({ error: 'Shop Owner not found' });
        }
        console.log(shopOwner)
        const issuedWarranties = await IssuedWarranties.find()
            .populate({
                path: 'inspectionReport',
                populate: { path: 'inspectorId' } // Only populate necessary fields
            })
            .populate('warrantyPlanId');
            console.log(issuedWarranties)
            const filteredWarranties = issuedWarranties.filter(warranty => 
                warranty.inspectionReport && warranty.inspectionReport.shopName === shopOwner.shopDetails.shopName
            );
            console.log(filteredWarranties)
            // Fetch customer details based on IMEI
            const populatedWarranties = await Promise.all(filteredWarranties.map(async (warranty) => {
                const imei = warranty.inspectionReport.imeiNumber; 
                const customer = await Customer.findOne({ imeiNumber: imei }); 
                return { ...warranty.toObject(), customer }; 
            }));

        res.status(200).json({ success: true, data: populatedWarranties });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching issued warranties', error: error.message });
    }
}
        

// Function to get all issued warranties
exports.getAllIssuedWarranties = async (req, res) => {
    try {
        const issuedWarranties = await IssuedWarranties.find()
            .populate({
                path: 'inspectionReport',
                populate: { path: 'inspectorId' } // Only populate necessary fields
            })
            .populate('warrantyPlanId');

        const populatedWarranties = await Promise.all(issuedWarranties.map(async (warranty) => {
            const imei = warranty.inspectionReport.imeiNumber; // Get IMEI from inspectionReport
            const customer = await Customer.findOne({ imeiNumber: imei }); // Find customer by IMEI

            return { ...warranty.toObject(), customer }; // Add customer to the warranty object
        }));

        res.status(200).json({ success: true, data: populatedWarranties });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching issued warranties', error: error.message });
    }
};
exports.confirmWarranty = async (req, res) => {
    const { warrantyId } = req.params; // Get warranty ID from the request parameters
    console.log(warrantyId)
    try {
        // Find the warranty document
        const warranty = await IssuedWarranties.findById(warrantyId)
            .populate('inspectionReport')
            .populate('warrantyPlanId');
        console.log(warranty)
        if (!warranty) {
            return res.status(401).json({ error: 'Warranty not found' });
        }
        // Check if the warranty is in a 'processing' state
        if (warranty.inspectionReport.warrantyStatus.toLowerCase() !== 'processing') {
            return res.status(400).json({ error: 'Warranty is not in a processable state' });
        }

        // Update the warranty status to 'activated'
        warranty.inspectionReport.warrantyStatus = 'activated';
        await warranty.inspectionReport.save(); // Save the updated inspection report
        await warranty.save(); // Save the updated issued warranty

        // Optionally, you can add logging or other actions here

        res.status(200).json({ message: 'Warranty confirmed successfully' });
    } catch (error) {
        console.error('Error confirming warranty:', error);
        res.status(500).json({ error: 'Failed to confirm warranty' });
    }
};
exports.claimWarranty = async (req, res) => {
    const { imeiNumber, customerAdhaarNumber } = req.body;

    try {
        const customer = await Customer.findOne({
            imeiNumber,
            customerAdhaarNumber
        }).populate('warrantyDetails');

        if (!customer) {
            return res.status(404).json({ error: 'Warranty details not found or invalid details provided.' });
        }

        const issuedWarranty = await IssuedWarranties.findById(customer.warrantyDetails);
        if (!issuedWarranty) {
            return res.status(404).json({ error: 'Issued warranty record not found.' });
        }

        // Get warranty plan for details
        const warrantyPlan = await WarrantyPlan.findById(issuedWarranty.warrantyPlanId);

        // Log the warranty claim
        await ActivityLog.create({
            actionType: 'New Claim',
            shopOwner: customer.shopOwner, // Shop that sold the warranty
            customer: customer._id,
            phoneDetails: {
                model: customer.deviceModel,
                imeiNumber: customer.imeiNumber
            },
            warrantyDetails: {
                duration: warrantyPlan ? warrantyPlan.warranty_months : 'Unknown Plan',
                price: warrantyPlan ? warrantyPlan.price : 0,
                claimStatus: 'Pending'  // Initial status for claims
            }
        });

        res.status(200).json({
            success: true,
            message: 'Warranty claim successful. Your claim is under review.',
            warrantyDetails: issuedWarranty
        });
    } catch (error) {
        console.error('Error claiming warranty:', error);
        res.status(500).json({ error: 'Server error while claiming warranty.' });
    }
};

exports.downloadWarrantyPDF = async (req, res) => {
    try {
        const { warrantyId } = req.params;
        console.log(`Generating PDF for Warranty ID: ${warrantyId}`);

        // Fetch warranty details from the database
        const warranty = await IssuedWarranties.findById(warrantyId).populate({
            path: 'inspectionReport',
            populate: { path: 'inspectorId' }
        }).populate('warrantyPlanId');

        if (!warranty) {
            return res.status(404).send('Warranty not found');
        }

        const filename = `warranty_${warrantyId}.pdf`;
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Type', 'application/pdf');

        const doc = new pdf();
        doc.pipe(res);

        // Document Title
        doc.fontSize(18).text('Warranty Report', { align: 'center' }).moveDown(2);
        
        // Warranty Details
        doc.fontSize(14).text(`Warranty ID: ${warrantyId}`, { bold: true });
        doc.text(`Shop Name: ${warranty.inspectionReport.shopName}`);
        doc.text(`Inspector: ${warranty.inspectionReport.inspectorId.firstName} ${warranty.inspectionReport.inspectorId.lastName}`);
        doc.text(`Inspection Date: ${new Date(warranty.inspectionReport.inspectionDate).toLocaleDateString()}`).moveDown(1);
        
        // Device Details
        doc.fontSize(14).text('Device Details:', { underline: true }).moveDown(0.5);
        doc.fontSize(12).text(`IMEI Number: ${warranty.inspectionReport.imeiNumber}`);
        doc.text(`Device Model: ${warranty.inspectionReport.deviceModel}`);
        doc.text(`Serial Number: ${warranty.inspectionReport.serialNumber}`);
        doc.text(`Operating System: ${warranty.inspectionReport.operatingSystem}`).moveDown(1);
        
        // Inspection Report
        doc.fontSize(14).text('Inspection Report:', { underline: true }).moveDown(0.5);
        doc.fontSize(12).text(`Screen Condition: ${warranty.inspectionReport.screenCondition}`);
        doc.text(`Body Condition: ${warranty.inspectionReport.bodyCondition}`);
        doc.text(`Battery Health: ${warranty.inspectionReport.batteryHealth}`);
        doc.text(`Charging Port: ${warranty.inspectionReport.chargingPortFunctionality}`);
        doc.text(`Camera: ${warranty.inspectionReport.cameraFunctionality}`);
        doc.text(`Buttons/Sensors: ${warranty.inspectionReport.buttonsSensors}`);
        doc.text(`OS Functionality: ${warranty.inspectionReport.osFunctionality}`);
        doc.text(`Performance Benchmark: ${warranty.inspectionReport.performanceBenchmark}`).moveDown(1);
        
        // Comments and Grade
        doc.fontSize(14).text('Additional Information:', { underline: true }).moveDown(0.5);
        doc.fontSize(12).text(`Comments: ${warranty.inspectionReport.comments}`);
        doc.text(`Digital Signature: ${warranty.inspectionReport.digitalSignature ? 'Yes' : 'No'}`);
        doc.text(`Grade: ${warranty.inspectionReport.grade}`).moveDown(1);
        
        // Warranty Plan
        doc.fontSize(14).text('Warranty Plan:', { underline: true }).moveDown(0.5);
        doc.fontSize(12).text(`Duration (Months): ${warranty.warrantyPlanId?.warranty_months || 'N/A'}`);
        doc.text(`Price: ${warranty.warrantyPlanId?.price || 'N/A'}`).moveDown(2);
        
        // Footer
        doc.fontSize(10).text('Generated by Warranty System', { align: 'center' });

        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Internal Server Error');
    }
};
exports.findByImei = async (req, res) => {
    const imei = req.params.imei;

    try {
        // Find the customer using the IMEI number
        const customer = await Customer.findOne({ imeiNumber: imei })
            .populate({
                path: 'warrantyDetails', // Assuming you have a warrantyDetails field in your Customer model
                populate: ['inspectionReport', 'warrantyPlanId']
            });

        if (!customer) {
            return res.status(404).json({ success: false, message: 'No customer found for this IMEI.' });
        }

        // Check if a warranty exists for this customer
        if (!customer.warrantyDetails) {
            return res.status(404).json({ success: false, message: 'No warranty found for this customer.' });
        }

        // The warranty details are now in customer.warrantyDetails
        res.status(200).json({ success: true, data: customer.warrantyDetails });
    } catch (error) {
        console.error('Error finding warranty by IMEI:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

