import React, { useState, useEffect } from 'react';
import {
  FaShieldAlt,
  FaMobile,
  FaCalendarAlt,
  FaRupeeSign,
  FaArrowRight,
  FaCheckCircle,
  FaTools,
  FaWrench,
  FaTimes
} from 'react-icons/fa';
import { MdScreenshot } from 'react-icons/md';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
import { load } from '@cashfreepayments/cashfree-js';

// Define the pricing tiers
const pricingTiers = [
  { range: '₹5,000 – ₹9,999', extendedWarranty1Year: 599, extendedWarranty2Year: 899, screenProtection1Year: 899 },
  { range: '₹10,000 – ₹14,999', extendedWarranty1Year: 699, extendedWarranty2Year: 999, screenProtection1Year: 999 },
  { range: '₹15,000 – ₹19,999', extendedWarranty1Year: 699, extendedWarranty2Year: 999, screenProtection1Year: 999 },
  { range: '₹20,000 – ₹24,999', extendedWarranty1Year: 799, extendedWarranty2Year: 1199, screenProtection1Year: 1399 },
  { range: '₹25,000 – ₹29,999', extendedWarranty1Year: 799, extendedWarranty2Year: 1199, screenProtection1Year: 1499 },
  { range: '₹30,000 – ₹34,999', extendedWarranty1Year: 899, extendedWarranty2Year: 1399, screenProtection1Year: 1599 },
  { range: '₹35,000 – ₹39,999', extendedWarranty1Year: 899, extendedWarranty2Year: 1399, screenProtection1Year: 1699 },
  { range: '₹40,000 – ₹44,999', extendedWarranty1Year: 999, extendedWarranty2Year: 1599, screenProtection1Year: 1599 },
  { range: '₹45,000 – ₹49,999', extendedWarranty1Year: 999, extendedWarranty2Year: 1599, screenProtection1Year: 1599 },
  { range: '₹50,000 – ₹59,999', extendedWarranty1Year: 999, extendedWarranty2Year: 1599, screenProtection1Year: 1499 },
  { range: '₹60,000 – ₹69,999', extendedWarranty1Year: 999, extendedWarranty2Year: 1599, screenProtection1Year: 1699 },
  { range: '₹70,000 – ₹74,999', extendedWarranty1Year: 999, extendedWarranty2Year: 1599, screenProtection1Year: 1899 },
  { range: '₹75,000 – ₹79,999', extendedWarranty1Year: 999, extendedWarranty2Year: 1599, screenProtection1Year: 1999 },
  { range: '₹80,000 – ₹99,999', extendedWarranty1Year: 1199, extendedWarranty2Year: 1799, screenProtection1Year: 2199 },
];

// Calculate daily price
const calculateDailyPrice = (price) => {
  return (price / 365).toFixed(2);
};

// Find the appropriate pricing tier
const findPricingTier = (devicePrice) => {
  const price = Number(devicePrice);

  // Find the first tier where the price falls within the range
  for (let i = 0; i < pricingTiers.length; i++) {
    const [min, max] = pricingTiers[i].range.replace(/₹|,/g, '').split('–').map(Number);
    if (price >= min && price <= max) {
      return pricingTiers[i];
    }
  }

  // If the price is higher than all tiers, return the highest tier
  return pricingTiers[pricingTiers.length - 1];
};

// Modal component for plans
const PlansModal = ({ isOpen, onClose, pricingTier, deviceName, devicePrice, purchaseDate, setSuccessData, setShowSuccessModal }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({ name: '', email: '', phone: '' });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [orderId, setOrderId] = useState('');


  if (!isOpen) return null;

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const getSessionId = async (amount, customerDetails, planType) => {
    try {
      const res = await axios.post(`${API_URL}/api/landing-payment/create-device-protection-order`, {
        amount,
        customerDetails,
        deviceName,
        planType, // <-- add this
      });
      if (res.data && res.data.payment_session_id) {
        console.log('Payment session initialized:', res.data);
        setOrderId(res.data.order_id);
        return { sessionId: res.data.payment_session_id, orderId: res.data.order_id };
      }
    } catch (error) {
      alert('Failed to initialize payment');
      throw error;
    }
  };

  let cashfree;
  const initializeSDK = async () => {
    if (!cashfree) {
      cashfree = await load({ mode: "production" });
    }
  };

  const handleCashfreePayment = async (planType, planPrice, setShowSuccessModal, setSuccessData) => {
    setPaymentLoading(true);
    try {
      await initializeSDK();
      const { sessionId, orderId } = await getSessionId(planPrice, customerDetails, planType);

      let checkoutOptions = {
        paymentSessionId: sessionId,
        redirectTarget: "_modal",
      };

      cashfree.checkout(checkoutOptions).then(async (res) => {
        setPaymentLoading(false);
        if (res.paymentDetails) {
          console.log(orderId)

          try {
            const response = await axios.post(`${API_URL}/api/landing-payment/add/direct-warranty`, {
              paymentOrderId: orderId,
              deviceDetails: {
                deviceName,
                purchaseDate, // Use current date as purchase date
                devicePrice: devicePrice.toString(),
              },
              customerDetails,
              planDetails: {
                planType: planType === 'screen' ? '1 Year Extented Warranty' : planType === 'warranty' ? '2 Year Extended Warranty' : '1 Year Screen Protection',
                planPrice: planPrice.toString(),
              },
            });
            console.log('Direct warranty added:', response.data);
            setSuccessData({
              orderId,
              deviceName,
              devicePrice,
              planType,
              planPrice,
              customerDetails,
            });
            setShowSuccessModal(true);
          } catch (error) {
            alert('Failed to add direct warranty');
            console.error('Error adding direct warranty:', error);
          }
          // onClose();
        }
      }).catch((err) => {
        setPaymentLoading(false);
        alert('Payment failed or cancelled.');
      });
    } catch (error) {
      setPaymentLoading(false);
      alert('Payment initialization failed.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-modal-appear">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-gray-800 flex justify-between items-center z-10">
          <div className="flex items-center">
            <div className="bg-purple-600 p-3 rounded-full">
              <FaShieldAlt className="text-white text-xl" />
            </div>
            <h2 className="text-2xl font-bold ml-4">Available Protection Plans</h2>
          </div>
          <button
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-700 rounded-full p-2 transition-colors"
          >
            <FaTimes className="text-gray-400 hover:text-white" size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="text-gray-300 mb-6">
            <p>Protection plans for <span className="font-bold text-white">{deviceName}</span> valued at <span className="font-bold text-white">₹{Number(devicePrice).toLocaleString()}</span></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Screen Protection Plan */}
            <div
              className={`bg-gray-800 border-2 rounded-xl overflow-hidden transition-all duration-300 ${selectedPlan === 'screen' ? 'border-blue-500 transform scale-[1.02]' : 'border-gray-700'}`}
              onClick={() => handlePlanSelect('screen')}
            >
              <div className="bg-gradient-to-r from-blue-900/50 to-blue-700/50 p-4 flex items-center">
                <div className="bg-blue-600 p-2 rounded-full">
                  <MdScreenshot className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold ml-3">1 Year Extended Warranty💠</h3>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-300">1-Year Coverage</span>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold mr-1">₹{pricingTier.extendedWarranty1Year}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400">Daily cost</span>
                  <span className="text-gray-300">₹{calculateDailyPrice(pricingTier.extendedWarranty1Year)}/day</span>
                </div>

                <p className="text-gray-400 text-sm mb-6">Covers screen cracks from accidental drops</p>

                <button
                  className={`w-full ${selectedPlan === 'screen' ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlanSelect('screen');
                  }}
                >
                  {selectedPlan === 'screen' ? (
                    <>
                      <FaCheckCircle className="mr-2" />
                      <span>Selected</span>
                    </>
                  ) : (
                    <span>Select Plan</span>
                  )}
                </button>
              </div>
            </div>

            {/* Extended Warranty Plan */}
            <div
              className={`bg-gray-800 border-2 rounded-xl overflow-hidden transition-all duration-300 ${selectedPlan === 'warranty' ? 'border-green-500 transform scale-[1.02]' : 'border-gray-700'}`}
              onClick={() => handlePlanSelect('warranty')}
            >
              <div className="bg-gradient-to-r from-green-900/50 to-green-700/50 p-4 flex items-center">
                <div className="bg-green-600 p-2 rounded-full">
                  <FaTools className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold ml-3">2 Year Extended Warranty 🔧</h3>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-300">2-Year Coverage</span>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold mr-1">₹{pricingTier.extendedWarranty2Year}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400">Daily cost</span>
                  <span className="text-gray-300">₹{calculateDailyPrice(pricingTier.extendedWarranty2Year)}/day</span>
                </div>

                <p className="text-gray-400 text-sm mb-6">Covers hardware failure post manufacturer warranty</p>

                <button
                  className={`w-full ${selectedPlan === 'warranty' ? 'bg-green-600' : 'bg-gray-700'} hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlanSelect('warranty');
                  }}
                >
                  {selectedPlan === 'warranty' ? (
                    <>
                      <FaCheckCircle className="mr-2" />
                      <span>Selected</span>
                    </>
                  ) : (
                    <span>Select Plan</span>
                  )}
                </button>
              </div>
            </div>

            {/* Full Protection Plan */}
            <div
              className={`bg-gray-800 border-2 rounded-xl overflow-hidden transition-all duration-300 ${selectedPlan === 'full' ? 'border-purple-500 transform scale-[1.02]' : 'border-gray-700'}`}
              onClick={() => handlePlanSelect('full')}
            >
              <div className="bg-gradient-to-r from-purple-900/50 to-purple-700/50 p-4 flex items-center">
                <div className="bg-purple-600 p-2 rounded-full">
                  <FaShieldAlt className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold ml-3">1 Year Screen Protection 🛡️</h3>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-300">1-Year Coverage</span>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold mr-1">₹{pricingTier.screenProtection1Year}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400">Daily cost</span>
                  <span className="text-gray-300">₹{calculateDailyPrice(pricingTier.screenProtection1Year)}/day</span>
                </div>

                <p className="text-gray-400 text-sm mb-6">Covers theft, accidental & liquid damage</p>

                <button
                  className={`w-full ${selectedPlan === 'full' ? 'bg-purple-600' : 'bg-gray-700'} hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlanSelect('full');
                  }}
                >
                  {selectedPlan === 'full' ? (
                    <>
                      <FaCheckCircle className="mr-2" />
                      <span>Selected</span>
                    </>
                  ) : (
                    <span>Select Plan</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-gray-800 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">Plan Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4">Coverage</th>
                    <th className="text-center py-3 px-4 text-blue-400">1 Year Extended Warranty</th>
                    <th className="text-center py-3 px-4 text-green-400">2 Year Extended Warranty</th>
                    <th className="text-center py-3 px-4 text-purple-400">1 Year Screen Protection</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="py-3 px-4">Screen Damage</td>
                    <td className="text-center py-3 px-4">✅</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4">✅</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3 px-4">Hardware Failure</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4">✅</td>
                    <td className="text-center py-3 px-4">❌</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3 px-4">Liquid Damage</td>
                    <td className="text-center py-3 px-4">✅</td>
                    <td className="text-center py-3 px-4">✅</td>
                    <td className="text-center py-3 px-4">❌</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Theft Protection</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4">❌</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {selectedPlan && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 animate-fadeIn">
              <h3 className="text-xl font-bold mb-4">Complete Your Purchase</h3>
              <p className="text-gray-300 mb-6">
                You've selected the {selectedPlan === 'screen' ? '1 Year Extended Warranty' : selectedPlan === 'warranty' ? '2 Year Extended Warranty' : '1 Year Screen Protection'} plan for your {deviceName}.
              </p>
              {/* Customer Details Form */}
              {!showCustomerForm ? (
                <button
                  onClick={() => setShowCustomerForm(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                >
                  Proceed to Customer Details
                </button>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    // Get the plan price
                    const planPrice = selectedPlan === 'screen'
                      ? pricingTier.extendedWarranty1Year
                      : selectedPlan === 'warranty'
                        ? pricingTier.extendedWarranty2Year
                        : pricingTier.screenProtection1Year;
                    await handleCashfreePayment(selectedPlan, planPrice, setShowSuccessModal, setSuccessData);
                  }}
                  className="space-y-4"
                >
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
                    value={customerDetails.name}
                    onChange={e => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
                    value={customerDetails.email}
                    onChange={e => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
                    value={customerDetails.phone}
                    onChange={e => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                  />
                  <button
                    type="submit"
                    disabled={paymentLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                  >
                    {paymentLoading ? 'Processing Payment...' : 'Pay Now'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

const DeviceProtectionForm = () => {
  const [formData, setFormData] = useState({
    deviceName: '',
    purchaseDate: '',
    devicePrice: '',
  });

  const [showModal, setShowModal] = useState(false);
  const [pricingTier, setPricingTier] = useState(null);
  const [formError, setFormError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const onClose = () =>{
    setShowSuccessModal(false);
    setSuccessData(null);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Form validation
    if (!formData.deviceName || !formData.purchaseDate || !formData.devicePrice) {
      setFormError('Please fill in all fields');
      return;
    }

    if (isNaN(formData.devicePrice) || Number(formData.devicePrice) <= 0) {
      setFormError('Please enter a valid device price');
      return;
    }

    setFormError('');
    const tier = findPricingTier(formData.devicePrice);
    setPricingTier(tier);
    setShowModal(true);
  };

  const SuccessModal = ({ data, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full shadow-xl border-2 border-green-600 animate-modal-appear">
        <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center">
          <FaCheckCircle className="mr-2" /> Payment Successful!
        </h2>
        <div className="mb-4">
          <div className="mb-2 text-yellow-300 font-semibold">
            Order ID: <span className="break-all">{data.orderId}</span>
          </div>
          <div className="text-xs text-yellow-400 mb-4">
            <b>Note:</b> Please note down your Order ID for future reference.
          </div>
          <div className="mb-2">
            <span className="font-semibold text-gray-200">Device:</span> {data.deviceName} (₹{data.devicePrice})
          </div>
          <div className="mb-2">
            <span className="font-semibold text-gray-200">Plan:</span> {data.planType === 'screen' ? '1 Year Extended Warranty' : data.planType === 'warranty' ? '2 Year Extended Warranty' : '1 Year Screen Protection'} (₹{data.planPrice})
          </div>
          <div className="mb-2">
            <span className="font-semibold text-gray-200">Customer:</span> {data.customerDetails.name}
          </div>
          <div className="mb-2">
            <span className="font-semibold text-gray-200">Email:</span> {data.customerDetails.email}
          </div>
          <div className="mb-2">
            <span className="font-semibold text-gray-200">Phone:</span> {data.customerDetails.phone}
          </div>
        </div>
        <button
          onClick={() => {
            setShowSuccessModal(false);
            onClose();
          }}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 mt-4"
        >
          Close
        </button>
      </div>
    </div>
  );

  // Animation for the form appearance
  useEffect(() => {
    const formElement = document.getElementById('device-form');
    const imageElement = document.getElementById('device-image');

    if (formElement) {
      formElement.classList.add('form-appear');
    }

    if (imageElement) {
      imageElement.classList.add('image-appear');
    }
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black text-white min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Protect Your Device
          </h1>
          <p className="text-xl text-gray-300">
            Enter your device details to find the perfect protection plan
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Image Section */}
          <div
            id="device-image"
            className="relative h-auto flex items-center justify-center opacity-0"
          >
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-lg opacity-75"></div>
              <div className="relative bg-gray-800 rounded-3xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1567&q=80"
                  alt="Protected smartphone"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold mb-2">Complete Protection</h3>
                  <p className="text-gray-300">
                    Safeguard your device against accidents, damage, and hardware failures
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <span className="bg-blue-900/50 text-blue-300 text-xs font-medium px-3 py-1 rounded-full border border-blue-800">
                      Screen Protection
                    </span>
                    <span className="bg-green-900/50 text-green-300 text-xs font-medium px-3 py-1 rounded-full border border-green-800">
                      Extended Warranty
                    </span>
                    <span className="bg-purple-900/50 text-purple-300 text-xs font-medium px-3 py-1 rounded-full border border-purple-800">
                      Full Coverage
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements for visual interest */}
            <div className="absolute top-10 left-10 bg-blue-500 w-16 h-16 rounded-full blur-xl opacity-20"></div>
            <div className="absolute bottom-10 right-10 bg-purple-500 w-20 h-20 rounded-full blur-xl opacity-20"></div>
          </div>

          {/* Form Section */}
          <div
            id="device-form"
            className="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-xl opacity-0 transition-all duration-700"
          >
            <div className="flex items-center mb-6">
              <div className="bg-blue-600 p-3 rounded-full">
                <FaMobile className="text-white text-xl" />
              </div>
              <h2 className="text-2xl font-bold ml-4">Device Details</h2>
            </div>

            {formError && (
              <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-300 mb-2 font-medium">
                  <div className="flex items-center">
                    <FaMobile className="mr-2" />
                    Device Name
                  </div>
                </label>
                <input
                  type="text"
                  name="deviceName"
                  value={formData.deviceName}
                  onChange={handleChange}
                  placeholder="e.g. iPhone 13 Pro"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-300 mb-2 font-medium">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    Purchase Date
                  </div>
                </label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="mb-8">
                <label className="block text-gray-300 mb-2 font-medium">
                  <div className="flex items-center">
                    <FaRupeeSign className="mr-2" />
                    Device Price (₹)
                  </div>
                </label>
                <input
                  type="number"
                  name="devicePrice"
                  value={formData.devicePrice}
                  onChange={handleChange}
                  placeholder="e.g. 25000"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center"
              >
                <span>View Protection Plans</span>
                <FaArrowRight className="ml-2" />
              </button>
            </form>

            {/* Trust indicators */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <p className="text-gray-400 text-sm mb-4 text-center">Trusted by thousands of customers across India</p>
              <div className="flex justify-center space-x-6">
                <div className="flex items-center">
                  <FaShieldAlt className="text-blue-500 mr-2" />
                  <span className="text-gray-300 text-sm">Secure</span>
                </div>
                <div className="flex items-center">
                  <FaTools className="text-green-500 mr-2" />
                  <span className="text-gray-300 text-sm">Reliable</span>
                </div>
                <div className="flex items-center">
                  <FaWrench className="text-purple-500 mr-2" />
                  <span className="text-gray-300 text-sm">Fast Service</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-600 p-2 rounded-full">
                <FaShieldAlt className="text-white" />
              </div>
              <h3 className="text-xl font-bold ml-3">Complete Coverage</h3>
            </div>
            <p className="text-gray-300">
              Our protection plans cover all types of damages, from screen cracks to liquid damage and hardware failures.
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-600 p-2 rounded-full">
                <FaTools className="text-white" />
              </div>
              <h3 className="text-xl font-bold ml-3">Quick Repairs</h3>
            </div>
            <p className="text-gray-300">
              Get your device repaired quickly with our network of authorized service centers across the country.
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="bg-purple-600 p-2 rounded-full">
                <FaWrench className="text-white" />
              </div>
              <h3 className="text-xl font-bold ml-3">Easy Claims</h3>
            </div>
            <p className="text-gray-300">
              Our simple claims process ensures you get your device fixed or replaced with minimal hassle.
            </p>
          </div>
        </div>
      </div>

      {/* Modal for plans */}
      <PlansModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        pricingTier={pricingTier}
        deviceName={formData.deviceName}
        devicePrice={formData.devicePrice}
        purchaseDate={formData.purchaseDate}
        setShowSuccessModal={setShowSuccessModal}
        setSuccessData={setSuccessData}
      />

      {showSuccessModal && successData && (
        <SuccessModal data={successData} onClose={onClose} />)}

      <style jsx>{`
        .form-appear {
          animation: formAppear 0.7s forwards;
        }
        
        .image-appear {
          animation: imageAppear 0.7s 0.3s forwards;
        }
        
        @keyframes formAppear {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes imageAppear {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s forwards;
        }
        
        @keyframes modal-appear {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-modal-appear {
          animation: modal-appear 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default DeviceProtectionForm;