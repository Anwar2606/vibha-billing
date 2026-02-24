import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import'./Mychart.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MyBarChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchTotals = async () => {
      const billingRef = collection(db, "invoicebilling");

      // TODAY
      const today = new Date();
      const todayStart = new Date(today.setHours(0, 0, 0, 0));
      const todayEnd = new Date(today.setHours(23, 59, 59, 999));

      // YESTERDAY
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yesterdayStart = new Date(y.setHours(0, 0, 0, 0));
      const yesterdayEnd = new Date(y.setHours(23, 59, 59, 999));

      // Firestore Queries
      const qToday = query(
        billingRef,
        where("createdAt", ">=", todayStart),
        where("createdAt", "<=", todayEnd)
      );
      const qYesterday = query(
        billingRef,
        where("createdAt", ">=", yesterdayStart),
        where("createdAt", "<=", yesterdayEnd)
      );

      const todaySnap = await getDocs(qToday);
      const yesterdaySnap = await getDocs(qYesterday);

     let todayTotal = 0;
todaySnap.forEach((doc) => {
  todayTotal += Math.round(doc.data().grandTotal || 0); // Whole value only
});

let yesterdayTotal = 0;
yesterdaySnap.forEach((doc) => {
  yesterdayTotal += Math.round(doc.data().grandTotal || 0);
});

      setData([
        { name: "Yesterday", grandTotal: yesterdayTotal },
        { name: "Today", grandTotal: todayTotal },
      ]);
    };

    fetchTotals();
  }, []);

  return (
    <div className="sales-chart-box">
      <h2 className="sales-chart-title">Today vs Yesterday Sales</h2>

      <div className="sales-chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="grandTotal" fill="#4CAF50" barSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MyBarChart;
