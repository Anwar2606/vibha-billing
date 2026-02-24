import React, { useState, useEffect } from "react";
import { db } from "../firebase"; // Adjust the path based on your project structure
import { collection, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";
import { FaArrowAltCircleRight, FaArrowCircleLeft, FaEdit, FaEye, FaFileInvoice, FaHome, FaPlus, FaTruck } from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { IoIosPerson } from "react-icons/io";
import { TbListNumbers } from "react-icons/tb";
import { MdLogout } from "react-icons/md";
import Logo from "../assets/PCW.png"; 
import Sidebar from "../Sidebar/Sidebar";

const ShowTransportDetails = () => {
  const [transportDetails, setTransportDetails] = useState([]);
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "transportDetails"), (snapshot) => {
      const transportData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransportDetails(transportData);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  return (
    <div className="main-container2">
      {/* Sidebar */}
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      {/* Main Content */}
      <div className="content">
        <div className="container">
          <div className="header">
            <h2 className="heading">Transport Details </h2>
            <Link to="/addTransport" className="add-transport-btn">
               Add Transport Details
            </Link>
          </div>

          <table className="products-table">
            <thead>
              <tr>
                <th>Transport Name</th>
                <th>GSTIN</th>
              </tr>
            </thead>
            <tbody>
              {transportDetails.length > 0 ? (
                transportDetails.map((item) => (
                  <tr key={item.id}>
                    <td>{item.transportName}</td>
                    <td>{item.transportGstin}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">No transport details found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSS Styling */}
      <style jsx>{`
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .add-transport-btn {
          background-color: #1b2594;
          color: white;
          padding: 10px 15px;
          display: flex;
          align-items: center;
          border-radius: 5px;
          text-decoration: none;
          font-size: 14px;
        }

        .add-transport-btn svg {
          margin-right: 5px;
        }

        .add-transport-btn:hover {
          background-color: #161d7a;
        }
      `}</style>
    </div>
  );
};

export default ShowTransportDetails;
