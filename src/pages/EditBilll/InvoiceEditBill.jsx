import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db, firestore } from '../firebase'; // Adjust the path to your Firebase config
import { FaDownload, FaEdit, FaTruck } from 'react-icons/fa'; // For Edit icon
import { jsPDF } from 'jspdf'; // Import jsPDF for generating PDFs
import './InvoiceEditBill.css';
import Sidebar from '../Sidebar/Sidebar';
import MobileNavbar from '../Mobile Navbar/MobileNavbar';
import { pdf, PDFDownloadLink } from "@react-pdf/renderer";
import TamilPDF from "../Dashboard/TamilPDF"; 
// Replace with your Base64 font string
const InvoiceEditBillPage = () => {
  const [bills, setBills] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [editBill, setEditBill] = useState(null); // Stores the selected bill for editing
  const [updatedDetails, setUpdatedDetails] = useState({}); // Holds updated bill details
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls modal visibility
  const [allProducts, setAllProducts] = useState([]);
  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
    };
    fetchProducts();
  }, []);
 useEffect(() => {
  const fetchBills = async () => {
    try {
      const billingSnapshot = await getDocs(collection(db, 'invoicebilling'));
      const billingData = billingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const allBills = [...billingData];

      // 🔥 Sort invoice numbers in descending order
      const sortedBills = allBills.sort((a, b) => {
        const invA = parseInt(a.invoiceNumber, 10);
        const invB = parseInt(b.invoiceNumber, 10);
        return invB - invA;   // DESCENDING (LATEST FIRST)
      });

      setBills(sortedBills);
    } catch (error) {
      console.error("Error fetching bills:", error);
    }
  };

  fetchBills();
}, []);


useEffect(() => {
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllProducts(productsList);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  fetchProducts();
}, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
};
const handleEdit = (bill) => {
  setUpdatedDetails({ ...bill });
  setIsModalOpen(true);

  // Calculate initial totals
  const updatedProducts = bill.productsDetails.map((product) => ({
    ...product,
    total: (product.quantity || 0) * (product.saleprice || 0),
  }));
  setUpdatedDetails({ ...bill, productsDetails: updatedProducts });
};


const calculateInitialTotals = () => {
  const updatedProducts = updatedDetails.productsDetails.map((product) => ({
    ...product,
    total: (product.quantity || 0) * (product.saleprice || 0),
  }));
  setUpdatedDetails({ ...updatedDetails, productsDetails: updatedProducts });
};

const handleInputChange = (e, index = null, type = null) => {
  const { name, value } = e.target;
  if (type === "product" && index !== null) {
    // Update individual product details
    const updatedProducts = [...updatedDetails.productsDetails];
    updatedProducts[index][name] = value;

    // Recalculate total for the product
    if (name === "quantity" || name === "saleprice") {
      updatedProducts[index].total =
        updatedProducts[index].quantity * updatedProducts[index].saleprice || 0;
    }

    // Update state with recalculated totals
    const totalAmount = updatedProducts.reduce(
      (sum, product) => sum + (product.total || 0),
      0
    );
    // const cgstAmount = (totalAmount * 0.09).toFixed(2);
    // const sgstAmount = (totalAmount * 0.09).toFixed(2);
    const grandTotal = (totalAmount ).toFixed(2);

    setUpdatedDetails({
      ...updatedDetails,
      productsDetails: updatedProducts,
      totalAmount,
      // cgstAmount,
      // sgstAmount,
      grandTotal,
    });
  } else {
    setUpdatedDetails({
      ...updatedDetails,
      [name]: value,
    });
  }
};

  
  // Function to calculate total, CGST, SGST, and Grand Total
  const calculateTotals = (products) => {
    const totalAmount = products.reduce((sum, product) => sum + (product.total || 0), 0);
  
    // Calculate CGST and SGST at 9% each
    // const cgstAmount = totalAmount * 0.09;
    // const sgstAmount = totalAmount * 0.09;
  
    // Calculate Grand Total
    const grandTotal = totalAmount ;
  
    // Update the updatedDetails with new totals
    setUpdatedDetails((prevDetails) => ({
      ...prevDetails,
      totalAmount: totalAmount.toFixed(2), // Keep 2 decimal points
      // cgstAmount: cgstAmount.toFixed(2),
      // sgstAmount: sgstAmount.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
    }));
  };
  const updateBillInFirestore = async (id, updatedDetails) => {
  try {
    const docRef = doc(db, "invoicebilling", id);
    await updateDoc(docRef, updatedDetails);
    alert("Bill updated successfully!");
  } catch (error) {
    console.error("Error updating bill:", error.message);
  }
};
  const handleSubmit = () => {
  const updatedData = { ...updatedDetails };

  // Make sure no undefined or null values are passed
  console.log("Final data to send:", updatedData);

  // Update local state
  const updatedBills = bills.map((bill) =>
    bill.id === updatedData.id ? { ...bill, ...updatedData } : bill
  );

  setBills(updatedBills);
  setIsModalOpen(false);

  // Save to Firestore
  updateBillInFirestore(updatedData.id, updatedData);
};

function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date); // Handles Timestamp or string
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
  const generateAllCopiesPDF = async (detail, billType, logoBase64) => {
    const copyTypes = ['CUSTOMER'];
    const doc = new jsPDF();
  
    for (let i = 0; i < copyTypes.length; i++) {
      const copyType = copyTypes[i];
      if (i > 0) doc.addPage();
      await generateSingleCopy(doc, detail, copyType, billType, logoBase64);
    }
  
    const fileName = `BILL-${detail.invoiceNumber}-25.pdf`;
    doc.save(fileName);
  };
  
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
    customerEmail,
    createdAt,
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


  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 0, 0);
  doc.text('ANNAKSHI A TRADITIONAL RICE STORE', startX + 30, headerStartY + 5);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  const addressLines = [
   '110,Javuli Kadai Street.',
    'Sivakasi.',
    'Virudhunagar',
    'State:Tamil Nadu',
  ];
  addressLines.forEach((line, i) => {
    doc.text(line, startX + 30, headerStartY + 5 + (i + 1) * lineSpacing);
  });

  doc.setFontSize(9);

// ✅ TAX INVOICE
doc.setTextColor(255, 0, 0);
const formattedInvoiceNumber = String(invoiceNumber).padStart(3, '0');
doc.text(`Bill Number: ${formattedInvoiceNumber}`, 150, headerStartY + 5);

// ✅ COPY TYPE just below TAX INVOICE
doc.setTextColor(0, 0, 0);
doc.text(`Date: ${formattedDate}`, 150, headerStartY + 5 + lineSpacing); // +6 becomes +5 + lineSpacing

// ✅ INVOICE NUMBER
doc.setTextColor(255, 0, 0);

// doc.text(`Invoice Number: ${formattedInvoiceNumber}`, 150, headerStartY + 5 + 2 * lineSpacing);
// // doc.text(`Invoice Number: SKFI-${invoiceNumber}-25`, 150, headerStartY + 5 + 2 * lineSpacing);

// // ✅ DATE
// doc.setTextColor(0, 0, 0);
// doc.text(`Date: ${formattedDate}`, 150, headerStartY + 5 + 3 * lineSpacing);

// ✅ GSTIN
// doc.text('GSTIN: 33ACVFS9302G1ZT', 150, headerStartY + 5 + 4 * lineSpacing);

// Calculate header box height correctly (remove hardcoded -13)
const headerEndY = headerStartY + 5 + 4.5 * lineSpacing; // adjust multiplier to fit last GSTIN line properly

doc.setDrawColor(0, 0, 0);
doc.setLineWidth(0.2);
doc.rect(14, headerStartY - 2, 182, headerEndY - headerStartY + 4); // +4 for small padding

// Now place customer section immediately below header
let startY = headerEndY + 8; // instead of +2 or large gap


// Row 1: Name, Address, State
const row1 = [
  customerName ? `Name: ${customerName}` : null,
  customerAddress ? `Address: ${customerAddress}` : null,
  customerPhoneNo ? `Phone: ${customerPhoneNo}` : null,
  // customerState ? `State: ${customerState}` : null,
].filter(Boolean).map(item => ({ content: item }));

// Row 2: Phone, GSTIN, PAN
// const row2 = [
//   customerPhoneNo ? `Phone: ${customerPhoneNo}` : null,
//   customerGSTIN ? `GSTIN: ${customerGSTIN}` : null,
//   customerPan ? `PAN: ${customerPan}` : null,
// ].filter(Boolean).map(item => ({ content: item }));

// Combine into final table body
const customerDetails = [];

// ✅ Add 'TO' as a single merged cell (no extra space)
customerDetails.push([
  { 
    content: 'TO', 
    colSpan: 3, 
    styles: { textColor:"#d30466", fontStyle: 'bold', fontSize: 15 } 
  }
]);

if (row1.length > 0) customerDetails.push(row1);
// if (row2.length > 0) customerDetails.push(row2);

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
doc.rect(14, customerStartY - 2, 182, customerEndY - customerStartY + 2);


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

  tableBody.push(
    [{ content: 'Total Amount:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } }, `${Math.round(totalAmount)}.00`],
    // [{ content: `Discount (${discountPercentage}%):`, colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }, discountAmt],
    [{ content: 'Sub Total:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } }, `${Math.round(discountedTotal)}.00`],
    // [{ content: 'CGST @ 9%:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }, `${parseFloat(cgstAmount).toFixed(2)}`],
    // [{ content: 'SGST @ 9%:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }, `${parseFloat(sgstAmount).toFixed(2)}`],
    // [{ content: 'IGST @ 18%:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }, `${parseFloat(igstAmount).toFixed(2)}`],
    [{ content: 'Grand Total:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } }, `${Math.round(grandTotal)}.00`],
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
  const handleRemoveProduct = (index) => {
    const updatedProducts = [...updatedDetails.productsDetails];
  
    // Remove the product at the specified index
    updatedProducts.splice(index, 1);
  
    // Check if there are any taxable products remaining
    const hasTaxableProducts = updatedProducts.length > 0;
  
    // Calculate the new total amount
    const newTotalAmount = updatedProducts.reduce(
      (sum, product) => sum + product.quantity * product.saleprice,
      0
    );
  
    // Initialize CGST, SGST, and Grand Total
    let cgstAmount = 0;
    let sgstAmount = 0;
    let grandTotal = newTotalAmount;
  
    // Only calculate taxes if there are taxable products
    if (hasTaxableProducts) {
      // cgstAmount = newTotalAmount * 0.09; // 9% CGST
      // sgstAmount = newTotalAmount * 0.09; // 9% SGST
      grandTotal = newTotalAmount;
    }
  
    // Update the state with new values
    setUpdatedDetails((prevDetails) => ({
      ...prevDetails,
      productsDetails: updatedProducts,
      totalAmount: newTotalAmount,
      cgstAmount: hasTaxableProducts ? cgstAmount : 0,
      sgstAmount: hasTaxableProducts ? sgstAmount : 0,
      grandTotal: hasTaxableProducts ? grandTotal : newTotalAmount,
    }));
  };
  const handleAddProduct = (product) => {
  const newProducts = [
    ...updatedDetails.productsDetails,
    {
      name: product.name,
      quantity: 1,
      saleprice: product.saleprice || 0,
      total: product.saleprice || 0,
    },
  ];

  // Subtotal
  const totalAmount = newProducts.reduce(
    (sum, p) => sum + (parseFloat(p.total) || 0),
    0
  );

  // ✅ Discount (default 0 if not set)
  const discountAmount = parseFloat(updatedDetails.discountAmount) || 0;

  // Apply discount before tax
  const discountedTotal = totalAmount - discountAmount;

  // ✅ Tax on discounted total
  // const cgstAmount = (discountedTotal * 9) / 100;
  // const sgstAmount = (discountedTotal * 9) / 100;

  // ✅ Grand total = discounted + taxes
  const grandTotal = discountedTotal ;

  setUpdatedDetails((prev) => ({
    ...prev,
    productsDetails: newProducts,
    totalAmount,
    discountAmount,
    discountedTotal,
    // cgstAmount,
    // sgstAmount,
    grandTotal,
  }));
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
  a.download = `BILL-${String(bill?.invoiceNumber).padStart(3, "0")}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};

  return (
    <div className="edit-bill-page">
      <div className="main-container2">
          <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

        <div className="content">
        
          <div className="all-bills-page">
              <MobileNavbar/>
            <h1>Edit Bills</h1>
            <table className="products-table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Customer Name</th>
                  <th>Total Amount</th>
                  <th>Grand Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr key={bill.id}>
                    <td>{bill.invoiceNumber}</td>
                    <td>{bill.customerName}</td>
                    <td>{bill.totalAmount}</td>
                    <td>{Math.floor(bill.grandTotal)}</td>

                    <td>
                      <FaEdit
                        className="edit-icon"
                        onClick={() => handleEdit(bill)}
                      />
                      <FaDownload
                      className="download-icon"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleFastDownload(bill)}
                    />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {isModalOpen && (
              <div className="modal">
                <div className="modal-content">
                  <h2>Edit Bill</h2>

                 <label>Customer Name:</label>
<input
  type="text"
  name="customerName"
  value={updatedDetails.customerName || ""}
  onChange={(e) => handleInputChange(e)}
/>

<label>Customer Address:</label>
<input
  type="text"
  name="customerAddress"
  value={updatedDetails.customerAddress || ""}
  onChange={(e) => handleInputChange(e)}
/>

<label>Customer State:</label>
<input
  type="text"
  name="customerState"
  value={updatedDetails.customerState || ""}
  onChange={(e) => handleInputChange(e)}
/>

<label>Customer Phone Number:</label>
<input
  type="text"
  name="customerPhoneNo"
  value={updatedDetails.customerPhoneNo || ""}
  onChange={(e) => handleInputChange(e)}
/>

<label>Customer Email:</label>
<input
  type="text"
  name="customerEmail"
  value={updatedDetails.customerEmail || ""}
  onChange={(e) => handleInputChange(e)}
/>

<label>Customer GSTIN:</label>
<input
  type="text"
  name="customerGSTIN"
  value={updatedDetails.customerGSTIN || ""}
  onChange={(e) => handleInputChange(e)}
/>

                  <h3>Products in Bill</h3>
                  {updatedDetails.productsDetails.map((product, index) => (
                  <div key={index} className="product-block">
  
  {/* FIRST ROW */}
  <div className="product-row-top">
    <div>
      <label>Product Name:</label>
      <input
        type="text"
        name="name"
        value={product.name || ""}
        onChange={(e) => handleInputChange(e, index, "product")}
      />
    </div>

    <div>
      <label>Quantity:</label>
      <input
        type="number"
        name="quantity"
        value={product.quantity || ""}
        onChange={(e) => handleInputChange(e, index, "product")}
      />
    </div>

    <div>
      <label>Price:</label>
      <input
        type="number"
        name="saleprice"
        value={product.saleprice || ""}
        onChange={(e) => handleInputChange(e, index, "product")}
      />
    </div>
  </div>

  {/* SECOND ROW */}
  <div className="product-row-bottom">
    <div className="total-box">
      <label>Total:</label>
      <input
        type="number"
        name="total"
        value={product.total || 0}
        readOnly
      />
    </div>

    <button
      type="button"
      className="remove-btn"
      onClick={() => handleRemoveProduct(index)}
    >
      Remove
    </button>
  </div>

</div>

                  ))}
  <label>Total Amount:</label>
                  <input
                    type="number"
                    name="totalAmount"
                    value={updatedDetails.totalAmount || ""}
                    readOnly
                  />
                    <label>Grand Total:</label>
                  <input
                    type="number"
                    name="grandTotal"
                    value={updatedDetails.grandTotal || ""}
                    readOnly
                  />

                  <h3>Available Products</h3>
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Add</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td>{product.name}</td>
                          <td>{product.saleprice}</td>
                          <td>
                            <button onClick={() => handleAddProduct(product)}>
                              Add
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                
                  {/* <label>CGST (9%):</label>
                  <input
                    type="number"
                    name="cgstAmount"
                    value={updatedDetails.cgstAmount || ""}
                    readOnly
                  />
                  <label>SGST (9%):</label>
                  <input
                    type="number"
                    name="sgstAmount"
                    value={updatedDetails.sgstAmount || ""}
                    readOnly
                  /> */}
                
                  <div className="modal-actions">
  <button className="save-btn" onClick={handleSubmit}>Save</button>
  <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
</div>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceEditBillPage;
