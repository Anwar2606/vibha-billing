import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import "./SalesComparisonChart.css";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const SalesComparisonChart = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const invoiceRef = collection(db, "wholesalebilling");

      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const formatDate = (date) => {
        return `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
      };

      const todayStr = formatDate(today);
      const yesterdayStr = formatDate(yesterday);

      let todayTotal = 0;
      let yesterdayTotal = 0;

      const snapshot = await getDocs(invoiceRef);

      snapshot.forEach((doc) => {
        const data = doc.data();

        // Ensure createdAt exists
        if (!data.createdAt) return;

        // Convert Firestore timestamp → JS Date
        const jsDate = data.createdAt.toDate();
        const docDate = formatDate(jsDate);

        // ⭐ Correct field name is grandTotal
        const amount = parseFloat(data.grandTotal || 0);

        if (docDate === todayStr) {
          todayTotal += amount;
        } else if (docDate === yesterdayStr) {
          yesterdayTotal += amount;
        }
      });

      setChartData([
        { day: "Yesterday", totalAmount: yesterdayTotal },
        { day: "Today", totalAmount: todayTotal }
      ]);
    };

    fetchData();
  }, []);

  return (
    <div className="chart-container">
      <h3 className="chart-header">Yesterday vs Today Sales</h3>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalAmount" fill="#8884d8" name="Total Amount (₹)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesComparisonChart;
