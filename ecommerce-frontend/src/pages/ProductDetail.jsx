// ============================================================
// ProductDetail.jsx - Single Product Detail Page
// ============================================================
//
// WHAT THIS PAGE DOES:
//   Shows all details of one specific product.
//   The user can choose how many items they want (quantity).
//   Then they can add that product to their cart.
//
// WHICH BACKEND APIs IT CALLS:
//   1. GET http://localhost:8080/products/{id}
//      → Loads one specific product by its ID
//      → The ID comes from the URL (e.g. /product/3 → id = 3)
//   2. POST http://localhost:8080/cart/add?email=...&productId=...&quantity=...
//      → Adds the product to the logged-in user's cart
//      → All values go as query parameters (not request body!)
//
// HOW DATA FLOWS:
//   URL has /product/5 → useParams reads id=5 →
//   useEffect runs → fetches product with id 5 →
//   shows product details → user picks quantity →
//   clicks Add to Cart → axios sends request to backend
// ============================================================

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { API } from '../api.js'

function ProductDetail() {
  // useParams reads the ID from the URL
  // e.g. if URL is /product/7, then params.id = "7"
  const { id } = useParams()

  // Store the product data fetched from backend
  const [product, setProduct] = useState(null)

  // How many of this product the user wants to buy
  const [quantity, setQuantity] = useState(1)

  // true while loading the product from the backend
  const [loading, setLoading] = useState(true)

  // Error message
  const [error, setError] = useState('')

  // Message to show after adding to cart
  const [cartMessage, setCartMessage] = useState('')

  const navigate = useNavigate()

  // Get saved login info
  const token = localStorage.getItem('token')
  const userEmail = localStorage.getItem('userEmail')

  // -------------------------------------------------------
  // Load the product when the page opens
  // useEffect runs when "id" changes (when we visit a different product)
  // -------------------------------------------------------
  useEffect(() => {
    fetchProduct()
  }, [id])  // Runs every time the id in the URL changes

  // -------------------------------------------------------
  // Fetch one product by its ID
  // -------------------------------------------------------
  const fetchProduct = async () => {
    setLoading(true)
    setError('')

    if (!token) {
      navigate('/login')
      return
    }

    try {
      // Call GET /products/{id}
      // The id comes from the URL via useParams
      const response = await axios.get(
        `${API}/products/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      // response.data is the Product object
      // Example: { productId: 5, productName: "Laptop", price: 50000, ... }
      setProduct(response.data)

    } catch (err) {
      setError('Product not found or failed to load.')
      console.log('Error fetching product:', err)
    }

    setLoading(false)
  }

  // -------------------------------------------------------
  // Add this product to the cart
  // -------------------------------------------------------
  const addToCart = async () => {
    if (!token || !userEmail) {
      alert('Please login first.')
      navigate('/login')
      return
    }

    // Quantity must be at least 1
    if (quantity < 1) {
      alert('Quantity must be at least 1.')
      return
    }

    // Can't add more than available stock
    if (quantity > product.stock) {
      alert(`Only ${product.stock} items available in stock.`)
      return
    }

    try {
      // Call POST /cart/add
      // ALL THREE parameters go as query params (backend uses @RequestParam)
      // We pass null as the body because there is no request body
      await axios.post(
        `${API}/cart/add`,
        null,
        {
          params: {
            email: userEmail,     // Logged-in user's email
            productId: product.productId,  // This product's ID
            quantity: quantity    // How many the user wants
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      // Show success message below the button
      setCartMessage(`✅ ${quantity} item(s) added to cart successfully!`)

      // Clear the message after 3 seconds
      setTimeout(() => setCartMessage(''), 3000)

    } catch (err) {
      const errorMsg = err.response?.data || 'Failed to add to cart.'
      setCartMessage('❌ Error: ' + errorMsg)
      console.log('Add to cart error:', err)
    }
  }

  // -------------------------------------------------------
  // Show loading state
  // -------------------------------------------------------
  if (loading) {
    return (
      <div style={styles.centerMessage}>
        <p>⏳ Loading product details...</p>
      </div>
    )
  }

  // -------------------------------------------------------
  // Show error state
  // -------------------------------------------------------
  if (error) {
    return (
      <div style={styles.centerMessage}>
        <p style={{ color: 'red' }}>❌ {error}</p>
        <button onClick={() => navigate('/')} style={styles.backBtn}>
          ← Go Back to Products
        </button>
      </div>
    )
  }

  // -------------------------------------------------------
  // Show product details (the main content)
  // -------------------------------------------------------
  return (
    <div style={styles.container}>

      {/* Back button */}
      <button onClick={() => navigate('/')} style={styles.backBtn}>
        ← Back to Products
      </button>

      {/* Product Detail Card */}
      <div style={styles.card}>

        {/* Left side: Product info */}
        <div style={styles.infoSection}>

          {/* Product Name */}
          <h1 style={styles.productName}>{product.productName}</h1>

          {/* Category and Brand */}
          <p style={styles.meta}>
            <span style={styles.badge}>{product.category}</span>
            <span style={{ color: '#7f8c8d' }}>by {product.brand}</span>
          </p>

          {/* Full Description */}
          <p style={styles.description}>{product.description}</p>

          {/* Price */}
          <p style={styles.price}>₹ {product.price}</p>

          {/* Stock */}
          <p style={styles.stock}>
            {product.stock > 0
              ? `📦 ${product.stock} items in stock`
              : '❌ Out of Stock'}
          </p>

          {/* Availability */}
          {/* Note: Java's "isAvailable" boolean field becomes "available" in JSON */}
          <p style={{ color: product.available ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>
            {product.available ? '✅ Available for purchase' : '🚫 Currently Unavailable'}
          </p>

          {/* Release/Listed Date */}
          <p style={styles.releaseDate}>
            Listed on: {new Date(product.releaseDate).toLocaleDateString()}
          </p>

          {/* Divider line */}
          <hr style={{ margin: '20px 0', borderColor: '#eee' }} />

          {/* Quantity selector */}
          <div style={styles.quantityRow}>
            <label style={styles.quantityLabel}>Quantity:</label>

            {/* Decrease button */}
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={styles.quantityBtn}
            >
              -
            </button>

            {/* Quantity display */}
            <span style={styles.quantityDisplay}>{quantity}</span>

            {/* Increase button */}
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              style={styles.quantityBtn}
            >
              +
            </button>
          </div>

          {/* Total price preview */}
          <p style={styles.totalPreview}>
            Total: ₹ {product.price * quantity}
          </p>

          {/* Add to Cart button */}
          <button
            onClick={addToCart}
            disabled={product.stock === 0 || !product.available}
            style={{
              ...styles.addToCartBtn,
              backgroundColor: (product.stock === 0 || !product.available) ? '#95a5a6' : '#2ecc71'
            }}
          >
            🛒 Add to Cart
          </button>

          {/* View Cart button */}
          <button
            onClick={() => navigate('/cart')}
            style={styles.viewCartBtn}
          >
            View My Cart →
          </button>

          {/* Cart success/error message */}
          {cartMessage && (
            <p style={styles.cartMessage}>{cartMessage}</p>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '30px 20px'
  },
  centerMessage: {
    textAlign: 'center',
    marginTop: '100px',
    fontSize: '18px'
  },
  backBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #bdc3c7',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '20px',
    color: '#555',
    fontSize: '14px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  productName: {
    fontSize: '28px',
    color: '#2c3e50'
  },
  meta: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center'
  },
  badge: {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '13px'
  },
  description: {
    color: '#555',
    lineHeight: '1.6',
    fontSize: '15px'
  },
  price: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#e67e22'
  },
  stock: {
    color: '#666',
    fontSize: '15px'
  },
  releaseDate: {
    color: '#999',
    fontSize: '13px'
  },
  quantityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  quantityLabel: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333'
  },
  quantityBtn: {
    width: '36px',
    height: '36px',
    fontSize: '20px',
    backgroundColor: '#ecf0f1',
    border: '1px solid #bdc3c7',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  quantityDisplay: {
    fontSize: '20px',
    fontWeight: 'bold',
    minWidth: '30px',
    textAlign: 'center'
  },
  totalPreview: {
    fontSize: '18px',
    color: '#27ae60',
    fontWeight: 'bold'
  },
  addToCartBtn: {
    padding: '14px 30px',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  viewCartBtn: {
    padding: '12px 30px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    cursor: 'pointer'
  },
  cartMessage: {
    padding: '12px',
    backgroundColor: '#f0f8f0',
    borderRadius: '6px',
    fontSize: '15px',
    color: '#27ae60'
  }
}

export default ProductDetail
