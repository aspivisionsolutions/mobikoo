import React from 'react';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const WarrantyDetails = ({ warranty, onClose }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900">{warranty.inspectionReport.deviceModel}</h2>
            <p className="text-sm text-gray-500">Warranty Plan: {warranty.warrantyPlanId.planName}</p>
            <p className="text-sm text-gray-500">Issued on: {formatDate(warranty.inspectionReport.inspectionDate)}</p>
            <p className="text-sm text-gray-500">Status: {warranty.inspectionReport.warrantyStatus}</p>

            <div className="mt-4">
                <h3 className="text-lg font-medium">Inspector Details</h3>
                <p>Name: {warranty.inspectionReport.inspectorId.firstName} {warranty.inspectionReport.inspectorId.lastName}</p>
                <p>Email: {warranty.inspectionReport.inspectorId.email}</p>
            </div>

            <div className="mt-4">
                <h3 className="text-lg font-medium">Coverage Details</h3>
                <p>{warranty.warrantyPlanId.coverageDetails}</p>
            </div>

            <div className="flex items-center justify-end mt-4">
                <button onClick={onClose} className="px-4 py-2 bg-blue-500 text-white rounded">Close</button>
            </div>
        </div>
    );
};

export default WarrantyDetails; 