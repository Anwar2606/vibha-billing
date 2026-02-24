import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/vibha-logo.png";
import { useEffect } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { FaFileInvoice } from "react-icons/fa";


const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
 const [lastInvoiceNumber, setLastInvoiceNumber] = useState(null);
 useEffect(() => {
  const q = query(
    collection(db, "invoicebilling"),
    orderBy("createdAt", "desc"),
    limit(1)
  );

  // 🔥 Real-time listener (auto update)
  const unsubscribe = onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      setLastInvoiceNumber(snapshot.docs[0].data().invoiceNumber);
    }
  });

  return () => unsubscribe(); // cleanup listener
}, []);

  return (
    <nav className="navbar">

      {/* Top Row = Brand + Menu Icon */}
      <div className="navbar-header">
       <h1 className="navbar-title">
  <Link to="/dashboard">
    <img src={logo} alt="Billing Logo" className="navbar-logo" />
  </Link>
</h1>


        {/* Mobile Menu Toggle */}
        <div
          className="menu-icon"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✖" : "☰"}
        </div>
      </div>

      {/* MENU LIST */}
      <ul className={`navbar-list ${menuOpen ? "open" : ""}`}>
        <li className="navbar-item">
          <Link to="/dashboard" className="navbar-link">Dashboard</Link>
        </li>
        <li className="navbar-item">
          <Link to="/invoicecopy" className="navbar-link">All Bills</Link>
        </li>
        <li className="navbar-item">
          <Link to="/invoiceeditbill" className="navbar-link">Edit Bills</Link>
        </li>
        {/* <li className="navbar-item">
          <Link to="/showcustomers" className="navbar-link">Customers</Link>
        </li>
        <li className="navbar-item">
          <Link to="/wholesalebill" className="navbar-link">Wholesale Bill</Link>
        </li>
        <li className="navbar-item">
          <Link to="/retailcalculator" className="navbar-link">Retail Bill</Link>
        </li> */}
        <li className="navbar-item">
          <Link to="/invoicebill" className="navbar-link">Generate Bill</Link>
        </li>
        {/* <li className="navbar-item">
          <Link to="/waybill" className="navbar-link">Way Bill</Link>
        </li> */}
        <li className="navbar-item">
          <Link to="/invoice" className="navbar-link">Invoice Number</Link>
        </li>
        <li className="navbar-item">
          <Link to="/products" className="navbar-link">Products</Link>
        </li>
         <li>
          <Link 
  to="/invoice" 
  style={{ textDecoration: "none", display: "flex", alignItems: "center" }}
>
  <span 
    style={{ 
      fontWeight: "800", 
      marginLeft: "6px", 
      color: "black"
    }}
  >
    Last Bill Number: {lastInvoiceNumber ?? "Loading..."}
  </span>
</Link>

        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
