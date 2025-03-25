import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiRefreshCw, FiSearch, FiArrowLeft, FiEye } from "react-icons/fi";
import ClaimDetails from "../pages/ShopOwner/ClaimDetails";
const API_URL = import.meta.env.VITE_API_URL;

const ClaimsManagement = () => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const claimsPerPage = 10;
    const [viewDetails, setViewDetails] = useState(false);
    const [selectedClaim, setSelectedClaim] = useState(null);

    const fetchClaims = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${API_URL}/api/claim/all`, {
                headers: { Authorization: `${localStorage.getItem("token")}` },
            });
            console.log(response.data)
            setClaims(response.data);
        } catch (error) {
            console.error("Error fetching claims:", error);
            setError(`Failed to load claims: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClaims();
    }, []);

    const handleApprove = async (claimId) => {
        console.log(claimId)
        try {
            await axios.patch(`${API_URL}/api/claim/approve/${claimId}`, {}, {
                headers: { Authorization: `${localStorage.getItem("token")}` },
            });
            fetchClaims();
        } catch (error) {
            console.error("Error approving claim:", error);
        }
    };

    const handleReject = async (claimId) => {
        try {
            await axios.patch(`${API_URL}/api/claim/reject/${claimId}`, {}, {
                headers: { Authorization: `${localStorage.getItem("token")}` },
            });
            fetchClaims();
        } catch (error) {
            console.error("Error rejecting claim:", error);
        }
    };

    const filteredClaims = claims.filter((claim) => {
        const name = claim.customerDetails.customerName.toLowerCase();
        const phone = String(claim.customerDetails.customerPhoneNumber);
        const imei = claim.customerDetails.imeiNumber.toLowerCase();
        const query = searchQuery.toLowerCase();

        return name.includes(query) || phone.includes(query) || imei.includes(query);
    });

    const indexOfLastClaim = currentPage * claimsPerPage;
    const indexOfFirstClaim = indexOfLastClaim - claimsPerPage;
    const currentClaims = filteredClaims.slice(indexOfFirstClaim, indexOfLastClaim);
    const totalPages = Math.ceil(filteredClaims.length / claimsPerPage);

    const closeDetails = () => {
        setViewDetails(false);
        setSelectedClaim(null);
    }

    return (

        <div className="bg-white shadow-lg rounded-lg">
            {
                viewDetails ? (
                    <div>
                        <button
                            onClick={closeDetails}
                            className="flex items-center px-4 py-2 mb-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-300"
                        >
                            <FiArrowLeft className="mr-2" /> Back to List
                        </button>
                        <ClaimDetails claim={selectedClaim}/>
                    </div >
                ) :(
                    <>
                    
                    <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 md:mb-0">Claim Requests</h2>
                        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search claims..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                />
                                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            </div>
                            <button
                                onClick={fetchClaims}
                                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <FiRefreshCw className="mr-2" />
                                Refresh
                            </button>
                        </div>
                    </div>
                    {loading && <div className="p-6 text-center">Loading claims...</div>}
            {error && <div className="p-6 text-center text-red-600">{error}</div>}

            {!loading && !error && (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IMEI Number</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-800 text-sm">
                                {currentClaims.length > 0 ? (
                                    currentClaims.map((claim) => (
                                        <tr key={claim._id} className="hover:bg-gray-50">
                                            <td className="py-3 px-6 border-b border-gray-200">{claim._id}</td>
                                            <td className="py-3 px-6 border-b border-gray-200">{claim.customerDetails.customerName}</td>
                                            <td className="py-3 px-6 border-b border-gray-200">{claim.customerDetails.customerPhoneNumber}</td>
                                            <td className="py-3 px-6 border-b border-gray-200">{claim.customerDetails.imeiNumber}</td>
                                            <td className="py-3 px-6 border-b border-gray-200">{claim.claimAmount}</td>
                                            <td className="py-3 px-6 border-b border-gray-200">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${claim.claimStatus === "Submitted" ? "bg-yellow-100 text-yellow-600" :
                                                    claim.claimStatus === "Approved" ? "bg-green-100 text-green-600" :
                                                        "bg-red-100 text-red-600"
                                                    }`}>
                                                    {claim.claimStatus}
                                                </span>
                                            </td>
                                            <td className="py-3 px-6 border-b border-gray-200 flex justify-start items-center gap-5">
                                                <button
                                                    onClick={() => {
                                                        setViewDetails(true);
                                                        setSelectedClaim(claim);
                                                    }}
                                                    className="p-1 rounded-full text-blue-600 hover:bg-blue-100" title="View Claim Details"
                                                >
                                                    <FiEye size={18} />
                                                </button>
                                                {claim.claimStatus === "Submitted" && (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleApprove(claim._id)}
                                                            className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(claim._id)}
                                                            className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="py-4 px-6 text-center text-gray-500">No claims found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination UI */}
                    {filteredClaims.length > 0 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <span className="text-sm text-gray-700">
                                Page {currentPage} of {totalPages}
                            </span>
                            <div className="flex space-x-2">
                                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="pagination-btn">Previous</button>
                                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="pagination-btn">Next</button>
                            </div>
                        </div>
                    )}
                </>
            )}
                </>)}

    
        
        </div>
    );
};

export default ClaimsManagement;
