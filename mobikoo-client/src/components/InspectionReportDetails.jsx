import React from 'react';
import { FiSmartphone, FiCpu, FiCamera, FiBattery, FiMonitor, FiTool, FiBox, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'excellent':
      case 'functional':
      case 'optimal':
      case 'no scratches':
      case 'fully functional':
        return 'text-green-600 bg-green-50';
      case 'good':
      case 'moderate':
      case 'minor scratches':
      case 'minor issues':
      case 'some issues':
        return 'text-yellow-600 bg-yellow-50';
      case 'poor':
      case 'damaged':
      case 'cracked':
      case 'not functional':
      case 'issues detected':
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{report.deviceModel}</h2>
            <p className="text-sm text-gray-500 mt-1">Inspected on {formatDate(report.inspectionDate)}</p>
          </div>
          <div className={`px-4 py-2 rounded-lg ${getStatusColor(report.grade)}`}>
            <span className="text-lg font-semibold">Grade {report.grade}</span>
          </div>
        </div>
      </div>

      {/* Device Information */}
      <Section title="Device Information">
        <DetailRow icon={FiSmartphone} label="IMEI Number" value={report.imeiNumber} />
        <DetailRow icon={FiCpu} label="Serial Number" value={report.serialNumber} />
        <DetailRow icon={FiBox} label="Operating System" value={report.operatingSystem} />
      </Section>

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