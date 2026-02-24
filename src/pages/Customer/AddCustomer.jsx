import React, { useState } from "react";
import { db } from "../../pages/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { FaHome, FaEye, FaEdit, FaFileInvoice, FaArrowCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { TbListNumbers } from "react-icons/tb";
import { MdLogout } from "react-icons/md";
import Logo from "../assets/PCW.png"; // Adjust the path as per your project
import { IoIosPerson } from "react-icons/io";
import Sidebar from "../Sidebar/Sidebar";
import './AddCustomer.css';
import MobileNavbar from "../Mobile Navbar/MobileNavbar";
const AddCustomer = () => {
  const [isOpen, setIsOpen] = useState(true); // Sidebar state
  const [customerDetails, setCustomerDetails] = useState({
    customerName: "",
    customerAddress: "",
    // customerState: "",
    customerPhoneNo: "",
    // customerGSTIN: "",
    // customerPan: "",
    // customerEmail: "",
  });

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "customer"), customerDetails);
      alert("Customer added successfully!");
      setCustomerDetails({
        customerName: "",
        customerAddress: "",
        // customerState: "",
        customerPhoneNo: "",
        // customerGSTIN: "",
        // customerPan: "",
        // customerEmail: "",
      });
    } catch (error) {
      console.error("Error adding customer: ", error);
      alert("Failed to add customer!");
    }
  };

  return (
  <div className="customer-main">
   
    <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

    <div className="customer-content">
      
      <div className="customer-card">
        <MobileNavbar/>
        <h2 className="customer-title">Add Customer</h2>

        <form onSubmit={handleSubmit} className="customer-form">
          <label className="customer-label">
            Customer Name
            <input
              type="text"
              name="customerName"
              value={customerDetails.customerName}
              onChange={handleChange}
              className="customer-input"
              required
            />
          </label>

          <label className="customer-label">
            Address
            <input
              type="text"
              name="customerAddress"
              value={customerDetails.customerAddress}
              onChange={handleChange}
              className="customer-input"
              required
            />
          </label>

          <label className="customer-label">
            Phone Number
            <input
              type="text"
              name="customerPhoneNo"
              value={customerDetails.customerPhoneNo}
              onChange={handleChange}
              className="customer-input"
              required
            />
          </label>

          <div className="customer-btn-group">
            <button type="submit" className="customer-btn save">
              Add Customer
            </button>
            <button
              type="button"
              className="customer-btn cancel"
              onClick={() =>
                setCustomerDetails({
                  customerName: "",
                  customerAddress: "",
                  customerPhoneNo: "",
                })
              }
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
);

};

export default AddCustomer;
