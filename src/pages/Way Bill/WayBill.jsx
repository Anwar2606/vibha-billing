import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Import the initialized firebase instance
import { collection, getDocs, addDoc, Timestamp, setDoc, getDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
// import './BillingCalculator.css'; // Import the CSS file
import Navbar from '../Navbar/Navbar';
import MyLogo from '../assets/SF logo.png';

const WayBill = () => {
  const [searchTermForTransport, setSearchTermForTransport] = useState("");
  const [transportList, setTransportList] = useState([]);
  const [filteredTransport, setFilteredTransport] = useState([]);
  const [transportName, setTransportName] = useState("");
  const [transportGSTIN, setTransportGSTIN] = useState("");
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTermForCustomers, setSearchTermForCustomers] = useState('');
  const [despatchedFrom, setDespatchedFrom] = useState('');
  const [despatchedTo, setDespatchedTo] = useState('');
  const [lrNo, setLrNo] = useState('');
  const [transportDate, setTransportDate] = useState('');
  const [ filteredCustomers, setFilteredCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [category, setCategory] = useState('');
  let invoiceNumber = ''; 
  const [billingDetails, setBillingDetails] = useState({
    totalAmount: 0,
    discountPercentage: '',
    discountedTotal: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    grandTotal: 0,
  });
  const [customerName, setCustomerName] = useState('');
  const [customerState, setCustomerState] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhoneNo, setCustomerPhone] = useState('');
  const [invoiceNumbers, setInvoiceNumbers] = useState('');
  const [customerGSTIN, setCustomerGSTIN] = useState('');
  const [customerPan, setCustomerPAN] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false); // Track if the search term exists
  const [manualInvoiceNumber, setManualInvoiceNumber] = useState('');
  const [businessState, setBusinessState] = useState('YourBusinessState');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTerm2, setSearchTerm2] = useState('');
  const [taxOption, setTaxOption] = useState('cgst_sgst');
  const [currentDate, setCurrentDate] = useState(new Date()); // State for current date
  const [showCustomerDetails, setShowCustomerDetails] = useState(false); // State for toggling customer details
  const handleInvoiceNumberChange = (event) => {
    setManualInvoiceNumber(event.target.value);
  };



 useEffect(() => {
     const fetchProducts = async () => {
       const productsCollectionRef = collection(db, 'products');
       try {
         const querySnapshot = await getDocs(productsCollectionRef);
         const fetchedProducts = querySnapshot.docs.map(doc => ({
           id: doc.id,
           ...doc.data(),
         }));
         setProducts(fetchedProducts);
       } catch (error) {
         console.error('Error fetching products: ', error);
       }
     };
     fetchProducts();
   }, []);



  useEffect(() => {
    const filterProducts = () => {
      let filtered = products;
      if (searchTerm) {
        filtered = filtered.filter(product => {
          const productName = product.name ? product.name.toLowerCase() : '';
          const productCode = product.sno ? product.sno.toLowerCase() : '';
          return productName.includes(searchTerm.toLowerCase()) || productCode.includes(searchTerm.toLowerCase());
        });
      }
      setFilteredProducts(filtered);
    };
    filterProducts();
  }, [searchTerm, products]);


  useEffect(() => {
    const fetchCustomers = async () => {
      let customersQuery = collection(db, 'customer');

      // If search term exists, query for customers whose name starts with the search term
      if (searchTermForCustomers) {
        customersQuery = query(
          customersQuery,
          where('customerName', '>=', searchTermForCustomers),
          where('customerName', '<=', searchTermForCustomers + '\uf8ff') // Lexicographic range query
        );
      }

      try {
        const snapshot = await getDocs(customersQuery);
        const customersData = snapshot.docs.map(doc => doc.data());
        setCustomers(customersData);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
  }, [searchTermForCustomers]);

  // Filter customers in memory after fetching data
  useEffect(() => {
    const filterCustomers = () => {
      let filtered = customers;

      if (searchTermForCustomers) {
        filtered = filtered.filter(customer => {
          const customerName = customer.customerName ? customer.customerName.toLowerCase() : '';
          return customerName.includes(searchTermForCustomers.toLowerCase());
        });
      }

      setFilteredCustomers(filtered);
      setIsSearching(searchTermForCustomers !== ''); // Update the search state
    };

    filterCustomers();
  }, [customers, searchTermForCustomers]);
  useEffect(() => {
    const fetchTransport = async () => {
      let transportQuery = collection(db, "transportDetails");

      if (searchTermForTransport) {
        transportQuery = query(
          transportQuery,
          where("transportName", ">=", searchTermForTransport),
          where("transportName", "<=", searchTermForTransport + "\uf8ff")
        );
      }

      try {
        const snapshot = await getDocs(transportQuery);
        const transportData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransportList(transportData);
      } catch (error) {
        console.error("Error fetching transport details:", error);
      }
    };

    fetchTransport();
  }, [searchTermForTransport]);

  // Filter transport details in memory
  useEffect(() => {
    const filterTransport = () => {
      let filtered = transportList;

      if (searchTermForTransport) {
        filtered = filtered.filter((transport) => {
          const name = transport.transportName
            ? transport.transportName.toLowerCase()
            : "";
          return name.includes(searchTermForTransport.toLowerCase());
        });
      }

      setFilteredTransport(filtered);
      setIsSearching(searchTermForTransport !== ""); // Update search state
    };

    filterTransport();
  }, [transportList, searchTermForTransport]);

  

  const handleTransportClick = (transport) => {
    setTransportName(transport.transportName);
    setTransportGSTIN(transport.transportGstin);
  };
  const handleCustomerClick = (customer) => {
    setCustomerName(customer.customerName);
    setCustomerAddress(customer.customerAddress);
    setCustomerState(customer.customerState);
    setCustomerPhone(customer.customerPhoneNo);
    setCustomerGSTIN(customer.customerGSTIN);
    setCustomerPAN(customer.customerPan);
    setCustomerEmail(customer.customerEmail);
  };
  

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleQuantityChange = (productId, quantity) => {
    const updatedCart = cart.map(item =>
      item.productId === productId
        ? { ...item, quantity: parseInt(quantity, 10) || 0 }
        : item
    );
    setCart(updatedCart);
    updateBillingDetails(updatedCart);
  };
  
  const updateBillingDetails = (updatedCart) => {
    const totalAmount = updatedCart.reduce((total, item) => {
      return total + (item.saleprice * item.quantity);
    }, 0);

    const discountPercentage = parseFloat(billingDetails.discountPercentage) || 0;
    const discountedTotal = totalAmount * (1 - discountPercentage / 100);

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (taxOption === 'cgst_sgst') {
      if (customerState === businessState) {
        cgstAmount = discountedTotal * 0.09;
        sgstAmount = discountedTotal * 0.09;
      } else {
        cgstAmount = discountedTotal * 0.09;
        sgstAmount = discountedTotal * 0.09;
      }
    } else if (taxOption === 'igst') {
      igstAmount = discountedTotal * 0.18;
    }

    const grandTotal = discountedTotal + cgstAmount + sgstAmount + igstAmount;

    setBillingDetails(prevState => ({
      ...prevState,
      totalAmount,
      discountedTotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      grandTotal,
    }));
  };
  const updateProductQuantity = async (productId, purchaseQuantity) => {
    const productRef = doc(db, 'products', productId);
    const product = products.find(p => p.id === productId);
    if (product) {
      const newQuantity = product.quantity - purchaseQuantity;
      if (newQuantity < 0) {
        alert('Not enough stock available.');
        return;
      }
      await updateDoc(productRef, { quantity: newQuantity });
    }
  };

  const handleDiscountChange = (event) => {
    const discountPercentage = event.target.value;
    setBillingDetails(prevState => ({
      ...prevState,
      discountPercentage,
    }));
  };
  const ClearAllData =() => {
    window.location.reload();
  };

  useEffect(() => {
    updateBillingDetails(cart);
  }, [billingDetails.discountPercentage, customerState, taxOption]);
  function numberToWords(num) {
    const ones = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];

    function convertHundreds(num) {
        let str = '';
        if (num > 99) {
            str += ones[Math.floor(num / 100)] + ' Hundred ';
            num %= 100;
        }
        if (num > 19) {
            str += tens[Math.floor(num / 10)] + ' ';
            num %= 10;
        }
        if (num > 9) {
            str += teens[num - 10] + ' ';
        } else if (num > 0) {
            str += ones[num] + ' ';
        }
        return str.trim();
    }

    function convertToWords(n) {
        if (n === 0) return 'Zero';

        let words = '';

        let i = 0;
        while (n > 0) {
            let rem = n % 1000;
            if (rem !== 0) {
                words = convertHundreds(rem) + ' ' + thousands[i] + ' ' + words;
            }
            n = Math.floor(n / 1000);
            i++;
        }
        return words.trim();
    }

    // Split the number into rupees and paise
    const rupees = Math.floor(num);
    // const paise = Math.round((num - rupees) * 100); // Not used as paise are ignored

    return convertToWords(rupees);
}



function formatGrandTotal(amount) {
  return `${Math.floor(amount).toString()}.00`;
}
const saveBillingDetails = async (newInvoiceNumber) => {
const invoiceNumber = manualInvoiceNumber.trim();
// if (!invoiceNumber) {
//   alert('Please enter a valid invoice number.');
//   return; // Exit the function if the invoice number is empty
// }
cart.forEach(async (item) => {
  await updateProductQuantity(item.productId, item.quantity);
});

const billingDocRef = collection(db, 'waybilling');
try {
  await addDoc(billingDocRef, {
    ...billingDetails,
    customerName,
    customerAddress,
    customerState,
    customerPhoneNo,
    customerEmail,
    customerGSTIN,
    despatchedFrom,  // Transport Details
      despatchedTo,    // Transport Details
      transportName,   // Transport Details
      transportGSTIN,  // Transport Details
      lrNo,            // Transport Details
      transportDate,   // Transport Details
   
    productsDetails: cart.map(item => ({
      productId: item.productId,
      name: item.name,
      saleprice: item.saleprice,
      quantity: item.quantity
    })),
    createdAt: Timestamp.fromDate(selectedDate),
    invoiceNumber, // Use the same invoice number
  });
    console.log('Billing details saved successfully in Firestore');
} catch (error) {
    console.error('Error saving billing details: ', error);
}
};


const generatePDFPage = (doc, copyType, invoiceNumber, logoBase64) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const borderMargin = 10;

  const drawPageBorder = () => {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.rect(borderMargin, borderMargin, pageWidth - 2 * borderMargin, pageHeight - 2 * borderMargin);
  };

  drawPageBorder();

  const headerStartY = 14;
const lineSpacing = 6;
const startX = 18;

const formattedDate = selectedDate.toLocaleDateString('en-GB');

// Add Logo
doc.addImage(logoBase64, 'JPEG', startX, headerStartY + 1, 27, 27); // Increased from 22x22 to 30x30


// Set font and color
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(255, 0, 0);
doc.text('SENTHILKUMAR FIREWORKS INDUSTRIES', startX + 30, headerStartY + 5);

// Address

doc.setTextColor(0, 0, 0);
doc.setFontSize(9);
doc.setFont('helvetica', 'bold');
doc.text('Komalipatti Village', startX + 30, headerStartY + 5 + lineSpacing);
doc.text('Sivakasi,', startX + 30, headerStartY + 5 + 2 * lineSpacing);
doc.text('Virudhunagar.', startX + 30, headerStartY + 5 + 3 * lineSpacing);
doc.text('State: 33-Tamil Nadu', startX + 30, headerStartY + 5 + 4 * lineSpacing);

// Right side Invoice Info
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(255, 0, 0);
doc.text('TAX INVOICE', 150, headerStartY + 5);
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);

  doc.setFontSize(9);
  doc.setTextColor(255, 0, 0);
  doc.text('TAX INVOICE', 150, headerStartY + 5);
const formattedInvoiceNumber = String(invoiceNumber).padStart(3, '0');
doc.text(`Invoice Number: ${formattedInvoiceNumber}`, 150, headerStartY + 1 + 1.7 * lineSpacing);
  doc.setTextColor(0, 0, 0);
  doc.text(`Date: ${formattedDate}`, 150, headerStartY + 2 + 2.5 * lineSpacing);
  doc.text('GSTIN: 33ABVFS6600E1Z4', 150, headerStartY + 3 + 3.3 * lineSpacing);

// Draw outer rectangle
const headerEndY = headerStartY + 5 + 5 * lineSpacing;
doc.setDrawColor(0, 0, 0);
doc.setLineWidth(0.2);
doc.rect(14, headerStartY - 2, 182, headerEndY - headerStartY + 4);


  // Start Customer Details table
 let startY = headerEndY + 5;

const customerDetails = [
 ['TO', '', 'Account Details', ''],
  ['Name', customerName, 'A/c Holder Name', 'SENTIHILKUMAR FIREWORKS INDUSTRIES'],
  ['Address', customerAddress, 'A/c Number', '403536101501661'],
  ['State', customerState, 'Bank Name', 'TAMILNAD MERCANTILE BANK'],
  ['Phone', customerPhoneNo, 'Branch', 'TMB SITHURAJAPURAM'],
  ['Aadhar', customerEmail || '-', 'IFSC Code', 'TMBL0000403'],
  ['GSTIN', customerGSTIN, '', ''],
  ['PAN', customerPan || '-', '', '']
];
const customerStartY = startY; // Save top Y position

doc.autoTable({
  body: customerDetails,
  startY: customerStartY,
  theme: 'plain',
  styles: {
    fontSize: 9,
    textColor: [0, 0, 0],
    cellPadding: 1.5
  },
  columnStyles: {
    0: { fontStyle: 'normal', cellWidth: 27 },
    1: { cellWidth: 60 },
    2: { fontStyle: 'normal', cellWidth: 30 },
    3: { cellWidth: 70,fontSize:8.5, }
  },
  didParseCell: function (data) {
    if (data.row.index === 0 && (data.column.index === 0 || data.column.index === 2)) {
      data.cell.styles.fontSize = 10;
      data.cell.styles.fontStyle = 'bold';
      data.cell.styles.textColor = [204, 0, 102]; // Pink
    }
  },
  didDrawCell: (data) => {
    if (data.cell.section === 'body') {
      data.cell.styles.lineWidth = {
        top: 0,
        bottom: 0,
        left: 0.2,
        right: 0.2
      };
    }
    if (data.cell.section === 'body') {
  // Draw colon after left label (column 0)
 // Left section colon (after column 0)
if (data.column.index === 0 && data.row.index !== 0) {
  const x = data.cell.x + data.cell.width + 0; // ⬅️ increase horizontal spacing
  const y = data.cell.y + data.cell.height / 2 + 0.1; // ⬇️ improve vertical centering
  doc.setFontSize(9);
  doc.text(':', x, y, { baseline: 'middle' });
}

// Right section colon (after column 2) — skip first and last rows
if (
  data.column.index === 2 &&
  data.row.index !== 0 &&
  data.row.index < data.table.body.length - 2 // ✅ Hide last 2 rows
) {
  const x = data.cell.x + data.cell.width;
  const y = data.cell.y + data.cell.height / 2 + 0.1;
  doc.setFontSize(9);
  doc.text(':', x, y, { baseline: 'middle' });
}



}

  }
  
});

// ✅ Draw full outer border
const customerEndY = doc.autoTable.previous.finalY;
doc.setDrawColor(0);
doc.setLineWidth(0.1);
doc.rect(14, customerStartY - 2, 182, customerEndY - customerStartY + 4);

// ✅ Draw center line between left and right section
const centerX = 14 + 25 + 60; // left margin + width of col 0 + col 1 = 99
doc.setDrawColor(0);
doc.setLineWidth(0.2);
doc.line(centerX, customerStartY - 2, centerX, customerEndY + 2); // vertical line


  // Start Products Table
  startY = doc.autoTable.previous.finalY + 3;

  const tableBody = cart.map((item, index) => [
    index + 1,
    item.name,
    '36041000 ',
    item.quantity.toString(),
    `Rs. ${item.saleprice.toFixed(2)}`,
    `Rs. ${(item.saleprice * item.quantity).toFixed(2)}`
  ]);

  tableBody.push(
    [{ content: 'Total Amount:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }, `${Math.round(billingDetails.totalAmount)}.00`],
    [{ content: `Discount (${billingDetails.discountPercentage}%):`, colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }, `${Math.round(billingDetails.totalAmount * (parseFloat(billingDetails.discountPercentage) / 100)).toFixed(2)}`],
    [{ content: 'Sub Total:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }, `${Math.round(billingDetails.discountedTotal)}.00`]
  );

  if (taxOption === 'cgst_sgst') {
    tableBody.push(
      [{ content: 'CGST (9%):', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }, `${Math.round(billingDetails.cgstAmount)}.00`],
      [{ content: 'SGST (9%):', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }, `${Math.round(billingDetails.sgstAmount)}.00`]
    );
  } else if (taxOption === 'igst') {
    tableBody.push(
      [{ content: 'IGST (18%):', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }, `${Math.round(billingDetails.igstAmount)}.00`]
    );
  }

 const totalQuantity = cart.reduce((sum, item) => {
  const quantity = parseFloat(item.quantity);
  return sum + (isNaN(quantity) ? 0 : quantity);
}, 0);
  tableBody.push(
    [{ content: 'Grand Total:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }, `${Math.round(billingDetails.grandTotal)}.00`],
     [

    { content: 'Total Quantity:', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
    `${totalQuantity}`
  ]
  );
  tableBody.push(
        [
          { content: 'Despatched From:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold', fillColor: '#fff',  } }, // Bottom border for this cell
          { content: despatchedFrom || 'N/A', colSpan: 4, styles: { fontStyle: 'normal', fillColor: '#fff',  } } // Bottom border for this cell
        ],
        [
          { content: 'Despatched To:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold', fillColor: '#fff',  } }, // Bottom border for this cell
          { content: despatchedTo || 'N/A', colSpan: 4, styles: { fontStyle: 'normal', fillColor: '#fff',  } } // Bottom border for this cell
        ],
        [
          { content: 'Transport Name:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold', fillColor: '#fff', } }, // Bottom border for this cell
          { content: transportName || 'N/A', colSpan: 4, styles: { fontStyle: 'normal', fillColor: '#fff',} } // Bottom border for this cell
        ],
      );

doc.autoTable({
  head: [['S.No', 'Product Name', 'HSN Code', 'Quantity', 'Rate Per Price', 'Total']],
  body: tableBody,
  startY,
  theme: 'grid',
  headStyles: {
    fillColor: [255, 182, 193],  // Light pink background
    textColor: [0, 0, 139],      // Dark blue text
    lineColor: [0, 0, 0],        // ✅ Black border
    lineWidth: 0.2               // Optional: thin border
  },
  alternateRowStyles: { fillColor: [245, 245, 245] },
  bodyStyles: {
    fillColor: [255, 255, 255],
    textColor: [0, 0, 0],
    lineColor: [0, 0, 0],
    lineWidth: 0.2
  },
  didDrawPage: drawPageBorder
});


  // Terms & Conditions Box
  startY = doc.autoTable.previous.finalY + 10;
  const grandTotalInWords = numberToWords(billingDetails.grandTotal);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 139);
  doc.text(`Rupees: ${grandTotalInWords}`, borderMargin + 5, startY);

  const terms = [
  '1. Goods once sold will not be taken back.',
  '2. All matters Subject to "Sivakasi" jurisdiction only.',
  '3. Certified that the particulars given above are true and correct.'
];

const padding = 10;
const lineHeight = 7;
const boxX = borderMargin + 4;
const boxY = startY + 6;
const boxWidth = pageWidth - 2 * (borderMargin + 4);
const boxHeight = 45; // Increased height to fit 3 lines

doc.setDrawColor(0, 0, 0);
doc.setLineWidth(0.2);
doc.rect(boxX, boxY, boxWidth, boxHeight);

let currentY = boxY + padding;
doc.setFont('helvetica', 'bold');
doc.text('Terms & Conditions', boxX + padding, currentY);

doc.setFont('helvetica', 'normal');
doc.setTextColor(0, 0, 0);

// Draw all terms dynamically
terms.forEach(term => {
  currentY += lineHeight;
  doc.text(term, boxX + padding, currentY);
});

// Signature at the same vertical level as last line
const authSig = 'Authorised Signature';
const authSigWidth = doc.getTextWidth(authSig);
const authSigX = boxX + boxWidth - authSigWidth - padding;
doc.setFont('helvetica', 'bold');
doc.text(authSig, authSigX, currentY);

};

const handleGenerateAllCopies = async () => {
  const invoiceNumber = manualInvoiceNumber.trim();
  if (!invoiceNumber || cart.length === 0) {
    alert("Please enter invoice number and cart items.");
    return;
  }

  await saveBillingDetails(invoiceNumber);
  const doc = new jsPDF();
  const copyTypes = ['Customer COPY'];

  for (let i = 0; i < copyTypes.length; i++) {
    if (i > 0) doc.addPage();
    generatePDFPage(doc, copyTypes[i], invoiceNumber, MyLogo); // <-- pass base64 logo
  }

  doc.save(`WAY BILL-${invoiceNumber}-25.pdf`);
};



// const handleGenerateAllCopies = async () => {
//   await saveBillingDetails(manualInvoiceNumber);
//   transportCopy(manualInvoiceNumber);
//   // salesCopy(manualInvoiceNumber);
//   OfficeCopy(manualInvoiceNumber);
//   Customer(manualInvoiceNumber);
 
//   // CustomerCopy(manualInvoiceNumber)
// };

// const transportCopy = (invoiceNumber) => {
//   generatePDF('TRANSPORT COPY', invoiceNumber);
// };

// const salesCopy = (invoiceNumber) => {
//   generatePDF('SALES COPY', invoiceNumber);
// };

// const OfficeCopy = (invoiceNumber) => {
//   generatePDF('OFFICE COPY', invoiceNumber);
// };
// const Customer = (invoiceNumber) => {
//   generatePDF('Customer COPY', invoiceNumber);
// };
const CustomerCopy = async () => {
 if (cart.length === 0) {
     alert('The cart is empty. Please add items to the cart before saving.');
     return; // Exit the function if the cart is empty
   }
 
   // Validate the invoice number
   const invoiceNumber = manualInvoiceNumber.trim();
   if (!invoiceNumber) {
     alert('Please enter a valid invoice number.');
     return; // Exit the function if the invoice number is empty
   }
   const billingDocRef = collection(db, 'customerBilling');
   
   try {
     
     await addDoc(billingDocRef, {
       ...billingDetails,
       customerName,
       customerAddress,
       customerState,
       customerPhoneNo,
       customerEmail,
       customerGSTIN,
      
       productsDetails: cart.map(item => ({
         productId: item.productId,
         name: item.name,
         saleprice: item.saleprice,
         quantity: item.quantity
       })),
       createdAt: Timestamp.fromDate(selectedDate),
       invoiceNumber, // Use the same invoice number
     });
     console.log('Billing details saved successfully in Firestore');
   } catch (error) {
     console.error('Error saving billing details: ', error);
   }
 
   // Generate and save PDF invoice
    const doc = new jsPDF();
   const pageWidth = doc.internal.pageSize.getWidth();
   const pageHeight = doc.internal.pageSize.getHeight();
   const borderMargin = 10;
 
   const drawPageBorder = () => {
     doc.setDrawColor(0, 0, 0);
     doc.setLineWidth(0.2);
     doc.rect(borderMargin, borderMargin, pageWidth - 2 * borderMargin, pageHeight - 2 * borderMargin);
   };
 
   drawPageBorder();
 
   const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const headerTable = [
    ['T.M.CRACKERS PARK', '', 'TAX INVOICE'],
    ['Address:1/90Z6, Balaji Nagar, Anna Colony', '', 'CUSTOMER COPY'],
    ['Vadamamalapuram ', '', `Invoice Number: ${invoiceNumber}`],
    ['Thiruthangal - 626130', '', `Date: ${selectedDate.getDate().toString().padStart(2, '0')}-${monthNames[selectedDate.getMonth()]}-${selectedDate.getFullYear()}`],
    ['Sivakasi (Zone)', '', 'GSTIN: 33AAVFT8036C1ZZ'],
    ['Virudhunagar (Dist)', '', ''],
    ['State: 33-Tamil Nadu', '', ''],
    ['Phone number: 97514 87277 / 95853 58106', '', '']
   
 ];
 
 const headerStartY = 14;
 
 doc.autoTable({
   body: headerTable,
   startY: headerStartY,
   theme: 'plain',
   styles: { fontSize: 9 },
   margin: { left: 15, right: 30 },
   columnStyles: {
     0: { fontStyle: 'bold', cellWidth: 80 },
     1: { cellWidth: 37 },
     2: { fontStyle: 'bold', halign: 'right', cellWidth: 60 }
   },
   didDrawPage: drawPageBorder,
   didParseCell: function (data) {
     if (data.row.index === 0) {
       data.cell.styles.textColor = [255, 0, 0];
       data.cell.styles.fontSize = 11;
       data.cell.styles.fontStyle = 'bold';
     }
   }
 });
 
 // ⬛ Draw full rectangle around the header table
 const headerEndY = doc.autoTable.previous.finalY;
 const rectX = 14; // Same as left margin
 const rectY = headerStartY - 2; // Small padding above
 const rectWidth = 182;
 const rectHeight = headerEndY - headerStartY + 4; // height + padding
 
 doc.setDrawColor(0, 0, 0);
 doc.setLineWidth(0.2);
 doc.rect(rectX, rectY, rectWidth, rectHeight); // ⬅️ Rectangle around entire headerTable
 
 
let startY = doc.autoTable.previous?.finalY + 5 || 70;

const customerDetails = [
  ['TO'],
  [`Name: ${customerName}`],
  [`Address: ${customerAddress}`],
  [`State: ${customerState}`],
  [`Phone: ${customerPhoneNo}`],
  [`GSTIN: ${customerGSTIN}`],
  [`PAN: ${customerPan}`]
];

const customerStartY = startY;

doc.autoTable({
  body: customerDetails,
  startY: customerStartY,
  theme: 'plain',
  styles: { fontSize: 9 },
  margin: { left: 15, right: 15 },
  columnStyles: {
    0: { cellWidth: 180, fontStyle: 'bold' }
  },
  didParseCell: function (data) {
    if (data.row.index === 0) {
      data.cell.styles.textColor = [204, 0, 102]; // Pinkish red
      data.cell.styles.fontSize = 11;
      data.cell.styles.fontStyle = 'bold';
    }
  }
});

// Draw surrounding rectangle like header style
const customerEndY = doc.autoTable.previous.finalY;
doc.setDrawColor(0);
doc.setLineWidth(0.1);
doc.rect(14, customerStartY - 2, 182, customerEndY - customerStartY + 4);

 
 
 
 
 
   startY = doc.autoTable.previous.finalY + 5;
 
   const tableBody = cart.map((item, index) => [
     (index + 1).toString(),
     item.name,
     '3604',
     item.quantity.toString(),
     `Rs. ${item.saleprice.toFixed(2)}`,
     `Rs. ${(item.saleprice * item.quantity).toFixed(2)}`
   ]);
 
   const FIXED_TABLE_ROWS = 3;
   const usedRows = tableBody.length;
   const emptyRows = FIXED_TABLE_ROWS - usedRows - 6;
   for (let i = 0; i < emptyRows; i++) {
     tableBody.push(['', '', '', '', '', '']);
   }
 
    tableBody.push(
    [{ content: 'Total Amount:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }, `${Math.round(billingDetails.totalAmount)}.00`],
    [{ content: `Discount (${billingDetails.discountPercentage}%):`, colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
     `${Math.round(billingDetails.totalAmount * (parseFloat(billingDetails.discountPercentage) / 100)).toFixed(2)}`],
    [{ content: 'Sub Total:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }, `${Math.round(billingDetails.discountedTotal)}.00`]
  );

  if (taxOption === 'cgst_sgst') {
    tableBody.push(
      [{ content: 'CGST (9%):', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }, `${Math.round(billingDetails.cgstAmount)}.00`],
      [{ content: 'SGST (9%):', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }, `${Math.round(billingDetails.sgstAmount)}.00`]
    );
  } else if (taxOption === 'igst') {
    tableBody.push(
      [{ content: 'IGST (18%):', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }, `${Math.round(billingDetails.igstAmount)}.00`]
    );
  }

 const totalQuantity = cart.reduce((sum, item) => {
  const quantity = parseFloat(item.quantity);
  return sum + (isNaN(quantity) ? 0 : quantity);
}, 0);
  tableBody.push(
    [{ content: 'Grand Total:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }, `${Math.round(billingDetails.grandTotal)}.00`],
     [

    { content: 'Total Quantity:', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
    `${totalQuantity}`
  ]
  );
 tableBody.push(
        [
          { content: 'Despatched From:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold', fillColor: '#fff',  } }, // Bottom border for this cell
          { content: despatchedFrom || 'N/A', colSpan: 4, styles: { fontStyle: 'normal', fillColor: '#fff',  } } // Bottom border for this cell
        ],
        [
          { content: 'Despatched To:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold', fillColor: '#fff',  } }, // Bottom border for this cell
          { content: despatchedTo || 'N/A', colSpan: 4, styles: { fontStyle: 'normal', fillColor: '#fff',  } } // Bottom border for this cell
        ],
        [
          { content: 'Transport Name:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold', fillColor: '#fff', } }, // Bottom border for this cell
          { content: transportName || 'N/A', colSpan: 4, styles: { fontStyle: 'normal', fillColor: '#fff',} } // Bottom border for this cell
        ],
        // [
        //   { content: 'Transport GSTIN:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold', fillColor: '#fff',  } }, // Bottom border for this cell
        //   { content: transportGSTIN || 'N/A', colSpan: 4, styles: { fontStyle: 'normal', fillColor: '#fff',  } } // Bottom border for this cell
        // ],
        // [
        //   { content: 'LR No:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold', fillColor: '#fff', } }, // Bottom border for this cell
        //   { content: lrNo || 'N/A', colSpan: 4, styles: { fontStyle: 'normal', fillColor: '#fff', } } // Bottom border for this cell
        // ],
        // [
        //   { content: 'Transport Date:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold', fillColor: '#fff', } }, // Bottom border for this cell
        //   { content: transportDate ? new Date(transportDate).toLocaleDateString() : 'N/A', colSpan: 4, styles: { fontStyle: 'normal', fillColor: '#fff',   } } // Bottom border for this cell
        // ],
       
        // [
        //   { content: 'Rupees:', colSpan: 1, styles: { halign: 'right', fontStyle: 'bold', fillColor: '#fff', } }, // Bottom border for this cell
        //   { content: `${grandTotalInWords}` || 'N/A', colSpan: 6, styles: { fontStyle: 'normal', fillColor: '#fff',textColor: [0, 0, 139],fontStyle: 'bold', } } // Bottom border for this cell
        // ],
      );
   doc.autoTable({
   head: [['S.No', 'Product Name','HSN Code', 'Quantity', 'Rate Per Price', 'Total']],
   body: tableBody,
   startY,
   theme: 'grid',
   headStyles: { 
     fillColor: [255, 182, 193], 
     textColor: [0, 0, 139], 
     lineWidth: 0.2,
     lineColor: [100, 100, 100] // light gray border
   },
   bodyStyles: { 
     fillColor: [255, 255, 255], 
     textColor: [0, 0, 0], 
     lineWidth: 0.2,
     lineColor: [0, 0, 0] // same border color for body
   },
   alternateRowStyles: { fillColor: [245, 245, 245] },
   didDrawPage: drawPageBorder
 });
 
 
   startY = doc.autoTable.previous.finalY + 8;
   const grandTotalInWords = numberToWords(billingDetails.grandTotal);
   doc.setFont('helvetica', 'bold');
   doc.setFontSize(10);
   doc.setTextColor(0, 0, 139);
   doc.text(`Rupees: ${grandTotalInWords}`, borderMargin + 5, startY);
 
   startY += 10;
   const terms = [
   '1. Goods once sold will not be taken back.',
   '2. All matters Subject to "Sivakasi" jurisdiction only.'
 ];
 
 doc.setFontSize(10);
 doc.setTextColor(0, 0, 0);
 
 // Padding settings
 const padding = 6;
 const lineHeight = 6;
 
 const boxX = borderMargin + 4;
 const boxY = startY;
 const boxWidth = pageWidth - 2 * (borderMargin + 4);
 
 // Estimate box height: padding top + title + each line + signature + padding bottom
 const contentHeight = padding + 6 + terms.length * lineHeight + 10 + padding;
 const boxHeight = contentHeight;
 
 // Draw rectangle border with full padding
 doc.setDrawColor(0, 0, 0);
 doc.setLineWidth(0.2);
 doc.rect(boxX, boxY, boxWidth, boxHeight);
 
 // Title
 let currentY = boxY + padding;
 doc.setFont('helvetica', 'bold');
 doc.text('Terms & Conditions', boxX + padding, currentY);
 
 // Terms list
 // Only show the first term normally
 doc.setFont('helvetica', 'normal');
 currentY += 6;
 doc.text(terms[0], boxX + padding, currentY);
 
 // Now draw the second term and signature on the same line
 currentY += lineHeight;
 const secondTerm = terms[1];
 const authSig = 'Authorised Signature';
 
 doc.setFont('helvetica', 'normal');
 doc.text(secondTerm, boxX + padding, currentY);
 
 // Signature on the same line, aligned to the right
 doc.setFont('helvetica', 'bold');
 const authSigWidth = doc.getTextWidth(authSig);
 const authSigX = boxX + boxWidth - authSigWidth - padding;
 doc.text(authSig, authSigX, currentY);
 


doc.save(`invoice_${invoiceNumber}_CUSTOMERCOPY.pdf`);

};



const handleSearch = (event) => {
const term = event.target.value.toLowerCase();
setSearchTerm(term);

setFilteredProducts(
products.filter(product => {
const productName = product.name ? product.name.toLowerCase() : '';
const productCode = product.sno !== undefined && product.sno !== null
  ? product.sno.toString().toLowerCase()
  : '';
return productName.includes(term) || productCode.includes(term);
})
);
};
 

  const addToCart = (product) => {
    // if (!product.inStock) {
    //   alert("This product is out of stock.");
    //   return;
    // }

    const newItem = {
      productId: product.id,
      name: product.name,
      saleprice: product.saleprice,
      quantity: 1
    };

    const updatedCart = [...cart, newItem];
    setCart(updatedCart);
    updateBillingDetails(updatedCart);
  };

  const handleRemoveFromCart = (productId) => {
    // Find the index of the first item with the matching productId
    const itemIndex = cart.findIndex(item => item.productId === productId);
  
    if (itemIndex !== -1) {
      // Create a new cart array without the item at itemIndex
      const updatedCart = [...cart];
      updatedCart.splice(itemIndex, 1); // Remove one item at the found index
  
      setCart(updatedCart);
      updateBillingDetails(updatedCart);
    }
  };
  

  const handleDateChange = (event) => {
    const newSelectedDate = new Date(event.target.value);
    console.log('Selected Date:', newSelectedDate);
    setSelectedDate(newSelectedDate);
  };
  const handlePriceChange = (productId, saleprice) => {
    const updatedCart = cart.map(item =>
      item.productId === productId
        ? { ...item, saleprice: parseFloat(saleprice) || 0 }
        : item
    );
    setCart(updatedCart);
    updateBillingDetails(updatedCart);
  };
  
 

return (
  <div className="billing-calculator">
    {/* Product Search and Filter */}
    
    <div className="product-list">
    <input
  type="text"
  placeholder="Search Products"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="search-input"
/>

     

     
  <ul>
  {filteredProducts
    .sort((a, b) => {
      // Sort sno as strings
      return a.sno.localeCompare(b.sno, undefined, { numeric: true, sensitivity: 'base' });
    })
    .map(product => (
      <li key={product.id}>
        <div className="product-details">
          <span>{product.name}</span>
          {/* <span>{`(Sales Rs. ${product.saleprice ? product.saleprice.toFixed(2) : '0.00'})`}</span> */}
          <span>{`(InStock Rs. ${product.quantity ? product.quantity : '0'})`}</span>
        </div>
        <button onClick={() => addToCart(product)}>+</button>
      </li>
    ))}
</ul>

    </div>

    {/* Cart Section */}
    <div className="cart">
  <h2>Cart</h2>
  <button
    className="remove-button"
    style={{ display: "flex", position: "relative", left: "530px", bottom: "34px" }}
    onClick={() => ClearAllData()}
  >
    Clear cart
  </button>
  <ul>
    {cart.map((item) => (
      <li key={item.productId}>
        <div className="cart-item">
          <span>{item.name}</span>
          <input
  type="number"
  placeholder="Enter Quantity"
  value={item.quantity || ""}
  onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
   style={{
    width: '80px',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
    boxSizing: 'border-box', // ensures padding is included in width
  }}
/>

<input
  type="number"
  placeholder="Enter Price"
  value={item.saleprice || ""}
  onChange={(e) => handlePriceChange(item.productId, e.target.value)}
  style={{
    width: '80px',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
    boxSizing: 'border-box', // ensures padding is included in width
  }}
/>

          <span style={{padding:"10px"}}>
            Rs.{" "}
            {(item.saleprice && item.quantity
              ? item.saleprice * item.quantity
              : 0
            ).toFixed(2)}
          </span>
          <button className="remove-button" onClick={() => handleRemoveFromCart(item.productId)}>
            Remove
          </button>
        </div>
      </li>
    ))}
  </ul>

      {/* Billing Summary */}
      <div className="billing-summary">
        <div className="billing-details">
          <label>Invoice Number</label>
          <input
            type="text"
            placeholder="Enter Invoice Number"
            value={manualInvoiceNumber}
            onChange={(e) => setManualInvoiceNumber(e.target.value)}
            required
          />
          <label>Discount (%)</label>
          <input
          
            type="text"
            value={billingDetails.discountPercentage}
            onChange={handleDiscountChange}
            min="0"
            max="100"
          />

          <label>Date</label>
          <input
            type="date"
            className="custom-datepicker"
            value={selectedDate.toISOString().substr(0, 10)}
            onChange={handleDateChange}
          />
          <br />
          <br />
          <label>Tax Option</label>
          <select
            value={taxOption}
            onChange={(e) => setTaxOption(e.target.value)}
          >
            <option value="cgst_sgst">CGST + SGST</option>
            <option value="igst">IGST</option>
            <option value="no_tax">No Tax</option>
          </select>
        </div>

        <div className="billing-amounts">
          <table>
            <tbody>
              <tr>
                <td>Total Amount:</td>
                <td>Rs. {billingDetails.totalAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Discounted Total:</td>
                <td>Rs. {billingDetails.discountedTotal.toFixed(2)}</td>
              </tr>
              {taxOption === "cgst_sgst" && (
                <>
                  <tr>
                    <td>CGST (9%):</td>
                    <td>Rs. {billingDetails.cgstAmount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>SGST (9%):</td>
                    <td>Rs. {billingDetails.sgstAmount.toFixed(2)}</td>
                  </tr>
                </>
              )}
              {taxOption === "igst" && (
                <tr>
                  <td>IGST (18%):</td>
                  <td>Rs. {billingDetails.igstAmount.toFixed(2)}</td>
                </tr> 
              )}
              <tr className="grand-total-row">
                <td>Grand Total:</td>
                <td>Rs. {billingDetails.grandTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="customer-search">
  <input
        type="text"
        placeholder="Search Customers"
        value={searchTermForCustomers}
        onChange={(e) => setSearchTermForCustomers(e.target.value)}
        className="search-input"
      />
      {searchTermForCustomers && (
        <div className="dropdown">
          {filteredCustomers.length === 0 ? (
            <div className="dropdown-item">No customers found</div>
          ) : (
            filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="dropdown-item"
                onClick={() => handleCustomerClick(customer)} // Handle click as needed
              >
                <div className="customer-details">
                  <span>{customer.customerName}</span>
                  <span>{customer.customerPhone}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}



    </div>
      
  <div className="customer-search">
      {/* <input
        type="text"
        placeholder="Search Transport"
        value={searchTermForTransport}
        onChange={(e) => setSearchTermForTransport(e.target.value)}
        className="search-input"
      />
      {isSearching && (
        <div className="dropdown">
          {filteredTransport.length === 0 ? (
            <div className="dropdown-item">No transport found</div>
          ) : (
            filteredTransport.map((transport) => (
              <div
                key={transport.id}
                className="dropdown-item"
                onClick={() => handleTransportClick(transport)}
              >
                <div className="customer-details">
                  <span>{transport.transportName}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )} */}

      {/* Display selected transport details */}
      
    </div>
  
      {/* Customer Details Section */}
      <div className="customer-details-toggle">
  {/* <button className="toggle-button" onClick={() => setShowCustomerDetails(!showCustomerDetails)}>
    {showCustomerDetails ? "Hide Customer Details" : "Show Customer Details"}
  </button> */}
</div>

{showCustomerDetails && (
 <div className="customer-details">
 <label>Customer Name</label>
 <input
   type="text"
   value={customerName}
   onChange={(e) => setCustomerName(e.target.value)}
 />
 <label>Customer Address</label>
 <input
   type="text"
   value={customerAddress}
   onChange={(e) => setCustomerAddress(e.target.value)}
 />
 <label>Customer State</label>
 <input
   type="text"
   value={customerState}
   onChange={(e) => setCustomerState(e.target.value)}
 />
 <label>Customer Phone</label>
 <input
   type="text"
   value={customerPhoneNo}
   onChange={(e) => setCustomerPhone(e.target.value)}
 />
 <label>Customer GSTIN</label>
 <input
   type="text"
   value={customerGSTIN}
   onChange={(e) => setCustomerGSTIN(e.target.value)}
 />
 <label>Customer PAN</label>
 <input
   type="text"
   value={customerPan}
   onChange={(e) => setCustomerPAN(e.target.value)}
 />
 <label>Customer AADHAR</label>
 <input
   type="text"
   value={customerEmail}
   onChange={(e) => setCustomerEmail(e.target.value)}
 />
  <label>Despatched From</label>
  <input
    type="text"
    value={despatchedFrom}
    onChange={(e) => setDespatchedFrom(e.target.value)}
  />
  <label>Despatched To</label>
  <input
    type="text"
    value={despatchedTo}
    onChange={(e) => setDespatchedTo(e.target.value)}
  />
  <label>Transport Name</label>
  <input
    type="text"
    value={transportName}
    onChange={(e) => setTransportName(e.target.value)}
  />
  {/* <label>Transport GSTIN</label>
  <input
    type="text"
    value={transportGSTIN}
    onChange={(e) => setTransportGSTIN(e.target.value)}
  />
  <label>LR No</label>
  <input
    type="text"
    value={lrNo}
    onChange={(e) => setLrNo(e.target.value)}
  />
  <label>Transport Date</label>
  <input
    type="date"
    value={transportDate}
    onChange={(e) => setTransportDate(e.target.value)}
  /> */}
</div>

)}


{/* Action Buttons */}
<div className="button-container d-flex flex-wrap gap-2">
<button 
    className="btn btn-outline-secondary" 
    onClick={() => setShowCustomerDetails(!showCustomerDetails)}
  >
    {showCustomerDetails ? "Hide Customer Details" : "Show Customer Details"}
  </button>
 {/* <button 
  className="btn btn-primary" 
  onClick={() => {
    const name = prompt("Enter Product Name:", "Assorted Crackers");
    if (!name) return;

    const priceInput = prompt("Enter Sale Price:");
    const saleprice = parseFloat(priceInput);

    if (isNaN(saleprice)) {
      alert("Invalid price entered.");
      return;
    }

    addToCart({ id: Date.now(), name, saleprice, quantity: 1 });
  }}
>
  Add Custom Product
</button> */}

  <button className="btn btn-success" onClick={handleGenerateAllCopies}>
    Download All Copies
  </button>
  {/* <button 
    className="btn btn-info" 
    style={{ display: "none" }} 
    // onClick={() => transportCopy(invoiceNumber)}
  >
    Transport Copy
  </button>
  <button 
    className="btn btn-warning" 
    style={{ display: "none" }} 
    // onClick={() => salesCopy(invoiceNumber)}
  >
    Sales Copy
  </button>
  <button 
    className="btn btn-danger" 
    style={{ display: "none" }} 
    // onClick={() => OfficeCopy(invoiceNumber)}
  >
    Office Copy
  </button>
  <button className="btn btn-dark" onClick={() => CustomerCopy(invoiceNumber)}>
    Customer Copy
  </button> */}

</div>


    </div>
  </div>
);
};
export default WayBill;
