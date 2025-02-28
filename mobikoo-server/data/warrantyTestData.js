const warrantyPlans = [
    {
        planName: "Basic Protection Plan",
        durationMonths: 12,
        coverageDetails: "Covers manufacturing defects and basic repairs",
        price: 999
    },
    {
        planName: "Premium Protection Plan",
        durationMonths: 24,
        coverageDetails: "Covers manufacturing defects, repairs, and accidental damage",
        price: 1999
    },
    {
        planName: "Ultimate Protection Plan",
        durationMonths: 36,
        coverageDetails: "Complete coverage including water damage and screen replacement",
        price: 2999
    }
];

// Sample data for testing POST /api/warranty/issue
const sampleWarrantyIssue = {
    customerId: "65f1a2b3c4d5e6f7g8h9i0j1", // Replace with actual customer ID from your database
    deviceIMEI: "123456789012345",
    planId: "65f1a2b3c4d5e6f7g8h9i0j2" // Replace with actual plan ID after creating warranty plans
};

// Sample response structure for GET /api/warranty/:warrantyId
const sampleWarrantyResponse = {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
    "shopOwnerId": {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j4",
        "shopName": "Mobile Care Center",
        "email": "mobilecare@example.com"
    },
    "customerId": {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
    },
    "deviceIMEI": "123456789012345",
    "planId": {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
        "planName": "Premium Protection Plan",
        "durationMonths": 24,
        "coverageDetails": "Covers manufacturing defects, repairs, and accidental damage",
        "price": 1999
    },
    "startDate": "2024-03-15T10:00:00.000Z",
    "expiryDate": "2026-03-15T10:00:00.000Z"
};

module.exports = {
    warrantyPlans,
    sampleWarrantyIssue,
    sampleWarrantyResponse
}; 