// src/pages/AllBillsPage.js

import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust path if needed
import jsPDF from 'jspdf';
import { pdf, PDFDownloadLink } from "@react-pdf/renderer";
import TamilPDF from "../Dashboard/TamilPDF"; 

import './invoiceCopy.css';
import { FaDownload, FaPrint, FaShareAlt, FaTrash, FaTruck } from 'react-icons/fa';
import Logo from "../assets/PCW.png";
import { format, isValid, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { FaHome, FaEye, FaEdit, FaFileInvoice, FaArrowCircleLeft, FaArrowAltCircleRight } from 'react-icons/fa';
import { AiFillProduct } from 'react-icons/ai';
import { MdLogout } from 'react-icons/md';
import { TbListNumbers } from 'react-icons/tb';
import { IoIosPerson } from 'react-icons/io';
import Sidebar from '../Sidebar/Sidebar';
import MobileNavbar from '../Mobile Navbar/MobileNavbar';

const InvoiceCopy = (bill) => {
  const [bills, setBills] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBillType, setSelectedBillType] = useState('');
  const [filteredBills, setFilteredBills] = useState([]);
  const [isOpen, setIsOpen] = useState(true);

  const sortedBills = bills.sort((a, b) => {
    const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt);
    const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt);
    return dateB - dateA; // Sort descending by date
  });
const handleBillTypeChange = async (value) => {
  setSelectedBillType(value);
  let collectionName = '';

  // Map dropdown value to Firestore collection
 

  try {
    const snapshot = await getDocs(collection(db, collectionName));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setBills(data);
  } catch (error) {
    console.error('Error fetching bills:', error);
  }
};
useEffect(() => {
  if (selectedDate) {
    const filtered = bills.filter(bill => {
      const createdAt = bill.createdAt instanceof Timestamp
        ? bill.createdAt.toDate()
        : new Date(bill.createdAt);
      return createdAt.toISOString().split('T')[0] === selectedDate;
    });
    setFilteredBills(filtered);
  } else {
    setFilteredBills(bills);
  }
}, [selectedDate, bills]);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        // Fetch bills from 'billing' collection
        const billingSnapshot = await getDocs(collection(db, 'invoicebilling'));
        const billingData = billingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch bills from 'customerBilling' collection
        // const customerBillingSnapshot = await getDocs(collection(db, 'customerBilling'));
        // const customerBillingData = customerBillingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Combine both collections
        const allBills = [...billingData];
        
        setBills(allBills);
      } catch (error) {
        console.error('Error fetching bills: ', error);
      }
    };

    fetchBills();
  }, []);

// const filteredBills = sortedBills.filter((bill) => {
//   const billDate = bill.createdAt instanceof Timestamp ? bill.createdAt.toDate().toLocaleDateString() : new Date(bill.createdAt).toLocaleDateString();
//   return selectedDate ? billDate === new Date(selectedDate).toLocaleDateString() : true;
// });
const toggleSidebar = () => {
  setIsOpen(!isOpen);
};
// const formatDate = (createdAt) => {
//   let createdAtDate;

//   // Convert createdAt to a Date object
//   if (createdAt instanceof Timestamp) {
//     createdAtDate = createdAt.toDate();
//   } else if (typeof createdAt === 'string' || createdAt instanceof Date) {
//     createdAtDate = new Date(createdAt);
//   } else {
//     return 'Invalid Date'; // Handle cases where createdAt is not valid
//   }

//   // Format the date as 'MM/DD/YYYY' or any desired format
//   return !isNaN(createdAtDate.getTime())
//     ? createdAtDate.toLocaleDateString() // Returns only the date portion (e.g., "8/27/2024")
//     : 'Invalid Date';
// };  
function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date); // Handles Timestamp or string
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
// ✅ Main function to generate all 4 copies in one PDF
const generateAllCopiesPDF = async (detail, billType, logoBase64) => {
  const copyTypes = [ 'CUSTOMER'];
  const doc = new jsPDF();

  for (let i = 0; i < copyTypes.length; i++) {
    const copyType = copyTypes[i];
    if (i > 0) doc.addPage();
    await generateSingleCopy(doc, detail, copyType, billType, logoBase64);
  }

  const fileName = `BILL-${detail.invoiceNumber}-25.pdf`;
  doc.save(fileName);
};

// ✅ Function to generate a single copy on the given PDF page
const generateSingleCopy = async (doc, detail, copyType, billType, logoBase64) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const borderMargin = 10;

  const drawPageBorder = () => {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.rect(borderMargin, borderMargin, pageWidth - 2 * borderMargin, pageHeight - 2 * borderMargin);
  };

  const clean = (val) => (val === undefined ? '' : val);
  const {
    customerName,
    customerAddress,
    customerState,
    customerPhoneNo,
    customerGSTIN,
    customerPan,
    invoiceNumber,
    createdAt,
    customerEmail,
    productsDetails = [],
    totalAmount = 0,
    discountPercentage = 0,
    discountedTotal = 0,
    grandTotal = 0,
    despatchedFrom,
    despatchedTo,
    transportName,
    cgstAmount = 0,
    sgstAmount = 0,
    igstAmount = 0
  } = detail;

const formattedDate = formatDate(createdAt.toDate ? createdAt.toDate() : createdAt);
  const headerStartY = 14;
  const lineSpacing = 6;
  const startX = 18;

  drawPageBorder();

  // ✅ Your actual base64 image string

//   doc.addImage(base64Logo, 'PNG', startX, headerStartY + 1, 27, 27);
// } catch (err) {
//   console.error("Failed to add image:", err);
// }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 0, 0);
  doc.text('SANNAKSHI A TRADITIONAL RICE STORE', startX + 30, headerStartY + 5);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  const addressLines = [
    '110,Javuli Kadai Street.',
    'Sivakasi',
    'Virudhunagar.',
    'State: 33-Tamil Nadu'
  ];
  addressLines.forEach((line, i) => {
    doc.text(line, startX + 30, headerStartY + 5 + (i + 1) * lineSpacing);
  });

  doc.setFontSize(9);

// ✅ TAX INVOICE
doc.setTextColor(255, 0, 0);
const formattedInvoiceNumber = String(invoiceNumber).padStart(3, '0');
doc.text(`BILL NUMBER: ${formattedInvoiceNumber}`, 150, headerStartY + 5);

// ✅ COPY TYPE just below TAX INVOICE
doc.setTextColor(255, 0, 0);
doc.text(`Date: ${formattedDate}`, 150, headerStartY + 5 + lineSpacing); // +6 becomes +5 + lineSpacing

// ✅ INVOICE NUMBER
doc.setTextColor(255, 0, 0);

// doc.text(`Invoice Number: ${formattedInvoiceNumber}`, 150, headerStartY + 5 + 2 * lineSpacing);
// doc.text(`Invoice Number: SKFI-${invoiceNumber}-25`, 150, headerStartY + 5 + 2 * lineSpacing);

// ✅ DATE
doc.setTextColor(0, 0, 0);
// doc.text(`Date: ${formattedDate}`, 150, headerStartY + 5 + 3 * lineSpacing);

// ✅ GSTIN
// doc.text('GSTIN: 33ABVFS6600E1Z4', 150, headerStartY + 5 + 4 * lineSpacing);

  const headerEndY = headerStartY + 5 + 8 * lineSpacing;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.rect(14, headerStartY - 2, 182, headerEndY - headerStartY - 13);

  let startY = 57;

// Row 1: Name, Address, State
const row1 = [
  customerName ? `Name: ${customerName}` : null,
  customerAddress ? `Address: ${customerAddress}` : null,
   customerPhoneNo ? `Phone: ${customerPhoneNo}` : null,
].filter(Boolean).map(item => ({ content: item }));

// Row 2: Phone, GSTIN, PAN


// Combine into final table body
const customerDetails = [];

// ✅ Add 'TO' as the first row
customerDetails.push([
  { content: 'TO', styles: { textColor:"#d30466" ,fontStyle: 'bold', fontSize: 15 } },
  { content: '' }, // 2nd column empty
  { content: '' }  // 3rd column empty
]);


if (row1.length > 0) customerDetails.push(row1);


const customerStartY = startY;

doc.autoTable({
  body: customerDetails,
  startY: customerStartY,
  theme: 'plain',
  styles: { fontSize: 8 },
  margin: { left: 15, right: 15 },
  didParseCell: function (data) {
    if (data.row.index === 0) {
      data.cell.styles.fontSize = 11;
    }
  }
});

// Draw surrounding rectangle
const customerEndY = doc.autoTable.previous.finalY;
doc.setDrawColor(0);
doc.setLineWidth(0.1);
doc.rect(14, customerStartY - 2, 182, customerEndY - customerStartY + 4);


  startY = customerEndY + 5;
  const tableBody = productsDetails.map((item, index) => [
    index + 1,
    item.name || 'N/A',
    // '36041000',
    item.quantity?.toString() || '0',
    `Rs. ${item.saleprice?.toFixed(2) || '0.00'}`,
    `Rs. ${(item.quantity * item.saleprice).toFixed(2)}`
  ]);

  const discountAmt = (totalAmount * (parseFloat(discountPercentage) / 100)).toFixed(2);
 const totalQuantity = (detail?.productsDetails ?? [])
  .reduce((acc, item) => acc + Number(item?.quantity || 0), 0);


  tableBody.push(
    [{ content: 'Total Amount:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } }, `${Math.round(totalAmount)}.00`],
    // [{ content: `Discount (${discountPercentage}%):`, colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }, discountAmt],
    [{ content: 'Sub Total:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } }, `${Math.round(discountedTotal)}.00`],
    // [{ content: 'CGST @ 9%:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }, `${parseFloat(cgstAmount).toFixed(2)}`],
    // [{ content: 'SGST @ 9%:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }, `${parseFloat(sgstAmount).toFixed(2)}`],
    // [{ content: 'IGST @ 18%:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }, `${parseFloat(igstAmount).toFixed(2)}`],
    [{ content: 'Grand Total:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } }, `${Math.round(grandTotal)}.00`],
     [
    { content: '', colSpan: 2 }, // column 1 & 2 empty
    { content: `Total Quantity: ${totalQuantity}`, styles: { halign: 'left', fontStyle: 'bold' } }, // column 3 (index 2)
    { content: '' } // column 4 (index 3)
  ]
    // [{ content: 'Despatched From:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } }, despatchedFrom || 'N/A'],
    // [{ content: 'Despatched To:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } }, despatchedTo || 'N/A'],
    // [{ content: 'Transport Name:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } }, transportName || 'N/A']
  );

  doc.autoTable({
    head: [['S.No', 'Product Name',  'Quantity', 'Rate Per Price', 'Total']],
    body: tableBody,
    startY,
    theme: 'grid',
    headStyles: { fillColor: [255, 182, 193], textColor: [0, 0, 139], lineColor: [0, 0, 0], lineWidth: 0.2 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    bodyStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.2 },
    didDrawPage: drawPageBorder
  });

  const numberToWords = require('number-to-words');
  const grandTotalInWords = numberToWords.toWords(grandTotal);
  let currentY = doc.autoTable.previous.finalY + 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 139);
  doc.text(`Rupees: ${grandTotalInWords.toUpperCase()}`, borderMargin + 5, currentY);

  const terms = [
     '1.Goods once sold will not be taken back or exchanged.',
'2.Annakshi is not responsible for improper storage after purchase',
 '3.All prices are inclusive of packing.',
 '4.Delivery (if applicable) is subject to availability and delivery charges.',
  ];

  const padding = 10;
  const lineHeight = 7;
  const boxX = borderMargin + 4;
  const boxY = currentY + 6;
  const boxWidth = pageWidth - 2 * (borderMargin + 4);
  const boxHeight = 45;

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.rect(boxX, boxY, boxWidth, boxHeight);

  currentY = boxY + padding;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Terms & Conditions', boxX + padding, currentY);

  doc.setFont('helvetica', 'normal');
  terms.forEach(term => {
    currentY += lineHeight;
    doc.text(term, boxX + padding, currentY);
  });

  const authSig = 'Authorised Signature';
  const authSigWidth = doc.getTextWidth(authSig);
  const authSigX = boxX + boxWidth - authSigWidth - padding;
  doc.setFont('helvetica', 'bold');
  doc.text(authSig, authSigX, currentY);
};


  // const handleShare = async (bill) => {
  //   const pdfUrl = await generatePdfUrl(bill); // Ensure you have a function to generate and return the PDF URL.
  //   const shareData = {
  //     title: `Invoice #${bill.invoiceNumber}`,
  //     text: `Please find the attached invoice for ${bill.customerName}.`,
  //     url: pdfUrl,
  //   };
  
  //   // Use navigator.share if supported
  //   if (navigator.share) {
  //     try {
  //       await navigator.share(shareData);
  //       console.log('Shared successfully');
  //     } catch (error) {
  //       console.error('Error sharing:', error);
  //     }
  //   } else {
  //     // Fallback for WhatsApp and Gmail
  //     const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
  //       `Invoice for ${bill.customerName} (₹${bill.totalAmount}): ${pdfUrl}`
  //     )}`;
  //     const gmailUrl = `mailto:?subject=${encodeURIComponent(
  //       `Invoice #${bill.invoiceNumber}`
  //     )}&body=${encodeURIComponent(
  //       `Please find the invoice for ${bill.customerName} (₹${bill.totalAmount}): ${pdfUrl}`
  //     )}`;
      
  //     const fallbackMessage = 'Sharing is not supported on this browser. Use WhatsApp or Gmail links.';
  
  //     // Prompt user to choose
  //     const userChoice = window.confirm(
  //       'Choose OK to share via WhatsApp or Cancel to share via Gmail.'
  //     );
  
  //     if (userChoice) {
  //       window.open(whatsappUrl, '_blank');
  //     } else {
  //       window.open(gmailUrl, '_blank');
  //     }
  //   }
  // };
  
  // Mock function to generate a PDF URL
  const generatePdfUrl = async (bill) => {
    // Logic to generate PDF URL
    return `https://example.com/invoices/${bill.id}.pdf`;
  };
  const handlePrint = (bill) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`<html><head><title>Invoice</title></head><body>${bill.invoiceNumber}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
  const handleDelete = async (id) => {
    // Display confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to delete this bill?");
  
    if (!isConfirmed) {
      return; // Exit if the user cancels
    }
  
    try {
      // Delete from 'billing' collection
      const billingDocRef = doc(db, 'invoicebilling', id);
      await deleteDoc(billingDocRef);
  
      // Delete from 'customerBilling' collection
      const customerBillingDocRef = doc(db, 'invoicebilling', id);
      await deleteDoc(customerBillingDocRef);
  
      // Update the state to remove the deleted bill from the UI
      setBills(prevBills => prevBills.filter(bill => bill.id !== id));
  
      console.log(`Document with id ${id} deleted from both billing and customerBilling collections.`);
    } catch (error) {
      console.error('Error deleting bill: ', error.message);
    }
  };
  const handleFastDownload = async (bill) => {
  const blob = await pdf(
 <TamilPDF
  invoiceNumber={bill?.invoiceNumber || ""}

  cart={
    Array.isArray(bill?.productsDetails)
      ? bill.productsDetails
      : Array.isArray(bill?.cart)
      ? bill.cart
      : []
  }

  billingDetails={{
      subtotal: Number(bill?.totalAmount ?? 0),
    cgstAmount: Number(bill?.cgstAmount ?? 0),
    sgstAmount: Number(bill?.sgstAmount ?? 0),
    igstAmount: Number(bill?.igstAmount ?? 0),
    grandTotal: Number(bill?.grandTotal ?? bill?.totalAmount ?? 0),
  }}

  customerName={bill?.customerName || ""}
  customerPhoneNo={bill?.customerPhoneNo || ""}
  customerAddress={bill?.customerAddress || ""}

  
  customerState={bill?.customerState || ""}
  customerEmail={bill?.customerEmail || ""}
  customerGSTIN={bill?.customerGSTIN || ""}

  billDate={
    bill?.createdAt?.seconds
      ? bill.createdAt.toDate()
      : new Date(bill?.createdAt ?? Date.now())
  }

  fssaiNo="33ABBFV0989M1ZO"
/>
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Bill-${String(bill?.invoiceNumber).padStart(3, "0")}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};
const handleShare = async (bill) => {
  try {
    // 1️⃣ Generate PDF Blob from TamilPDF
    const blob = await pdf(
     <TamilPDF
  invoiceNumber={bill?.invoiceNumber || ""}

  cart={
    Array.isArray(bill?.productsDetails)
      ? bill.productsDetails
      : Array.isArray(bill?.cart)
      ? bill.cart
      : []
  }

  billingDetails={{
      subtotal: Number(bill?.totalAmount ?? 0),
    cgstAmount: Number(bill?.cgstAmount ?? 0),
    sgstAmount: Number(bill?.sgstAmount ?? 0),
    igstAmount: Number(bill?.igstAmount ?? 0),
    grandTotal: Number(bill?.grandTotal ?? bill?.totalAmount ?? 0),
  }}

  customerName={bill?.customerName || ""}
  customerPhoneNo={bill?.customerPhoneNo || ""}
  customerAddress={bill?.customerAddress || ""}

  
  customerState={bill?.customerState || ""}
  customerEmail={bill?.customerEmail || ""}
  customerGSTIN={bill?.customerGSTIN || ""}

  billDate={
    bill?.createdAt?.seconds
      ? bill.createdAt.toDate()
      : new Date(bill?.createdAt ?? Date.now())
  }

  fssaiNo="33ABBFV0989M1ZO"
/>
    ).toBlob();

    // 2️⃣ Convert to File object (Required for Web Share API)
    const file = new File(
      [blob],
      `BILL-${String(bill?.invoiceNumber).padStart(3, "0")}.pdf`,
      { type: "application/pdf" }
    );

    // 3️⃣ Check browser support
    if (navigator.share && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "Invoice PDF",
        text: `Invoice for ${bill.customerName}`,
        files: [file],
      });
      console.log("Invoice shared successfully");
      return;
    }

    // 4️⃣ Fallback for browsers without share support → WhatsApp PDF URL
    const url = URL.createObjectURL(blob);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      `Download your invoice: ${url}`
    )}`;
    window.open(whatsappUrl, "_blank");

  } catch (err) {
    console.error("Error sharing:", err);
    alert("Sharing failed. Try again.");
  }
};

  
  return (
    <div className="main-container2">
      {/* Sidebar */}
     <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
  
      {/* Main Content */}
      <div className="content">
       
        <div className="all-bills-page">
          <MobileNavbar/>
         <br/>
          <h1>Our Bills</h1>
          <div className="date-filter">
          <label style={{ fontSize: '16px', fontWeight: 'bold', marginRight: '10px' }}>
  Select Date:
  <input
    type="date"
    value={selectedDate}
    onChange={(e) => setSelectedDate(e.target.value)}
    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
  />
</label>

          </div>
          <table className="products-table">
            <thead>
              <tr>
                <th>Bill No.  </th>
                <th>Name</th>
                <th>Total Amount</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map((bill) => {
                const createdAt = bill.createdAt instanceof Timestamp
                  ? bill.createdAt.toDate().toLocaleDateString()
                  : new Date(bill.createdAt).toLocaleDateString();
                return (
                  <tr key={bill.id}>
                    <td>{bill.invoiceNumber}</td>
                    <td>{bill.customerName}</td>
                    <td>₹{bill.totalAmount}</td>
                    <td>{createdAt}</td>
                    <td>
                <FaDownload
  className="download-icon"
  style={{ cursor: "pointer" }}
  onClick={() => handleFastDownload(bill)}
/>



                      <FaTrash
                        className="delete-icon"
                        onClick={() => handleDelete(bill.id)}
                      />
                      <FaShareAlt
  className="share-icon"
  style={{ cursor: "pointer", color: "#1b73e8", marginLeft: "10px" }}
  onClick={() => handleShare(bill)}
/>

                       {/* <FaShareAlt
    className="share-icon"
    onClick={() => handleShare(bill)}
    style={{ cursor: 'pointer', marginLeft: '10px', color: '#1b73e8' }}
  />
   <FaPrintfi
                      className="print-icon"
                      onClick={() => handlePrint(bill)}
                      style={{ cursor: "pointer", marginLeft: "10px", color: "#ff5722" }}
                    /> */}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  
  };

export default InvoiceCopy;
