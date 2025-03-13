import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Phone } from 'lucide-react'

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
          ? 'bg-white/90 backdrop-blur-md shadow-md py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="font-accent text-rosepink text-3xl">Nana</span>
          <span className="font-heading text-deepbrown text-xl ml-1">Pastry</span>
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
          
          <a 
            href="tel:+1234567890" 
            className="btn btn-primary ml-4 group"
          >
            <Phone className="w-4 h-4 mr-2 group-hover:animate-pulse" />
            Call Now
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-deepbrown hover:text-hotpink"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
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
            
            <a 
              href="tel:+1234567890" 
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