import React, { useEffect, useState } from "react";
import { db } from "../../pages/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Sidebar from "../Sidebar/Sidebar";
import "./ShowCustomers.css";
import MobileNavbar from "../Mobile Navbar/MobileNavbar";

const ShowCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "customer"));
        const customerList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCustomers(customerList);
      } catch (error) {
        console.error("Error fetching customers: ", error);
      }
    };

    fetchCustomers();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this customer?");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "customer", id));
        setCustomers((prev) => prev.filter((customer) => customer.id !== id));
        alert("Customer deleted successfully.");
      } catch (error) {
        console.error("Error deleting customer: ", error);
        alert("Failed to delete customer.");
      }
    }
  };

  return (
    <div className="main-container2">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div className="content">
        <div className="all-bills-page">
          <MobileNavbar/>
          <div className="header-row">
            <h1>Customer Details</h1>
            <button className="add-customer-btn" onClick={() => navigate("/addcustomer")}>
              Add Customer
            </button>
          </div>

          <div className="table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Phone No</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {customers.length > 0 ? (
                  customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.customerName}</td>
                      <td>{customer.customerAddress}</td>
                      <td>{customer.customerPhoneNo}</td>

                      <td>
                        <button
                          onClick={() => navigate(`/editcustomer/${customer.id}`)}
                          className="edit-btn"
                        >
                          <FaEdit /> Edit
                        </button>

                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="delete-btn"
                        >
                          <MdDelete /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center" }}>
                      No customer data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ShowCustomers;
