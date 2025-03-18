import React, { useEffect, useState } from 'react';
import { FiPlus, FiEye, FiEdit, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import ClaimForm from './ClaimForm';
import axios from 'axios';
import ClaimDetails from './ClaimDetails';

const Claims = () => {
    const [showClaimForm, setShowClaimForm] = useState(false);
    const [claims, setClaims] = useState([]);
    const [selectedClaim, setSelectedClaim] = useState(null);

    const fetchClaims = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/claim/shop-owner', {
                headers: { Authorization: `${localStorage.getItem('token')}` },
            });
            console.log(response.data)
            setClaims(response.data);
        } catch (error) {
            console.error('Error fetching claims:', error);
        }
    };
    useEffect(()=>{
        fetchClaims();
    },[])

    const handleNewClaim = () => {
        setShowClaimForm(true);
    };

    const handleClaimSubmit = async (claimData) => {
        console.log('New Claim Request:', claimData);

        try {

            
            // Send the claim request to the server
            const response = await axios.post('http://localhost:5000/api/claim/submit', claimData, {
                headers: { Authorization: `${localStorage.getItem('token')}` },
            });

            console.log('Claim request submitted:', response.data);
            setClaims([...claims, response.data.claim]);

        } catch (error) {
            console.error('Error submitting claim:', error);
            return
        }
        
        setShowClaimForm(false);
    };

    const handleCloseForm = () => {
        setShowClaimForm(false);
    };

    const handleBack = () => {
        setSelectedClaim(null);
      };

    if (selectedClaim) {
        return (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex items-center">
                <button
                  onClick={handleBack}
                  className="mr-4 text-gray-500 hover:text-gray-700"
                >
                  <FiArrowLeft className="h-5 w-5" />
                </button>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Claim Details
                </h3>
              </div>
            </div>
            <div className="p-6">
              <ClaimDetails claim={selectedClaim} />
            </div>
          </div>
        );
      }
    

    const handleEditClaim = (id) => {
        console.log(`Edit claim with id: ${id}`);
    };

    const handleDeleteClaim = (id) => {
        console.log(`Delete claim with id: ${id}`);
        setClaims(claims.filter(claim => claim.id !== id));
    };

    return (
        <div className="bg-white rounded-lg shadow">
            {showClaimForm ? (
                <ClaimForm onSubmit={handleClaimSubmit} onCancel={handleCloseForm} />
            ) : (
                <>
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h1 className="text-xl font-semibold text-gray-800">Claims Management</h1>
                            <button
                                onClick={handleNewClaim}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                            >
                                <FiPlus className="mr-2" />
                                New Claim
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        IMEI Number
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer Details
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Apply Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {claims.map((claim) => (
                                    <tr key={claim._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {claim.deviceDetails?.imeiNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{claim.customerDetails.customerName}</div>
                                            <div className="text-sm text-gray-500">{claim.customerDetails.customerPhoneNumber}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {claim.claimSubmissionDate.split('T')[0]}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${claim.status === 'Approved'
                                                        ? 'bg-green-100 text-green-800'
                                                        : claim.claimStatus === 'Rejected'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                            >
                                                {claim.claimStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{claim.claimAmount}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => setSelectedClaim(claim)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <FiEye className="h-5 w-5" />
                                                </button>
                                                {/* <button
                                                    onClick={() => handleDeleteClaim(claim._id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <FiTrash2 className="h-5 w-5" />
                                                </button> */}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {claims.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No claims found. Create a new claim to get started.
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Claims;