const Customer = require('../models/customer');
const ShopOwner = require('../models/shopOwner'); // Import ShopOwner model if needed
const WarrantyPlan = require('../models/warranties'); // Import WarrantyPlan model

// Function to fetch all customers
exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find()
            .populate('deviceDetails warrantyDetails') // Populate deviceDetails and warrantyDetails
            .populate({
                path: 'warrantyDetails',
                populate: {
                    path: 'warrantyPlanId', // Populate the warrantyPlanId within warrantyDetails
                    model: WarrantyPlan
                }
            });

        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Function to fetch customers for a specific shop owner
exports.getCustomersForShopOwner = async (req, res) => {
    const shopOwnerId = req.user.userId; // Get the shop owner ID from the request parameters

    try {
        // Find the shop owner to ensure they exist
        const shopOwner = await ShopOwner.findOne({ userId: shopOwnerId });
        if (!shopOwner) {
            return res.status(404).json({ message: "Shop owner not found" });
        }

        // Fetch customers associated with the shop owner
        const customers = await Customer.find({ shopOwner: shopOwner.userId })
            .populate('deviceDetails warrantyDetails')
            .populate({
                path: 'warrantyDetails',
                populate: {
                    path: 'warrantyPlanId', // Populate the warrantyPlanId within warrantyDetails
                    model: WarrantyPlan // Specify the model to populate
                }
            });
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}; 

exports.getDevicesByCustomer = async (req, res) => {
    try {
        const { search } = req.params;

        // Search by customer name or phone number
        const customers = await Customer.find({
            
                 customerPhoneNumber: search ,  // Case-insensitive name search
                 // Exact phone number match
            
        }).populate('deviceDetails warrantyDetails shopOwner');

        if (customers.length === 0) {
            return res.status(404).json({ message: "No customers found with the given details" });
        }

        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getDailyCustomerChange = async (req, res) => {
    try {
      
        const shopOwnerId = req.user.userId; // Get shop owner ID from request
     
  
        // Ensure the shop owner exists
        const shopOwner = await ShopOwner.findOne({ userId: shopOwnerId });
        if (!shopOwner) {
            return res.status(404).json({ message: "Shop owner not found" });
        }
    
        const allCustomers = await Customer.find({ shopOwner: shopOwner._id });
     
        // Get today's and yesterday's dates (UTC)
        const today = new Date();
        today.setHours(0, 0, 0, 0);


        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Count total customers for this shop owner
        const totalCustomers = await Customer.countDocuments({ shopOwner: shopOwner.userId  });
   
        // Count new customers for today and yesterday
        const todayCount = await Customer.countDocuments({
            shopOwner: shopOwner._id,
            purchaseDate: { $gte: today }
        });
      

        const yesterdayCount = await Customer.countDocuments({
            shopOwner: shopOwner._id,
            purchaseDate: { $gte: yesterday, $lt: today }
        });

        // Calculate the change
        const change = todayCount - yesterdayCount;
        const trend = change > 0 ? "increase" : change < 0 ? "decrease" : "no change";

        res.status(200).json({
            totalCustomers,
            todayCount,
            yesterdayCount,
            change,
            trend
        });

    } catch (error) {
        console.error("Error fetching daily customer change:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
