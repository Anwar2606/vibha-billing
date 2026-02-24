import React, { useEffect, useState } from "react";
import { db } from "../../pages/firebase";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Sidebar from "../Sidebar/Sidebar";
import './EditCustomer.css';
import MobileNavbar from "../Mobile Navbar/MobileNavbar";

const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [customer, setCustomer] = useState({
    customerName: "",
    customerAddress: "",
    // customerState: "",
    customerPhoneNo: "",
    // customerGSTIN: "",
    // customerPan: "",
    // customerEmail: "",
  });

  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const docRef = doc(db, "customer", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCustomer(docSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (err) {
        console.error("Error fetching customer:", err);
      }
    };
    fetchCustomer();
  }, [id]);

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "customer", id);
      await updateDoc(docRef, customer);
      alert("Customer updated successfully!");
      navigate("/showcustomers");
    } catch (err) {
      console.error("Error updating customer:", err);
    }
  };

  return (
    <div className="main-container2">
      {/* Sidebar */}
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
<MobileNavbar/>

      {/* Main Content */}
      <div className="content">
        <div className="edit-customer-page">
          <h1>Edit Customer Details</h1>
          <form onSubmit={handleUpdate} className="edit-form">
            {Object.entries(customer).map(([key, value]) => (
              <div key={key} className="form-group">
                <label className="form-label">{key.replace("customer", "").toUpperCase()}</label>
                <input
                  type="text"
                  name={key}
                  value={value}
                  onChange={handleChange}
                  required={key === "customerName"}
                  className="form-input"
                />
              </div>
            ))}
            <button type="submit" className="submit-button">
              Update Customer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCustomer;
