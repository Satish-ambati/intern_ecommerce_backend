// ============================================================
// Cart.jsx - The Shopping Cart Page
// ============================================================
//
// WHAT THIS PAGE DOES:
//   Shows all items the logged-in user has added to their cart.
//   User can update the quantity of any item.
//   User can remove an item from the cart.
//   Shows the total price of all items.
//
// WHICH BACKEND APIs IT CALLS:
//   1. GET http://localhost:8080/cart/{email}
//      → Fetches the cart for the logged-in user (by their email)
//      → Response: Cart object with cartItems array
//   2. DELETE http://localhost:8080/cart/remove?cartId={ci_id}
//      → Removes one item from cart by the cartItem's ID
//   3. PUT http://localhost:8080/cart/update?cartItemId={ci_id}&quantity={n}
//      → Updates the quantity of a cart item
//
// HOW THE DATA LOOKS (Backend Response):
//   {
//     "c_id": 1,
//     "user": { "email": "user@example.com", ... },
//     "cartItems": [
//       {
//         "ci_id": 10,           ← CartItem's own ID (used for remove/update)
//         "product": {           ← The actual product details
//           "productId": 3,
//           "productName": "Laptop",
//           "price": 50000,
//           ...
//         },
//         "quantity": 2          ← How many of this product
//       }
//     ]
//   }
//
// HOW DATA FLOWS:
//   Page opens → useEffect runs → GET /cart/{email} →
//   cart data stored in state → displayed on screen
//   User clicks Remove → DELETE request → reload cart
//   User changes quantity → PUT request → reload cart
// ============================================================

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { API } from '../api.js'

function Cart() {
  // Store the cart data from the backend
  // cart will have: { c_id, user, cartItems: [...] }
  const [cart, setCart] = useState(null)

  // true while loading cart data
  const [loading, setLoading] = useState(true)

  // Error message
  const [error, setError] = useState('')

  const navigate = useNavigate()

  // Get logged-in user's info from localStorage
  const token = localStorage.getItem('token')
  const userEmail = localStorage.getItem('userEmail')

  // -------------------------------------------------------
  // Load cart when the page opens
  // -------------------------------------------------------
  useEffect(() => {
    fetchCart()
  }, [])

  // -------------------------------------------------------
  // Fetch the cart from the backend
  // -------------------------------------------------------
  const fetchCart = async () => {
    setLoading(true)
    setError('')

    // Must be logged in to view cart
    if (!token || !userEmail) {
      navigate('/login')
      return
    }

    try {
      // Call GET /cart/{email}
      // The email in the URL is the logged-in user's email
      console.log(userEmail);
      const response = await axios.get(
        `${API}/cart/${userEmail}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      // 204 = No Content → user exists but has never added anything to cart yet
      if (response.status === 204) {
        setCart(null)  // null cart = empty cart, handled below
        return
      }
      // response.data is the full Cart object
      setCart(response.data)
      console.log('Cart data:', response.data)  // Good for learning/debugging!

    } catch (err) {
      setError('Could not load your cart. Please try again.')
      console.log('Cart fetch error:', err)
    }

    setLoading(false)
  }

  // -------------------------------------------------------
  // Remove one item from the cart
  // cartItemId = the ci_id of the CartItem (not the product ID!)
  // -------------------------------------------------------
  const removeItem = async (cartItemId) => {
    // Ask user to confirm before removing
    const confirmed = window.confirm('Remove this item from cart?')
    if (!confirmed) return

    try {
      // Call DELETE /cart/remove?cartId={cartItemId}
      // "cartId" here is actually the CartItem ID (ci_id) - backend naming
      await axios.delete(
        `${API}/cart/remove`,
        {
          params: {
            cartId: cartItemId   // This is the CartItem's ci_id
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      // Reload the cart to show updated list
      fetchCart()
      alert('Item removed from cart.')

    } catch (err) {
      alert('Failed to remove item.')
      console.log('Remove item error:', err)
    }
  }

  // -------------------------------------------------------
  // Update the quantity of a cart item
  // cartItemId = ci_id, newQuantity = the new amount
  // -------------------------------------------------------
  const updateQuantity = async (cartItemId, newQuantity) => {
    // Quantity must be at least 1
    if (newQuantity < 1) {
      alert('Quantity must be at least 1. Use Remove to delete the item.')
      return
    }

    try {
      // Call PUT /cart/update?cartItemId={id}&quantity={n}
      // Both values go as query parameters
      await axios.put(
        `${API}/cart/update`,
        null,  // No request body (backend uses @RequestParam)
        {
          params: {
            cartItemId: cartItemId,   // Which cart item to update
            quantity: newQuantity     // New quantity value
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      // Reload cart to reflect changes
      fetchCart()

    } catch (err) {
      alert('Failed to update quantity.')
      console.log('Update quantity error:', err)
    }
  }

  // -------------------------------------------------------
  // Calculate the total price of all items in the cart
  // -------------------------------------------------------
  const calculateTotal = () => {
    // If cart is empty or null, return 0
    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
      return 0
    }

    // Add up: (price × quantity) for each item
    return cart.cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity)
    }, 0)  // 0 is the starting total
  }

  // -------------------------------------------------------
  // Show loading state
  // -------------------------------------------------------
  if (loading) {
    return (
      <div style={styles.centerMessage}>
        ⏳ Loading your cart...
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
        <button onClick={fetchCart} style={styles.retryBtn}>Try Again</button>
      </div>
    )
  }

  // -------------------------------------------------------
  // Get the cart items array (might be empty)
  // -------------------------------------------------------
  const cartItems = cart?.cartItems || []

  // -------------------------------------------------------
  // Main UI
  // -------------------------------------------------------
  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>🛒 My Shopping Cart</h1>

      {/* Show message if cart is empty */}
      {cartItems.length === 0 ? (
        <div style={styles.emptyCart}>
          <p style={styles.emptyText}>Your cart is empty!</p>
          <button
            onClick={() => navigate('/')}
            style={styles.shopBtn}
          >
            🛍️ Start Shopping
          </button>
        </div>
      ) : (
        <>
          {/* Cart Items Table */}
          <div style={styles.cartList}>
            {/* Header row */}
            <div style={styles.headerRow}>
              <span style={{ flex: 3 }}>Product</span>
              <span style={{ flex: 1, textAlign: 'center' }}>Price</span>
              <span style={{ flex: 2, textAlign: 'center' }}>Quantity</span>
              <span style={{ flex: 1, textAlign: 'center' }}>Subtotal</span>
              <span style={{ flex: 1, textAlign: 'center' }}>Action</span>
            </div>

            {/* One row per cart item */}
            {cartItems.map((item) => (
              // item.ci_id = the unique ID of this cart item
              // item.product = the product details object
              // item.quantity = how many of this product
              <div key={item.ci_id} style={styles.itemRow}>

                {/* Product Name and Brand */}
                <div style={{ flex: 3 }}>
                  <p style={styles.itemName}>{item.product.productName}</p>
                  <p style={styles.itemBrand}>Brand: {item.product.brand}</p>
                </div>

                {/* Price per item */}
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <p style={styles.itemPrice}>₹ {item.product.price}</p>
                </div>

                {/* Quantity controls: decrease, number, increase */}
                <div style={{ flex: 2, textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => updateQuantity(item.ci_id, item.quantity - 1)}
                    style={styles.qtyBtn}
                  >
                    -
                  </button>

                  <span style={styles.qtyNumber}>{item.quantity}</span>

                  <button
                    onClick={() => updateQuantity(item.ci_id, item.quantity + 1)}
                    style={styles.qtyBtn}
                  >
                    +
                  </button>
                </div>

                {/* Subtotal: price × quantity */}
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <p style={styles.subTotal}>
                    ₹ {item.product.price * item.quantity}
                  </p>
                </div>

                {/* Remove button */}
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <button
                    onClick={() => removeItem(item.ci_id)}
                    style={styles.removeBtn}
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Total and Checkout Section */}
          <div style={styles.totalSection}>
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Total ({cartItems.length} items):</span>
              <span style={styles.totalAmount}>₹ {calculateTotal()}</span>
            </div>

            {/* Continue Shopping */}
            <button
              onClick={() => navigate('/')}
              style={styles.continueBtn}
            >
              ← Continue Shopping
            </button>

            {/* Checkout (placeholder for now - no payment API) */}
            <button
              onClick={() => alert('Checkout feature coming soon! 🚀\n(Payment API not implemented yet)')}
              style={styles.checkoutBtn}
            >
              Proceed to Checkout →
            </button>
          </div>
        </>
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '30px 20px'
  },
  centerMessage: {
    textAlign: 'center',
    marginTop: '100px',
    fontSize: '18px',
    color: '#666'
  },
  pageTitle: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#2c3e50',
    fontSize: '28px'
  },
  emptyCart: {
    textAlign: 'center',
    marginTop: '80px'
  },
  emptyText: {
    fontSize: '22px',
    color: '#999',
    marginBottom: '20px'
  },
  shopBtn: {
    padding: '14px 30px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  retryBtn: {
    marginTop: '15px',
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  cartList: {
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    overflow: 'hidden'
  },
  headerRow: {
    display: 'flex',
    padding: '15px 20px',
    backgroundColor: '#2c3e50',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  itemRow: {
    display: 'flex',
    padding: '20px',
    borderBottom: '1px solid #f0f0f0',
    alignItems: 'center'
  },
  itemName: {
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '4px',
    fontSize: '15px'
  },
  itemBrand: {
    color: '#999',
    fontSize: '13px'
  },
  itemPrice: {
    color: '#666',
    fontSize: '15px'
  },
  qtyBtn: {
    width: '32px',
    height: '32px',
    fontSize: '18px',
    backgroundColor: '#ecf0f1',
    border: '1px solid #bdc3c7',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  qtyNumber: {
    fontSize: '16px',
    fontWeight: 'bold',
    minWidth: '25px',
    textAlign: 'center'
  },
  subTotal: {
    fontWeight: 'bold',
    color: '#e67e22',
    fontSize: '15px'
  },
  removeBtn: {
    backgroundColor: '#fde8e8',
    color: '#e74c3c',
    border: '1px solid #f5b7b7',
    padding: '6px 12px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  totalSection: {
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    padding: '25px',
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '15px'
  },
  totalRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  totalLabel: {
    fontSize: '18px',
    color: '#555'
  },
  totalAmount: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#e67e22'
  },
  continueBtn: {
    padding: '12px 24px',
    backgroundColor: '#ecf0f1',
    color: '#2c3e50',
    border: '1px solid #bdc3c7',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px'
  },
  checkoutBtn: {
    padding: '12px 30px',
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
}

export default Cart
