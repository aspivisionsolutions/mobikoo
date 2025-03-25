import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiPhone, FiMail, FiHash, FiShield, FiCheckCircle, FiHome, FiFileText, FiArrowLeft, FiSmartphone, FiBattery, FiImage } from 'react-icons/fi';

const ClaimDetails = ({ claim }) => {
  const navigate = useNavigate();
  useEffect(() => {
    fetchShopDetails();
    }, []);
    
    const fetchShopDetails = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/user/shop-owner', {
          headers: { Authorization: `${localStorage.getItem('token')}` }
        });
        
        if (response.data.shopprofile && response.data.shopprofile.length > 0) {
          const profile = response.data.shopprofile[0];
          setShopDetails({
            shopName: profile.shopDetails?.shopName,
            address: profile.shopDetails?.address,
            mobileNumber: profile.phoneNumber
          });
        } else {
          setShopDetails(null);
        }
      } catch (error) {
        console.error('Error fetching shop details:', error);
        setShopDetails(null);
      }
    };
    const isShopDetailsComplete = () => {
      return shopDetails && 
             shopDetails.shopName && 
             shopDetails.mobileNumber && 
             shopDetails.address;
    };
    if (!isShopDetailsComplete()) {
      return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <Typography variant="h5" component="div" gutterBottom>
            Please complete your shop profile to view invoices.
          </Typography>
          <Typography variant="body1" component="div" gutterBottom>
            Go to your profile settings to complete the missing information.
          </Typography>
        </div>
      );
    }
  if (!claim) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Claim not found</h2>
        <p className="mt-2 text-gray-600">The claim details you're looking for don't exist.</p>
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

  const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center py-3 border-b last:border-b-0">
      <div className="flex items-center w-1/3">
        <Icon className="h-5 w-5 text-gray-400 mr-2" />
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <div className="w-2/3">
        <span className="text-sm text-gray-900">{value || "N/A"}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Claim Details</h2>
        <DetailRow icon={FiUser} label="Customer Name" value={claim.customerDetails.customerName} />
        <DetailRow icon={FiPhone} label="Phone" value={claim.customerDetails.customerPhoneNumber} />
        <DetailRow icon={FiMail} label="Email" value={claim.customerDetails.customerEmailId} />
        <DetailRow icon={FiHash} label="Aadhaar Number" value={claim.customerDetails.customerAdhaarNumber} />
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Device Information</h3>
        <DetailRow icon={FiSmartphone} label="Device Model" value={claim.deviceDetails.deviceModel} />
        <DetailRow icon={FiHash} label="IMEI Number" value={claim.deviceDetails.imeiNumber} />
        <DetailRow icon={FiHash} label="Serial Number" value={claim.deviceDetails.serialNumber} />
        <DetailRow icon={FiCheckCircle} label="Screen Condition" value={claim.deviceDetails.screenCondition} />
        <DetailRow icon={FiBattery} label="Battery Health" value={claim.deviceDetails.batteryHealth} />
        <DetailRow icon={FiShield} label="Warranty Plan" value={claim.deviceDetails.warrantyDetails.warrantyPlanId.planName} />
        <DetailRow icon={FiShield} label="Warranty Duration" value={`${claim.deviceDetails.warrantyDetails.warrantyPlanId.durationMonths} months`} />
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Shop Details</h3>
        <DetailRow icon={FiHome} label="Shop Name" value={claim.shopOwner.shopDetails.shopName} />
        <DetailRow icon={FiFileText} label="Shop Address" value={claim.shopOwner.shopDetails.address} />
        <DetailRow icon={FiPhone} label="Shop Phone" value={claim.shopOwner.phoneNumber} />
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Claim Photos</h3>
        <div className="grid grid-cols-2 gap-4">
          {claim.photos && claim.photos.length > 0 ? (
            claim.photos.map((photo, index) => (
              <img key={index} src={photo} alt={`Claim Photo ${index + 1}`} className="rounded-lg shadow w-full h-48 object-cover" />
            ))
          ) : (
            <p className="text-sm text-gray-500">No photos available</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Details</h3>
        <DetailRow icon={FiCheckCircle} label="Claim Status" value={claim.claimStatus} />
        <DetailRow icon={FiFileText} label="Description" value={claim.description} />
        <DetailRow icon={FiFileText} label="Submission Date" value={new Date(claim.claimSubmissionDate).toLocaleDateString()} />
      </div>
    </div>
  );
};

export default ClaimDetails;
