import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiDownload, FiEye, FiRefreshCw } from 'react-icons/fi';
import WarrantyDetails from '../../components/WarrantyDetails';

const WarrantiesManagement = () => {
    const [warranties, setWarranties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedWarranty, setSelectedWarranty] = useState(null);
    const [viewingDetails, setViewingDetails] = useState(false);

    const fetchWarranties = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get('http://localhost:5000/api/warranty/issued-warranties', {
                headers: { Authorization: `${localStorage.getItem('token')}` }
            });
            console.log(response.data)
            setWarranties(response.data.data);
        } catch (error) {
            console.error('Error fetching warranties:', error);
            setError(`Failed to load issued warranties: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWarranties();
    }, []);

    const handleWarrantyDownload = async (warrantyId) => {
        try {
            console.log(warrantyId)
            const response = await axios.get(`http://localhost:5000/api/warranty/download-warranty/${warrantyId}`, {
                responseType: 'blob', // Important for downloading files
                headers: { Authorization: `${localStorage.getItem('token')}` }
            });

            // Create a URL for the PDF file
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `warranty_${warrantyId}.pdf`); // Set the file name
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading warranty:', error);
            alert('Failed to download warranty. Please try again later.');
        }
    };

    const handleWarrantyView = (warranty) => {
        setSelectedWarranty(warranty);
        setViewingDetails(true);
    };

    const closeDetails = () => {
        setViewingDetails(false);
        setSelectedWarranty(null);
    };

    const StatusBadge = ({ status }) => {
        let bgColor = '';
        
        switch((status || '').toLowerCase()) {
          case 'activated':
            bgColor = 'bg-green-100 text-green-800';
            break;
          case 'purchased':
            bgColor = 'bg-yellow-100 text-yellow-800';
            break;
          case 'not-purchased':
            bgColor = 'bg-red-100 text-red-800';
            break;
          default:
            bgColor = 'bg-gray-100 text-gray-800';
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
            {status || 'Unknown'}
          </span>
        );
      };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden p-6">
            {viewingDetails ? (
                <WarrantyDetails warranty={selectedWarranty} onClose={closeDetails} />
            ) : (
                <>
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">Issued Warranties</h2>
                        <button onClick={fetchWarranties} className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            <FiRefreshCw className="mr-2" />
                            Refresh
                        </button>
                    </div>

                    {loading && <div className="p-6 text-center">Loading issued warranties...</div>}
                    {error && <div className="p-6 text-center text-red-600">{error}</div>}

                    {!loading && !error && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device Model</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IMEI Number</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PhoneChecker Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warranty Plan Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warranty Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {warranties.length > 0 ? (
                                        warranties.map((warranty) => (
                                            <tr key={warranty.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{warranty.inspectionReport.deviceModel}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{warranty.inspectionReport.imeiNumber}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{warranty.inspectionReport.inspectorId.firstName} {warranty.inspectionReport.inspectorId.lastName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{warranty.inspectionReport.grade}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{warranty.warrantyPlanId.planName}</td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm`}>
                                                    <StatusBadge status={warranty.inspectionReport.warrantyStatus} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex space-x-2">
                                                        <button className="p-1 rounded-full text-blue-600 hover:bg-blue-100" title="View Warranty" onClick={() => handleWarrantyView(warranty)}>
                                                            <FiEye size={18} />
                                                        </button>
                                                        <button className="p-1 rounded-full text-green-600 hover:bg-green-100" title="Download Warranty" onClick={() => handleWarrantyDownload(warranty._id)}>
                                                            <FiDownload size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No issued warranties found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default WarrantiesManagement;
