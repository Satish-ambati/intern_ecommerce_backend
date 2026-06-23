// ============================================================
// Login.jsx - The Login Page
// ============================================================
//
// WHAT THIS PAGE DOES:
//   Lets a user enter their email and password to log in.
//   If correct, the backend sends back a JWT token.
//   We save that token in localStorage and go to the home page.
//
// WHICH BACKEND API IT CALLS:
//   POST http://localhost:8080/login
//   Body: { email: "...", password: "..." }
//   Response: a JWT token string (e.g. "eyJhbGciOiJIUzI1NiJ9...")
//
// HOW DATA FLOWS:
//   User types → useState stores it → button clicked →
//   axios sends to backend → backend checks credentials →
//   backend returns token → we save token → we go to home page
// ============================================================

import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { API } from '../api.js'

function Login() {
  // Store the email the user types in the input box
  const [email, setEmail] = useState('')

  // Store the password the user types
  const [password, setPassword] = useState('')

  // true = show "Logging in..." on the button while waiting for backend
  const [loading, setLoading] = useState(false)

  // Store any error message to show to the user
  const [error, setError] = useState('')

  // useNavigate lets us go to a different page programmatically
  const navigate = useNavigate()

  // -------------------------------------------------------
  // This function is called when the user clicks "Login"
  // -------------------------------------------------------
  const login = async () => {
    // Clear any old error messages
    setError('')

    // Basic check: make sure both fields are filled
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    // Show loading state so user knows something is happening
    setLoading(true)

    try {
      // Call the backend login API
      // POST /login with the email and password in the request body
      const response = await axios.post(`${API}/login`, {
        email: email,
        password: password
      })

      // The backend returns the JWT token as plain text (a string)
      // response.data contains the actual token string
      const token = response.data

      // Save the token in browser localStorage
      // localStorage is like a small database in the browser
      // Data here stays even if you refresh the page
      localStorage.setItem('token', token)

      // Also save the email so we know who is logged in
      localStorage.setItem('userEmail', email)

      // Alert the user that login was successful
      alert('Login successful! Welcome back!')

      // Go to the home page
      navigate('/')

    } catch (err) {
      // If the backend returns an error (wrong password, user not found, etc.)
      // The catch block runs here

      // Show a friendly error message
      setError('Login failed. Please check your email and password.')

      // Log the full error in the browser console for debugging
      console.log('Login error details:', err)
    }

    // Hide the loading state whether success or failure
    setLoading(false)
  }

  // -------------------------------------------------------
  // This is what gets displayed on the screen (the UI/HTML)
  // -------------------------------------------------------
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login to Your Account</h2>

        {/* Show error message if login failed */}
        {error && (
          <div style={styles.errorBox}>
            ❌ {error}
          </div>
        )}

        {/* Email input field */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            style={styles.input}
          />
        </div>

        {/* Password input field */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={styles.input}
            // Allow pressing Enter to login
            onKeyDown={(e) => e.key === 'Enter' && login()}
          />
        </div>

        {/* Login button */}
        <button
          onClick={login}
          disabled={loading}
          style={{
            ...styles.button,
            backgroundColor: loading ? '#95a5a6' : '#3498db'
          }}
        >
          {loading ? '⏳ Logging in...' : 'Login'}
        </button>

        {/* Link to the Register page */}
        <p style={styles.registerText}>
          Don't have an account?{' '}
          <span
            onClick={() => navigate('/register')}
            style={styles.registerLink}
          >
            Register here
          </span>
        </p>
      </div>
    </div>
  )
}

// Styles written as a JavaScript object
// This is called "inline styles" in React
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '85vh',
    backgroundColor: '#f4f4f4'
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    width: '420px'
  },
  title: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#2c3e50',
    fontSize: '24px'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    color: '#555',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '15px',
    boxSizing: 'border-box',
    outline: 'none'
  },
  button: {
    width: '100%',
    padding: '13px',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  errorBox: {
    backgroundColor: '#fde8e8',
    color: '#c0392b',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  registerText: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#666',
    fontSize: '14px'
  },
  registerLink: {
    color: '#3498db',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
}

export default Login
