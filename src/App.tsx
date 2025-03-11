import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

// Layout components
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// Pages
import Home from '@/pages/Home'
import About from '@/pages/About'
import Products from '@/pages/Products'
import Contact from '@/pages/Contact'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}

export default App 