import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { Link } from "react-router-dom";
import { FaHome, FaEye, FaEdit, FaFileInvoice, FaArrowCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { IoIosPerson } from "react-icons/io";
import { TbListNumbers } from "react-icons/tb";
import { MdLogout } from "react-icons/md";
import Logo from "../assets/PCW.png"; 
import './AddTransportDetails.css';
import Sidebar from "../Sidebar/Sidebar";
const AddTransportDetails = () => {
  const [transportData, setTransportData] = useState({
    transportName: "",
    transportGstin: "",
  });
  const [isOpen, setIsOpen] = useState(true);

  const handleChange = (e) => {
    setTransportData({ ...transportData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "transportDetails"), {
        ...transportData,
        timestamp: Timestamp.now(),
      });
      alert("Transport details added successfully!");
      setTransportData({
        transportName: "",
        transportGstin: "",
      });
    } catch (error) {
      console.error("Error adding transport details:", error);
      alert("Failed to add transport details.");
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="main-container flex">
      {/* Sidebar */}
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      {/* Main Content */}
      <div className="content">
      <div className="container">
        <h2 className="heading">Add Transport Details</h2>
        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            name="transportName"
            placeholder="Transport Name"
            value={transportData.transportName}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            type="text"
            name="transportGstin"
            placeholder="Transport GSTIN"
            value={transportData.transportGstin}
            onChange={handleChange}
            className="input"
            required
          />
          <button type="submit" className="button">
            Add Transport Details
          </button>
        </form>
      </div>
    </div>
    </div>
  );
};

export default AddTransportDetails;
