import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./ProductList.css";
import Sidebar from "../Sidebar/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MobileNavbar from "../Mobile Navbar/MobileNavbar";
import Navbar from "../Navbar/Navbar";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [category, setCategory] = useState("");
  const [billFilter, setBillFilter] = useState("");
  const [categoryCounts, setCategoryCounts] = useState({});
  const [billValues, setBillValues] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      let q = collection(db, "products");

      if (category && billFilter) {
        q = query(q, where("category", "==", category), where("bill", "==", billFilter));
      } else if (category) {
        q = query(q, where("category", "==", category));
      } else if (billFilter) {
        q = query(q, where("bill", "==", billFilter));
      } else {
        q = query(q);
      }

      try {
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => a.name.localeCompare(b.name));
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    const fetchExtras = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const categoryCount = {};
      const bills = new Set();

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.category) categoryCount[data.category] = (categoryCount[data.category] || 0) + 1;
        if (data.bill) bills.add(data.bill);
      });

      setCategoryCounts(categoryCount);
      setBillValues([...bills]);
    };

    fetchProducts();
    fetchExtras();
  }, [category, billFilter]);

  const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());
  const handleCategoryChange = (e) => setCategory(e.target.value);
  const handleBillFilterChange = (e) => setBillFilter(e.target.value);

  const deleteProduct = async (id, e) => {
    e.stopPropagation();
    await deleteDoc(doc(db, "products", id));
    setProducts(products.filter(p => p.id !== id));
  };

  const toggleDescription = (id) => {
    setProducts(products.map(p => p.id === id ? { ...p, expanded: !p.expanded } : p));
  };

  const downloadPDF = () => {
    const docPDF = new jsPDF();
    const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name));
    const grouped = sorted.reduce((acc, cur) => {
      acc[cur.category] = acc[cur.category] || [];
      acc[cur.category].push(cur);
      return acc;
    }, {});

    let y = 50;
    Object.keys(grouped).forEach(cat => {
      docPDF.setFontSize(16).text(cat, 14, y);
      y += 10;
      docPDF.autoTable({
        head: [["S.No", "Name", "Price", "Category"]],
        body: grouped[cat].map(p => [p.sno, p.name, `Rs. ${p.saleprice}`, p.category]),
        startY: y,
        margin: { top: 10 },
        didDrawPage: data => { y = data.cursor.y + 10; },
      });
      y = docPDF.previousAutoTable.finalY + 10;
    });

    docPDF.save("Product_List.pdf");
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedProducts(!selectAll ? products.map(p => p.id) : []);
  };

  const bulkDelete = async () => {
    if (selectedProducts.length === 0) return toast.warn("No products selected");
    const toastId = toast.loading("Deleting...");
    try {
      await Promise.all(selectedProducts.map(id => deleteDoc(doc(db, "products", id))));
      setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
      setSelectedProducts([]);
      toast.update(toastId, { render: "Deleted!", type: "success", isLoading: false, autoClose: 3000 });
    } catch {
      toast.update(toastId, { render: "Error!", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  const filteredProducts = products.filter(p =>
    (p.name.toLowerCase().includes(searchTerm) || p.sno.toString().includes(searchTerm))
  );

  return (
    <div className="main-container">
      <Sidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
      <div className="content-container">
        {/* 📱 MOBILE NAVBAR (Visible only on mobile) */}
<MobileNavbar/>
        <h2 className="product-list-title">Product List({filteredProducts.length} Products)</h2>
        <input
          type="text"
          className="product-list-input"
          placeholder="Search"
          value={searchTerm}
          onChange={handleSearch}
        />

       <select
  className="category-select"
  value={category}
  onChange={handleCategoryChange}
>
  <option value="">All Categories</option>
  {Object.entries(categoryCounts).map(([cat, count]) => (
    <option key={cat} value={cat}>
      {cat} ({count})
    </option>
  ))}
</select>


        

        <div className="button-row">
          <button onClick={handleSelectAll}>
            {selectAll ? "Deselect All" : "Select All"}
          </button>
          <button onClick={bulkDelete}>Bulk Delete</button>
          <button onClick={() => navigate("/addproduct")}>New Product</button>
          <button onClick={() => navigate("/bulkupload")}>Bulk Upload</button>
          <button onClick={downloadPDF}>Download PDF</button>
        </div>

        <ul className="product-list">
          {filteredProducts.map(product => (
            <li key={product.id} className="product-item">
              <input
                type="checkbox"
                className="product-checkbox"
                checked={selectedProducts.includes(product.id)}
                onChange={(e) => {
                  const id = product.id;
                  setSelectedProducts(prev =>
                    e.target.checked ? [...prev, id] : prev.filter(p => p !== id)
                  );
                }}
              />
              <div className="product-info" onClick={() => toggleDescription(product.id)}>
                <div className="products-details">
                  <div className="product-name">{product.name}</div>
                  {product.expanded && (
                    <div className="product-description">{product.description}</div>
                  )}
                  <div className="product-price">Rs. {product.saleprice}</div>
                  <div className="product-price">In Stock: {product.quantity}</div>
                </div>
              </div>
              <div className="product-actions">
                <Link to={`/edit-product/${product.id}`}>
                  <button className="edit-button">Edit</button>
                </Link>
                <button className="delete-button" onClick={(e) => deleteProduct(product.id, e)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default ProductList;
