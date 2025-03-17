import React from 'react';
import { 
  FiSmartphone, FiCpu, FiCamera, FiBattery, FiMonitor, FiTool, 
  FiBox, FiCheckCircle, FiAlertCircle, FiCalendar, 
  FiDollarSign, FiShield, FiClock, FiFileText
} from 'react-icons/fi';

export const InspectionReportDetails = ({ report }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSimpleDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'excellent':
      case 'functional':
      case 'optimal':
      case 'no scratches':
      case 'fully functional':
      case 'active':
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'good':
      case 'moderate':
      case 'minor scratches':
      case 'minor issues':
      case 'some issues':
      case 'pending':
      case 'purchased':
        return 'text-yellow-600 bg-yellow-50';
      case 'poor':
      case 'damaged':
      case 'cracked':
      case 'not functional':
      case 'issues detected':
      case 'rejected':
      case 'expired':
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

  // Check if warranty exists
  const hasWarranty = report.warrantyDetails && report.warrantyStatus;

  const handleDownload = () => {
    // Implement download functionality here
    print('Download button clicked');
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{report.deviceModel}</h2>
            <p className="text-sm text-gray-500 mt-1">Inspected on {formatDate(report.inspectionDate)}</p>
            <p className="text-sm text-gray-500 mt-1">Inspector: {report.inspectorId?.firstName} {report.inspectorId?.lastName}</p>
            <p className="text-sm text-gray-500 mt-1">Shop: {report.shopName}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <div className={`px-4 py-2 rounded-lg ${getStatusColor(report.grade)}`}>
              <span className="text-lg font-semibold">Grade {report.grade}</span>
            </div>
            {hasWarranty && (
              <div className={`px-4 py-2 rounded-lg ${getStatusColor(report.warrantyStatus)}`}>
                <span className="text-sm font-medium">Warranty: {report.warrantyStatus}</span>
              </div>
            )}
            <button 
              onClick={handleDownload} 
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Download
            </button>
          </div>
        </div>
      </div>

      
      <Section title="Device Information">
        <DetailRow icon={FiSmartphone} label="IMEI Number" value={report.imeiNumber} />
        <DetailRow icon={FiCpu} label="Serial Number" value={report.serialNumber} />
        <DetailRow icon={FiBox} label="Operating System" value={report.operatingSystem} />
      </Section>

      {/* Warranty Details (if available) */}
      {hasWarranty && (
        <Section title="Warranty Information">
          <DetailRow 
            icon={FiShield} 
            label="Plan Name" 
            value={report.warrantyDetails.warrantyPlanId?.planName || 'N/A'} 
          />
          <DetailRow 
            icon={FiClock} 
            label="Duration" 
            value={`${report.warrantyDetails.warrantyPlanId?.durationMonths || 'N/A'} months`} 
          />
          <DetailRow 
            icon={FiCalendar} 
            label="Issue Date" 
            value={report.warrantyDetails.issueDate ? formatSimpleDate(report.warrantyDetails.issueDate) : 'N/A'} 
          />
          <DetailRow 
            icon={FiFileText} 
            label="Coverage Details" 
            value={report.warrantyDetails.warrantyPlanId?.coverageDetails || 'N/A'} 
          />
          <DetailRow 
            icon={FiDollarSign} 
            label="Plan Price" 
            value={report.warrantyDetails.warrantyPlanId?.price ? formatCurrency(report.warrantyDetails.warrantyPlanId.price) : 'N/A'} 
          />
          <DetailRow 
            icon={FiCheckCircle} 
            label="Claim Status" 
            value={report.warrantyDetails.claimStatus || 'N/A'} 
            isStatus
          />
          <DetailRow 
            icon={FiFileText} 
            label="Payment ID" 
            value={report.warrantyDetails.razorpayPaymentId || 'N/A'} 
          />
        </Section>
      )}

      {/* Physical Condition */}
      <Section title="Physical Condition">
        <DetailRow icon={FiMonitor} label="Screen Condition" value={report.screenCondition} isStatus />
        <DetailRow icon={FiBox} label="Body Condition" value={report.bodyCondition} isStatus />
        <DetailRow icon={FiBattery} label="Battery Health" value={report.batteryHealth} isStatus />
      </Section>

      {/* Functionality Tests */}
      <Section title="Functionality Tests">
        <DetailRow icon={FiBattery} label="Charging Port" value={report.chargingPortFunctionality} isStatus />
        <DetailRow icon={FiCamera} label="Camera" value={report.cameraFunctionality} isStatus />
        <DetailRow icon={FiTool} label="Buttons & Sensors" value={report.buttonsSensors} isStatus />
        <DetailRow icon={FiCpu} label="OS Functionality" value={report.osFunctionality} isStatus />
        <DetailRow icon={FiCpu} label="Performance Score" value={report.performanceBenchmark} />
      </Section>

      {/* Photos Section */}
      {report.photos && report.photos.length > 0 && (
        <Section title="Device Photos">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {report.photos.map((photo, index) => (
              <div key={index} className="relative aspect-w-3 aspect-h-2">
                <img
                  src={photo}
                  alt={`Device photo ${index + 1}`}
                  className="object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Additional Comments */}
      <Section title="Inspector Comments">
        <p className="text-sm text-gray-600">{report.comments}</p>
      </Section>

      {/* Digital Signature */}
      <div className="flex items-center justify-end mt-4 text-sm text-gray-500">
        {report.digitalSignature ? (
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

export default InspectionReportDetails;