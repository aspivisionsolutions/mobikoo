const mongoose = require('mongoose');
const WarrantyPlan = require('../models/warranties');
const { warrantyPlans } = require('../data/warrantyTestData');
require('dotenv').config();

const seedWarrantyPlans = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Delete existing warranty plans
        await WarrantyPlan.deleteMany({});
        console.log('Deleted existing warranty plans');

        // Insert new warranty plans
        const createdPlans = await WarrantyPlan.insertMany(warrantyPlans);
        console.log('Inserted warranty plans:', createdPlans);

        console.log('\nTest the warranty routes with these IDs:');
        createdPlans.forEach(plan => {
            console.log(`${plan.planName}: ${plan._id}`);
        });

        console.log('\nExample cURL commands for testing:');
        
        console.log('\n1. Get all warranty plans:');
        console.log('curl http://localhost:5000/api/warranty/plans');

        console.log('\n2. Issue a warranty (replace with actual IDs):');
        console.log(`curl -X POST http://localhost:5000/api/warranty/issue \\
        -H "Content-Type: application/json" \\
        -H "Authorization: Bearer YOUR_TOKEN" \\
        -d '{
            "customerId": "CUSTOMER_ID",
            "deviceIMEI": "123456789012345",
            "planId": "${createdPlans[0]._id}"
        }'`);

        console.log('\n3. Get warranty details (replace with actual warranty ID):');
        console.log('curl http://localhost:5000/api/warranty/WARRANTY_ID -H "Authorization: Bearer YOUR_TOKEN"');

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

seedWarrantyPlans(); 