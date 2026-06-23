// Navbar.jsx - The navigation bar shown at the top of every page
// It shows different links depending on whether the user is logged in or not

import { useNavigate } from 'react-router-dom'

function Navbar() {
  // useNavigate lets us go to a different page when a button is clicked
  const navigate = useNavigate()

  // Check if someone is logged in by looking at localStorage
  // After login, we saved the token and email in localStorage
  const token = localStorage.getItem('token')
  const userEmail = localStorage.getItem('userEmail')

  // This function logs the user out
  const logout = () => {
    // Remove the saved token and email from browser storage
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')

    // Redirect to the login page
    navigate('/login')
  }

  return (
    <nav style={styles.navbar}>
      {/* App Name / Logo - clicking takes you home */}
      <div style={styles.logo} onClick={() => navigate('/')}>
        🛒 E-Commerce Store
      </div>

      {/* Navigation links */}
      <div style={styles.links}>

        {/* Always show the Home link */}
        <span style={styles.link} onClick={() => navigate('/')}>
          Home
        </span>

        {/* Only show these links if the user is logged in */}
        {token ? (
          <>
            {/* Cart link */}
            <span style={styles.link} onClick={() => navigate('/cart')}>
              Cart
            </span>

            {/* Admin Panel link - backend will reject if not admin */}
            <span style={styles.link} onClick={() => navigate('/admin')}>
              Admin Panel
            </span>

            {/* Show which user is logged in */}
            <span style={styles.userEmail}>
              👤 {userEmail}
            </span>

            {/* Logout button */}
            <button style={styles.logoutBtn} onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            {/* If not logged in, show Login and Register links */}
            <span style={styles.link} onClick={() => navigate('/login')}>
              Login
            </span>
            <span style={styles.link} onClick={() => navigate('/register')}>
              Register
            </span>
          </>
        )}
      </div>
    </nav>
  )
}

// Styles for the Navbar
const styles = {
  navbar: {
    backgroundColor: '#2c3e50',
    padding: '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
  },
  logo: {
    fontSize: '22px',
    fontWeight: 'bold',
    cursor: 'pointer',
    color: 'white'
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  link: {
    cursor: 'pointer',
    color: '#ecf0f1',
    fontSize: '16px',
    padding: '5px 10px',
    borderRadius: '4px',
    transition: 'background 0.2s'
  },
  userEmail: {
    color: '#3498db',
    fontSize: '14px'
  },
  logoutBtn: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  }
}

export default Navbar
