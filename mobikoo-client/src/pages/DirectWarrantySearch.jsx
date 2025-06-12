import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function DirectWarrantySearch() {
  const [phone, setPhone] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setError("");
    setResults([]);
    if (!phone) {
      setError("Please enter a phone number.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/landing-payment/get/direct-warranties/by-phone?phone=${phone}`);
      setResults(res.data);
      if (res.data.length === 0) setError("No warranties found for this phone number.");
    } catch (err) {
      setError("Error fetching warranties.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">Search Your Direct Warranties</h1>
      <div className="flex gap-2 mb-6 w-full max-w-md">
        <input
          type="text"
          placeholder="Enter your phone number"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="flex-1 px-4 py-2 rounded bg-gray-800 border border-gray-600 text-white"
        />
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 font-semibold"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {results.length > 0 && (
        <div className="w-full max-w-3xl mt-6">
          <table className="w-full bg-gray-900 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-3 text-left">Device Name</th>
                <th className="p-3 text-left">Purchase Date</th>
                <th className="p-3 text-left">Plan Type</th>
                <th className="p-3 text-left">Plan Price</th>
                <th className="p-3 text-left">Order ID</th>
              </tr>
            </thead>
            <tbody>
              {results.map((w, idx) => (
                <tr key={w._id || idx} className="border-t border-gray-700">
                  <td className="p-3">{w.deviceDetails?.deviceName}</td>
                  <td className="p-3">{w.deviceDetails?.purchaseDate}</td>
                  <td className="p-3">{w.planDetails?.planType}</td>
                  <td className="p-3">{w.planDetails?.planPrice}</td>
                  <td className="p-3">{w.paymentOrderId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DirectWarrantySearch;