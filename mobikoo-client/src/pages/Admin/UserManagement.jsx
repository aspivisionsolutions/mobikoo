import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiAlertCircle, FiSearch } from 'react-icons/fi';
import axios from 'axios';

const UserManagement = () => {
  // State variables
  const [activeTab, setActiveTab] = useState('customers');
  const [customers, setCustomers] = useState([]);
  const [phoneCheckers, setPhoneCheckers] = useState([]);
  const [shopOwners, setShopOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    phone: '',
    status: 'active',
    // For Customer
    customerName: '',
    customerPhoneNumber: '',
    customerAdhaarNumber: '',
    customerEmailId: '',
    // For Phone Checker
    phoneNumber: '',
    area: '',
    // For Shop Owner
    shopName: '',
    address: ''
  });
  const getAxiosConfig = () => {
    return {
      headers: { Authorization: `${localStorage.getItem('token')}` }
    };
  };
  // Fetch data based on active tab
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint;
      switch (activeTab) {
        case 'customers':
          endpoint = 'http://localhost:5000/api/admin/customers';
          break;
        case 'phoneCheckers':
          endpoint = 'http://localhost:5000/api/admin/phone-checkers';
          break;
        case 'shopOwners':
          endpoint = 'http://localhost:5000/api/admin/shop-owners';
          break;
        default:
          endpoint = 'http://localhost:5000/api/admin/customers';
      }
      const response = await axios.get(endpoint,getAxiosConfig());
      console.log(response.data);
      const responseData = Array.isArray(response.data) ? response.data : [];
      console.log(response.data);
    switch (activeTab) {
      case 'customers':
        setCustomers(responseData);
        break;
      case 'phoneCheckers':
        setPhoneCheckers(responseData);
        break;
      case 'shopOwners':
        setShopOwners(responseData);
        break;
      default:
        break;
    }
    
    setError(null);
  } catch (err) {
    setError('Failed to fetch data');
    console.error(err);
    // Initialize empty arrays when there's an error
    if (activeTab === 'customers') setCustomers([]);
    if (activeTab === 'phoneCheckers') setPhoneCheckers([]);
    if (activeTab === 'shopOwners') setShopOwners([]);
  } finally {
    setLoading(false);
  }
};


  // Handle delete user
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete user
  const confirmDelete = async () => {
    try {
      // FIX: Safely get user ID or fallback to user's own ID
      const userId = userToDelete?.userId?._id || 
                    (userToDelete?.userId && typeof userToDelete.userId === 'string' ? userToDelete.userId : null) || 
                    userToDelete?._id;
      
      if (!userId) {
        console.error('Cannot delete: User ID is null or undefined');
        setError('Failed to delete: User ID not found');
        setIsDeleteModalOpen(false);
        return;
      }
      
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, getAxiosConfig());
      
      // Remove user from respective state
      switch (activeTab) {
        case 'customers':
          setCustomers(customers.filter(customer => customer._id !== userToDelete._id));
          break;
        case 'phoneCheckers':
          setPhoneCheckers(phoneCheckers.filter(checker => checker._id !== userToDelete._id));
          break;
        case 'shopOwners':
          setShopOwners(shopOwners.filter(owner => owner._id !== userToDelete._id));
          break;
        default:
          break;
      }
      
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    }
  };

  // Handle edit user
  const handleEditClick = (user) => {
    let userData = {
      firstName: user.userId?.firstName || user.firstName || '',
      email: user.userId?.email || user.email || '',
      phone: user.userId?.phone || user.phone || '',
      status: user.userId?.status || user.status || 'active'
    };
    
    // Add role-specific fields
    if (activeTab === 'customers') {
      userData = {
        ...userData,
        customerName: user.customerName || '',
        customerPhoneNumber: user.customerPhoneNumber || '',
        customerAdhaarNumber: user.customerAdhaarNumber || '',
        customerEmailId: user.customerEmailId || ''
      };
    } else if (activeTab === 'phoneCheckers') {
      userData = {
        ...userData,
        phoneNumber: user.phoneNumber || '',
        area: user.area || ''
      };
    } else if (activeTab === 'shopOwners') {
      userData = {
        ...userData,
        phoneNumber: user.phoneNumber || '',
        shopName: user.shopDetails?.shopName || '',
        address: user.shopDetails?.address || ''
      };
    }
    
    setEditingUser(user);
    setFormData(userData);
    setIsEditModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Submit edit form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // FIX: Safely get user ID or fallback to user's own ID
      const userId = editingUser?.userId?._id || 
                    (editingUser?.userId && typeof editingUser.userId === 'string' ? editingUser.userId : null) || 
                    editingUser?._id;
      
      if (!userId) {
        console.error('Cannot update: User ID is null or undefined');
        setError('Failed to update: User ID not found');
        setIsEditModalOpen(false);
        return;
      }
      
      // Prepare data based on user type
      let updateData = { ...formData };
      
      // Format data according to each schema
      if (activeTab === 'shopOwners') {
        updateData = {
          ...updateData,
          shopDetails: {
            shopName: formData.shopName,
            address: formData.address
          }
        };
      }
      
      await axios.put(`http://localhost:5000/api/admin/users/${userId}`, updateData, getAxiosConfig());
      
      // Update user in respective state
      const updatedUser = { ...editingUser };
      
      // Update user properties based on form data
      if (updatedUser.userId) {
        updatedUser.userId = { 
          ...updatedUser.userId, 
          firstName: formData.firstName,
          email: formData.email,
          phone: formData.phone,
          status: formData.status
        };
      }
      
      if (activeTab === 'customers') {
        updatedUser.customerName = formData.customerName;
        updatedUser.customerPhoneNumber = formData.customerPhoneNumber;
        updatedUser.customerAdhaarNumber = formData.customerAdhaarNumber;
        updatedUser.customerEmailId = formData.customerEmailId;
      } else if (activeTab === 'phoneCheckers') {
        updatedUser.phoneNumber = formData.phoneNumber;
        updatedUser.area = formData.area;
      } else if (activeTab === 'shopOwners') {
        updatedUser.phoneNumber = formData.phoneNumber;
        updatedUser.shopDetails = {
          shopName: formData.shopName,
          address: formData.address
        };
      }
      
      switch (activeTab) {
        case 'customers':
          setCustomers(customers.map(customer => 
            customer._id === editingUser._id ? updatedUser : customer
          ));
          break;
        case 'phoneCheckers':
          setPhoneCheckers(phoneCheckers.map(checker => 
            checker._id === editingUser._id ? updatedUser : checker
          ));
          break;
        case 'shopOwners':
          setShopOwners(shopOwners.map(owner => 
            owner._id === editingUser._id ? updatedUser : owner
          ));
          break;
        default:
          break;
      }
      
      setIsEditModalOpen(false);
      setEditingUser(null);
    } catch (err) {
      setError('Failed to update user');
      console.error(err);
    }
  };

  // Filter users based on search term
   const filteredUsers = () => {
    const searchTermLower = searchTerm.toLowerCase();
    switch (activeTab) {
      case 'customers':
        return Array.isArray(customers) 
          ? customers.filter(customer => 
              (customer?.userId?.firstName || customer?.customerName || '').toLowerCase().includes(searchTermLower) ||
              (customer?.userId?.email || customer?.customerEmailId || '').toLowerCase().includes(searchTermLower) ||
              (customer?.customerPhoneNumber?.toString() || '').includes(searchTermLower)
            )
          : [];
      case 'phoneCheckers':
        return Array.isArray(phoneCheckers)
          ? phoneCheckers.filter(checker => 
              (checker?.userId?.firstName || '').toLowerCase().includes(searchTermLower) ||
              (checker?.userId?.email || '').toLowerCase().includes(searchTermLower) ||
              (checker?.phoneNumber || checker?.userId?.phone || '').toLowerCase().includes(searchTermLower) ||
              (checker?.area || '').toLowerCase().includes(searchTermLower)
            )
          : [];
      case 'shopOwners':
        return Array.isArray(shopOwners)
          ? shopOwners.filter(owner => 
              (owner?.userId?.firstName || '').toLowerCase().includes(searchTermLower) ||
              (owner?.userId?.email || '').toLowerCase().includes(searchTermLower) ||
              (owner?.shopDetails?.shopName || '').toLowerCase().includes(searchTermLower) ||
              (owner?.shopDetails?.address || '').toLowerCase().includes(searchTermLower) ||
              (owner?.phoneNumber || '').toLowerCase().includes(searchTermLower)
            )
          : [];
      default:
        return [];
    }
  };

  // Render user table based on active tab
  const renderUserTable = () => {
    const users = filteredUsers();
    
    if (loading) {
      return <div className="text-center py-4">Loading...</div>;
    }
    
    if (error) {
      return <div className="text-center py-4 text-red-600">{error}</div>;
    }
    
    if (users.length === 0) {
      return <div className="text-center py-4">No users found</div>;
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Phone</th>
              {activeTab === 'customers' && (
                <>
                  
                  <th className="py-3 px-4 text-left">Aadhaar Number</th>
                </>
              )}
              {activeTab === 'phoneCheckers' && (
                <>
                  <th className="py-3 px-4 text-left">Area</th>
                  
                </>
              )}
              {activeTab === 'shopOwners' && (
                <>
                  <th className="py-3 px-4 text-left">Shop Name</th>
                  <th className="py-3 px-4 text-left">Address</th>
                </>
              )}
             
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  {activeTab === 'customers' 
                    ? user.customerName || user.userId?.firstName || 'N/A'
                    : user.userId?.firstName || 'N/A'}
                </td>
                <td className="py-3 px-4">{user.customerEmailId || user.userId?.email || 'N/A'}</td>
                <td className="py-3 px-4">
                  {activeTab === 'customers' 
                    ? user.customerPhoneNumber || user.userId?.phone || 'N/A'
                    : activeTab === 'phoneCheckers'
                      ? user.phoneNumber || user.userId?.phone || 'N/A'
                      : activeTab === 'shopOwners'
                        ? user.phoneNumber || user.userId?.phone || 'N/A'
                        : user.userId?.phone || 'N/A'}
                </td>
                {activeTab === 'customers' && (
                  <>
                    
                    <td className="py-3 px-4">{user.customerAdhaarNumber || 'N/A'}</td>
                  </>
                )}
                {activeTab === 'phoneCheckers' && (
                  <>
                    <td className="py-3 px-4">{user.area || 'N/A'}</td>
                  
                  </>
                )}
                {activeTab === 'shopOwners' && (
                  <>
                    <td className="py-3 px-4">{user.shopDetails?.shopName || 'N/A'}</td>
                    <td className="py-3 px-4">{user.shopDetails?.address || 'N/A'}</td>
                  </>
                )}
             
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(user)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(user)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Tabs */}
      <div className="border-b">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-6 py-3 border-b-2 font-medium text-sm ${
              activeTab === 'customers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => setActiveTab('phoneCheckers')}
            className={`px-6 py-3 border-b-2 font-medium text-sm ${
              activeTab === 'phoneCheckers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Phone Checkers
          </button>
          <button
            onClick={() => setActiveTab('shopOwners')}
            className={`px-6 py-3 border-b-2 font-medium text-sm ${
              activeTab === 'shopOwners'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Shop Owners
          </button>
        </nav>
      </div>

      {/* Search and filters */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
            />
          </div>
          <div className="mt-3 sm:mt-0">
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* User table */}
      <div className="p-4">
        {renderUserTable()}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4 text-center">
            <div className="fixed inset-0 bg-black opacity-30"></div>
            <div className="bg-white rounded-lg text-left overflow-hidden shadow-xl w-full max-w-md z-50">
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <FiAlertCircle className="text-red-500 h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 text-center mb-4">Confirm Delete</h3>
                <p className="text-sm text-gray-500 mb-6 text-center">
                  Are you sure you want to delete {userToDelete?.userId?.name || 'this user'}? This action cannot be undone.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

  {/* Edit User Modal */}
  {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4 text-center">
            <div className="fixed inset-0 bg-black opacity-30"></div>
            <div className="bg-white rounded-lg text-left overflow-hidden shadow-xl w-full max-w-lg z-50">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
                <form onSubmit={handleEditSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  
                  {/* Additional fields for specific user types */}
                  {activeTab === 'shopOwners' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Shop Name</label>
                      <input
                        type="text"
                        name="shopName"
                        value={formData.shopName || editingUser?.shopName || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;