import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./MobileNavbar.css";
import { db } from "../firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const MobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastInvoiceNumber, setLastInvoiceNumber] = useState(null);

  useEffect(() => {
    const fetchLastInvoice = async () => {
      try {
        const q = query(
          collection(db, "invoicebilling"),
          orderBy("createdAt", "desc"),
          limit(1)
        );

        const snap = await getDocs(q);

        if (!snap.empty) {
          setLastInvoiceNumber(snap.docs[0].data().invoiceNumber);
        }
      } catch (error) {
        console.error("Error fetching last invoice:", error);
      }
    };

    fetchLastInvoice();
  }, []);

  return (
    <>
      {/* 📱 Mobile Top Bar */}
      <div className="mobile-navbar">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="mobile-nav-btn"
        >
          ☰ Menu
        </button>
      </div>

      {/* 📲 Dropdown Menu */}
      {isOpen && (
        <div className="mobile-menu">
          <ul>
            <li>
              <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                Dashboard
              </Link>
            </li>

            <li>
              <Link to="/products" onClick={() => setIsOpen(false)}>
                Products
              </Link>
            </li>

            <li>
              <Link to="/invoicecopy" onClick={() => setIsOpen(false)}>
                All Bill
              </Link>
            </li>

            <li>
              <Link to="/invoiceeditbill" onClick={() => setIsOpen(false)}>
                Edit Bill
              </Link>
            </li>

            <li>
              <Link to="/invoicebill" onClick={() => setIsOpen(false)}>
                Generate Bill
              </Link>
            </li>

            {/* ⭐ LAST BILL NUMBER */}
            <li>
              <Link to="/invoice" onClick={() => setIsOpen(false)}>
                Last Bill Number:{" "}
                <span style={{ fontWeight: "600" }}>
                  {lastInvoiceNumber ?? "Loading..."}
                </span>
              </Link>
            </li>

          </ul>
        </div>
      )}
    </>
  );
};

export default MobileNavbar;
