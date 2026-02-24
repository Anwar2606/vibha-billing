import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import AddProduct from './pages/Add Product/AddProduct';
import ProductList from './pages/ProductList/ProductList';
import { db } from './pages/firebase';
import BillingCalculator from './pages/Dashboard/BillingCalculator';
import Navbar from './pages/Navbar/Navbar';
import './App.css';
import MultipleProducts from './pages/MultipleProducts/MultipleProducts';
import BulkUpload from './pages/BulkUpload/BulkUpload';
import EditProductPage from './pages/EditProduct/EditProduct';
import TodaySales from './pages/TodaySales/TodaySales';
import GraphComponent from './pages/Chart/SalesComparisonChart';
import HomePage from './pages/Home/HomePage';
import Grid from './pages/Grid/Grid';
import LoginPage from './pages/Login/LoginPage';
import fetchDataAndGenerateExcel from './pages/DownloadData/DownloadData';
import Edit from './pages/sampleEdit/SampleEdit';
import AllBillsPage from './pages/AllBills/AllBillsPage';
import InvoiceNumbersPage from './pages/Invoice Numbers/InvoiceNumbersPage';
import DownloadBillingData from './pages/Download bill/DownloadBillingData';
import NewHome from './pages/Home/NewHome';
import EditBillPage from './pages/EditBilll/InvoiceEditBill';
import AddCustomer from './pages/Customer/AddCustomer';
import ShowCustomers from './pages/Show Customers/ShowCustomers';
import MergePDFs from './pages/Merge Pdf/MergePdf';
import AddTransportDetails from './pages/Add Transport Details/AddTransportDetails';
import ShowTransportDetails from './pages/ShowTransport/ShowTransportDetails';
import RetailCalculator from './pages/Retail/RetailCalculator';
import WholesaleBill from './pages/Wholesale Bill/Wholesalebill';
import WayBill from './pages/Way Bill/WayBill';
import WholesaleCopy from './pages/Wholesale Copy/WholesaleCopy';
import RetailCopy from './pages/Retail Copy/RetailCopy';
import InvoiceCopy from './pages/Invoice Copy/InvoiceCopy';
import InvoiceEditBillPage from './pages/EditBilll/InvoiceEditBill';
import RetailEditBillPage from './pages/Retail Edit bill/RetailEditBill';
import WholesaleEditBillPage from './pages/Edit Wholesale Copy/EditWholesaleCopy';
import WayBillCopy from './pages/Way bill copy/WayBillCopy';
import WayBillEditBillPage from './pages/Edit Waybill/EditWayBill';
import EditCustomer from './pages/Edit Customer/EditCustomer';
import MyBarChart from './pages/My Chart/Mychart';




const App = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [invoiceData, setInvoiceData] = useState(null);
  

  const handleProductSelect = (product) => {
    const existingProduct = selectedProducts.find(p => p.id === product.id);
    if (existingProduct) {
      setSelectedProducts(
        selectedProducts.map(p =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        )
      );
    } else {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };
  const handleDownload = async () => {
    try {
      await fetchDataAndGenerateExcel('products');
    } catch (error) {
      console.error('Error downloading data:', error);
    }
  };
  const handleGenerateInvoice = () => {
    const products = selectedProducts.map(product => ({
      ...product,
      total: product.price * product.quantity * (1 - product.discount / 100) * 1.18, // Apply discount and GST
    }));

    const total = products.reduce((acc, product) => acc + product.total, 0);
    setInvoiceData({ products, total });
  };
  const location = useLocation();

// Determine if the current path is the billing or retail calculator page
const isBillingPage = location.pathname === '/invoicebill' || location.pathname === '/retailcalculator' || location.pathname === '/wholesalebill' || location.pathname === '/waybill';

  return (
    
      <div>
         <button style={{display:"none"}} onClick={handleDownload}>Download Data</button>
         {isBillingPage && <Navbar />}
        <Routes>
        <Route path="/todaysales" element={<TodaySales />} />
        <Route path="/invoice" element={<InvoiceNumbersPage />} />
        <Route path="/downloadbill" element={<DownloadBillingData />} />
        <Route path="/addTransport" element={<AddTransportDetails />}/>
          <Route path="/addproduct" element={<AddProduct />} />
          <Route path="/dashboard" element={<NewHome />} />
          <Route path="/" element={<LoginPage />} />
          <Route path="/pdf" element={<MergePDFs />} />
          <Route path="/showtransport" element={<ShowTransportDetails />} />
          <Route path="/invoiceeditbill" element={<InvoiceEditBillPage/>} />
          <Route path="/retaileditbill" element={<RetailEditBillPage/>} />
          <Route path="/waybilleditbill" element={<WayBillEditBillPage/>} />
          <Route path="/wholesaleeditbill" element={<WholesaleEditBillPage/>} />
          <Route path="/retailcopy" element={<RetailCopy />} />
          <Route path="/invoicecopy" element={<InvoiceCopy />} />
          <Route path="/waybillcopy" element={<WayBillCopy />} />
          <Route path="/wholesalecopy" element={<WholesaleCopy />} />
          <Route path="/wholesalebill" element={<WholesaleBill />} />
          <Route path="/editcustomer/:id" element={<EditCustomer />} />
           <Route path="/waybill" element={<WayBill />} />
          <Route path="/showcustomers" element={<ShowCustomers />} />
          <Route path="/addcustomer" element={<AddCustomer />} />
          <Route path="/grid" element={<Grid />} />
          <Route path="/retailcalculator" element={<RetailCalculator />} />
          <Route path="/allbills" element={<AllBillsPage />} />
          <Route path="/graph" element={<GraphComponent />} />
           <Route path="/mychart" element={<MyBarChart />} />
          <Route path="/invoicebill" element={<BillingCalculator />} />
          <Route path="/multipleproducts" element={<MultipleProducts />} />
          <Route path="/bulkupload" element={<BulkUpload />} />
          <Route path="/products" element={<ProductList />} />
        <Route path="/edit-product/:id" element={<EditProductPage />} />
        <Route path="/home" element={<HomePage />} />
          <Route path="/products" element={
            <>
              <ProductList onSelect={handleProductSelect} />
            </>
          } />
        </Routes>
      </div>
   
  );
};

export default App;
