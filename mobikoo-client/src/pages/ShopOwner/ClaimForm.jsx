import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiArrowRight, FiCheck, FiUpload, FiX } from 'react-icons/fi';
const API_URL = import.meta.env.VITE_API_URL;

const ClaimForm = ({ onSubmit, onCancel, isSubmitting, setIsSubmitting }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    selectedDevice: '',
    description: '',
    claimAmount: '',  // <-- Added claimAmount to formData
    photos: []
  });
  const [errors, setErrors] = useState({});
  const [customerDevices, setCustomerDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const fetchCustomerDevices = async (phoneNumber) => {
    // Reset previous data and errors
    setCustomerDevices([]);
    setApiError(null);
    setIsLoading(true);
    
    try {
      // Format the phone number (remove spaces and any non-digit characters except +)
      const formattedPhone = phoneNumber.replace(/[^\d+]/g, '');
      
      // Make the API request to fetch customer devices
      const response = await fetch(`${API_URL}/api/user/devices/${encodeURIComponent(formattedPhone)}`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Customer devices:', data);
      
      // Check if the API returned devices
      if (data && Array.isArray(data)) {
        setCustomerDevices(data);
      } else {
        setCustomerDevices([]);
      }
    } catch (error) {
      console.error('Error fetching customer devices:', error);
      setApiError('Failed to fetch customer devices. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map(file => ({
      file,  // Store the file object
      preview: URL.createObjectURL(file),
      name: file.name,
    }));
  
    setFormData(prevData => ({
      ...prevData,
      photos: [...prevData.photos, ...newPhotos], // Append new images
    }));
  };
  

  const removePhoto = (index) => {
    const newPhotos = [...formData.photos];
    URL.revokeObjectURL(newPhotos[index].preview);
    newPhotos.splice(index, 1);
    
    setFormData({
      ...formData,
      photos: newPhotos
    });
  };

  const validateStep = () => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!formData.customerName) newErrors.customerName = 'Customer name is required';
      if (!formData.customerPhone) newErrors.customerPhone = 'Phone number is required';
      else if (!/^(\+\d{1,3})?\s?\d{10}$/.test(formData.customerPhone)) 
        newErrors.customerPhone = 'Enter a valid phone number';
      
      if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail))
        newErrors.customerEmail = 'Enter a valid email address';
    }
    
    if (currentStep === 2) {
      if (!formData.selectedDevice) newErrors.selectedDevice = 'Please select a device';
    }
    
    if (currentStep === 3) {
      if (!formData.description) newErrors.description = 'Description is required';
      if (!formData.claimAmount) newErrors.claimAmount = 'Claim amount is required';  // <-- Validation for claimAmount
      else if (isNaN(formData.claimAmount) || Number(formData.claimAmount) <= 0)
        newErrors.claimAmount = 'Enter a valid claim amount';
      if (formData.photos.length === 0) newErrors.photos = 'At least one photo is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      if (currentStep === 1) {
        // Fetch customer devices when moving to step 2
        fetchCustomerDevices(formData.customerPhone);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    
    setIsSubmitting(true);

    const formDataToSend = new FormData();
  
    // Append text fields
    formDataToSend.append('customerName', formData.customerName);
    formDataToSend.append('customerPhone', formData.customerPhone);
    formDataToSend.append('customerEmail', formData.customerEmail);
    formDataToSend.append('selectedDevice', formData.selectedDevice);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('claimAmount', formData.claimAmount);
  
    // Append images (one by one)
    formData.photos.forEach((photo, index) => {
      formDataToSend.append(`photos`, photo.file); 
    });
  
    onSubmit(formDataToSend);
  };

  // Reset device selection when going back to step 1
  useEffect(() => {
    if (currentStep === 1) {
      setFormData(prevData => ({
        ...prevData,
        selectedDevice: ''
      }));
      setCustomerDevices([]);
    }
  }, [currentStep]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-6 text-center">Device Claim Form</h2>
      
      {/* Progress indicator */}
      <div className="flex justify-between items-center mb-8">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
          1
        </div>
        <div className={`h-1 flex-1 mx-2 ${currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
          2
        </div>
        <div className={`h-1 flex-1 mx-2 ${currentStep >= 3 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 3 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
          3
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Step 1: Customer Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Customer Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.customerName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter full name"
              />
              {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.customerPhone ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="+1 2345678900"
              />
              {errors.customerPhone && <p className="text-red-500 text-xs mt-1">{errors.customerPhone}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.customerEmail ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="email@example.com"
              />
              {errors.customerEmail && <p className="text-red-500 text-xs mt-1">{errors.customerEmail}</p>}
            </div>
          </div>
        )}
        
        {/* Step 2: Device Selection */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Select Device</h3>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="loader animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : apiError ? (
              <div className="text-center py-8">
                <p className="text-red-500">{apiError}</p>
                <button
                  type="button"
                  onClick={prevStep}
                  className="mt-4 px-4 py-2 text-blue-600 underline"
                >
                  Go back and check customer details
                </button>
              </div>
            ) : customerDevices.length > 0 ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">Select the device you want to claim for:</p>
                <div className="space-y-2">
                  {customerDevices.map(device => (
                    <div 
                      key={device.id}
                      className={`border rounded-md p-3 cursor-pointer ${formData.selectedDevice === device._id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                      onClick={() => setFormData({...formData, selectedDevice: device._id})}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{device.deviceModel}</span>
                        <span className="text-sm text-gray-500">Purchased: {new Date(device.purchaseDate).toLocaleDateString()}</span>
                      </div>
                      <div className="text-sm text-gray-500">IMEI: {device.imeiNumber}</div>
                    </div>
                  ))}
                </div>
                {errors.selectedDevice && <p className="text-red-500 text-xs mt-1">{errors.selectedDevice}</p>}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No devices found for this customer.</p>
                <button
                  type="button"
                  onClick={prevStep}
                  className="mt-4 px-4 py-2 text-blue-600 underline"
                >
                  Go back and check customer details
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Step 3: Claim Details */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Claim Details</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description of Issue
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Describe the issue with your device"
              ></textarea>

              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Claim Amount (INR)
              </label>
              <input
                type="number"
                name="claimAmount"
                value={formData.claimAmount}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.claimAmount ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter claim amount"
              />
              {errors.claimAmount && <p className="text-red-500 text-xs mt-1">{errors.claimAmount}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Photos
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md relative">
                <div className="space-y-1 text-center">
                  <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload files</span>
                      <input
                        id="file-upload"
                        name="file-upload" 
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        multiple
                        accept="image/*"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                </div>
              </div>
              {errors.photos && <p className="text-red-500 text-xs mt-1">{errors.photos}</p>}
              
              {/* Photo preview */}
              {formData.photos.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo.preview}
                        alt={`Preview ${index}`}
                        className="h-24 w-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        <FiX size={14} />
                      </button>
                      <p className="text-xs truncate mt-1">{photo.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <FiArrowLeft className="mr-2" />
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <FiX className="mr-2" />
              Cancel
            </button>
          )}
          
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
            >
              Next
              <FiArrowRight className="ml-2" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
            >
              Submit Claim
              <FiCheck className="ml-2" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ClaimForm;