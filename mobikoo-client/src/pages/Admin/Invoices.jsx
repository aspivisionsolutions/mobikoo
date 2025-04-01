import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField } from '@mui/material';
import { FaDownload, FaWhatsapp } from 'react-icons/fa';
const API_URL = import.meta.env.VITE_API_URL;

const Invoices = () => {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWarranties, setFilteredWarranties] = useState([]); // Initialize with empty array

  const fetchWarranties = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/warranty/issued-warranties`, {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      });
      // Filter out warranties without customer name during initial fetch
      const warrantiesWithCustomerName = response.data.data.filter(
        (warranty) => warranty.customer?.customerName
      );
      setWarranties(warrantiesWithCustomerName);
      setFilteredWarranties(warrantiesWithCustomerName);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarranties();
  }, []);

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
      {label:"Shop Owner Id",value:inspectionReport.shopOwnerId},
      { label: 'Mobile', value: customer.customerPhoneNumber.toString() },
      { label: 'IMEI', value: customer.imeiNumber.toString() },
      { label: 'Warranty Plan', value: `${warrantyPlanId.lower_limit}-${warrantyPlanId.upper_limit}` },
      { label: 'Issue Date', value: formattedDate },
      { label: 'Warranty Price', value: warrantyPlanId.price.toString() },
      { label: 'Total Price', value: warrantyPlanId.price.toString() },
    ];
  
    data.forEach((item) => {
      console.log(item.label, item.value)
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