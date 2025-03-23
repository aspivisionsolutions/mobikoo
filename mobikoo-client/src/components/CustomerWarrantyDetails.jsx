import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // Import framer-motion
import { FiArrowLeft } from 'react-icons/fi';
import { FiCalendar, FiHash, FiDollarSign, FiUser } from 'react-icons/fi';


const CustomerWarrantyDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const warranty = location.state?.warranty;

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
        exit: { opacity: 0, y: 50, transition: { duration: 0.5, ease: "easeInOut" } },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeInOut", delay: 0.2 } },
    };

    if (!warranty) {
        return (
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col items-center justify-center min-h-screen bg-gray-100"
            >
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Warranty not found</h2>
                <p className="text-gray-600 mb-8">No warranty details found for this IMEI number.</p>
                <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => navigate('/')}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Go Back to Home
                </motion.button>
            </motion.div>
        );
    }

    // Calculate expiry date
    const issueDate = new Date(warranty.issueDate);
    const durationMonths = warranty.warrantyPlanId.warranty_months;
    const expiryDate = new Date(issueDate);
    expiryDate.setMonth(expiryDate.getMonth() + durationMonths);

    const DetailRow = ({ icon: Icon, label, value }) => (
        <motion.div
            variants={itemVariants}
            className="flex items-center py-2 border-b last:border-b-0"
        >
            <Icon className="h-6 w-6 text-gray-500 mr-2" />
            <span className="text-gray-700 font-medium">{label}:</span>
            <span className="ml-2 text-gray-900 font-semibold">{value || 'N/A'}</span>
        </motion.div>
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="min-h-screen flex items-center justify-center bg-gray-100"
        >
            <div className="bg-white shadow-md rounded-lg p-6 max-w-lg w-full">
                <motion.div variants={itemVariants} className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Warranty Details</h2>
                    <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => navigate('/')}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        <FiArrowLeft className="mr-2" /> Back to Home
                    </motion.button>
                </motion.div>

                <DetailRow icon={FiHash} label="IMEI Number" value={warranty.inspectionReport.imeiNumber} />
                <DetailRow icon={FiCalendar} label="Issue Date" value={issueDate.toLocaleDateString()} />
                <DetailRow icon={FiCalendar} label="Expiry Date" value={expiryDate.toLocaleDateString()} />
                <DetailRow icon={FiDollarSign} label="Plan Price" value={`₹${warranty.warrantyPlanId.price}`} />
                {/* <DetailRow icon={FiUser} label="Customer Name" value={warranty.customer.customerName} /> */}
            </div>
        </motion.div>
    );
};

export default CustomerWarrantyDetails;
