import React, { useEffect, useState } from "react";
import "./NewHome.css";
import { 
    FaHome, FaInfoCircle, FaServicestack, FaEnvelope, 
    FaArrowAltCircleRight, FaArrowCircleLeft, FaEye, 
    FaEdit, FaFileInvoice, FaTruck
} from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { MdLogout } from "react-icons/md";
import { Bar } from "react-chartjs-2";
import { 
    Chart as ChartJS, CategoryScale, LinearScale, 
    BarElement, Title, Tooltip, Legend 
} from "chart.js";
import { IoIosPerson } from "react-icons/io";
import { TbListNumbers } from "react-icons/tb";
import Logo from "../assets/PCW.png";
import Card1 from "../assets/card1.png";
import Card2 from "../assets/cardnew22.png";
import Card3 from "../assets/cardnew3.png";
import Card22 from "../assets/card22.png";
import { collection, getDocs, query, Timestamp, where } from "firebase/firestore";
import { db } from "../firebase";
import SalesComparisonChart from "../Chart/SalesComparisonChart";
import { Link } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import MobileNavbar from "../Mobile Navbar/MobileNavbar";
import MyBarChart from "../My Chart/Mychart";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const NewHome = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [totalBills, setTotalBills] = useState(0);
    const [uniqueCustomers, setUniqueCustomers] = useState(0);
    const [todaySales, setTodaySales] = useState(0);
    const [monthSales, setMonthSales] = useState(0);
    const [monthlySales, setMonthlySales] = useState(Array(12).fill(0));
    const [lastMonthTotal, setLastMonthTotal] = useState(0);
const [thisMonthTotal, setThisMonthTotal] = useState(0);

    useEffect(() => {
        const fetchCustomerCount = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "customer"));
                setUniqueCustomers(querySnapshot.size);
            } catch (error) {
                console.error("Error fetching customer data:", error);
            }
        };
        fetchCustomerCount();
    }, []);

    useEffect(() => {
    const fetchTodaySales = async () => {
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));

      try {
        const q = query(
          collection(db, "invoicebilling"),
          where("date", ">=", Timestamp.fromDate(startOfDay)),
          where("date", "<=", Timestamp.fromDate(endOfDay))
        );

        const snapshot = await getDocs(q);
        let total = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          const amount = parseFloat(data.totalAmount ?? 0);
          if (!isNaN(amount)) total += amount;
        });

        setTodaySales(total);
      } catch (error) {
        console.error("Error fetching today's sales:", error);
      }
    };

    fetchTodaySales();
  }, []);
  useEffect(() => {
  const fetchTotalBills = async () => {
    try {
      const snapshot = await getDocs(collection(db, "invoicebilling"));
      setTotalBills(snapshot.size);
    } catch (error) {
      console.error("Error fetching total bills:", error);
    }
  };

  fetchTotalBills();
}, []);

useEffect(() => {
  const fetchMonthSales = async () => {
    try {
      const billingRef = collection(db, "invoicebilling");

      const now = new Date();

      // THIS MONTH RANGE
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      // LAST MONTH RANGE
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

      // Query THIS MONTH
      const qThisMonth = query(
        billingRef,
        where("createdAt", ">=", startOfThisMonth),
        where("createdAt", "<=", endOfThisMonth)
      );

      // Query LAST MONTH
      const qLastMonth = query(
        billingRef,
        where("createdAt", ">=", startOfLastMonth),
        where("createdAt", "<=", endOfLastMonth)
      );

      const snapThisMonth = await getDocs(qThisMonth);
      const snapLastMonth = await getDocs(qLastMonth);

      let thisMonthTotalValue = 0;
      snapThisMonth.forEach((doc) => {
        thisMonthTotalValue += doc.data().totalAmount || 0;
      });

      let lastMonthTotalValue = 0;
      snapLastMonth.forEach((doc) => {
        lastMonthTotalValue += doc.data().totalAmount || 0;
      });

      setThisMonthTotal(thisMonthTotalValue);
      setLastMonthTotal(lastMonthTotalValue);

    } catch (error) {
      console.error("Error fetching month sales:", error);
    }
  };

  fetchMonthSales();
}, []);

   
    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    

    return (
        <div className="main-container">
            <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
            <MobileNavbar/>
            <div className="content-container">
              
                <div className="card-container">
                      
                    <div className="card">
                        
                        <div className="text-container">
                            <h3>Total Bills</h3>
                            <p>{totalBills}</p>
                        </div>
                        <div className="image-container">
                            <img src={Card1} alt="Card 1" />
                        </div>
                    </div>
                    <div className="card">
                        <div className="text-container">
                            <h3>Customers</h3>
                            <p>{uniqueCustomers}</p>
                        </div>
                        <div className="image-container">
                            <img src={Card2} alt="Card 2" />
                        </div>
                    </div>
                    <div className="card">
  <div className="text-container">
    <h3>Last Month</h3>
    <p>₹{lastMonthTotal.toFixed(2)}</p>
  </div>
  <div className="image-container">
    <img src={Card3} alt="Card 3" />
  </div>
</div>

<div className="card">
  <div className="text-container">
    <h3>This Month</h3>
    <p>₹{thisMonthTotal.toFixed(2)}</p>
  </div>
  <div className="image-container">
    <img src={Card22} alt="Card 4" />
  </div>
</div>

                </div>

               
    <MyBarChart />

            </div>
        </div>
    );
};

export default NewHome;
