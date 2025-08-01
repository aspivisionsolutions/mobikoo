
import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, X, Save, RotateCcw, DollarSign } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const API_URL = import.meta.env.VITE_API_URL;

const DirectWarrantyPlansManagement = () => {
  const [plans, setPlans] = useState([]);
  const [formData, setFormData] = useState({
    startRange: '',
    endRange: '',
    extendedWarranty1Year: '',
    extendedWarranty2Year: '',
    screenProtection1Year: '',
  });
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);


    useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/direct-warranty`);
        setPlans(response.data);
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast.error('Failed to fetch plans');
      }
    };

    fetchPlans();
  }, []);


  const showToast = (message, type = 'info') => {
    // Mock toast implementation
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const formatRange = (start, end) => {
    return `₹${parseInt(start).toLocaleString()} – ₹${parseInt(end).toLocaleString()}`;
  };

  const formatCurrency = (amount) => {
    return `₹${parseInt(amount).toLocaleString()}`;
  };

  const validateForm = () => {
    const { startRange, endRange, extendedWarranty1Year, extendedWarranty2Year, screenProtection1Year } = formData;
    
    if (!startRange || !endRange || !extendedWarranty1Year || !extendedWarranty2Year || !screenProtection1Year) {
        toast.info('All fields are required', 'error');
      return false;
    }
    
    if (parseInt(startRange) >= parseInt(endRange)) {
      toast.info('End range must be greater than start range', 'error');
      return false;
    }
    
    return true;
  };

  const handleAddPlan = async () => {

    if (!validateForm()) return;

    try {
      const formattedRange = formatRange(formData.startRange, formData.endRange);
      const response = await axios.post(`${API_URL}/api/direct-warranty`, {
        range: formattedRange,
        extendedWarranty1Year: formData.extendedWarranty1Year,
        extendedWarranty2Year: formData.extendedWarranty2Year,
        screenProtection1Year: formData.screenProtection1Year,
      });
      setPlans([...plans, response.data]);
      setFormData({
        startRange: '',
        endRange: '',
        extendedWarranty1Year: '',
        extendedWarranty2Year: '',
        screenProtection1Year: '',
      });
      toast.success('Plan added successfully');
    } catch (error) {
      console.error('Error adding plan:', error);
      toast.error('Failed to add plan');
    }
  };

  const handleEditPlan = async () => {

    if (!validateForm()) return;

    try {
      const formattedRange = formatRange(formData.startRange, formData.endRange);
      const response = await axios.put(`${API_URL}/api/direct-warranty/${editingPlanId}`, {
        range: formattedRange,
        extendedWarranty1Year: formData.extendedWarranty1Year,
        extendedWarranty2Year: formData.extendedWarranty2Year,
        screenProtection1Year: formData.screenProtection1Year,
      });
      setPlans(plans.map((plan) => (plan._id === editingPlanId ? response.data : plan)));
      setEditingPlanId(null);
      setFormData({
        startRange: '',
        endRange: '',
        extendedWarranty1Year: '',
        extendedWarranty2Year: '',
        screenProtection1Year: '',
      });
      setIsEditModalOpen(false);
      toast.success('Plan updated successfully');
    } catch (error) {
      console.error('Error editing plan:', error);
      toast.error('Failed to update plan');
    }
  };

   const handleDeletePlan = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/direct-warranty/${id}`);
      setPlans(plans.filter((plan) => plan._id !== id));
      toast.success('Plan deleted successfully');
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to delete plan');
    }
  };

  const openEditModal = (plan) => {
    const rangeMatch = plan.range.match(/₹([\d,]+)\s*–\s*₹([\d,]+)/);
    if (rangeMatch) {
      const startRange = rangeMatch[1].replace(/,/g, '');
      const endRange = rangeMatch[2].replace(/,/g, '');
      
      setFormData({
        startRange,
        endRange,
        extendedWarranty1Year: plan.extendedWarranty1Year,
        extendedWarranty2Year: plan.extendedWarranty2Year,
        screenProtection1Year: plan.screenProtection1Year,
      });
    }
    setEditingPlanId(plan._id);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingPlanId(null);
    setFormData({
      startRange: '',
      endRange: '',
      extendedWarranty1Year: '',
      extendedWarranty2Year: '',
      screenProtection1Year: '',
    });
  };

  const handleClearForm = () => {
    setFormData({
      startRange: '',
      endRange: '',
      extendedWarranty1Year: '',
      extendedWarranty2Year: '',
      screenProtection1Year: '',
    });
    showToast('Form cleared', 'info');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Add Plan Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Plan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Range (₹)</label>
              <input
                type="number"
                name="startRange"
                placeholder="10000"
                value={formData.startRange}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Range (₹)</label>
              <input
                type="number"
                name="endRange"
                placeholder="20000"
                value={formData.endRange}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">1Y Extended Warranty (₹)</label>
              <input
                type="number"
                name="extendedWarranty1Year"
                placeholder="1500"
                value={formData.extendedWarranty1Year}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">2Y Extended Warranty (₹)</label>
              <input
                type="number"
                name="extendedWarranty2Year"
                placeholder="2500"
                value={formData.extendedWarranty2Year}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">1Y Screen Protection (₹)</label>
              <input
                type="number"
                name="screenProtection1Year"
                placeholder="800"
                value={formData.screenProtection1Year}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleAddPlan}
              disabled={loading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              {loading ? 'Adding...' : 'Add Plan'}
            </button>
            
            <button
              onClick={handleClearForm}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Clear Form
            </button>
          </div>
        </div>

        {/* Plans Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Current Plans</h2>
            <p className="text-sm text-gray-600 mt-1">{plans.length} plan{plans.length !== 1 ? 's' : ''} configured</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Range</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">1Y Extended</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">2Y Extended</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">1Y Screen Protection</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plans.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <DollarSign className="w-12 h-12 text-gray-300 mb-2" />
                        <p>No warranty plans configured yet.</p>
                        <p className="text-sm">Add your first plan above to get started.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  plans.map((plan, index) => (
                    <tr key={plan._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{plan.range}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(plan.extendedWarranty1Year)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(plan.extendedWarranty2Year)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(plan.screenProtection1Year)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(plan)}
                            className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePlan(plan._id)}
                            className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-[#000000b5] bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Edit Warranty Plan</h3>
                <button
                  onClick={closeEditModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Range (₹)</label>
                  <input
                    type="number"
                    name="startRange"
                    placeholder="Start Range"
                    value={formData.startRange}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Range (₹)</label>
                  <input
                    type="number"
                    name="endRange"
                    placeholder="End Range"
                    value={formData.endRange}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">1 Year Extended Warranty (₹)</label>
                  <input
                    type="number"
                    name="extendedWarranty1Year"
                    placeholder="1 Year Extended Warranty"
                    value={formData.extendedWarranty1Year}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">2 Year Extended Warranty (₹)</label>
                  <input
                    type="number"
                    name="extendedWarranty2Year"
                    placeholder="2 Year Extended Warranty"
                    value={formData.extendedWarranty2Year}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">1 Year Screen Protection (₹)</label>
                  <input
                    type="number"
                    name="screenProtection1Year"
                    placeholder="1 Year Screen Protection"
                    value={formData.screenProtection1Year}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditPlan}
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

    </div>
  );
};

export default DirectWarrantyPlansManagement;