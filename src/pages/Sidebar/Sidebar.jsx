import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";
import { GiPayMoney } from "react-icons/gi";
import { LiaMoneyBillWaveAltSolid } from "react-icons/lia";
import {
  FaHome, FaEye, FaEdit, FaFileInvoice, FaArrowAltCircleRight,
  FaArrowCircleLeft, FaChevronDown, FaChevronUp
} from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { TbListNumbers } from "react-icons/tb";
import { HiOutlineDocumentCheck } from "react-icons/hi2";
import { IoIosPerson } from "react-icons/io";
import { HiOutlineDocumentText } from "react-icons/hi2";
import { MdLogout } from "react-icons/md";
import { GrDocumentPdf } from "react-icons/gr";
import { IoDocumentTextOutline, IoPersonCircleSharp } from "react-icons/io5";
import Logo from "../assets/PCW.png"; // Update path if needed
import MyLogo from '../assets/annakshi-logo.jpg';
import { useEffect } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

const Sidebar = ({ isOpen,isOpen2, toggleSidebar }) => {
  const [invoiceOpen, setInvoiceOpen] = useState(false);
   const [isBillsOpen, setIsBillsOpen] = useState(false);
   const [isBillsOpen2, setIsBillsOpen2] = useState(false);
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
 
  const toggleBillsSubMenu = () => {
    setIsBillsOpen(!isBillsOpen);
  };
const toggleBillsSubMenu2 = () => {
    setIsBillsOpen2(!isBillsOpen);
  };
  return (
    <div className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
      
      <ul>
        <li style={{ fontSize: '22px', fontWeight: 'bold', textAlign: 'center', margin: '20px 0', borderBottom: '2px solid #c3b6d0', paddingBottom: '10px' }}>
          {isOpen ? 'Vibha Billing' : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: '-14px' }}>
              <img src={MyLogo} alt="PCW Logo" style={{ width: '50px', height: 'auto' }} />
            </div>
          )}
        </li>
        <li><Link to="/dashboard"><FaHome /> {isOpen && <span>Home</span>}</Link></li>
        <li><Link to="/products"><AiFillProduct /> {isOpen && <span>Products</span>}</Link></li>
        <li><Link to="/invoicecopy"><HiOutlineDocumentText />{isOpen && <span>All Bill</span>} </Link></li>
        <li><Link to="/invoiceeditbill"><HiOutlineDocumentText />{isOpen && <span>Edit Bill</span>} </Link></li>
        <li><Link to="/invoicebill"><LiaMoneyBillWaveAltSolid />{isOpen && <span>Generate Bill </span>} </Link></li>
         {/* <li><Link to="/showcustomers"><IoPersonCircleSharp />{isOpen && <span>Customer</span>} </Link></li> */}
         <li>
  <Link to="/invoice">
    <FaFileInvoice />
    {isOpen && (
      <span style={{ fontWeight: "600", marginLeft: "6px" }}>
        Last Bill Number: {lastInvoiceNumber ?? "Loading..."}
      </span>
    )}
  </Link>
</li>

        {/* <li><Link to="/allbills"><FaEye /> {isOpen && <span>All Bills</span>}</Link></li>
         <li onClick={toggleBillsSubMenu} style={{ cursor: 'pointer' }}>
        <FaEye /> {isOpen && <span>All Bills ▾</span>}
      </li>
      
      {isBillsOpen && isOpen && (
        <ul style={{ listStyle: 'none', paddingLeft: '20px' }}>
          <li><Link to="/wholesalecopy"><GrDocumentPdf /> Whole Sale Copy</Link></li>
          <li><Link to="/retailcopy"><IoDocumentTextOutline /> Retail Copy</Link></li>
          <li><Link to="/invoicecopy"><HiOutlineDocumentText /> Invoice Copy</Link></li>
          <li><Link to="/waybillcopy"><HiOutlineDocumentCheck /> Way Bill Copy</Link></li>
        </ul>
      )} */}
      {/* <li onClick={toggleBillsSubMenu2} style={{ cursor: 'pointer' }}>
        <FaEdit /> {isOpen && <span>Edit Bills ▾</span>}
      </li>
       {isBillsOpen2 && isOpen && (
        <ul style={{ listStyle: 'none', paddingLeft: '20px' }}>
          <li><Link to="/wholesaleeditbill"><GrDocumentPdf /> Wholesale Copy</Link></li>
          <li><Link to="/retaileditbill"><IoDocumentTextOutline /> Retail Copy</Link></li>
          <li><Link to="/invoiceeditbill"><HiOutlineDocumentText /> Invoice Copy</Link></li>
          <li><Link to="/waybilleditbill"><HiOutlineDocumentCheck /> Way Bill Copy</Link></li>
        </ul>
      )} */}
         {/* <li><Link to="/wholesalebill"><GrDocumentPdf />{isOpen && <span>Whole Sale Bill</span>}</Link></li>
        <li><Link to="/retailcalculator"><IoDocumentTextOutline />{isOpen &&<span>Retail Bill</span>}</Link></li>
         <li><Link to="/invoicebill"><HiOutlineDocumentText />{isOpen &&<span>Invoice</span>}</Link></li>
        <li><Link to="/waybill"><HiOutlineDocumentCheck />{isOpen &&<span>Way Bill</span>}</Link></li>
        <li><Link to="/showcustomers"><IoIosPerson /> {isOpen && <span>Customers</span>}</Link></li> */}
        <li><Link to="/invoice"><TbListNumbers />{isOpen && <span>Bill Numbers</span>}</Link></li>
        <li><Link to="/"><MdLogout /> {isOpen && <span>Logout</span>}</Link></li>
        <li className="menu-item">
          <button onClick={toggleSidebar} style={{ padding: '10px', backgroundColor: '#1b2594', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', cursor: 'pointer' }}>
            {isOpen ? <FaArrowCircleLeft style={{ color: 'white' }} /> : <FaArrowAltCircleRight style={{ color: 'white' }} />}
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
