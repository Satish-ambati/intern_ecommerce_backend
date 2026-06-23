// ============================================================
// Register.jsx - The Registration Page
// ============================================================
//
// WHAT THIS PAGE DOES:
//   Lets a new user create an account.
//   Sends their name, email, and password to the backend.
//   If successful, redirects them to the Login page.
//
// WHICH BACKEND API IT CALLS:
//   POST http://localhost:8080/signup
//   Body: { name: "...", email: "...", password: "...", role: "USER" }
//   Response: a success message string from the backend
//
// HOW DATA FLOWS:
//   User fills form → useState stores each field →
//   button clicked → axios sends POST request →
//   backend saves user to database →
//   we redirect user to Login page
// ============================================================

import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { API } from '../api.js'

function Register() {
  // Store the name entered by the user
  const [name, setName] = useState('')

  // Store the email entered by the user
  const [email, setEmail] = useState('')

  // Store the password entered by the user
  const [password, setPassword] = useState('')

  // true while waiting for the backend to respond
  const [loading, setLoading] = useState(false)

  // Error message to show if something goes wrong
  const [error, setError] = useState('')

  // Success message to show when registration works
  const [success, setSuccess] = useState('')

  // For navigating to another page
  const navigate = useNavigate()

  // -------------------------------------------------------
  // This function runs when the user clicks "Register"
  // -------------------------------------------------------
  const register = async () => {
    // Clear old messages
    setError('')
    setSuccess('')

    // Basic validation: all fields must be filled
    if (!name || !email || !password) {
      setError('Please fill in all fields.')
      return
    }

    // Password should be at least 6 characters
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    // Show loading
    setLoading(true)

    try {
      // Call the backend signup API
      // POST /signup with user details
      // The backend expects a User object with: name, email, password, role
      const response = await axios.post(`${API}/signup`, {
        name: name,
        email: email,
        password: password,
        role: 'USER'  // Default role for new users
      })

      // If we get here, registration was successful!
      // response.data is the success message from the backend
      console.log('Registration response:', response.data)

      // Show success message
      setSuccess('Account created successfully! Redirecting to login...')

      // Wait 2 seconds then go to login page
      setTimeout(() => {
        navigate('/login')
      }, 2000)

    } catch (err) {
      // If backend returns an error (e.g. email already exists)
      setError('Registration failed. This email might already be in use.')
      console.log('Registration error:', err)
    }

    setLoading(false)
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create an Account</h2>

        {/* Show error message */}
        {error && (
          <div style={styles.errorBox}>
            ❌ {error}
          </div>
        )}

        {/* Show success message */}
        {success && (
          <div style={styles.successBox}>
            ✅ {success}
          </div>
        )}

        {/* Name input */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            style={styles.input}
          />
        </div>

        {/* Email input */}
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

        {/* Password input */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 6 characters"
            style={styles.input}
          />
        </div>

        {/* Register button */}
        <button
          onClick={register}
          disabled={loading}
          style={{
            ...styles.button,
            backgroundColor: loading ? '#95a5a6' : '#2ecc71'
          }}
        >
          {loading ? '⏳ Creating Account...' : 'Register'}
        </button>

        {/* Link back to login */}
        <p style={styles.loginText}>
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            style={styles.loginLink}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  )
}

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
    boxSizing: 'border-box'
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
  successBox: {
    backgroundColor: '#e8f8f5',
    color: '#27ae60',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  loginText: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#666',
    fontSize: '14px'
  },
  loginLink: {
    color: '#3498db',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
}

export default Register
