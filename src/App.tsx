import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { lazy, Suspense } from 'react'
import { Toaster } from 'sonner'

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
import CakeCustomizationPage from '@/pages/CakeCustomizationPage'
import Auth from '@/pages/Auth'
import Account from '@/pages/Account'
import OrderDetail from '@/pages/OrderDetail'
import ProductDetail from '@/pages/ProductDetail'

// Context Providers
import { CartProvider } from '@/contexts/CartContext'
import { AuthProvider } from '@/contexts/AuthContext'

// Components
import MiniCart from '@/components/cart/MiniCart'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        {/* Toast Notifications */}
        <Toaster position="top-right" richColors closeButton />
        
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <Disclaimer />
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:cakeId" element={<ProductDetail />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/request-custom-design" element={<RequestCustomDesign />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/checkout/customize" element={<CakeCustomizationPage />} />
                <Route path="/products/customize/:cakeId" element={<CakeCustomizationPage />} />
                <Route path="/cart/customize/:cartItemIndex" element={<CakeCustomizationPage />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/account" element={<Account />} />
                <Route path="/profile" element={<Account />} />
                <Route path="/orders/:orderId" element={<OrderDetail />} />
              </Routes>
            </AnimatePresence>
          </main>
          <Footer />
          <MiniCart />
        </div>
      </CartProvider>
    </AuthProvider>
  )
}

export default App 