import React from 'react';
import { 
  FiShield, FiClock, FiCalendar, FiFileText, FiDollarSign, 
  FiCheckCircle, FiAlertCircle, FiUser, FiMail, FiSmartphone
} from 'react-icons/fi';

const WarrantyDetails = ({ warranty, onClose }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'pending':
      case 'purchased':
        return 'text-yellow-600 bg-yellow-50';
      case 'expired':
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const StatusBadge = ({ status }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
      {status}
    </span>
  );

  const Section = ({ title, children }) => (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );

  const DetailRow = ({ icon: Icon, label, value, isStatus = false }) => (
    <div className="flex items-center py-3 border-b last:border-b-0">
      <div className="flex items-center w-1/3">
        <Icon className="h-5 w-5 text-gray-400 mr-2" />
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <div className="w-2/3">
        {isStatus ? (
          <StatusBadge status={value} />
        ) : (
          <span className="text-sm text-gray-900">{value}</span>
        )}
      </div>
    </div>
  );

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{warranty.inspectionReport.deviceModel}</h2>
            <p className="text-sm text-gray-500 mt-1">Issued on: {formatDate(warranty.issueDate || warranty.inspectionReport.inspectionDate)}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <div className={`px-4 py-2 rounded-lg ${getStatusColor(warranty.inspectionReport.warrantyStatus)}`}>
              <span className="text-lg font-semibold">{warranty.inspectionReport.warrantyStatus}</span>
            </div>
            <button 
              onClick={onClose} 
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      
      <Section title="Device Information">
        <DetailRow icon={FiSmartphone} label="Device Model" value={warranty.inspectionReport.deviceModel} />
        <DetailRow icon={FiSmartphone} label="IMEI Number" value={warranty.inspectionReport.imeiNumber} />
        <DetailRow icon={FiFileText} label="Serial Number" value={warranty.inspectionReport.serialNumber} />
      </Section>

      <Section title="Warranty Information">
        <DetailRow icon={FiClock} label="Duration" value={`${warranty.warrantyPlanId.warranty_months} months`} />
        <DetailRow icon={FiCalendar} label="Issue Date" value={formatDate(warranty.issueDate || warranty.inspectionReport.inspectionDate)} />
        <DetailRow icon={FiDollarSign} label="Plan Price" value={formatCurrency(warranty.warrantyPlanId.price)} />
        <DetailRow 
          icon={FiCheckCircle} 
          label="Status" 
          value={warranty.claimStatus || warranty.inspectionReport.warrantyStatus} 
          isStatus 
        />
        {warranty.razorpayPaymentId && (
          <DetailRow icon={FiFileText} label="Payment ID" value={warranty.razorpayPaymentId} />
        )}
      </Section>

      <Section title="Inspector Information">
        <DetailRow 
          icon={FiUser} 
          label="Inspector Name" 
          value={`${warranty.inspectionReport.inspectorId.firstName} ${warranty.inspectionReport.inspectorId.lastName}`} 
        />
        <DetailRow icon={FiMail} label="Email" value={warranty.inspectionReport.inspectorId.email} />
      </Section>

      {/* Digital Signature */}
      <div className="flex items-center justify-end mt-4 text-sm text-gray-500">
        {warranty.inspectionReport.digitalSignature ? (
          <div className="flex items-center text-green-600">
            <FiCheckCircle className="h-5 w-5 mr-2" />
            Digitally Signed by Inspector
          </div>
        ) : (
          <div className="flex items-center text-red-600">
            <FiAlertCircle className="h-5 w-5 mr-2" />
            Not Signed
          </div>
        )}
      </div>
    </div>
  );
};

export default WarrantyDetails;