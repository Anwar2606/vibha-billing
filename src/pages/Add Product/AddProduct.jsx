import React, { useState } from 'react';
import { db } from '../firebase';
import { addDoc, collection } from 'firebase/firestore';
import Sidebar from '../Sidebar/Sidebar';
import './Addproduct.css'; // ✅ Add this line for custom styles

const AddProduct = () => {
  const [sno, setSno] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [name, setName] = useState('');
  const [inStock, setInStock] = useState('');
  const [saleprice, setSalePrice] = useState('');
  const [regularprice, setRegularPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [bill, setBill] = useState('');

  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, 'products'), {
        sno,
        name,
        inStock,
        saleprice: parseFloat(saleprice),
        regularprice: parseFloat(regularprice),
        quantity: parseInt(quantity),
        category,
        discount: 0,
        bill
      });

      setSno('');
      setName('');
      setSalePrice('');
      setRegularPrice('');
      setQuantity('');
      setInStock('');
      setCategory('');
      setBill('');

      alert('Product added successfully!');
    } catch (error) {
      console.error('Error adding product: ', error);
      alert('Failed to add product.');
    }
  };

  return (
    <div className="add-product-container">
      <Sidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
      <div className="form-wrapper">
        <h2>Add Product</h2>
        <form onSubmit={handleAddProduct} className="product-form">
          <input type="text" placeholder="S.No" value={sno} onChange={(e) => setSno(e.target.value)}  />
          <input type="text" placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)}  />
          <input type="text" placeholder="In Stock" value={inStock} onChange={(e) => setInStock(e.target.value)}  />
          <input type="number" placeholder="Sale Price" value={saleprice} onChange={(e) => setSalePrice(e.target.value)}  />
          <input type="number" placeholder="Regular Price" value={regularprice} onChange={(e) => setRegularPrice(e.target.value)}  />
          <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)}  />
          <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)}  />
          <input type="text" placeholder="Bill" value={bill} onChange={(e) => setBill(e.target.value)}  />
          <button type="submit">Add Product</button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
