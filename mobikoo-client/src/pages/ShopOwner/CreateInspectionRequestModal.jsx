import React, { useState } from 'react';
import axios from 'axios';
import { FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CreateInspectionRequestModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [area, setArea] = useState('');
  const [inspectors, setInspectors] = useState([]);
  const [selectedInspector, setSelectedInspector] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInspectors, setIsLoadingInspectors] = useState(false);

  const fetchInspectors = async (selectedArea) => {
    setIsLoadingInspectors(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/user/phone-checkers/${encodeURIComponent(selectedArea)}`, {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      });
      console.log(response.data);
      setInspectors(response.data);
      if (response.data.length === 0) {
        toast.error('No phone checkers available in this area');
      }
    } catch (error) {
      console.error('Error fetching inspectors:', error);
      toast.error('Failed to fetch available inspectors');
      setInspectors([]);
    } finally {
      setIsLoadingInspectors(false);
    }
  };

  const handleNext = async () => {
    if (step === 1 && area.trim()) {
      await fetchInspectors(area.trim());
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!area || !selectedInspector) return;

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/inspection/create', {
        area,
        inspectorId: selectedInspector.userId._id,
        inspectorEmail: selectedInspector.userId.email
      }, {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      });

      onSuccess(response.data);
      onClose();
      setStep(1);
      setArea('');
      setSelectedInspector(null);
      setInspectors([]);
    } catch (error) {
      console.error('Error creating inspection request:', error);
      toast.error('Failed to create inspection request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setArea('');
    setSelectedInspector(null);
    setInspectors([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Create Inspection Request
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Enter Area
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Enter your area (e.g., Koramangala, Bangalore)"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Please enter your complete area name to find available inspectors
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                disabled={!area.trim()}
                className={`px-4 py-2 rounded-md text-white ${
                  area.trim()
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Inspector
              </label>
              {isLoadingInspectors ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : inspectors.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No inspectors available in this area
                </div>
              ) : (
                <div className="space-y-2">
                  {inspectors.map(inspector => (
                    <div
                      key={inspector._id}
                      onClick={() => setSelectedInspector(inspector)}
                      className={`p-3 border rounded-md cursor-pointer ${
                        selectedInspector?._id === inspector._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-500'
                      }`}
                    >
                      <p className="font-medium text-gray-900">{inspector.userId.firstName} {inspector.userId.lastName}</p>
                      <p className="text-sm text-gray-500">{inspector.userId.email}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedInspector || isLoading}
                className={`px-4 py-2 rounded-md text-white ${
                  selectedInspector && !isLoading
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Creating...' : 'Create Request'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateInspectionRequestModal; 