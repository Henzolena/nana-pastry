import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Phone } from 'lucide-react'

import { companyInfo, contactInfo } from '@/utils/data'
import CartIcon from '@/components/cart/CartIcon'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY
      if (offset > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-md py-1'
          : 'bg-transparent py-2'
      }`}
    >
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img 
            src={companyInfo.logo} 
            alt={`${companyInfo.name} logo`} 
            className="h-32 mr-1 transition-transform duration-300 ease-in-out hover:scale-105"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `nav-link ${isActive ? 'text-hotpink after:w-full' : ''}`
            }
          >
            Home
          </NavLink>
          <NavLink 
            to="/about" 
            className={({ isActive }) => 
              `nav-link ${isActive ? 'text-hotpink after:w-full' : ''}`
            }
          >
            About
          </NavLink>
          <NavLink 
            to="/products" 
            className={({ isActive }) => 
              `nav-link ${isActive ? 'text-hotpink after:w-full' : ''}`
            }
          >
            Our Cakes
          </NavLink>
          <NavLink 
            to="/contact" 
            className={({ isActive }) => 
              `nav-link ${isActive ? 'text-hotpink after:w-full' : ''}`
            }
          >
            Contact
          </NavLink>
          <NavLink 
            to="/request-custom-design" 
            className={({ isActive }) => 
              `nav-link ${isActive ? 'text-hotpink after:w-full' : ''}`
            }
          >
            Custom Order
          </NavLink>
          
          <div className="flex items-center ml-4">
            <NavLink to="/cart" className="mr-1">
              <CartIcon />
            </NavLink>
            <a 
              href={`tel:${contactInfo.phone}`}
              className="btn btn-primary group"
            >
              <Phone className="w-4 h-4 mr-2 group-hover:animate-pulse" />
              Call Now
            </a>
          </div>
        </nav>

        {/* Mobile Menu and Cart */}
        <div className="md:hidden flex items-center">
          <NavLink to="/cart" className="mr-2">
            <CartIcon />
          </NavLink>
          <button
            className="text-deepbrown hover:text-hotpink"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md shadow-md py-4 border-t border-blush/20">
          <nav className="container flex flex-col space-y-3">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `text-lg py-2 ${isActive ? 'text-hotpink font-medium' : 'text-deepbrown'}`
              }
              onClick={() => setIsOpen(false)}
            >
              Home
            </NavLink>
            <NavLink 
              to="/about" 
              className={({ isActive }) => 
                `text-lg py-2 ${isActive ? 'text-hotpink font-medium' : 'text-deepbrown'}`
              }
              onClick={() => setIsOpen(false)}
            >
              About
            </NavLink>
            <NavLink 
              to="/products" 
              className={({ isActive }) => 
                `text-lg py-2 ${isActive ? 'text-hotpink font-medium' : 'text-deepbrown'}`
              }
              onClick={() => setIsOpen(false)}
            >
              Our Cakes
            </NavLink>
            <NavLink 
              to="/contact" 
              className={({ isActive }) => 
                `text-lg py-2 ${isActive ? 'text-hotpink font-medium' : 'text-deepbrown'}`
              }
              onClick={() => setIsOpen(false)}
            >
              Contact
            </NavLink>
            <NavLink 
              to="/request-custom-design" 
              className={({ isActive }) => 
                `text-lg py-2 ${isActive ? 'text-hotpink font-medium' : 'text-deepbrown'}`
              }
              onClick={() => setIsOpen(false)}
            >
              Custom Order
            </NavLink>
            <NavLink 
              to="/cart" 
              className={({ isActive }) => 
                `text-lg py-2 ${isActive ? 'text-hotpink font-medium' : 'text-deepbrown'} flex items-center`
              }
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              Cart
            </NavLink>
            
            <a 
              href={`tel:${contactInfo.phone}`}
              className="btn btn-primary self-start mt-2 flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Now
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar 