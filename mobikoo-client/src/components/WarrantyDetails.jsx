import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiUser, FiArrowLeft, FiSmartphone, FiHash, FiCalendar,
    FiCheckCircle, FiShield, FiDollarSign, FiFileText, FiAlertCircle, FiMail, FiUsers
} from 'react-icons/fi';

const WarrantyDetails = ({ warranty, onClose }) => {
    const navigate = useNavigate();

    if (!warranty) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-900">Warranty not found</h2>
                <p className="mt-2 text-gray-600">The warranty details you're looking for don't exist.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                    <FiArrowLeft className="mr-2 -ml-1 h-5 w-5" />
                    Go Back
                </button>
            </div>
        );
    }

    // Calculate expiry date
    const issueDate = new Date(warranty.issueDate);
    const durationMonths = warranty.warrantyPlanId.warranty_months;
    const expiryDate = new Date(issueDate.setMonth(issueDate.getMonth() + durationMonths));

    const DetailRow = ({ icon: Icon, label, value }) => (
        <div className="flex items-center py-3 border-b last:border-b-0">
            <div className="flex items-center w-1/3">
                <Icon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-500">{label}</span>
            </div>
            <div className="w-2/3">
                <span className="text-sm text-gray-900">{value || "N/A"}</span>
            </div>
        </div>
    );

    // Status badge with appropriate color
    const StatusBadge = ({ status }) => {
        let bgColor = "bg-gray-100 text-gray-800";

        if (status === "activated") {
            bgColor = "bg-green-100 text-green-800";
        } else if (status === "Pending") {
            bgColor = "bg-yellow-100 text-yellow-800";
        } else if (status === "expired") {
            bgColor = "bg-red-100 text-red-800";
        }

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${bgColor}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="max-w-4xl mx-auto py-6">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Warranty Details</h2>
                    <StatusBadge status={warranty.inspectionReport.warrantyStatus || warranty.claimStatus} />
                </div>

                <DetailRow
                    icon={FiCalendar}
                    label="Issue Date"
                    value={new Date(warranty.issueDate).toLocaleDateString()}
                />
                <DetailRow
                    icon={FiCalendar}
                    label="Expiry Date"
                    value={expiryDate.toLocaleDateString()}
                />
                <DetailRow
                    icon={FiHash}
                    label="Payment ID"
                    value={warranty.razorpayPaymentId}
                />
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Plan Details</h3>
                <DetailRow
                    icon={FiCalendar}
                    label="Duration"
                    value={`${warranty.warrantyPlanId.warranty_months} months`}
                />
                <DetailRow
                    icon={FiDollarSign}
                    label="Price"
                    value={`₹${warranty.warrantyPlanId.price}`}
                />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Device Information</h3>
                <DetailRow
                    icon={FiSmartphone}
                    label="Device Model"
                    value={warranty.inspectionReport.deviceModel}
                />
                <DetailRow
                    icon={FiHash}
                    label="IMEI Number"
                    value={warranty.inspectionReport.imeiNumber}
                />
                <DetailRow
                    icon={FiHash}
                    label="Serial Number"
                    value={warranty.inspectionReport.serialNumber}
                />
                <DetailRow
                    icon={FiUser}
                    label="Inspection By"
                    value={`${warranty.inspectionReport.inspectorId.firstName} ${warranty.inspectionReport.inspectorId.lastName}`}
                />
                <DetailRow
                    icon={FiCalendar}
                    label="Inspection Date"
                    value={new Date(warranty.inspectionReport.inspectionDate).toLocaleDateString()}
                />
                <DetailRow
                    icon={FiCheckCircle}
                    label="Screen Condition"
                    value={warranty.inspectionReport.screenCondition}
                />
                <DetailRow
                    icon={FiAlertCircle}
                    label="Body Condition"
                    value={warranty.inspectionReport.bodyCondition}
                />
                <DetailRow
                    icon={FiCheckCircle}
                    label="Grade"
                    value={warranty.inspectionReport.grade}
                />
            </div>

            {/* Customer Details Section */}
            {warranty.customer && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
                <DetailRow icon={FiUsers} label="Customer Name" value={warranty.customer.customerName} />
                <DetailRow icon={FiMail} label="Customer Email" value={warranty.customer.customerEmailId} />
                <DetailRow icon={FiSmartphone} label="Customer Phone" value={warranty.customer.customerPhoneNumber} />
                <DetailRow icon={FiFileText} label="Aadhaar Number" value={warranty.customer.customerAdhaarNumber} />
              </div>
            )}

        </div>
    );
};

export default WarrantyDetails;
