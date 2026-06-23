// ============================================================
// AdminProducts.jsx - Admin Panel for Managing Products
// ============================================================
//
// WHAT THIS PAGE DOES:
//   Only users with ADMIN role can use this page.
//   If a non-admin tries to use it, the backend will return 403 (Forbidden).
//   Admins can:
//     - View all products in a table
//     - Add a new product using a form
//     - Edit an existing product
//     - Delete a product
//
// WHICH BACKEND APIs IT CALLS:
//   1. GET    http://localhost:8080/products/all          → Load all products
//   2. POST   http://localhost:8080/products/add          → Add new product (ADMIN)
//   3. PUT    http://localhost:8080/products/update/{id}  → Edit product (ADMIN)
//   4. DELETE http://localhost:8080/products/delete/{id}  → Delete product (ADMIN)
//
// HOW DATA FLOWS:
//   Page loads → fetch all products → show in table
//   Admin fills form → clicks Add → POST /products/add → reload table
//   Admin clicks Edit → form fills with existing data →
//     admin edits → clicks Update → PUT /products/update/{id} → reload
//   Admin clicks Delete → confirm → DELETE /products/delete/{id} → reload
// ============================================================

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { API } from '../api.js'

function AdminProducts() {
  // Store the list of all products
  const [products, setProducts] = useState([])

  // true while loading data from backend
  const [loading, setLoading] = useState(true)

  // Error message
  const [error, setError] = useState('')

  // Success message (shown after add/update/delete)
  const [successMsg, setSuccessMsg] = useState('')

  // -------------------------------------------------------
  // Form state - holds what the admin types in the form
  // This same form is used for both ADD and EDIT
  // -------------------------------------------------------
  const [form, setForm] = useState({
    productName: '',
    description: '',
    brand: '',
    price: '',
    category: '',
    stock: '',
    isAvailable: true
  })

  // If editingId is set, we are editing an existing product
  // If editingId is null, we are adding a new product
  const [editingId, setEditingId] = useState(null)

  // true = show the form, false = hide it
  const [showForm, setShowForm] = useState(false)

  const navigate = useNavigate()

  // Get login info from localStorage
  const token = localStorage.getItem('token')
  const userEmail = localStorage.getItem('userEmail')

  // This header goes with every API request
  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }

  // -------------------------------------------------------
  // Load products when the page opens
  // -------------------------------------------------------
  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    fetchAllProducts()
  }, [])

  // -------------------------------------------------------
  // Fetch all products
  // -------------------------------------------------------
  const fetchAllProducts = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await axios.get(
        `${API}/products/all`,
        authHeader
      )

      setProducts(response.data)

    } catch (err) {
      setError('Failed to load products.')
      console.log('Fetch error:', err)
    }

    setLoading(false)
  }

  // -------------------------------------------------------
  // Handle form input changes
  // This one function handles ALL input fields in the form
  // -------------------------------------------------------
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target

    // Update the form state
    // If input type is "checkbox", use the checked value (true/false)
    // Otherwise, use the typed value
    setForm((prevForm) => ({
      ...prevForm,       // Keep all other fields the same
      [name]: type === 'checkbox' ? checked : value  // Only update the changed field
    }))
  }

  // -------------------------------------------------------
  // Reset form to empty (used after submit or cancel)
  // -------------------------------------------------------
  const resetForm = () => {
    setForm({
      productName: '',
      description: '',
      brand: '',
      price: '',
      category: '',
      stock: '',
      isAvailable: true
    })
    setEditingId(null)
    setShowForm(false)
  }

  // -------------------------------------------------------
  // Show success message then auto-clear it
  // -------------------------------------------------------
  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  // -------------------------------------------------------
  // ADD a new product
  // Called when admin submits the form and editingId is null
  // -------------------------------------------------------
  const addProduct = async () => {
    // Basic validation
    if (!form.productName || !form.price || !form.stock) {
      alert('Product Name, Price, and Stock are required.')
      return
    }
    // Stock and Price must be positive numbers
    if (Number(form.stock) <= 0) {
      alert('Stock must be greater than 0. Otherwise no one can add it to cart!')
      return
    }
    if (Number(form.price) <= 0) {
      alert('Price must be greater than 0.')
      return
    }

    try {
      // Call POST /products/add
      // The body is the Product object
      // Backend will auto-generate productId and releaseDate
      const response = await axios.post(
        `${API}/products/add`,
        {
          productName: form.productName,
          description: form.description,
          brand: form.brand,
          price: Number(form.price),     // Convert string to number
          category: form.category,
          stock: Number(form.stock),     // Convert string to number
          isAvailable: form.isAvailable
        },
        authHeader
      )

      console.log('Product added:', response.data)
      showSuccess('✅ Product added successfully!')
      resetForm()
      fetchAllProducts()  // Reload the list

    } catch (err) {
      // If backend returns 403, the user is not an admin
      if (err.response?.status === 403) {
        alert('Access Denied! Only ADMIN users can add products.')
      } else {
        alert('Failed to add product. Please try again.')
      }
      console.log('Add product error:', err)
    }
  }

  // -------------------------------------------------------
  // EDIT - Fill the form with an existing product's data
  // This just sets up the form; actual update happens in updateProduct()
  // -------------------------------------------------------
  const startEditing = (product) => {
    // Fill the form with the product's current values
    setForm({
      productName: product.productName,
      description: product.description || '',
      brand: product.brand || '',
      price: product.price,
      category: product.category || '',
      stock: product.stock,
      // Java's "isAvailable" field becomes "available" in JSON
      // (Jackson strips the "is" prefix from boolean getters)
      isAvailable: product.available
    })

    // Remember which product we are editing
    setEditingId(product.productId)

    // Show the form
    setShowForm(true)

    // Scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // -------------------------------------------------------
  // UPDATE an existing product
  // Called when admin submits the form and editingId is set
  // -------------------------------------------------------
  const updateProduct = async () => {
    if (!form.productName || !form.price || !form.stock) {
      alert('Product Name, Price, and Stock are required.')
      return
    }
    if (Number(form.stock) <= 0) {
      alert('Stock must be greater than 0.')
      return
    }
    if (Number(form.price) <= 0) {
      alert('Price must be greater than 0.')
      return
    }

    try {
      // Call PUT /products/update/{id}
      // We send the full updated product as the request body
      const response = await axios.put(
        `${API}/products/update/${editingId}`,
        {
          productName: form.productName,
          description: form.description,
          brand: form.brand,
          price: Number(form.price),
          category: form.category,
          stock: Number(form.stock),
          isAvailable: form.isAvailable
        },
        authHeader
      )

      console.log('Product updated:', response.data)
      showSuccess('✅ Product updated successfully!')
      resetForm()
      fetchAllProducts()

    } catch (err) {
      if (err.response?.status === 403) {
        alert('Access Denied! Only ADMIN users can update products.')
      } else {
        alert('Failed to update product.')
      }
      console.log('Update error:', err)
    }
  }

  // -------------------------------------------------------
  // DELETE a product
  // -------------------------------------------------------
  const deleteProduct = async (productId, productName) => {
    // Ask user to confirm before deleting
    const confirmed = window.confirm(`Delete "${productName}"? This cannot be undone.`)
    if (!confirmed) return

    try {
      // Call DELETE /products/delete/{id}
      await axios.delete(
        `${API}/products/delete/${productId}`,
        authHeader
      )

      showSuccess('✅ Product deleted successfully!')
      fetchAllProducts()  // Reload the list

    } catch (err) {
      if (err.response?.status === 403) {
        alert('Access Denied! Only ADMIN users can delete products.')
      } else {
        alert('Failed to delete product.')
      }
      console.log('Delete error:', err)
    }
  }

  // -------------------------------------------------------
  // Main UI
  // -------------------------------------------------------
  return (
    <div style={styles.container}>

      {/* Page Header */}
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>🔧 Admin Panel - Product Management</h1>
        <p style={styles.subtitle}>
          Logged in as: <strong>{userEmail}</strong>
          {' '}(Note: Only ADMIN role can perform Add/Edit/Delete)
        </p>
      </div>

      {/* Success message */}
      {successMsg && (
        <div style={styles.successBox}>{successMsg}</div>
      )}

      {/* Error message */}
      {error && (
        <div style={styles.errorBox}>❌ {error}</div>
      )}

      {/* Button to open Add Product form */}
      {!showForm && (
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          style={styles.addBtn}
        >
          + Add New Product
        </button>
      )}

      {/* ------------------------------------------------- */}
      {/* ADD / EDIT PRODUCT FORM                           */}
      {/* This form is used for both adding and editing     */}
      {/* ------------------------------------------------- */}
      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>
            {editingId ? `✏️ Edit Product (ID: ${editingId})` : '➕ Add New Product'}
          </h2>

          {/* Two-column grid for the form fields */}
          <div style={styles.formGrid}>

            {/* Product Name */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Product Name *</label>
              <input
                type="text"
                name="productName"
                value={form.productName}
                onChange={handleFormChange}
                placeholder="e.g. Samsung Galaxy S24"
                style={styles.input}
              />
            </div>

            {/* Brand */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Brand</label>
              <input
                type="text"
                name="brand"
                value={form.brand}
                onChange={handleFormChange}
                placeholder="e.g. Samsung"
                style={styles.input}
              />
            </div>

            {/* Price */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleFormChange}
                placeholder="e.g. 79999"
                style={styles.input}
                min="0"
              />
            </div>

            {/* Stock */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Stock Quantity *</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleFormChange}
                placeholder="e.g. 100"
                style={styles.input}
                min="0"
              />
            </div>

            {/* Category */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleFormChange}
                style={styles.input}
              >
                <option value="">Select Category</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Books">Books</option>
                <option value="Home">Home</option>
                <option value="Sports">Sports</option>
                <option value="Toys">Toys</option>
              </select>
            </div>

            {/* Available checkbox */}
            <div style={{ ...styles.fieldGroup, justifyContent: 'center' }}>
              <label style={styles.label}>Available for Purchase?</label>
              <div style={styles.checkboxRow}>
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={form.isAvailable}
                  onChange={handleFormChange}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '15px', color: '#555' }}>
                  {form.isAvailable ? 'Yes - Available' : 'No - Unavailable'}
                </span>
              </div>
            </div>
          </div>

          {/* Description - full width */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleFormChange}
              placeholder="Describe the product..."
              style={{ ...styles.input, height: '100px', resize: 'vertical' }}
            />
          </div>

          {/* Form action buttons */}
          <div style={styles.formButtons}>
            {/* If editing, show Update button. If adding, show Add button. */}
            {editingId ? (
              <button onClick={updateProduct} style={styles.submitBtn}>
                💾 Update Product
              </button>
            ) : (
              <button onClick={addProduct} style={styles.submitBtn}>
                ✅ Add Product
              </button>
            )}

            {/* Cancel button - hides the form */}
            <button onClick={resetForm} style={styles.cancelBtn}>
              ✖ Cancel
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------- */}
      {/* PRODUCTS TABLE                                     */}
      {/* ------------------------------------------------- */}
      <div style={styles.tableSection}>
        <h2 style={styles.tableTitle}>
          All Products ({products.length} total)
        </h2>

        {loading ? (
          <p style={styles.loadingText}>⏳ Loading products...</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Brand</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Stock</th>
                  <th style={styles.th}>Available</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.productId} style={styles.tableRow}>
                    <td style={styles.td}>{product.productId}</td>
                    <td style={{ ...styles.td, fontWeight: 'bold' }}>{product.productName}</td>
                    <td style={styles.td}>{product.brand}</td>
                    <td style={styles.td}>{product.category}</td>
                    <td style={styles.td}>₹ {product.price}</td>
                    <td style={styles.td}>{product.stock}</td>
                    {/* Java's "isAvailable" becomes "available" in JSON */}
                    <td style={{ ...styles.td, color: product.available ? '#27ae60' : '#e74c3c' }}>
                      {product.available ? '✅ Yes' : '❌ No'}
                    </td>
                    <td style={styles.td}>
                      {/* Edit button */}
                      <button
                        onClick={() => startEditing(product)}
                        style={styles.editBtn}
                      >
                        ✏️ Edit
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => deleteProduct(product.productId, product.productName)}
                        style={styles.deleteBtn}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px'
  },
  header: {
    marginBottom: '25px'
  },
  pageTitle: {
    color: '#2c3e50',
    fontSize: '26px',
    marginBottom: '8px'
  },
  subtitle: {
    color: '#666',
    fontSize: '14px'
  },
  successBox: {
    backgroundColor: '#e8f8f5',
    color: '#27ae60',
    padding: '12px 20px',
    borderRadius: '6px',
    marginBottom: '15px',
    fontSize: '15px',
    fontWeight: 'bold'
  },
  errorBox: {
    backgroundColor: '#fde8e8',
    color: '#c0392b',
    padding: '12px 20px',
    borderRadius: '6px',
    marginBottom: '15px',
    fontSize: '15px'
  },
  addBtn: {
    padding: '12px 25px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '7px',
    fontSize: '15px',
    cursor: 'pointer',
    marginBottom: '20px',
    fontWeight: 'bold'
  },
  formCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    marginBottom: '30px'
  },
  formTitle: {
    color: '#2c3e50',
    marginBottom: '20px',
    fontSize: '20px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '15px'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
    fontSize: '14px'
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '5px'
  },
  formButtons: {
    display: 'flex',
    gap: '15px',
    marginTop: '20px'
  },
  submitBtn: {
    padding: '12px 30px',
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    borderRadius: '7px',
    fontSize: '15px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  cancelBtn: {
    padding: '12px 25px',
    backgroundColor: '#ecf0f1',
    color: '#555',
    border: '1px solid #bdc3c7',
    borderRadius: '7px',
    fontSize: '15px',
    cursor: 'pointer'
  },
  tableSection: {
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    padding: '25px'
  },
  tableTitle: {
    color: '#2c3e50',
    marginBottom: '20px',
    fontSize: '18px'
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    padding: '30px'
  },
  tableWrapper: {
    overflowX: 'auto'  // Allows horizontal scrolling on small screens
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px'
  },
  tableHead: {
    backgroundColor: '#2c3e50'
  },
  th: {
    padding: '12px 15px',
    color: 'white',
    textAlign: 'left',
    fontWeight: 'bold',
    whiteSpace: 'nowrap'
  },
  tableRow: {
    borderBottom: '1px solid #f0f0f0'
  },
  td: {
    padding: '12px 15px',
    color: '#444',
    verticalAlign: 'middle'
  },
  editBtn: {
    backgroundColor: '#f0f7ff',
    color: '#3498db',
    border: '1px solid #aed6f1',
    padding: '6px 12px',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '8px',
    fontSize: '13px'
  },
  deleteBtn: {
    backgroundColor: '#fde8e8',
    color: '#e74c3c',
    border: '1px solid #f5b7b7',
    padding: '6px 12px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '13px'
  }
}

export default AdminProducts
