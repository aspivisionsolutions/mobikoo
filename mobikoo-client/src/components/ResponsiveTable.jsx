import React from 'react';

const ResponsiveTable = ({ headers, data, renderRow }) => {
  return (
    <div className="overflow-x-auto">
      {/* Desktop and Tablet View */}
      <table className="hidden sm:table min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => renderRow(item, index, 'desktop'))}
        </tbody>
      </table>

      {/* Mobile View */}
      <div className="sm:hidden space-y-4">
        {data.map((item, index) => (
          <div key={index} className="bg-white shadow rounded-lg p-4 space-y-3">
            {headers.map((header, headerIndex) => (
              <div key={headerIndex} className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-500">{header.label}:</span>
                <span className="text-sm text-gray-900 text-right ml-2">
                  {header.format ? header.format(item[header.key]) : item[header.key]}
                </span>
              </div>
            ))}
            {renderRow(item, index, 'mobile')}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResponsiveTable; 