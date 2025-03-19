import React, { useState, useEffect } from 'react';
import { FiDownload, FiRefreshCw, FiFilter, FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi';
import axios from 'axios';

const PartnerManagement = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterKeyword, setFilterKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentPartner, setCurrentPartner] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    address: '', 
    contactNumber: '', 
    email: '', 
    website: '' 
  });

  useEffect(() => {
    fetchPartners();
  }, [currentPage, sortField, sortDirection, filterKeyword]);

  const fetchPartners = async () => {
    setLoading(true);
    
    try {
      const response = await axios.get('http://localhost:5000/api/partners', {
        headers: { Authorization: `${localStorage.getItem('token')}` },
      });
      
      if (response.data) {
        setPartners(response.data);
      } else {
        setPartners([]);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch partners. Please try again later.');
      console.error('Error fetching partners:', err);
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRefresh = () => {
    fetchPartners();
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentPartner(null);
    setFormData({ name: '', address: '', contactNumber: '', email: '', website: '' });
  };

  const openModal = (partner = null) => {
    if (partner) {
      setCurrentPartner(partner);
      setFormData({
        name: partner.name || '',
        address: partner.address || '',
        contactNumber: partner.contactNumber || '',
        email: partner.email || '',
        website: partner.website || ''
      });
    } else {
      setCurrentPartner(null);
      setFormData({ name: '', address: '', contactNumber: '', email: '', website: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (currentPartner) {
        await axios.put(`http://localhost:5000/api/partners/${currentPartner._id}`, formData, {
          headers: { Authorization: `${localStorage.getItem('token')}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/partners', formData, {
          headers: { Authorization: `${localStorage.getItem('token')}` }
        });
      }
      fetchPartners();
      closeModal();
    } catch (err) {
      setError('Failed to save partner. Please try again.');
      console.error('Error saving partner:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this partner?')) {
      setLoading(true);
      try {
        await axios.delete(`http://localhost:5000/api/partners/${id}`, {
          headers: { Authorization: `${localStorage.getItem('token')}` }
        });
        fetchPartners();
      } catch (err) {
        setError('Failed to delete partner. Please try again.');
        console.error('Error deleting partner:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredPartners = partners.filter(partner => {
    if (!filterKeyword) return true;
    
    const keyword = filterKeyword.toLowerCase();
    return (
      (partner.name?.toLowerCase().includes(keyword)) ||
      (partner.address?.toLowerCase().includes(keyword)) ||
      (partner.contactNumber?.toLowerCase().includes(keyword)) ||
      (partner.email?.toLowerCase().includes(keyword)) ||
      (partner.website?.toLowerCase().includes(keyword))
    );
  });

  const sortedPartners = [...filteredPartners].sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedPartners.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedPartners.length / itemsPerPage);

  const handleDownloadCSV = () => {
    // Creating CSV data
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add CSV Headers
    csvContent += "Name,Address,Contact Number,Email,Website\n";
    
    // Add data rows
    filteredPartners.forEach(partner => {
      const row = [
        partner.name || 'N/A',
        partner.address || 'N/A',
        partner.contactNumber || 'N/A',
        partner.email || 'N/A',
        partner.website || 'N/A'
      ];
      csvContent += row.join(",") + "\n";
    });
    
    // Create download link and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `partners_list_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h3 className="text-lg font-medium text-gray-900">Partners</h3>
        <div className="flex space-x-2">
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            title="Refresh"
          >
            <FiRefreshCw />
          </button>
          <button 
            onClick={handleDownloadCSV}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            title="Download CSV"
          >
            <FiDownload />
          </button>
          <button 
            onClick={() => openModal()}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <FiPlus className="mr-1" /> Add Partner
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Filter Input */}
        <div className="mb-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiFilter className="text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Filter partners by name, address, email..."
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
          />
        </div>
        
        {loading && !showModal ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading partners...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">
            {error}
            <button 
              onClick={handleRefresh}
              className="block mx-auto mt-2 text-blue-500 hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Name
                        {sortField === 'name' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('address')}
                    >
                      <div className="flex items-center">
                        Address
                        {sortField === 'address' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('contactNumber')}
                    >
                      <div className="flex items-center">
                        Contact Number
                        {sortField === 'contactNumber' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center">
                        Email
                        {sortField === 'email' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('website')}
                    >
                      <div className="flex items-center">
                        Website
                        {sortField === 'website' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.length > 0 ? (
                    currentItems.map((partner, index) => (
                      <tr key={partner._id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {partner.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {partner.address || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {partner.contactNumber || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {partner.email || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {partner.website ? (
                            <a 
                              href={partner.website.startsWith('http') ? partner.website : `https://${partner.website}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {partner.website}
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => openModal(partner)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(partner._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        No partners found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {sortedPartners.length > 0 && (
              <div className="flex items-center justify-between mt-4 px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(indexOfLastItem, sortedPartners.length)}</span> of{' '}
                      <span className="font-medium">{sortedPartners.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                          currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <FiChevronLeft className="h-5 w-5" />
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                        let pageNumber;
                        
                        if (totalPages <= 5) {
                          pageNumber = idx + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = idx + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + idx;
                        } else {
                          pageNumber = currentPage - 2 + idx;
                        }
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNumber
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                          currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <FiChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Partner Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={closeModal}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {currentPartner ? 'Edit Partner' : 'Add Partner'}
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <input 
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                          </label>
                          <input 
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            required
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Number
                          </label>
                          <input 
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={formData.contactNumber}
                            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                            required
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input 
                            type="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Website
                          </label>
                          <input 
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          />
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {currentPartner ? 'Update' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerManagement;