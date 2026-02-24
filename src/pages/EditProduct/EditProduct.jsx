import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import './EditProduct.css';
import { FaHome, FaEye, FaEdit, FaFileInvoice, FaArrowCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { TbListNumbers } from "react-icons/tb";
import { MdLogout } from "react-icons/md";
import Logo from "../assets/PCW.png";
import { IoIosPerson } from "react-icons/io";
import Sidebar from "../Sidebar/Sidebar";
import MobileNavbar from "../Mobile Navbar/MobileNavbar";

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [product, setProduct] = useState(null);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [sno, setSno] = useState("");
  const [inStock, setInStock] = useState(false);
  const [regularPrice, setRegularPrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [category, setCategory] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      const productDoc = doc(db, "products", id);
      const docSnap = await getDoc(productDoc);
      if (docSnap.exists()) {
        const productData = docSnap.data();
        setProduct(productData);
        setName(productData.name);
        setQuantity(productData.quantity);
        setInStock(productData.inStock);
        setSno(productData.sno);
        setRegularPrice(productData.regularprice);
        setSalePrice(productData.saleprice);
        setCategory(productData.category);
      }
    };

    fetchProduct();
  }, [id]);

  const handleUpdate = async () => {
    const productData = {
      name,
      quantity,
      sno,
      inStock,
      regularprice: parseFloat(regularPrice),
      saleprice: parseInt(salePrice),
      category,
    };

    const productRef = doc(db, "products", id);
    await updateDoc(productRef, productData);

    navigate("/products");
  };

  if (!product) return <div>Loading...</div>;
  const toggleSidebar = () => setIsOpen(!isOpen);
  return (
    <div className="main-container">
      {/* Sidebar */}
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="content-container">
        <div className="Edit-page">
          <MobileNavbar/>
          <h2 className="Page-title">Edit Product</h2>
          <label>Product name:</label>
          <input
            className="Edit-input1"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product Name"
          />
          <label>Product code:</label>
          <input
            className="Edit-input1"
            type="text"
            value={sno}
            onChange={(e) => setSno(e.target.value)}
            placeholder="Product Code"
          />
          <label>Regular Price:</label>
          <input
            className="Edit-input2"
            type="number"
            value={regularPrice}
            onChange={(e) => setRegularPrice(e.target.value)}
            placeholder="Regular Price"
          />
          <label>Sale Price:</label>
          <input
            className="Edit-input2"
            type="number"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            placeholder="Sale Price"
          />
          <label>Number Of Stocks:</label>
          <input
            className="Edit-input1"
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Quantity"
          /><br></br>
          <label>In Stock:</label>
          <select
            className="custom-select"
            value={inStock}
            onChange={(e) => setInStock(e.target.value)}
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
          <br />
          <br />
          <button className="Edit-btn" onClick={handleUpdate}>
            Update
          </button>
          <button
            className="Edit-btn"
            onClick={() => navigate("/products")}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductPage;