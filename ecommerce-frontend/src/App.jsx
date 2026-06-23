// App.jsx - The main component that sets up page routing
// Routing means: which URL shows which page

import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Import our pages
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Home from './pages/Home.jsx'
import Cart from './pages/Cart.jsx'
import AdminProducts from './pages/AdminProducts.jsx'
import ProductDetail from './pages/ProductDetail.jsx'

// Import our shared components
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'

function App() {
  return (
    // BrowserRouter enables URL-based navigation
    <BrowserRouter>
      {/* Navbar shows on every page */}
      <Navbar />

      {/* Routes decides which page to show based on the URL */}
      <Routes>
        {/* "/" means the home page (http://localhost:5173/) */}
        <Route path="/" element={<Home />} />

        {/* Login page */}
        <Route path="/login" element={<Login />} />

        {/* Register page */}
        <Route path="/register" element={<Register />} />

        {/* Cart page */}
        <Route path="/cart" element={<Cart />} />

        {/* Admin panel (only admins should use this) */}
        <Route path="/admin" element={<AdminProducts />} />

        {/* Product detail page - :id means any product ID */}
        {/* Example: /product/1, /product/2, /product/5 */}
        <Route path="/product/:id" element={<ProductDetail />} />
      </Routes>

      {/* Footer shows on every page */}
      <Footer />
    </BrowserRouter>
  )
}

export default App
