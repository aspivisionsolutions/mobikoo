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

        report.warrantyStatus = 'activated';
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
                planName: report.warrantyDetails.warrantyPlanId.planName,
                price: report.warrantyDetails.warrantyPlanId.price
            }
        });

        res.status(200).json({ message: 'Warranty activated successfully', customerData });
    } catch (error) {
        console.error('Error activating warranty:', error);
        res.status(500).json({ error: error.message });
    }
};

// Function to get all issued warranties
exports.getAllIssuedWarranties = async (req, res) => {
    try {
        const issuedWarranties = await IssuedWarranties.find()
            .populate({
            path: 'inspectionReport',
            populate: [
                { path: 'inspectorId' }, // Populate inspectorId within inspectionReport
                { path: 'warrantyDetails' } // Populate warrantyDetails within inspectionReport
            ]
            })
            .populate('warrantyPlanId');
        res.status(200).json({
            success: true,
            data: issuedWarranties
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching issued warranties',
            error: error.message
        });
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
                planName: warrantyPlan ? warrantyPlan.name : 'Unknown Plan',
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
    const { warrantyId } = req.params;
    console.log(warrantyId)
    // Fetch warranty details from the database using warrantyId
    const warranty = await IssuedWarranties.findById(warrantyId).populate(
        {
            path: 'inspectionReport',
            populate: 'inspectorId'
        }
    ).populate('warrantyPlanId') // Implement this function to get warranty details

    if (!warranty) {
        return res.status(404).send('Warranty not found');
    }

    // Create a PDF document
    const doc = new pdf();
    let filename = `warranty_${warrantyId}.pdf`;
    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', 'application/pdf');

    // Add content to the PDF
    doc.text(`Warranty ID: ${warrantyId}`);
    doc.text(`Shop Name: ${warranty.inspectionReport.shopName}`);
    doc.text(`Inspector: ${warranty.inspectionReport.inspectorId.firstName} ${warranty.inspectionReport.inspectorId.lastName}`);
    doc.text(`Inspection Date: ${new Date(warranty.inspectionReport.inspectionDate).toLocaleDateString()}`);
    doc.text(`IMEI Number: ${warranty.inspectionReport.imeiNumber}`);
    doc.text(`Device Model: ${warranty.inspectionReport.deviceModel}`);
    doc.text(`Serial Number: ${warranty.inspectionReport.serialNumber}`);
    doc.text(`Operating System: ${warranty.inspectionReport.operatingSystem}`);
    doc.text(`Screen Condition: ${warranty.inspectionReport.screenCondition}`);
    doc.text(`Body Condition: ${warranty.inspectionReport.bodyCondition}`);
    doc.text(`Battery Health: ${warranty.inspectionReport.batteryHealth}`);
    doc.text(`Charging Port Functionality: ${warranty.inspectionReport.chargingPortFunctionality}`);
    doc.text(`Camera Functionality: ${warranty.inspectionReport.cameraFunctionality}`);
    doc.text(`Buttons/Sensors: ${warranty.inspectionReport.buttonsSensors}`);
    doc.text(`OS Functionality: ${warranty.inspectionReport.osFunctionality}`);
    doc.text(`Performance Benchmark: ${warranty.inspectionReport.performanceBenchmark}`);
    doc.text(`Comments: ${warranty.inspectionReport.comments}`);
    doc.text(`Digital Signature: ${warranty.inspectionReport.digitalSignature ? 'Yes' : 'No'}`);
    doc.text(`Grade: ${warranty.inspectionReport.grade}`);
    doc.text(`Warranty Plan: ${warranty.warrantyPlanId.planName}`);
    doc.text(`Duration (Months): ${warranty.warrantyPlanId.durationMonths}`);
    doc.text(`Coverage Details: ${warranty.warrantyPlanId.coverageDetails}`);
    doc.text(`Price: ${warranty.warrantyPlanId.price}`);
    // Add more warranty details as needed

    // Finalize the PDF and send it
    doc.pipe(res);
    doc.end();
};
