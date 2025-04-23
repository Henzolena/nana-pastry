import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

// Layout components
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Disclaimer from '@/components/layout/Disclaimer'

// Pages
import Home from '@/pages/Home'
import About from '@/pages/About'
import Products from '@/pages/Products'
import Contact from '@/pages/Contact'
import RequestCustomDesign from '@/pages/RequestCustomDesign'
import Cart from '@/pages/Cart'
import Checkout from '@/pages/Checkout'

// Context Providers
import { CartProvider } from '@/contexts/CartContext'

// Components
import MiniCart from '@/components/cart/MiniCart'

function App() {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Disclaimer />
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/products" element={<Products />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/request-custom-design" element={<RequestCustomDesign />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
        <MiniCart />
      </div>
    </CartProvider>
  )
}

export default App 