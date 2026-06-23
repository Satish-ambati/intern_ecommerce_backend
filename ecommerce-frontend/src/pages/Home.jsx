// ============================================================
// Home.jsx - The Home Page (Product Listing)
// ============================================================
//
// WHAT THIS PAGE DOES:
//   Shows all products in the store.
//   Users can search products by name.
//   Users can filter by category.
//   Users can click a product to see its details.
//   Users can quickly add a product to cart from here.
//
// WHICH BACKEND APIs IT CALLS:
//   1. GET http://localhost:8080/products/all
//      → Gets all products (requires JWT token in header)
//   2. GET http://localhost:8080/products/search?keyword=laptop
//      → Searches products by name
//   3. GET http://localhost:8080/products/category/Electronics
//      → Filters products by category
//   4. POST http://localhost:8080/cart/add?email=...&productId=...&quantity=1
//      → Adds a product to the cart (query params, not body!)
//
// HOW DATA FLOWS:
//   Page loads → useEffect runs → fetches all products →
//   products stored in state → displayed on screen
//   User searches → new API call → filtered results shown
// ============================================================

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { API } from '../api.js'

function Home() {
  // Store the list of all products fetched from backend
  const [products, setProducts] = useState([])

  // true = show "Loading..." message while fetching data
  const [loading, setLoading] = useState(true)

  // Store any error message
  const [error, setError] = useState('')

  // Store what the user types in the search box
  const [searchKeyword, setSearchKeyword] = useState('')

  // Store the selected category for filtering
  const [selectedCategory, setSelectedCategory] = useState('')

  // For going to other pages
  const navigate = useNavigate()

  // Get the token from localStorage (saved during login)
  const token = localStorage.getItem('token')

  // Get the logged-in user's email (saved during login)
  const userEmail = localStorage.getItem('userEmail')

  // This header is sent with every API request to prove who we are
  // The backend checks this header to allow access
  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }

  // -------------------------------------------------------
  // useEffect: This runs automatically when the page loads
  // It's like saying "when the page opens, fetch products"
  // -------------------------------------------------------
  useEffect(() => {
    fetchAllProducts()
  }, [])  // The [] means "run only once when the page first loads"

  // -------------------------------------------------------
  // Fetch all products from the backend
  // -------------------------------------------------------
  const fetchAllProducts = async () => {
    // Show loading while waiting
    setLoading(true)
    setError('')

    // If user is not logged in, redirect to login
    if (!token) {
      navigate('/login')
      return
    }

    try {
      // Call GET /products/all
      // We MUST include the JWT token in the header (backend requires it)
      const response = await axios.get(
        `${API}/products/all`,
        authHeader
      )

      // response.data is the array of products
      // Example: [{ productId: 1, productName: "Laptop", price: 50000, ... }, ...]
      setProducts(response.data)

    } catch (err) {
      setError('Failed to load products. Please try again.')
      console.log('Error fetching products:', err)
    }

    setLoading(false)
  }

  // -------------------------------------------------------
  // Search products by keyword
  // Called when user clicks the "Search" button
  // -------------------------------------------------------
  const searchProducts = async () => {
    // If search box is empty, just show all products
    if (!searchKeyword.trim()) {
      fetchAllProducts()
      return
    }

    setLoading(true)
    setError('')

    try {
      // Call GET /products/search?keyword=...
      const response = await axios.get(
        `${API}/products/search?keyword=${searchKeyword}`,
        authHeader
      )

      setProducts(response.data)

    } catch (err) {
      setError('Search failed. Try again.')
      console.log('Search error:', err)
    }

    setLoading(false)
  }

  // -------------------------------------------------------
  // Filter products by category
  // Called when user selects a category from the dropdown
  // -------------------------------------------------------
  const filterByCategory = async (category) => {
    // Update the selected category in state
    setSelectedCategory(category)

    // If "All" is selected, show all products
    if (!category) {
      fetchAllProducts()
      return
    }

    setLoading(true)
    setError('')

    try {
      // Call GET /products/category/{category}
      const response = await axios.get(
        `${API}/products/category/${category}`,
        authHeader
      )

      setProducts(response.data)

    } catch (err) {
      setError('Could not filter by category.')
      console.log('Category filter error:', err)
    }

    setLoading(false)
  }

  // -------------------------------------------------------
  // Add a product directly to cart from the Home page
  // -------------------------------------------------------
  const addToCart = async (productId) => {
    // User must be logged in to add to cart
    if (!token || !userEmail) {
      alert('Please login first to add items to cart.')
      navigate('/login')
      return
    }

    try {
      // Call POST /cart/add
      // IMPORTANT: These are query parameters (not request body)!
      // That's why we use `params:` in axios config
      // The backend controller uses @RequestParam, not @RequestBody
      await axios.post(
        `${API}/cart/add`,
        null,  // null because there is no request body
        {
          params: {
            email: userEmail,
            productId: productId,
            quantity: 1  // Add 1 item by default
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      alert('Product added to cart successfully! ✅')

    } catch (err) {
      // Check if the error is about stock
      const errorMsg = err.response?.data || 'Failed to add to cart.'
      alert('Error: ' + errorMsg)
      console.log('Add to cart error:', err)
    }
  }

  // -------------------------------------------------------
  // UI / What gets displayed
  // -------------------------------------------------------
  return (
    <div style={styles.container}>

      {/* Page Title */}
      <h1 style={styles.pageTitle}>🛍️ All Products</h1>

      {/* Search and Filter Bar */}
      <div style={styles.searchBar}>

        {/* Search input */}
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="Search products..."
          style={styles.searchInput}
          onKeyDown={(e) => e.key === 'Enter' && searchProducts()}
        />

        {/* Search button */}
        <button onClick={searchProducts} style={styles.searchBtn}>
          🔍 Search
        </button>

        {/* Category filter dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => filterByCategory(e.target.value)}
          style={styles.categorySelect}
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Books">Books</option>
          <option value="Home">Home</option>
          <option value="Sports">Sports</option>
          <option value="Toys">Toys</option>
        </select>

        {/* Button to reset and show all products */}
        <button onClick={() => { setSearchKeyword(''); setSelectedCategory(''); fetchAllProducts(); }} style={styles.resetBtn}>
          Reset
        </button>
      </div>

      {/* Show error message if something went wrong */}
      {error && <div style={styles.errorBox}>❌ {error}</div>}

      {/* Show loading message while fetching */}
      {loading && <p style={styles.loadingText}>⏳ Loading products...</p>}

      {/* Show message if no products found */}
      {!loading && products.length === 0 && (
        <p style={styles.noProductsText}>No products found.</p>
      )}

      {/* Product Grid - shows all products as cards */}
      <div style={styles.grid}>
        {products.map((product) => (
          // Each product is a "card"
          // product.productId is the unique ID from the backend
          <div key={product.productId} style={styles.card}>

            {/* Product Name */}
            <h3 style={styles.productName}>{product.productName}</h3>

            {/* Brand */}
            <p style={styles.brand}>Brand: {product.brand}</p>

            {/* Category */}
            <p style={styles.category}>Category: {product.category}</p>

            {/* Description (shortened to 80 characters) */}
            <p style={styles.description}>
              {product.description
                ? product.description.substring(0, 80) + '...'
                : 'No description available'}
            </p>

            {/* Price - backend stores price as a number */}
            <p style={styles.price}>₹ {product.price}</p>

            {/* Stock info */}
            <p style={styles.stock}>
              Stock: {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}
            </p>

            {/* Availability badge */}
            {/* Note: Java boolean field "isAvailable" becomes "available" in JSON */}
            <p style={{
              ...styles.availability,
              color: product.available ? '#27ae60' : '#e74c3c'
            }}>
              {product.available ? '✅ Available' : '❌ Not Available'}
            </p>

            {/* Action buttons */}
            <div style={styles.cardButtons}>
              {/* View full details of this product */}
              <button
                onClick={() => navigate(`/product/${product.productId}`)}
                style={styles.detailBtn}
              >
                View Details
              </button>

              {/* Add to Cart button */}
              <button
                onClick={() => addToCart(product.productId)}
                style={styles.cartBtn}
                disabled={product.stock === 0}
              >
                🛒 Add to Cart
              </button>
            </div>
          </div>
        ))}
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
  pageTitle: {
    textAlign: 'center',
    marginBottom: '25px',
    color: '#2c3e50',
    fontSize: '28px'
  },
  searchBar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  searchInput: {
    padding: '10px 15px',
    fontSize: '15px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    width: '280px',
    outline: 'none'
  },
  searchBtn: {
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '15px'
  },
  categorySelect: {
    padding: '10px 15px',
    fontSize: '15px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  resetBtn: {
    padding: '10px 20px',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '15px'
  },
  errorBox: {
    backgroundColor: '#fde8e8',
    color: '#c0392b',
    padding: '15px',
    borderRadius: '6px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: '18px',
    marginTop: '50px'
  },
  noProductsText: {
    textAlign: 'center',
    color: '#999',
    fontSize: '18px',
    marginTop: '50px'
  },
  // Grid layout: 3 cards per row on big screens
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '25px'
  },
  card: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  productName: {
    fontSize: '18px',
    color: '#2c3e50',
    marginBottom: '5px'
  },
  brand: {
    color: '#7f8c8d',
    fontSize: '13px'
  },
  category: {
    color: '#3498db',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  description: {
    color: '#555',
    fontSize: '13px',
    lineHeight: '1.4'
  },
  price: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#e67e22'
  },
  stock: {
    fontSize: '13px',
    color: '#666'
  },
  availability: {
    fontSize: '13px',
    fontWeight: 'bold'
  },
  cardButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px'
  },
  detailBtn: {
    flex: 1,
    padding: '9px',
    backgroundColor: '#ecf0f1',
    color: '#2c3e50',
    border: '1px solid #bdc3c7',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  cartBtn: {
    flex: 1,
    padding: '9px',
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  }
}

export default Home
