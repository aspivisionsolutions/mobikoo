import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiArrowLeft } from 'react-icons/fi';
import InspectionReportDetails from '../components/InspectionReportDetails';

const InspectionReportView = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/inspection/reports/${reportId}`, {
          headers: {
            Authorization: `${localStorage.getItem('token')}`
          }
        });
        setReport(response.data);
      } catch (error) {
        toast.error('Failed to fetch report details');
        console.error('Error fetching report:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Report not found</h2>
        <p className="mt-2 text-gray-600">The inspection report you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <FiArrowLeft className="mr-2 -ml-1 h-5 w-5" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiArrowLeft className="mr-2 -ml-1 h-5 w-5" />
            Back
          </button>
        </div>
        <InspectionReportDetails report={report} />
      </div>
    </div>
  );
};

export default InspectionReportView;