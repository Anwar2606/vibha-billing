import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import Sidebar from '../Sidebar/Sidebar';
import './InvoiceNumberPage.css'
import MobileNavbar from '../Mobile Navbar/MobileNavbar';

const InvoiceNumbersPage = () => {
  const [invoiceBillingInvoices, setInvoiceBillingInvoices] = useState([]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        // ✅ Fetch ONLY invoicebilling collection
        const invoiceBillingQuery = query(
          collection(db, 'invoicebilling'),
          orderBy('createdAt', 'desc')
        );

        const invoiceBillingSnapshot = await getDocs(invoiceBillingQuery);

        const invoiceBillingInvoices = invoiceBillingSnapshot.docs.map(
          (doc) => doc.data().invoiceNumber
        );

        setInvoiceBillingInvoices(invoiceBillingInvoices);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    };

    fetchInvoices();
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

return (
  <div className="invoice-page">
    <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

    <div className="invoice-content">
      <MobileNavbar/>
      <h1 className="invoice-title">Latest Bill Numbers</h1>

      <div className="invoice-section">
        <h2 className="section-title">Bill Numbers</h2>

        {invoiceBillingInvoices.length > 0 ? (
          <div className="invoice-list">
            {invoiceBillingInvoices.map((invoice, index) => (
              <div key={index} className="invoice-card">
                <span className="invoice-number">{invoice}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-invoices">
            No invoices found in invoicebilling collection.
          </p>
        )}
      </div>
    </div>
  </div>
);

};

export default InvoiceNumbersPage;
