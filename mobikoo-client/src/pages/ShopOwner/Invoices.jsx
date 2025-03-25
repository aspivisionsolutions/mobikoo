import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow,Typography, Paper, TextField,Button } from '@mui/material';
import { FaDownload, FaWhatsapp } from 'react-icons/fa';
const API_URL = import.meta.env.VITE_API_URL;

const Invoices = () => {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWarranties, setFilteredWarranties] = useState([]);
  const [shopDetails, setShopDetails] = useState(null);
  const [shopDetailsComplete, setShopDetailsComplete] = useState(false); // Added state for shop details completion
  const navigate = useNavigate();
  

  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/user/shop-owner`, {
          headers: { Authorization: `${localStorage.getItem('token')}` }
        });
  
        if (response.data.shopprofile && response.data.shopprofile.length > 0) {
          const profile = response.data.shopprofile[0];
          const shopDetails = {
            shopName: profile.shopDetails?.shopName,
            address: profile.shopDetails?.address,
            mobileNumber: profile.phoneNumber
          };
  
          setShopDetails(shopDetails);
          setShopDetailsComplete(isShopDetailsComplete(shopDetails)); // Pass shopDetails to the function
        } else {
          setShopDetails(null);
          setShopDetailsComplete(false);
        }
      } catch (error) {
        console.error('Error fetching shop details:', error);
        setShopDetails(null);
        setShopDetailsComplete(false);
      }
    };

    const fetchWarranties = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/warranty/issued-warranties/shopOwner`, {
          headers: { Authorization: `${localStorage.getItem('token')}` }
        });
        const warrantiesWithCustomerName = response.data.data.filter(
          (warranty) => warranty.customer?.customerName
        );
        setWarranties(warrantiesWithCustomerName);
        setFilteredWarranties(warrantiesWithCustomerName);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchShopDetails();
    fetchWarranties();
  }, []);
  const isShopDetailsComplete = (shopDetails) => { // Added shopDetails parameter
    return shopDetails &&
           shopDetails.shopName &&
           shopDetails.mobileNumber &&
           shopDetails.address;
  };
  if (!shopDetailsComplete) { // Use shopDetailsComplete state
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <Typography variant="h5" component="div" gutterBottom>
          Please complete your shop profile to view invoices.
        </Typography>
        <Typography variant="body1" component="div" gutterBottom>
          Go to your profile settings to complete the missing information.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/shop-owner/profile')}>Go to Profile</Button> {/* Added button */}
      </div>

    );
  }
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    filterWarranties(event.target.value);
  };

  const filterWarranties = (query) => {
    const filtered = warranties.filter((warranty) => {
      const phoneNumber = warranty.customer?.customerPhoneNumber;
      return phoneNumber && phoneNumber.toString().toLowerCase().includes(query.toLowerCase());
    });
    setFilteredWarranties(filtered);
  };

  const generatePDF = (warranty) => {
    console.log(warranty)
    const doc = new jsPDF();
    const { _id, customer, warrantyPlanId,inspectionReport, issueDate } = warranty;
    const date = new Date(issueDate);
    const formattedDate = date.toLocaleDateString();
  
    // Company header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Mobikoo', 10, 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
  
    // Vertical layout with lines and improved spacing
    let y = 20;
    const x = 10;
    const labelWidth = 100;
    const valueX = x + labelWidth;
    const lineLength = 180; // Adjust as needed
  
    const data = [
      { label: 'Invoice ID', value: _id.toString() },
      { label: 'Customer Name', value: customer.customerName },
      {label:"Shop Name",value:inspectionReport.shopName},
      { label: 'Mobile', value: customer.customerPhoneNumber.toString() },
      { label: 'IMEI', value: customer.imeiNumber.toString() },
      { label: 'Warranty Plan', value: `${warrantyPlanId.lower_limit}-${warrantyPlanId.upper_limit}` },
      { label: 'Issue Date', value: formattedDate },
      { label: 'Warranty Price', value: warrantyPlanId.price.toString() },
      { label: 'Total Price', value: warrantyPlanId.price.toString() },
    ];
  
    data.forEach((item) => {
      doc.text(item.label, x, y);
      doc.text(item.value, valueX, y);
      doc.line(x, y + 2, x + lineLength, y + 2); // Add line after each item
      y += 10; // Adjust vertical spacing
    });
  
    doc.save(`invoice_${_id.toString()}.pdf`);

  };
  const sendToWhatsApp = (warranty) => {
    // Ensure the phone number has +91 prefix
    const phoneNumber = warranty.customer.customerPhoneNumber.toString().startsWith('+91') 
      ? warranty.customer.customerPhoneNumber 
      : `+91${warranty.customer.customerPhoneNumber}`;
  
    // Construct the WhatsApp message
    const message = `
  *Mobikoo Invoice Details*
  
  Invoice ID: ${warranty._id}
  Customer Name: ${warranty.customer.customerName}
  Shop Name: ${warranty.inspectionReport.shopName}
  Mobile: ${phoneNumber}
  IMEI: ${warranty.customer.imeiNumber}
  Warranty Plan: ${warranty.warrantyPlanId.lower_limit}-${warranty.warrantyPlanId.upper_limit}
  Issue Date: ${new Date(warranty.issueDate).toLocaleDateString()}
  Warranty Price: ₹${warranty.warrantyPlanId.price}
  Total Price: ₹${warranty.warrantyPlanId.price}
  
  Thank you for your purchase!
    `.trim();
  
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
  
    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new window/tab
    window.open(whatsappUrl, '_blank');
  };
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <>
    <TextField
        label="Search by Phone Number"
        variant="outlined"
        value={searchQuery}
        onChange={handleSearchChange}
        fullWidth
        margin="normal"
      />
     <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Invoice ID</TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>IMEI</TableCell>
              <TableCell>Warranty Plan</TableCell>
              <TableCell>Issue Date</TableCell>
              <TableCell>Total Price</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredWarranties.map((warranty) => ( // Use filteredWarranties
              <TableRow
                key={warranty._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {warranty._id}
                </TableCell>
                {warranty.customer?.customerName ? (
                  <TableCell>{warranty.customer.customerName}</TableCell>
                ) : (
                  <TableCell>-</TableCell> // Or any other placeholder
                )}
                <TableCell>{warranty.customer?.customerPhoneNumber}</TableCell>
                <TableCell>{warranty.customer?.imeiNumber}</TableCell>
                <TableCell>{`${warranty.warrantyPlanId.lower_limit}-${warranty.warrantyPlanId.upper_limit}`}</TableCell>
                <TableCell>{new Date(warranty.issueDate).toLocaleDateString()}</TableCell>
                <TableCell>{warranty.warrantyPlanId.price}</TableCell>
                <TableCell>
                  <button onClick={() => generatePDF(warranty)}>
                    <FaDownload />
                  </button>
                  <span style={{ marginLeft: '15px' }}></span>
                  <button onClick={() => sendToWhatsApp(warranty)}>
                    <FaWhatsapp />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default Invoices;